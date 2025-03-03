import User from '../models/User.js';
import { 
  comparePasswords, 
  generateToken, 
  hashPassword 
} from '../utils/helpers.js';

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const currentUser = await User.findOne({ email });
    
    if (!currentUser) {
      return res.status(404).json({ 
        message: 'User cannot be found' 
      });
    }

    const isPasswordValid = await comparePasswords(password, currentUser.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ 
        message: 'Access denied, passwords do not match' 
      });
    }

    const token = generateToken(currentUser);
    
    res.status(200).json({
      message: 'Login was successful',
      token,
      userID: currentUser._id
    });
    
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(400).json({ 
      message: 'Error during login', 
      error: error.message 
    });
  }
};

export const signUpUser = async (req, res) => {
  const { firstname, lastname, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      return res.status(409).json({ 
        message: '*This email is already registered. Try logging in instead.' 
      });
    }

    const hashedPassword = await hashPassword(password);

    const newUser = new User({
      firstname,
      lastname,
      email,
      password: hashedPassword
    });

    const savedUser = await newUser.save();
    
    res.status(201).json({
      message: 'Registration was successful',
      user: {
        _id: savedUser._id,
        firstname: savedUser.firstname,
        lastname: savedUser.lastname,
        email: savedUser.email
      }
    });
    
  } catch (error) {
    console.error('Signup error:', error.message);
    res.status(500).json({ 
      message: 'An error occurred during sign up', 
      error: error.message 
    });
  }
};