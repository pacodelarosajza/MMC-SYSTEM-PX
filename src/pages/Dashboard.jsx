import React, { useState, useEffect } from "react";
import { Link, useNavigate, Outlet } from "react-router-dom";
import axios from "axios";
import Calendar from "react-calendar";

import { FaBell } from "react-icons/fa"; // Importa el icono de notificaciones
import "../index.css";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = ({ onLogout }) => {
  const apiIpAddress = import.meta.env.VITE_API_IP_ADDRESS;

  const [projects, setProjects] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showChildRoutes, setShowChildRoutes] = useState(false);
  const [assemblies, setAssemblies] = useState([]);
  const [projectAdmins, setProjectAdmins] = useState({});

  const fetchAssemblies = async () => {
    try {
      const assembliesResponse = await axios.get(
        `${apiIpAddress}/api/getAssembly/arrived`
      );
      console.log("Assemblies response:", assembliesResponse.data);
      setAssemblies(assembliesResponse.data);
    } catch (error) {
      console.error("Error fetching assemblies:", error);
    }
  };
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const projectsResponse = await axios.get(
          `${apiIpAddress}/api/getProjectsActives`
        );
        const loadedProjects = projectsResponse.data;
        setProjects(loadedProjects);
  
        // Llama a la función para obtener los administradores después de cargar proyectos
        fetchAdminsForProjects(loadedProjects);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    fetchData();
  }, []);

  // Cargar administradores por cada proyecto
  const fetchAdminsForProjects = async (projects) => {
    const updatedProjectsWithAdmins = {};

    for (const project of projects) {
      try {
        const response = await axios.get(
          `${apiIpAddress}/api/projects/${project.id}/admins`
        );
        updatedProjectsWithAdmins[project.id] = response.data;
      } catch (error) {
        console.error(`Error fetching admins for project ${project.id}:`, error);
        updatedProjectsWithAdmins[project.id] = [];
      }
    }

    setProjectsWithAdmins(updatedProjectsWithAdmins);
  };


  const handleLogout = () => {
    console.log("Cerrando sesión...");
    localStorage.removeItem("isAuthenticated");
    onLogout();
    navigate("/");
  };

  // Función para agregar una notificación
const addNotification = (type, message, details) => {
  const notification = { id: Date.now(), type, message, details };

  // Actualiza el estado con la nueva notificación
  setNotifications((prevNotifications) => [...prevNotifications, notification]);

  // Configura un temporizador para eliminar la notificación después de 10 segundos
  setTimeout(() => {
    removeNotification(notification.id);
  }, 10000);
};

// Función para eliminar una notificación por ID
const removeNotification = (id) => {
  setNotifications((prevNotifications) => 
    prevNotifications.filter((notification) => notification.id !== id)
  );
};

// Función para generar mensajes basados en el tipo de notificación
const generateMessage = (notificationType, item) => {
  const messages = {
    success: `With ID.${item.id}: ${item.name}, Cantidad: ${item.quantity} (Assembly ID.${item.assembly_id}/Project #${item.project_id})`,
    warning: `${item.name}, ID.${item.id} (Assembly ID.${item.assembly_id}/Project #${item.project_id})`,
    info: `Assembly ID.${item.id}, Proyecto #${item.project_id}`,
    completed: `Assembly ID.${item.id}, Identificación: ${item.identification_number}`,
  };
  
  return messages[notificationType] || '';
};

// Función para obtener notificaciones de múltiples endpoints
const fetchNotifications = async () => {
  const endpoints = [
    { url: "/api/getItems/arrived", type: "success" },
    { url: "/api/getItems/missing", type: "warning" },
    { url: "/api/getAssemblyByDeliveryDate", type: "info" },
    { url: "/api/getAssemblyByCompletedDate", type: "completed" },
  ];

  try {
    const responses = await Promise.all(
      endpoints.map((endpoint) => axios.get(`${apiIpAddress}${endpoint.url}`))
    );

    responses.forEach((response, index) => {
      const notificationType = endpoints[index].type;

      // Comprobar si hay cambios en los datos
      const previousData = previousResponses[index]?.data || [];
      const newData = response.data;

      // Comparar los datos anteriores con los nuevos
      if (newData.length > previousData.length) {
        newData.forEach((item) => {
          if (!previousData.some(prevItem => prevItem.id === item.id)) {
            let message;
            if (notificationType === "success") {
              message = `With ID.${item.id}: ${item.name}, Cantidad: ${item.quantity} (Assembly ID.${item.assembly_id}/Project #${item.project_id}) `;
            } else if (notificationType === "warning") {
              message = `${item.name}, ID.${item.id}(Assembly ID.${item.assembly_id}/Project #${item.project_id})`;
            } else if (notificationType === "info") {
              message = `Assembly ID.${item.id}, Proyecto #${item.project_id}`;
            } else if (notificationType === "completed") {
              message = `Assembly ID.${item.id}, Identificación: ${item.identification_number}`;
            }

            addNotification(notificationType, message, { id: item.id });
          }
        });
      }
      
      // Actualizar el estado previo
      previousResponses[index] = response;
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
  }
};


  useEffect(() => {
    const intervalId = setInterval(fetchNotifications, 10000);
    return () => clearInterval(intervalId);
  }, []);

  const handleNotificationClick = (details) => {
    console.log("Detalles de la notificación:", details);
    navigate(`/details/${details.id}`);
  };

  const handleNavigate = () => {
    setShowChildRoutes(true);
  };

  const CalendarComponent = () => {
    // Función para abreviar los nombres de los días
    const formatShortWeekday = (locale, date) => {
      return date
        .toLocaleDateString(locale, { weekday: "short" })
        .charAt(0)
        .toUpperCase();
    };

    return (
      <div className="custom-calendar">
        <Calendar locale="en-US" formatShortWeekday={formatShortWeekday} />{" "}
        {/* Pasa la función como propiedad */}
      </div>
    );
  };
  return (
    <div className="flex bg-pageBackground text-white min-h-screen">
      {" "}
      {/* Fondo de la página */}
      <aside
        className={`
          bg-pageSideMenu 
          w-60 
          p-4 
          fixed 
          inset-y-0 
          left-0 
          transition-transform 
          transform 
          duration-300  
          shadow-2xl 
          shadow-shadowBlueColor
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          `}
      >
        <div className="justify-center">
          <img src="src/assets/YaskawaLogo6.png" alt="YASKAWA" className="w-auto mt-8 h-auto" style={{ display: 'block', margin: '0 auto', textAlign: 'center', fontWeight: 'bold' }} />
          <p className="text-center login-line mb-8">
            <strong>MCM Controller</strong>
          </p>
        </div>

        <nav className="flex flex-col h-full justify-between ">
          <ul className="flex flex-col space-y-1">
            <button className="text-2x1 text-left py-2 px-2 hover:bg-pageSideMenuTextHover hover:rounded transition duration-300 text-lightWhiteLetter font-medium">
              <Link to="/dashboard" onClick={() => setShowChildRoutes(false)}>
                Dashboard
              </Link>
            </button>
            <li className="border-b border-lightBlueLetter"></li>
            <button className="text-2x1 text-left py-2 px-2 hover:bg-pageSideMenuTextHover hover:rounded transition duration-300 text-lightWhiteLetter font-medium">
              <Link to="/dashboard/Me" onClick={handleNavigate}>
                Me
              </Link>
            </button>
            <li className="border-b border-lightBlueLetter"></li>
            <div className="text-2x1 text-left py-2 px-2 transition duration-300 text-lightWhiteLetter font-medium">
              Projects
            </div>
            <button className="text-sm text-left py-2 px-4 hover:bg-pageSideMenuTextHover hover:rounded transition duration-300 text-lightWhiteLetter">
              <Link to="/dashboard/projects" onClick={handleNavigate}>
                In Development
              </Link>
            </button>
            <button className="text-sm text-left py-2 px-4 hover:bg-pageSideMenuTextHover hover:rounded transition duration-300 text-lightWhiteLetter">
              <Link to="/dashboard/projects-managment" onClick={handleNavigate}>
                Projects Managment
              </Link>
            </button>
            <button className="text-sm text-left py-2 px-4 hover:bg-pageSideMenuTextHover hover:rounded transition duration-300 text-lightWhiteLetter">
              <Link to="/dashboard/history" onClick={handleNavigate}>
                History
              </Link>
            </button>
            <li className="border-b border-lightBlueLetter"></li>
            <button className="text-2x1 text-left py-2 px-2 hover:bg-pageSideMenuTextHover hover:rounded transition duration-300 text-lightWhiteLetter font-medium">
              <Link to="/dashboard/stock" onClick={handleNavigate}>
                Stock
              </Link>
            </button>
            <li className="border-b border-lightBlueLetter"></li>
            <button className="text-2x1 text-left py-2 px-2 hover:bg-pageSideMenuTextHover hover:rounded transition duration-300 text-lightWhiteLetter font-medium">
              <Link to="/dashboard/usuarios" onClick={handleNavigate}>
                Users
              </Link>
            </button>
            <button className="text-sm text-left py-2 px-4 hover:bg-pageSideMenuTextHover hover:rounded transition duration-300 text-lightWhiteLetter">
              <Link to="/dashboard/new-user-form" onClick={handleNavigate}>
                Add User
              </Link>
            </button>
          </ul>
        </nav>
      </aside>
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-4 overflow-auto max-h-[calc(100vh-150px)]">
        {assemblies.map((assembly) => (
          <div
            key={assembly.id}
            className="bg-gray-700 p-3 rounded-lg shadow-md text-sm cursor-pointer hover:bg-gray-600 transition duration-200"
            onClick={() => alert(`Detalles del Ensamblaje ID: ${assembly.id}`)}
          >
            <h2 className="font-bold text-lg">ID: {assembly.id}</h2>
            <p className="text-blue-400">#{assembly.identification_number}</p>
            <p className="text-green-400">
              <strong>Fecha de Entrega:</strong>{" "}
              {new Date(assembly.delivery_date).toLocaleDateString()}
            </p>
            <p
              className={`font-semibold ${
                assembly.completed_assembly ? "text-green-500" : "text-red-500"
              }`}
            >
              <strong>Estado:</strong>{" "}
              {assembly.completed_assembly ? "Completo" : "Incompleto"}
            </p>
            <p className="text-yellow-400">
              <strong>Precio:</strong> ${assembly.price}
            </p>
            <p className="text-purple-400">
              <strong>Descripción:</strong> {assembly.description}
            </p>
          </div>
        ))}
      </section>
      <main
        className={`flex-1 pl-2 pr-2 transition-all duration-300 ml-64 ${
          showChildRoutes ? "mr-" : "mr-64"
        }`}
      >
        {!showChildRoutes ? (
          <>
            <div className="py-6 flex flex-col justify-leftt px-4 space-y-1">
              <div className="bg-contentCards p-5 rounded-lg shadow shadow-shadowBlueColor shadow-xl">
                <h1 className="text-right pr-10 text-lg font-semibold text-lightWhiteLetter">
                  Project progress
                </h1>
                {/* Progress Bars */}
                <div className="rounded-lg shadow-sm overflow-hidden">
                  <span className="font-medium text-xs text-lightGrayLetter">
                    <strong>#1001</strong>
                  </span>
                  <div className="relative h-4 flex items-center">
                    <div className="absolute top-0 bottom-0 left-0 rounded-lg w-full bg-progressBarsBackground"></div>
                    <div className="absolute top-0 bottom-0 left-0 rounded-lg w-[15%] bg-red-700 flex items-center justify-start pl-1">
                      <span className="pl-10 font-medium text-xs">15%</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg shadow-sm overflow-hidden">
                  <span className="font-medium text-xs text-lightGrayLetter">
                    <strong>#1002</strong>
                  </span>
                  <div className="relative h-4 flex items-center">
                    <div className="absolute top-0 bottom-0 left-0 rounded-lg w-full bg-progressBarsBackground"></div>
                    <div className="absolute top-0 bottom-0 left-0 rounded-lg w-[36%] bg-orange-700 flex items-center justify-start pl-1">
                      <span className="pl-10 font-medium text-xs">36%</span>
                    </div>
                  </div>
                </div>
                <div className="rounded-lg shadow-sm overflow-hidden">
                  <span className="font-medium text-xs text-lightGrayLetter">
                    <strong>#1003</strong>
                  </span>
                  <div className="relative h-4 flex items-center">
                    <div className="absolute top-0 bottom-0 left-0 rounded-lg w-full bg-progressBarsBackground"></div>
                    <div className="absolute top-0 bottom-0 left-0 rounded-lg w-[60%] bg-blue-700 flex items-center justify-start pl-1">
                      <span className="pl-10 font-medium text-xs">60%</span>
                    </div>
                  </div>
                </div>
                <div className="rounded-lg shadow-sm overflow-hidden">
                  <span className="font-medium text-xs text-lightGrayLetter">
                    <strong>#1004</strong>
                  </span>
                  <div className="relative h-4 flex items-center">
                    <div className="absolute top-0 bottom-0 left-0 rounded-lg w-full bg-progressBarsBackground"></div>
                    <div className="absolute top-0 bottom-0 left-0 rounded-lg w-[70%] bg-green-700 flex items-center justify-start pl-1">
                      <span className="pl-10 font-medium text-xs">70%</span>
                    </div>
                  </div>
                </div>
                <div className="rounded-lg shadow-sm overflow-hidden">
                  <span className="font-medium text-xs text-lightGrayLetter">
                    <strong>#1005</strong>
                  </span>
                  <div className="relative h-4 flex items-center">
                    <div className="absolute top-0 bottom-0 left-0 rounded-lg w-full bg-progressBarsBackground"></div>
                    <div className="absolute top-0 bottom-0 left-0 rounded-lg w-[95%] bg-pink-700 flex items-center justify-start pl-1">
                      <span className="pl-10 font-medium text-xs">95%</span>
                    </div>
                  </div>
                </div>
              </div>
              {/* Assemblies Section */}
              <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-4">
                {assemblies.map((assembly) => (
                  <div
                    key={assembly.id}
                    className="bg-gray-700 p-1 rounded-lg shadow-md text-xs cursor-pointer hover:bg-gray-600 transition duration-200"
                  >
                    <h2 className="font-bold text-xs">ID: {assembly.id}</h2>
                    <p className="text-blue-400 text-xs">
                      <strong>Número de Identificación:</strong>{" "}
                      {assembly.identification_number}
                    </p>
                    <p className="text-green-400 text-xs">
                      <strong>Fecha de Entrega:</strong>{" "}
                      {new Date(assembly.delivery_date).toLocaleDateString()}
                    </p>
                    <p
                      className={`font-semibold text-xs ${
                        assembly.completed_assembly
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      <strong>Estado:</strong>{" "}
                      {assembly.completed_assembly ? "Completo" : "Incompleto"}
                    </p>
                    <p className="text-yellow-400 text-xs">
                      <strong>Precio:</strong> ${assembly.price}
                    </p>
                    <p className="text-purple-400 text-xs">
                      <strong>Descripción:</strong> {assembly.description}
                    </p>
                  </div>
                ))}
              </section>
              {/* Projects Overview Section */}
              <h1 className="text-lg text-bo font-bold text-rigth text-lightWhiteLetter pt-8 pb-5">
                Project cards under development
              </h1>
              <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mb-4">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="relative bg-gray-700 p-3 rounded-lg shadow shadow-shadowBlueColor shadow-xl text-sm cursor-pointer hover:bg-gray-600 transition duration-200"
                    onClick={() =>
                      alert(`Detalles del Proyecto ID: ${project.id}`)
                      
                    }
                  >
                    {/*<h2 className="font-bold text-lg">ID: {project.id}</h2>*/}
                    <p className="text-green-500 text-xl text-right">
                      <strong>#{project.identification_number}</strong>
                    </p>

                    <p className="text-lightWhiteLetter">
                      <strong>Description:</strong>
                      <br />
                      {project.description}
                    </p>
                    <br />
                    <div className="absolute bottom-5 w-full">
                      <p className="text-lightGrayLetter text-xs">
                        <strong>Delivery date:</strong>{" "}
                        {new Date(project.delivery_date).toLocaleDateString()}
                      </p>
                    </div>

                    {/*<p
                      className={`font-semibold ${
                        project.completed ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      <strong>Estado:</strong>{" "}
                      {project.completed ? "Completo" : "Incompleto"}
                    </p>*/}
                    {/*<p className="text-yellow-400">
                      <strong>Costo de Material:</strong> $
                      {project.cost_material}
                    </p>*/}
                    {/*<p className="text-purple-400">
                      <strong>Descripción:</strong> {project.description}
                    </p>*/}
                  </div>
                ))}
              </section>
            </div>
          </>
        ) : (
          <Outlet /> // Renderiza las rutas hijas
        )}
      </main>
      {/* Sidebar Derecho: Solo se muestra cuando no hay rutas hijas */}
      {!showChildRoutes && (
        <aside className="bg-calendarNotifiBackground w-64 p-4 fixed inset-y-0 right-0 overflow-y-auto ">
          {/*<h2 className="text-xl font-bold mb-4">Calendario</h2>*/}
          <CalendarComponent />
          <div className="flex justify-center items-center text-sm text-lightWhiteLetter font-bold mb-4 mt-6">
            <FaBell className="mr-2" />
            <h2>Notifications</h2>
          </div>
          <ul className="space-y-1">
            {notifications.map((notification, index) => (
              <li
                key={index}
                className={`p-2 rounded text-xs text-left notifiGrayLetter ${
                  notification.type === "success"
                    ? "border-l-4 border border-blue-800"
                    : notification.type === "warning"
                    ? "border-l-4 border border-yellow-800"
                    : notification.type === "info"
                    ? "border-l-4 border border-cyan-800"
                    : notification.type === "completed"
                    ? "border-l-4 border border-green-800"
                    : "border-l-4 border border-red-800"
                }`}
              >
                <span className="font-medium">
                  {notification.type === "success" && (
                    <span className="text-blue-500 font-bold">
                      ¡Un material a llegado.!
                      <br />
                    </span>
                  )}
                  {notification.type === "warning" && (
                    <span className="text-yellow-500 font-bold">
                      ¡Falta un material!
                      <br />
                    </span>
                  )}
                  {notification.type === "info" && (
                    <span className="text-cyan-500 font-bold">
                      ¡Ensamblaje completado!
                      <br />
                    </span>
                  )}
                  {notification.type === "completed" && (
                    <span className="text-green-500 font-bold">
                      ¡Ensamblaje completado!
                      <br />
                    </span>
                  )}
                  {notification.type === "error" && (
                    <span className="text-red-500 font-bold">
                      Error:
                      <br />
                    </span>
                  )}
                  {notification.message}
                </span>
                <br />
                <button
                  className="mt-2 text-xs text-gray-300"
                  onClick={() => handleNotificationClick(notification.details)}
                >
                  Details
                </button>
              </li>
            ))}
          </ul>
        </aside>
      )}
    </div>
  );
};

export default Dashboard;
