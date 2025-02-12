import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function SignUp() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstNameError, setFirstNameError] = useState("");
  const [lastNameError, setLastNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const fieldValidator = (value, setError) => {
    if (value.trim().length === 0) {
      setError("*This field is required");
      return false;
    }
    setError("");
    return true;
  };

  const emailValidator = () => {
    const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
    if (!emailRegex.test(email)) {
      setEmailError("*Please provide a valid email address in the format: example@domain.com");
      return false;
    }
    setEmailError("");
    return true;
  };

  const passwordValidator = () => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      setPasswordError(
        "*Password must be at least 8 characters long and include one uppercase letter, one lowercase letter, one number, and one special character"
      );
      return false;
    }
    setPasswordError("");
    return true;
  };

  const handleSubmission = async (event) => {
    event.preventDefault();
    const isFirstNameValid = fieldValidator(firstName, setFirstNameError);
    const isLastNameValid = fieldValidator(lastName, setLastNameError);
    const isEmailValid = emailValidator();
    const isPasswordValid = passwordValidator();

    if (isFirstNameValid && isLastNameValid && isEmailValid && isPasswordValid) {
      try {
        const requestData = {
          firstname: firstName,
          lastname: lastName,
          email,
          password,
        };

        const response = await fetch("https://personalized-learning-dashboard.onrender.com/signup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        });
        console.log('Response Status:', response.status);
        const data = await response.json();

        if (response.ok) {
          setSuccessMessage("Account created successfully! Redirecting to login...");
          setTimeout(() => {
            navigate("/login");
          }, 3000);
        } else {
          setEmailError(data.message || "An error occurred while signing up.");
        }
      } catch (error) {
        console.error("Error:", error);
        setEmailError("An error occurred while trying to sign up.");
      }
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold text-gray-800 text-center mb-4">Sign Up</h2>
        <form role="form" onSubmit={handleSubmission} className="space-y-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
              First Name:
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Enter your first name"
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-600 focus:border-gray-600"
            />
            {firstNameError && <p className="error_message text-xs text-red-600 mt-1">{firstNameError}</p>}
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
              Last Name:
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Enter your last name"
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-600 focus:border-gray-600"
            />
            {lastNameError && <p className="error_message text-xs text-red-600 mt-1">{lastNameError}</p>}
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email:
            </label>
            <input
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-600 focus:border-gray-600"
            />
            {emailError && <p className="error_message text-xs text-red-600 mt-1">{emailError}</p>}
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password:
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-600 focus:border-gray-600"
            />
            {passwordError && <p className="error_message text-xs text-red-600 mt-1">{passwordError}</p>}
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600"
          >
            Sign Up
          </button>
        </form>
        {!successMessage && (
          <p className="mt-4 text-center text-sm text-gray-700">
            Already have an account?{" "}
            <Link to="/login" className="text-gray-500 hover:underline">
              Log in here
            </Link>
          </p>
        )}
        {successMessage && (
          <p className="success_message text-center bg-gray-100 text-gray-700 mt-4 py-2 px-4 rounded-lg">
            {successMessage}
          </p>
        )}
      </div>
    </main>
  );
}

export default SignUp;
