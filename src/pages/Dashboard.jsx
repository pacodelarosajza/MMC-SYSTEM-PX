import React, { useState, useEffect } from "react";
import { Link, useNavigate, Outlet } from "react-router-dom";
import axios from "axios";
import Calendar from "react-calendar";
import Notifications from "./Notifications";

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

  const [items, setItems] = useState([]);
  // Estado para la página actual
  const [currentPage, setCurrentPage] = useState(0);
  const projectsPerPage = 5;

  const [progresses, setProgresses] = useState({});

  // Función para obtener el progreso de un proyecto
  const getProjectProgress = async (projectId) => {
    const response = await fetch(
      `${apiIpAddress}/api/getItems/project/${projectId}`
    );
    const items = await response.json();

    // Filtrar los items que han llegado (in_subassembly === 1)
    const arrivedItems = items.filter((item) => item.in_subassembly === 1);
    const totalItems = items.length;

    // Calcular el porcentaje de progreso
    const progressPercentage =
      totalItems === 0 ? 0 : (arrivedItems.length / totalItems) * 100;

    // Guardar el progreso de ese proyecto en el estado
    setProgresses((prevState) => ({
      ...prevState,
      [projectId]: progressPercentage,
    }));
  };

  // Ejecutar la función para cada proyecto al cargar los datos
  useEffect(() => {
    projects.forEach((project) => {
      getProjectProgress(project.id);
    });
  }, [projects]);

  // Total de páginas
  const totalPages = Math.ceil(projects.length / projectsPerPage);

  // Función para ir a la página anterior
  const handlePrevious = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Función para ir a la página siguiente
  const handleNext = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Obtén los proyectos para la página actual
  const currentProjects = projects.slice(
    currentPage * projectsPerPage,
    (currentPage + 1) * projectsPerPage
  );

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
      } catch (error) { }
    };

    fetchData();
  }, []);

  // Calcular el progreso en función de los ítems entregados
  useEffect(() => {
    if (items.length > 0) {
      const totalItems = items.length;
      const deliveredItems = items.filter(
        (item) => item.in_subassembly === 1
      ).length;
      const progressPercentage = (deliveredItems / totalItems) * 100;
      setProgress(progressPercentage);
    }
  }, [items]);

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
          <img
            src="src/assets/YaskawaLogo6.png"
            alt="YASKAWA"
            className="w-auto mt-8 h-auto"
            style={{
              display: "block",
              margin: "0 auto",
              textAlign: "center",
              fontWeight: "bold",
            }}
          />
          <p className="text-center login-line mb-8">
            <strong>MCM Controller</strong>
          </p>
        </div>

        <nav className="flex flex-col h-full justify-between ">
          <ul className="flex flex-col space-y-1">
            <Link
              to="/dashboard"
              onClick={() => setShowChildRoutes(false)}
              className="text-2x1 text-left py-2 px-2 hover:bg-pageSideMenuTextHover hover:rounded transition duration-300 text-lightWhiteLetter font-medium"
            >
              <button>Dashboard</button>
            </Link>
            <Link
              to="/dashboard/news"
              onClick={handleNavigate}
              className="text-2x1 text-left py-2 px-2 hover:bg-pageSideMenuTextHover hover:rounded transition duration-300 text-lightWhiteLetter font-medium"
            >
              <button>News</button>
            </Link>
            <li className="border-b border-lightBlueLetter"></li>
            <Link
              to="/dashboard/Me"
              onClick={handleNavigate}
              className="text-2x1 text-left py-2 px-2 hover:bg-pageSideMenuTextHover hover:rounded transition duration-300 text-lightWhiteLetter font-medium"
            >
              <button>Me</button>
            </Link>
            <li className="border-b border-lightBlueLetter"></li>
            <div className="text-2x1 text-left py-2 px-2 transition duration-300 text-lightWhiteLetter font-medium">
              Projects
            </div>
            <Link
              to="/dashboard/projects"
              onClick={handleNavigate}
              className="text-sm text-left py-2 px-4 hover:bg-pageSideMenuTextHover hover:rounded transition duration-300 text-lightWhiteLetter"
            >
              <button>In Development</button>
            </Link>
            <Link
              to="/dashboard/projects-managment"
              onClick={handleNavigate}
              className="text-sm text-left py-2 px-4 hover:bg-pageSideMenuTextHover hover:rounded transition duration-300 text-lightWhiteLetter"
            >
              <button>Projects Managment</button>
            </Link>
            <Link
              to="/dashboard/materials-managment"
              onClick={handleNavigate}
              className="text-sm text-left py-2 px-4 hover:bg-pageSideMenuTextHover hover:rounded transition duration-300 text-lightWhiteLetter"
            >
              <button>Materials Managment</button>
            </Link>
            <Link
              to="/dashboard/history"
              onClick={handleNavigate}
              className="text-sm text-left py-2 px-4 hover:bg-pageSideMenuTextHover hover:rounded transition duration-300 text-lightWhiteLetter"
            >
              <button>History</button>
            </Link>
            <li className="border-b border-lightBlueLetter"></li>
            <Link
              to="/dashboard/stock"
              onClick={handleNavigate}
              className="text-2x1 text-left py-2 px-2 hover:bg-pageSideMenuTextHover hover:rounded transition duration-300 text-lightWhiteLetter font-medium"
            >
              <button>Stock</button>
            </Link>
            <li className="border-b border-lightBlueLetter"></li>
            <Link
              to="/dashboard/usuarios"
              onClick={handleNavigate}
              className="text-2x1 text-left py-2 px-2 hover:bg-pageSideMenuTextHover hover:rounded transition duration-300 text-lightWhiteLetter font-medium"
            >
              <button>Users</button>
            </Link>
            <Link
              to="/dashboard/new-user-form"
              onClick={handleNavigate}
              className="text-sm text-left py-2 px-4 hover:bg-pageSideMenuTextHover hover:rounded transition duration-300 text-lightWhiteLetter"
            >
              <button>Add User</button>
            </Link>
            
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
              className={`font-semibold ${assembly.completed_assembly ? "text-green-500" : "text-red-500"
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
        className={`flex-1 pl-2 pr-2 transition-all duration-300 ml-64 ${showChildRoutes ? "mr-" : "mr-64"
          }`}
      >
        {!showChildRoutes ? (
          <>
            <div>
              {/* Barra de progreso para proyectos visibles */}
              <div className="py-6 flex flex-col justify-left px-4 space-y-1">
                <div className="bg-contentCards p-5 rounded-lg shadow shadow-shadowBlueColor shadow-xl">
                  <h1 className="text-2xl text-left font-extrabold text-gradient bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500 mb-8">
                    Project progress
                  </h1>

                  {/* Barra de progreso horizontal con círculos de progreso */}
                  <div className="flex flex-wrap justify-start gap-6">
                    {currentProjects.map((project) => (
                      <div
                        key={project.id}
                        className="flex flex-col items-center"
                      >
                        {/* Número de identificación del proyecto */}
                        <span className="font-semibold text-sm text-gray-400 mb-2">
                          <strong>#{project.identification_number}</strong>
                        </span>

                        {/* Contenedor del círculo */}
                        <div className="relative w-24 h-24 mb-2">
                          {/* Fondo gris del círculo */}
                          <svg
                            className="absolute w-full h-full transform rotate-90"
                            viewBox="0 0 36 36"
                            width="100%"
                            height="100%"
                          >
                            <path
                              className="text-gray-600"
                              fill="none"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeDasharray="100, 100"
                              d="M18 2a16 16 0 1 1 0 32 16 16 0 1 1 0 -32"
                            />
                          </svg>

                          {/* Círculo de progreso */}
                          <svg
                            className="absolute w-full h-full transform rotate-90"
                            viewBox="0 0 36 36"
                            width="100%"
                            height="100%"
                          >
                            <path
                              className={`progress-circle ${progresses[project.id] < 50
                                ? "stroke-red-600"
                                : progresses[project.id] < 75
                                  ? "stroke-blue-600"
                                  : "stroke-green-600"
                                }`}
                              fill="none"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeDasharray={`${progresses[project.id]}, 100`}
                              d="M18 2a16 16 0 1 1 0 32 16 16 0 1 1 0 -32"
                            />
                          </svg>

                          {/* Texto del porcentaje */}
                          <div className="absolute text-xl font-semibold text-white">
                            {Math.round(progresses[project.id] || 0)}%
                          </div>
                        </div>

                        {/* Texto adicional para indicar estado */}
                        <div className="text-center text-xs text-gray-300">
                          <span className="font-semibold">
                            {progresses[project.id] >= 100
                              ? "Completado"
                              : "In Progress"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Controles de navegación con flechas y número de página */}
                  <div className="flex items-center justify-between mt-4">
                    <button
                      onClick={handlePrevious}
                      disabled={currentPage === 0}
                      className="p-2 bg-gray-600 text-white rounded-full disabled:opacity-50 transition duration-300 transform hover:scale-110 hover:bg-gray-500"
                    >
                      {/* Flecha hacia la izquierda */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="currentColor"
                        className="w-5 h-5 transition duration-300 transform hover:rotate-180"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                    </button>

                    {/* Indicador de número de página */}
                    <span className="text-sm font-medium text-lightGrayLetter">
                      Página {currentPage + 1} de {totalPages}
                    </span>

                    <button
                      onClick={handleNext}
                      disabled={currentPage >= totalPages - 1}
                      className="p-2 bg-gray-600 text-white rounded-full disabled:opacity-50 transition duration-300 transform hover:scale-110 hover:bg-gray-500"
                    >
                      {/* Flecha hacia la derecha */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="currentColor"
                        className="w-5 h-5 transition duration-300 transform hover:rotate-180"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
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
                      <strong>Identification Number:</strong>{" "}
                      {assembly.identification_number}
                    </p>
                    <p className="text-green-400 text-xs">
                      <strong>Delivery Date:</strong>{" "}
                      {new Date(assembly.delivery_date).toLocaleDateString()}
                    </p>
                    <p
                      className={`font-semibold text-xs ${assembly.completed_assembly
                        ? "text-green-500"
                        : "text-red-500"
                        }`}
                    >
                      <strong>Estado:</strong>{" "}
                      {assembly.completed_assembly ? "Completo" : "Incompleto"}
                    </p>
                    <p className="text-yellow-400 text-xs">
                      <strong>Price:</strong> ${assembly.price}
                    </p>
                    <p className="text-purple-400 text-xs">
                      <strong>Description:</strong> {assembly.description}
                    </p>
                  </div>
                ))}
              </section>
              {/* Projects Overview Section */}
              <h1 className="text-lg text-left font-extrabold text-gradient bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500 mb-8">
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

                    <p className="text-lightWhiteLetter mb-2">
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
          <div className="flex justify-center items-center text-sm text-lightWhiteLetter font-bold mb-4 mt-1">
            <Notifications />
          </div>
        </aside>
      )}
    </div>
  );
};

export default Dashboard;
