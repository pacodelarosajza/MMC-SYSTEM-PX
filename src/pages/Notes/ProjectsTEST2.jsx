import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import AppProjectDetails from "./ProjectDetails";
import {
  FaChevronDown,
  FaChevronUp,
  FaArrowLeft,
  FaArrowRight,
  FaShare,
  FaCheck,
} from "react-icons/fa";
import { CopyToClipboard } from "react-copy-to-clipboard"; // Text to copy. Import the CopyToClipboard component fo the text to copy
import Modal from "./Modal";
import ModalAcept from "./ModalAcept";

const Projects = ({ setShowChildRoutes }) => {
  // IP Address for the API
  const apiIpAddress = import.meta.env.VITE_API_IP_ADDRESS;

  // State hooks
  const [activeProjects, setActiveProjects] = useState([]);
  const [adminProjects, setAdminProjects] = useState({});
  const [userOperProjects, setUserOperProjects] = useState({});
  const [assemblies, setAssemblies] = useState({});
  const [items, setItems] = useState({});
  const [progresses, setProgresses] = useState({});
  const [isOpen, setIsOpen] = useState({});
  const [currentPage, setCurrentPage] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [date, setDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [textToCopy, setTextToCopy] = useState("");
  const [error, setError] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isModalReceivedSuccess, setIsModalReceivedSuccess] = useState(false);
  const [isModalNotReceivedSuccess, setIsModalNotReceivedSuccess] =
    useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalAction, setModalAction] = useState(null);
  const [checkboxTarget, setCheckboxTarget] = useState(null);
  const [isFocusedContent, setIsFocusedContent] = useState(false);

  const recordsPerPage = 5;
  const navigate = useNavigate();

  // Pagination handlers
  const handleNextPage = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  const handlePreviousPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 0));
  };

  const startIndex = currentPage * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const currentProjects = activeProjects.slice(startIndex, endIndex);

  // Fetch projects info on component mount or apiIpAddress change
  useEffect(() => {
    const fetchActiveProjects = async () => {
      try {
        const activeProjectsResponse = await axios.get(
          `${apiIpAddress}/api/getProjectsActives`
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

        const userOperProjectsData = {};
        for (const project of projects) {
          try {
            const userOperProjectResponse = await axios.get(
              `${apiIpAddress}/api/projects/${project.id}/users`
            );
            userOperProjectsData[project.id] = userOperProjectResponse.data;
          } catch (error) {
            userOperProjectsData[project.id] = null;
          }
        }

        const assembliesData = {};
        const itemsData = {};

        for (const project of projects) {
          try {
            const assembliesResponse = await axios.get(
              `${apiIpAddress}/api/assembly/project/${project.id}`
            );
            assembliesData[project.id] = assembliesResponse.data;

            // Get items for each assembly
            for (const assembly of assembliesResponse.data) {
              try {
                const itemsResponse = await axios.get(
                  `${apiIpAddress}/api/getItems/project/assembly/${project.id}/${assembly.id}`
                );
                itemsData[assembly.id] = itemsResponse.data;
              } catch (error) {
                itemsData[assembly.id] = null;
              }
            }
          } catch (error) {
            assembliesData[project.id] = null;
          }
        }

        setAdminProjects(adminProjectsData);
        setUserOperProjects(userOperProjectsData);
        setAssemblies(assembliesData);
        setItems(itemsData);

        // Calculate progress for each project
        projects.forEach((project) => {
          getProjectProgress(project.id);
        });
      } catch (error) {
        console.error(
          "Error fetching active projects or admin projects:",
          error
        );
      }
    };

    fetchActiveProjects();
  }, [apiIpAddress]);

  // Fetch project progress
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

  // Get project manager
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

  // Get operational users
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

  // Get assembly materials
  const getAssemblyMaterials = (projectId) => {
    return Array.isArray(assemblies[projectId]) &&
      assemblies[projectId].length > 0
      ? assemblies[projectId]
      : null;
  };

  // Copy assembly materials
  const handleCopyAssemblyMaterials = (projectId, assemblyId) => {
    const materials = getItemsForAssembly(projectId, assemblyId);
    if (materials) {
      const materialsText = materials
        .map((material) => JSON.stringify(material))
        .join("\n");
      setTextToCopy(materialsText);
    } else {
      setTextToCopy("No materials found");
    }
  };

  // Get assembly status
  function getAssemblyStatus(completed_assembly) {
    const status =
      completed_assembly === 0 ? "Currently incomplete" : "Completed";
    const statusClass =
      completed_assembly === 0 ? "text-orange-500" : "text-green-500";

    return <span className={statusClass}>{status}</span>;
  }

  // Get items for an assembly
  const getItemsForAssembly = (projectId, assemblyId) => {
    return Array.isArray(items[assemblyId]) && items[assemblyId].length > 0
      ? items[assemblyId]
      : null;
  };

  // Handle more info button click
  const handleMoreInfo = (projectId) => {
    const project = activeProjects.find((p) => p.id === projectId);
    setSelectedProject(project);
  };

  // Handle project selection
  const handleSelectProject = (projectId) => {
    setLoading(true);
    const project = currentProjects.find((p) => p.id === projectId);
    setSelectedProject(project);
    setLoading(false);
  };

  // Toggle list visibility
  const toggleList = (index) => {
    setIsOpen((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // Handle show info button click
  const handleButtonClick = (assemblyId) => {
    setShowInfo((prev) => ({
      ...prev,
      [assemblyId]: !prev[assemblyId],
    }));
  };

  // Handle date change
  const handleDateChange = (event) => {
    setDate(event.target.value);
  };

  // Handle confirm click
  const handleConfirmClick = () => {
    const confirmChange = window.confirm(
      `¿Deseas añadir la fecha ${date} como fecha de llegada del material?`
    );
    if (confirmChange) {
      setIsEditing(false);
    }
  };

  // Handle search
  const handleSearch = async () => {
    try {
      const response = await fetch(`${apiIpAddress}/api/getProjects`);
      const data = await response.json();

      const projects = Array.isArray(data) ? data : [data];

      const filteredProjects = projects.filter((project) =>
        project.identification_number.toString().includes(searchQuery)
      );

      setSearchResults(filteredProjects);

      console.log("Search results:", filteredProjects);
    } catch (error) {
      console.error("Error fetching search results:", error);
    }
  };

  // Handle content focus
  const handleContentFocus = () => {
    setIsFocusedContent(true);
  };

  // Handle content blur
  const handleContentBlur = () => {
    setIsFocusedContent(false);
  };

  // Handle button click by search
  const handleButtonClickBySearch = () => {
    handleSearch();
    handleContentFocus();
  };

  // Truncate description
  const truncateDescription = (description, maxLength) => {
    if (description.length <= maxLength) {
      return description;
    }
    return description.substring(0, maxLength) + "...";
  };

  // Handle checkbox change
  const handleCheckboxChange = (e) => {
    const isChecked = e.target.checked;
    const message = isChecked
      ? "Are you sure to mark the product as received?"
      : "Are you sure to remove the received mark from the product?";

    setModalMessage(message);
    setModalAction(() => () => {
      if (isChecked) {
        setIsModalReceivedSuccess(true);
      } else {
        setIsModalNotReceivedSuccess(true);
      }
      setIsModalOpen(false);
    });

    setCheckboxTarget(e.target);
    setIsModalOpen(true);
  };

  // Handle cancel
  const handleCancel = () => {
    setIsModalOpen(false);
    if (checkboxTarget) {
      checkboxTarget.checked = !checkboxTarget.checked;
    }
  };

  // Handle click
  const handleClick = () => {
    navigate("/dashboard/old-project", {
      state: { identificationNumber: project.identification_number },
    });
  };

  return (
    <>
      <div className="px-4 py-5 min-h-screen">
        {/* 1. FIRST PART */}
        <div className="flex justify-between items-center pt-4 pb-4 mb-5">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-500">
              Projects Under Development
            </h1>
          </div>

          <div className="flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onBlur={handleContentBlur}
              placeholder="project id. 000351 ..."
              className="w-80 p-2 rounded-l focus:bg-gray-800 hover:bg-gray-800 text-sm text-gray-200 bg-pageBackground border border-blue-500 focus:outline-none focus:border-blue-400"
            />{" "}
            {/*onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleButtonClickBySearch();
            }
          }}*/}
            <button
              onClick={handleButtonClickBySearch}
              className="px-4 py-2 ml-1 bg-blue-900 text-sm text-gray-300 border border-blue-500 rounded-r hover:bg-blue-700 haver:border-blue-300"
            >
              <strong>Search</strong>
            </button>
          </div>
        </div>
        <br />
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
                          <>
                            <div className="flex items-center space-between">
                              <div>
                                <div className="text-gray-400 italic">
                                  <span className="text-green-500 italic">
                                    Completed.
                                  </span>
                                  <br />
                                  If you want to share this project, click the
                                  button below.
                                </div>
                              </div>
                              {/*{project.identification_number}*/}

                              <Link
                                to={{
                                  pathname: "/dashboard/old-project",
                                  state: {
                                    identificationNumber:
                                      project.identification_number,
                                  },
                                }}
                              >
                                <button
                                  className="px-4 py-2 text-sm text-gray-300 bg-gray-800 rounded hover:bg-gray-500 hover:text-gray-800"
                                  disabled={loading}
                                >
                                  <FaShare />
                                </button>
                              </Link>
                            </div>
                          </>
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
                )}{" "}
              </tbody>
            </table>
          ) : (
            <div>
              <table className="text-sm table-auto w-full border text-lightWhiteLetter">
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
                    <>
                      <tr
                        key={project.id}
                        className=" cursor-pointer hover:bg-pageSideMenuTextHover transition duration-200 "
                        onClick={() => handleSelectProject(project.id)}
                        disabled={loading}
                      >
                        <td className="px-4 font-medium  py-2 border border-gray-400">
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
                            className={` font-bold  ${
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
                    </>
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
                    className="px-4 pt-2 bg-gray-500 text-sm text-gray-300 bg-pageBackground rounded hover:bg-gray-700"
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

        {/* 2. SECOND PART */}
        <div className="col-span-12">
          <div className="card" id="pj-info-projects">
            <div className="text-sm text-white text-lightWhiteLetter">
              {selectedProject ? (
                <>
                  <div key={selectedProject.id}>
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
                        <div className="absolute inset-0 flex flex-col items-center justify-center font-bold ">
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
                          <div className="">
                            <h2 className="font-bold text-gray-300 text-base">
                              {selectedProject.identification_number}
                            </h2>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* PROJECT DATA CARDS */}
            <div className="flex justify-center grid grid-cols-12 gap-4">
              {/* Admin Users card */}
              <div className="col-span-12 md:col-span-3 flex">
                <div className="bg-gray-800 p-4 rounded-lg shadow-lg transition-transform transform hover:translate-y-1 duration-300 flex-grow">
                  <div className="flex items-center mb-2">
                    <strong className="text-lg font-extrabold text-blue-400 pb-2">
                      Project manager
                    </strong>
                  </div>
                  <ul className="text-white">
                    {getProjectManager(selectedProject.id).map((userNumber, index) => (
                      <li key={index}>
                        {index + 1}. {userNumber}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              {/* Project Details card */}
              <div className="col-span-12 md:col-span-6 flex">
                <div className="bg-gray-800 p-4 rounded-lg shadow-lg transition-transform transform hover:translate-y-1 duration-300 flex-grow">
                  <div className="flex items-center mb-2">
                    <strong className="text-lg font-extrabold text-blue-400 pb-2">
                      Description
                    </strong>
                  </div>
                  <div className="text-white text-justify">
                    {selectedProject.description}
                  </div>
                </div>
              </div>
              {/* Operational Users card */}
              <div className="col-span-12 md:col-span-3 flex">
                <div className="bg-gray-800 p-4 rounded-lg shadow-lg transition-transform transform hover:translate-y-1 duration-300 flex-grow">
                  <div className="flex items-center mb-2">
                    <strong className="text-lg font-extrabold text-blue-400 pb-2">
                      Operational users
                    </strong>
                  </div>
                  <ul className="text-white">
                    {getUserOperational(selectedProject.id).map((userNumber, index) => (
                      <li key={index}>
                        {index + 1}. {userNumber}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            <hr className="mb-3 mt-2 border-b border-gray-700" />
            {/* Delivery Date and Cost Material */}
            <div className="flex justify-center grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-6 flex justify-center">
                <div className="text-lg text-center text-gray-500">
                  Delivery Date. <strong>{selectedProject.delivery_date}</strong>
                </div>
              </div>
              <div className="col-span-12 md:col-span-6 flex justify-center">
                <div className="text-lg text-center text-gray-500">
                  Cost Material. <strong>${selectedProject.cost_material} MXN</strong>
                </div>
              </div>
            </div> 
                    {/*  USERS OPER AND ADMIN


                    <div className="flex justify-center mx-5 grid-cols-12 text-sm">
                      <div className="col-span-6">
                        <div className="grid grid-cols-12  gap-4">
                          <div className="col-span-5">
                            <strong>Project manager: </strong>
                          </div>
                          <div className="col-span-7">
                            <ul>
                              <li>{getProjectManager(selectedProject.id)}</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      <div className="col-span-6">
                        <div className="grid grid-cols-12  gap-4">
                          <div className="col-span-5">
                            <strong>Operational users:</strong>
                          </div>
                          <div className="col-span-7">
                            <ul>
                              {getUserOperational(selectedProject.id).map(
                                (userNumber, index) => (
                                  <div key={index}>• {userNumber}</div>
                                )
                              )}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>




*/}
                    <AppProjectDetails
                      identificationNumber={
                        selectedProject.identification_number
                      }
                    />
                  </div>
                  {/* GRAPHICS
                  
                  
                  Gráfica de barras 
      <div className="w-full max-w-md mt-8">
        <div className="flex items-end h-48 space-x-2">
          <div className="w-1/4 bg-blue-500" style={{ height: `${progress}%` }}></div>
          <div className="w-1/4 bg-green-500" style={{ height: `${progress * 0.8}%` }}></div>
          <div className="w-1/4 bg-yellow-500" style={{ height: `${progress * 0.6}%` }}></div>
          <div className="w-1/4 bg-red-500" style={{ height: `${progress * 0.4}%` }}></div>
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>Q1</span>
          <span>Q2</span>
          <span>Q3</span>
          <span>Q4</span>
        </div>
      </div>

                 Gráfica de barras 
     <div className="mb-20 px-20">
        <div className="flex items-end h-48 space-x-3">
          {data.map((item, index) => (
            <div
              key={index}
              className={`w-1/4 bg-${index % 2 === 0 ? 'blue' : 'green'}-500`}
              style={{ height: `${item.value}%` }}
            ></div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          {data.map((item, index) => (
            <span key={index}>{item.name}</span>
          ))}
        </div>
      </div>
*/}
                </>
              ) : (
                <div className="mx-3 my-10 flex items-center text-gray-500">
                  {" "}
                  {/* HERE */}
                  <span>Click on a project to see more details ...</span>
                </div>
              )}
              {/*}



<strong>Items:</strong>
                      <ul>
                        {Array.isArray(itemsData[assembly.id]) &&
                          itemsData[assembly.id].length > 0 &&
                          itemsData[assembly.id].map((item, index) => (
                            <li key={index}>
                              {item.name} - {item.quantity} units
                            </li>
                          ))}
                      </ul>
                    </div>




                    
              <div key={selectedProject.id}>
             
                  <div className="pt-5">
               
                    {getAssemblyMaterials(selectedProject.id) && (
                      <div className="pt-10 pb-20 px-4">
                        <h2 className="text-2xl font-semibold mb-3">
                          List of Assemblies
                        </h2>
                        <div className="pt-3">
                          {getAssemblyMaterials(selectedProject.id).map(
                            (assembly, i) => (
                              <div className="px-3" key={i}>
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h3 className="text-base px-4 flex items-center">
                                      <span
                                        className={`${
                                          assembly.completed === 0
                                            ? "text-gray-300"
                                            : "text-green-500 italic"
                                        }`}
                                      >
                                        <div className="flex items-center space-x-2">
                                          <div>
                                            <strong>{i + 1}. ID.</strong>{" "}
                                            <span className="ml-2">
                                              {assembly.identification_number}
                                            </span>
                                          </div>
                                          <div>
                                            {assembly.completed === 0 ? (
                                              <span className="underline italic text-yellow-500 text-sm">
                                                PENDING
                                              </span>
                                            ) : (
                                              <FaCheck />
                                            )}
                                          </div>
                                        </div>
                                      </span>
                                    </h3>
                                  </div>
                                  <div className="">
                                    <CopyToClipboard text={textToCopy}>
                                      <button
                                        className="px-4 pb-2 mx-2 text-sm text-gray-500 hover:text-gray-200"
                                        onClick={() =>
                                          handleCopyAssemblyMaterials(
                                            selectedProject.id,
                                            assembly.id
                                          )
                                        }
                                      >
                                        Copy assembly materials
                                      </button>
                                    </CopyToClipboard>
                                    <button className="px-4 pb-2 mx-2 text-sm text-gray-500 hover:text-gray-200">
                                      Format for EPICOR
                                    </button>
                                    <button
                                      onClick={() => toggleList(i)}
                                      className="px-4 py-2 bg-gray-500 text-sm text-gray-300 bg-pageBackground rounded hover:bg-gray-700"
                                    >
                                      {isOpen[i] ? (
                                        <FaChevronUp />
                                      ) : (
                                        <FaChevronDown />
                                      )}
                                    </button>
                                  </div>
                                </div>
                                {isOpen[i] && (
                                  <div className="list-disc text-white">
                                    <button
                                      onClick={() =>
                                        handleButtonClick(assembly.id)
                                      }
                                      className="w-full bg-gray-900 text-gray-500 font-bold shadow-lg px-5 py-2 my-2 hover:bg-gray-800 hover:text-gray-200"
                                    >
                                      Assembly File
                                    </button>
                                    {showInfo[assembly.id] && (
                                      <div className="pt-2 pb-10 px-2">
                                        <table className="w-full mt-4 border-collapse border border-gray-500">
                                          <thead>
                                            <tr>
                                              <th className="border border-gray-500 bg-gray-700 px-4 py-2">
                                                Field
                                              </th>
                                              <th className="border border-gray-500 bg-gray-700 px-4 py-2">
                                                Value
                                              </th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            <tr>
                                              <td className="border border-gray-500 px-4 py-2 bg-gray-800">
                                                <strong>Description</strong>
                                              </td>
                                              <td className="border border-gray-500 px-4 py-2 bg-gray-900">
                                                {assembly.description}
                                              </td>
                                            </tr>
                                            <tr>
                                              <td className="border border-gray-500 px-4 py-2 bg-gray-800">
                                                <strong>Price</strong>
                                              </td>
                                              <td className="border border-gray-500 px-4 py-2 bg-gray-900">
                                                ${assembly.price} USD
                                              </td>
                                            </tr>
                                            <tr>
                                              <td className="border border-gray-500 px-4 py-2 bg-gray-800">
                                                <strong>Delivery Date</strong>
                                              </td>
                                              <td className="border border-gray-500 px-4 py-2 bg-gray-900">
                                                {assembly.delivery_date}
                                              </td>
                                            </tr>
                                            <tr>
                                              <td className="border border-gray-500 px-4 py-2 bg-gray-800">
                                                <strong>Status</strong>
                                              </td>
                                              <td className="border text-gray-400 border-gray-500 px-4 py-2 bg-gray-900 italic">
                                                {getAssemblyStatus(
                                                  assembly.completed
                                                )}
                                              </td>
                                            </tr>
                                          </tbody>
                                        </table>
                                      </div>
                                    )}
                                    {getItemsForAssembly(
                                      selectedProject.id,
                                      assembly.id
                                    )?.length > 0 ? (
                                      getItemsForAssembly(
                                        selectedProject.id,
                                        assembly.id
                                      ).map((item, index) => (
                                        <table
                                          key={index}
                                          className="text-sm table-auto w-full text-lightWhiteLetter"
                                        >
                                          <tbody className="bg-gray-800 shadow-lg">
                                            <tr className="border-b border-gray-500 hover:bg-pageSideMenuTextHover cursor-pointer transition duration-200">
                                              <td className="py-3 px-2 flex justify-between items-center">
                                                <div className="px-2">
                                                  <span className="pr-6">
                                                    {index + 1}
                                                  </span>
                                                  <span>{item.name}</span>
                                                </div>
                                                <div className="px-2">
                                                  <div className="flex">
                                                    <div>
                                                      <input
                                                        type="checkbox"
                                                        onChange={
                                                          handleCheckboxChange
                                                        }
                                                        defaultChecked={
                                                          item.in_subassembly ===
                                                          1
                                                        }
                                                      />
                                                      <ModalAcept
                                                        isOpen={isModalOpen}
                                                        onClose={handleCancel}
                                                        onContinue={modalAction}
                                                        title="Material not received"
                                                      >
                                                        <p>{modalMessage}</p>
                                                      </ModalAcept>
                                                    </div>
                                                  </div>
                                                </div>
                                              </td>
                                            </tr>
                                          </tbody>
                                        </table>
                                      ))
                                    ) : (
                                      <div className="text-gray-400 text-center">
                                        No items found
                                      </div>
                                    )}
                                  </div>
                                )}
                                <hr className="my-5 border-b border-gray-500" />
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </div>






                </div>*/}
            </div>
          </div>
        </div>
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
