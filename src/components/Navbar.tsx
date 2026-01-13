import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Menu, X, User, ChevronDown, LogOut, Ticket } from 'lucide-react';
import saharaLogo from '@/assets/cinema-sahara-logo.png';
import { SearchModal } from './SearchModal';
import { MovieDetailModal, MovieDetails } from './MovieDetailModal';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<MovieDetails | null>(null);
  const [isMovieModalOpen, setIsMovieModalOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navLinks = [
    { name: t('nav.home'), href: '/', sectionId: '' },
    { name: t('nav.cinema'), href: '/#currently-playing', sectionId: 'currently-playing' },
    { name: t('nav.offers'), href: '/offers', sectionId: 'offers' },
  ];

  const handleSelectMovie = (movie: MovieDetails) => {
    setSelectedMovie(movie);
    setIsMovieModalOpen(true);
  };

  // Keyboard shortcut for search (Cmd+K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      
      // Find active section based on scroll position
      const scrollPosition = window.scrollY + 150;
      
      // Check sections in reverse order (bottom to top)
      for (let i = navLinks.length - 1; i >= 0; i--) {
        const link = navLinks[i];
        if (!link.sectionId) continue; // Skip Home (no section)
        
        const section = document.getElementById(link.sectionId);
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(link.sectionId);
          return;
        }
      }
      setActiveSection('');
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial position
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-background/95 backdrop-blur-md py-1' : 'bg-transparent py-2'
      }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className={`flex items-center transition-all duration-300 ${
          isScrolled ? '-ml-2 md:-ml-4 -mt-1' : '-ml-4 md:-ml-8 -mt-2 md:-mt-3'
        }`}>
          <img 
            src={saharaLogo} 
            alt="Sahara Cinema" 
            className={`w-auto object-contain transition-[height] duration-300 ${
              isScrolled 
                ? 'h-14 md:h-16 lg:h-20' 
                : 'h-24 md:h-32 lg:h-36'
            }`}
          />
        </Link>

        {/* Center: Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = link.href === '/offers' 
              ? location.pathname === '/offers'
              : link.sectionId === activeSection && location.pathname === '/';
            
            const handleClick = (e: React.MouseEvent) => {
              if (link.href.startsWith('/#')) {
                e.preventDefault();
                const sectionId = link.href.replace('/#', '');
                if (location.pathname !== '/') {
                  navigate('/');
                  setTimeout(() => {
                    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                } else {
                  document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
                }
              }
            };
            
            return (
              <Link
                key={link.name}
                to={link.href.startsWith('/#') ? '/' : link.href}
                onClick={handleClick}
                className={`text-sm font-medium transition-colors relative ${
                  isActive
                    ? 'text-sahara-gold' 
                    : 'text-foreground hover:text-sahara-gold'
                }`}
              >
                {link.name}
                {isActive && (
                  <motion.span
                    layoutId="activeNav"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <button 
            onClick={() => setIsSearchOpen(true)}
            className="w-10 h-10 rounded-full bg-secondary/80 flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* User Menu */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground hover:bg-primary/90 transition-colors focus:outline-none">
                <User className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[160px] bg-card border border-border shadow-xl z-50">
                <DropdownMenuItem 
                  onClick={() => navigate('/my-bookings')}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Ticket className="w-4 h-4" />
                  <span>My Bookings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => signOut()}
                  className="flex items-center gap-2 cursor-pointer text-destructive"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <button 
              onClick={() => navigate('/auth')}
              className="w-10 h-10 rounded-full bg-secondary/80 flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <User className="w-4 h-4" />
            </button>
          )}

          {/* Language Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-full bg-secondary/80 hover:bg-secondary text-foreground text-sm font-medium transition-colors focus:outline-none">
              <span className="uppercase">{language}</span>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[140px] bg-card border border-border shadow-xl z-50">
              <DropdownMenuItem 
                onClick={() => setLanguage('en')}
                className={`flex items-center gap-2 cursor-pointer ${language === 'en' ? 'bg-primary/10 text-primary font-medium' : ''}`}
              >
                <span className="text-base">🇬🇧</span>
                <span>English</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setLanguage('fr')}
                className={`flex items-center gap-2 cursor-pointer ${language === 'fr' ? 'bg-primary/10 text-primary font-medium' : ''}`}
              >
                <span className="text-base">🇫🇷</span>
                <span>Français</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden w-10 h-10 rounded-full bg-secondary/80 flex items-center justify-center text-foreground"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden bg-card mt-2 mx-4 rounded-xl overflow-hidden border border-border"
          >
            <nav className="flex flex-col p-4">
              {navLinks.map((link, index) => {
                const handleMobileClick = () => {
                  setIsMobileMenuOpen(false);
                  if (link.href.startsWith('/#')) {
                    const sectionId = link.href.replace('/#', '');
                    if (location.pathname !== '/') {
                      navigate('/');
                      setTimeout(() => {
                        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
                      }, 100);
                    } else {
                      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
                    }
                  }
                };
                
                return (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      to={link.href.startsWith('/#') ? '/' : link.href}
                      onClick={handleMobileClick}
                      className="block text-foreground py-3 px-4 hover:bg-primary/20 hover:text-primary rounded-lg transition-colors font-medium"
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                );
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Modal */}
      <SearchModal 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)}
        onSelectMovie={handleSelectMovie}
      />

      {/* Movie Detail Modal */}
      <MovieDetailModal
        movie={selectedMovie}
        isOpen={isMovieModalOpen}
        onClose={() => {
          setIsMovieModalOpen(false);
          setSelectedMovie(null);
        }}
      />
    </header>
  );
}
