import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

const NewProjectForm = () => {
  const apiIpAddress = import.meta.env.VITE_API_IP_ADDRESS; // API IP address

  // ACTIVE PROJECTS AND POST NEW PROJECT STATES
  const [activeProjects, setActiveProjects] = useState([]); // get active projects states
  const [newProject, setNewProject] = useState({
    // post new project states
    identification_number: "",
    delivery_date: "",
    completed: 0,
    cost_material: "",
    description: "",
  });
  const [newUserProject, setNewUserProject] = useState({
    // post new user project states
    projectId: 0,
    users_id: 0,
  });

  //  PROJECT MANAGER AND PERSONNEL WITH RECEPTION AUTHORIZATION SELECTOR STATES
  // project manager selector
  const [adminUsers, setAdminUsers] = useState([]);
  const [userSelections, setUserSelections] = useState([
    { id: Date.now(), value: "" },
  ]);
  // personnel with reception authorization selector
  const [operUsers, setOperUsers] = useState([]);
  const [userOperSelections, setUserOperSelections] = useState([
    { id: Date.now(), value: "" },
  ]);

  // USEEFFECT API OPERATIONS
  useEffect(() => {
    fetchActiveProjects();
    fetchAdminUsers();
    fetchOperUsers();
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
  const fetchAdminUsers = async () => {
    try {
      const response = await axios.get(`${apiIpAddress}/getUsersByUserType/1`);
      setAdminUsers(response.data);
    } catch (error) {
      console.error("Error fetching admin users:", error);
    }
  };
  const fetchOperUsers = async () => {
    // Fetch oper users from API
    try {
      const response = await axios.get(`${apiIpAddress}/getUsersByUserType/2`);
      setOperUsers(response.data);
    } catch (error) {
      console.error("Error fetching users oper:", error);
    }
  };

  //HANDLE API OPERATIONS
  //HANDLE CREATE AND DELETE PROJECT OPERATIONS
    const handleCreateProject = async () => {
    try {
      const projectResponse = await axios.post(
        `${apiIpAddress}/api/postProject`,
        newProject
      );
      const projectId = projectResponse.data.id;
  
      // Validar que userSelections no esté vacío y que los valores sean correctos
      if (userSelections.length === 0 || userSelections.some(selection => !selection.value)) {
        throw new Error("Please select at least one user for the project.");
      }
  
      // Asignar el projectId a newUserProject
      const userProjectPromises = userSelections.map((userSelection) =>
        axios.post(`${apiIpAddress}/api/user_assign_project`, {
          projectId: projectId,
          users_id: userSelection.value,
        })
      );
  
      await Promise.all(userProjectPromises);
  
      setNewProject({
        identification_number: "",
        delivery_date: "",
        completed: 0,
        cost_material: "",
        description: "",
      });
      fetchActiveProjects();
      alert(`Project registration successful. Project ID: ${projectId}`);
    } catch (error) {
      console.error("Error creating project:", error);
      alert("Project registration failed: " + error.message);
    }
  };
  const handleDeleteProject = async (id) => {
    // Delete a project
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

  // NEW PROJECT "CARD" OPERATIONS
  const [showCard, setShowCard] = useState(false);
  const handleButtonClick = () => {
    // Toggle show/hide card
    setShowCard(!showCard);
  };
  const handleChange = (event) => {
    // Handle input change for new project
    const { name, value } = event.target; // this function is used to handle the change in the input fields of the new project form
    setNewProject((prevProject) => ({
      ...prevProject,
      [name]: value,
    }));
  };

  // PROJECT MANAGER AND PERSONNEL WITH RECEPTION AUTHORIZATION SELECTOR OPERATIONS
  // PROJECT MANAGER SELECTOR OPERATIONS
  const addUserSelection = () => {
    setUserSelections([...userSelections, { id: Date.now(), value: "" }]);
  };
  const removeUserSelection = (id) => {
    // Remove a user selection
    setUserSelections(
      userSelections.filter((userSelection) => userSelection.id !== id)
    );
  };
  const handleUserChange = (id, value) => {
    setUserSelections(
      userSelections.map((userSelection) =>
        userSelection.id === id ? { ...userSelection, value } : userSelection
      )
    );

    // Actualizar newUserProject con el users_id seleccionado
    setNewUserProject((prevNewUserProject) => ({
      ...prevNewUserProject,
      users_id: value,
    }));
  };
  const selectedUsers = userSelections.map(
    // Get selected users
    (userSelection) => userSelection.value
  );
  // PERSONNEL WITH RECEPTION AUTHORIZATION SELECTOR OPERATIONS
  const addUserOperSelection = () => {
    setUserOperSelections([
      ...userOperSelections,
      { id: Date.now(), value: "" },
    ]);
  };
  const removeUserOperSelection = (id) => {
    setUserOperSelections(
      userOperSelections.filter(
        (userOperSelection) => userOperSelection.id !== id
      )
    );
  };
  const handleUserOperChange = (id, value) => {
    setUserOperSelections(
      userOperSelections.map((userOperSelection) =>
        userOperSelection.id === id
          ? { ...userOperSelection, value }
          : userOperSelection
      )
    );
  };
  const selectedUsersOper = userOperSelections.map(
    (userOperSelection) => userOperSelection.value
  );

  // TABLES OPERATIONS
  // ASSEMBLIES TABLE
  const [InTable, setInTable] = useState([]); // Assemblies table states
  const [isDivVisible, setIsDivVisible] = useState(false);
  const handleToggleDiv = () => {
    setIsDivVisible(!isDivVisible); // Toggle visibility of the div
  };
  const addRowInTable = () => {
    const newRow = {
      // Add a row to the assemblies table
      id: Date.now(),
      assemblyId: "",
      description: "",
      deliveryDate: "",
      completedDate: "",
      price: "",
    };
    setInTable([...InTable, newRow]);
  };
  const removeRow = (id) => {
    setInTable(InTable.filter((row) => row.id !== id)); // Remove a row from the assemblies table
  };
  const handleInputChange = (id, field, value) => {
    const updatedTable = InTable.map((row) => {
      // Handle input change in the assemblies table
      if (row.id === id) {
        return { ...row, [field]: value };
      }
      return row;
    });
    setInTable(updatedTable);
  };
  // SUBASSEMBLIES TABLES
  const [InTableSubass, setInTableSubass] = useState([]); // Subassemblies table states
  const [isDivVisibleSubass, setIsDivVisibleSubass] = useState(false);
  const handleToggleDivSubass = () => {
    setIsDivVisibleSubass(!isDivVisibleSubass); // Toggle visibility of the subassemblies div
  };
  const addRowInTableSubass = () => {
    const newRowSubass = {
      // Add a row to the subassemblies table
      id: Date.now(),
      assemblyId: "",
      description: "",
      deliveryDate: "",
      completedDate: "",
      price: "",
    };
    setInTableSubass([...InTableSubass, newRowSubass]);
  };
  const removeRowSubass = (id) => {
    setInTableSubass(InTableSubass.filter((rowSubass) => rowSubass.id !== id)); // Remove a row from the subassemblies table
  };
  const handleInputChangeSubass = (id, field, value) => {
    const updatedTable = InTableSubass.map((rowSubass) => {
      // Handle input change in the subassemblies table
      if (rowSubass.id === id) {
        return { ...rowSubass, [field]: value };
      }
      return rowSubass;
    });
    setInTableSubass(updatedTable);
  };
  // HANDLE ASSEMBLY TABLE OPERATIONS
  const handleAddAssembly = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    try {
      await axios.post(`${apiIpAddress}/api/addAssembly`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      alert("Assembly added successfully");
      fetchAssemblies(); // Refresh the list of assemblies
      closeModal();
    } catch (error) {
      console.error("Error adding assembly:", error);
      alert("Failed to add assembly");
    }
  };

  //SELECTOR FOR CHOOSING THE WAY TO REGISTER MATERIALS
  const [addItemsForm, setaddItemsForm] = useState("");
  const handleAddItemsForm = (event) => {
    setaddItemsForm(event.target.value); // Handle change in the selector for choosing the way to register materials
  };

  // SELECTOR FILE CONTAINER OPERATIONS
  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const handleFileClick = () => {
    fileInputRef.current.click();
  };
  const handleFileChange = (event) => {
    const file = event.target.files[0]; // Handle file change
    if (file) {
      setFileName(file.name);
    }
  };
  const handleDragOver = (event) => {
    event.preventDefault(); // Handle drag over
    setDragActive(true);
  };
  const handleDragLeave = () => {
    setDragActive(false); // Handle drag leave
  };
  const handleDrop = (event) => {
    event.preventDefault(); // Handle drop
    setDragActive(false);
    const file = event.dataTransfer.files[0];
    if (file) {
      setFileName(file.name);
    }
  };
  const handleRemoveFile = () => {
    setFileName(""); // Handle remove file
    fileInputRef.current.value = null;
  };

  return (
    <div className="px-4 py-5 min-h-screen">
      <h1 className="text-2xl mt-5 px-10 font-bold text-right">
        Projects management
      </h1>

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
                      <div className="p-2">
                        <button
                          onClick={openModal}
                          className="w-15 px-2 py-1 text-gray-400 text-xs bg-pageBackground border border-pageBackground hover:border hover:bg-green-900 hover:border-green-500 hover:text-green-300 rounded"
                        >
                          Edit
                        </button>
                      </div>
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

      <div className=" py-10 pb-20">
        <button
          onClick={handleButtonClick}
          className="w-full bg-gray-900 border border-blue-500 text-blue-400 font-bold shadow-lg px-5 py-2 my-2 hover:border hover:bg-blue-900 hover:border-blue-500 hover:text-blue-300 rounded"
        >
          Register a new project
        </button>

        {showCard && (
          <div className="bg-gray-800 px-5 rounded-lg shadow-lg mb-5">
            <div className="px-2 pb-5">
              <div className="pt-5 pb-3 text-sm text-gray-200">
                <h5 className=" pb-1 ">
                  Complete the following information to register a project.
                  Remember that, although you can edit the data later, once
                  uploaded, all users will be able to see the project
                  information.
                  <strong>
                    {" "}
                    Fields marked with <span className="text-red-500">
                      *
                    </span>{" "}
                    are required.
                  </strong>
                </h5>
              </div>

              <h2 className="text-xl pt-5 text-gray-200 font-bold">
                Project Data
              </h2>
              <div className="flex gap-10 pt-5">
                <div>
                  <label
                    htmlFor="identification_number"
                    className="block text-sm font-medium leading-6 text-gray-200"
                  >
                    Identification Number{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="identification_number"
                    placeholder="ex. 211710"
                    className="p-2 rounded bg-gray-700 text-white"
                    value={newProject.identification_number}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label
                    htmlFor="cost_material"
                    className="block text-sm font-medium leading-6 text-gray-200"
                  >
                    Cost Material <span className="text-red-500">*</span>
                  </label>
                  <div>
                    $<span className="pr-2"></span>
                    <input
                      type="text"
                      name="cost_material"
                      placeholder="ex. 30000"
                      className="p-2 rounded bg-gray-700 text-white"
                      value={newProject.cost_material}
                      onChange={handleChange}
                    />
                    <span className="pr-2"></span>MXN
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="delivery_date"
                    className="block text-sm font-medium leading-6 text-gray-200"
                  >
                    Delivery Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="delivery_date"
                    className="p-2 rounded bg-gray-700 text-white "
                    value={newProject.delivery_date}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="col-span-full pt-3">
                <label
                  htmlFor="description"
                  className="block text-sm font-medium leading-6 text-gray-200"
                >
                  Descripcion
                </label>
                <div className="mt-2">
                  <textarea
                    id="description"
                    name="description"
                    rows="3"
                    placeholder="Write a short description of the project to quickly identify it."
                    className="block w-full rounded-md border-0 p-3 text-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 bg-gray-700 caret-white"
                    value={newProject.description}
                    onChange={handleChange}
                  ></textarea>
                  <div className="m-1 text-gray-400">
                    {newProject.description.length}/255 characters
                  </div>
                </div>
              </div>

              <div className="col-span-full py-5">
                <hr className="border border-1 border-gray-500" />
              </div>

              <div className="col-span-full pt-3">
                <div className="mb-5">
                  <h2 className="text-xl text-gray-200 font-bold">
                    Project manager <span className="text-red-500">*</span>
                  </h2>
                  <h5 className="text-sm text-gray-200">
                    Select the project manager.
                  </h5>
                </div>
                <div>
                  {userSelections.map((userSelection) => (
                    <div
                      key={userSelection.id}
                      className="mb-2 flex items-center"
                    >
                      <select
                        name={`identification_number_${userSelection.id}`}
                        className="p-2 rounded bg-gray-700 text-white w-1/2 cursor-pointer"
                        value={userSelection.value}
                        onChange={(e) =>
                          handleUserChange(userSelection.id, e.target.value)
                        }
                      >
                        <option value="" disabled>
                          N/A
                        </option>
                        {adminUsers
                          .filter(
                            (user) =>
                              !selectedUsers.includes(user.id) ||
                              user.id === userSelection.value
                          )
                          .map((user) => (
                            <option key={user.id} value={user.id}>
                              {user.user_number}
                            </option>
                          ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => removeUserSelection(userSelection.id)}
                        className="ml-2 px-2 py-1 border border-red-500 bg-red-900 text-red-300 hover:border-red-400 hover:bg-red-700 hover:text-red-200 rounded"
                      >
                        <strong>X</strong>
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addUserSelection}
                    className="px-2 border border-blue-500 bg-blue-900 text-blue-300 hover:border-blue-400 hover:bg-blue-700 hover:text-blue-200 rounded"
                  >
                    <strong>+</strong>
                  </button>
                </div>
              </div>

              <div className="col-span-full py-5">
                <hr className="border border-1 border-gray-500" />
              </div>

              <div className="col-span-full pt-3">
                <div className="mb-5">
                  <h2 className="text-xl text-gray-200 font-bold">
                    Personnel with reception authorization{" "}
                    <span className="text-red-500">*</span>
                  </h2>
                  <h5 className="text-sm text-gray-200">
                    Selects personnel authorized to receive project materials.
                  </h5>
                </div>
                <div>
                  {userOperSelections.map((userOperSelection) => (
                    <div
                      key={userOperSelection.id}
                      className="mb-2 flex items-center"
                    >
                      <select
                        name={`identification_number_${userOperSelection.id}`}
                        className="p-2 rounded bg-gray-700 text-white w-1/2 cursor-pointer"
                        value={userOperSelection.value}
                        onChange={(e) =>
                          handleUserOperChange(
                            userOperSelection.id,
                            e.target.value
                          )
                        }
                      >
                        <option value="" disabled>
                          N/A
                        </option>
                        {operUsers
                          .filter(
                            (user) =>
                              !selectedUsersOper.includes(user.id) ||
                              user.id === userOperSelection.value
                          )
                          .map((user) => (
                            <option key={user.id} value={user.id}>
                              {user.user_number}
                            </option>
                          ))}
                      </select>
                      <button
                        type="button"
                        onClick={() =>
                          removeUserOperSelection(userOperSelection.id)
                        }
                        className="ml-2 px-2 py-1 border border-red-500 bg-red-900 text-red-300 hover:border-red-400 hover:bg-red-700 hover:text-red-200 rounded"
                      >
                        <strong>X</strong>
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addUserOperSelection}
                    className="px-2 border border-blue-500 bg-blue-900 text-blue-300 hover:border-blue-400 hover:bg-blue-700 hover:text-blue-200 rounded"
                  >
                    <strong>+</strong>
                  </button>
                </div>
              </div>

              <div className="col-span-full py-5">
                <hr className="border border-1 border-gray-500" />
              </div>

              <div className="col-span-full pt-3">
                <div className="mb-5">
                  <h2 className="text-xl text-gray-200 font-bold">
                    Registration of assemblies
                  </h2>
                  <h5 className="text-sm text-gray-200">
                    Register the assemblies that will be part of the project.
                    You may use a maximum of 255 characters in the description
                    of each assembly.
                  </h5>
                </div>
                <table className="text-sm table-auto w-full text-lightWhiteLetter">
                  <thead className="w-full bg-gray-700 text-left">
                    <tr>
                      <th className="px-4 py-2 border border-gray-500">No</th>
                      <th className="px-4 py-2 border border-gray-500">
                        Assembly ID <span className="text-red-500">*</span>
                      </th>
                      <th className="px-4 py-2 border border-gray-500">
                        Description
                      </th>
                      <th className="px-4 py-2 border border-gray-500">
                        Delivery Date <span className="text-red-500">*</span>
                      </th>
                      <th className="px-4 py-2 border border-gray-500">
                        Completed Date <span className="text-red-500">*</span>
                      </th>
                      <th className="px-4 py-2 border border-gray-500">
                        Price <span className="text-red-500">*</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800 shadow-lg" id="table-body">
                    {InTable.map((row, index) => (
                      <tr
                        key={row.id}
                        className="hover:bg-pageSideMenuTextHover transition duration-200"
                      >
                        <td className="px-4 border-t border-r border-b border-gray-500">
                          {index + 1}
                        </td>
                        <td className="px-4 border border-gray-500">
                          <input
                            type="text"
                            className="w-full p-1 bg-transparent outline-none"
                            value={row.assemblyId}
                            onChange={(e) =>
                              handleInputChange(
                                row.id,
                                "assemblyId",
                                e.target.value
                              )
                            }
                          />
                        </td>
                        <td className="px-4 border border-gray-500">
                          <textarea
                            className="w-full bg-transparent outline-none resize-none overflow-hidden"
                            value={row.description}
                            onChange={(e) =>
                              handleInputChange(
                                row.id,
                                "description",
                                e.target.value
                              )
                            }
                            rows={1}
                            onInput={(e) => {
                              e.target.style.height = "auto";
                              e.target.style.height = `${e.target.scrollHeight}px`;
                            }}
                          />
                        </td>
                        <td className="px-4 border border-gray-500">
                          <input
                            type="date"
                            className="w-full bg-transparent outline-none"
                            value={row.deliveryDate}
                            onChange={(e) =>
                              handleInputChange(
                                row.id,
                                "deliveryDate",
                                e.target.value
                              )
                            }
                          />
                        </td>
                        <td className="px-4 border border-gray-500">
                          <input
                            type="date"
                            className="w-full bg-transparent outline-none"
                            value={row.completedDate}
                            onChange={(e) =>
                              handleInputChange(
                                row.id,
                                "completedDate",
                                e.target.value
                              )
                            }
                          />
                        </td>
                        <td className="px-4 border-t border-b border-l border-gray-500">
                          <input
                            type="number"
                            step="0.01"
                            className="w-full bg-transparent outline-none"
                            value={row.price}
                            onChange={(e) =>
                              handleInputChange(row.id, "price", e.target.value)
                            }
                          />
                        </td>
                        <div className="flex">
                          <button
                            type="button"
                            onClick={handleToggleDiv}
                            className="ml-2 px-2 mt-1 text-xs border border-orange-500 bg-orange-900 text-orange-300 hover:border-orange-400 hover:bg-orange-700 hover:text-orange-200 rounded"
                          >
                            Mtl
                          </button>
                          <button
                            type="button"
                            onClick={() => removeRow(row.id)}
                            className="ml-2 mr-2 mt-1 px-2 border border-red-500 bg-red-900 text-red-300 hover:border-red-400 hover:bg-red-700 hover:text-red-200 rounded"
                          >
                            <strong>X</strong>
                          </button>
                        </div>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="flex">
                  <button
                    onClick={addRowInTable}
                    className="m-3 px-3 py-1 border border-blue-500 bg-blue-900 text-blue-300 hover:border-blue-400 hover:bg-blue-700 hover:text-blue-200 rounded"
                  >
                    Add row
                  </button>
                </div>
                {isDivVisible && (
                  <div className="pt-3">
                    <div>
                      <h2 className="text-xl text-gray-200 font-bold">
                        Registration of materials.
                      </h2>
                      <h2 className="text-xl text-gray-200">Assembly #12837</h2>
                      <h5 className="text-sm pt-5 pb-3 text-gray-200">
                        Select the way in which the materials will be registered
                        in the project.
                      </h5>
                    </div>
                    <div>
                      <select
                        value={addItemsForm}
                        onChange={handleAddItemsForm}
                        className="w-full mb-4 p-2 border border-gray-500 rounded bg-gray-800 text-white cursor-pointer"
                      >
                        <option value="" disabled>
                          Select an option
                        </option>
                        {/*<option value="option1">
                          Not now. Discharge the project without registration of
                          materials for the time being.
                        </option>*/}
                        <option value="option2">
                          Discharge materials without the use of subassemblies.
                        </option>
                        <option value="option3">
                          Discharge materials by means of subassemblies.
                        </option>
                      </select>

                      {/*addItemsForm === "option1" ? (
                        <div className="px-10">
                          <h5 className="pt-5 text-gray-400">
                            Register the project without materials for now; come
                            back later and add them by clicking the “Edit”
                            button in the project list at the top of this page.
                          </h5>{" "}
                        </div>
                      ) :*/}

                      {addItemsForm === "option2" ? (
                        <div className="px-10">
                          <div className="py-5">
                            <h5 className="text-sm py-5 text-gray-200">
                              Upload the materials concentrate. Only .xlsx files
                              will be accepted. FORMAT ...
                            </h5>
                            <input
                              type="file"
                              id="file"
                              name="file"
                              accept=".xlsx"
                              className="hidden"
                              ref={fileInputRef}
                              onChange={handleFileChange}
                            />
                            <div
                              onDragOver={handleDragOver}
                              onDragLeave={handleDragLeave}
                              onDrop={handleDrop}
                              className={`rounded p-6 flex flex-col items-center justify-center ${
                                dragActive
                                  ? "border-2 border-blue-400 border-dashed bg-blue-900 bg-opacity-50"
                                  : "border-2 border-opacity-30 border-purple-500 border-dashed"
                              }`}
                            >
                              <div className="flex items-center justify-center">
                                <p className="text-sm text-purple-200">
                                  {fileName ? (
                                    <strong>Selected file:</strong>
                                  ) : (
                                    "Drag or select a file"
                                  )}{" "}
                                  {fileName}
                                </p>
                                {fileName && (
                                  <button
                                    type="button"
                                    onClick={handleRemoveFile}
                                    className="ml-2 px-2 border border-transparent bg-transparent text-red-500 hover:text-red-300 hover:border hover:bg-red-900 rounded"
                                  >
                                    x
                                  </button>
                                )}
                              </div>
                              <div>
                                <button
                                  type="button"
                                  onClick={handleFileClick}
                                  className="text-sm px-3 mt-6 py-1 border border-purple-500 bg-purple-900 text-purple-300 hover:border-purple-400 hover:bg-purple-700 hover:text-purple-200 rounded"
                                >
                                  Seleccionar archivo
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : addItemsForm === "option3" ? (
                        <div className="px-3">
                          <h5 className="text-sm pt-5 pb-3 text-gray-200">
                            Register the subassemblies. You may use a maximum of
                            255 characters within the description of each
                            subassembly.
                          </h5>
                          <table className="text-sm table-auto w-full text-lightWhiteLetter">
                            <thead className="w-full bg-gray-700 text-left">
                              <tr>
                                <th className="px-4 py-2 border border-gray-500">
                                  No
                                </th>
                                <th className="px-4 py-2 border border-gray-500">
                                  Subassembly ID
                                </th>
                                <th className="px-4 py-2 border border-gray-500">
                                  Description
                                </th>
                                <th className="px-4 py-2 border border-gray-500">
                                  Delivery Date
                                </th>
                                <th className="px-4 py-2 border border-gray-500">
                                  Completed Date
                                </th>
                                <th className="px-4 py-2 border border-gray-500">
                                  Price
                                </th>
                              </tr>
                            </thead>

                            <tbody
                              className="bg-gray-800 shadow-lg"
                              id="table-body"
                            >
                              {InTableSubass.map((rowSubass, index) => (
                                <tr
                                  key={rowSubass.id}
                                  className="hover:bg-pageSideMenuTextHover transition duration-200"
                                >
                                  <td className="px-4 border-t border-r border-b border-gray-500">
                                    {index + 1}
                                  </td>
                                  <td className="px-4 border border-gray-500">
                                    <input
                                      type="text"
                                      className="w-full p-1 bg-transparent outline-none"
                                      value={rowSubass.assemblyId}
                                      onChange={(e) =>
                                        handleInputChangeSubass(
                                          rowSubass.id,
                                          "assemblyId",
                                          e.target.value
                                        )
                                      }
                                    />
                                  </td>
                                  <td className="px-4 border border-gray-500">
                                    <textarea
                                      className="w-full bg-transparent outline-none resize-none overflow-hidden"
                                      value={rowSubass.description}
                                      onChange={(e) =>
                                        handleInputChangeSubass(
                                          rowSubass.id,
                                          "description",
                                          e.target.value
                                        )
                                      }
                                      rows={1}
                                      onInput={(e) => {
                                        e.target.style.height = "auto";
                                        e.target.style.height = `${e.target.scrollHeight}px`;
                                      }}
                                    />
                                  </td>
                                  <td className="px-4 border border-gray-500">
                                    <input
                                      type="date"
                                      className="w-full bg-transparent outline-none"
                                      value={rowSubass.deliveryDate}
                                      onChange={(e) =>
                                        handleInputChangeSubass(
                                          rowSubass.id,
                                          "deliveryDate",
                                          e.target.value
                                        )
                                      }
                                    />
                                  </td>
                                  <td className="px-4 border border-gray-500">
                                    <input
                                      type="date"
                                      className="w-full bg-transparent outline-none"
                                      value={rowSubass.completedDate}
                                      onChange={(e) =>
                                        handleInputChangeSubass(
                                          rowSubass.id,
                                          "completedDate",
                                          e.target.value
                                        )
                                      }
                                    />
                                  </td>
                                  <td className="px-4 border-t border-b border-l border-gray-500">
                                    <input
                                      type="number"
                                      step="0.01"
                                      className="w-full bg-transparent outline-none"
                                      value={rowSubass.price}
                                      onChange={(e) =>
                                        handleInputChangeSubass(
                                          rowSubass.id,
                                          "price",
                                          e.target.value
                                        )
                                      }
                                    />
                                  </td>
                                  <div className="flex">
                                    <button
                                      type="button"
                                      onClick={handleToggleDivSubass}
                                      className="ml-2 px-2 mt-1 text-xs border border-orange-500 bg-orange-900 text-orange-300 hover:border-orange-400 hover:bg-orange-700 hover:text-orange-200 rounded"
                                    >
                                      Mtl
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        removeRowSubass(rowSubass.id)
                                      }
                                      className="ml-2 mr-2 mt-1 px-2 border border-red-500 bg-red-900 text-red-300 hover:border-red-400 hover:bg-red-700 hover:text-red-200 rounded"
                                    >
                                      <strong>X</strong>
                                    </button>
                                  </div>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          <div className="flex">
                            <button
                              onClick={addRowInTableSubass}
                              className="text-sm m-3 px-3 py-1 border border-blue-500 bg-blue-900 text-blue-300 hover:border-blue-400 hover:bg-blue-700 hover:text-blue-200 rounded"
                            >
                              Add row
                            </button>
                          </div>
                          {isDivVisibleSubass && (
                            <div className="px-10">
                              <div className="py-5">
                                <h5 className="text-sm py-5 text-gray-200">
                                  Upload the materials concentrate. Only .xlsx
                                  files will be accepted. FORMAT ...
                                </h5>
                                <input
                                  type="file"
                                  id="file"
                                  name="file"
                                  accept=".xlsx"
                                  className="hidden"
                                  ref={fileInputRef}
                                  onChange={handleFileChange}
                                />
                                <div
                                  onDragOver={handleDragOver}
                                  onDragLeave={handleDragLeave}
                                  onDrop={handleDrop}
                                  className={`rounded p-6 flex flex-col items-center justify-center ${
                                    dragActive
                                      ? "border-2 border-blue-400 border-dashed bg-blue-900 bg-opacity-50"
                                      : "border-2 border-opacity-30 border-purple-500 border-dashed"
                                  }`}
                                >
                                  <div className="flex items-center justify-center">
                                    <p className="text-sm text-purple-200">
                                      {fileName ? (
                                        <strong>Selected file:</strong>
                                      ) : (
                                        "Drag or select a file"
                                      )}{" "}
                                      {fileName}
                                    </p>
                                    {fileName && (
                                      <button
                                        type="button"
                                        onClick={handleRemoveFile}
                                        className="ml-2 px-2 border border-transparent bg-transparent text-red-500 hover:text-red-300 hover:border hover:bg-red-900 rounded"
                                      >
                                        x
                                      </button>
                                    )}
                                  </div>
                                  <div>
                                    <button
                                      type="button"
                                      onClick={handleFileClick}
                                      className="text-sm px-3 mt-6 py-1 border border-purple-500 bg-purple-900 text-purple-300 hover:border-purple-400 hover:bg-purple-700 hover:text-purple-200 rounded"
                                    >
                                      Seleccionar archivo
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div>
                          <p>Seleccione una opción para ver el contenido</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-10 items-center">
                <button
                  onClick={handleCreateProject}
                  className="px-12 py-2 mx-1 bg-green-900 text-sm text-green-300 bg-pageBackground border border-green-500 rounded hover:bg-green-700"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewProjectForm;
