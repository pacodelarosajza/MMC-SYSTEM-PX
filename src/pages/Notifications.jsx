import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { FaRegBell, FaTimes } from 'react-icons/fa';

const apiIpAddress = import.meta.env.VITE_API_IP_ADDRESS;
const socket = io(`${apiIpAddress}`);

function App() {
  const [notifications, setNotifications] = useState(() => {
    // Obtener las notificaciones de localStorage al cargar la página
    const savedNotifications = JSON.parse(localStorage.getItem('notifications')) || [];
    return savedNotifications;
  });

  useEffect(() => {
    socket.on('dataUpdated', (data) => {
      const newNotification = {
        id: Date.now(),
        message: data.message,
      };
      const updatedNotifications = [...notifications, newNotification];
      setNotifications(updatedNotifications);
      // Guardar las notificaciones en localStorage
      localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
    });

    return () => {
      socket.off('dataUpdated');
    };
  }, [notifications]);

  const handleClose = (id) => {
    const updatedNotifications = notifications.filter(notification => notification.id !== id);
    setNotifications(updatedNotifications);
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-6">
      <h1 className="text-xs font-bold text-blue-300 mb-6 bg-gradient-to-r from-blue-500 to-blue-800 text-center py-2 px-6 rounded-full shadow-lg tracking-wide">
        <FaRegBell className="inline-block mr-2 text-1xl" />
        Notificaciones
      </h1>
      <div className="min-h-screen flex-auto items-center justify-center">
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="notification bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 p-6 rounded-lg shadow-xl ring-2 ring-blue-500 ring-opacity-60 transform transition-all duration-500 ease-in-out animate__animated animate__fadeIn"
            >
              <div className="flex items-center justify-between space-x-3">
                <div className="flex items-center space-x-3">
                  <FaRegBell className="text-blue-300 text-2xl" />
                  <span className="font-semibold text-1xl text-blue-200">{notification.message}</span>
                </div>
                <button
                  onClick={() => handleClose(notification.id)}
                  className="text-blue-300 text-2xl hover:text-blue-400 transition duration-200"
                >
                  <FaTimes />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
