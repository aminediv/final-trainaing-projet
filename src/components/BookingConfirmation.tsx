import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Ticket, MapPin, Clock, Calendar, CreditCard, CheckCircle, Lock } from 'lucide-react';

interface Seat {
  id: string;
  row: string;
  number: number;
  price: number;
}

interface BookingConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  onConfirm: () => void;
  movieTitle: string;
  showtime: string;
  date: string;
  selectedSeats: Seat[];
  totalPrice: number;
}

export function BookingConfirmation({
  isOpen,
  onClose,
  onBack,
  onConfirm,
  movieTitle,
  showtime,
  date,
  selectedSeats,
  totalPrice
}: BookingConfirmationProps) {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');

  if (!isOpen) return null;

  const serviceFee = Math.round(totalPrice * 0.05);
  const grandTotal = totalPrice + serviceFee;

  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  };

  const isFormValid = cardNumber.replace(/\s/g, '').length === 16 && expiry.length === 5 && cvv.length >= 3 && cardName.length > 0;

  return (
    <motion.div 
      className="fixed inset-0 z-[110] flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />
      
      {/* Content */}
      <motion.div 
        className="relative w-full max-w-md bg-gradient-to-b from-zinc-900 to-black rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', duration: 0.5 }}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-red-500/20 to-orange-500/20 border-b border-white/10 p-5 text-center">
          <motion.button 
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <X className="w-4 h-4" />
          </motion.button>
          
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-14 h-14 mx-auto mb-3 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/30"
          >
            <CheckCircle className="w-7 h-7 text-white" />
          </motion.div>
          <h2 className="text-lg font-bold text-white">Booking Summary</h2>
          <p className="text-xs text-white/60 mt-1">Review your booking details</p>
        </div>

        {/* Booking Details */}
        <div className="p-4 space-y-3">
          {/* Movie Info */}
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <h3 className="text-base font-bold text-white mb-2">{movieTitle}</h3>
            
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="flex items-center gap-2 text-white/70">
                <Calendar className="w-3.5 h-3.5 text-white/50" />
                <span>{date}</span>
              </div>
              <div className="flex items-center gap-2 text-white/70">
                <Clock className="w-3.5 h-3.5 text-white/50" />
                <span>{showtime}</span>
              </div>
              <div className="flex items-center gap-2 text-white/70">
                <MapPin className="w-3.5 h-3.5 text-white/50" />
                <span>Sahara Cinema</span>
              </div>
            </div>
          </div>

          {/* Seats */}
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Ticket className="w-3.5 h-3.5 text-white/50" />
              <span className="text-xs font-medium text-white">Selected Seats ({selectedSeats.length})</span>
            </div>
            
            <div className="flex flex-wrap gap-1.5 mb-2">
              {selectedSeats.map(seat => (
                <span 
                  key={seat.id}
                  className="px-2 py-1 rounded-md bg-gradient-to-r from-red-500/30 to-orange-500/30 text-white text-xs font-semibold border border-white/10"
                >
                  {seat.id}
                </span>
              ))}
            </div>
            
            <div className="text-[10px] text-white/50 flex flex-wrap gap-2">
              {selectedSeats.filter(s => s.price === 80).length > 0 && (
                <span>Regular: {selectedSeats.filter(s => s.price === 80).length} × 80 MAD</span>
              )}
              {selectedSeats.filter(s => s.price === 150).length > 0 && (
                <span>VIP: {selectedSeats.filter(s => s.price === 150).length} × 150 MAD</span>
              )}
              {selectedSeats.filter(s => s.price === 200).length > 0 && (
                <span>Love Box: {selectedSeats.filter(s => s.price === 200).length} × 200 MAD</span>
              )}
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="w-3.5 h-3.5 text-white/50" />
              <span className="text-xs font-medium text-white">Price Details</span>
            </div>
            
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-white/70">
                <span>Tickets ({selectedSeats.length})</span>
                <span>{totalPrice} MAD</span>
              </div>
              <div className="flex justify-between text-white/70">
                <span>Service Fee</span>
                <span>{serviceFee} MAD</span>
              </div>
              <div className="border-t border-white/10 pt-2 mt-2 flex justify-between text-white font-bold text-sm">
                <span>Total</span>
                <span className="text-green-400">{grandTotal} MAD</span>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <div className="flex items-center gap-2 mb-3">
              <Lock className="w-3.5 h-3.5 text-green-400" />
              <span className="text-xs font-medium text-white">Payment Information</span>
              <span className="ml-auto text-[10px] text-green-400/70 flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" /> Secure
              </span>
            </div>
            
            <div className="space-y-2">
              <div>
                <label className="text-[10px] text-white/50 mb-1 block">Cardholder Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-colors"
                />
              </div>
              <div>
                <label className="text-[10px] text-white/50 mb-1 block">Card Number</label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-colors font-mono tracking-wider"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-white/50 mb-1 block">Expiry Date</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={expiry}
                    onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                    className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-colors font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-white/50 mb-1 block">CVV</label>
                  <input
                    type="password"
                    placeholder="•••"
                    value={cvv}
                    maxLength={4}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-colors font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 pt-2 flex gap-2">
          <motion.button
            onClick={onBack}
            className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Back
          </motion.button>
          <motion.button
            onClick={onConfirm}
            disabled={!isFormValid}
            className={`flex-1 py-2.5 rounded-xl text-white text-sm font-semibold shadow-lg transition-colors flex items-center justify-center gap-2 ${
              isFormValid 
                ? 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600' 
                : 'bg-white/10 cursor-not-allowed opacity-50'
            }`}
            whileHover={isFormValid ? { scale: 1.02 } : {}}
            whileTap={isFormValid ? { scale: 0.98 } : {}}
          >
            <CreditCard className="w-4 h-4" />
            Pay {grandTotal} MAD
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
