import React, { useState, useEffect } from 'react';
import { FaBell, FaTimes, FaExclamationTriangle, FaClock, FaCalendarCheck } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const NotificationsComponent = () => {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'past', 'dueSoon', 'moreThan7Days'
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
          message = `Today is the delivery date for assembly ${assembly.identification_number}: ${assembly.description}!`;
          icon = <FaCalendarCheck />;
          iconColor = 'text-green-500';
        } else if (daysRemaining < 0) {
          message = `The delivery date for assembly ${assembly.identification_number} (${assembly.description}) has passed.`;
          icon = <FaExclamationTriangle />;
          iconColor = 'text-red-500';
        } else if (daysRemaining <= 7) {
          message = `${daysRemaining} days left for the delivery of assembly ${assembly.identification_number}: ${assembly.description}.`;
          icon = <FaClock />;
          iconColor = 'text-yellow-400';
        } else {
          message = `Assembly ${assembly.identification_number} (${assembly.description}) has a delivery date in more than 7 days.`;
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
      setFilteredNotifications(newNotifications); // Inicialmente mostrar todas las notificaciones
    } catch (error) {
      console.error('Error al obtener los ensambles:', error);
    }
  };

  // Función para aplicar los filtros
  const applyFilter = (filterType) => {
    setFilter(filterType);
    let filtered = [...notifications]; // Copiar el array original

    switch (filterType) {
      case 'past':
        filtered = filtered.filter((notification) => notification.daysRemaining < 0);
        break;
      case 'dueSoon':
        filtered = filtered.filter((notification) => notification.daysRemaining >= 0 && notification.daysRemaining <= 7);
        break;
      case 'moreThan7Days':
        filtered = filtered.filter((notification) => notification.daysRemaining > 7);
        break;
      default:
        filtered = notifications; // Sin filtro
    }

    // Filtrar por la búsqueda
    if (searchQuery) {
      filtered = filtered.filter((notification) =>
        notification.message.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredNotifications(filtered);
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
      {/* --- ENCABEZADO --- */}
      <div className="flex items-center mb-8">
        <FaBell size={30} className="text-indigo-400" />
        <h1 className="ml-4 text-3xl font-semibold text-white">Assemblies</h1>
      </div>

     {/* --- FILTERS --- */}
<div className="mb-4 flex space-x-4">
  <button
    onClick={() => applyFilter('all')}
    className={`px-4 py-2 ${filter === 'all' ? 'bg-indigo-500 text-white' : 'bg-gray-700 text-gray-300'} rounded-md`}
  >
    All
  </button>
  <button
    onClick={() => applyFilter('past')}
    className={`px-4 py-2 ${filter === 'past' ? 'bg-red-500 text-white' : 'bg-gray-700 text-gray-300'} rounded-md`}
  >
    Past
  </button>
  <button
    onClick={() => applyFilter('dueSoon')}
    className={`px-4 py-2 ${filter === 'dueSoon' ? 'bg-yellow-400 text-white' : 'bg-gray-700 text-gray-300'} rounded-md`}
  >
    Due Soon
  </button>
  <button
    onClick={() => applyFilter('moreThan7Days')}
    className={`px-4 py-2 ${filter === 'moreThan7Days' ? 'bg-blue-400 text-white' : 'bg-gray-700 text-gray-300'} rounded-md`}
  >
    More than 7 Days
  </button>
</div>


      {/* --- BARRA DE BÚSQUEDA --- */}
      <div className="mb-4 flex items-center space-x-4">
        <input
          type="text"
          placeholder="Search notifications..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            applyFilter(filter); // Volver a aplicar el filtro después de la búsqueda
          }}
          className="w-full p-3 bg-gray-700 text-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
      </div>

      

      {/* --- NOTIFICACIONES --- */}
      {filteredNotifications.length === 0 ? (
        <p className="text-lg text-gray-400">You don't have notifications</p>
      ) : (
        <div className="space-y-6">
          {/* --- NOTIFICACIÓN - MOSTRAR CADA NOTIFICACIÓN --- */}
          {filteredNotifications.map((notification) => (
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
                    <p>Project: {notification.project.description}</p>
                    <p>Delivery Date: {notification.deliveryDate}</p>
                    <p>Price: {notification.price} {notification.currency}</p>
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
