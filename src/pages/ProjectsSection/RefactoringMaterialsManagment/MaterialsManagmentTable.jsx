import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { FaArrowLeft, FaArrowRight, FaSync } from "react-icons/fa";
import Modal from "../../../components/Modal";
import ModalAcept from "../../../components/ModalAcept";
import AppMaterials from "./MaterialsAssemblies";

const ProjectsManagmentTable = () => {
  const apiIpAddress = import.meta.env.VITE_API_IP_ADDRESS; // API IP address

  // ACTIVE PROJECTS AND POST NEW PROJECT STATES
  const [activeProjects, setActiveProjects] = useState([]); // get active projects states
  const [loading, setLoading] = useState(false); // loading state

  // USEEFFECT API OPERATIONS
  useEffect(() => {
    fetchActiveProjects();
  }, []);

  const fetchActiveProjects = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${apiIpAddress}/api/getProjectsActives`
      );
      setActiveProjects(response.data);
    } catch (error) {
      console.error("Error fetching projects info:", error);
    } finally {
      setLoading(false);
    }
  }, [apiIpAddress]);

  // PAGINATION OPERATIONS
  const [currentPage, setCurrentPage] = useState(0);
  const recordsPerPage = 10; // Number of records per page
  const handleNextPage = () => {
    // Go to the next page
    setCurrentPage((prevPage) => prevPage + 1);
  };
  const handlePreviousPage = () => {
    // Go to the previous page
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 0));
  };

  const currentProjects = useMemo(() => {
    const startIndex = currentPage * recordsPerPage; // Calculate the start and end index for pagination
    const endIndex = startIndex + recordsPerPage;
    return activeProjects.slice(startIndex, endIndex);
  }, [activeProjects, currentPage, recordsPerPage]);

  const endIndex = (currentPage + 1) * recordsPerPage;

  const truncateDescription = (description) => {
    return description.length > 145 ? description.substring(0, 145) + "  . . ." : description;
  };

  return (
    <>
      {/* PROJECTS MANAGEMENT TABLE */}
      <div className="">
               <div className="flex items-center justify-between py-1 mt-5">
          <button
            onClick={fetchActiveProjects}
            className="p-2 ml-auto text-white rounded hover:bg-gray-800 transition duration-200"
          >
            <FaSync color="gray" size={15} />
          </button>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div>
            <table
              className="text-sm table-auto w-full text-lightWhiteLetter"
              id="projects-actions"
            >
              <thead>
                <tr className="w-full bg-blue-900 text-left">
                  <th className="px-4 py-2 border border-blue-500">Identifier </th>
                  <th className="px-4 py-2 border border-blue-500" colSpan="2">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody className="shadow-lg">
                {currentProjects.map((project) => (
                  <tr
                    key={project.id}
                    className="hover:bg-pageSideMenuTextHover transition duration-200"
                  >
                    <td className="px-4 border-t border-r border-b border-gray-500">
                      #{project.identification_number}
                    </td>
                    <td className="px-4 py-2 border-t border-b border-gray-500">
                      {truncateDescription(project.description)}
                    </td>
                    <td className="px-4 border-t border-b border-gray-500">
                      <div className="flex justify-end items-center">
                      <div className="p-2">
                      <AppMaterials
                      id={
                        project.id
                      }
                      />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
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
        )}
      </div>
    </>
  );
};

export default ProjectsManagmentTable;
