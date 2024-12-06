import { useContext } from 'react';
import { NotificationsContext } from './NotificationsContext';
import { FaRegBell, FaTimes } from 'react-icons/fa';

function App() {
  const { notifications, handleClose, clearAllNotifications } = useContext(NotificationsContext);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-6">
      <h1 className="text-xs font-bold text-blue-300 mb-6 bg-gradient-to-r from-blue-500 to-blue-800 text-center py-2 px-6 rounded-full shadow-lg tracking-wide">
        <FaRegBell className="inline-block mr-2 text-1xl" />
        Notifications
      </h1>
  
    <div className="flex-auto w-full max-w-md">
      {notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 p-3 rounded-md shadow-md ring-1 ring-blue-500 ring-opacity-50 transition-transform duration-300 transform hover:scale-105"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FaRegBell className="text-blue-300 text-lg" />
                  <span className="text-xs font-medium text-blue-200">
                    {notification.message}
                  </span>
                </div>
                <button
                  onClick={() => handleClose(notification.id)}
                  className="text-blue-300 text-lg hover:text-blue-400 transition duration-200"
                  aria-label="Eliminar notificación"
                >
                  <FaTimes />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-blue-400 text-center">
          You have not notifications.
        </p>
      )}
    </div>
  
    {notifications.length > 0 && (
      <button
        onClick={clearAllNotifications}
        className="mt-6 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium py-2 px-4 rounded-lg shadow-md text-sm transition-transform duration-200 transform hover:scale-105 active:scale-95 flex items-center gap-2"
        aria-label="Limpiar todas las notificaciones"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 13h6m2 9H7a2 2 0 01-2-2V7m12 13a2 2 0 002-2V7m-4 6h-6M10 3h4m-4 0a1 1 0 00-1 1v1h6V4a1 1 0 00-1-1m-4 0h4"
          />
        </svg>
        Limpiar
      </button>
     
      )}
    </div>
  );
}

export default App;
