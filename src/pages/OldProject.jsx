import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaChevronDown,
  FaChevronUp,
  FaArrowLeft,
  FaArrowRight,
} from "react-icons/fa";

const OldProject = () => {
  // IP Address for the API
  const apiIpAddress = import.meta.env.VITE_API_IP_ADDRESS;
  
  // State hooks
  const [activeProjects, setActiveProjects] = useState([]);

  const [userAdminProject, setUserAdminProject] = useState([]);
  const [userOperProject, setUserOperProject] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isOpen, setIsOpen] = useState(Array(3).fill(false));
  const [currentPage, setCurrentPage] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  
  const recordsPerPage = 5;
  
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
    // FETCH GET ALL THE ACTIVE PROJECTS
    const fetchActiveProjects = async () => {
      try {
        const activeProjectsResponse = await axios.get(`${apiIpAddress}/api/getProjectsActives`);
        console.log("Projects Info response:", activeProjectsResponse.data);
        setActiveProjects(activeProjectsResponse.data);
      } catch (error) {
        console.error("Error fetching projects info:", error);
      }
    };
    fetchActiveProjects();
  }, [apiIpAddress]);
  
  // Fetch project details when selectedProject or apiIpAddress changes
  useEffect(() => {
    const fetchProjectDetails = async () => {
      if (selectedProject) {
        try {
          const userAdminProjectResponse = await axios.get(`${apiIpAddress}/api/projects/${selectedProject.id}/admins`);
          const userOperProjectResponse = await axios.get(`${apiIpAddress}/api/projects/${selectedProject.id}/users`);
          console.log("Users Admin Project response:", userAdminProjectResponse.data);
          console.log("Users Oper Project response:", userOperProjectResponse.data);
          setUserAdminProject(userAdminProjectResponse.data);
          setUserOperProject(userOperProjectResponse.data);
        } catch (error) {
          console.error("Error fetching project details:", error);
        }
      }
    };
    fetchProjectDetails();
  }, [selectedProject, apiIpAddress]);
  
  // Handle more info button click
  const handleMoreInfo = (projectId) => {
    const project = activeProjects.find((p) => p.id === projectId);
    setSelectedProject(project);
  };
  
  // Toggle list visibility
  const toggleList = (index) => {
    setIsOpen((prev) => {
      const newState = [...prev];
      newState[index] = !newState[index];
      return newState;
    });
  };
  
  // Handle show info button click
  const handleButtonClick = () => {
    setShowInfo(!showInfo);
  };

  return (
    <div className="px-4 py-5 min-h-screen">
      {/* 1. FIRST PART */}
      <div className="flex justify-between items-center pt-4 pb-4 mb-5">
        <h1 className="text-2xl font-bold mb-4">Projects Under Development</h1>
        <div className="flex items-center">
          <input
            type="text"
            placeholder="project id. 000351 ..."
            className="w-80 p-2 rounded-l focus:bg-gray-800 hover:bg-gray-800 text-sm text-gray-200 bg-pageBackground border border-gray-500 focus:outline-none focus:border-gray-400"
          />
          <button className="px-4 py-2 ml-1 bg-gray-500 text-sm text-gray-300 bg-pageBackground border border-gray-500 rounded-r hover:bg-gray-700">
            <strong>Search</strong>
          </button>
        </div>
      </div>
      <br />
      <div>
        <div className="">
          <div className="card" id="pj-list-projects">
            <div>
              <table className="text-sm table-auto w-full border text-lightWhiteLetter">
                <thead>
                  <tr className="w-full bg-gray-700 text-left">
                    <th className="px-4 py-2 border border-gray-500">
                      Identification Number
                    </th>
                    <th className="px-4 py-2 border border-gray-500">
                      Project Manager
                    </th>
                    <th className="px-4 py-2 border border-gray-500">
                      Delivery Date
                    </th>
                    <th className="px-4 py-2 border border-gray-500">
                      Progress
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 shadow-lg">
                  {currentProjects.map((project) => (
                    <tr
                      key={project.id}
                      className="hover:bg-pageSideMenuTextHover cursor-pointer transition duration-200"
                      onClick={() => handleMoreInfo(project.id)}
                    >
                      <td className="px-4 py-2 border border-gray-500">
                        <strong># </strong>
                        {project.identification_number}
                      </td>
                      <td className="px-4 py-2 border border-gray-500">
                        Lorem ipsum dolor sit amet.
                      </td>
                      <td className="px-4 py-2 border border-gray-500">
                        {project.delivery_date}
                      </td>
                      <td className="px-4 py-2 border border-gray-500">45%</td>
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
          {/* 2. SECOND PART */}
          <div className="col-span-12 pt-10">
            <div className="card" id="pj-info-projects">
              <div className="text-sm text-white m-4 text-lightWhiteLetter">
                {selectedProject ? (        /* 2. OP2 Select project */
                  <div>
                    <div>
                      {" "}
                      {/* 2.1. Project details */}
                      <div className="flex pb-2">
                        <div className="text-xl pr-2 font-medium ">
                          Identification Number
                        </div>
                        <div>
                          <h2 className="text-3xl font-bold">
                            #{selectedProject.identification_number}
                          </h2>
                        </div>
                      </div>
                      <br />
                      <div className="p-4 grid grid-cols-12 w-full gap-4">
                        <div className="col-span-3">
                          <strong>Project manager</strong>
                        </div>
                        <div className="col-span-9">
                          <ul>
                            <li>Lorem ipsum dolor sit amet.</li>
                          </ul>
                        </div>
                      </div>
                      <div className="p-4 grid grid-cols-12 w-full gap-4">
                        <div className="col-span-3">
                          <strong>Operational users </strong>
                        </div>
                        <div className="col-span-9">
                          <ul>
                            <li>• Lorem ipsum dolor sit amet.</li>
                            <li>• Lorem ipsum dolor sit amet.</li>
                            <li>• Lorem ipsum dolor sit amet.</li>
                          </ul>
                        </div>
                      </div>
                      <br />
                      <div>
                        <strong>Description</strong>
                        <br />
                        {selectedProject.description}
                      </div>
                      <hr className="my-5 border-b border-gray-700" />
                      <div className="px-20 grid grid-cols-12 w-full gap-4">
                        <div className="col-span-6">
                          Delivery Date. {selectedProject.delivery_date}
                        </div>
                        <div className="col-span-6">
                          Cost Material. ${selectedProject.cost_material}
                        </div>
                      </div>
                    </div>
                    <div>
                      {" "}
                      {/* 2.2. Assemblyes */}
                      <div className="py-20 px-4">
                        <h2 className="text-xl font-semibold mb-3">
                          List of Assemblies
                        </h2>
                        <div className="pt-3">
                          {[...Array(3)].map((_, i) => (
                            <div className="px-3" key={i}>
                              <div className="flex items-center justify-between">
                                <div>
                                  <h3 className="text-base px-4 flex items-center">
                                    <span className="text-gray-400 pr-1">
                                      {i + 1}. <strong>ID.</strong>
                                    </span>
                                    YMX-EAC-ASY-ENC-211715-1
                                  </h3>
                                </div>
                                <div className="">
                                  <button className="px-4 pb-2 mx-2 text-sm text-gray-500 hover:text-gray-200">
                                    Copy assembly materials
                                  </button>
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
                                    onClick={handleButtonClick}
                                    className="w-full bg-gray-900 text-gray-500 font-bold shadow-lg px-5 py-2 my-2 hover:bg-gray-800 hover:text-gray-200"
                                  >
                                    Assembly File
                                  </button>
                                  {showInfo && (
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
                                              Lorem ipsum dolor sit amet
                                              consectetur adipisicing elit.
                                              Quisquam, voluptates.
                                            </td>
                                          </tr>
                                          <tr>
                                            <td className="border border-gray-500 px-4 py-2 bg-gray-800">
                                              <strong>Price</strong>
                                            </td>
                                            <td className="border border-gray-500 px-4 py-2 bg-gray-900">
                                              $3,000.00 USD
                                            </td>
                                          </tr>
                                          <tr>
                                            <td className="border border-gray-500 px-4 py-2 bg-gray-800">
                                              <strong>Delivery Date</strong>
                                            </td>
                                            <td className="border border-gray-500 px-4 py-2 bg-gray-900">
                                              2024-01-01
                                            </td>
                                          </tr>

                                          <tr>
                                            <td className="border border-gray-500 px-4 py-2 bg-gray-800">
                                              <strong>Status</strong>
                                            </td>
                                            <td className="border text-gray-400 border-gray-500 px-4 py-2 bg-gray-900 italic">
                                              Currently incomplete
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
                                    </div>
                                  )}
                                  {[...Array(3)].map((_, j) => (
                                    <table className="text-sm table-auto w-full text-lightWhiteLetter">
                                      <tbody className="bg-gray-800 shadow-lg">
                                        <tr
                                          key={j}
                                          className="border-b border-gray-500 hover:bg-pageSideMenuTextHover cursor-pointer transition duration-200"
                                        >
                                          <div className="py-3 px-2 flex justify-between items-center">
                                            <div className="px-2">
                                              <td className="pr-6">{j + 1}</td>
                                              <td>
                                                Lorem ipsum dolor sit amet
                                                consectetur adipisicing elit.
                                              </td>
                                            </div>
                                            <div className="px-2">
                                              <td>
                                                <button className="px-4 mx-2 text-sm text-gray-400 hover:text-gray-200">
                                                  Add date order
                                                </button>
                                                <input
                                                  type="checkbox"
                                                  className="ml-auto h-4 w-4 text-blue-600 bg-gray-700 border-gray-500 rounded focus:ring-blue-500 focus:ring-2"
                                                  onChange={(e) => {
                                                    if (e.target.checked) {
                                                      if (
                                                        window.confirm(
                                                          "¿Está seguro de marcar como llegado el producto?"
                                                        )
                                                      ) {
                                                        alert(
                                                          "Producto marcado como llegado exitosamente."
                                                        );
                                                      } else {
                                                        e.target.checked = false;
                                                      }
                                                    } else {
                                                      if (
                                                        window.confirm(
                                                          "¿Está seguro de eliminar la marca de llegado del producto?"
                                                        )
                                                      ) {
                                                        e.target.checked = false;
                                                      } else {
                                                        e.target.checked = true;
                                                      }
                                                    }
                                                  }}
                                                />
                                              </td>
                                            </div>
                                          </div>
                                        </tr>
                                      </tbody>
                                    </table>
                                  ))}
                                </div>
                              )}
                              <hr className="my-5 border-b border-gray-700" />
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex justify-end pt-20 mt-4">
                        <button className="px-4 py-2 mx-1 bg-yellow-900 text-sm text-yellow-300 bg-pageBackground border border-yellow-500 rounded hover:bg-yellow-700">
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  "Select a project to see the details" /* 2. OP1 Default */
                )} 
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OldProject;
