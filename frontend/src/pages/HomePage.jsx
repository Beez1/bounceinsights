import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  GlobeAltIcon,
  MagnifyingGlassIcon,
  PhotoIcon,
  ClockIcon,
  ArrowsPointingInIcon,
  ChatBubbleBottomCenterTextIcon,
  CloudIcon,
  EnvelopeIcon,
  RocketLaunchIcon,
  SparklesIcon,
  SunIcon,
  MoonIcon,
  EyeIcon,
  MapIcon,
  NewspaperIcon,
  BeakerIcon
} from '@heroicons/react/24/outline';

const features = [
  {
    name: 'APOD',
    description: 'NASA\'s Astronomy Picture of the Day with cosmic insights and stellar photography',
    icon: PhotoIcon,
    href: '/apod',
    color: 'from-purple-500 via-indigo-400 to-purple-600', // Space colors
    delay: 0
  },
  {
    name: 'EPIC Earth',
    description: 'Earth Polychromatic Imaging Camera - view our planet from space with location filtering',
    icon: GlobeAltIcon,
    href: '/epic',
    color: 'from-blue-500 via-cyan-400 to-blue-600', // Ocean blues
    delay: 50
  },
  {
    name: 'Smart Search',
    description: 'Natural language search with AI-powered analysis of satellite data and weather patterns',
    icon: MagnifyingGlassIcon,
    href: '/search',
    color: 'from-green-500 via-emerald-400 to-teal-500', // Forest greens
    delay: 100
  },
  {
    name: 'Time Travel',
    description: 'Historical Earth observations and temporal analysis across different time periods',
    icon: ClockIcon,
    href: '/time-travel',
    color: 'from-orange-400 via-amber-300 to-yellow-400', // Earth/desert tones
    delay: 150
  },
  {
    name: 'Image Comparator',
    description: 'AI-powered satellite image comparison with detailed analysis and change detection',
    icon: ArrowsPointingInIcon,
    href: '/compare',
    color: 'from-red-500 via-pink-400 to-red-600', // Fire/volcanic tones
    delay: 200
  },
  {
    name: 'AI Explain',
    description: 'Get intelligent explanations of satellite imagery using advanced computer vision',
    icon: ChatBubbleBottomCenterTextIcon,
    href: '/explain',
    color: 'from-violet-500 via-purple-400 to-violet-600', // Tech/AI colors
    delay: 250
  },
  {
    name: 'Weather Context',
    description: 'Contextual weather analysis with historical data and country-specific insights',
    icon: CloudIcon,
    href: '/weather',
    color: 'from-sky-500 via-blue-400 to-sky-600', // Sky/atmosphere colors
    delay: 300
  },
  {
    name: 'Contextualize',
    description: 'Rich contextual information combining weather data, news, and geographical insights',
    icon: MapIcon,
    href: '/contextualize',
    color: 'from-emerald-500 via-green-400 to-emerald-600', // Earth data colors
    delay: 350
  },
  {
    name: 'Email Briefings',
    description: 'Automated email briefings with AI analysis, weather data, and regional news updates',
    icon: EnvelopeIcon,
    href: '/briefing',
    color: 'from-indigo-500 via-blue-400 to-indigo-600', // Communication colors
    delay: 400
  }
];

const stats = [
  { name: 'Satellite Images', value: '1M+', description: 'High-resolution Earth images', icon: PhotoIcon },
  { name: 'Weather Records', value: '50+', description: 'Years of historical data', icon: CloudIcon },
  { name: 'Global Coverage', value: '100%', description: 'Complete Earth monitoring', icon: GlobeAltIcon },
  { name: 'AI Analysis', value: '24/7', description: 'Continuous processing', icon: SparklesIcon }
];

const backendCapabilities = [
  {
    title: "NASA API Integration",
    description: "Direct access to APOD and EPIC satellite imagery",
    icon: RocketLaunchIcon,
    color: "text-purple-400"
  },
  {
    title: "Computer Vision AI",
    description: "Country detection and image analysis using OpenAI Vision",
    icon: EyeIcon,
    color: "text-blue-400"
  },
  {
    title: "Weather Intelligence",
    description: "Historical weather data with global capital city coverage",
    icon: CloudIcon,
    color: "text-green-400"
  },
  {
    title: "News Integration",
    description: "Real-time news context for geographical regions",
    icon: NewspaperIcon,
    color: "text-orange-400"
  },
  {
    title: "Natural Language Processing",
    description: "Smart query parsing and comprehensive data analysis",
    icon: BeakerIcon,
    color: "text-cyan-400"
  },
  {
    title: "Email Automation",
    description: "Automated briefing system with rich contextual data",
    icon: EnvelopeIcon,
    color: "text-pink-400"
  }
];

const HomePage = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const [time, setTime] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100
      });
    };

    // Animation timer for orbital effects
    const timer = setInterval(() => {
      setTime(prev => prev + 1);
    }, 50);

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearInterval(timer);
    };
  }, []);

  const FloatingElement = ({ children, delay = 0, className = "" }) => (
    <div 
      className={`transform transition-all duration-1000 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Earth-themed Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-blue-900 to-slate-800">
        {/* Aurora-like effect following mouse */}
        <div 
          className="absolute inset-0 opacity-40"
          style={{
            background: `radial-gradient(ellipse 800px 400px at ${mousePosition.x}% ${mousePosition.y}%, 
              rgba(34, 197, 94, 0.2) 0%, 
              rgba(59, 130, 246, 0.15) 25%, 
              rgba(168, 85, 247, 0.1) 50%, 
              transparent 70%)`
          }}
        />
        
        {/* Floating orbital elements */}
        <div className="absolute inset-0">
          {/* Earth-like floating particles */}
          {[...Array(30)].map((_, i) => {
            const colors = ['bg-blue-400', 'bg-green-400', 'bg-yellow-300', 'bg-cyan-300'];
            const size = Math.random() > 0.7 ? 'w-3 h-3' : 'w-2 h-2';
            const orbitRadius = 100 + (i * 20) % 300;
            const angle = (time * 0.5 + i * 12) * (Math.PI / 180);
            const x = 50 + Math.cos(angle) * (orbitRadius / 20);
            const y = 50 + Math.sin(angle) * (orbitRadius / 40);
            
            return (
              <div
                key={i}
                className={`absolute ${size} ${colors[i % colors.length]} rounded-full opacity-30 animate-pulse`}
                style={{
                  left: `${Math.max(0, Math.min(100, x))}%`,
                  top: `${Math.max(0, Math.min(100, y))}%`,
                  animationDelay: `${i * 100}ms`,
                  animationDuration: `${3 + Math.random() * 2}s`
                }}
              />
            );
          })}
          
          {/* Larger orbital bodies */}
          {[...Array(5)].map((_, i) => {
            const angle = (time * 0.3 + i * 72) * (Math.PI / 180);
            const radius = 150 + i * 50;
            const x = 50 + Math.cos(angle) * (radius / 30);
            const y = 50 + Math.sin(angle) * (radius / 60);
            
            return (
              <div
                key={`orbit-${i}`}
                className="absolute w-6 h-6 rounded-full bg-gradient-to-br from-blue-300 to-green-300 opacity-20 animate-pulse"
                style={{
                  left: `${Math.max(0, Math.min(100, x))}%`,
                  top: `${Math.max(0, Math.min(100, y))}%`,
                  animationDuration: `${4 + i}s`
                }}
              />
            );
          })}
        </div>

        {/* Earth silhouette in background */}
        <div className="absolute top-1/4 right-10 w-96 h-96 opacity-10">
          <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-400 via-green-400 to-blue-600 animate-spin" style={{ animationDuration: '120s' }}>
            <div className="absolute inset-4 rounded-full bg-gradient-to-br from-green-500 to-blue-500 opacity-70" />
            <div className="absolute top-8 left-8 w-20 h-20 rounded-full bg-green-600 opacity-60" />
            <div className="absolute bottom-12 right-12 w-16 h-16 rounded-full bg-amber-600 opacity-50" />
          </div>
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12 mt-16">
        {/* Hero Section */}
        <FloatingElement className="text-center mb-20">
          <div className="relative">
            <h1 className="text-6xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-green-400 to-cyan-300 mb-6 tracking-tight">
              NASA Earth Insights
            </h1>
            <div className="absolute -top-4 -right-4 md:-top-8 md:-right-8">
              <div className="relative">
                <GlobeAltIcon className="w-12 h-12 md:w-16 md:h-16 text-blue-400 animate-pulse" />
                <div className="absolute inset-0 animate-ping">
                  <GlobeAltIcon className="w-12 h-12 md:w-16 md:h-16 text-green-400 opacity-20" />
                </div>
              </div>
            </div>
          </div>
          
          <FloatingElement delay={200}>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto mb-10 leading-relaxed">
              Explore our <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400 font-semibold">living planet</span> through NASA's eyes. 
              Get insights, analyze changes, and understand <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 font-semibold">Earth's dynamics</span> with cutting-edge technology.
            </p>
          </FloatingElement>

          <FloatingElement delay={400}>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link
                to="/explore"
                className="group relative bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 hover:from-blue-700 hover:via-cyan-600 hover:to-blue-700 text-white px-10 py-4 rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <GlobeAltIcon className="w-5 h-5" />
                  Explore Earth
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              </Link>
              <Link
                to="/search-analyze"
                className="group bg-transparent border-2 border-green-400 hover:border-green-300 text-green-300 hover:text-white px-10 py-4 rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-105 hover:bg-green-400/10 backdrop-blur-sm"
              >
                <span className="flex items-center justify-center gap-2">
                  <SparklesIcon className="w-5 h-5" />
                  AI Analysis
                </span>
              </Link>
            </div>
          </FloatingElement>
        </FloatingElement>

        {/* Stats Section */}
        <FloatingElement delay={600} className="mb-20">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const colors = ['from-blue-500/20 to-cyan-500/20', 'from-green-500/20 to-emerald-500/20', 'from-orange-400/20 to-yellow-400/20', 'from-purple-500/20 to-pink-500/20'];
              const iconColors = ['text-blue-400', 'text-green-400', 'text-orange-400', 'text-purple-400'];
              
              return (
                <div 
                  key={stat.name} 
                  className={`group relative bg-gradient-to-br ${colors[index]} backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2`}
                  style={{ animationDelay: `${800 + index * 100}ms` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative z-10 text-center">
                    <stat.icon className={`w-8 h-8 ${iconColors[index]} mx-auto mb-3 group-hover:scale-110 transition-transform duration-300`} />
                    <div className="text-4xl font-bold text-white mb-2 group-hover:text-blue-200 transition-colors duration-300">
                      {stat.value}
                    </div>
                    <div className="text-lg font-semibold text-blue-200 mb-1">{stat.name}</div>
                    <div className="text-sm text-blue-300">{stat.description}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </FloatingElement>

        {/* Features Grid */}
        <FloatingElement delay={1000} className="mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-green-400 to-cyan-300">
            Explore Our Features
          </h2>
          <p className="text-center text-blue-200 mb-12 text-lg">9 powerful tools for Earth observation and space technology</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Link
                key={feature.name}
                to={feature.href}
                className="group relative bg-black/30 backdrop-blur-xl rounded-3xl p-8 border border-white/20 hover:border-white/40 transition-all duration-500 transform hover:scale-105 hover:-translate-y-3 overflow-hidden"
                style={{ animationDelay: `${1200 + feature.delay}ms` }}
                onMouseEnter={() => setHoveredFeature(index)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                {/* Earth-themed gradient background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />
                
                {/* Planetary orbit effect */}
                <div className="absolute top-4 right-4 w-16 h-16 opacity-20 group-hover:opacity-40 transition-opacity duration-500">
                  <div className="w-full h-full border border-white/30 rounded-full animate-spin" style={{ animationDuration: '20s' }}>
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full" />
                  </div>
                </div>
                
                {/* Icon with earth-themed gradient background */}
                <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} p-4 mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <feature.icon className="w-full h-full text-white drop-shadow-lg" />
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-300 group-hover:to-green-300 transition-all duration-300">
                  {feature.name}
                </h3>
                <p className="text-blue-200 group-hover:text-blue-100 transition-colors duration-300 leading-relaxed">
                  {feature.description}
                </p>
                
                {/* Earth-like shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-300/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                
                {/* Arrow indicator */}
                <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </FloatingElement>

        {/* Backend Capabilities Section */}
        <FloatingElement delay={1600} className="mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-purple-400 to-pink-300">
            Powered by Advanced Technology
          </h2>
          <p className="text-center text-blue-200 mb-12 text-lg">Enterprise-grade backend capabilities driving our Earth insights platform</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {backendCapabilities.map((capability, index) => (
              <div
                key={capability.title}
                className="group relative bg-gradient-to-br from-black/40 to-black/20 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-white/30 transition-all duration-500 transform hover:scale-105"
                style={{ animationDelay: `${1800 + index * 100}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-black/40 backdrop-blur-sm border border-white/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <capability.icon className={`w-6 h-6 ${capability.color}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-200 transition-colors duration-300">
                      {capability.title}
                    </h3>
                    <p className="text-blue-300 text-sm leading-relaxed">
                      {capability.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </FloatingElement>

        {/* About Section */}
        <FloatingElement delay={2000} className="text-center">
          <div className="relative bg-gradient-to-r from-black/30 via-blue-900/30 to-black/30 backdrop-blur-xl rounded-3xl p-12 border border-white/20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-green-500/10 to-cyan-500/10" />
            
            {/* Orbital rings decoration */}
            <div className="absolute top-6 left-6 w-24 h-24 opacity-20">
              <div className="w-full h-full border border-blue-300 rounded-full animate-spin" style={{ animationDuration: '30s' }}>
                <div className="absolute inset-2 border border-green-300 rounded-full animate-spin" style={{ animationDuration: '20s', animationDirection: 'reverse' }} />
                <div className="absolute inset-4 border border-cyan-300 rounded-full animate-spin" style={{ animationDuration: '15s' }} />
              </div>
            </div>
            
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-green-400 to-cyan-300 mb-6">
                Our Living Planet
              </h2>
              <p className="text-blue-100 max-w-4xl mx-auto leading-relaxed text-lg">
                Our platform harnesses the power of NASA's extensive Earth observation data combined with 
                cutting-edge artificial intelligence to provide unprecedented insights into our planet's 
                dynamics. From <span className="text-blue-300 font-semibold">ocean currents</span> to <span className="text-green-300 font-semibold">forest changes</span>, 
                from <span className="text-orange-300 font-semibold">weather patterns</span> to <span className="text-cyan-300 font-semibold">climate shifts</span> - 
                explore Earth like never before with real-time analysis and historical comparisons.
              </p>
              
              {/* Earth-themed decorative elements */}
              <div className="flex justify-center mt-8 gap-4">
                {[...Array(7)].map((_, i) => {
                  const colors = ['bg-blue-400', 'bg-green-400', 'bg-cyan-400', 'bg-blue-300', 'bg-emerald-400', 'bg-teal-400', 'bg-blue-500'];
                  return (
                    <div
                      key={i}
                      className={`w-3 h-3 rounded-full ${colors[i]} animate-pulse`}
                      style={{ animationDelay: `${i * 200}ms` }}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </FloatingElement>
      </div>
    </div>
  );
};

export default HomePage; 