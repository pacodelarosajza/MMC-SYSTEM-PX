import React, { createContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

const apiIpAddress = import.meta.env.VITE_API_IP_ADDRESS;
const socket = io(`${apiIpAddress}`);

export const NotificationsContext = createContext();

export const NotificationsProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Cargar notificaciones desde localStorage al cargar la página
    const savedNotifications = JSON.parse(localStorage.getItem('notifications')) || [];
    setNotifications(savedNotifications);
  }, []);

  useEffect(() => {
    const handleDataUpdated = (data) => {
      const newNotification = {
        id: Date.now(),
        message: data.message,
      };
      setNotifications((prevNotifications) => {
        const updatedNotifications = [...prevNotifications, newNotification];
        localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
        return updatedNotifications;
      });
    };

    // Escuchar eventos del socket
    socket.on('dataUpdated', handleDataUpdated);

    return () => {
      socket.off('dataUpdated', handleDataUpdated);
    };
  }, []);

  const handleClose = (id) => {
    const updatedNotifications = notifications.filter((notification) => notification.id !== id);
    setNotifications(updatedNotifications);
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    localStorage.removeItem('notifications');
  };

  return (
    <NotificationsContext.Provider
      value={{ notifications, handleClose, clearAllNotifications }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};
