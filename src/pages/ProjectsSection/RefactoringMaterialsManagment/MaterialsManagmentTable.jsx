import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { FaArrowLeft, FaArrowRight, FaSync } from "react-icons/fa";
import Modal from "../../../components/Modal";
import ModalAcept from "../../../components/ModalAcept";
import AppAddMaterials from "./MaterialsAssemblies";
import AppCtrlMaterials from "./CtrlMaterials.jsx"; // Import the new component

const ProjectsManagmentTable = () => {
  const apiIpAddress = import.meta.env.VITE_API_IP_ADDRESS; // API IP address

  // ACTIVE PROJECTS AND POST NEW PROJECT STATES
  const [activeProjects, setActiveProjects] = useState([]); // get active projects states
  const [loading, setLoading] = useState(false); // loading state
  const [showContainer, setShowContainer] = useState(false); // state to manage container visibility
  const [selectedProjectId, setSelectedProjectId] = useState(null);

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
    if (!description) {
      return "No description available";
    }
    return description.length > 145
      ? description.substring(0, 145) + "  . . ."
      : description;
  };

  const toggleContainer = (projectId) => {
    setShowContainer((prevShowContainer) => !prevShowContainer);
    setSelectedProjectId(projectId);
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
                <tr className="w-full text-indigo-400 text-left ">
                  <th className="px-4 py-2 rounded-tl-lg">Identifier</th>
                  <th
                    className="px-4 py-2 border-l border-gray-500 rounded-tr-lg"
                    colSpan="2"
                  >
                    Description
                  </th>
                </tr>
              </thead>
              <tbody className="shadow-lg">
                {currentProjects.map((project) => {
                  const projectId = project.id;
                  return (
                    <tr
                      key={projectId}
                      className="hover:bg-pageSideMenuTextHover transition duration-200"
                    >
                      <td className="px-4 border-t border-r border-b border-gray-500">
                        #{project.identification_number}
                      </td>
                      <td className=" pl-4 border-t border-b border-gray-500">
                        {truncateDescription(project.description)}
                      </td>
                      <td className="pr-4 border-t border-b border-gray-500">
                        <div className="flex justify-end items-center">
                          <AppAddMaterials id={project.id} />
                          <button
                            className="w-15 px-2 py-1 font-medium hover:bg-indigo-600 text-sm bg-pageBackground rounded"
                            onClick={() => toggleContainer(projectId)}
                          >
                            Ctrl Mts
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
            {showContainer && selectedProjectId && (
              <div className="mt-10">
                <AppCtrlMaterials id={selectedProjectId} />
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default ProjectsManagmentTable;
