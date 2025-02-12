import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Reset() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const emailValidator = () => {
    const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
    if (!emailRegex.test(email)) {
      setEmailError('*Please provide a valid email address in the format: example@domain.com');
      return false;
    } else {
      setEmailError('');
      return true;
    }
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setEmailError('');
    setSuccessMessage('');
  };

  const handleSubmission = async (event) => {
    event.preventDefault();
    const isEmailValid = emailValidator();

    if (isEmailValid) {
      try {
        const requestData = { email };

        const response = await fetch('https://personalized-learning-dashboard.onrender.com/reset', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData),
        });

        if (response.ok) {
          setSuccessMessage('A password reset link has been sent to your email');
        } else if (response.status === 404) {
          setEmailError('*Email not found. Please check for typos or create a new account.');
        } else {
          setEmailError('*There was an error. Please try again later');
        }
      } catch (error) {
        console.error('Error:', error);
        setEmailError('An error occurred while trying to reset the password.');
      }
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold text-gray-800 text-center mb-4">
          Reset Password
        </h2>
        <form role="form" onSubmit={handleSubmission} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email:
            </label>
            <input
              name="email"
              id="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="Enter your email"
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
            {emailError && (
              <p className="error_message text-xs text-red-600 mt-1">{emailError}</p>
            )}
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600"
          >
            Send Link
          </button>
        </form>

        {successMessage && (
          <p className="success_message text-center bg-gray-100 text-gray-700 mt-4 py-2 px-4 rounded-lg">
            {successMessage}
          </p>
        )}

        <p className="mt-4 text-center text-sm text-gray-700">
          <Link to="/login" className="text-gray-500 hover:underline">
            Back to log in
          </Link>
        </p>
      </div>
    </main>
  );
}

export default Reset;
