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
    const apiIpAddress = import.meta.env.VITE_API_IP_ADDRESS;

    e.preventDefault();
    try {
      const response = await fetch(
        `${apiIpAddress}/api/users/userNum/${userNum}`
      );

      if (!response.ok) {
        throw new Error("User not found");
      }

      const user = await response.json();

      if (user && user.password === password) {
        // Guardar los datos del usuario en localStorage
        localStorage.setItem("loggedInUser", JSON.stringify(user));
        //alert("Login successful!");
        navigate("/dashboard"); // Redirige al Dashboard.jsx
      } else {
        setError("Incorrect user number or password");
      }
    } catch (err) {
      setError("Server error. Please try again later.");
    }
  };

  return (
    <div className="bg-pageBackground">
      <div className="login-main flex items-center justify-center min-h-screen p-10 gap-10">
        <div className="">
          <img src={Logo} alt="Logo" />
        </div>
        <div className="bg-loginBackgroundCard p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="login-right-container">
            <h2 className="text-2xl font-bold text-center text-lightWhiteLetter">
              Welcome to the MMC system.
            </h2>
            <p className="text-sm text-center login-line mt-4 text-lightGrayLetter">
              Material Monitoring and Progress System
              <br />
              MCM-Controller
            </p>
            <br />
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <label
                  htmlFor="userNum"
                  className="block text-sm font-medium text-lightWhiteLetter"
                >
                  User Number
                </label>
                <input
                  type="text"
                  id="userNum"
                  value={userNum}
                  onChange={(e) => setUserNum(e.target.value)}
                  className="border border-gray-500 focus:outline-none focus:border-blue-500
                  mt-1 block w-full px-3 py-2 rounded-md shadow-sm sm:text-base"
                  required
                />
              </div>
              <div className="mb-6 pass-input-div">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-lightWhiteLetter"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border border-gray-500 focus:outline-none focus:border-blue-500 mt-1 block w-full px-3 py-2 rounded-md shadow-sm sm:text-base"
                    required
                  />

                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer">
                    {showPassword ? (
                      <FaEyeSlash
                        onClick={() => setShowPassword(!showPassword)}
                      />
                    ) : (
                      <FaEye onClick={() => setShowPassword(!showPassword)} />
                    )}
                  </div>
                </div>
              </div>
              <div className="login-center-buttons">
                <button
                  type="submit"
                  className="bg-yaskawaBlue text-sm text-lightWhiteLetter border-2 border-yaskawaBlue rounded font-bold hover:shadow-lg hover:shadow-pageBackground w-full py-2 px-4 rounded-md"
                >
                  LOG IN
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
