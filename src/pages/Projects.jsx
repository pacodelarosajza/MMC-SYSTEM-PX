import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import AppProjectDetails from "./ProjectDetails";
import { FaArrowLeft, FaArrowRight, FaShare } from "react-icons/fa";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSync } from "@fortawesome/free-solid-svg-icons";
import Modal from "./Modal";
import { Bar } from "react-chartjs-2";
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

const Projects = ({ setShowChildRoutes }) => {
  const apiIpAddress = import.meta.env.VITE_API_IP_ADDRESS;
  const [activeProjects, setActiveProjects] = useState([]);
  const [adminProjects, setAdminProjects] = useState({});
  const [userOperProjects, setUserOperProjects] = useState({});
  const [assemblies, setAssemblies] = useState({});
  const [items, setItems] = useState({});
  const [progresses, setProgresses] = useState({});
  const [assemblyProgresses, setAssemblyProgresses] = useState({});
  const [materialProgresses, setMaterialProgresses] = useState({});
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
    }, 60000); // Check for updates every 60 seconds

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
        const items = response.data;
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

  const getMaterialProgress = async (projectId, assemblyId) => {
    try {
      const response = await axios.get(
        `${apiIpAddress}/api/getItems/project/assembly/${projectId}/${assemblyId}`
      );
      const items = response.data;
      const arrivedItems = items.filter((item) => item.in_subassembly === 1);
      const totalItems = items.length;
      const progressPercentage =
        totalItems === 0 ? 0 : (arrivedItems.length / totalItems) * 100;

      setMaterialProgresses((prevProgresses) => ({
        ...prevProgresses,
        [assemblyId]: progressPercentage,
      }));
    } catch (error) {
      console.error(
        `Error fetching material progress for assembly ${assemblyId}:`,
        error
      );
    }
  };

  useEffect(() => {
    if (selectedProject) {
      getAssemblyProgress(selectedProject.id);
      if (assemblies[selectedProject.id]) {
        assemblies[selectedProject.id].forEach((assembly) => {
          getMaterialProgress(selectedProject.id, assembly.id);
        });
      }
    }
  }, [selectedProject, assemblies]);

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

  const handleSelectProject = (projectId) => {
    setLoading(true);
    const project = currentProjects.find((p) => p.id === projectId);
    setSelectedProject(project);
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
    if (description.length <= maxLength) {
      return description;
    }
    return description.substring(0, maxLength) + "...";
  };

  const chartData = {
    labels: activeProjects.map((project) => project.identification_number),
    datasets: [
      {
        label: "Progress (%)",
        data: activeProjects.map((project) => progresses[project.id] || 0),
        backgroundColor: activeProjects.map((project) => {
          const progress = progresses[project.id] || 0;
          if (progress < 25) return "rgba(255, 99, 132, 0.2)"; // red
          if (progress < 50) return "rgba(54, 162, 235, 0.2)"; // blue
          return "rgba(75, 192, 192, 0.2)"; // green
        }),
        borderColor: activeProjects.map((project) => {
          const progress = progresses[project.id] || 0;
          if (progress < 25) return "rgba(255, 99, 132, 1)"; // red
          if (progress < 50) return "rgba(54, 162, 235, 1)"; // blue
          return "rgba(75, 192, 192, 1)"; // green
        }),
        borderWidth: 1,
      },
    ],
  };

  const materialChartData = selectedProject
    ? {
        labels: Object.keys(materialProgresses).map(
          (assemblyId) =>
            assemblies[selectedProject.id].find(
              (assembly) => assembly.id === parseInt(assemblyId)
            ).identification_number
        ),
        datasets: [
          {
            label: `Material Progress in Project ${selectedProject.identification_number}`,
            data: Object.values(materialProgresses),
            backgroundColor: Object.values(materialProgresses).map(
              (progress) => {
                if (progress < 25) return "rgba(255, 99, 132, 0.2)"; // red
                if (progress < 50) return "rgba(54, 162, 235, 0.2)"; // blue
                return "rgba(75, 192, 192, 0.2)"; // green
              }
            ),
            borderColor: Object.values(materialProgresses).map((progress) => {
              if (progress < 25) return "rgba(255, 99, 132, 1)"; // red
              if (progress < 50) return "rgba(54, 162, 235, 1)"; // blue
              return "rgba(75, 192, 192, 1)"; // green
            }),
            borderWidth: 1,
          },
        ],
      }
    : {};

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Hide the legend
      },
      title: {
        display: true,
        text: "Project Progress",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
      },
    },
  };

  const materialChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Hide the legend
      },
      title: {
        display: true,
        text: "Material Progress",
        font: {
          size: 24, // Adjust size as needed
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
      },
    },
  };

  const handleReloadData = () => {
    setReload((prev) => !prev);
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

  return (
    <>
      <div className="px-4 py-5 min-h-screen">
        <>
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
                className="w-80 p-2 rounded-l focus:bg-gray-800 hover:bg-gray-800 text-sm text-gray-200 bg-pageBackground border border-blue-500 focus:outline-none focus:border-blue-400"
              />
              <button
                onClick={handleButtonClickBySearch}
                className="px-4 py-2 ml-1 bg-blue-900 text-sm text-gray-300 border border-blue-500 rounded-r hover:bg-blue-700 haver:border-blue-300"
              >
                <strong>Search</strong>
              </button>
            </div>
          </div>
          <div className="text-gray-500">
            {isFocusedContent ? (
              <table className="text-sm table-auto w-full border text-lightWhiteLetter">
                <thead>
                  <tr className="w-full bg-blue-900 text-left">
                    <th className="px-4 py-2 border bg-blue-700 border-blue-400">
                      Proj. ID
                    </th>
                    <th className="px-4 py-2 border border-blue-500">
                      Description
                    </th>
                    <th className="px-4 py-2 border border-blue-500">Status</th>
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
                        <td className="px-4 py-2 font-medium border border-gray-500">
                          {project.identification_number}
                        </td>
                        <td className="px-4 py-2 border border-gray-500">
                          {truncateDescription(project.description, 80)}
                        </td>
                        <td className="border text-gray-400 border-gray-500 px-4 py-2 italic">
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
                              <Link
                                to="/dashboard/old-project"
                                onClick={() => handleShareProject(project.id)}
                              >
                                <button
                                  id="oldP" className="px-4 py-2 text-sm text-gray-300 bg-gray-800 rounded hover:bg-gray-500 hover:text-gray-800"
                                  disabled={loading}
                                >
                                  <FaShare />
                                </button>
                              </Link>
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
                        className="px-4 py-2 border border-gray-500 text-center"
                      >
                        No projects found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            ) : (
              <div>
                <div className="" style={{ height: "200px" }}>
                  {" "}
                  {/* Adjusted height */}
                  <Bar data={chartData} options={chartOptions} />
                </div>
                <table className="text-sm my-5 table-auto w-full border text-lightWhiteLetter">
                  <thead>
                    <tr className="w-full bg-blue-900 text-left">
                      <th className="px-4 py-2 border border-blue-500">
                        Identifier
                      </th>
                      <th className="px-4 py-2 border border-blue-500">
                        Project Manager
                      </th>
                      <th className="px-4 py-2 border border-blue-500">
                        Delivery Date
                      </th>
                      <th className="px-4 py-2 border border-blue-500">
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
                        <td className="px-4 font-medium py-2 border border-gray-400">
                          {project.identification_number}
                        </td>
                        <td className="px-4 py-2 border border-gray-400">
                          {getProjectManager(project.id).map(
                            (userNumber, index) => (
                              <div key={index}>{userNumber}</div>
                            )
                          )}
                        </td>
                        <td className="px-4 py-2 border border-gray-400">
                          {project.delivery_date}
                        </td>
                        <td className="px-4 py-2 border border-gray-400">
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
                        className="px-4 py-2 ml-1 bg-orange-900 text-sm text-orange-300 border border-orange-500 rounded hover:bg-orange-700 haver:border-orange-300"
                        title="Close details"
                      >
                        <strong>X</strong>
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
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-center grid grid-cols-12 gap-4">
                      <div className="col-span-12 md:col-span-6 flex justify-center">
                        <div className="text-lg text-center text-gray-500">
                          <hr className="my-2 border-b border-gray-500 shadow-md opacity-50" />
                          Delivery Date.
                          <strong>{selectedProject.delivery_date}</strong>
                        </div>
                      </div>
                      <div className="col-span-12 md:col-span-6 flex justify-center">
                        <div className="text-lg text-center text-gray-500">
                          <hr className="my-2 border-b border-gray-500 shadow-md opacity-50" />
                          Cost Material.
                          <strong>${selectedProject.cost_material} MXN</strong>
                        </div>
                      </div>
                    </div>
                    <div className="my-5" style={{ height: "300px" }}>
                      <Bar
                        data={materialChartData}
                        options={materialChartOptions}
                      />
                    </div>
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
        </>
      </div>
      <Modal
        isOpen={isModalReceivedSuccess}
        onClose={() => setIsModalReceivedSuccess(false)}
        title="Material received"
      >
        <p>Material has been marked as successfully received.</p>
      </Modal>
      <Modal
        isOpen={isModalNotReceivedSuccess}
        onClose={() => setIsModalNotReceivedSuccess(false)}
        title="Material not received"
      >
        <p>Material has been marked as not received.</p>
      </Modal>
    </>
  );
};

export default Projects;
