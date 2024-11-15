import React, { useState, useEffect } from 'react';
import { FaClipboard, FaCalendarCheck, FaExclamationTriangle, FaClock } from 'react-icons/fa';
import axios from 'axios';

const SubassemblyComponent = () => {
  const [subassemblies, setSubassemblies] = useState([]);
  const apiIpAddress = import.meta.env.VITE_API_IP_ADDRESS;

  // Función para calcular la diferencia de días entre hoy y la fecha de entrega
  const calculateDaysRemaining = (deliveryDate) => {
    const today = new Date();
    const delivery = new Date(deliveryDate);
    const timeDifference = delivery - today;
    const daysRemaining = Math.ceil(timeDifference / (1000 * 3600 * 24)); // Convertir de milisegundos a días
    return daysRemaining;
  };

  // Función para obtener los subensambles
  const fetchSubassemblies = async () => {
    try {
      const response = await axios.get(`${apiIpAddress}/api/subassembly`);
      const subassembliesData = response.data;

      const newSubassemblies = subassembliesData.map((subassembly) => {
        const daysRemaining = calculateDaysRemaining(subassembly.delivery_date);

        let message = '';
        let icon = null;
        let iconColor = '';

        if (daysRemaining === 0) {
          message = `¡Hoy es la fecha de entrega del subensamble ${subassembly.identification_number}!`;
          icon = <FaCalendarCheck />;
          iconColor = 'text-green-500';
        } else if (daysRemaining < 0) {
          message = `La fecha de entrega del subensamble ${subassembly.identification_number} ya pasó.`;
          icon = <FaExclamationTriangle />;
          iconColor = 'text-red-500';
        } else if (daysRemaining <= 7) {
          message = `Faltan ${daysRemaining} días para la entrega del subensamble ${subassembly.identification_number}.`;
          icon = <FaClock />;
          iconColor = 'text-yellow-400';
        } else {
          message = `El subensamble ${subassembly.identification_number} tiene una fecha de entrega en más de 7 días.`;
          icon = <FaClipboard />;
          iconColor = 'text-blue-400';
        }

        return {
          id: subassembly.id,
          message,
          icon,
          iconColor,
          daysRemaining,
          identificationNumber: subassembly.identification_number,
          description: subassembly.description,
          deliveryDate: subassembly.delivery_date,
          price: subassembly.price,
          currency: subassembly.currency,
        };
      });

      setSubassemblies(newSubassemblies);
    } catch (error) {
      console.error('Error al obtener los subensambles:', error);
    }
  };

  // Efecto para cargar los subensambles cuando el componente se monta
  useEffect(() => {
    fetchSubassemblies();
  }, []);

  return (
    <div className="min-h-screen p-6">
      {/* --- ENCABEZADO --- */}
      <div className="flex items-center mb-8">
        <FaClipboard size={30} className="text-indigo-400" />
        <h1 className="ml-4 text-3xl font-semibold text-white">Subassemblies</h1>
      </div>

      {/* --- LISTADO DE SUBENSAMBLES --- */}
      {subassemblies.length === 0 ? (
        <p className="text-lg text-gray-400">No tienes nuevos subensambles</p>
      ) : (
        <div className="space-y-6">
          {/* --- SUBENSAMBLE - MOSTRAR CADA SUBENSAMBLE --- */}
          {subassemblies.map((subassembly) => (
            <div
              key={subassembly.id}
              className="flex justify-between items-center p-5 bg-gray-800 rounded-lg shadow-md hover:shadow-lg cursor-pointer transition-all duration-300 ease-in-out"
            >
              <div className="flex items-center space-x-4">
                {/* --- Icono para distinguir el tipo de notificación --- */}
                <div className={`text-2xl ${subassembly.iconColor}`}>
                  {subassembly.icon}
                </div>
                <div>
                  {/* --- Mensaje de la notificación --- */}
                  <p className="text-sm text-gray-300 font-semibold">{subassembly.message}</p>
                  {/* --- Información adicional del subensamble --- */}
                  <div className="text-xs text-gray-500 mt-2">
                    <p>Identificación: {subassembly.identificationNumber}</p>
                    <p>Descripción: {subassembly.description}</p>
                    <p>Fecha de entrega: {subassembly.deliveryDate}</p>
                    <p>Costo: {subassembly.price} {subassembly.currency}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SubassemblyComponent;
