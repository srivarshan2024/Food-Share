import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Package, 
  Clock, 
  MapPin, 
  CheckCircle, 
  XCircle, 
  Loader2,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  Mail,
  Phone
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import './MyClaims.css';

export default function MyClaims() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchClaims = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await api.get('/claims/my-claims');
      setClaims(res.data);
    } catch (err) {
      toast.error('Failed to fetch claims');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Approved':
        return <CheckCircle size={20} className="status-icon approved" />;
      case 'Rejected':
        return <XCircle size={20} className="status-icon rejected" />;
      default:
        return <Clock size={20} className="status-icon pending" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return 'success';
      default: return 'warning';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Build image URL helper
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    return imageUrl.startsWith('http') 
      ? imageUrl 
      : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${imageUrl}`;
  };

  if (loading) {
    return (
      <div className="my-claims-page">
        <div className="container">
          <div className="loading-state">
            <Loader2 size={48} className="spin" />
            <p>Loading your claims...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-claims-page">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="claims-header">
            <div className="header-content">
              <h1>My Claims</h1>
              <p>Track the status of your food claim requests</p>
            </div>
            <button 
              className="btn btn-secondary"
              onClick={() => fetchClaims(true)}
              disabled={refreshing}
            >
              {refreshing ? (
                <Loader2 size={18} className="spin" />
              ) : (
                <RefreshCw size={18} />
              )}
              Refresh
            </button>
          </div>

          {/* Stats Summary */}
          <div className="claims-stats">
            <div className="stat-card">
              <div className="stat-value">{claims.length}</div>
              <div className="stat-label">Total Claims</div>
            </div>
            <div className="stat-card pending">
              <div className="stat-value">
                {claims.filter(c => c.status === 'Pending').length}
              </div>
              <div className="stat-label">Pending</div>
            </div>
            <div className="stat-card approved">
              <div className="stat-value">
                {claims.filter(c => c.status === 'Approved').length}
              </div>
              <div className="stat-label">Approved</div>
            </div>
            <div className="stat-card rejected">
              <div className="stat-value">
                {claims.filter(c => c.status === 'Rejected').length}
              </div>
              <div className="stat-label">Rejected</div>
            </div>
          </div>

          {/* Claims List */}
          {claims.length === 0 ? (
            <div className="empty-state">
              <Package size={64} />
              <h3>No Claims Yet</h3>
              <p>You haven't claimed any food items yet. Browse available food near you!</p>
              <Link to="/foods" className="btn btn-primary">
                Browse Food
                <ArrowRight size={18} />
              </Link>
            </div>
          ) : (
            <div className="claims-list">
              {claims.map((claim, index) => (
                <motion.div
                  key={claim.id}
                  className="claim-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div className="claim-image">
                    {claim.food?.imageUrl ? (
                      <img 
                        src={getImageUrl(claim.food.imageUrl)} 
                        alt={claim.food?.foodName} 
                      />
                    ) : (
                      <div className="claim-emoji">
                        {['🍕', '🍔', '🥗', '🍱', '🍜'][index % 5]}
                      </div>
                    )}
                  </div>

                  <div className="claim-content">
                    <div className="claim-header">
                      <h3>{claim.food?.foodName || 'Food Item'}</h3>
                      <span className={`badge badge-${getStatusColor(claim.status)}`}>
                        {getStatusIcon(claim.status)}
                        {claim.status}
                      </span>
                    </div>

                    {claim.food?.description && (
                      <p className="claim-description">{claim.food.description}</p>
                    )}

                    <div className="claim-meta">
                      <div className="meta-item">
                        <Package size={16} />
                        <span>{claim.food?.quantity || 'N/A'}</span>
                      </div>
                      <div className="meta-item">
                        <Clock size={16} />
                        <span>Claimed {formatDate(claim.claimedAt)}</span>
                      </div>
                      {claim.food?.location && (
                        <div className="meta-item">
                          <MapPin size={16} />
                          <span>Pickup location set</span>
                        </div>
                      )}
                    </div>

                    {claim.status === 'Approved' && (
                      <div className="claim-approved-info">
                        <AlertCircle size={16} />
                        <span>Contact the donor to arrange pickup!</span>
                      </div>
                    )}

                    {claim.status === 'Approved' && claim.food?.donor && (
                      <div className="donor-contact">
                        {claim.food.donor.email && (
                          <a href={`mailto:${claim.food.donor.email}`} className="contact-link">
                            <Mail size={14} />
                            <span>{claim.food.donor.email}</span>
                          </a>
                        )}
                        {claim.food.donor.phone && (
                          <a href={`tel:${claim.food.donor.phone}`} className="contact-link">
                            <Phone size={14} />
                            <span>{claim.food.donor.phone}</span>
                          </a>
                        )}
                      </div>
                    )}

                    {claim.status === 'Pending' && (
                      <div className="claim-pending-info">
                        <Clock size={16} />
                        <span>Waiting for donor approval...</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
