import React, { useState, useEffect } from "react";
import axios from "axios";
import Modal from "../../../components/Modal";
import ModalAcept from "../../../components/ModalAcept";

function Create() {
  const apiIpAddress = import.meta.env.VITE_API_IP_ADDRESS;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalSuccessOpen, setIsModalSuccessOpen] = useState(false);
  const [isModalErrorOpen, setIsModalErrorOpen] = useState(false);
  const [isModalCancelOpen, setIsModalCancelOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    identification_number: "",
    delivery_date: "",
    completed: 0,
    cost_material: "",
    description: "",
  });
  const [adminUsers, setAdminUsers] = useState([]);
  const [operUsers, setOperUsers] = useState([]);
  const [adminUserSelections, setAdminUserSelections] = useState([]);
  const [operUserSelections, setOperUserSelections] = useState([]);
  const [charCount, setCharCount] = useState(0);

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

  useEffect(() => {
    const fetchProjectUsers = async (projectId) => {
      try {
        const response = await axios.get(
          `${apiIpAddress}/api/projects/${projectId}/users`
        );
        const users = response.data;
        const adminSelections = users
          .filter((user) => user.type === 1)
          .map((user) => ({ id: user.id, value: user.id }));
        const operSelections = users
          .filter((user) => user.type === 2)
          .map((user) => ({ id: user.id, value: user.id }));
        setAdminUserSelections(adminSelections);
        setOperUserSelections(operSelections);
      } catch (error) {
        console.error("Error fetching project users:", error);
      }
    };

    if (isModalOpen) {
      const projectId = newProject.id; // Assuming newProject has an id field
      if (projectId) {
        fetchProjectUsers(projectId);
      }
    }
  }, [isModalOpen, apiIpAddress, newProject.id]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name === "identification_number" && !/^\d*$/.test(value)) {
      return;
    }
    if (name === "description" && value.length <= 255) {
      setCharCount(value.length);
    }
    setNewProject((prevProject) => ({
      ...prevProject,
      [name]: value,
    }));
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const projectResponse = await axios.post(
        `${apiIpAddress}/api/postProject`,
        newProject
      );
      const projectId = projectResponse.data.id;
      const userProjectPromises = [
        ...adminUserSelections.map((selection) =>
          axios.post(`${apiIpAddress}/api/user_assign_project`, {
            users_id: selection.value,
            project_id: projectId,
          })
        ),
        ...operUserSelections.map((selection) =>
          axios.post(`${apiIpAddress}/api/user_assign_project`, {
            users_id: selection.value,
            project_id: projectId,
          })
        ),
      ];
      await Promise.all(userProjectPromises);
      setIsModalSuccessOpen(true);
      setNewProject({
        identification_number: "",
        delivery_date: "",
        completed: 0,
        cost_material: "",
        description: "",
      });
      setAdminUserSelections([]);
      setOperUserSelections([]);
      setCharCount(0);
      closeModal();
    } catch (error) {
      console.error("Error creating project:", error);
      setIsModalErrorOpen(true);
    }
  };

  const handleCancel = () => {
    setIsModalCancelOpen(true);
  };

  const resetForm = () => {
    setNewProject({
      identification_number: "",
      delivery_date: "",
      completed: 0,
      cost_material: "",
      description: "",
    });
    setAdminUserSelections([]);
    setOperUserSelections([]);
    setCharCount(0);
  };

  const confirmCancel = () => {
    setIsModalCancelOpen(false);
    resetForm();
    closeModal();
  };

  return (
    <>
      <div>
        <button
          onClick={openModal}
          className="bg-blue-900 bg-opacity-75 text-gray-100 font-semibold py-2 px-20 rounded transition duration-300 ease-in-out transform hover:bg-blue-700 hover:text-white hover:scale-105 shadow-lg border-2 border-blue-700 hover:shadow-xl"
        >
          Create new project
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed z-10 inset-0 flex items-center justify-center bg-black bg-opacity-60 transition-opacity duration-300">
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-2xl transform scale-100 hover:scale-105 transition-transform duration-200 w-full max-w-2xl">
            <div className="p-5 flex flex-col justify-center items-center">
              <h2 className="text-3xl font-bold mb-6 text-blue-600">
                New Project
              </h2>

              <form
                onSubmit={handleSubmit}
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
                      maxLength="19"
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
                      className="w-full p-2 rounded bg-gray-100 dark:bg-gray-700 dark:text-white text-gray-800 focus:ring-2 focus:ring-blue-400 shadow-inner transition-all"
                      value={newProject.delivery_date}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <div className="flex items-center">
                      <label
                        htmlFor="description"
                        className="pb-1 block text-lg font-medium text-gray-400"
                      >
                        Description{" "}
                      </label>
                      <span className="text-sm text-gray-400 px-1">
                        (Non-mandatory)
                      </span>
                    </div>
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
                <div className="col-span-full pt-3">
                  <label className="pb-1 block text-lg font-medium text-gray-400">
                    Responsible
                  </label>
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
                        className="ml-2 px-2  border border-red-500 bg-red-900 text-red-300 rounded hover:border-red-400 hover:bg-red-700 hover:text-red-200"
                      >
                        <strong>x</strong>
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addAdminUserSelection}
                    className="px-2 border border-blue-500 bg-blue-900 text-blue-300 rounded"
                  >
                    <strong>+</strong>
                  </button>
                </div>
                <hr className="my-4 border-gray-300 dark:border-gray-600" />
                  <div className="col-span-full pt-3">
                    <label className="pb-1 block text-lg font-medium text-gray-400">Operational Users</label>
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
                          onClick={() => removeOperUserSelection(selection.id)}
                          className="ml-2 px-2 border border-red-500 bg-red-900 text-red-300 rounded hover:border-red-400 hover:bg-red-700 hover:text-red-200"
                        >
                          <strong>x</strong>
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addOperUserSelection}
                      className="px-2 border border-blue-500 bg-blue-900 text-blue-300 rounded"
                    >
                      <strong>+</strong>
                    </button>
                  </div>
                <div className="flex justify-end pt-10 items-center">
                  <button
                    type="submit"
                    className="px-10 py-1 text-gray-400 text-lg bg-pageBackground border border-pageBackground hover:border hover:bg-blue-900 hover:border-blue-500 hover:text-blue-300 rounded"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="ml-4 px-10 py-1 text-gray-400 text-lg bg-pageBackground border border-pageBackground hover:border hover:bg-red-900 hover:border-red-500 hover:text-red-300 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <Modal
        isOpen={isModalSuccessOpen}
        onClose={() => setIsModalSuccessOpen(false)}
        title="Success"
      >
        <p>The project has been registered successfully.</p>
      </Modal>

      <Modal
        isOpen={isModalErrorOpen}
        onClose={() => setIsModalErrorOpen(false)}
        title="Error"
      >
        <p>Project registration failed. Please try again.</p>
      </Modal>

      <ModalAcept
        isOpen={isModalCancelOpen}
        onClose={() => setIsModalCancelOpen(false)}
        onContinue={confirmCancel}
        title="Cancel Registration"
      >
        <p>Are you sure you want to cancel the registration?</p>
      </ModalAcept>
    </>
  );
}

export default Create;
