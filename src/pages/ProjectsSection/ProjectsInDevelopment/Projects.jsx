import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import AppProjectDetails from "./ProjectDetails";
import AppProjectCosts from "./CostProject";
import { FaArrowLeft, FaArrowRight, FaShare, FaTimes } from "react-icons/fa";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSync } from "@fortawesome/free-solid-svg-icons";
import Modal from "../../../components/Modal";
import ProjectProgressChart from "./ProjectProgressChart"; // Import the new component
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import SelectedProjectIdentification from "./AssemlyProgressChart";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Projects = ({ setShowChildRoutes }) => {
  const apiIpAddress = import.meta.env.VITE_API_IP_ADDRESS;
  const [activeProjects, setActiveProjects] = useState([]);
  const [adminProjects, setAdminProjects] = useState({});
  const [userOperProjects, setUserOperProjects] = useState({});
  const [assemblies, setAssemblies] = useState({});
  const [items, setItems] = useState({});
  const [progresses, setProgresses] = useState({});
  const [assemblyProgresses, setAssemblyProgresses] = useState({});
  const [currentPage, setCurrentPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isModalReceivedSuccess, setIsModalReceivedSuccess] = useState(false);
  const [isModalNotReceivedSuccess, setIsModalNotReceivedSuccess] =
    useState(false);
  const [isFocusedContent, setIsFocusedContent] = useState(false);
  const [reload, setReload] = useState(false);
  const [isProjectCompleted, setIsProjectCompleted] = useState(false);
  const [isNoAssembliesModalOpen, setIsNoAssembliesModalOpen] = useState(false);
  const [noAssembliesProjectId, setNoAssembliesProjectId] = useState(null);
  const [laborCost, setLaborCost] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [profitMargin, setProfitMargin] = useState(0);
  const [sellingPrice, setSellingPrice] = useState(0);

  const recordsPerPage = 5;
  const navigate = useNavigate();

  const handleNextPage = () => setCurrentPage((prevPage) => prevPage + 1);
  const handlePreviousPage = () =>
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 0));

  const startIndex = currentPage * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const currentProjects = activeProjects.slice(startIndex, endIndex);

  useEffect(() => {
    const interval = setInterval(() => {
      setReload((prev) => !prev);
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchActiveProjects = async () => {
      setLoading(true);
      try {
        const activeProjectsResponse = await axios.get(
          `${apiIpAddress}/api/getProjectsActives`
        );
        const projects = activeProjectsResponse.data;
        setActiveProjects(projects);

        const adminProjectsData = {};
        const userOperProjectsData = {};
        const assembliesData = {};
        const itemsData = {};

        for (const project of projects) {
          try {
            const adminProjectResponse = await axios.get(
              `${apiIpAddress}/api/projects/${project.id}/admins`
            );
            adminProjectsData[project.id] = adminProjectResponse.data;
          } catch {
            adminProjectsData[project.id] = null;
          }

          try {
            const userOperProjectResponse = await axios.get(
              `${apiIpAddress}/api/projects/${project.id}/users`
            );
            userOperProjectsData[project.id] = userOperProjectResponse.data;
          } catch {
            userOperProjectsData[project.id] = null;
          }

          try {
            const assembliesResponse = await axios.get(
              `${apiIpAddress}/api/assembly/project/${project.id}`
            );
            assembliesData[project.id] = assembliesResponse.data;

            for (const assembly of assembliesResponse.data) {
              try {
                const itemsResponse = await axios.get(
                  `${apiIpAddress}/api/getItems/project/assembly/${project.id}/${assembly.id}`
                );
                itemsData[assembly.id] = itemsResponse.data;
              } catch {
                itemsData[assembly.id] = null;
              }
            }
          } catch {
            assembliesData[project.id] = null;
          }
        }

        setAdminProjects(adminProjectsData);
        setUserOperProjects(userOperProjectsData);
        setAssemblies(assembliesData);
        setItems(itemsData);

        projects.forEach((project) => getProjectProgress(project.id));
      } catch (error) {
        console.error(
          "Error fetching active projects or admin projects:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchActiveProjects();
  }, [apiIpAddress, reload]);

  const getProjectProgress = async (projectId) => {
    try {
      const response = await axios.get(
        `${apiIpAddress}/api/getItems/project/${projectId}`
      );
      const items = response.data;
      const arrivedItems = items.filter((item) => item.in_subassembly === 1);
      const totalItems = items.length;
      const progressPercentage =
        totalItems === 0 ? 0 : (arrivedItems.length / totalItems) * 100;

      setProgresses((prevProgresses) => ({
        ...prevProgresses,
        [projectId]: progressPercentage,
      }));

      if (progressPercentage === 100) {
        await axios.patch(`${apiIpAddress}/api/patchProject/${projectId}`, {
          completed: 1,
        });
        setIsProjectCompleted(true);
      }
    } catch (error) {
      console.error(
        `Error fetching project progress for project ${projectId}:`,
        error
      );
    }
  };

  const getAssemblyProgress = async (projectId) => {
    try {
      const assembliesResponse = await axios.get(
        `${apiIpAddress}/api/assembly/project/${projectId}`
      );
      const assemblies = assembliesResponse.data;
      const assemblyProgressData = {};

      for (const assembly of assemblies) {
        const response = await axios.get(
          `${apiIpAddress}/api/getItems/project/assembly/${projectId}/${assembly.id}`
        );
        const items = Array.isArray(response.data) ? response.data : [];
        const arrivedItems = items.filter((item) => item.in_subassembly === 1);
        const totalItems = items.length;
        const progressPercentage =
          totalItems === 0 ? 0 : (arrivedItems.length / totalItems) * 100;

        assemblyProgressData[assembly.id] = progressPercentage;
      }

      setAssemblyProgresses((prevProgresses) => ({
        ...prevProgresses,
        [projectId]: assemblyProgressData,
      }));
    } catch (error) {
      console.error(
        `Error fetching assembly progress for project ${projectId}:`,
        error
      );
    }
  };

  useEffect(() => {
    if (selectedProject) {
      getAssemblyProgress(selectedProject.id);
    }
  }, [selectedProject, assemblies]);

  useEffect(() => {
    if (selectedProject) {
      const projectLaborCost = selectedProject.labor_cost || 0;
      const projectMaterialCost = selectedProject.cost_material || 0;
      const projectTotalCost = projectLaborCost + projectMaterialCost;
      const projectProfitMargin = selectedProject.profit_margin || 0;
      const projectSellingPrice = projectTotalCost * (1 + projectProfitMargin / 100);

      setLaborCost(projectLaborCost);
      setTotalCost(projectTotalCost);
      setProfitMargin(projectProfitMargin);
      setSellingPrice(projectSellingPrice);
    }
  }, [selectedProject]);

  const getProjectManager = (projectId) => {
    if (
      Array.isArray(adminProjects[projectId]) &&
      adminProjects[projectId].length > 0
    ) {
      return adminProjects[projectId].map(
        (admin) => admin["user.user_number"] || "Data N/A"
      );
    } else {
      return ["N/A"];
    }
  };

  const getUserOperational = (projectId) => {
    if (
      Array.isArray(userOperProjects[projectId]) &&
      userOperProjects[projectId].length > 0
    ) {
      return userOperProjects[projectId].map(
        (user) => user["user.user_number"] || "Data N/A"
      );
    } else {
      return ["N/A"];
    }
  };

  const handleSelectProject = (projectId) => {
    setLoading(true);
    const project = currentProjects.find((p) => p.id === projectId);
    if (assemblies[projectId] && assemblies[projectId].length > 0) {
      setSelectedProject(project);
    } else {
      setNoAssembliesProjectId(project.identification_number);
      setIsNoAssembliesModalOpen(true);
    }
    setLoading(false);
  };

  const handleSearch = async () => {
    try {
      const response = await fetch(`${apiIpAddress}/api/getProjects`);
      const data = await response.json();
      const projects = Array.isArray(data) ? data : [data];
      const filteredProjects = projects.filter((project) =>
        project.identification_number.toString().includes(searchQuery)
      );
      setSearchResults(filteredProjects);
    } catch (error) {
      console.error("Error fetching search results:", error);
    }
  };

  const handleContentFocus = () => setIsFocusedContent(true);
  const handleContentBlur = () => setIsFocusedContent(false);
  const handleButtonClickBySearch = () => {
    handleSearch();
    handleContentFocus();
  };

  const truncateDescription = (description, maxLength) => {
    if (!description) {
      return "No description available";
    }
    if (description.length <= maxLength) {
      return description;
    }
    return description.substring(0, maxLength) + "...";
  };

  const getProgressColor = (progress) => {
    if (progress < 25) return "rgba(255, 99, 132, 0.6)";
    if (progress < 50) return "rgba(54, 162, 235, 0.6)";
    return "rgba(75, 192, 192, 0.6)";
  };

  const handleReloadData = () => {
    setReload((prev) => !prev);
    getProjectProgress(selectedProject.id);
    getAssemblyProgress(selectedProject.id);
  };

  const handleDeselectProject = () => {
    setSelectedProject(null);
  };

  const handleShareProject = (projectId) => {
    if (projectId) {
      navigate("/dashboard/old-project", { state: { projectId } });
    } else {
      console.error("Project ID is not defined");
    }
  };

  const handleModalClose = () => {
    setIsProjectCompleted(false);
    window.location.reload();
  };

  return (
    <>
      <div className="mx-5 min-h-screen">
        <div className="flex justify-between items-center pt-4 pb-4 mb-5">
          <div className="flex justify-center items-center">
            <h1 className="text-3xl font-extrabold text-gray-500">
              Projects Under Development
            </h1>
            <button
              onClick={handleReloadData}
              className="p-2 my-4 mx-4 text-white rounded hover:bg-gray-800 transition duration-200"
              title="Refresh data"
            >
              <FontAwesomeIcon icon={faSync} color="gray" size="lg" />
            </button>
          </div>
          <div className="flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onBlur={handleContentBlur}
              placeholder="project id. 000351 ..."
              className="w-80 p-2 rounded-l focus:bg-gray-700 hover:bg-gray-700 text-sm text-gray-200 bg-gray-800 border border-blue-500 focus:outline-none focus:border-blue-400"
            />
            <button
              onClick={handleButtonClickBySearch}
              className="px-4 py-2 ml-1 bg-blue-600 border border-blue-600 text-sm rounded-r hover:bg-blue-500 font-medium"
            >
              <strong>Search</strong>
            </button>
          </div>
        </div>
        <div className="text-gray-500">
          {isFocusedContent ? (
            <table
              className="text-sm table-auto w-full text-lightWhiteLetter"
              id="projects-actions"
            >
              <thead>
                <tr className="w-full text-indigo-400 text-left ">
                  <th className="px-4 py-2 rounded-tl-lg">Identifier</th>
                  <th className="px-4 py-2 border-l border-gray-600 rounded-tr-lg">
                    Description
                  </th>
                  <th className="px-4 py-2 border-l border-gray-600 rounded-tr-lg">
                    status
                  </th>
                </tr>
              </thead>
              <tbody className="shadow-lg">
                {Array.isArray(searchResults) && searchResults.length > 0 ? (
                  searchResults.map((project) => (
                    <tr
                      key={project.id}
                      className="cursor-pointer hover:bg-pageSideMenuTextHover transition duration-200"
                      onClick={() => handleSelectProject(project.id)}
                    >
                      <td className="px-4 py-2 font-medium border-t border-r border-b border-gray-600">
                        {project.identification_number}
                      </td>
                      <td className="px-4 py-2 border border-gray-600">
                        {truncateDescription(project.description, 80)}
                      </td>
                      <td className="border-t border-l border-b text-gray-400 border-gray-600 px-4 py-2 italic">
                        {project.completed ? (
                          <div className="flex items-center space-between">
                            <div className="text-gray-400 italic">
                              <span className="text-green-500 italic">
                                Completed.
                              </span>
                              <br />
                              If you want to share this project, click the
                              button below.
                            </div>
                            <div className="px-5">
                              <button
                                id="old-project-botton"
                                className="px-4 py-2 text-sm text-gray-300 bg-gray-800 rounded hover:bg-gray-500 hover:text-gray-800"
                                onClick={() => handleShareProject(project.id)}
                                disabled={loading}
                              >
                                <FaShare />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <span className="text-yellow-500 italic">
                            In Progress
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="3"
                      className="px-4 py-2 border border-gray-600 text-center"
                    >
                      No projects found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            <div>
              <div className="my-10">
                <ProjectProgressChart activeProjects={activeProjects} progresses={progresses} />
              </div>
              <table
                className="my-20 text-sm table-auto w-full text-lightWhiteLetter"
                id="projects-actions"
              >
                <thead>
                  <tr className="w-full text-indigo-400 text-left ">
                    <th className="px-4 py-2 rounded-tl-lg">Identifier</th>
                    <th className="px-4 py-2 border-l border-gray-600 rounded-tr-lg">
                      Responsible
                    </th>
                    <th className="px-4 py-2 border-l border-gray-600 rounded-tr-lg">
                      Delivery Date
                    </th>
                    <th className="px-4 py-2 border-l border-gray-600 rounded-tr-lg">
                      Progress
                    </th>
                  </tr>
                </thead>
                <tbody className="shadow-lg">
                  {currentProjects.map((project) => (
                    <tr
                      key={project.id}
                      className="cursor-pointer hover:bg-pageSideMenuTextHover transition duration-200"
                      onClick={() => handleSelectProject(project.id)}
                      disabled={loading}
                    >
                      <td className="px-4 font-medium py-2 border-t border-r border-b border-gray-600">
                        {project.identification_number}
                      </td>
                      <td className="px-4 py-2 border border-gray-600">
                        {getProjectManager(project.id).map(
                          (userNumber, index) => (
                            <div key={index}>{userNumber}</div>
                          )
                        )}
                      </td>
                      <td className="px-4 py-2 border border-gray-600">
                        {project.delivery_date}
                      </td>
                      <td className="px-4 py-2 border-t border-l border-b border-gray-600">
                        <div
                          className={`font-bold ${
                            (progresses[project.id] || 0) < 25
                              ? "text-red-500"
                              : (progresses[project.id] || 0) < 50
                              ? "text-orange-500"
                              : (progresses[project.id] || 0) < 75
                              ? "text-yellow-500"
                              : "text-green-500"
                          }`}
                        >
                          {Math.round(progresses[project.id] || 0)}%
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
        <div className="col-span-12 pt-5">
          <div className="card" id="pj-info-projects">
            <div className="text-sm text-white text-lightWhiteLetter">
              {selectedProject ? (
                <div key={selectedProject.id}>
                  <div className="flex justify-end mt-4">
                    <button
                      onClick={handleDeselectProject}
                      title="Close details"
                      className="m-2 w-15 p-2 font-medium text-sm hover:bg-red-500 bg-red-600 rounded"
                    >
                      <FaTimes />
                    </button>
                  </div>
                  <div className="flex justify-center items-center">
                    <div className="relative w-64 h-64 transform scale-150">
                      <svg
                        className="absolute w-full h-full"
                        viewBox="0 0 36 36"
                      >
                        <path
                          className="text-gray-600"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth=".5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeDasharray="50, 100"
                          d="M2 18 C 9 5, 27 5, 34 18"
                        />
                      </svg>
                      <svg
                        className="absolute w-full h-full"
                        viewBox="0 0 36 36"
                      >
                        <path
                          fill="none"
                          stroke={
                            (progresses[selectedProject.id] || 0) < 25
                              ? "red"
                              : (progresses[selectedProject.id] || 0) < 50
                              ? "orange"
                              : (progresses[selectedProject.id] || 0) < 75
                              ? "yellow"
                              : "green"
                          }
                          strokeWidth=".5"
                          strokeDasharray={`${
                            (progresses[selectedProject.id] || 0) * 0.5
                          }, 50`}
                          d="M2 18 C 9 5, 27 5, 34 18"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center font-bold">
                        <div className="text-4xl">
                          <div
                            className={`text-4xl ${
                              (progresses[selectedProject.id] || 0) < 25
                                ? "text-red-500"
                                : (progresses[selectedProject.id] || 0) < 50
                                ? "text-orange-500"
                                : (progresses[selectedProject.id] || 0) < 75
                                ? "text-yellow-500"
                                : "text-green-500"
                            }`}
                          >
                            {Math.round(progresses[selectedProject.id] || 0)}%
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-gray-400 font-medium">
                          IDENTIFICATION NUMBER
                        </div>
                        <h2 className="font-bold text-gray-300 text-base">
                          {selectedProject.identification_number}
                        </h2>
                        <div className="col-span-12 md:col-span-6 flex justify-center">
                          <div className="text-xs text-center text-gray-500">
                            <hr className="my-2 border-b border-gray-500 shadow-md opacity-50" />
                            Delivery Date.
                            <strong>{selectedProject.delivery_date}</strong>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="px-10 flex justify-center grid grid-cols-12 gap-4">
                    <div className="col-span-12 md:col-span-3 flex">
                      <div className="p-4 rounded-lg shadow-lg transition duration-300 transform hover:translate-y-1 flex-grow border border-gray-700 hover:bg-gray-800">
                        <div className="flex items-center mb-2">
                          <strong className="text-lg font-extrabold text-blue-400 pb-2">
                            Responsible
                          </strong>
                        </div>
                        <ul className="text-white">
                          {getProjectManager(selectedProject.id).map(
                            (userNumber, index) => (
                              <li key={index}>
                                {index + 1}. {userNumber}
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    </div>
                    <div className="col-span-12 md:col-span-6 flex">
                      <div className="p-4 rounded-lg shadow-lg transition duration-300 transform hover:translate-y-1 flex-grow border border-gray-700 hover:bg-gray-800">
                        <div className="flex items-center mb-2">
                          <strong className="text-lg font-extrabold text-blue-400 pb-2">
                            Description
                          </strong>
                        </div>
                        <div className="text-white text-justify">
                          {selectedProject.description || "No description available"}
                        </div>
                      </div>
                    </div>
                    <div className="col-span-12 md:col-span-3 flex">
                      <div className="p-4 rounded-lg shadow-lg transition duration-300 transform hover:translate-y-1 flex-grow border border-gray-700 hover:bg-gray-800">
                        <div className="flex items-center mb-2">
                          <strong className="text-lg font-extrabold text-blue-400 pb-2">
                            Operational users
                          </strong>
                        </div>
                        <ul className="text-white">
                          {getUserOperational(selectedProject.id).map(
                            (userNumber, index) => (
                              <li key={index}>
                                {index + 1}. {userNumber}
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    </div>
                    
                  </div>
                  
                  <button
                    className="px-4 py-2 mt-10 w-full bg-blue-600 font-bold text-gray-200 rounded hover:bg-blue-500"
                    onClick={() => {
                      const costsElement = document.getElementById('costs-section');
                      if (costsElement) {
                        costsElement.classList.toggle('hidden');
                      }
                    }}
                  >
                    Show costs
                  </button>
      
                  <div id="costs-section" className="hidden">
                    <AppProjectCosts projectId={selectedProject.id} />
                  </div>
                  <SelectedProjectIdentification id={selectedProject.id} onReload={handleReloadData} />


                  <AppProjectDetails
                    identificationNumber={
                      selectedProject.identification_number
                    }
                  />
                </div>
              ) : (
                <div className="mx-3 my-10 flex items-center text-gray-500">
                  <span>Click on a project to see more details ...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Modal
        isOpen={isModalReceivedSuccess}
        onClose={() => setIsModalReceivedSuccess(false)}
        title="Material received"
      >
        Material has been marked as successfully received.
      </Modal>
      <Modal
        isOpen={isModalNotReceivedSuccess}
        onClose={() => setIsModalNotReceivedSuccess(false)}
        title="Material not received"
      >
        Material has been marked as not received.
      </Modal>
      <Modal
        isOpen={isProjectCompleted}
        onClose={handleModalClose}
        title="Project Completed"
      >
        Congratulations! You have completed the project.
      </Modal>
      <Modal
        isOpen={isNoAssembliesModalOpen}
        onClose={() => setIsNoAssembliesModalOpen(false)}
        title="No Assemblies"
      >
        Project {noAssembliesProjectId} has no assemblies to display.
      </Modal>
    </>
  );
};

export default Projects;
