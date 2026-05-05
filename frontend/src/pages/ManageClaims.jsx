import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, 
  Clock, 
  User, 
  Mail, 
  Phone,
  CheckCircle, 
  XCircle, 
  Loader2,
  AlertCircle,
  RefreshCw,
  Filter
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import './ManageClaims.css';

export default function ManageClaims() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // all, pending, approved
  const [actionLoading, setActionLoading] = useState(null); // claimId being processed

  const fetchClaims = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await api.get('/claims/on-my-food');
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

  const handleUpdateStatus = async (claimId, status) => {
    setActionLoading(claimId);
    try {
      await api.patch(`/claims/${claimId}/status`, { status });
      toast.success(`Claim ${status.toLowerCase()} successfully!`);
      // Update local state
      setClaims(prev => prev.map(c => 
        c.id === claimId ? { ...c, status } : c
      ));
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update claim');
    } finally {
      setActionLoading(null);
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return 'success';
      case 'Rejected': return 'error';
      default: return 'warning';
    }
  };

  const filteredClaims = claims.filter(claim => {
    if (filter === 'all') return true;
    return claim.status.toLowerCase() === filter;
  });

  const pendingCount = claims.filter(c => c.status === 'Pending').length;

  // Build image URL helper
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    return imageUrl.startsWith('http') 
      ? imageUrl 
      : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${imageUrl}`;
  };

  if (loading) {
    return (
      <div className="manage-claims-page">
        <div className="container">
          <div className="loading-state">
            <Loader2 size={48} className="spin" />
            <p>Loading claims...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="manage-claims-page">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="manage-header">
            <div className="header-content">
              <h1>Manage Claims</h1>
              <p>Review and respond to food claim requests</p>
              {pendingCount > 0 && (
                <div className="pending-alert">
                  <AlertCircle size={18} />
                  <span>{pendingCount} pending claim{pendingCount > 1 ? 's' : ''} awaiting your response</span>
                </div>
              )}
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

          {/* Filter Tabs */}
          <div className="filter-tabs">
            <button 
              className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All ({claims.length})
            </button>
            <button 
              className={`filter-tab ${filter === 'pending' ? 'active' : ''}`}
              onClick={() => setFilter('pending')}
            >
              Pending ({claims.filter(c => c.status === 'Pending').length})
            </button>
            <button 
              className={`filter-tab ${filter === 'approved' ? 'active' : ''}`}
              onClick={() => setFilter('approved')}
            >
              Approved ({claims.filter(c => c.status === 'Approved').length})
            </button>
          </div>

          {/* Claims List */}
          {filteredClaims.length === 0 ? (
            <div className="empty-state">
              <Package size={64} />
              <h3>No Claims Found</h3>
              <p>
                {filter === 'all' 
                  ? "You don't have any claims on your food items yet."
                  : `No ${filter} claims found.`
                }
              </p>
            </div>
          ) : (
            <div className="claims-list">
              <AnimatePresence>
                {filteredClaims.map((claim, index) => (
                  <motion.div
                    key={claim.id}
                    className={`claim-card ${claim.status.toLowerCase()}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    {/* Food Info */}
                    <div className="claim-food">
                      <div className="food-image">
                        {claim.food?.imageUrl ? (
                          <img 
                            src={getImageUrl(claim.food.imageUrl)} 
                            alt={claim.food?.foodName} 
                          />
                        ) : (
                          <div className="food-emoji">
                            {['🍕', '🍔', '🥗', '🍱', '🍜'][index % 5]}
                          </div>
                        )}
                      </div>
                      <div className="food-details">
                        <h3>{claim.food?.foodName || 'Food Item'}</h3>
                        <p className="food-quantity">
                          <Package size={14} />
                          {claim.food?.quantity}
                        </p>
                      </div>
                    </div>

                    {/* Receiver Info */}
                    <div className="claim-receiver">
                      <h4>Requested by</h4>
                      <div className="receiver-info">
                        <div className="receiver-avatar">
                          {claim.receiver?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="receiver-details">
                          <span className="receiver-name">
                            <User size={14} />
                            {claim.receiver?.name || 'Unknown'}
                          </span>
                          {claim.receiver?.email && (
                            <span className="receiver-email">
                              <Mail size={14} />
                              {claim.receiver.email}
                            </span>
                          )}
                          {claim.receiver?.phone && (
                            <span className="receiver-phone">
                              <Phone size={14} />
                              {claim.receiver.phone}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="claim-time">
                        <Clock size={14} />
                        Claimed {formatDate(claim.claimedAt)}
                      </p>
                    </div>

                    {/* Status & Actions */}
                    <div className="claim-actions">
                      <span className={`status-badge ${getStatusColor(claim.status)}`}>
                        {claim.status === 'Approved' && <CheckCircle size={16} />}
                        {claim.status === 'Pending' && <Clock size={16} />}
                        {claim.status}
                      </span>

                      {claim.status === 'Pending' && (
                        <div className="action-buttons">
                          <button
                            className="btn btn-success"
                            onClick={() => handleUpdateStatus(claim.id, 'Approved')}
                            disabled={actionLoading === claim.id}
                          >
                            {actionLoading === claim.id ? (
                              <Loader2 size={18} className="spin" />
                            ) : (
                              <CheckCircle size={18} />
                            )}
                            Approve
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
