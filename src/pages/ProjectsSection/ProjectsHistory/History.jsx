import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import {
  FaChevronDown,
  FaChevronUp,
  FaArrowLeft,
  FaArrowRight,
  FaShare,
} from "react-icons/fa";
import { CopyToClipboard } from "react-copy-to-clipboard";

const History = ({ setShowChildRoutes }) => {
  // IP Address for the API
  const apiIpAddress = import.meta.env.VITE_API_IP_ADDRESS;

  // State hooks
  const [activeProjects, setActiveProjects] = useState([]);
  const [adminProjects, setAdminProjects] = useState({});
  const [assemblies, setAssemblies] = useState({});
  const [isOpen, setIsOpen] = useState({});
  const [currentPage, setCurrentPage] = useState(0);
  const [date, setDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isFocusedContent, setIsFocusedContent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [textToCopy, setTextToCopy] = useState(""); // Texto para copiar

  // Constants
  const recordsPerPage = 25;

  // Pagination handlers
  const handleNextPage = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  const handlePreviousPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 0));
  };

  // Navigation handler
  const handleNavigate = async () => {
    setLoading(true);
    setError(null);
    try {
      // Simular una operación asíncrona
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setShowChildRoutes(true);
    } catch (err) {
      setError("Error al navegar");
    } finally {
      setLoading(false);
    }
  };

  // Pagination logic
  const startIndex = currentPage * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const currentProjects = activeProjects.slice(startIndex, endIndex);

  // Fetch projects info on component mount or apiIpAddress change
  useEffect(() => {
    const fetchActiveProjects = async () => {
      try {
        const activeProjectsResponse = await axios.get(
          `${apiIpAddress}/api/getProjectsInctives`
        );
        const projects = activeProjectsResponse.data;
        setActiveProjects(projects);

        const adminProjectsData = {};
        for (const project of projects) {
          try {
            const adminProjectResponse = await axios.get(
              `${apiIpAddress}/api/projects/${project.id}/admins`
            );
            adminProjectsData[project.id] = adminProjectResponse.data;
          } catch (error) {
            adminProjectsData[project.id] = null;
          }
        }

        setAdminProjects(adminProjectsData);
      } catch (error) {
        console.error(
          "Error fetching active projects or admin projects:",
          error
        );
      }
    };

    fetchActiveProjects();
  }, [apiIpAddress]);

  // Function to get project manager
  const getProjectManager = (projectId) => {
    return Array.isArray(adminProjects[projectId]) &&
      adminProjects[projectId].length > 0
      ? adminProjects[projectId][0]?.["user.user_number"] || "Data N/A"
      : "N/A";
  };

  // Event handlers
  const handleDivClick = () => {
    setIsEditing(true);
  };

  const handleDateChange = (event) => {
    setDate(event.target.value);
  };

  const handleBlur = () => {
    setIsEditing(false);
  };

  const handleConfirmClick = () => {
    const confirmChange = window.confirm(
      `¿Deseas añadir la fecha ${date} como fecha de llegada del material?`
    );
    if (confirmChange) {
      setIsEditing(false);
    }
  };

  const handleSearch = async () => {
    try {
      const response = await fetch(`${apiIpAddress}/api/getProjects`);
      const data = await response.json();

      // Asegúrate de que la respuesta sea un array o conviértela
      const projects = Array.isArray(data) ? data : [data];

      // Filtra los proyectos que contienen el número de búsqueda
      const filteredProjects = projects.filter((project) =>
        project.identification_number.toString().includes(searchQuery)
      );

      setSearchResults(filteredProjects);
    } catch (error) {
      console.error("Error fetching search results:", error);
    }
  };

  const handleContentFocus = () => {
    setIsFocusedContent(true);
  };

  const handleContentBlur = () => {
    setIsFocusedContent(false);
  };

  const handleButtonClickBySearch = () => {
    handleSearch();
    handleContentFocus();
  };

  // Utility function
  const truncateDescription = (description, maxLength) => {
    if (description.length <= maxLength) {
      return description;
    }
    return description.substring(0, maxLength) + "...";
  };

  const navigate = useNavigate();

  const handleShareProject = (projectId) => {
    if (projectId) {
      navigate("/dashboard/old-project", { state: { projectId } });
    } else {
      console.error("Project ID is not defined");
    }
  };

  const getStatusStyle = (completed) => {
    return completed
      ? "text-green-500 italic font-medium"
      : "text-orange-500 italic font-medium";
  };

  const handleMoreInfo = (projectId) => {
    // Removed console.log statement
  };

  return (
    <div className="min-h-screen p-8">
      <div className="flex flex-col items-center justify-center p-[5rem]">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-400 mb-4">
            Search by project identifier
          </h1>
        </div>
        <div className="items-center">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onBlur={handleContentBlur}
            placeholder="project by identifier"
            className="w-96 p-2 rounded-l focus:bg-gray-800 hover:bg-gray-800 text-sm text-gray-200 bg-pageBackground border border-blue-500 focus:outline-none focus:border-blue-400"
          />{" "}
          <button
            onClick={handleButtonClickBySearch}
            className="px-4 py-2 ml-1 bg-blue-600 border border-blue-600 text-sm rounded-r hover:bg-blue-500 font-medium"
          >
            <strong>Search</strong>
          </button>
        </div>
      </div>
      <br />
      <div className="card" id="pj-list-projects">
        <table className="min-w-full px-5 border-t-2 border-b-2 border-blue-400">
          <thead>
            <tr className="w-full bg-indigo-900 text-left">
              <th className="bg-gray-900 font-semibold text-gray-300 text-left px-4 py-2 border border-blue-500">
                Identifier
              </th>
              {isFocusedContent && (
                <th className="font-semibold text-gray-300 text-left px-4 py-2 border border-blue-500">
                  Status
                </th>
              )}
              <th
                className="font-semibold text-gray-300 text-left px-4 py-2 border border-blue-500"
                colSpan="2"
              >
                Description
              </th>
            </tr>
          </thead>
          <tbody className="shadow-lg">
            {isFocusedContent ? (
              Array.isArray(searchResults) && searchResults.length > 0 ? (
                searchResults.map((project) => (
                  <tr
                    key={project.id}
                    className="hover:bg-gray-700 hover:bg-opacity-30 border border-gray-700 text-sm"
                    onClick={() => handleMoreInfo(project.id)}
                  >
                    <td className="px-4 py-1 border border-gray-700">
                      #{project.identification_number}
                    </td>
                    <td className={`px-4 py-1 border border-gray-700 ${getStatusStyle(project.completed)}`}>
                      {project.completed ? "Completed" : "In Progress"}
                    </td>
                    <td className="px-4 py-1 border-t border-b border-l border-gray-700">
                      {truncateDescription(project.description, 80)}
                    </td>

                    <td className="px-4 py-1 border-t border-b border-r border-gray-700">
                      <div className="flex justify-end">
                        <button
                          id="old-project-botton"
                          className="px-4 py-2 text-sm bg-gray-800 text-gray-400 rounded hover:bg-gray-700 hover:text-gray-200"
                          onClick={() => handleShareProject(project.id)}
                          disabled={loading}
                        >
                          <FaShare />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="px-4 py-2 border border-gray-500 text-center"
                  >
                    No projects found
                  </td>
                </tr>
              )
            ) : (
              currentProjects.map((project) => (
                <tr
                  key={project.id}
                  className="hover:bg-gray-700 border border-gray-700 text-sm"
                  onClick={() => handleMoreInfo(project.id)}
                >
                  <td className="px-4 py-1 border border-gray-700">
                    #{project.identification_number}
                  </td>
                  <td className="px-4 py-1 border-t border-b border-l border-gray-700">
                    {truncateDescription(project.description, 80)}
                  </td>
                  <td className="px-4 py-1 border-t border-b border-r border-gray-700">
                    <div className="flex justify-end">
                      {loading && <p>Cargando...</p>}
                      {error && <p style={{ color: "red" }}>{error}</p>}
                      <button
                        id="old-project-button"
                        className="px-4 py-2 text-sm text-gray-300 bg-gray-800 rounded hover:bg-gray-500 hover:text-gray-800"
                        onClick={() => handleShareProject(project.id)}
                        disabled={loading}
                      >
                        <FaShare />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="flex justify-between items-center mt-4">
          {currentPage > 0 && (
            <button
              className="px-4 py-2 bg-gray-500 text-sm text-gray-300 bg-pageBackground rounded hover:bg-gray-700"
              onClick={handlePreviousPage}
            >
              <FaArrowLeft />
            </button>
          )}
          <span className="text-sm text-gray-300">
            Page {currentPage + 1} of{" "}
            {Math.ceil(activeProjects.length / recordsPerPage)}
          </span>
          {endIndex < activeProjects.length && (
            <button
              className="px-4 py-2 bg-gray-500 text-sm text-gray-300 bg-pageBackground rounded hover:bg-gray-700"
              onClick={handleNextPage}
              disabled={endIndex >= activeProjects.length}
            >
              <FaArrowRight />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default History;
