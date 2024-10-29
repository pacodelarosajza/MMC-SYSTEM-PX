import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  FaChevronDown,
  FaChevronUp,
  FaArrowLeft,
  FaArrowRight,
  FaShare,
} from "react-icons/fa";
import { CopyToClipboard } from "react-copy-to-clipboard"; // Text to copy. Import the CopyToClipboard component fo the text to copy

const Projects = ({ setShowChildRoutes }) => {
  // IP Address for the API
  const apiIpAddress = import.meta.env.VITE_API_IP_ADDRESS;

  // State hooks
  const [activeProjects, setActiveProjects] = useState([]);
  const [adminProjects, setAdminProjects] = useState({});
  const [userOperProjects, setUserOperProjects] = useState({});
  const [assemblies, setAssemblies] = useState({});
  const [items, setItems] = useState({});
  const [selectedProject, setSelectedProject] = useState(null);
  const [isOpen, setIsOpen] = useState({});
  const [currentPage, setCurrentPage] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [date, setDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const recordsPerPage = 5;
  const [textToCopy, setTextToCopy] = useState(""); // Texto para copiar

  // Pagination handlers
  const handleNextPage = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  const handlePreviousPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 0));
  };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleNavigate = async () => {
    setLoading(true);
    setError(null);
    console.log("Navigating..."); // Debugging
    try {
      // Simular una operación asíncrona
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setShowChildRoutes(true);
      console.log("Navigation successful"); // Debugging
    } catch (err) {
      setError("Error al navegar");
      console.error("Navigation error:", err); // Debugging
    } finally {
      setLoading(false);
      console.log("Loading state:", loading); // Debugging
    }
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
        //let itemsText = ""; // Aquí guardaremos los datos en texto para copiar

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
                // Agregar los ítems a la variable itemsText
                //itemsText += `Assembly ${assembly.id} Items: ${JSON.stringify(itemsResponse.data)}\n`;
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

        //setTextToCopy(itemsText); // Guardar el texto de los items en textToCopy
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

  // Function to get operational users
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

  // Function to get assembly materials
  const getAssemblyMaterials = (projectId) => {
    return Array.isArray(assemblies[projectId]) &&
      assemblies[projectId].length > 0
      ? assemblies[projectId]
      : null;
  };

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

  function getAssemblyStatus(completed_assembly) {
    return completed_assembly === 0 ? "Currently incomplete" : "Completed";
  }

  // Function to get items for an assembly
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

      console.log("Search results:", filteredProjects);
    } catch (error) {
      console.error("Error fetching search results:", error);
    }
  };

  const [isFocusedContent, setIsFocusedContent] = useState(false);

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

  const truncateDescription = (description, maxLength) => {
    if (description.length <= maxLength) {
      return description;
    }
    return description.substring(0, maxLength) + "...";
  };

  return (
    <div className="px-4 py-5 min-h-screen">
      {/* 1. FIRST PART */}
      <div className="flex justify-between items-center pt-4 pb-4 mb-5">
        <h1 className="text-2xl font-bold mb-4">Projects Under Development</h1>
        <div className="flex items-center">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onBlur={handleContentBlur}
            placeholder="project id. 000351 ..."
            className="w-80 p-2 rounded-l focus:bg-gray-800 hover:bg-gray-800 text-sm text-gray-200 bg-pageBackground border border-gray-500 focus:outline-none focus:border-gray-400"
          />{" "}
          {/*onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleButtonClickBySearch();
            }
          }}*/}
          <button
            onClick={handleButtonClickBySearch}
            className="px-4 py-2 ml-1 bg-gray-700 text-sm text-gray-300 border border-gray-500 rounded-r hover:bg-gray-600"
          >
            <strong>Search</strong>
          </button>
        </div>
      </div>
      <br />
      <div className="card" id="pj-list-projects">
        {isFocusedContent ? (
          <table className="text-sm table-auto w-full border text-lightWhiteLetter">
            <thead>
              <tr className="w-full bg-gray-700 text-left">
                <th className="px-4 py-2 border border-gray-500">
                  Proj. ID
                </th>
                <th className="px-4 py-2 border border-gray-500">
                  Description
                </th>
                <th className="px-4 py-2 border border-gray-500">Status</th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 shadow-lg">
              {Array.isArray(searchResults) && searchResults.length > 0 ? (
                searchResults.map((project) => (
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
                      {truncateDescription(project.description, 80)}
                    </td>
                    <td className="border text-gray-400 border-gray-500 px-4 py-2 italic">
                      {project.completed ? (
                        <>
                          <div className="flex items-center space-between">
                            <div>
                              <span className="text-gray-400px-4 italic">
                                Completed.
                                <br />
                                If you want to share this project, click the
                                button below.
                              </span>
                            </div>
                            <div className="px-5">
                              {loading && <p>Cargando...</p>}
                              {error && <p style={{ color: "red" }}>{error}</p>}
                              <Link to="/dashboard/old-project">
                                <button
                                  className="px-4 py-2 text-sm text-gray-300 bg-gray-800 rounded hover:bg-gray-500 hover:text-gray-800"
                                  onClick={handleNavigate}
                                  disabled={loading}
                                >
                                  <FaShare />
                                </button>
                              </Link>
                            </div>
                          </div>
                        </>
                      ) : (
                        "In Progress"
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
            <table className="text-sm table-auto w-full border text-lightWhiteLetter">
              <thead>
                <tr className="w-full bg-gray-700 text-left">
                  <th className="px-4 py-2 border border-gray-500">
                    Proj. ID
                  </th>
                  <th className="px-4 py-2 border border-gray-500">
                    Project Manager
                  </th>
                  <th className="px-4 py-2 border border-gray-500">
                    Delivery Date
                  </th>
                  <th className="px-4 py-2 border border-gray-500">Progress</th>
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
                      {getProjectManager(project.id)}
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
        )}
      </div>

      {/* 2. SECOND PART */}
      <div className="col-span-12 pt-10">
        <div className="card" id="pj-info-projects">
          <div className="text-sm text-white m-4 text-lightWhiteLetter">
            {selectedProject ? (
              <div>
                <div>
                  {/* 2.1. Project details */}
                  <div className="flex pb-2 text-2xl">
                    <div className="pr-2 font-medium ">
                      IDENTIFICATION NUMBER
                    </div>
                    <div>
                      <h2 className="font-bold italic">
                        #{selectedProject.identification_number}
                      </h2>
                    </div>
                  </div>
                  <hr className="mb-5 border-b border-gray-700" />
                  <div className="flex mx-5 grid-cols-12 text-lg">
                    <div className="col-span-6">
                      <div className="grid grid-cols-12 w-full gap-4">
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
                      <div className="grid grid-cols-12 w-full gap-4">
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

                  <div className="mt-5">
                    <strong className="text-xl">Description</strong>
                    <br />
                    {selectedProject.description}
                  </div>
                  <hr className="mb-3 mt-2 border-b border-gray-700" />
                  <div className="px-20 grid grid-cols-12 w-full gap-4">
                    <div className="col-span-6">
                      Delivery Date.{" "}
                      <strong>{selectedProject.delivery_date}</strong>
                    </div>
                    <div className="col-span-6">
                      Cost Material.{" "}
                      <strong>${selectedProject.cost_material} USD</strong>
                    </div>
                  </div>
                </div>
                <div className="pt-5">
                  {/* 2.2. Assemblies */}
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
                                    <span className="text-gray-400 pr-1">
                                      {i + 1}. <strong>ID.</strong>
                                    </span>
                                    {/* name of assembly */}
                                    <span className="text-white">
                                      {assembly.identification_number}
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
                                                assembly.completed_assembly
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
                                                  <div className="px-4 mx-2 text-sm text-gray-400 hover:text-gray-200">
                                                    {isEditing ? (
                                                      <div>
                                                        <input
                                                          type="date"
                                                          value={date}
                                                          onChange={
                                                            handleDateChange
                                                          }
                                                          onBlur={handleBlur}
                                                          className="px-4 mx-2 text-sm text-gray-400"
                                                        />
                                                        <button
                                                          onClick={
                                                            handleConfirmClick
                                                          }
                                                          className="px-4 mx-2 text-sm text-gray-400 hover:text-gray-200"
                                                        >
                                                          Confirmar
                                                        </button>
                                                      </div>
                                                    ) : (
                                                      <div
                                                        className="px-4 mx-2 text-sm text-gray-400 hover:text-gray-200"
                                                        onClick={handleDivClick}
                                                      >
                                                        {date
                                                          ? date
                                                          : "Add date order"}
                                                      </div>
                                                    )}
                                                  </div>
                                                  <div>
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
              </div>
            ) : (
              "Select a project to see the details ..."
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Projects;
