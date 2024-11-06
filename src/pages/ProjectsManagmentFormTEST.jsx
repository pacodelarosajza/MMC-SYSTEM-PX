import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { CopyToClipboard } from "react-copy-to-clipboard";
import Modal from "./Modal";
import ModalAcept from "./ModalAcept";

const Projects = ({ setShowChildRoutes }) => {
  const apiIpAddress = import.meta.env.VITE_API_IP_ADDRESS;

  const [activeProjects, setActiveProjects] = useState([]);
  const [progresses, setProgresses] = useState({});
  const [currentPage, setCurrentPage] = useState(0);
  const recordsPerPage = 5;

  useEffect(() => {
    const fetchProjectsData = async () => {
      try {
        const response = await axios.get(`${apiIpAddress}/api/getProjectsActives`);
        setActiveProjects(response.data);

        // Calcula el progreso para cada proyecto al cargar los datos
        response.data.forEach((project) => {
          getProjectProgress(project.id);
        });
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    fetchProjectsData();
  }, [apiIpAddress]);

  const getProjectProgress = async (projectId) => {
    try {
      const response = await axios.get(`${apiIpAddress}/api/getItems/project/${projectId}`);
      const items = response.data;

      const arrivedItems = items.filter((item) => item.in_subassembly === 1);
      const totalItems = items.length;
      const progressPercentage = totalItems === 0 ? 0 : (arrivedItems.length / totalItems) * 100;

      setProgresses((prevProgresses) => ({
        ...prevProgresses,
        [projectId]: progressPercentage,
      }));
    } catch (error) {
      console.error(`Error fetching project progress for project ${projectId}:`, error);
    }
  };

  const startIndex = currentPage * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const currentProjects = activeProjects.slice(startIndex, endIndex);

  const handleNextPage = () => setCurrentPage((prev) => prev + 1);
  const handlePreviousPage = () => setCurrentPage((prev) => Math.max(prev - 1, 0));

  return (
    <div className="px-4 py-5 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Projects Under Development</h1>
      <div className="card" id="pj-list-projects">
        <table className="text-sm table-auto w-full border text-lightWhiteLetter">
          <thead>
            <tr className="bg-gray-700 text-left">
              <th className="px-4 py-2 border border-gray-500">Proj. ID</th>
              <th className="px-4 py-2 border border-gray-500">Progress</th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 shadow-lg">
            {currentProjects.map((project) => (
              <tr key={project.id} className="hover:bg-pageSideMenuTextHover cursor-pointer">
                <td className="px-4 py-2 border border-gray-500">
                  <strong># </strong>{project.identification_number}
                </td>
                <td className="px-4 py-2 border border-gray-500">
                  <div className="relative w-24 h-24">
                    <svg className="absolute w-full h-full transform rotate-90" viewBox="0 0 36 36">
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
                    <svg className="absolute w-full h-full transform rotate-90" viewBox="0 0 36 36">
                      <path
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeDasharray={`${progresses[project.id] || 0}, 100`}
                        d="M18 2a16 16 0 1 1 0 32 16 16 0 1 1 0 -32"
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center font-bold text-sm">
                      {Math.round(progresses[project.id] || 0)}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-between items-center mt-4">
          {currentPage > 0 && (
            <button onClick={handlePreviousPage} className="px-4 py-2 bg-gray-500 text-gray-300 rounded hover:bg-gray-700">
              <FaArrowLeft />
            </button>
          )}
          <span className="text-sm text-gray-300">Page {currentPage + 1} of {Math.ceil(activeProjects.length / recordsPerPage)}</span>
          {endIndex < activeProjects.length && (
            <button onClick={handleNextPage} className="px-4 py-2 bg-gray-500 text-gray-300 rounded hover:bg-gray-700">
              <FaArrowRight />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Projects;
