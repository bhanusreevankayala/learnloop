const User = require('../models/User');
const Class = require('../models/Class');
const { generateToken } = require('../middleware/auth');

/* =========================
   REGISTER
========================= */
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, joinCode, subjects, grade } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      subjects,
      grade
    });

    // Enroll student in class (if joinCode provided)
    if (role === 'student' && joinCode) {
      const cls = await Class.findOne({ joinCode: joinCode.toUpperCase() });

      if (cls) {
        cls.students.push(user._id);
        await cls.save();

        user.enrolledClasses.push(cls._id);
        await user.save();
      }
    }

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user
    });

  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: err.message
    });
  }
};

/* =========================
   LOGIN (FIXED - NO CRASH)
========================= */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email })
      .populate('enrolledClasses', 'name subject grade')
      .populate('teachingClasses', 'name subject grade');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account deactivated. Contact admin.'
      });
    }

    // SAFE PASSWORD CHECK (prevents 502 crash)
    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required'
      });
    }

    // IMPORTANT: protect against missing method crash
    if (!user.comparePassword) {
      console.error("comparePassword method missing in User model");
      return res.status(500).json({
        success: false,
        message: 'Server configuration error'
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: err.message
    });
  }
};

/* =========================
   GET ME
========================= */
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('enrolledClasses', 'name subject grade teacher coverColor')
      .populate('teachingClasses', 'name subject grade students coverColor');

    res.json({
      success: true,
      user
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: err.message
    });
  }
};

/* =========================
   UPDATE PROFILE
========================= */
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, grade, subjects, avatar } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, grade, subjects, avatar },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      user
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Profile update failed',
      error: err.message
    });
  }
};

/* =========================
   CHANGE PASSWORD
========================= */
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.comparePassword) {
      return res.status(500).json({
        success: false,
        message: 'Server error (auth method missing)'
      });
    }

    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password updated successfully'
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Password change failed',
      error: err.message
    });
  }
};