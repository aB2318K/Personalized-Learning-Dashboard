import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';

function LogIn() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const fieldValidator = (userInput, setError) => {
        if (userInput.trim().length === 0) {
            setError('*This field is required');
            return false;
        } else {
            setError('');
            return true;
        }
    };
    
    const handleEmailChange = (e) => {
        setEmail(e.target.value);
        setEmailError('');
        setSuccessMessage('');
    };
    
    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
        setPasswordError('');
        setSuccessMessage('');
    };   

    const handleSubmission = async (event) => {
        event.preventDefault(); 
        const isEmailValid = fieldValidator(email, setEmailError);
        const isPasswordValid = fieldValidator(password, setPasswordError);

        if (isEmailValid && isPasswordValid) {
            try {
                const requestData = {
                    email,
                    password,
                };
          
                const response = await fetch('https://personalized-learning-dashboard.onrender.com/login', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(requestData),
                });
          
                const data = await response.json();
                if (response.ok) {
                    const expirationTime = Date.now() + 2 * 60 * 60 * 1000; // 2 hours
                    setSuccessMessage('You have successfully logged in.');
                    localStorage.setItem('userID', data.userID);
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('tokenExpiration', expirationTime.toString());
                    const token = localStorage.getItem('token');
                    if (token) {
                        setTimeout(() => {
                            navigate('/dashboard')
                          }, 1000);
                    }
                } else if (response.status === 404) {
                  setEmailError('*This email address was not found. Please check for typos or create a new account.');
                } else {
                    setPasswordError('*Incorrect password. Please try again or reset your password.')
                }
              } catch (error) {
                console.error('Error:', error);
                setEmailError('An error occurred while trying to sign up.');
              }
           
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-800 text-center mb-4">
              Log In
            </h2>
            <form role="form" onSubmit={handleSubmission} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email:
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={handleEmailChange}
                  name="email"
                  placeholder="Enter your email"
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-600 focus:border-gray-600"
                />
                {emailError && (
                  <p className="error_message text-xs text-red-600 mt-1">
                    {emailError}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password:
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={handlePasswordChange}
                  name="password"
                  placeholder="Enter your password"
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-600 focus:border-gray-600"
                />
                {passwordError && (
                  <p className="error_message text-xs text-red-600 mt-1">
                    {passwordError}
                  </p>
                )}
              </div>
              <button
                type="submit"
                className="w-full py-2 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600"
              >
                Log In
              </button>
            </form>
            {!successMessage && (
              <div className="text-center mt-4">
                <a
                  href="/reset-password"
                  className="text-sm text-gray-500 hover:underline"
                >
                  Forgotten Password?
                </a>
              </div>
            )}
            {!successMessage && (
              <p className="mt-4 text-center text-sm text-gray-700">
                Don&apos;t have an account?{" "}
                <a href="/signup" className="text-gray-500 hover:underline">
                  Register here
                </a>
              </p>
            )}
            {successMessage && (
              <p className="text-center bg-gray-100 text-gray-700 mt-4 py-2 px-4 rounded-lg">
                {successMessage}
              </p>
            )}
          </div>
        </main>
    );
}

export default LogIn;
