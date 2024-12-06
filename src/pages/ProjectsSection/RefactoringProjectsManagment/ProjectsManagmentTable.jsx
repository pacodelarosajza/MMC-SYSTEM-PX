import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import AppForm from "./ProjectsManagmentForm"; //Import projects form file
import { FaArrowLeft, FaArrowRight, FaSync } from "react-icons/fa";
import Modal from "../../../components/Modal";
import ModalAcept from "../../../components/ModalAcept";
import AppUpdate from "../RefactoringProjectsManagment/Update";

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

  const [isModalErrorOpen, setIsModalErrorOpen] = useState(false);
  const [isModalDeleteSuccessOpen, setIsModalDeleteSuccessOpen] =
    useState(false);
  const [isModalDeleteAceptOpen, setIsModalDeleteAceptOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);

  const handleDeleteProject = (id) => {
    setProjectToDelete(id); // Guardamos el ID del proyecto a eliminar
    setIsModalDeleteAceptOpen(true); // Mostramos el modal de confirmación
  };

  const [isModalCanselEditionOpen, setIsModalCanselEditionOpen] = useState(false);
  const [isModalCanselEditionSuccessOpen, setIsModalCanselEditionSuccessOpen] = useState(false);

  const confirmDeleteProject = useCallback(async () => {
    try {
      if (projectToDelete) {
        try {
          await axios.delete(
            `${apiIpAddress}/api/deleteProject/${projectToDelete}`
          );
          fetchActiveProjects(); // Actualizamos la lista de proyectos activos
          setIsModalDeleteSuccessOpen(true); // Mostramos el modal de éxito
        } catch (error) {
          console.error("Error al eliminar el proyecto:", error);
          setIsModalErrorOpen(true); // Mostramos el modal de error
        } finally {
          setIsModalDeleteAceptOpen(false); // Cerramos el modal de confirmación
          setProjectToDelete(null); // Reiniciamos el proyecto a eliminar
        }
      }
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  }, [apiIpAddress, projectToDelete, fetchActiveProjects]);

  const cancelDeleteProject = () => {
    setIsModalDeleteAceptOpen(false);
    setProjectToDelete(null);
  };

  // EDIT MODAL OPERATIONS
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => {
    // Open the modal
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalCanselEditionSuccessOpen(false);
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
    return description.length > 145 ? description.substring(0, 145) + "  . . ." : description;
  };

  return (
    <>
      {/* PROJECTS MANAGEMENT TABLE */}
      <div className="">
                <div className="flex items-center justify-end py-1 mt-5">
          <button
            onClick={fetchActiveProjects}
            className="p-2 mx-4 text-white rounded hover:bg-gray-800 transition duration-200"
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
                  <th className="px-4 py-2 border-x border-gray-500">Delivery Date</th>
                  <th className="px-4 py-2 border-l border-gray-500 rounded-tr-lg" colSpan="2">
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
                    <td className="px-4 border-t border-r border-b border-gray-500">
                      {project.delivery_date}
                    </td>
                    <td className="px-4 py-2 border-t border-b border-gray-500">
                      {truncateDescription(project.description)}
                    </td>
                    <td className="px-4 border-t border-b border-gray-500">
                      <div className="flex justify-end items-center">
                        {/* EDIT BUTTON */}
                        <div className="p-2">
                        <AppUpdate id={ project.id}/>
                        </div>
                        {/* DELETE BUTTON */}
                        <div className="p-2">
                          <button
                            onClick={() => handleDeleteProject(project.id)}
                            className="w-15 px-2 py-1 font-medium hover:bg-red-600 text-sm bg-pageBackground rounded"
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
        )}
      </div>

      {/* MODAL SECTION FOR ERROR FORM WINDOW */}
      <Modal
        isOpen={isModalErrorOpen}
        onClose={() => setIsModalErrorOpen(false)}
        title="Error"
      >
        There was an error deleting the project.
      </Modal>

      {/* MODAL SECTION FOR SUCCESSFUL PROJECT DELETION */}
      <Modal
        isOpen={isModalDeleteSuccessOpen}
        onClose={() => setIsModalDeleteSuccessOpen(false)}
        title="Project Deletion Successful"
      >
        The project has been successfully deleted.
      </Modal>

      {/* MODAL SECTION FOR ACCEPT PROJECT DELETION */}
      <ModalAcept
        isOpen={isModalDeleteAceptOpen}
        onClose={() => setIsModalDeleteAceptOpen(false)}
        onContinue={confirmDeleteProject}
        title="Delete Project"
      >
        Are you sure you want to delete this project?
      </ModalAcept>

      {/* MODAL SECTION FOR EDITING PROJECTS  */}
      {isModalOpen && (
        <div className="fixed py-5 z-10 inset-0 flex items-center justify-center bg-black bg-opacity-50 overflow-auto">
          <div className="bg-gray-800 rounded-lg p-4 mt-5 max-w-6xl w-full max-h-full overflow-y-auto">
            <AppForm />
            <div className="flex justify-end pr-2">
              <button
                onClick={
                  () => setIsModalCanselEditionOpen(true)
                }
                className="px-12 py-2 mx-1 bg-orange-900 text-sm text-yellow-300 bg-pageBackground border border-yellow-500 rounded hover:bg-yellow-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL SECTION FOR CANCEL EDITING PROJECTS */}
      <ModalAcept
        isOpen={isModalCanselEditionOpen}
        onClose={() => setIsModalCanselEditionOpen(false)}
        onContinue={() => {
          setIsModalCanselEditionOpen(false),
          setIsModalOpen(false),
          setIsModalCanselEditionSuccessOpen(true)
          }}
        title="Cancel Editing"
      >
        Are you sure you want to cancel editing this project?
      </ModalAcept>

      <Modal
        isOpen={isModalCanselEditionSuccessOpen}
        onClose={closeModal}
        title="Cancel Editing Successful"
      >
        The project editing has been successfully canceled.
      </Modal>
    </>
  );
};

export default ProjectsManagmentTable;
