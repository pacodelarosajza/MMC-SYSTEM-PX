import React, { useState, useEffect } from 'react';
import { FaBell, FaTimes, FaExclamationTriangle, FaClock, FaCalendarCheck } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const NotificationsComponent = () => {
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();
  const apiIpAddress = import.meta.env.VITE_API_IP_ADDRESS;

  // Función para calcular la diferencia de días entre hoy y la fecha de llegada
  const calculateDaysRemaining = (arrivedDate) => {
    const today = new Date();
    const arrived = new Date(arrivedDate);
    const timeDifference = arrived - today;
    const daysRemaining = Math.ceil(timeDifference / (1000 * 3600 * 24)); // Convertir de milisegundos a días
    return daysRemaining;
  };

  // Función para obtener los artículos y crear las notificaciones
  const fetchItems = async () => {
    try {
      const response = await axios.get(`${apiIpAddress}/api/getItemsByArrivedDate`);
      const items = response.data;

      const newNotifications = items.map((item) => {
        const daysRemaining = calculateDaysRemaining(item.arrived_date);

        let message = '';
        let icon = null;
        let iconColor = '';

        if (daysRemaining === 0) {
          message = `¡Hoy ha llegado el artículo ${item.name}: ${item.description}!`;
          icon = <FaCalendarCheck />;
          iconColor = 'text-green-500';
        } else if (daysRemaining < 0) {
          message = `El artículo ${item.name} (${item.description}) llegó el ${item.arrived_date}.`;
          icon = <FaExclamationTriangle />;
          iconColor = 'text-red-500';
        } else if (daysRemaining <= 7) {
          message = `Faltan ${daysRemaining} días para la llegada del artículo ${item.name}: ${item.description}.`;
          icon = <FaClock />;
          iconColor = 'text-yellow-400';
        } else {
          message = `El artículo ${item.name} tiene una fecha de llegada en más de 7 días.`;
          icon = <FaBell />;
          iconColor = 'text-blue-400';
        }

        return {
          id: item.id,
          message,
          icon,
          iconColor,
          daysRemaining,
          project: item.project.description,
          arrivedDate: item.arrived_date,
          price: item.price,
          currency: item.currency,
        };
      });

      setNotifications(newNotifications);
    } catch (error) {
      console.error('Error al obtener los artículos:', error);
    }
  };

  // Efecto para cargar las notificaciones al iniciar el componente
  useEffect(() => {
    fetchItems();
  }, []);

  // Función para descartar notificaciones
  const dismissNotification = (id) => {
    setNotifications(notifications.filter(notification => notification.id !== id));
  };

  return (
    <div className="min-h-screen p-6">
      {/* --- BLOQUE DE ENCABEZADO: Mostrar el icono y el título --- */}
      <div className="flex items-center mb-8">
        <FaBell size={0} className="text-indigo-400" />
        <h1 className="ml-4 text-3xl font-semibold text-white">Items</h1>
      </div>

      {/* --- BLOQUE DE CARGA: Mostrar carga o notificaciones --- */}
      {notifications.length === 0 ? (
        <p className="text-lg text-gray-400">No tienes nuevas notificaciones</p>
      ) : (
        <div className="space-y-6">
          {/* --- BLOQUE DE NOTIFICACIÓN: Iterar sobre las notificaciones --- */}
          {notifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => handleNotificationClick(notification.id)} // Aquí puedes agregar la lógica para manejar clics
              className="flex justify-between items-center p-5 bg-gray-800 rounded-lg shadow-md hover:shadow-lg cursor-pointer transition-all duration-300 ease-in-out"
            >
              <div className="flex items-center space-x-4">
                {/* --- Icono para distinguir el tipo de notificación --- */}
                <div className={`text-2xl ${notification.iconColor}`}>
                  {notification.icon}
                </div>
                <div>
                  {/* --- Mensaje de la notificación --- */}
                  <p className="text-sm text-gray-300 font-semibold">{notification.message}</p>
                  {/* --- Información adicional del artículo --- */}
                  <div className="text-xs text-gray-500 mt-2">
                    <p>Proyecto: {notification.project}</p>
                    <p>Fecha de llegada: {notification.arrivedDate}</p>
                    <p>Precio: {notification.price} {notification.currency}</p>
                  </div>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevenir que se active el clic para redirigir
                  dismissNotification(notification.id);
                }}
                className="text-red-400 hover:text-red-500"
              >
                <FaTimes />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsComponent;
