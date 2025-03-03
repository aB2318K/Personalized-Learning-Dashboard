import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Date formatting
export const formatToUKDate = (date) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

// Password handling
export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePasswords = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

// JWT Tokens
export const generateToken = (user) => {
  return jwt.sign(
    { id: user.id }, 
    process.env.JWT_SECRET_KEY, 
    { expiresIn: '2h' }
  );
};

export const generateSecretToken = (user) => {
  return jwt.sign(
    { id: user.id },
    process.env.JWT_RESET_SECRET_KEY,
    { expiresIn: '2h' }
  );
};