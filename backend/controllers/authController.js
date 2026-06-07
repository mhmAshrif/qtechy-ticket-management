const User = require('../models/User');
const generateToken = require('../utils/generateToken');

const registerUser = async (req, res) => {
  try {
    console.log('Register route hit. Headers:', req.headers);
    console.log('Register body:', req.body);
    const { name, email, password, role } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    // Check if user already exists
    try {
      const userExists = await User.findOne({ email }).maxTimeMS(10000);
      if (userExists) {
        return res.status(400).json({ success: false, message: 'User already exists' });
      }
    } catch (err) {
      console.error('Database operation timeout:', err.message);
      return res.status(500).json({ success: false, message: 'Database operation timed out. Please try again.' });
    }

    // Create the new user in MongoDB
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'User',
    });

    if (user) {
      res.status(201).json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          token: generateToken(user._id, user.role),
        }
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid user data' });
    }
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: error.message || 'Registration failed. Please try again.' });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // Find user by email with timeout
    let user;
    try {
      user = await User.findOne({ email }).maxTimeMS(10000);
    } catch (err) {
      console.error('Database operation timeout:', err.message);
      return res.status(500).json({ success: false, message: 'Database operation timed out. Please try again.' });
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check password
    const isPasswordMatched = await user.matchPassword(password);
    if (!isPasswordMatched) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role),
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: error.message || 'Login failed. Please try again.' });
  }
};

module.exports = { registerUser, loginUser };