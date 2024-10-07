import React, { useState, useEffect } from "react";
import { Link, useNavigate, Outlet } from "react-router-dom";
import axios from "axios";
import Calendar from "react-calendar";
import "../index.css";
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);



const Dashboard = ({ onLogout }) => {
  const apiIpAddress = import.meta.env.VITE_API_IP_ADDRESS;

  const [projects, setProjects] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showChildRoutes, setShowChildRoutes] = useState(false);
  const [assemblies, setAssemblies] = useState([]);

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
        setProjects(projectsResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleLogout = () => {
    console.log("Cerrando sesión...");
    localStorage.removeItem("isAuthenticated");
    onLogout();
    navigate("/");
  };

  const addNotification = (type, message, details) => {
    const notification = { type, message, details };
    setNotifications((prevNotifications) => [
      ...prevNotifications,
      notification,
    ]);

    // Eliminar la notificación después de 10 segundos
    setTimeout(() => {
      setNotifications((prevNotifications) =>
        prevNotifications.filter((_, index) => index !== 0)
      );
    }, 10000);
  };

  const fetchNotifications = async () => {
    try {
      const arrivedResponse = await axios.get(
        `${apiIpAddress}/api/getItems/arrived`
      );
      const missingResponse = await axios.get(
        `${apiIpAddress}/api/getItems/missing`
      );
      const assemblyDeliveryResponse = await axios.get(
        `${apiIpAddress}/api/getAssemblyByDeliveryDate`
      );
      const assemblyCompletedResponse = await axios.get(
        `${apiIpAddress}/api/getAssemblyByCompletedDate`
      );

      arrivedResponse.data.forEach((item) => {
        addNotification(
          "success",
          `¡Nuevo material ha llegado! ID: ${item.id}, Nombre: ${item.name}, Cantidad: ${item.quantity}`,
          { id: item.id }
        );
      });

      missingResponse.data.forEach((item) => {
        addNotification(
          "warning",
          `¡Artículo faltante! ID: ${item.id}, Nombre: ${item.name}`,
          { id: item.id }
        );
      });

      assemblyDeliveryResponse.data.forEach((assembly) => {
        addNotification(
          "info",
          `¡Nuevo ensamblaje entregado! ID: ${assembly.id}, Descripción: ${assembly.description}`,
          { id: assembly.id }
        );
      });

      assemblyCompletedResponse.data.forEach((assembly) => {
        addNotification(
          "completed",
          `¡Ensamblaje completado! ID: ${assembly.id}, Identificación: ${assembly.identification_number}`,
          { id: assembly.id }
        );
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



  
  return (
    <div className="flex  bg-gray-900 text-white bg-gray-800">
      <aside
        className={`bg-gray-800 w-64 p-4 fixed inset-y-0 left-0 transition-transform transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <h2 className="text-xl font-bold mb-4">Menú</h2>
        <nav className="flex flex-col h-full justify-between">
          <ul className="flex flex-col space-y-1">
            <li>
              <Link
                to="/dashboard"
                className="text-sm hover:underline"
                onClick={() => setShowChildRoutes(false)}
              >
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                to="/dashboard/Me"
                className="text-sm hover:underline"
                onClick={handleNavigate}
              >
                Me
              </Link>
            </li>
            <li>
              <Link
                to="/dashboard/historico"
                className="text-sm hover:underline"
                onClick={handleNavigate}
              >
                Histórico
              </Link>
            </li>
            <li>
              <Link
                to="/dashboard/projects"
                className="text-sm hover:underline"
                onClick={handleNavigate}
              >
                Proyectos
              </Link>
            </li>
            <li>
              <Link
                to="/dashboard/usuarios"
                className="text-sm hover:underline"
                onClick={handleNavigate}
              >
                Usuarios
              </Link>
            </li>
            <li>
              <Link
                to="/dashboard/stock"
                className="text-sm hover:underline"
                onClick={handleNavigate}
              >
                Stock
              </Link>
            </li>
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
            <p className="text-blue-400">
              <strong>Número de Identificación:</strong>{" "}
              {assembly.identification_number}
            </p>
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
        className={`flex-1 p-4 transition-all duration-300 ml-64 ${
          showChildRoutes ? "mr-" : "mr-64"
        }`}
      >
        {!showChildRoutes ? (
          <>
          
             
          <div className="py-6 flex flex-col justify-leftt sm:py-12 px-4 space-y-3">
  <h1 className="text-lg font-semibold text-rigth py-3 text-white">Progress Bars</h1>

  {/* Progress Bars */}
  <div className="bg-gray-700 rounded-lg shadow-sm overflow-hidden p-1">
    <div className="relative h-4 flex items-center justify-center">
      <div className="absolute top-0 bottom-0 left-0 rounded-lg w-[15%] bg-red-500"></div>
      <div className="relative text-red-200 font-medium text-xs">15%</div>
    </div>
  </div>

  <div className="bg-gray-700 rounded-lg shadow-sm overflow-hidden p-1">
    <div className="relative h-4 flex items-center justify-center">
      <div className="absolute top-0 bottom-0 left-0 rounded-lg w-[36%] bg-orange-500"></div>
      <div className="relative text-orange-200 font-medium text-xs">36%</div>
    </div>
  </div>

  <div className="bg-gray-700 rounded-lg shadow-sm overflow-hidden p-1">
    <div className="relative h-4 flex items-center justify-center">
      <div className="absolute top-0 bottom-0 left-0 rounded-lg w-[60%] bg-blue-500"></div>
      <div className="relative text-blue-200 font-medium text-xs">60%</div>
    </div>
  </div>

  <div className="bg-gray-700 rounded-lg shadow-sm overflow-hidden p-1">
    <div className="relative h-4 flex items-center justify-center">
      <div className="absolute top-0 bottom-0 left-0 rounded-lg w-[75%] bg-green-500"></div>
      <div className="relative text-green-200 font-medium text-xs">75%</div>
    </div>
  </div>

  <div className="bg-gray-700 rounded-lg shadow-sm overflow-hidden p-1">
    <div className="relative h-4 flex items-center justify-center">
      <div className="absolute top-0 bottom-0 left-0 rounded-lg w-[100%] bg-indigo-500"></div>
      <div className="relative text-indigo-200 font-medium text-xs">100%</div>
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
            assembly.completed_assembly ? "text-green-500" : "text-red-500"
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
  <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mb-4">

    {projects.map((project) => (
      <div
        key={project.id}
        className="bg-gray-700 p-3 rounded-lg shadow-md text-sm cursor-pointer hover:bg-gray-600 transition duration-200"
        onClick={() => alert(`Detalles del Proyecto ID: ${project.id}`)}
      >
        <h2 className="font-bold text-lg">ID: {project.id}</h2>
        <p className="text-blue-400">
          <strong>Número de Identificación:</strong>{" "}
          {project.identification_number}
        </p>
        <p className="text-green-400">
          <strong>Fecha de Entrega:</strong>{" "}
          {new Date(project.delivery_date).toLocaleDateString()}
        </p>
        <p
          className={`font-semibold ${
            project.completed ? "text-green-500" : "text-red-500"
          }`}
        >
          <strong>Estado:</strong>{" "}
          {project.completed ? "Completo" : "Incompleto"}
        </p>
        <p className="text-yellow-400">
          <strong>Costo de Material:</strong> ${project.cost_material}
        </p>
        <p className="text-purple-400">
          <strong>Descripción:</strong> {project.description}
        </p>
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
        <aside className="bg-gray-800 w-64 p-4 fixed inset-y-0 right-0 overflow-y-auto ">
          <h2 className="text-xl font-bold mb-4">Calendario</h2>
          <Calendar />

          <h2 className="text-xl font-bold mb-4 mt-6">Notificaciones</h2>
          <ul className="space-y-1">
            {notifications.map((notification, index) => (
              <li
                key={index}
                className={`p-2 rounded ${
                  notification.type === "success"
                    ? "bg-green-600"
                    : notification.type === "warning"
                    ? "bg-yellow-600"
                    : notification.type === "info"
                    ? "bg-blue-600"
                    : "bg-red-600"
                }`}
              >
                <span className="font-bold">{notification.message}</span>
                <button
                  className="ml-2 text-sm text-gray-300"
                  onClick={() => handleNotificationClick(notification.details)}
                >
                  Detalles
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
