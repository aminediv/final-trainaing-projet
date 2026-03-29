import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Play, X } from 'lucide-react';
import { BookingConfirmation } from '@/components/BookingConfirmation';
import { BookingSuccess } from '@/components/BookingSuccess';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
export interface Seat {
  id: string;
  row: string;
  number: number;
  status: 'available' | 'selected' | 'occupied' | 'vip' | 'lovebox';
  price: number;
  isLoveBox?: boolean;
}
const generateSeats = (): Seat[][] => {
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  const seatsPerRow = [14, 14, 16, 16, 16, 16, 16, 16, 14, 12];
  return rows.map((row, rowIndex) => {
    const seats: Seat[] = [];
    const count = seatsPerRow[rowIndex];
    const isVipRow = rowIndex <= 1;
    const isLoveBoxRow = rowIndex >= 3 && rowIndex <= 4;
    for (let i = 1; i <= count; i++) {
      const isOccupied = Math.random() < 0.2;
      const isCenterSeat = i >= Math.floor(count / 2) - 2 && i <= Math.floor(count / 2) + 2;
      const isLoveBox = isLoveBoxRow && isCenterSeat && i % 2 === 0;
      let status: Seat['status'] = 'available';
      let price = 80;
      if (isOccupied) {
        status = 'occupied';
      } else if (isVipRow) {
        status = 'vip';
        price = 150;
      } else if (isLoveBox) {
        status = 'lovebox';
        price = 200;
      }
      seats.push({
        id: `${row}${i}`,
        row,
        number: i,
        status,
        price,
        isLoveBox
      });
    }
    return seats;
  });
};
export default function SeatSelectionPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    user
  } = useAuth();

  // Get movie data from navigation state
  const {
    movieTitle = 'Movie Title',
    showtime = '18:00',
    date = 'Today',
    moviePoster,
    movieBackdrop,
    movieRating = '8.1',
    movieDuration = '1h 55min',
    movieDescription = 'Experience the ultimate cinema adventure.',
    theatreName = 'Sahara Cinema'
  } = location.state || {};
  const [seats] = useState<Seat[][]>(generateSeats);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [confirmationNumber, setConfirmationNumber] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const generateConfirmationNumber = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'SAH-';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };
  const handleSeatClick = (seat: Seat) => {
    if (seat.status === 'occupied') return;
    const isSelected = selectedSeats.find(s => s.id === seat.id);
    if (isSelected) {
      setSelectedSeats(selectedSeats.filter(s => s.id !== seat.id));
    } else {
      setSelectedSeats([...selectedSeats, seat]);
    }
  };
  const getSeatStyle = (seat: Seat) => {
    const isSelected = selectedSeats.find(s => s.id === seat.id);
    if (isSelected) {
      return 'bg-blue-500 border-blue-600 shadow-lg shadow-blue-500/30';
    }
    if (seat.status === 'occupied') {
      return 'bg-gray-300 border-gray-400 cursor-not-allowed opacity-50';
    }
    if (seat.status === 'vip') {
      return 'bg-gradient-to-b from-gray-600 to-gray-700 border-gray-500 hover:from-gray-500 hover:to-gray-600 cursor-pointer';
    }
    if (seat.status === 'lovebox') {
      return 'bg-gradient-to-b from-gray-700 to-gray-800 border-gray-600 hover:from-gray-600 hover:to-gray-700 cursor-pointer rounded-lg';
    }
    return 'bg-gray-400 border-gray-500 hover:bg-gray-300 cursor-pointer';
  };
  const totalPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
  const regularSeats = selectedSeats.filter(s => s.status !== 'vip' && s.status !== 'lovebox');
  const vipSeats = selectedSeats.filter(s => s.status === 'vip');
  const loveBoxSeats = selectedSeats.filter(s => s.status === 'lovebox');
  const saveBooking = async (bookingCode: string) => {
    if (!user) return;
    setIsSaving(true);
    try {
      const {
        error
      } = await supabase.from('bookings').insert({
        user_id: user.id,
        movie_title: movieTitle,
        show_date: date,
        show_time: showtime,
        selected_seats: selectedSeats.map(s => s.id),
        total_price: totalPrice,
        booking_code: bookingCode
      });
      if (error) throw error;
    } catch (error) {
      console.error('Error saving booking:', error);
      toast.error('Failed to save booking. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  const handleConfirmBooking = async () => {
    if (!user) {
      toast.error('Please sign in to book tickets');
      navigate('/auth');
      return;
    }
    const newConfirmation = generateConfirmationNumber();
    setConfirmationNumber(newConfirmation);
    await saveBooking(newConfirmation);
    setShowConfirmation(false);
    setShowSuccess(true);
  };
  const handleClose = () => {
    navigate(-1);
  };
  const [showTrailer, setShowTrailer] = useState(false);
  const movieTrailerUrl = location.state?.trailerUrl || '';

  // Extract YouTube video ID from URL
  const getYouTubeEmbedUrl = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=1` : '';
  };
  return <div className="min-h-screen bg-white">
      {/* Hero Movie Header */}
      <div className="relative h-48 sm:h-64 lg:h-80 overflow-hidden">
        {/* Background Image with Gradient Overlay - Use backdrop for widescreen fit */}
        <div className="absolute inset-0" style={{
        backgroundImage: movieBackdrop || moviePoster ? `url(${movieBackdrop || moviePoster})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-white" />
        <div className="absolute inset-0 bg-gradient-to-r from-white/80 via-transparent to-white/80" />
        
        {/* Header Navigation */}
        <header className="relative flex items-center justify-between px-4 sm:px-8 py-4 z-10">
          <button onClick={handleClose} className="flex items-center gap-2 text-gray-800 hover:text-gray-600 transition-colors bg-white/80 backdrop-blur-sm px-3 py-2 rounded-lg">
            <ChevronLeft className="w-5 h-5" />
            <span className="font-medium">BACK</span>
          </button>
          
          {/* Progress Steps */}
          <div className="hidden sm:flex items-center gap-8 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg">
            <div className="flex items-center gap-2 text-gray-400">
              <span className="text-sm">01 Overview</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-1 bg-red-500 rounded-full mb-1" />
              <span className="text-sm font-semibold text-gray-800">02 Seats</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <span className="text-sm">03 Cart</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <span className="text-sm">04 Payment</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <span className="text-sm">05 Finish</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-lg">
            <span className="text-gray-700 hidden sm:block">Hi, {user ? 'User' : 'Guest'}</span>
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500 text-sm">?</span>
            </div>
          </div>
        </header>
      </div>

      <div className="relative flex flex-col lg:flex-row">
        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Side - Seat Selection */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 pb-32 lg:pb-8">
            {/* Movie Info */}
            <div className="mb-6">
              <div className="flex flex-wrap items-center gap-4 mb-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{movieTitle}</h1>
                <span className="px-2 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded">IMDb {movieRating}</span>
                <span className="text-gray-500 text-sm">⏱ {movieDuration}</span>
              </div>
              <p className="text-gray-500 text-sm max-w-xl">{movieDescription}</p>
            </div>
            
            {/* Show Info */}
            <div className="flex flex-wrap items-center gap-8 mb-6 text-sm">
              <div>
                <p className="text-gray-400">Theatre</p>
                <p className="font-semibold text-gray-800">{theatreName}</p>
              </div>
              <div>
                <p className="text-gray-400">Date</p>
                <p className="font-semibold text-gray-800">{date}</p>
              </div>
              <div>
                <p className="text-gray-400">Show time</p>
                <p className="font-semibold text-gray-800">{showtime}</p>
              </div>
              
              {/* Legend */}
              <div className="flex items-center gap-4 ml-auto">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-400 border border-gray-500 rounded-sm" />
                  <span className="text-gray-600 text-xs">Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-300 border border-gray-400 rounded-sm opacity-50" />
                  <span className="text-gray-600 text-xs">Booked</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-200 border border-gray-300 rounded-sm" />
                  <span className="text-gray-600 text-xs">Sold out</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 border border-blue-600 rounded-sm" />
                  <span className="text-gray-600 text-xs">Selected</span>
                </div>
              </div>
            </div>

            {/* Screen */}
            <div className="relative mb-8">
              <svg viewBox="0 0 400 30" className="w-full max-w-2xl mx-auto">
                <path d="M 10 25 Q 200 0 390 25" fill="none" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
              </svg>
              <p className="text-center text-gray-400 text-sm tracking-[0.3em] mt-2">SCREEN</p>
            </div>

            {/* Seats Grid */}
            <div className="flex flex-col items-center gap-1 mb-8 overflow-x-auto">
              {seats.map((row, rowIndex) => <div key={rowIndex} className="flex items-center gap-1 min-w-max">
                  <span className="w-6 text-center text-gray-400 text-sm font-medium">
                    {row[0]?.row}
                  </span>
                  
                  <div className="flex gap-0.5">
                    {row.map((seat, seatIndex) => {
                  const hasGapBefore = seatIndex === Math.floor(row.length / 2);
                  return <div key={seat.id} className={`flex ${hasGapBefore ? 'ml-4' : ''}`}>
                          <motion.button onClick={() => handleSeatClick(seat)} disabled={seat.status === 'occupied'} className={`w-5 h-5 sm:w-6 sm:h-6 rounded-sm border text-[8px] font-medium transition-all ${getSeatStyle(seat)}`} whileHover={seat.status !== 'occupied' ? {
                      scale: 1.1
                    } : {}} whileTap={seat.status !== 'occupied' ? {
                      scale: 0.95
                    } : {}} title={`${seat.id} - ${seat.price} MAD`} />
                        </div>;
                })}
                  </div>
                  
                  <span className="w-6 text-center text-gray-400 text-sm font-medium">
                    {row[0]?.row}
                  </span>
                </div>)}
            </div>

          </div>

          {/* Right Sidebar */}
          <div className="hidden lg:flex w-80 border-l border-gray-200 flex-col bg-white p-6">
            {/* Movie Poster with Trailer Button */}
            {moviePoster && <div className="relative mb-6">
                <div className="relative rounded-xl overflow-hidden shadow-xl">
                  <img src={moviePoster} alt={movieTitle} className="w-full h-72 object-cover" />
                  {/* Play Button Overlay */}
                  <motion.button onClick={() => setShowTrailer(true)} className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/50 transition-colors cursor-pointer" whileHover={{
                scale: 1.02
              }}>
                    <motion.div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center shadow-lg" whileHover={{
                  scale: 1.1
                }} whileTap={{
                  scale: 0.95
                }}>
                      <Play className="w-8 h-8 text-white fill-white ml-1" />
                    </motion.div>
                  </motion.button>
                </div>
                <button onClick={() => setShowTrailer(true)} className="w-full text-center text-cyan-500 text-sm mt-3 cursor-pointer hover:underline font-medium tracking-wide">
                  WATCH TRAILER
                </button>
              </div>}
            
            {/* Your Seats Summary */}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Seats</h3>
              
              {selectedSeats.length === 0 ? <p className="text-gray-400 text-sm">No seats selected</p> : <div className="space-y-3">
                  {regularSeats.length > 0 && <div className="flex items-center justify-between">
                      <span className="text-gray-700">Regular</span>
                      <div className="flex items-center gap-4">
                        <span className="text-gray-500">{regularSeats.length}</span>
                        <span className="font-semibold text-gray-800">{regularSeats.reduce((s, seat) => s + seat.price, 0)} MAD</span>
                      </div>
                    </div>}
                  
                  {loveBoxSeats.length > 0 && <div className="flex items-center justify-between">
                      <span className="text-gray-700">Love Box</span>
                      <div className="flex items-center gap-4">
                        <span className="text-gray-500">{loveBoxSeats.length}</span>
                        <span className="font-semibold text-gray-800">{loveBoxSeats.reduce((s, seat) => s + seat.price, 0)} MAD</span>
                      </div>
                    </div>}
                  
                  {vipSeats.length > 0 && <div className="flex items-center justify-between">
                      <span className="text-gray-700">VIP</span>
                      <div className="flex items-center gap-4">
                        <span className="text-gray-500">{vipSeats.length}</span>
                        <span className="font-semibold text-gray-800">{vipSeats.reduce((s, seat) => s + seat.price, 0)} MAD</span>
                      </div>
                    </div>}
                  
                  <div className="border-t border-gray-200 pt-3 mt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-red-500 font-semibold">TOTAL</span>
                      <span className="text-2xl font-bold text-gray-900">{totalPrice} MAD</span>
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <p className="text-gray-400 text-xs mb-2">Selected: {selectedSeats.map(s => s.id).join(', ')}</p>
                  </div>
                </div>}
            </div>
            
            {/* Add to Cart Button */}
            <motion.button onClick={() => selectedSeats.length > 0 && setShowConfirmation(true)} disabled={selectedSeats.length === 0} className={`w-full py-4 rounded-lg font-semibold text-lg transition-all ${selectedSeats.length > 0 ? 'bg-red-500 text-white hover:bg-red-600 shadow-lg' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`} whileHover={selectedSeats.length > 0 ? {
            scale: 1.02
          } : {}} whileTap={selectedSeats.length > 0 ? {
            scale: 0.98
          } : {}}>
              Add to cart
            </motion.button>
          </div>
        </div>
        
        {/* Mobile Bottom Bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-gray-500 text-sm">{selectedSeats.length} seat(s) selected</p>
              <p className="text-xl font-bold text-gray-900">{totalPrice} MAD</p>
            </div>
            
          </div>
          <motion.button onClick={() => selectedSeats.length > 0 && setShowConfirmation(true)} disabled={selectedSeats.length === 0} className={`w-full py-3 rounded-lg font-semibold transition-all ${selectedSeats.length > 0 ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
            Confirm Seat
          </motion.button>
        </div>
      </div>

      {/* Trailer Modal */}
      {showTrailer && movieTrailerUrl && <motion.div className="fixed inset-0 z-[120] flex items-center justify-center p-4" initial={{
      opacity: 0
    }} animate={{
      opacity: 1
    }} exit={{
      opacity: 0
    }}>
          <div className="absolute inset-0 bg-black/95" onClick={() => setShowTrailer(false)} />
          <motion.div className="relative w-full max-w-4xl aspect-video bg-black rounded-xl overflow-hidden" initial={{
        scale: 0.9
      }} animate={{
        scale: 1
      }}>
            <button onClick={() => setShowTrailer(false)} className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors">
              <X className="w-5 h-5" />
            </button>
            <iframe src={getYouTubeEmbedUrl(movieTrailerUrl)} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
          </motion.div>
        </motion.div>}

      {/* Booking Confirmation Modal */}
      <BookingConfirmation isOpen={showConfirmation} onClose={() => {
      setShowConfirmation(false);
      handleClose();
    }} onBack={() => setShowConfirmation(false)} onConfirm={handleConfirmBooking} movieTitle={movieTitle} showtime={showtime} date={date} selectedSeats={selectedSeats} totalPrice={totalPrice} />

      {/* Booking Success Modal */}
      <BookingSuccess isOpen={showSuccess} onClose={() => {
      setShowSuccess(false);
      setSelectedSeats([]);
      navigate('/');
    }} movieTitle={movieTitle} showtime={showtime} date={date} selectedSeats={selectedSeats} totalPrice={totalPrice} confirmationNumber={confirmationNumber} />
    </div>;
}