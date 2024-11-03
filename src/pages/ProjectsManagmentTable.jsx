import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

const ProjectsManagmentTable = () => {
  const apiIpAddress = import.meta.env.VITE_API_IP_ADDRESS; // API IP address

  // ACTIVE PROJECTS AND POST NEW PROJECT STATES
  const [activeProjects, setActiveProjects] = useState([]); // get active projects states

  // USEEFFECT API OPERATIONS
  useEffect(() => {
    fetchActiveProjects();
  }, []);
  const fetchActiveProjects = async () => {
    // Fetch active projects from API
    try {
      const response = await axios.get(
        `${apiIpAddress}/api/getProjectsActives`
      );
      setActiveProjects(response.data);
    } catch (error) {
      console.error("Error fetching projects info:", error);
    }
  };

  //HANDLE API OPERATIONS
  //HANDLE DELETE PROJECT OPERATIONS
  const handleDeleteProject = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this project? This action cannot be undone."
    );
    if (confirmDelete) {
      try {
        await axios.delete(`${apiIpAddress}/api/deleteProject/${id}`);
        fetchActiveProjects();
        alert("Project deletion successful");
      } catch (error) {
        console.error("Error deleting project:", error);
        alert("Project deletion failed");
      }
    }
  };

  // EDIT MODAL OPERATIONS
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => {
    // Open the modal
    setIsModalOpen(true);
  };
  const closeModal = () => {
    // Close the modal
    setIsModalOpen(false);
  };

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
  const startIndex = currentPage * recordsPerPage; // Calculate the start and end index for pagination
  const endIndex = startIndex + recordsPerPage;
  const currentProjects = activeProjects.slice(startIndex, endIndex);

  return (
    <>
      {/* PROJECTS MANAGEMENT TABLE */}
      <div className="px-10">
        <h2 className="text-xl pt-10 text-gray-300 font-bold">
          Projects Actives
        </h2>
        <div>
          <table
            className="text-sm table-auto w-full text-lightWhiteLetter"
            id="projects-actions"
          >
            <thead>
              <tr className="w-full bg-gray-700 text-left">
                <th className="px-4 py-2 border border-gray-500">Proj. ID</th>
                <th className="px-4 py-2 border border-gray-500" colSpan="2">
                  Description
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 shadow-lg">
              {currentProjects.map((project) => (
                <tr
                  key={project.id}
                  className="hover:bg-pageSideMenuTextHover transition duration-200"
                >
                  <td className="px-4 border-t border-r border-b border-gray-500">
                    #{project.identification_number}
                  </td>
                  <td className="px-4 border-t border-b border-gray-500">
                    {project.description}
                  </td>
                  <td className="px-4 border-t border-b border-gray-500">
                    <div className="flex justify-end items-center">
                      {/* EDIT BUTTON */}
                      <div className="p-2">
                        <button
                          onClick={openModal}
                          className="w-15 px-2 py-1 text-gray-400 text-xs bg-pageBackground border border-pageBackground hover:border hover:bg-green-900 hover:border-green-500 hover:text-green-300 rounded"
                        >
                          Edit
                        </button>
                      </div>
                      {/* DELETE BUTTON */}
                      <div className="p-2">
                        <button
                          onClick={() => handleDeleteProject(project.id)}
                          className="w-15 px-2 py-1 text-gray-400 hover:bg-red-900 text-xs hover:text-red-300 bg-pageBackground border border-pageBackground hover:border hover:border-red-500 rounded"
                        >
                          Delete
                        </button>
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
      </div>

      {/* MODAL SECTION FOR EDITING PROJECTS */}
      {isModalOpen && (
        <div className="fixed z-10 inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-gray-100">
              Add Assembly
            </h2>
            <form form onSubmit={handleAddAssembly}>
              <div className="mb-4">
                <label
                  htmlFor="assembly-name"
                  className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100"
                >
                  Assembly Name
                </label>
                <input
                  type="text"
                  id="assembly-name"
                  name="assembly-name"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-100"
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="assembly-description"
                  className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100"
                >
                  Assembly Description
                </label>
                <textarea
                  id="assembly-description"
                  name="assembly-description"
                  rows="3"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-100"
                  required
                ></textarea>
              </div>
              <div className="mb-6">
                <label
                  htmlFor="assembly-file"
                  className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100"
                >
                  Upload Assembly File (.xlsx)
                </label>
                <input
                  type="file"
                  id="assembly-file"
                  name="assembly-file"
                  accept=".xlsx"
                  className="mt-1 block w-full text-gray-900 dark:text-gray-100"
                  required
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 mr-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-200"
                >
                  Add Assembly
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition duration-200"
                >
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ProjectsManagmentTable;
