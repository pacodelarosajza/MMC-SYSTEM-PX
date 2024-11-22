import React, { useState, useEffect } from 'react';
import { FaClipboard, FaCalendarCheck, FaExclamationTriangle, FaClock } from 'react-icons/fa';
import axios from 'axios';

const SubassemblyComponent = () => {
  const [subassemblies, setSubassemblies] = useState([]);
  const [filteredSubassemblies, setFilteredSubassemblies] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'past', 'dueSoon', 'moreThan7Days'
  const [searchQuery, setSearchQuery] = useState('');
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
          message = `Today is the delivery date for subassembly ${subassembly.identification_number}!`;
          icon = <FaCalendarCheck />;
          iconColor = 'text-green-500';
        } else if (daysRemaining < 0) {
          message = `The delivery date for subassembly ${subassembly.identification_number} has passed.`;
          icon = <FaExclamationTriangle />;
          iconColor = 'text-red-500';
        } else if (daysRemaining <= 7) {
          message = `${daysRemaining} days left for the delivery of subassembly ${subassembly.identification_number}.`;
          icon = <FaClock />;
          iconColor = 'text-yellow-400';
        } else {
          message = `Subassembly ${subassembly.identification_number} has a delivery date in more than 7 days.`;
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
      setFilteredSubassemblies(newSubassemblies); // Inicialmente mostrar todos los subensambles
    } catch (error) {
      console.error('Error al obtener los subensambles:', error);
    }
  };

  // Función para aplicar los filtros
  const applyFilter = (filterType) => {
    setFilter(filterType);
    let filtered = [...subassemblies]; // Copiar el array original

    // Filtro de fechas
    switch (filterType) {
      case 'past':
        filtered = filtered.filter((subassembly) => subassembly.daysRemaining < 0);
        break;
      case 'dueSoon':
        filtered = filtered.filter((subassembly) => subassembly.daysRemaining >= 0 && subassembly.daysRemaining <= 7);
        break;
      case 'moreThan7Days':
        filtered = filtered.filter((subassembly) => subassembly.daysRemaining > 7);
        break;
      default:
        filtered = subassemblies; // Sin filtro
    }

    // Filtro de búsqueda por texto
    if (searchQuery) {
      filtered = filtered.filter((subassembly) =>
        subassembly.identificationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        subassembly.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredSubassemblies(filtered);
  };

  // Efecto para cargar los subensambles cuando el componente se monta
  useEffect(() => {
    fetchSubassemblies();
  }, []);

  // Función para manejar el cambio en la barra de búsqueda
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    applyFilter(filter); // Aplicar el filtro actual con la nueva búsqueda
  };

  return (
    <div className="min-h-screen p-6">
      {/* --- ENCABEZADO --- */}
      <div className="flex items-center mb-8">
        <FaClipboard size={30} className="text-indigo-400" />
        <h1 className="ml-4 text-3xl font-semibold text-white">Subassemblies</h1>
      </div>

      
      {/* --- FILTROS --- */}
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
          Passed already
        </button>
        <button
          onClick={() => applyFilter('dueSoon')}
          className={`px-4 py-2 ${filter === 'dueSoon' ? 'bg-yellow-400 text-white' : 'bg-gray-700 text-gray-300'} rounded-md`}
        >
          Upcoming delivery
        </button>
        <button
          onClick={() => applyFilter('moreThan7Days')}
          className={`px-4 py-2 ${filter === 'moreThan7Days' ? 'bg-blue-400 text-white' : 'bg-gray-700 text-gray-300'} rounded-md`}
        >
          More than 7 days
        </button>
      </div>


      {/* --- BARRA DE BÚSQUEDA --- */}
      <div className="mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search projects by identification....."
          className="w-full p-3 bg-gray-700 text-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
      </div>


      {/* --- LISTADO DE SUBENSAMBLES --- */}
      {filteredSubassemblies.length === 0 ? (
        <p className="text-lg text-gray-400">You don't have notifications</p>
      ) : (
        <div className="space-y-6">
          {/* --- SUBENSAMBLE - MOSTRAR CADA SUBENSAMBLE --- */}
          {filteredSubassemblies.map((subassembly) => (
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
                    <p>Identification: {subassembly.identificationNumber}</p>
                    <p>Description: {subassembly.description}</p>
                    <p>Delivery Date: {subassembly.deliveryDate}</p>
                    <p>Cost: {subassembly.price} {subassembly.currency}</p>
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
