import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Play, Clock, Calendar, Star, Ticket, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

export interface MovieDetails {
  id: number;
  title: string;
  image: string;
  backdrop?: string;
  description: string;
  duration: string;
  rating: number;
  genre: string[];
  releaseDate: string;
  director: string;
  cast: string[];
  trailerUrl?: string;
  showtimes: {
    date: string;
    times: string[];
  }[];
  formats: string[];
  isNew?: boolean;
}
interface MovieDetailModalProps {
  movie: MovieDetails | null;
  isOpen: boolean;
  onClose: () => void;
}
export function MovieDetailModal({
  movie,
  isOpen,
  onClose
}: MovieDetailModalProps) {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  
  // Generate dates for the next 14 days with translations
  const availableDates = useMemo(() => {
    const dates = [];
    const today = new Date();
    const dayNamesEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayNamesFr = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const monthNamesEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthNamesFr = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    
    const dayNames = language === 'fr' ? dayNamesFr : dayNamesEn;
    const monthNames = language === 'fr' ? monthNamesFr : monthNamesEn;
    
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      let label = '';
      if (i === 0) label = t('movie.today');
      else if (i === 1) label = t('movie.tomorrow');
      else label = dayNames[date.getDay()];
      
      dates.push({
        label,
        day: date.getDate(),
        month: monthNames[date.getMonth()],
        fullDate: date.toISOString().split('T')[0],
        times: ['10:30', '13:00', '15:30', '18:00', '20:30', '23:00'].slice(0, Math.floor(Math.random() * 4) + 3)
      });
    }
    return dates;
  }, [language, t]);
  
  if (!movie) return null;
  return <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent hideCloseButton className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 border-none shadow-2xl bg-transparent">
        {/* Full poster background - more transparent to show colors */}
        <div className="absolute inset-0 overflow-hidden rounded-lg">
          <img src={movie.image} alt="" className="w-full h-full object-cover scale-125 blur-3xl opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/80" />
        </div>
        
        {/* Close Button */}
        <motion.button 
          onClick={onClose} 
          className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-black/70 hover:bg-primary text-white flex items-center justify-center transition-colors backdrop-blur-sm border border-white/20"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <X className="w-5 h-5" />
        </motion.button>
        
        {/* Backdrop/Trailer Image */}
        <div className="relative h-56 md:h-72 overflow-hidden">
          <img src={movie.backdrop || movie.image} alt={movie.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
          
          {/* Play Trailer Button */}
          {movie.trailerUrl && (
            <a 
              href={movie.trailerUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center transition-colors border border-white/30 z-10"
            >
              <Play className="w-7 h-7 text-white fill-white ml-0.5" />
            </a>
          )}
        </div>

        {/* Content */}
        <div className="p-5 md:p-6 -mt-16 relative z-10">
          <div className="flex gap-5 items-start">
            {/* Poster - constrained height */}
            <div className="hidden md:block flex-shrink-0 w-36 max-h-52 overflow-hidden rounded-lg shadow-lg border border-white/10">
              <img src={movie.image} alt={movie.title} className="w-full h-full object-cover object-top" />
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <DialogHeader>
                <DialogTitle className="text-2xl md:text-3xl font-bold text-white mb-2">
                  {movie.title}
                </DialogTitle>
              </DialogHeader>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-white/60 mb-3">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-primary fill-current" />
                  <span className="text-white font-semibold">{movie.rating}/10</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{movie.duration}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{movie.releaseDate}</span>
                </div>
              </div>

              {/* Genres & Formats */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {movie.genre.map(g => (
                  <span key={g} className="px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs font-medium">
                    {g}
                  </span>
                ))}
                {movie.formats.map(format => (
                  <span key={format} className="px-2 py-1 rounded bg-primary/20 text-primary text-xs font-bold">
                    {format}
                  </span>
                ))}
              </div>

              {/* Description */}
              <p className="text-white/70 text-sm leading-relaxed mb-3 line-clamp-3">
                {movie.description}
              </p>

              {/* Director & Cast */}
              <div className="text-sm text-white/50">
                <span className="text-white/70 font-medium">{t('movie.director')}:</span> {movie.director} • <span className="text-white/70 font-medium">{t('movie.cast')}:</span> {movie.cast.slice(0, 4).join(', ')}
              </div>
            </div>
          </div>

          {/* Reservation Section */}
          <div className="mt-5 border-t border-white/10 bg-black/60 backdrop-blur-md rounded-xl p-5">
            <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <Ticket className="w-5 h-5 text-primary" />
              {t('seats.title')}
            </h3>
            
            {/* Date Selector */}
            <div className="relative mb-5">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setSelectedDateIndex(Math.max(0, selectedDateIndex - 1))}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors disabled:opacity-30"
                  disabled={selectedDateIndex === 0}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                <div className="flex-1 overflow-hidden">
                  <div className="flex gap-2 overflow-x-auto scrollbar-hide py-1">
                    {availableDates.slice(0, 7).map((date, index) => (
                      <motion.button
                        key={date.fullDate}
                        onClick={() => setSelectedDateIndex(index)}
                        className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-center transition-all min-w-[70px] ${
                          selectedDateIndex === index 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-white/10 hover:bg-white/20 text-white'
                        }`}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="text-xs font-medium opacity-80">{date.label}</div>
                        <div className="text-base font-bold">{date.day}</div>
                      </motion.button>
                    ))}
                  </div>
                </div>
                
                <button 
                  onClick={() => setSelectedDateIndex(Math.min(6, selectedDateIndex + 1))}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors disabled:opacity-30"
                  disabled={selectedDateIndex >= 6}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* Time Slots */}
            <div className="flex flex-wrap gap-2.5">
              {availableDates[selectedDateIndex]?.times.map((time) => (
                <motion.button 
                  key={time} 
                  onClick={() => setSelectedTime(time)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
                    selectedTime === time 
                      ? 'bg-primary text-primary-foreground border-primary' 
                      : 'bg-white/10 hover:bg-white/20 text-white border-white/10'
                  }`}
                  whileTap={{ scale: 0.95 }}
                >
                  {time}
                </motion.button>
              ))}
            </div>

            {/* Book Now Button */}
            <div className="mt-5 flex gap-3">
              <motion.button 
                onClick={() => {
                  if (selectedTime) {
                    navigate('/select-seats', {
                      state: {
                        movieTitle: movie.title,
                        showtime: selectedTime,
                        date: `${availableDates[selectedDateIndex]?.label}, ${availableDates[selectedDateIndex]?.day} ${availableDates[selectedDateIndex]?.month}`,
                        moviePoster: movie.image,
                        movieRating: movie.rating.toString(),
                        movieDuration: movie.duration,
                        movieDescription: movie.description,
                        theatreName: 'Sahara Cinema',
                        trailerUrl: movie.trailerUrl
                      }
                    });
                    onClose();
                  }
                }}
                disabled={!selectedTime}
                className={`flex-1 py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
                  selectedTime 
                    ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/30' 
                    : 'bg-white/10 text-white/30 cursor-not-allowed'
                }`}
                whileTap={selectedTime ? { scale: 0.98 } : {}}
              >
                <Ticket className="w-5 h-5" />
                {selectedTime ? t('seats.continue') : t('movie.selectShowtime')}
              </motion.button>
              {movie.trailerUrl && (
                <motion.a 
                  href={movie.trailerUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors border border-white/10"
                  whileTap={{ scale: 0.98 }}
                >
                  <Play className="w-5 h-5" />
                  {language === 'fr' ? 'Bande-annonce' : 'Trailer'}
                </motion.a>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>;
}