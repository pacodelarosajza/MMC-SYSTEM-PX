import React, { useState } from "react";
import Logo from "../assets/layout_set_logo.png";
import { FaEye, FaEyeSlash } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [userNum, setUserNum] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://10.12.6.181:3001/api/users/userNum/${userNum}`);
      
      if (!response.ok) {
        throw new Error("User not found");
      }

      const user = await response.json();

      if (user && user.password === password) {
        // Guardar los datos del usuario en localStorage
        localStorage.setItem("loggedInUser", JSON.stringify(user));
        alert("Login successful!");
        navigate('/dashboard'); // Redirige al Dashboard.jsx
      } else {
        setError("Incorrect user number or password");
      }
    } catch (err) {
      setError("Server error. Please try again later.");
    }
  };

  return (
    <div className="login-main flex items-center justify-center min-h-screen bg-gray-100">
      <div className="login-left">
        <img src={Logo} alt="Logo" />
      </div>
      <div className="login-right bg-white p-8 rounded shadow-md max-w-md w-full">
        <div className="login-right-container">
          <h2 className="text-2xl font-bold mb-6">Welcome to MCM System</h2>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label htmlFor="userNum" className="block text-sm font-medium text-gray-700">
                User Number
              </label>
              <input
                type="text"
                id="userNum"
                value={userNum}
                onChange={(e) => setUserNum(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>
            <div className="mb-6 pass-input-div">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
              {showPassword ? (
                <FaEyeSlash className="cursor-pointer" onClick={() => setShowPassword(!showPassword)} />
              ) : (
                <FaEye className="cursor-pointer" onClick={() => setShowPassword(!showPassword)} />
              )}
            </div>
            <div className="login-center-options">
              <a href="forgotpass" onClick={() => navigate("/forgotpass")} className="forgot-pass-link">
                Forgot password?
              </a>
            </div>
            <div className="login-center-buttons">
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
              >
                Log In
              </button>
            </div>
          </form>
          <div className="login-line mt-4">
            <p>Material Monitoring and Progress System MCM-Controller</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
