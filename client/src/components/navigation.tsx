import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Music, 
  Search, 
  Home, 
  PlusCircle, 
  BarChart3, 
  User,
  Menu,
  X,
  Info,
  MessageSquare,
  Compass,
  Layout
} from "lucide-react";
import { useState } from "react";

export default function Navigation() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Discover', href: '/discover', icon: Compass },
    { name: 'About', href: '/about', icon: Info },
    { name: 'Feedback', href: '/feedback', icon: MessageSquare },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return location === '/';
    }
    return location.startsWith(href);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center space-x-2 cursor-pointer">
              <div className="w-6 h-6">
                <svg viewBox="0 0 32 32" className="w-full h-full">
                  <defs>
                    <linearGradient id="nav-logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{stopColor: '#4CAF50', stopOpacity: 1}} />
                      <stop offset="100%" style={{stopColor: '#2E7D32', stopOpacity: 1}} />
                    </linearGradient>
                  </defs>
                  
                  {/* Background */}
                  <circle cx="16" cy="16" r="15" fill="url(#nav-logo-gradient)" stroke="#1B5E20" strokeWidth="2"/>
                  
                  {/* Musical note design */}
                  {/* Note head */}
                  <ellipse cx="10" cy="20" rx="3" ry="2.5" fill="white" transform="rotate(-20 10 20)"/>
                  
                  {/* Note stem */}
                  <rect x="12.5" y="10" width="1.5" height="10" fill="white"/>
                  
                  {/* Musical wave/memory element */}
                  <path d="M18 12 Q21 10 24 12 Q21 14 18 12" fill="white" opacity="0.8"/>
                  <path d="M18 16 Q21 14 24 16 Q21 18 18 16" fill="white" opacity="0.6"/>
                  <path d="M18 20 Q21 18 24 20 Q21 22 18 20" fill="white" opacity="0.4"/>
                </svg>
              </div>
              <span className="text-xl font-bold text-spotify-black">ThisSongThatTime</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.name} href={item.href}>
                  <div className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    isActive(item.href)
                      ? 'text-spotify-green bg-green-50'
                      : 'text-gray-600 hover:text-spotify-green hover:bg-gray-50'
                  }`}>
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/create-story">
              <Button className="spotify-green text-white hover:bg-green-600 font-medium rounded-full">
                <PlusCircle className="w-4 h-4 mr-2" />
                Create Your Story
              </Button>
            </Link>
            
            {/* Profile Avatar */}
            <div className="w-8 h-8 bg-gradient-to-r from-coral to-teal rounded-full flex items-center justify-center cursor-pointer">
              <User className="w-4 h-4 text-white" />
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-600"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <div className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.name} href={item.href}>
                    <div 
                      className={`flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                        isActive(item.href)
                          ? 'text-spotify-green bg-green-50'
                          : 'text-gray-600 hover:text-spotify-green hover:bg-gray-50'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-100">
              <Link href="/create-story">
                <Button 
                  className="w-full spotify-green text-white hover:bg-green-600 font-medium rounded-full"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Create Your Story
                </Button>
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
