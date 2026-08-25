const jwt = require('jsonwebtoken');

const isProduction = process.env.NODE_ENV === 'production';

const generateToken = (res, userId) => {
  const token = jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );

  res.cookie('jwt', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });

  return token;
};

const clearToken = (res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    expires: new Date(0),
  });
};

module.exports = { generateToken, clearToken };