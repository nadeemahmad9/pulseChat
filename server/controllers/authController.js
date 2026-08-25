const User = require('../models/User');
const Otp = require('../models/Otp');
const { generateToken, clearToken } = require('../utils/jwt');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, username, email, password, avatar, phone } = req.body;

    if (!name || !username || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields (name, username, email, password)' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanUsername = username.toLowerCase().trim();

    const existingEmail = await User.findOne({ email: cleanEmail });
    if (existingEmail) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }

    const existingUsername = await User.findOne({ username: cleanUsername });
    if (existingUsername) {
      return res.status(400).json({ message: 'Username is already taken' });
    }

    if (phone) {
      const existingPhone = await User.findOne({ phone: phone.trim() });
      if (existingPhone) {
        return res.status(400).json({ message: 'An account with this phone number already exists' });
      }
    }

    const user = await User.create({
      name: name.trim(),
      username: cleanUsername,
      email: cleanEmail,
      password,
      avatar: avatar || '',
      phone: phone ? phone.trim() : undefined,
    });

    generateToken(res, user._id);

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      message: 'Registration successful',
      user: userResponse,
    });
  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({ message: error.message || 'Server registration error' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    generateToken(res, user._id);

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      message: 'Login successful',
      user: userResponse,
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: error.message || 'Server login error' });
  }
};

// @desc    Send simulated mobile OTP
// @route   POST /api/auth/send-otp
// @access  Public
const sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    const cleanPhone = phone.trim();

    // Check resend cooldown (if an OTP was created less than 30 seconds ago)
    const existingOtp = await Otp.findOne({ phone: cleanPhone });
    if (existingOtp) {
      const secondsPassed = (Date.now() - new Date(existingOtp.createdAt).getTime()) / 1000;
      if (secondsPassed < 30) {
        return res.status(429).json({ message: `Please wait ${Math.ceil(30 - secondsPassed)} seconds before requesting a new OTP` });
      }
      await Otp.deleteOne({ phone: cleanPhone });
    }

    // Generate 6-digit OTP code
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

    await Otp.create({
      phone: cleanPhone,
      otp: generatedOtp,
    });

    console.log(`[SIMULATED SMS OTP] Sent OTP ${generatedOtp} to phone number: ${cleanPhone}`);

    res.status(200).json({
      message: 'OTP sent successfully to mobile number',
      phone: cleanPhone,
      // In dev mode, return OTP in payload so user can test seamlessly
      devOtp: process.env.NODE_ENV === 'production' ? undefined : generatedOtp,
    });
  } catch (error) {
    console.error('Send OTP Error:', error);
    res.status(500).json({ message: error.message || 'Server error sending OTP' });
  }
};

// @desc    Verify mobile OTP & login/register
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOtp = async (req, res) => {
  try {
    const { phone, otp, name } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ message: 'Phone number and OTP code are required' });
    }

    const cleanPhone = phone.trim();
    const otpRecord = await Otp.findOne({ phone: cleanPhone, otp: otp.trim() });

    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP code' });
    }

    // Invalidate OTP after use
    await Otp.deleteOne({ _id: otpRecord._id });

    // Check if user exists with phone
    let user = await User.findOne({ phone: cleanPhone });

    if (!user) {
      // Create new account if user does not exist
      const generatedUsername = 'user_' + Math.random().toString(36).substring(2, 9);
      const generatedEmail = `${cleanPhone.replace(/[^0-9]/g, '')}@pulsechat.local`;
      const generatedPassword = Math.random().toString(36).slice(-10) + 'A1!';

      user = await User.create({
        name: name ? name.trim() : `User ${cleanPhone.slice(-4)}`,
        username: generatedUsername,
        email: generatedEmail,
        phone: cleanPhone,
        password: generatedPassword,
        bio: 'Hey there! I am using PulseChat.',
      });
    }

    generateToken(res, user._id);

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      message: 'Mobile OTP verification successful',
      user: userResponse,
    });
  } catch (error) {
    console.error('Verify OTP Error:', error);
    res.status(500).json({ message: error.message || 'Server error verifying OTP' });
  }
};

// @desc    Logout user & clear cookie
// @route   POST /api/auth/logout
// @access  Public
const logout = async (req, res) => {
  try {
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, { isOnline: false, lastSeen: new Date() });
    }
    clearToken(res);
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server logout error' });
  }
};

// @desc    Get authenticated user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('blockedUsers', '_id name username avatar')
      .populate('pinnedConversations')
      .populate('archivedConversations')
      .populate('mutedConversations');

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching user profile' });
  }
};

module.exports = {
  register,
  login,
  sendOtp,
  verifyOtp,
  logout,
  getMe,
};
