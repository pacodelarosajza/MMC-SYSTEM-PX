import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Modal from "./Modal";

const ProjectsManagmentForm = () => {
  const apiIpAddress = import.meta.env.VITE_API_IP_ADDRESS; // API IP address

  //STATES FOR THE NEW PROJECT
  // Initial states for the project and user-project relationship
  const initialProjectState = {
    identification_number: "",
    delivery_date: "",
    completed: 0,
    cost_material: "",
    description: "",
  };
  const [newProject, setNewProject] = useState(initialProjectState);

  // STATES FOR THE PROJECT MANAGER AND PERSONNEL WITH RECEPTION AUTHORIZATION SELECTORS
  const [adminUsers, setAdminUsers] = useState([]);
  const [userSelections, setUserSelections] = useState([
    // Initial state for the project manager selector
    { id: Date.now(), value: "" },
  ]);
  const [operUsers, setOperUsers] = useState([]);
  const [userOperSelections, setUserOperSelections] = useState([
    // Initial state for the personnel with reception authorization selector
    { id: Date.now(), value: "" },
  ]);

  // STATE FOR THE ASSEMBLIES AND SUBASSEMBLIES TABLE
  const [InTable, setInTable] = useState([]); // Assemblies table states
  const [InTableSubass, setInTableSubass] = useState([]); // Subassemblies table states

  // FETCH ADMIN AND OPERATIONAL USERS WHEN THE COMPONENT MOUNTS. GETERS
  useEffect(() => {
    fetchAdminUsers();
    fetchOperUsers();
  }, []);

  const fetchAdminUsers = async () => {
    try {
      const response = await axios.get(`${apiIpAddress}/getUsersByUserType/1`);
      setAdminUsers(response.data);
    } catch (error) {
      console.error("Error fetching admin users:", error);
    }
  };

  const fetchOperUsers = async () => {
    try {
      const response = await axios.get(`${apiIpAddress}/getUsersByUserType/2`);
      setOperUsers(response.data);
    } catch (error) {
      console.error("Error fetching operational users:", error);
    }
  };

  // STATES FOR MODAL ERROR FORM WINDOW
  const [isModalErrorProjectFieldsOpen, setIsModalErrorProjectFieldsOpen] =
    useState(false);
  const [isModalErrorUserAdminFieldOpen, setIsModalErrorUserAdminFieldOpen] =
    useState(false);
  const [isModalErrorUserOperFieldOpen, setIsModalErrorUserOperFieldOpen] =
    useState(false);
  const [isModalErrorAssemblyFieldOpen, setIsModalErrorAssemblyFieldOpen] =
    useState(false);
  const [
    isModalErrorSubassemblyFieldOpen,
    setIsModalErrorSubassemblyFieldOpen,
  ] = useState(false);
  const [isModalErrorProjectExistsOpen, setIsModalErrorProjectExistsOpen] =
    useState(false);

  // STATES FOR MODAL SUCCESS FORM WINDOW
  const [isModalSuccessProjectOpen, setIsModalSuccessProjectOpen] =
    useState(false);

  const checkIfProjectExists = async (identificationNumber) => {
    try {
      const response = await axios.get(
        `${apiIpAddress}/api/getProjects/identification_number/${identificationNumber}`
      );
      return response.data;
    } catch (error) {
      console.error("Error checking if project exists:", error);
      return false;
    }
  };

  // TODO: HANDLE CREATE PROJECT
  const handleCreateProject = async (event) => {
    event.preventDefault();

    try {
      const projectExists = await checkIfProjectExists(
        newProject.identification_number
      );

      if (projectExists) {
        setIsModalErrorProjectExistsOpen(true);
        return;
      }

      // Validate required fields
      if (
        !newProject.identification_number ||
        !newProject.cost_material ||
        !newProject.delivery_date
      ) {
        setIsModalErrorProjectFieldsOpen(true);
        return;
      }

      if (
        userSelections.length === 0 ||
        userSelections.some((selection) => !selection.value)
      ) {
        setIsModalErrorUserAdminFieldOpen(true);
        return;
      }

      if (
        userOperSelections.length === 0 ||
        userOperSelections.some((selection) => !selection.value)
      ) {
        setIsModalErrorUserOperFieldOpen(true);
        return;
      }

      if (InTable.length === 0) {
        setIsModalErrorAssemblyFieldOpen(true);
        return;
      }

      // Post the new project
      const projectResponse = await axios.post(
        `${apiIpAddress}/api/postProject`,
        newProject
      );
      const projectId = projectResponse.data.id;

      // Post user-project relationships
      const userProjectPromises = [
        ...userSelections.map((userSelection) =>
          axios.post(`${apiIpAddress}/api/user_assign_project`, {
            users_id: userSelection.value,
            project_id: projectId,
          })
        ),
        ...userOperSelections.map((userOperSelection) =>
          axios.post(`${apiIpAddress}/api/user_assign_project`, {
            users_id: userOperSelection.value,
            project_id: projectId,
          })
        ),
      ];
      await Promise.all(userProjectPromises);

      // Post assemblies
      const assemblyPromises = InTable.map((row) =>
        axios.post(`${apiIpAddress}/api/postAssembly`, {
          project_id: projectId,
          identification_number: row.identification_number,
          description: row.description,
          delivery_date: row.delivery_date,
          completed_date: null,
          price: row.price,
          currency: "MXN",
          completed: 0,
        })
      );
      await Promise.all(assemblyPromises);

      // Reset form state after successful submission
      setNewProject(initialProjectState);
      setUserSelections([{ id: Date.now(), value: "" }]);
      setUserOperSelections([{ id: Date.now(), value: "" }]);
      setInTable([]);
      setIsModalSuccessProjectOpen(true);

      return;
    } catch (error) {
      if (error.response) {
        console.error(`Error ${error.response.status}: ${error.response.data}`);
        if (error.response.status === 404) {
          alert("Error 404: Resource not found.");
        } else {
          alert(`Error ${error.response.status}: ${error.response.data}`);
        }
      } else {
        console.error("Error creating project:", error);
        alert("Project registration failed: " + error.message);
      }
    }
  };

  //HANDLE INPUT CHANGE FOR NEW PROJECT
  const handleChange = (event) => {
    const { name, value } = event.target;
    setNewProject((prevProject) => ({
      ...prevProject,
      [name]: value,
    }));
  };

  //PROJECT MANAGER AND PERSONNEL WITH RECEPTION AUTHORIZATION SELECTORS OPERATIONS
  // PROJECT MANAGER SELECTOR OPERATIONS
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

  // NEW PROJECT "CARD" OPERATIONS
  const [showCard, setShowCard] = useState(false);
  const handleButtonClick = () => {
    setShowCard(!showCard);
  };

  // ASSEMBLIES AND SUBASSEMBLIES TABLE OPERATIONS
  // ASSEMBLIES TABLE OPERATIONS

  const [isDivVisible, setIsDivVisible] = useState(false);
  const handleToggleDiv = () => {
    setIsDivVisible(!isDivVisible); // Toggle visibility of the div
  };

  const addRowInTable = () => {
    const newRow = {
      id: Date.now(),
      identification_number: "",
      description: "",
      delivery_date: "",
      price: "",
    };
    setInTable([...InTable, newRow]);
  };

  const removeRow = (id) => {
    setInTable(InTable.filter((row) => row.id !== id)); // Remove a row from the assemblies table
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

  // SUBASSEMBLIES TABLE OPERATIONS
  const [isDivVisibleSubass, setIsDivVisibleSubass] = useState(false);
  const handleToggleDivSubass = () => {
    setIsDivVisibleSubass(!isDivVisibleSubass); // Toggle visibility of the subassemblies div
  };

  const addRowInTableSubass = () => {
    const newRowSubass = {
      id: Date.now(),
      identification_number: "",
      description: "",
      delivery_date: "",
      price: "",
    };
    setInTableSubass([...InTableSubass, newRowSubass]);
  };

  const removeRowSubass = (id) => {
    setInTableSubass(InTableSubass.filter((rowSubass) => rowSubass.id !== id)); // Remove a row from the subassemblies table
  };

  const handleInputChangeSubass = (id, field, value) => {
    const updatedTable = InTableSubass.map((rowSubass) => {
      if (rowSubass.id === id) {
        return { ...rowSubass, [field]: value };
      }
      return rowSubass;
    });
    setInTableSubass(updatedTable);
  };

  // SELECTOR FOR CHOOSING THE WAY TO REGISTER MATERIALS
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
    <div>
      <div className="px-2 pb-5">
        <h2 className="text-xl pt-5 text-gray-200 font-bold">Project Data</h2>
        <div className="flex gap-10 pt-5">
          <div>
            <label
              htmlFor="identification_number"
              className="block text-sm font-medium leading-6 text-gray-200"
            >
              Identification Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="identification_number"
              placeholder="ex. 211710"
              className="p-2 rounded bg-gray-700 text-white"
              value={newProject.identification_number}
              onChange={handleChange}
              required
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
              $
              <input
                type="text"
                name="cost_material"
                placeholder="ex. 30000"
                className="p-2 rounded bg-gray-700 text-white mx-2"
                value={newProject.cost_material}
                onChange={handleChange}
                required
              />
              MXN
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
              className="p-2 rounded bg-gray-700 text-white"
              value={newProject.delivery_date}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="col-span-full pt-3">
          <label
            htmlFor="description"
            className="block text-sm font-medium leading-6 text-gray-200"
          >
            Description
          </label>
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
        <div className="col-span-full py-5">
          <hr className="border border-1 border-gray-500" />
        </div>

        <div className="flex col-span-full pt-3">
          <div>
            <div className="mb-5">
              <h2 className="text-xl text-gray-200 font-bold">
                Project Manager <span className="text-red-500">*</span>
              </h2>
              <h5 className="text-sm text-gray-200">
                Selects the project manager who will be responsible for the
                project.
              </h5>
            </div>

            <div>
              {userSelections.map((userSelection) => (
                <div key={userSelection.id} className="mb-2 flex items-center">
                  <select
                    name={`identification_number_${userSelection.id}`}
                    className="p-2 rounded bg-gray-700 text-white cursor-pointer w-3/4"
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
                    className="ml-2 px-2 py-1 border border-red-500 bg-red-900 text-red-300 rounded hover:border-red-400 hover:bg-red-700 hover:text-red-200"
                  >
                    <strong>X</strong>
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addUserSelection}
                className="px-2 border border-blue-500 bg-blue-900 text-blue-300 rounded"
              >
                <strong>+</strong>
              </button>
            </div>
          </div>

          <div className="col-span-full px-5 flex justify-center">
            <div className="border-l border-gray-500 h-full"></div>
          </div>

          <div className="col-span-full">
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
                    className="p-2 rounded bg-gray-700 text-white w-3/4 cursor-pointer"
                    value={userOperSelection.value}
                    onChange={(e) =>
                      handleUserOperChange(userOperSelection.id, e.target.value)
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
              Register the assemblies that will be part of the project. You may
              use a maximum of 255 characters in the description of each
              assembly.
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
                  Delivery Date <span className="text-red-500">*</span>
                </th>
                <th className="px-4 py-2 border border-gray-500">
                  Description
                </th>
                <th className="px-4 py-2 border border-gray-500" colSpan="2">
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
                  <td className="px-2 border border-gray-500">
                    <input
                      type="text"
                      name="identification_number"
                      className="w-full p-1 bg-transparent outline-none"
                      value={row.identification_number}
                      onChange={(e) =>
                        handleInputChange(
                          row.id,
                          "identification_number",
                          e.target.value
                        )
                      }
                    />
                  </td>

                  <td className="px-2 border border-gray-500">
                    <input
                      type="date"
                      name="delivery_date"
                      className="w-full bg-transparent outline-none"
                      value={row.delivery_date}
                      onChange={(e) =>
                        handleInputChange(
                          row.id,
                          "delivery_date",
                          e.target.value
                        )
                      }
                    />
                  </td>
                  <td className="px-2 border border-gray-500">
                    <textarea
                      className="w-full bg-transparent outline-none resize-none overflow-hidden"
                      name="description"
                      value={row.description}
                      onChange={(e) =>
                        handleInputChange(row.id, "description", e.target.value)
                      }
                      rows={1}
                      onInput={(e) => {
                        e.target.style.height = "auto";
                        e.target.style.height = `${e.target.scrollHeight}px`;
                      }}
                    />
                  </td>
                  <td className="px-2 border-t border-b border-l border-gray-500">
                    <input
                      type="text" // Cambiado de "number" a "text"
                      name="price"
                      className="w-full bg-transparent outline-none"
                      value={row.price}
                      onChange={(e) => {
                        // Permitir solo números y dos decimales
                        const value = e.target.value;
                        if (/^\d*\.?\d{0,3}$/.test(value)) {
                          handleInputChange(row.id, "price", value);
                        }
                      }}
                    />
                  </td>

                  <td className="border-b border-gray-500">
                    <div className="flex justify-center items-cente">
                      <button
                        type="button"
                        onClick={handleToggleDiv}
                        className="px-2 m-1 border border-orange-800 bg-orange-900 text-orange-300 hover:border-orange-400 hover:bg-orange-700 hover:text-orange-200 rounded"
                      >
                        Mtl
                      </button>
                      <button
                        type="button"
                        onClick={() => removeRow(row.id)}
                        className="px-2 m-1 border border-red-800 bg-red-900 text-red-300 hover:border-red-400 hover:bg-red-700 hover:text-red-200 rounded"
                      >
                        <strong>X</strong>
                      </button>
                    </div>
                  </td>
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
                  Select the way in which the materials will be registered in
                  the project.
                </h5>
              </div>
              <div>
                <select
                  value={addItemsForm}
                  onChange={handleAddItemsForm}
                  className="mb-4 p-2 border border-gray-500 rounded bg-gray-800 text-white cursor-pointer"
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
                        Upload the materials concentrate. Only .xlsx files will
                        be accepted. FORMAT ...
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
                            Select
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : addItemsForm === "option3" ? (
                  <div className="">
                    <h5 className="text-sm pt-5 pb-3 text-gray-200">
                      Register the subassemblies. You may use a maximum of 255
                      characters within the description of each subassembly.
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
                            Delivery Date{" "}
                            <span className="text-red-500">*</span>
                          </th>
                          <th className="px-4 py-2 border border-gray-500">
                            Description
                          </th>
                          <th
                            className="px-4 py-2 border border-gray-500"
                            colSpan="2"
                          >
                            Price <span className="text-red-500">*</span>
                          </th>
                        </tr>
                      </thead>

                      <tbody className="bg-gray-800 shadow-lg" id="table-body">
                        {InTableSubass.map((rowSubass, index) => (
                          <tr
                            key={rowSubass.id}
                            className="hover:bg-pageSideMenuTextHover transition duration-200"
                          >
                            <td className="px-4 border-t border-r border-b border-gray-500">
                              {index + 1}
                            </td>
                            <td className="px-2 border border-gray-500">
                              <input
                                type="text"
                                name="identification_number"
                                className="w-full p-1 bg-transparent outline-none"
                                value={rowSubass.identification_number}
                                onChange={(e) =>
                                  handleInputChangeSubass(
                                    rowSubass.id,
                                    "identification_number",
                                    e.target.value
                                  )
                                }
                              />
                            </td>
                            <td className="px-2 border border-gray-500">
                              <input
                                type="date"
                                name="delivery_date"
                                className="w-full bg-transparent outline-none"
                                value={rowSubass.delivery_date}
                                onChange={(e) =>
                                  handleInputChangeSubass(
                                    rowSubass.id,
                                    "delivery_date",
                                    e.target.value
                                  )
                                }
                              />
                            </td>
                            <td className="px-2 border border-gray-500">
                              <textarea
                                name="description"
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

                            <td className="px-2 border-t border-b border-l border-gray-500">
                              <input
                                type="text" // Cambiado de "number" a "text"
                                name="price"
                                className="w-full bg-transparent outline-none"
                                value={rowSubass.price}
                                onChange={(e) => {
                                  // Permitir solo números con hasta dos decimales
                                  const value = e.target.value;
                                  if (/^\d*\.?\d{0,3}$/.test(value)) {
                                    handleInputChangeSubass(
                                      rowSubass.id,
                                      "price",
                                      value
                                    );
                                  }
                                }}
                              />
                            </td>
                            <td className="border-b border-gray-500">
                              <div className="flex">
                                <button
                                  type="button"
                                  onClick={handleToggleDivSubass}
                                  className="px-2 m-1 border border-orange-800 bg-orange-900 text-orange-300 hover:border-orange-400 hover:bg-orange-700 hover:text-orange-200 rounded"
                                >
                                  Mtl
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeRowSubass(rowSubass.id)}
                                  className="px-2 m-1 border border-red-800 bg-red-900 text-red-300 hover:border-red-400 hover:bg-red-700 hover:text-red-200 rounded"
                                >
                                  <strong>X</strong>
                                </button>
                              </div>
                            </td>
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
                              {/* SELECT FILE STYLE */}
                              <button
                                type="button"
                                onClick={handleFileClick}
                                className="text-sm px-3 mt-6 py-1 border border-purple-500 bg-purple-900 text-purple-300 hover:border-purple-400 hover:bg-purple-700 hover:text-purple-200 rounded"
                              >
                                Select
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <></>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-10 items-center">
          <button
            onClick={handleCreateProject}
            className="px-20 py-3 mx-1 bg-green-900 text-base text-green-300 bg-pageBackground border border-green-500 rounded hover:bg-green-700"
          >
            Save
          </button>
        </div>
      </div>

      {/* MODAL ERROR FORM WINDOW */}
      <Modal
        isOpen={isModalErrorProjectFieldsOpen}
        onClose={() => setIsModalErrorProjectFieldsOpen(false)}
        title="Required fields"
      >
        <p>Fill in all required fields in the project data section. </p>
      </Modal>

      <Modal
        isOpen={isModalErrorUserAdminFieldOpen}
        onClose={() => setIsModalErrorUserAdminFieldOpen(false)}
        title="Required fields"
      >
        <p>Please, Select at least one project manager.</p>
      </Modal>

      <Modal
        isOpen={isModalErrorUserOperFieldOpen}
        onClose={() => setIsModalErrorUserOperFieldOpen(false)}
        title="Required fields"
      >
        <p>
          Please, Select at least one personnel with reception authorization.
        </p>
      </Modal>

      <Modal
        isOpen={isModalErrorAssemblyFieldOpen}
        onClose={() => setIsModalErrorAssemblyFieldOpen(false)}
        title="No assemblies"
      >
        <p>
          Assembly data is needed to continue with the project registration.
        </p>
      </Modal>

      <Modal
        isOpen={isModalErrorSubassemblyFieldOpen}
        onClose={() => setIsModalErrorSubassemblyFieldOpen(false)}
        title="No subassemblies"
      >
        <p>Complete the data of the subassemblies to continue </p>
      </Modal>

      {/* MODAL SUCCESS FORM WINDOW */}
      <Modal
        isOpen={isModalSuccessProjectOpen}
        onClose={() => setIsModalSuccessProjectOpen(false)}
        title="Project registration successful"
      >
        <p>The project has been registered successfully.</p>
      </Modal>

      <Modal
        isOpen={isModalErrorProjectExistsOpen}
        onClose={() => setIsModalErrorProjectExistsOpen(false)}
        title="Project already exists"
      >
        <p>
          The project with the identification number already exists in the
          system.
        </p>
      </Modal>
    </div>
  );
};

export default ProjectsManagmentForm;
