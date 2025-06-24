import { Link } from 'react-router-dom';
import {
  GlobeAltIcon,
  MagnifyingGlassIcon,
  PhotoIcon,
  ClockIcon,
  ArrowsPointingInIcon,
  ChatBubbleBottomCenterTextIcon,
  CloudIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';

const features = [
  {
    name: 'APOD',
    description: 'View NASA\'s Astronomy Picture of the Day',
    icon: PhotoIcon,
    href: '/apod'
  },
  {
    name: 'EPIC',
    description: 'Explore Earth Polychromatic Imaging Camera views',
    icon: GlobeAltIcon,
    href: '/epic'
  },
  {
    name: 'Search',
    description: 'Search for Earth observations and events',
    icon: MagnifyingGlassIcon,
    href: '/search'
  },
  {
    name: 'Time Travel',
    description: 'Explore historical Earth observations',
    icon: ClockIcon,
    href: '/time-travel'
  },
  {
    name: 'Image Comparator',
    description: 'Compare satellite images and analyze differences',
    icon: ArrowsPointingInIcon,
    href: '/compare'
  },
  {
    name: 'Explain',
    description: 'Get AI explanations for satellite imagery',
    icon: ChatBubbleBottomCenterTextIcon,
    href: '/explain'
  },
  {
    name: 'Weather',
    description: 'Get weather insights from satellite images',
    icon: CloudIcon,
    href: '/weather'
  },
  {
    name: 'Briefing',
    description: 'Receive email briefings about Earth observations',
    icon: EnvelopeIcon,
    href: '/briefing'
  }
];

const stats = [
  { name: 'Satellite Images', value: '1M+', description: 'High-resolution Earth images' },
  { name: 'Weather Records', value: '50+', description: 'Years of historical data' },
  { name: 'Global Coverage', value: '100%', description: 'Complete Earth monitoring' },
  { name: 'AI Analysis', value: '24/7', description: 'Continuous processing' }
];

const HomePage = () => {
  return (
    <div className="container mx-auto px-4 py-12 mt-16">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
          NASA Earth Insights
        </h1>
        <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto">
          Explore our planet through NASA's eyes. Get insights, analyze changes,
          and understand Earth's dynamics with cutting-edge AI technology.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature) => (
          <Link
            key={feature.name}
            to={feature.href}
            className="group relative bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-white/10
                     hover:bg-white/5 transition-colors duration-300"
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-white/5 mb-4
                          group-hover:bg-white/10 transition-colors duration-300">
              <feature.icon className="w-6 h-6 text-white/70" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">{feature.name}</h3>
            <p className="text-white/70">{feature.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default HomePage; 