const Food = require('../models/Food');

exports.createFood = async (req, res) => {
  try {
    const { foodName, description, quantity, expiryTime, latitude, longitude } = req.body;
    if (!foodName || !quantity || !expiryTime || latitude == null || longitude == null) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Handle optional image upload
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const food = await Food.create({
      donorId: req.user.id,
      foodName,
      description: description || null,
      quantity,
      expiryTime: new Date(expiryTime),
      imageUrl,
      latitude: Number(latitude),
      longitude: Number(longitude),
    });

    res.status(201).json(food);
  } catch (error) {
    console.error('Create food error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getNearbyFood = async (req, res) => {
  try {
    const { latitude, longitude, maxDistance = 5000 } = req.query;
    if (latitude == null || longitude == null) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    // Use PostGIS geospatial query
    const foods = await Food.findNearby(
      Number(latitude),
      Number(longitude),
      Number(maxDistance)
    );

    res.json(foods);
  } catch (error) {
    console.error('Nearby food error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateFoodStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowed = ['Available', 'Claimed', 'Expired', 'Completed'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // First verify the food belongs to the donor
    const food = await Food.findById(id);
    if (!food || food.donorId !== req.user.id) {
      return res.status(404).json({ message: 'Food not found' });
    }

    const updatedFood = await Food.updateStatus(id, req.user.id, status);
    res.json(updatedFood);
  } catch (error) {
    console.error('Update food error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.myFoods = async (req, res) => {
  try {
    const foods = await Food.findByDonorId(req.user.id);
    res.json(foods);
  } catch (error) {
    console.error('My foods error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};
