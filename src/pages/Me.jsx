import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUser,
  FaEnvelope,
  FaCalendarAlt,
  FaUserShield,
  FaPowerOff,
  FaSun,
  FaMoon,
  FaKey,
} from "react-icons/fa"; // Actualizamos el icono a FaKey
import axios from "axios";

const Me = () => {
  const apiIpAddress = import.meta.env.VITE_API_IP_ADDRESS; // Aquí pones la dirección IP de tu API

  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Función para mapear el user_type_id a un tipo de usuario
  const getUserType = (userTypeId) => {
    switch (userTypeId) {
      case 1:
        return "Admin";
      case 2:
        return "Operacional";
      case 3:
        return "Visualizador";
      default:
        return "Desconocido";
    }
  };

  // Función para alternar entre modo claro/oscuro
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Obtener saludo personalizado basado en la hora del día
  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return "Good morning";
    if (hours < 18) return "Good afternoon";
    return "Good evening";
  };

  useEffect(() => {
    const loggedInUser = localStorage.getItem("loggedInUser");
    const lastLogin = localStorage.getItem("lastLogin");

    if (loggedInUser) {
      setUser(JSON.parse(loggedInUser));
      if (!lastLogin) {
        localStorage.setItem("lastLogin", new Date().toLocaleString());
      }
    } else {
      // Si no hay usuario en localStorage, redirige al login
      navigate("/");
    }
  }, [navigate]);

  // Función para cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    navigate("/");
  };

  // Función para abrir el modal de cambiar contraseña
  const openModal = () => {
    setIsModalOpen(true);
  };

  // Función para cerrar el modal
  const closeModal = () => {
    setIsModalOpen(false);
    setNewPassword("");
    setConfirmPassword("");
    setError("");
  };

  // Función para cambiar la contraseña
  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const userId = user.id; // ID del usuario del localStorage

    try {
      await axios.patch(`${apiIpAddress}/api/users/${userId}`, {
        password: newPassword,
      });
      alert("Password changed successfully");
      closeModal();
    } catch (error) {
      console.error("Error updating password:", error);
      setError("Failed to update password");
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div
      className={`${
        darkMode ? "bg-gray-900 text-white" : "bg-white text-black"
      } min-h-screen flex flex-col items-center justify-center`}
    >
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-3xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">
            {getGreeting()}, {user.name}!
          </h1>
          <button onClick={toggleDarkMode} className="text-xl">
            {darkMode ? <FaSun /> : <FaMoon />}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-gray-700 p-4 rounded-lg flex items-center space-x-4">
            <FaUserShield className="text-2xl text-blue-400" />
            <div>
              <p className="font-bold">User Type</p>
              <p>{getUserType(user.user_type_id)}</p>
            </div>
          </div>

          <div className="bg-gray-700 p-4 rounded-lg flex items-center space-x-4">
            <FaUser className="text-2xl text-blue-400" />
            <div>
              <p className="font-bold">User Number</p>
              <p>{user.user_number}</p>
            </div>
          </div>

          <div className="bg-gray-700 p-4 rounded-lg flex items-center space-x-4">
            <FaEnvelope className="text-2xl text-blue-400" />
            <div>
              <p className="font-bold">Email</p>
              <p>{user.email}</p>
            </div>
          </div>

          <div className="bg-gray-700 p-4 rounded-lg flex items-center space-x-4">
            <FaCalendarAlt className="text-2xl text-blue-400" />
            <div>
              <p className="font-bold">Created At</p>
              <p>{new Date(user.created_at).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="bg-gray-700 p-4 rounded-lg flex items-center space-x-4">
            <FaCalendarAlt className="text-2xl text-blue-400" />
            <div>
              <p className="font-bold">Last Updated</p>
              <p>{new Date(user.updated_at).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="bg-gray-700 p-4 rounded-lg flex items-center space-x-4">
            <FaCalendarAlt className="text-2xl text-blue-400" />
            <div>
              <p className="font-bold">Last Login</p>
              <p>{localStorage.getItem("lastLogin")}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-between">
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 flex items-center space-x-2 px-4 py-2 rounded-md font-medium"
          >
            <FaPowerOff />
            <span>Log Out</span>
          </button>
          <button
            onClick={openModal}
            className="bg-green-500 hover:bg-green-700 flex items-center space-x-2 px-4 py-2 rounded-md font-medium"
          >
            <FaKey />
            <span>Change Password</span>
          </button>
        </div>

        {/* Modal para cambiar contraseña */}
        {isModalOpen && (
          <div className="fixed z-10 inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">Change Password</h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleChangePassword();
                }}
              >
                <div className="mb-4">
                  <label className="block text-sm font-bold mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-black" // Cambiamos el color del texto del input a negro
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-bold mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-black" // Cambiamos el color del texto del input a negro
                    required
                  />
                </div>
                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Me;
