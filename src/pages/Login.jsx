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
    setError(null); // Reset error state when user starts a new login attempt
  
    // Validar que los campos no estén vacíos
    if (!userNum || !password) {
      setError("Please enter your user number and password.");
      return;
    }
  
    const apiIpAddress = import.meta.env.VITE_API_IP_ADDRESS;
  
    try {
      // Solicitar datos del usuario por número de usuario
      const response = await fetch(`${apiIpAddress}/api/users/userNum/${userNum}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
  
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("User not found. Please check your user number.");
        }
        throw new Error("Failed to fetch user data. Please try again later.");
      }
  
      const user = await response.json();
  
      // Verificar si la contraseña coincide
      if (user && user.password === password) {
        // Guardar el usuario en localStorage
        localStorage.setItem("loggedInUser", JSON.stringify(user));
  
        // Redirigir al dashboard
        navigate("/dashboard");
  
        // Forzar refresh después de la redirección
        window.location.reload();
      } else {
        setError("Incorrect user number or password.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Server error. Please try again later.");
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
                      color="gray" onClick={() => setShowPassword(!showPassword)}
                      />
                    ) : (
                      <FaEye color="gray" onClick={() => setShowPassword(!showPassword)} />
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