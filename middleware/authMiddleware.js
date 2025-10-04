// const jwt = require('jsonwebtoken');
// const User = require('../models/User');

// const authMiddleware = (roles = []) => async (req, res, next) => {
//   try {
//     // Debug log the header
//     console.log('Authorization header:', req.headers.authorization);

//     const token = req.headers.authorization?.split(' ')[1];
//     if (!token) return res.status(401).json({ error: 'No token provided' });

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const user = await User.findById(decoded.id);
//     if (!user) return res.status(401).json({ error: 'User not found' });

//     if (roles.length && !roles.includes(user.role)) {
//       console.log('User role:', user.role);
//   return res.status(403).json({ error: 'Forbidden' });
// }

//     req.user = { 
//       userId: user._id.toString(),
//       id: user.refId.toString(), // teacher/student id
//       role: user.role 
//     };
//   // refId is teacher/student/profile id
//     next();
//   } catch (err) {
//     // console.error('JWT error:', err.message);
//     // console.log(process.env.JWT_SECRET)
//     return res.status(401).json({ error: 'Invalid token' });
//   }
// };

// module.exports = authMiddleware;



const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = (roles = []) => async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' });

    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ error: 'User not found' });

const cleanRole = (role) => {
  if (!role) return "";
  return String(role).replace(/['"]+/g, '').trim().toLowerCase();
};

const normalizedUserRole = cleanRole(user.role);
const normalizedRoles = roles.map(r => cleanRole(r));

if (normalizedRoles.length > 0 && !normalizedRoles.includes(normalizedUserRole)) {
  // console.log('User role not allowed:', `"${user.role}" after clean and trim`);
  // console.log('User role check passed:', normalizedUserRole);
  // console.log('Allowed roles:', normalizedRoles);
  return res.status(403).json({ error: 'Forbidden' });
}


// console.log('User role:', JSON.stringify(user.role));
// console.log('Allowed roles:', roles);


    req.user = {
      userId: user._id.toString(),
      id: user.refId.toString(), // teacher/student/profile id
      role: user.role
    };

    next();
  } catch (err) {
    // console.log('Auth error:', err.message);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = authMiddleware;