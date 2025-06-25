const express = require('express');
const { OpenAI } = require('openai');
const axios = require('axios');
require('dotenv').config();

const router = express.Router();

// Initialize OpenAI client with timeout
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 30000, // 30 second timeout
  maxRetries: 2,
});

// Cache for prompt templates to avoid recreation
const PROMPT_TEMPLATES = {
  satellite: {
    system: 'You are an expert satellite imagery analyst. Compare these satellite images and provide a detailed analysis in plain text, without any markdown formatting.',
    prompt: (focusAreas) => `Compare these satellite images by analyzing geographic features, environmental conditions, urban development, land use changes, and weather patterns. Note any significant differences or similarities.
${focusAreas.length > 0 ? `Focus particularly on: ${focusAreas.join(', ')}` : ''}`
  },
  weather: {
    system: 'You are a meteorological expert. Analyze these images for weather-related comparisons in plain text, without any markdown formatting.',
    prompt: (focusAreas) => `Compare these images focusing on weather patterns, including cloud formations, atmospheric conditions, and indicators of precipitation or climate changes.
${focusAreas.length > 0 ? `Pay special attention to: ${focusAreas.join(', ')}` : ''}`
  },
  temporal: {
    system: 'You are a temporal analysis expert. Compare these images to identify changes over time. Provide the analysis in plain text, without any markdown formatting.',
    prompt: (focusAreas) => `Analyze these images for temporal changes. Describe what has changed, any evidence of progression or development, seasonal differences, and any patterns of growth, decay, or transformation.
${focusAreas.length > 0 ? `Focus on changes in: ${focusAreas.join(', ')}` : ''}`
  },
  general: {
    system: 'You are an expert image analyst. Provide a comprehensive comparison of these images in plain text, without any markdown formatting.',
    prompt: (focusAreas) => `Compare and analyze these images, discussing visual similarities and differences, key features, content, and subject matter to provide an overall assessment.
${focusAreas.length > 0 ? `Give special attention to: ${focusAreas.join(', ')}` : ''}`
  }
};

// Validate image URL accessibility
async function validateImageUrl(url, timeout = 5000) {
  try {
    const response = await axios.head(url, { 
      timeout,
      validateStatus: (status) => status < 400
    });
    const contentType = response.headers['content-type'];
    if (!contentType || !contentType.startsWith('image/')) {
      throw new Error('URL does not point to an image');
    }
    return true;
  } catch (error) {
    throw new Error(`Image URL validation failed: ${error.message}`);
  }
}

// Validate and process images with parallel validation
async function validateAndProcessImages(images) {
  const validationPromises = images.map(async (img, index) => {
    let imageUrl;
    
    if (typeof img === 'string') {
      if (img.startsWith('http')) {
        await validateImageUrl(img);
        imageUrl = img;
      } else if (img.startsWith('data:image/')) {
        // Validate base64 format
        const base64Pattern = /^data:image\/(jpeg|jpg|png|gif|webp);base64,/;
        if (!base64Pattern.test(img)) {
          throw new Error(`Invalid base64 image format at index ${index}`);
        }
        imageUrl = img;
      } else {
        throw new Error(`Invalid image format at index ${index}. Must be URL or base64`);
      }
    } else if (img && img.url) {
      await validateImageUrl(img.url);
      imageUrl = img.url;
    } else {
      throw new Error(`Invalid image format at index ${index}`);
    }

    return { type: 'url', url: imageUrl, index };
  });

  return await Promise.all(validationPromises);
}

router.post('/', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { images, comparisonType = 'general', focusAreas = [] } = req.body;

    // Early validation
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        error: 'Service configuration error',
        details: 'OpenAI API key is not configured'
      });
    }

    // Validate input
    if (!images || !Array.isArray(images) || images.length < 2) {
      return res.status(400).json({
        error: 'Invalid input',
        details: 'Please provide at least 2 images for comparison'
      });
    }

    if (images.length > 4) {
      return res.status(400).json({
        error: 'Too many images',
        details: 'Maximum 4 images allowed for comparison'
      });
    }

    if (!PROMPT_TEMPLATES[comparisonType]) {
      return res.status(400).json({
        error: 'Invalid comparison type',
        details: `Supported types: ${Object.keys(PROMPT_TEMPLATES).join(', ')}`
      });
    }

    console.log(`[ImageComparator] Starting comparison of ${images.length} images, type: ${comparisonType}`);

    // Validate images in parallel for better performance
    let validatedImages;
    try {
      validatedImages = await validateAndProcessImages(images);
    } catch (validationError) {
      return res.status(400).json({
        error: 'Image validation failed',
        details: validationError.message
      });
    }

    // Get prompt template
    const template = PROMPT_TEMPLATES[comparisonType];
    const systemPrompt = template.system;
    const comparisonPrompt = template.prompt(focusAreas);

    // Prepare messages for OpenAI with optimized settings
    const messages = [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: comparisonPrompt
          },
          ...validatedImages.map((img) => ({
            type: 'image_url',
            image_url: {
              url: img.url,
              detail: images.length > 2 ? 'low' : 'high' // Optimize detail based on image count
            }
          }))
        ]
      }
    ];

    console.log(`[ImageComparator] Sending request to GPT-4 Vision...`);

    // Make OpenAI request with optimized parameters
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: messages,
      max_tokens: Math.min(1500, 300 * images.length), // Scale tokens with image count
      temperature: 0.5, // Lower temperature for more consistent results
      stream: false
    });

    const analysis = response.choices[0]?.message?.content;

    if (!analysis) {
      throw new Error('No analysis received from OpenAI');
    }

    const processingTime = Date.now() - startTime;
    console.log(`[ImageComparator] Completed in ${processingTime}ms`);

    return res.json({
      success: true,
      comparisonType,
      imageCount: images.length,
      focusAreas,
      analysis,
      timestamp: new Date().toISOString(),
      metadata: {
        model: 'gpt-4-turbo',
        tokensUsed: response.usage?.total_tokens || 0,
        processingTimeMs: processingTime,
        imageDetail: images.length > 2 ? 'low' : 'high'
      }
    });

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`[ImageComparator] Error after ${processingTime}ms:`, error);
    
    // Specific error handling
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        error: 'Network connectivity issue',
        details: 'Unable to connect to external services'
      });
    }

    if (error.response?.status === 401) {
      return res.status(401).json({
        error: 'OpenAI API Authentication Error',
        details: 'Please check your OpenAI API key'
      });
    }

    if (error.response?.status === 429) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        details: 'Please try again later'
      });
    }

    if (error.message?.includes('timeout')) {
      return res.status(408).json({
        error: 'Request timeout',
        details: 'Image comparison took too long to complete'
      });
    }

    return res.status(500).json({
      error: 'Image comparison failed',
      details: error.message,
      processingTimeMs: processingTime
    });
  }
});

// GET endpoint with enhanced documentation
router.get('/', (req, res) => {
  res.json({
    endpoint: '/image-comparator',
    method: 'POST',
    description: 'GPT-powered image comparison and analysis with optimized performance',
    version: '1.1',
    features: [
      'Parallel image validation',
      'Smart detail optimization based on image count',
      'Timeout protection',
      'Enhanced error handling',
      'Performance metrics'
    ],
    parameters: {
      images: {
        type: 'array',
        required: true,
        description: 'Array of 2-4 image URLs or base64 data',
        validation: 'URLs are validated for accessibility, base64 format is checked',
        example: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg']
      },
      comparisonType: {
        type: 'string',
        required: false,
        default: 'general',
        options: ['general', 'satellite', 'weather', 'temporal'],
        description: 'Type of comparison analysis to perform'
      },
      focusAreas: {
        type: 'array',
        required: false,
        description: 'Specific areas or aspects to focus the analysis on',
        example: ['vegetation', 'urban development', 'cloud patterns']
      }
    },
    performance: {
      timeout: '30 seconds',
      retries: 2,
      optimization: 'Detail level adjusted based on image count',
      validation: 'Parallel image URL validation'
    },
    example: {
      images: [
        'https://example.com/satellite1.jpg',
        'https://example.com/satellite2.jpg'
      ],
      comparisonType: 'satellite',
      focusAreas: ['vegetation changes', 'urban growth']
    }
  });
});

module.exports = router; 