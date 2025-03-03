import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  
  if(!token) {
    return res.status(401).json({ message: 'Access denied, no token given'});
  }

  try {
    const decode = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = decode;
    next();
  } catch(error) {
    res.status(400).json({ message: 'Invalid token' });
  }
};