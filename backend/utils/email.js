const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
require('dotenv').config();

const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key: process.env.SENDGRID_API_KEY,
    },
  })
);

function generateHtml(briefingData) {
  const { imageUrl, date, contextualData, aiExplanation } = briefingData;
  
  let regionsHtml = contextualData.map(region => `
    <div style="margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #eeeeee;">
      <h3 style="color: #333333;">${region.country} (${region.capital})</h3>
      <p><strong>Weather:</strong> ${region.weather}</p>
      <div><strong>Top Headlines:</strong></div>
      <ul>
        ${region.news.length > 0 ? region.news.map(article => `<li><a href="${article.url}" target="_blank">${article.title}</a> (${article.source})</li>`).join('') : '<li>No recent news found.</li>'}
      </ul>
    </div>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #555555; }
        .container { max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #dddddd; }
        h2 { color: #2c3e50; }
        img { max-width: 100%; height: auto; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Your Earth & Space Briefing for ${date}</h2>
        <img src="${imageUrl}" alt="Satellite Image" />
        
        <h3 style="color: #333333; margin-top: 25px;">AI Scientist's Analysis</h3>
        <p>${aiExplanation.replace(/\n/g, '<br>')}</p>
        
        <h3 style="color: #333333; margin-top: 25px;">Regional Data</h3>
        ${regionsHtml}
      </div>
    </body>
    </html>
  `;
}

/**
 * Assembles and sends a briefing email.
 * @param {string} recipientEmail - The email address of the recipient.
 * @param {object} briefingData - The data object containing all information for the email.
 */
async function sendBriefingEmail(recipientEmail, briefingData) {
  if (!process.env.SENDGRID_API_KEY || !process.env.SENDER_EMAIL) {
    console.error('Email service is not configured. Missing SendGrid API key or sender email.');
    throw new Error('Email service is not available.');
  }

  const emailHtml = generateHtml(briefingData);

  await transporter.sendMail({
    to: recipientEmail,
    from: process.env.SENDER_EMAIL,
    subject: `Your Earth & Space Briefing for ${briefingData.date}`,
    html: emailHtml,
  });

  console.log(`Briefing email sent to ${recipientEmail}`);
}

module.exports = { sendBriefingEmail }; 