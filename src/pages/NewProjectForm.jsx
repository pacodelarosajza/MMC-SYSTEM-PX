import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

const NewProjectForm = () => {
  const apiIpAddress = import.meta.env.VITE_API_IP_ADDRESS;

  const [stocks, setStocks] = useState([]);
  const [newStock, setNewStock] = useState({ item_id: "", quantity: "" });
  const [items, setItems] = useState([]);
  const [activeProjects, setActiveProjects] = useState([]);
  const [newProject, setNewProject] = useState({
    identification_number: "",
    delivery_date: "",
    completed: 0,
    cost_material: "",
    description: "",
  });

  const [currentPage, setCurrentPage] = useState(0);
  const [showCard, setShowCard] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const recordsPerPage = 10;

  const [userSelections, setUserSelections] = useState([
    { id: Date.now(), value: "" },
  ]);
  const users = ["user1", "user2", "user3"];

  useEffect(() => {
    fetchStocks();
    fetchItems();
    fetchActiveProjects();
  }, []);

  const fetchStocks = async () => {
    try {
      const response = await axios.get(`${apiIpAddress}/api/getAllStockk`);
      setStocks(response.data);
    } catch (error) {
      console.error("Error fetching stocks:", error);
    }
  };

  const fetchItems = async () => {
    try {
      const response = await axios.get(`${apiIpAddress}/api/getItems`);
      setItems(response.data);
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  };

  const fetchActiveProjects = async () => {
    try {
      const response = await axios.get(
        `${apiIpAddress}/api/getProjectsActives`
      );
      setActiveProjects(response.data);
    } catch (error) {
      console.error("Error fetching projects info:", error);
    }
  };

  const handleCreateStock = async () => {
    try {
      await axios.post(`${apiIpAddress}/api/postStock`, newStock);
      setNewStock({ item_id: "", quantity: "" });
      fetchStocks();
    } catch (error) {
      console.error("Error creating stock:", error);
    }
  };

  const handleDeleteStock = async (id) => {
    try {
      await axios.delete(`${apiIpAddress}/api/deleteStock/${id}`);
      fetchStocks();
    } catch (error) {
      console.error("Error deleting stock:", error);
    }
  };

  const handleCreateProject = async () => {
    try {
      await axios.post(`${apiIpAddress}/api/postProject`, newProject);
      setNewProject({
        identification_number: "",
        delivery_date: "",
        completed: 0,
        cost_material: "",
        description: "",
      });
      fetchActiveProjects();
      alert("Project registration successful");
    } catch (error) {
      console.error("Error creating project:", error);
      alert("Project registration failed");
    }
  };

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

  const handleChange = (event) => {
    const { name, value } = event.target;
    setNewProject((prevProject) => ({
      ...prevProject,
      [name]: value,
    }));
  };

  const handleButtonClick = () => {
    setShowCard(!showCard);
  };

  const handleNextPage = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  const handlePreviousPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 0));
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const startIndex = currentPage * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const currentProjects = activeProjects.slice(startIndex, endIndex);

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

  const addUserSelection = () => {
    setUserSelections([...userSelections, { id: Date.now(), value: "" }]);
  };

  const removeUserSelection = (id) => {
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
  };

  const selectedUsers = userSelections.map(
    (userSelection) => userSelection.value
  );

  const [InTable, setInTable] = useState([]);

  const addRowInTable = () => {
    const newRow = {
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
    setInTable(InTable.filter((row) => row.id !== id));
  };

  const handleInputChange = (id, field, value) => {
    const updatedTable = InTable.map((row) => {
      if (row.id === id) {
        return { ...row, [field]: value };
      }
      return row;
    });
    setInTable(updatedTable);
  };

  const [isDivVisible, setIsDivVisible] = useState(false);

  const handleToggleDiv = () => {
    setIsDivVisible(!isDivVisible);
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
                  className="hover:bg-pageSideMenuTextHover cursor-pointer transition duration-200"
                >
                  <td className="px-4 border-t border-r border-b border-gray-500">
                    # {project.identification_number}
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
                  Complete the following information to register a new project.
                  Make sure that all data is accurate and complete and remember
                  that, although you can edit the data later, once published,
                  all users with permissions will be able to view the project
                  information. <br />
                </h5>
                <h5 className=" pb-5 font-bold">
                  Fields marked with <span className="text-red-500">*</span> are
                  required. <br />
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
                    Identification Number
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
                    Cost Material
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
                    <span className="pr-2"></span>USD
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="delivery_date"
                    className="block text-sm font-medium leading-6 text-gray-200"
                  >
                    Delivery Date
                  </label>
                  <input
                    type="date"
                    name="delivery_date"
                    className="p-2 rounded bg-gray-700 text-white"
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
                    Project manager
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
                        className="p-2 rounded bg-gray-700 text-white w-1/2"
                        value={userSelection.value}
                        onChange={(e) =>
                          handleUserChange(userSelection.id, e.target.value)
                        }
                      >
                        <option value="" disabled>
                          N/A
                        </option>
                        {users
                          .filter(
                            (user) =>
                              !selectedUsers.includes(user) ||
                              user === userSelection.value
                          )
                          .map((user) => (
                            <option key={user} value={user}>
                              {user}
                            </option>
                          ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => removeUserSelection(userSelection.id)}
                        className="ml-2 px-2 py-1 border border-red-500 bg-red-900 text-red-300 hover:border hover:border-red-400 hover:bg-red-700 hover:text-red-200 rounded"
                      >
                        <strong>X</strong>
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addUserSelection}
                    className="px-2 border border-blue-500 bg-blue-900 text-blue-300 hover:border hover:border-blue-400 hover:bg-blue-700 hover:text-blue-200 rounded"
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
                    Personnel with reception authorization
                  </h2>
                  <h5 className="text-sm text-gray-200">
                    Selects personnel authorized to receive project materials.
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
                        className="p-2 rounded bg-gray-700 text-white w-1/2"
                        value={userSelection.value}
                        onChange={(e) =>
                          handleUserChange(userSelection.id, e.target.value)
                        }
                      >
                        <option value="" disabled>
                          N/A
                        </option>
                        {users
                          .filter(
                            (user) =>
                              !selectedUsers.includes(user) ||
                              user === userSelection.value
                          )
                          .map((user) => (
                            <option key={user} value={user}>
                              {user}
                            </option>
                          ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => removeUserSelection(userSelection.id)}
                        className="ml-2 px-2 py-1 border border-red-500 bg-red-900 text-red-300 hover:border hover:border-red-400 hover:bg-red-700 hover:text-red-200 rounded"
                      >
                        <strong>X</strong>
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addUserSelection}
                    className="px-2 border border-blue-500 bg-blue-900 text-blue-300 hover:border hover:border-blue-400 hover:bg-blue-700 hover:text-blue-200 rounded"
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
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit ut
                    aliquam, purus sit amet luctus venenatis, lectus magna
                    fringilla urna, porttitor rhoncus dolor purus non enim.
                    <br />
                    Solo puedes usar un maximo de 255 palabras en la descripcion
                    del ensamble.
                  </h5>
                </div>
                <table className="text-sm table-auto w-full text-lightWhiteLetter">
                  <thead className="w-full bg-gray-700 text-left">
                    <tr>
                      <th className="px-4 py-2 border border-gray-500">No</th>
                      <th className="px-4 py-2 border border-gray-500">
                        Assembly ID
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
                  <tbody className="bg-gray-800 shadow-lg" id="table-body">
                    {InTable.map((row, index) => (
                      <tr
                        key={row.id}
                        className="hover:bg-pageSideMenuTextHover cursor-pointer transition duration-200"
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
                            More
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
                      <h2 className="text-xl text-gray-200">
                        Assembly #12837 
                      </h2>
                    </div>
                    <div> {/* Añade un bton para subir archivos en formato .xlsx */}
                      <h5 className="my-5 text-sm text-gray-200">
                      Load materials directly to the assembly, use this option in case the assembly does not have sub-assemblies or you need to load data directly to the assembly. 
                      </h5>
                      <input 
                        type="file"
                        id="file" 
                        name="file" 
                        accept=".xlsx" 
                        className="mt-1 bg-gray-700 text-white"
                      />
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
