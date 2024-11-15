import React, { useState, useEffect } from 'react';
import { FaBell, FaTimes, FaExclamationTriangle, FaClock, FaCalendarCheck } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const NotificationsComponent = () => {
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();
  const apiIpAddress = import.meta.env.VITE_API_IP_ADDRESS;

  // Función para calcular la diferencia de días entre hoy y la fecha de entrega
  const calculateDaysRemaining = (deliveryDate) => {
    const today = new Date();
    const delivery = new Date(deliveryDate);
    const timeDifference = delivery - today;
    const daysRemaining = Math.ceil(timeDifference / (1000 * 3600 * 24)); // Convertir de milisegundos a días
    return daysRemaining;
  };

  // Función para obtener los ensambles y crear las notificaciones
  const fetchAssemblies = async () => {
    try {
      const response = await axios.get(`${apiIpAddress}/api/getAssemblyByDeliveryDate`);
      const assemblies = response.data;

      const newNotifications = assemblies.map((assembly) => {
        const daysRemaining = calculateDaysRemaining(assembly.delivery_date);
        
        let message = '';
        let icon = null;
        let iconColor = '';

        if (daysRemaining === 0) {
          message = `¡Hoy es la fecha de entrega del ensamblaje ${assembly.identification_number}: ${assembly.description}!`;
          icon = <FaCalendarCheck />;
          iconColor = 'text-green-500';
        } else if (daysRemaining < 0) {
          message = `La fecha de entrega del ensamblaje ${assembly.identification_number} (${assembly.description}) ya pasó.`;
          icon = <FaExclamationTriangle />;
          iconColor = 'text-red-500';
        } else if (daysRemaining <= 7) {
          message = `Faltan ${daysRemaining} días para la entrega del ensamblaje ${assembly.identification_number}: ${assembly.description}.`;
          icon = <FaClock />;
          iconColor = 'text-yellow-400';
        } else {
          message = `El ensamblaje ${assembly.identification_number} (${assembly.description}) tiene una fecha de entrega en más de 7 días.`;
          icon = <FaBell />;
          iconColor = 'text-blue-400';
        }

        return {
          id: assembly.id,
          message,
          icon,
          iconColor,
          daysRemaining,
          project: assembly.project,
          deliveryDate: assembly.delivery_date,
          price: assembly.price,
          currency: assembly.currency,
        };
      });

      setNotifications(newNotifications);
    } catch (error) {
      console.error('Error al obtener los ensambles:', error);
    }
  };

  // Efecto para cargar las notificaciones al iniciar el componente
  useEffect(() => {
    fetchAssemblies();
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
        <h1 className="ml-4 text-3xl font-semibold text-white">Assemblies</h1>
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
              onClick={() => handleNotificationClick(notification.id)}
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
                  {/* --- Información adicional del ensamblaje --- */}
                  <div className="text-xs text-gray-500 mt-2">
                    <p>Proyecto: {notification.project.description}</p>
                    <p>Fecha de entrega: {notification.deliveryDate}</p>
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