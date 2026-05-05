const Claim = require('../models/Claim');
const Food = require('../models/Food');
const User = require('../models/User');
const { sendClaimNotification, sendClaimStatusUpdate } = require('../utils/emailService');

exports.createClaim = async (req, res) => {
  try {
    const { foodId } = req.body;
    if (!foodId) return res.status(400).json({ message: 'foodId is required' });

    const food = await Food.findById(foodId);
    if (!food) return res.status(404).json({ message: 'Food not found' });
    if (food.status !== 'Available') {
      return res.status(400).json({ message: 'Food is not available' });
    }
    if (food.donorId === req.user.id) {
      return res.status(400).json({ message: 'Donor cannot claim own food' });
    }

    // Check for existing claim
    const existing = await Claim.findExisting(foodId, req.user.id);
    if (existing) return res.status(400).json({ message: 'Claim already submitted' });

    const claim = await Claim.create({ foodId, receiverId: req.user.id });

    // Send email notification to donor
    const receiver = await User.findById(req.user.id);
    const donor = await User.findById(food.donorId);
    
    if (donor?.email) {
      sendClaimNotification(
        donor.email,
        donor.name,
        food.foodName,
        receiver.name,
        receiver.email,
        receiver.phone
      ).catch(err => console.error('Failed to send notification:', err));
    }

    res.status(201).json(claim);
  } catch (error) {
    console.error('Create claim error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateClaimStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (status !== 'Approved') {
      return res.status(400).json({ message: 'Only Approved status is allowed' });
    }

    const claim = await Claim.findById(id);
    if (!claim) return res.status(404).json({ message: 'Claim not found' });

    const food = await Food.findById(claim.foodId);
    if (food.donorId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this claim' });
    }

    // Update claim status
    const updatedClaim = await Claim.updateStatus(id, status);

    // Update food status to Claimed
    if (status === 'Approved') {
      await Food.updateStatus(claim.foodId, food.donorId, 'Claimed');
    }

    // Send email notification to receiver
    const donor = await User.findById(req.user.id);
    const receiver = await User.findById(claim.receiverId);
    
    if (receiver?.email) {
      sendClaimStatusUpdate(
        receiver.email,
        receiver.name,
        food.foodName,
        status,
        donor.name,
        donor.phone
      ).catch(err => console.error('Failed to send status update:', err));
    }

    res.json(updatedClaim);
  } catch (error) {
    console.error('Update claim error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.myClaims = async (req, res) => {
  try {
    const claims = await Claim.findByReceiverId(req.user.id);
    res.json(claims);
  } catch (error) {
    console.error('My claims error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get claims for receiver (without strict role check - returns empty for donors)
exports.myClaimsAsReceiver = async (req, res) => {
  try {
    const claims = await Claim.findByReceiverId(req.user.id);
    res.json(claims);
  } catch (error) {
    console.error('My claims as receiver error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get claims on donor's food items
exports.claimsOnMyFood = async (req, res) => {
  try {
    const claims = await Claim.findByFoodDonorId(req.user.id);
    res.json(claims);
  } catch (error) {
    console.error('Claims on my food error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};
