import React, { useEffect, useState } from "react";
import axios from "axios";

const ProjectsManagmentForm = () => {
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
  const [InTableSubass, setInTableSubass] = useState({});
  const [visibleSubassTables, setVisibleSubassTables] = useState({});

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

  const handleCreateProject = async (event) => {
    event.preventDefault();

    if (
      !newProject.identification_number ||
      !newProject.cost_material ||
      !newProject.delivery_date
    ) {
      alert("Fill in all required fields in the project data section.");
      return;
    }

    try {
      if (
        userSelections.length === 0 ||
        userSelections.some((selection) => !selection.value)
      ) {
        alert("Select at least one project manager.");
        return;
      }
      if (
        userOperSelections.length === 0 ||
        userOperSelections.some((selection) => !selection.value)
      ) {
        alert("Select at least one personnel with reception authorization.");
        return;
      }
      if (InTable.length === 0) {
        alert(
          "Assembly data is needed to continue with the project registration."
        );
        return;
      }

      const projectResponse = await axios.post(
        `${apiIpAddress}/api/postProject`,
        newProject
      );
      const projectId = projectResponse.data.id;

      const userProjectPromises = userSelections.map((userSelection) =>
        axios.post(`${apiIpAddress}/api/user_assign_project`, {
          users_id: userSelection.value,
          project_id: projectId,
        })
      );
      const userOperProjectPromises = userOperSelections.map(
        (userOperSelection) =>
          axios.post(`${apiIpAddress}/api/user_assign_project`, {
            users_id: userOperSelection.value,
            project_id: projectId,
          })
      );
      await Promise.all([...userProjectPromises, ...userOperProjectPromises]);

      const assemblyPromises = InTable.map((row) =>
        axios.post(`${apiIpAddress}/api/postAssembly`, {
          project_id: projectId,
          identification_number: row.identification_number,
          description: row.description, // || null,
          delivery_date: row.delivery_date,
          completed_date: null,
          price: row.price,
          currency: "MXN",
          completed: 0,
        })
      );
      const assemblyResponses = await Promise.all(assemblyPromises);
      const assemblyIds = assemblyResponses.map((response) => response.data.id);

      // Post each subassembly
      const subassemblyPromises = Object.keys(InTableSubass).flatMap((parentId) =>
        InTableSubass[parentId].map((rowSubass) =>
          axios.post(`${apiIpAddress}/api/postSubassembly`, {
            assembly_id: parentId,
            identification_number: rowSubass.identification_number,
            description: rowSubass.description, // || null,
            delivery_date: rowSubass.delivery_date,
            completed_date: null,
            price: rowSubass.price,
            currency: "MXN",
            completed: 0,
          })
        )
      );
      const subassemblyResponses = await Promise.all(subassemblyPromises);
      const subassemblyIds = subassemblyResponses.map(
        (response) => response.data.id
      );

      setNewProject(initialProjectState);
      setUserSelections([{ id: Date.now(), value: "" }]);
      setUserOperSelections([{ id: Date.now(), value: "" }]);
      setInTable([]);
      setVisibleSubassTables({});

      alert(`Project registration successful. Project ID: ${projectId}`);
      alert(
        `Assembly registration successful. Assembly IDs: ${assemblyIds.join(
          ", "
        )}`
      );
      alert(
        `Subassembly registration successful. Subassembly IDs: ${subassemblyIds.join(
          ", "
        )}`
      );
    } catch (error) {
      console.error("Error creating project:", error);
      alert("Project registration failed: " + error.message);
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

  const handleToggleDiv = (id) => {
    setVisibleSubassTables((prevState) => ({
      ...prevState,
      [id]: !prevState[id],
    }));
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
    setVisibleSubassTables((prevState) => {
      const newState = { ...prevState };
      delete newState[id];
      return newState;
    });
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

  const addRowInTableSubass = (parentId) => {
    const newRowSubass = {
      id: Date.now(),
      identification_number: "",
      description: "",
      delivery_date: "",
      price: "",
    };
    setInTableSubass((prevState) => ({
      ...prevState,
      [parentId]: [...(prevState[parentId] || []), newRowSubass],
    }));
  };

  const removeRowSubass = (parentId, id) => {
    setInTableSubass((prevState) => ({
      ...prevState,
      [parentId]: prevState[parentId].filter((rowSubass) => rowSubass.id !== id),
    }));
  };

  const handleInputChangeSubass = (parentId, id, field, value) => {
    setInTableSubass((prevState) => ({
      ...prevState,
      [parentId]: prevState[parentId].map((rowSubass) => {
        if (rowSubass.id === id) {
          return { ...rowSubass, [field]: value };
        }
        return rowSubass;
      }),
    }));
  };

  const [addItemsForm, setaddItemsForm] = useState("");
  const handleAddItemsForm = (event) => {
    setaddItemsForm(event.target.value);
  };

  return (
    <div>
      <div>
        <input
          type="text"
          name="identification_number"
          placeholder="ex. 211710"
          value={newProject.identification_number}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="cost_material"
          placeholder="ex. 30000"
          value={newProject.cost_material}
          onChange={handleChange}
          required
        />

        <input
          type="date"
          name="delivery_date"
          value={newProject.delivery_date}
          onChange={handleChange}
          required
        />

        <textarea
          id="description"
          name="description"
          rows="3"
          placeholder="Write a short description of the project to quickly identify it."
          value={newProject.description}
          onChange={handleChange}
        ></textarea>

        {userSelections.map((userSelection) => (
          <div key={userSelection.id}>
            <select
              name={`identification_number_${userSelection.id}`}
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
            >
              <strong>X</strong>
            </button>
          </div>
        ))}
        <button type="button" onClick={addUserSelection}>
          <strong>+</strong>
        </button>

        <div>
          {userOperSelections.map((userOperSelection) => (
            <div key={userOperSelection.id}>
              <select
                name={`identification_number_${userOperSelection.id}`}
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
                onClick={() => removeUserOperSelection(userOperSelection.id)}
              >
                <strong>X</strong>
              </button>
            </div>
          ))}
          <button type="button" onClick={addUserOperSelection}>
            <strong>+</strong>
          </button>
        </div>

        <div>
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>
                  Assembly ID <span>*</span>
                </th>

                <th>
                  Delivery Date <span>*</span>
                </th>
                <th>Description</th>
                <th>
                  Price <span>*</span>
                </th>
              </tr>
            </thead>
            <tbody id="table-body">
              {InTable.map((row, index) => (
                <tr key={row.id}>
                  <td>{index + 1}</td>
                  <td>
                    <input
                      type="text"
                      name="identification_number"
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

                  <td>
                    <input
                      type="date"
                      name="delivery_date"
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
                  <td>
                    <textarea
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
                  <td>
                    <input
                      type="text"
                      name="price"
                      value={row.price}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (/^\d*\.?\d{0,3}$/.test(value)) {
                          handleInputChange(row.id, "price", value);
                        }
                      }}
                    />
                  </td>

                  <td>
                    <div>
                      <button type="button" onClick={() => handleToggleDiv(row.id)}>
                        Mtl
                      </button>
                      <button type="button" onClick={() => removeRow(row.id)}>
                        <strong>X</strong>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div>
            <button onClick={addRowInTable}>Add row</button>
          </div>
          {Object.keys(visibleSubassTables).map((parentId) => (
            visibleSubassTables[parentId] && (
              <div key={parentId}>
                <div>
                  <table>
                    <thead>
                      <tr>
                        <th>No</th>
                        <th>Subassembly ID</th>
                        <th>
                          Delivery Date <span>*</span>
                        </th>
                        <th>Description</th>
                        <th colSpan="2">
                          Price <span>*</span>
                        </th>
                      </tr>
                    </thead>

                    <tbody id="table-body">
                      {(InTableSubass[parentId] || []).map((rowSubass, index) => (
                        <tr key={rowSubass.id}>
                          <td>{index + 1}</td>
                          <td>
                            <input
                              type="text"
                              name="identification_number"
                              value={rowSubass.identification_number}
                              onChange={(e) =>
                                handleInputChangeSubass(
                                  parentId,
                                  rowSubass.id,
                                  "identification_number",
                                  e.target.value
                                )
                              }
                            />
                          </td>
                          <td>
                            <input
                              type="date"
                              name="delivery_date"
                              value={rowSubass.delivery_date}
                              onChange={(e) =>
                                handleInputChangeSubass(
                                  parentId,
                                  rowSubass.id,
                                  "delivery_date",
                                  e.target.value
                                )
                              }
                            />
                          </td>
                          <td>
                            <textarea
                              name="description"
                              value={rowSubass.description}
                              onChange={(e) =>
                                handleInputChangeSubass(
                                  parentId,
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

                          <td>
                            <input
                              type="text"
                              name="price"
                              value={rowSubass.price}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (/^\d*\.?\d{0,3}$/.test(value)) {
                                  handleInputChangeSubass(
                                    parentId,
                                    rowSubass.id,
                                    "price",
                                    value
                                  );
                                }
                              }}
                            />
                          </td>
                          <td>
                            <div>
                              <button
                                type="button"
                                onClick={() => handleToggleDiv(parentId)}
                              >
                                Mtl
                              </button>
                              <button
                                type="button"
                                onClick={() => removeRowSubass(parentId, rowSubass.id)}
                              >
                                <strong>X</strong>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div>
                    <button onClick={() => addRowInTableSubass(parentId)}>Add row</button>
                  </div>
                </div>
              </div>
            )
          ))}
        </div>

        <button onClick={handleCreateProject}>Save</button>
      </div>
    </div>
  );
};

export default ProjectsManagmentForm;