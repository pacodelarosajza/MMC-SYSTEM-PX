import React, { useEffect, useState } from "react";
import axios from "axios";

const ProjectsManagmentFormTEST = () => {
  const apiIpAddress = import.meta.env.VITE_API_IP_ADDRESS;   

  // Initial states for the project and user-project relationship
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

  const handleCreateProject = async () => {
    try {
      // Post the new project
      const projectResponse = await axios.post(
        `${apiIpAddress}/api/postProject`,
        newProject
      );
      const projectId = projectResponse.data.id;

      // Ensure user selections are valid
      if (
        userSelections.length === 0 ||
        userSelections.some((selection) => !selection.value)
      ) {
        throw new Error("Please select at least one user for the project.");
      }
      if (
        userOperSelections.length === 0 ||
        userOperSelections.some((selection) => !selection.value)
      ) {
        throw new Error(
          "Please select at least one user with reception authorization."
        );
      }

      // Post each user-project relationship
      const userProjectPromises = userSelections.map((userSelection) =>
        axios.post(`${apiIpAddress}/api/user_assign_project`, {
          users_id: userSelection.value,
          project_id: projectId, // Use `project_id` as expected by the API
        })
      );
      const userOperProjectPromises = userOperSelections.map(
        (userOperSelection) =>
          axios.post(`${apiIpAddress}/api/user_assign_project`, {
            users_id: userOperSelection.value,
            project_id: projectId, // Use `project_id` as expected by the API
          })
      );
      await Promise.all([...userProjectPromises, ...userOperProjectPromises]);

      // Reset form state after successful submission
      setNewProject(initialProjectState);
      setUserSelections([{ id: Date.now(), value: "" }]);
      setUserOperSelections([{ id: Date.now(), value: "" }]);
      alert(`Project registration successful. Project ID: ${projectId}`);
    } catch (error) {
      console.error("Error creating project:", error);
      alert("Project registration failed: " + error.message);
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

  return (
    <>
      {/* Project Form */}
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
      </div>
      <div className="col-span-full py-5">
        <hr className="border border-1 border-gray-500" />
      </div>

      <div className="col-span-full pt-3">
        <div className="mb-5">
          <h2 className="text-xl text-gray-200 font-bold">
            Project Manager <span className="text-red-500">*</span>
          </h2>
        </div>
        <div>
          {userSelections.map((userSelection) => (
            <div key={userSelection.id} className="mb-2 flex items-center">
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
                className="ml-2 px-2 py-1 border border-red-500 bg-red-900 text-red-300 rounded"
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
      <div className="flex justify-end pt-10 items-center">
        <button
          onClick={handleCreateProject}
          className="px-12 py-2 mx-1 bg-green-900 text-sm text-green-300 border border-green-500 rounded hover:bg-green-700"
        >
          Save
        </button>
      </div>
    </>
  );
};

export default ProjectsManagmentFormTEST;