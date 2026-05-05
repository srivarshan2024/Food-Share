import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, MapPin, RefreshCw, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import FoodCard from '../components/FoodCard';
import { useAuth } from '../context/AuthContext';
import './FoodList.css';

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

export default function FoodList() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [location, setLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  const [userClaims, setUserClaims] = useState({}); // Map of foodId -> claim status
  const { isAuthenticated, isReceiver } = useAuth();

  // Fetch user's existing claims to track their status
  const fetchUserClaims = async () => {
    if (!isAuthenticated || !isReceiver) return;
    try {
      const res = await api.get('/claims/my-claims');
      const claimsMap = {};
      (res.data || []).forEach(claim => {
        if (claim.foodId?.id) {
          claimsMap[claim.foodId.id] = claim.status;
        }
      });
      setUserClaims(claimsMap);
    } catch (err) {
      console.error('Fetch user claims error:', err);
    }
  };

  const fetchFoods = async (coords) => {
    setLoading(true);
    try {
      const params = coords 
        ? { latitude: coords.latitude, longitude: coords.longitude, maxDistance: 50000 }
        : { latitude: 0, longitude: 0, maxDistance: 100000 };
      const res = await api.get('/foods/nearby', { params });
      setFoods(res.data || []);
    } catch (err) {
      console.error('Fetch foods error:', err);
      toast.error('Failed to load food listings');
    } finally {
      setLoading(false);
    }
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
        setLocation(coords);
        fetchFoods(coords);
        setLocating(false);
        toast.success('Location updated!');
      },
      () => {
        setLocating(false);
        toast.error('Could not get location');
        fetchFoods(null);
      }
    );
  };

  useEffect(() => {
    getLocation();
    fetchUserClaims();
  }, [isAuthenticated, isReceiver]);

  const handleClaim = async (foodId) => {
    if (!isAuthenticated) {
      toast.error('Please login to claim food');
      return;
    }
    if (!isReceiver) {
      toast.error('Only receivers can claim food');
      return;
    }
    try {
      await api.post('/claims', { foodId });
      toast.success('Claim request sent!');
      // Update local claim status immediately
      setUserClaims(prev => ({ ...prev, [foodId]: 'Pending' }));
      fetchFoods(location);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Claim failed');
    }
  };

  const filteredFoods = foods.filter(food => {
    const matchesSearch = food.foodName?.toLowerCase().includes(search.toLowerCase()) ||
                         food.description?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || food.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="food-list-page">
      <div className="container">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1>Available Food</h1>
            <p>Browse and claim surplus food near you</p>
          </div>
          <button 
            className="btn btn-secondary"
            onClick={() => fetchFoods(location)}
            disabled={loading}
          >
            <RefreshCw size={18} className={loading ? 'spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="filters-bar">
          <div className="search-box">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Search food..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-group">
            <Filter size={18} />
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="Available">Available</option>
              <option value="Claimed">Claimed</option>
            </select>
          </div>

          <button 
            className="btn btn-ghost location-btn"
            onClick={getLocation}
            disabled={locating}
          >
            {locating ? <Loader2 size={18} className="spin" /> : <MapPin size={18} />}
            {location ? 'Update Location' : 'Get Location'}
          </button>
        </div>

        {/* Food Grid */}
        {loading ? (
          <div className="loading-container">
            <div className="spinner large"></div>
            <p>Loading food listings...</p>
          </div>
        ) : filteredFoods.length === 0 ? (
          <div className="empty-container">
            <div className="empty-icon">🍽️</div>
            <h3>No food available</h3>
            <p>Check back later or adjust your filters</p>
          </div>
        ) : (
          <motion.div 
            className="food-grid"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            {filteredFoods.map((food) => (
              <FoodCard 
                key={food.id} 
                food={food} 
                onClaim={handleClaim}
                showClaimButton={isAuthenticated && isReceiver}
                userClaimStatus={userClaims[food.id] || null}
              />
            ))}
          </motion.div>
        )}

        {/* Results count */}
        {!loading && filteredFoods.length > 0 && (
          <div className="results-count">
            Showing {filteredFoods.length} of {foods.length} listings
          </div>
        )}
      </div>
    </div>
  );
}
