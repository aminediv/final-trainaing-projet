import { motion } from 'framer-motion';
import { X, CheckCircle, Calendar, Clock, Ticket, Download, Share2, MapPin } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface Seat {
  id: string;
  row: string;
  number: number;
  price: number;
}

interface BookingSuccessProps {
  isOpen: boolean;
  onClose: () => void;
  movieTitle: string;
  showtime: string;
  date: string;
  selectedSeats: Seat[];
  totalPrice: number;
  confirmationNumber: string;
}

export function BookingSuccess({
  isOpen,
  onClose,
  movieTitle,
  showtime,
  date,
  selectedSeats,
  totalPrice,
  confirmationNumber
}: BookingSuccessProps) {
  if (!isOpen) return null;

  const serviceFee = Math.round(totalPrice * 0.05);
  const grandTotal = totalPrice + serviceFee;
  
  // Generate QR code data
  const qrData = JSON.stringify({
    confirmation: confirmationNumber,
    movie: movieTitle,
    date,
    time: showtime,
    seats: selectedSeats.map(s => s.id)
  });

  return (
    <motion.div 
      className="fixed inset-0 z-[120] flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/95 backdrop-blur-md" />
      
      {/* Confetti Animation */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 rounded-full"
            style={{
              background: ['#ef4444', '#f97316', '#22c55e', '#3b82f6', '#eab308'][i % 5],
              left: `${Math.random() * 100}%`,
              top: '-20px',
            }}
            animate={{
              y: ['0vh', '100vh'],
              rotate: [0, 360 * (Math.random() > 0.5 ? 1 : -1)],
              opacity: [1, 0],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              delay: Math.random() * 0.5,
              ease: 'easeOut',
            }}
          />
        ))}
      </div>
      
      {/* Content */}
      <motion.div 
        className="relative w-full max-w-md bg-gradient-to-b from-zinc-900 to-black rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', duration: 0.6, bounce: 0.3 }}
      >
        {/* Success Header with Animation */}
        <div className="relative bg-gradient-to-r from-green-500/20 via-emerald-500/20 to-green-500/20 border-b border-white/10 p-5 text-center">
          <motion.button 
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <X className="w-4 h-4" />
          </motion.button>
          
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-14 h-14 mx-auto mb-3 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/40"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: 'spring' }}
            >
              <CheckCircle className="w-7 h-7 text-white" />
            </motion.div>
          </motion.div>
          
          <motion.h2 
            className="text-lg font-bold text-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Booking Confirmed!
          </motion.h2>
          <motion.p 
            className="text-xs text-white/60 mt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Your tickets are ready
          </motion.p>
        </div>

        {/* QR Code Section */}
        <motion.div 
          className="p-4 flex flex-col items-center border-b border-white/10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="bg-white p-2.5 rounded-xl shadow-lg">
            <QRCodeSVG value={qrData} size={110} level="H" />
          </div>
          <p className="text-[10px] text-white/40 uppercase tracking-wider mt-2">Confirmation Code</p>
          <p className="text-base font-bold text-white font-mono tracking-wider">{confirmationNumber}</p>
        </motion.div>

        {/* Movie Details */}
        <motion.div 
          className="p-4 space-y-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="font-bold text-white text-base">{movieTitle}</h3>
          
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-white/70">
              <Calendar className="w-3.5 h-3.5 text-white/50" />
              <span>{date}</span>
            </div>
            <div className="flex items-center gap-1.5 text-white/70">
              <Clock className="w-3.5 h-3.5 text-white/50" />
              <span>{showtime}</span>
            </div>
            <div className="flex items-center gap-1.5 text-white/70">
              <MapPin className="w-3.5 h-3.5 text-white/50" />
              <span>Sahara Cinema</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-white/70 bg-white/5 rounded-lg p-2">
            <Ticket className="w-3.5 h-3.5 text-green-400" />
            <span className="text-white/60">Seats:</span>
            <span className="font-semibold text-white">{selectedSeats.map(s => s.id).join(', ')}</span>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-white/10">
            <span className="text-white/50 text-sm">Total Paid</span>
            <span className="text-lg font-bold text-green-400">{grandTotal} MAD</span>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div 
          className="p-4 pt-2 flex gap-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <motion.button
            className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Download className="w-4 h-4" />
            Save
          </motion.button>
          <motion.button
            className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Share2 className="w-4 h-4" />
            Share
          </motion.button>
        </motion.div>

        <p className="text-center text-xs text-white/40 pb-3">
          Show this QR code at the entrance
        </p>
      </motion.div>
    </motion.div>
  );
}
