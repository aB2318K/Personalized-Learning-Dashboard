import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function NewPassword() {
  const params = useParams(); 
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [matchError, setMatchError] = useState("");
  const [reEnter, setReEnter] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [isTokenValid, setIsTokenValid] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const passwordValidator = () => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      setPasswordError(
        "*Your password must be at least 8 characters long and include one uppercase letter, one lowercase letter, one number, and one special character"
      );
      return false;
    } else {
      setPasswordError("");
      return true;
    }
  };

  const passwordMatchValidator = () => {
    if (password !== reEnter) {
      setMatchError("*Passwords do not match");
      return false;
    } else {
      setMatchError("");
      return true;
    }
  };

  const getResetToken = async (resetId) => {
    try {
      const response = await fetch(`https://personalized-learning-dashboard.onrender.com/reset-password?resetId=${resetId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (response.ok && data) {
        setResetToken(data);
        setIsTokenValid(true);
      } else {
        setIsTokenValid(false);
        setErrorMessage(
          "The link you used to reset the password is either expired or invalid. Please request a new one."
        );
      }
    } catch (error) {
      console.error("Error:", error);
      setIsTokenValid(false);
      setErrorMessage("An error occurred while verifying the reset link.");
    } 
  };

  useEffect(() => {
    const resetId = params.id
    if (resetId) {
      getResetToken(resetId);
    }
  }, [params.id]);

  const handleSubmission = async (event) => {
    event.preventDefault();
    const isPasswordValid = passwordValidator();
    const isMatching = passwordMatchValidator();
    if (isPasswordValid && isMatching && resetToken) {
      try {
        const requestData = {
          newPassword: password,
          resetToken: resetToken,
        };

        const response = await fetch(`https://personalized-learning-dashboard.onrender.com/reset-password`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resetToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        });

        const data = await response.json();

        if (response.ok) {
          setSuccessMessage(
            "You have successfully updated your password. Redirecting to Log In page"
          );
          setTimeout(() => {
            window.location.href = "/login";
          }, 3000);
        } else {
          setPassword("");
          if (data.sameMessage) {
            setPasswordError(data.sameMessage);
          } else {
            setPasswordError(data.message);
          }
        }
      } catch (error) {
        console.error("Error updating password:", error);
        setPasswordError("An error occurred while updating password.");
      }
    }
  };

  if (!isTokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-gray-800 text-center mb-4">
            Reset Link Invalid
          </h2>
          <p className="text-center text-red-600">{errorMessage}</p>
          <p className="text-center mt-4">
            <a href="/login" className="text-gray-500 hover:underline">
              Go back to login
            </a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold text-gray-800 text-center mb-4">
          Create New Password
        </h2>
        <form role="form" onSubmit={handleSubmission} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              New Password:
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-600 focus:border-gray-600"
            />
            {passwordError && <p className="text-xs text-red-600 mt-1">{passwordError}</p>}
          </div>
          <div>
            <label htmlFor="reEnter" className="block text-sm font-medium text-gray-700">
              Re-enter Password:
            </label>
            <input
              type="password"
              id="reEnter"
              value={reEnter}
              onChange={(e) => setReEnter(e.target.value)}
              placeholder="Re-enter your password"
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-600 focus:border-gray-600"
            />
            {matchError && <p className="text-xs text-red-600 mt-1">{matchError}</p>}
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600"
          >
            Update Password
          </button>
          {successMessage && (
            <p className="text-center bg-gray-100 text-gray-700 mt-4 py-2 px-4 rounded-lg">
              {successMessage}
            </p>
          )}
        </form>
        <p className="mt-4 text-center text-sm text-gray-700">
          <a href="/login" className="text-gray-500 hover:underline">
            Back to log in
          </a>
        </p>
      </div>
    </main>
  );
}

export default NewPassword;
