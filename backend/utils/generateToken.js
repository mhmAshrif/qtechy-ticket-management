const jwt = require('jsonwebtoken');

// We pack the user's ID and Role inside the token so we know exactly who they are
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d', // The token expires in 30 days
  });
};

module.exports = generateToken;