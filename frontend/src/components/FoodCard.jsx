import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, Package, User, Mail, Phone } from 'lucide-react';
import ClaimButton from './ClaimButton';
import './FoodCard.css';

function getTimeRemaining(expiryTime) {
  const now = new Date().getTime();
  const expiry = new Date(expiryTime).getTime();
  const diff = expiry - now;

  if (diff <= 0) return { expired: true, text: 'Expired' };

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return { expired: false, text: `${days}d ${hours % 24}h left`, urgent: false };
  }
  if (hours >= 1) {
    return { expired: false, text: `${hours}h ${minutes}m left`, urgent: hours < 3 };
  }
  return { expired: false, text: `${minutes}m left`, urgent: true };
}

export default function FoodCard({ food, onClaim, showClaimButton = true, userClaimStatus = null }) {
  const [timeLeft, setTimeLeft] = useState(() => getTimeRemaining(food.expiryTime));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeRemaining(food.expiryTime));
    }, 60000);
    return () => clearInterval(interval);
  }, [food.expiryTime]);

  const statusColors = {
    Available: 'success',
    Claimed: 'warning',
    Expired: 'error',
    Completed: 'info'
  };

  const foodEmojis = ['🍕', '🍔', '🥗', '🍱', '🍜', '🥪', '🍛', '🥘', '🍲', '🍝'];
  const emoji = foodEmojis[food.foodName?.length % foodEmojis.length] || '🍽️';

  // Build image URL - handle both relative and absolute paths
  const imageUrl = food.imageUrl 
    ? (food.imageUrl.startsWith('http') ? food.imageUrl : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${food.imageUrl}`)
    : null;

  return (
    <motion.div 
      className="food-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      {imageUrl ? (
        <div className="food-card-image">
          <img src={imageUrl} alt={food.foodName} />
          <span className={`badge badge-${statusColors[food.status]}`}>
            {food.status}
          </span>
        </div>
      ) : (
        <div className="food-card-header">
          <div className="food-emoji">{emoji}</div>
          <span className={`badge badge-${statusColors[food.status]}`}>
            {food.status}
          </span>
        </div>
      )}

      <div className="food-card-body">
        <h3 className="food-title">{food.foodName}</h3>
        {food.description && (
          <p className="food-description">{food.description}</p>
        )}

        <div className="food-meta">
          <div className="meta-item">
            <Package size={16} />
            <span>{food.quantity}</span>
          </div>
          <div className={`meta-item ${timeLeft.urgent ? 'urgent' : ''} ${timeLeft.expired ? 'expired' : ''}`}>
            <Clock size={16} />
            <span>{timeLeft.text}</span>
          </div>
          {food.location && (
            <div className="meta-item">
              <MapPin size={16} />
              <span>
                {food.distance ? `${(food.distance / 1000).toFixed(1)} km away` : 'Location set'}
              </span>
            </div>
          )}
        </div>

        {food.donorId?.name && (
          <div className="food-donor">
            <User size={14} />
            <span>Posted by {food.donorId.name}</span>
          </div>
        )}

        {food.donorId && (
          <div className="food-contact">
            {food.donorId.email && (
              <a href={`mailto:${food.donorId.email}`} className="contact-item">
                <Mail size={14} />
                <span>{food.donorId.email}</span>
              </a>
            )}
            {food.donorId.phone && (
              <a href={`tel:${food.donorId.phone}`} className="contact-item">
                <Phone size={14} />
                <span>{food.donorId.phone}</span>
              </a>
            )}
          </div>
        )}
      </div>

      {showClaimButton && (food.status === 'Available' || userClaimStatus) && (
        <div className="food-card-footer">
          <ClaimButton 
            status={food.status} 
            onClick={() => onClaim && onClaim(food.id)}
            claimStatus={userClaimStatus}
            isExpired={timeLeft.expired}
          />
        </div>
      )}
    </motion.div>
  );
}
