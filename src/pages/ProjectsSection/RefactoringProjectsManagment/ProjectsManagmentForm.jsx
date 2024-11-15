import React, { useEffect, useState, useRef } from "react";
import axios from "axios";

const ProjectsManagementForm = () => {
  const apiIpAddress = import.meta.env.VITE_API_IP_ADDRESS;
  const initialProjectState = {
    identification_number: "",
    delivery_date: "",
    completed: 0,
    cost_material: "",
    description: "",
  };
  const [newProject, setNewProject] = useState(initialProjectState);
  const [adminUsers, setAdminUsers] = useState([]);
  const [userSelections, setUserSelections] = useState([
    { id: Date.now(), value: "" },
  ]);
  const [operUsers, setOperUsers] = useState([]);
  const [userOperSelections, setUserOperSelections] = useState([
    { id: Date.now(), value: "" },
  ]);
  const [InTable, setInTable] = useState([]);
  const [InTableSubass, setInTableSubass] = useState([]);

  const [showCard, setShowCard] = useState(false);

  const [isDivVisible, setIsDivVisible] = useState(false);
  const [isDivVisibleSubass, setIsDivVisibleSubass] = useState(false);

  const [addItemsForm, setaddItemsForm] = useState("");

  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [selectedAssemblyId, setSelectedAssemblyId] = useState(null);

  useEffect(() => {
    const fetchAdminUsers = async () => {
      try {
        const response = await axios.get(
          `${apiIpAddress}/getUsersByUserType/1`
        );
        setAdminUsers(response.data);
      } catch (error) {
        console.error("Error fetching admin users:", error);
      }
    };
    const fetchOperUsers = async () => {
      try {
        const response = await axios.get(
          `${apiIpAddress}/getUsersByUserType/2`
        );
        setOperUsers(response.data);
      } catch (error) {
        console.error("Error fetching operational users:", error);
      }
    };
    fetchAdminUsers();
    fetchOperUsers();
  }, [apiIpAddress]);
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
  const handleCreateProject = async (event) => {
    event.preventDefault();
    try {
      const projectExists = await checkIfProjectExists(
        newProject.identification_number
      );
      if (projectExists) {
        alert(
          "The project with the identification number already exists in the system."
        );
        return;
      }
      if (
        !newProject.identification_number ||
        !newProject.cost_material ||
        !newProject.delivery_date
      ) {
        alert("Fill in all required fields in the project data section.");
        return;
      }
      if (
        userSelections.length === 0 ||
        userSelections.some((selection) => !selection.value)
      ) {
        alert("Please, select at least one project manager.");
        return;
      }
      if (
        userOperSelections.length === 0 ||
        userOperSelections.some((selection) => !selection.value)
      ) {
        alert(
          "Please, select at least one personnel with reception authorization."
        );
        return;
      }
      if (InTable.length === 0) {
        alert(
          "Assembly data is needed to continue with the project registration."
        );
        return;
      }
      /*if (InTableSubass.length === 0) {
        alert("Complete the data of the subassemblies to continue.");
        return;
      }*/
      const projectResponse = await axios.post(
        `${apiIpAddress}/api/postProject`,
        newProject
      );
      const projectId = projectResponse.data.id;
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
      const assemblyResponses = await Promise.all(assemblyPromises);
      const subassemblyPromises = InTableSubass.map((rowSubass) =>
        axios.post(`${apiIpAddress}/api/postSubassembly`, {
          assembly_id: rowSubass.assembly_id,
          identification_number: rowSubass.identification_number,
          description: rowSubass.description,
          delivery_date: rowSubass.delivery_date,
          completed_date: null,
          price: rowSubass.price,
          currency: "MXN",
          completed: 0,
        })
      );
      await Promise.all(subassemblyPromises);
      setNewProject(initialProjectState);
      setUserSelections([{ id: Date.now(), value: "" }]);
      setUserOperSelections([{ id: Date.now(), value: "" }]);
      setInTable([]);
      setInTableSubass([]);
      alert("The project has been registered successfully.");
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
  const handleChange = (event) => {
    const { name, value } = event.target;
    setNewProject((prevProject) => ({
      ...prevProject,
      [name]: value,
    }));
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
  const handleButtonClick = () => {
    setShowCard(!showCard);
  };
  const handleToggleDiv = () => {
    setIsDivVisible(!isDivVisible);
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
  const handleToggleDivSubass = () => {
    setIsDivVisibleSubass(!isDivVisibleSubass);
  };
  const addRowInTableSubass = () => {
    const newRowSubass = {
      id: Date.now(),
      assembly_id: selectedAssemblyId,
      identification_number: "",
      description: "",
      delivery_date: "",
      price: "",
    };
    setInTableSubass([...InTableSubass, newRowSubass]);
  };
  const removeRowSubass = (id) => {
    setInTableSubass(InTableSubass.filter((rowSubass) => rowSubass.id !== id));
  };
  const handleInputChangeSubass = (id, field, value) => {
    const updatedTable = InTableSubass.map((rowSubass) => {
      if (rowSubass.id === id) {
        return { ...rowSubass, [field]: value };
      }
      return row;
    });
    setInTableSubass(updatedTable);
  };
  const handleAddItemsForm = (event) => {
    setaddItemsForm(event.target.value);
  };
  const handleFileClick = () => {
    fileInputRef.current.click();
  };
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFileName(file.name);
    }
  };
  const handleDragOver = (event) => {
    event.preventDefault();
    setDragActive(true);
  };
  const handleDragLeave = () => {
    setDragActive(false);
  };
  const handleDrop = (event) => {
    event.preventDefault();
    setDragActive(false);
    const file = event.dataTransfer.files[0];
    if (file) {
      setFileName(file.name);
    }
  };
  const handleRemoveFile = () => {
    setFileName("");
    fileInputRef.current.value = null;
  };
  const handleAddSubassembly = (assemblyId) => {
    setSelectedAssemblyId(assemblyId);
    setIsDivVisibleSubass(true);
  };
  return (
    <div>
      <div className="px-2 pb-5">
        <div className="flex gap-10 pt-5">
          <input
            type="text"
            name="identification_number"
            placeholder="ex. 211710"
            className="p-2 rounded bg-gray-700 text-white"
            value={newProject.identification_number}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="cost_material"
            placeholder="ex. 30000"
            className="p-2 rounded bg-gray-700 text-white mx-2"
            value={newProject.cost_material}
            onChange={handleChange}
            required
          />
          <input
            type="date"
            name="delivery_date"
            className="p-2 rounded bg-gray-700 text-white"
            value={newProject.delivery_date}
            onChange={handleChange}
            required
          />
        </div>
        <div className="col-span-full pt-3">
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
        <div className="flex col-span-full pt-3">
          <div>
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
          <div className="col-span-full">
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
        <div className="col-span-full pt-3">
          {/* TABLA DE ENSAMBLES */}
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
                      type="text"
                      name="price"
                      className="w-full bg-transparent outline-none"
                      value={row.price}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (/^\d*\.?\d{0,3}$/.test(value)) {
                          handleInputChange(row.id, "price", value);
                        }
                      }}
                    />
                  </td>
                  <td className="border-b border-gray-500">
                    <div className="flex justify-center items-cente">
                      {/* BOTON DE AÑADIR SUBENSAMBLES AL ENSAMBLE */}
                      <button
                        type="button"
                        onClick={() => handleAddSubassembly(row.id)}
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
                <select
                  value={addItemsForm}
                  onChange={handleAddItemsForm}
                  className="mb-4 p-2 border border-gray-500 rounded bg-gray-800 text-white cursor-pointer"
                >
                  <option value="" disabled>
                    Select an option
                  </option>
                  <option value="option1">
                    Discharge materials without the use of subassemblies.
                  </option>
                  <option value="option2">
                    Discharge materials by means of subassemblies.
                  </option>
                </select>
                {addItemsForm === "option1" ? (
                  <div className="px-10">
                    <div className="py-5">
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
                ) : addItemsForm === "option2" ? (
                  <div className="">
                    {/* TABLA DE SUBENSAMBLES */}
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
                                type="text"
                                name="price"
                                className="w-full bg-transparent outline-none"
                                value={rowSubass.price}
                                onChange={(e) => {
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
                              {/* BOTON DE AÑADIR MATERIALES AL SUBENSAMBLE */}
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
          <button onClick={handleCreateProject}>Save</button>
        </div>
      </div>
    </div>
  );
};

export default ProjectsManagementForm;
