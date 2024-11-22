import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Modal from "../../../components/Modal";
import ModalAcept from "../../../components/ModalAcept";
import { FaSync, FaPlus, FaTimes, FaCheck } from "react-icons/fa";

const Update = ({ id }) => {
  const apiIpAddress = import.meta.env.VITE_API_IP_ADDRESS;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalNoChangesOpen, setIsModalNoChangesOpen] = useState(false);
  const [isModalSuccessOpen, setIsModalSuccessOpen] = useState(false);
  const [isModalUserRemovedOpen, setIsModalUserRemovedOpen] = useState(false);
  const [isModalUserAddedOpen, setIsModalUserAddedOpen] = useState(false); // New state for user added modal
  const [isModalConfirmSaveOpen, setIsModalConfirmSaveOpen] = useState(false); // New state for confirm save modal
  const [newProject, setNewProject] = useState({
    identification_number: "",
    delivery_date: "",
    completed: 0,
    cost_material: "",
    description: "",
  });
  const [originalProject, setOriginalProject] = useState({});
  const [charCount, setCharCount] = useState(0);
  const [admins, setAdmins] = useState([]);
  const [operators, setOperators] = useState([]);
  const [adminUserSelections, setAdminUserSelections] = useState([]);
  const [operUserSelections, setOperUserSelections] = useState([]);
  const [adminUsers, setAdminUsers] = useState([]);
  const [operUsers, setOperUsers] = useState([]);

  const fetchProjectData = useCallback(async () => {
    try {
      const response = await axios.get(
        `${apiIpAddress}/api/getProjects/id/${id}`
      );
      setNewProject(response.data);
      setOriginalProject(response.data);
      setCharCount(response.data.description.length);
    } catch (error) {
      console.error("Error fetching project data:", error);
    }
  }, [apiIpAddress, id]);

  const fetchAdmins = useCallback(async () => {
    try {
      const response = await axios.get(
        `${apiIpAddress}/api/projects/${id}/admins`
      );
      setAdmins(
        response.data.length === 0
          ? [{ "user.id": "N/A", "user.user_number": "No admins registered" }]
          : response.data
      );
    } catch (error) {
      console.error("Error fetching admins:", error);
      setAdmins([
        { "user.id": "N/A", "user.user_number": "No admins registered" },
      ]);
    }
  }, [apiIpAddress, id]);

  const fetchOperators = useCallback(async () => {
    try {
      const response = await axios.get(
        `${apiIpAddress}/api/projects/${id}/operators`
      );
      setOperators(
        response.data.length === 0
          ? [
              {
                "user.id": "N/A",
                "user.user_number": "No operators registered",
              },
            ]
          : response.data
      );
    } catch (error) {
      console.error("Error fetching operators:", error);
      setOperators([
        { "user.id": "N/A", "user.user_number": "No operators registered" },
      ]);
    }
  }, [apiIpAddress, id]);

  const fetchAdminUsers = useCallback(async () => {
    try {
      const response = await axios.get(`${apiIpAddress}/getUsersByUserType/1`);
      setAdminUsers(response.data);
    } catch (error) {
      console.error("Error fetching admin users:", error);
    }
  }, [apiIpAddress]);

  const fetchOperUsers = useCallback(async () => {
    try {
      const response = await axios.get(`${apiIpAddress}/getUsersByUserType/2`);
      setOperUsers(response.data);
    } catch (error) {
      console.error("Error fetching operational users:", error);
    }
  }, [apiIpAddress]);

  useEffect(() => {
    fetchProjectData();
    fetchAdmins();
    fetchOperators();
    fetchAdminUsers();
    fetchOperUsers();
  }, [
    fetchProjectData,
    fetchAdmins,
    fetchOperators,
    fetchAdminUsers,
    fetchOperUsers,
  ]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name === "description" && value.length <= 255) {
      setCharCount(value.length);
    }
    setNewProject((prevProject) => ({
      ...prevProject,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (JSON.stringify(newProject) === JSON.stringify(originalProject)) {
      setIsModalOpen(false); // Close the modal if no changes
      return;
    }
    try {
      await axios.patch(`${apiIpAddress}/api/patchProject/${id}`, newProject);
      setIsModalSuccessOpen(true);
      setIsModalOpen(false); // Close the modal
    } catch (error) {
      console.error("Error updating project:", error);
      setIsModalNoChangesOpen(true);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await axios.delete(`${apiIpAddress}/usuarios/${userId}/proyectos/${id}`);
      setAdmins((prevAdmins) => {
        const updatedAdmins = prevAdmins.filter((admin) => admin["user.id"] !== userId);
        return updatedAdmins.length === 0
          ? [{ "user.id": "N/A", "user.user_number": "No admins registered" }]
          : updatedAdmins;
      });
      setOperators((prevOperators) => {
        const updatedOperators = prevOperators.filter((operator) => operator["user.id"] !== userId);
        return updatedOperators.length === 0
          ? [{ "user.id": "N/A", "user.user_number": "No operators registered" }]
          : updatedOperators;
      });
      setIsModalSuccessOpen(true);
    } catch (error) {
      console.error("Error deleting user from project:", error);
    }
  };

  const handleAdminUserChange = (id, value) => {
    setAdminUserSelections(
      adminUserSelections.map((selection) =>
        selection.id === id ? { ...selection, value } : selection
      )
    );
  };

  const handleOperUserChange = (id, value) => {
    setOperUserSelections(
      operUserSelections.map((selection) =>
        selection.id === id ? { ...selection, value } : selection
      )
    );
  };

  const addAdminUserSelection = () => {
    setAdminUserSelections([
      ...adminUserSelections,
      { id: Date.now(), value: "" },
    ]);
  };

  const removeAdminUserSelection = (id) => {
    setAdminUserSelections(
      adminUserSelections.filter((selection) => selection.id !== id)
    );
  };

  const addOperUserSelection = () => {
    setOperUserSelections([
      ...operUserSelections,
      { id: Date.now(), value: "" },
    ]);
  };

  const removeOperUserSelection = (id) => {
    setOperUserSelections(
      operUserSelections.filter((selection) => selection.id !== id)
    );
  };

  const handleAddAdminUser = async (selection) => {
    try {
      await axios.post(`${apiIpAddress}/api/user_assign_project`, {
        users_id: selection.value,
        project_id: id,
      });
      setAdminUserSelections((prevSelections) =>
        prevSelections.filter((sel) => sel.id !== selection.id)
      ); // Remove the selection
      setIsModalUserAddedOpen(true); // Show user added modal
    } catch (error) {
      console.error("Error adding admin user to project:", error);
    }
  };

  const handleAddOperUser = async (selection) => {
    try {
      await axios.post(`${apiIpAddress}/api/user_assign_project`, {
        users_id: selection.value,
        project_id: id,
      });
      setOperUserSelections((prevSelections) =>
        prevSelections.filter((sel) => sel.id !== selection.id)
      ); // Remove the selection
      setIsModalUserAddedOpen(true); // Show user added modal
    } catch (error) {
      console.error("Error adding operational user to project:", error);
    }
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const reloadAdmins = async () => {
    await fetchAdmins();
  };

  const reloadOperators = async () => {
    await fetchOperators();
  };

  const handleSave = () => {
    setIsModalConfirmSaveOpen(true);
  };

  const handleConfirmSave = async () => {
    setIsModalConfirmSaveOpen(false);
    await handleSubmit();
  };

  return (
    <>
      <div>
        <button
          onClick={openModal}
          className="w-15 px-2 py-1 font-medium hover:bg-blue-600 text-sm bg-pageBackground rounded"
          >
          Edit
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed z-10 inset-0 flex items-center justify-center bg-black bg-opacity-60 transition-opacity duration-300">
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-2xl transform scale-100 hover:scale-105 transition-transform duration-200 w-full max-w-2xl">
            <div className="p-5 flex flex-col justify-center items-center">
              <h2 className="text-3xl font-bold mb-6 text-blue-500">
                Update Project
              </h2>

              <form
                onSubmit={(e) => e.preventDefault()} // Prevent form submission from reloading the page
                className="w-full max-h-96 overflow-y-auto p-5 scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-blue-200"
              >
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="col-span-1">
                    <label
                      htmlFor="identification_number"
                      className="pb-1 block text-lg font-medium text-gray-400"
                    >
                      Identification Number
                    </label>
                    <input
                      type="text"
                      name="identification_number"
                      id="identification_number"
                      placeholder="ex. 155342201001"
                      className="w-full p-2 rounded bg-gray-100 dark:bg-gray-700 dark:text-white text-gray-800 focus:ring-2 focus:ring-blue-400 shadow-inner transition-all"
                      value={newProject.identification_number}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-span-1">
                    <label
                      htmlFor="cost_material"
                      className="pb-1 block text-lg font-medium text-gray-400"
                    >
                      Cost Material
                    </label>
                    <div className="flex items-center text-gray-400">
                      <span className="mr-2">$</span>
                      <input
                        type="text"
                        name="cost_material"
                        id="cost_material"
                        placeholder="ex. 3000"
                        className="w-full p-2 rounded bg-gray-100 dark:bg-gray-700 dark:text-white text-gray-800 focus:ring-2 focus:ring-blue-400 shadow-inner transition-all"
                        value={newProject.cost_material}
                        onChange={handleChange}
                        required
                      />
                      <span className="ml-2">MXN</span>
                    </div>
                  </div>
                  <div className="col-span-1">
                    <label
                      htmlFor="delivery_date"
                      className="pb-1 block text-lg font-medium text-gray-400"
                    >
                      Delivery Date
                    </label>
                    <input
                      type="date"
                      name="delivery_date"
                      id="delivery_date"
                      className="w-full p-2 rounded bg-blue-100 dark:bg-gray-700 dark:text-white text-gray-800 focus:ring-2 focus:ring-blue-400 shadow-inner transition-all"
                      value={newProject.delivery_date}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <label
                      htmlFor="description"
                      className="pb-1 block text-lg font-medium text-gray-400"
                    >
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows="3"
                      placeholder="Write a short description of the project to quickly identify it."
                      className="w-full block rounded-md p-3 text-gray-800 bg-gray-100 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-400 shadow-inner transition-all"
                      value={newProject.description}
                      onChange={handleChange}
                      maxLength="255"
                    ></textarea>
                    <div className="pl-5 pt-1 text-gray-400">
                      Characters {charCount}/255
                    </div>
                  </div>
                </div>
                <div className="pt-10 flex items-center justify-between">
                  <label className="pb-1 block text-lg font-medium text-gray-400">
                    Responsible
                  </label>
                  <button
                    onClick={reloadAdmins}
                    className="p-2 m-1 text-white rounded hover:bg-gray-700 transition duration-200"
                  >
                    <FaSync color="gray" size={15} />
                  </button>
                </div>
                <div
                  id="responsible-card"
                  className="min-w-full bg-white dark:bg-gray-800"
                >
                  <div className="bg-gray-700 rounded p-3 grid gap-2 text-lg">
                    {admins.map((admin) => (
                      <div
                        key={admin["user.id"]}
                        className="flex justify-between items-center"
                      >
                        <div
                          className={`${
                            admin["user.user_number"] === "No admins registered"
                              ? "text-gray-400"
                              : ""
                          }`}
                        >
                          {admin["user.user_number"]}
                        </div>
                        {admin["user.user_number"] !==
                          "No admins registered" && (
                          <button
                            onClick={() => handleDeleteUser(admin["user.id"])}
                            className="ml-2 w-15 p-2 font-medium text-sm hover:bg-red-600 rounded"
                            >
                            <FaTimes />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="col-span-full pt-3">
                  {adminUserSelections.map((selection) => (
                    <div key={selection.id} className="mb-2 flex items-center">
                      <select
                        name={`admin_user_${selection.id}`}
                        className="p-2 rounded bg-gray-100 dark:bg-gray-700 dark:text-white cursor-pointer w-3/4"
                        value={selection.value}
                        onChange={(e) =>
                          handleAdminUserChange(selection.id, e.target.value)
                        }
                        required
                      >
                        <option value="" disabled>
                          Select
                        </option>
                        {adminUsers.map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.user_number}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => removeAdminUserSelection(selection.id)}
                        className="ml-2 w-15 p-2 font-medium hover:bg-red-500 text-sm bg-red-600 rounded"
                        >
                        <FaTimes />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddAdminUser(selection)}
                        className="ml-2 w-15 p-2 font-medium hover:bg-green-500 text-sm bg-green-600 rounded"
                      >
                        <FaCheck />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addAdminUserSelection}
                    className="ml-2 w-15 p-2 font-medium hover:bg-blue-500 text-sm bg-blue-600 rounded"
                    >
                    <FaPlus />
                  </button>
                </div>
                <hr className="my-8 border-gray-300 dark:border-gray-600" />
                <div className="flex items-center justify-between">
                  <label className="pb-1 block text-lg font-medium text-gray-400">
                    Operational Users
                  </label>
                  <button
                    onClick={reloadOperators}
                    className="p-2 m-1 text-white rounded hover:bg-gray-700 transition duration-200"
          >
            <FaSync color="gray" size={15} />
                  </button>
                </div>
                <div
                  id="operational-card"
                  className="min-w-full bg-white dark:bg-gray-800"
                >
                  <div className="bg-gray-700 rounded p-3 grid gap-2 text-lg">
                    {operators.map((operator) => (
                      <div
                        key={operator["user.id"]}
                        className="flex justify-between items-center"
                      >
                        <div
                          className={`${
                            operator["user.user_number"] ===
                            "No operators registered"
                              ? "text-gray-400"
                              : ""
                          }`}
                        >
                          {operator["user.user_number"]}
                        </div>
                        {operator["user.user_number"] !==
                          "No operators registered" && (
                          <button
                            onClick={() =>
                              handleDeleteUser(operator["user.id"])
                            }
                            className="ml-2 w-15 p-2 font-medium text-sm hover:bg-red-600 rounded"
                        >
                        <FaTimes />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="col-span-full pt-3">
                  {operUserSelections.map((selection) => (
                    <div key={selection.id} className="mb-2 flex items-center">
                      <select
                        name={`oper_user_${selection.id}`}
                        className="p-2 rounded bg-gray-100 dark:bg-gray-700 dark:text-white cursor-pointer w-3/4"
                        value={selection.value}
                        onChange={(e) =>
                          handleOperUserChange(selection.id, e.target.value)
                        }
                        required
                      >
                        <option value="" disabled>
                          Select
                        </option>
                        {operUsers.map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.user_number}
                          </option>
                        ))}
                      </select>
                      
                      <button
                        type="button"
                        onClick={() => removeAdminUserSelection(selection.id)}
                        className="ml-2 w-15 p-2 font-medium hover:bg-red-500 text-sm bg-red-600 rounded"
                        >
                        <FaTimes />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddOperUser(selection)}
                        className="ml-2 w-15 p-2 font-medium hover:bg-green-500 text-sm bg-green-600 rounded"
                      >
                        <FaCheck />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addOperUserSelection}
                    className="ml-2 w-15 p-2 font-medium hover:bg-blue-500 text-sm bg-blue-600 rounded"
                    >
                    <FaPlus />  
                  </button>
                </div>
                <div className="flex justify-end pt-10 items-center">
                  <button
                    type="button"
                    onClick={handleSave}
                    className="w-32 px-4 py-2 font-medium hover:bg-blue-600 bg-pageBackground rounded"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <ModalAcept
        isOpen={isModalConfirmSaveOpen}
        onClose={() => setIsModalConfirmSaveOpen(false)}
        onContinue={handleConfirmSave}
        title="Confirm Save"
      >
        <p>Are you sure you want to save the changes to this project?</p>
      </ModalAcept>

      <Modal
        isOpen={isModalSuccessOpen}
        onClose={() => setIsModalSuccessOpen(false)}
        title="Success"
      >
        <p>The project has been updated successfully.</p>
      </Modal>

      <Modal
        isOpen={isModalUserRemovedOpen}
        onClose={() => setIsModalUserRemovedOpen(false)}
        title="User Removed"
      >
        <p>The user has been removed successfully.</p>
      </Modal>

      <Modal
        isOpen={isModalUserAddedOpen} // New modal for user added
        onClose={() => setIsModalUserAddedOpen(false)}
        title="User Added"
      >
        <p>Reload the section to see the changes.</p>
      </Modal>
    </>
  );
};

export default Update;
