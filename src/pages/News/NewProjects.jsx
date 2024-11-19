import React, { useState, useEffect } from 'react';
import { FaBell, FaCalendarCheck, FaExclamationTriangle, FaClock } from 'react-icons/fa';
import axios from 'axios';

const ProjectsComponent = () => {
  const [projects, setProjects] = useState([]);
  const apiIpAddress = import.meta.env.VITE_API_IP_ADDRESS;

  // Función para calcular la diferencia de días entre hoy y la fecha de entrega
  const calculateDaysRemaining = (deliveryDate) => {
    const today = new Date();
    const delivery = new Date(deliveryDate);
    const timeDifference = delivery - today;
    const daysRemaining = Math.ceil(timeDifference / (1000 * 3600 * 24)); // Convertir de milisegundos a días
    return daysRemaining;
  };

  // Función para obtener todos los proyectos
  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${apiIpAddress}/api/getProjects`);
      const projectsData = response.data;

      const newProjects = projectsData.map((project) => {
        const daysRemaining = calculateDaysRemaining(project.delivery_date);
        
        let message = '';
        let icon = null;
        let iconColor = '';

        if (daysRemaining === 0) {
          message = `¡Hoy es la fecha de entrega del proyecto ${project.identification_number}: ${project.description}!`;
          icon = <FaCalendarCheck />;
          iconColor = 'text-green-500';
        } else if (daysRemaining < 0) {
          message = `La fecha de entrega del proyecto ${project.identification_number} (${project.description}) ya pasó.`;
          icon = <FaExclamationTriangle />;
          iconColor = 'text-red-500';
        } else if (daysRemaining <= 7) {
          message = `Faltan ${daysRemaining} días para la entrega del proyecto ${project.identification_number}: ${project.description}.`;
          icon = <FaClock />;
          iconColor = 'text-yellow-400';
        } else {
          message = `El proyecto ${project.identification_number} (${project.description}) tiene una fecha de entrega en más de 7 días.`;
          icon = <FaBell />;
          iconColor = 'text-blue-400';
        }

        return {
          id: project.id,
          message,
          icon,
          iconColor,
          daysRemaining,
          identificationNumber: project.identification_number,
          deliveryDate: project.delivery_date,
          description: project.description,
          costMaterial: project.cost_material,
        };
      });

      setProjects(newProjects);
    } catch (error) {
      console.error('Error al obtener los proyectos:', error);
    }
  };

  // Efecto para cargar los proyectos cuando el componente se monta
  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div className="min-h-screen p-6">
      {/* --- ENCABEZADO --- */}
      <div className="flex items-center mb-8">
        <FaBell size={30} className="text-indigo-400" />
        <h1 className="ml-4 text-3xl font-semibold text-white">Projects</h1>
      </div>

      {/* --- LISTADO DE PROYECTOS --- */}
      {projects.length === 0 ? (
        <p className="text-lg text-gray-400">No tienes nuevos proyectos</p>
      ) : (
        <div className="space-y-6">
          {/* --- PROYECTO - MOSTRAR CADA PROYECTO --- */}
          {projects.map((project) => (
            <div
              key={project.id}
              className="flex justify-between items-center p-5 bg-gray-800 rounded-lg shadow-md hover:shadow-lg cursor-pointer transition-all duration-300 ease-in-out"
            >
              <div className="flex items-center space-x-4">
                {/* --- Icono para distinguir el tipo de notificación --- */}
                <div className={`text-2xl ${project.iconColor}`}>
                  {project.icon}
                </div>
                <div>
                  {/* --- Mensaje de la notificación --- */}
                  <p className="text-sm text-gray-300 font-semibold">{project.message}</p>
                  {/* --- Información adicional del proyecto --- */}
                  <div className="text-xs text-gray-500 mt-2">
                    <p>Identificación: {project.identificationNumber}</p>
                    <p>Fecha de entrega: {project.deliveryDate}</p>
                    <p>Costo material: ${project.costMaterial}</p>
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

export default ProjectsComponent;