import React, { useEffect, useState } from "react";
import axios from "axios";

const NewProjectForm = () => {
  const apiIpAddress = import.meta.env.VITE_API_IP_ADDRESS;

  const [stocks, setStocks] = useState([]);
  const [newStock, setNewStock] = useState({ item_id: "", quantity: "" });
  const [items, setItems] = useState([]);
  const [activeProjects, setActiveProjects] = useState([]);

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

  const [description, setDescription] = useState('');
  const maxChars = 255;

  const handleChange = (event) => {
    const value = event.target.value;
    if (value.length <= maxChars) {
      setDescription(value);
    }
  };

  return (
    <div className="px-4 py-5 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Add or Delete Projects</h1>
      <div className="bg-gray-900 p-5 rounded-lg shadow-lg mb-5">
        <h2 className="text-xl pt-5 font-semibold mb-3">Register a new project</h2>
        <div className="px-2 pb-5">
          <div className="flex gap-10 pt-5">
            <div>
              <label
                for="username"
                class="block text-sm font-medium leading-6 text-gray-200"
              >
                Identification Number
              </label>
              <input
                type="text"
                placeholder="ex. 211710"
                className="p-2 rounded bg-gray-700 text-white"
              />
            </div>
            <div>
              <label
                for="username"
                class="block text-sm font-medium leading-6 text-gray-200"
              >
                Cost Material
              </label>
              <div>
                $<span className="pr-2"></span>
                <input
                  type="text"
                  placeholder="ex. 30000"
                  className="p-2 rounded bg-gray-700 text-white"
                />
                <span className="pr-2"></span>USD
              </div>
            </div>
            <div>
              <label
                for="username"
                class="block text-sm font-medium leading-6 text-gray-200"
              >
                Delivery Date
              </label>
              <input
                type="date"
                className="p-2 rounded bg-gray-700 text-white"
              />
            </div>
          </div>
          <div class="col-span-full">
            <label
              for="about"
              class="block text-sm font-medium leading-6 text-gray-900"
            >
              About
            </label>
            <div className="mt-2">
              <textarea
                id="about"
                name="about"
                rows="3"
                placeholder="Write a short description of the project to quickly identify it. "
                className="block w-full rounded-md border-0 py-1.5 text-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 bg-gray-700 caret-white p-5"
                value={description}
        onChange={handleChange}
              ></textarea>
              <div className="m-1 text-right text-gray-400">
        {description.length}/{maxChars} characters
      </div>
            </div>
          </div>
          <div className="flex justify-end pt-5 items-center">
          <button className="px-4 py-2 mx-1 bg-green-900 text-sm text-green-300 bg-pageBackground border border-green-500 rounded hover:bg-green-700">
            Register project 
          </button>
        </div>
        </div>

               
      </div>
      <h2 className="text-xl pt-10 pb-5 font-semibold mb-3">
        Delete a project
      </h2>
      <div>
        <table className="text-base table-auto mb-20 text-lightWhiteLetter">
          <thead>
            <tr className="w-full bg-gray-700 text-left">
              <th className="px-8 py-2">Identification Number</th>
              <th className="px-4 py-2">Project Manager</th>
              <th className="px-4 py-2 text-center" colspan="2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {activeProjects.map((project) => (
              <tr
                key={project.id}
                className="hover:bg-pageSideMenuTextHover transition duration-200"
              >
                <td className="px-8 py-2">{project.identification_number}</td>
                <td className="px-4 py-2">Lorem ipsum dolor sit amet.</td>
                <td className="px-8 py-2">
                  <button className="px-2 py-1 text-gray-400 hover:bg-green-900 text-xs hover:text-green-300 bg-pageBackground hover:border hover:border-green-500 rounded">
                    Edit
                  </button>
                </td>
                <td className="px-8 py-2">
                  <button className="px-2 py-1 text-gray-400 hover:bg-red-900 text-xs hover:text-red-300 bg-pageBackground hover:border hover:border-red-500 rounded">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NewProjectForm;
