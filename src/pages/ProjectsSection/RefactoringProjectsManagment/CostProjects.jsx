import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSync } from "@fortawesome/free-solid-svg-icons";

const CostProjects = () => {
  const [items, setItems] = useState([]);
  const [totalStock, setTotalStock] = useState(0);
  const [projects, setProjects] = useState([]);
  const [projectItems, setProjectItems] = useState({});
  const apiIpAddress = import.meta.env.VITE_API_IP_ADDRESS;

  // Función para obtener ítems con stock
  const fetchItems = async () => {
    try {
      const response = await axios.get(`${apiIpAddress}/api/items-with-stock`);
      setItems(response.data);
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  };

  // Función para obtener los proyectos
  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${apiIpAddress}/api/getProjects`);
      setProjects(response.data);
      response.data.forEach((project) => fetchProjectItems(project.id));
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  // Función para obtener los ítems de un proyecto
  const fetchProjectItems = async (projectId) => {
    try {
      const response = await axios.get(
        `${apiIpAddress}/api/getItems/project/${projectId}`
      );
      setProjectItems((prev) => ({ ...prev, [projectId]: response.data }));
    } catch (error) {
      console.error(`Error fetching items for project ${projectId}:`, error);
    }
  };

  // Función para calcular el total del stock
  const calculateTotalStock = () => {
    const total = items.reduce((sum, item) => {
      const itemStock = item.stock_items.reduce((stockSum, stockItem) => {
        return stockSum + parseFloat(stockItem.stock.stock_quantity);
      }, 0);
      return sum + itemStock;
    }, 0);

    setTotalStock(total);
  };

  const calculateTotalValueSum = () => {
    return items.reduce((sum, item) => {
      const totalStockQuantity = item.stock_items.reduce(
        (stockSum, stockItem) => stockSum + parseFloat(stockItem.stock.stock_quantity),
        0
      );
      return sum + totalStockQuantity * parseFloat(item.price);
    }, 0);
  };

  useEffect(() => {
    fetchItems();
    fetchProjects();
  }, []);

  useEffect(() => {
    calculateTotalStock();
  }, [items]);

  const calculateTotalItemCost = (projectId) => {
    if (!projectItems[projectId]) return 0;
    return projectItems[projectId].reduce(
      (sum, item) => sum + parseFloat(item.price),
      0
    );
  };

  const reloadTable = () => {
    fetchItems();
    fetchProjects();
  };

  return (
    <div id="card" className="p-5 bg-gray-800 mt-10 rounded">
      <div className="flex justify-between items-center">
        <h2 className="pb-5 text-xl text-blue-400 font-bold">
          Active project costs
        </h2>
        <button
          onClick={reloadTable}
          className="p-1 my-4 mx-4 text-white rounded hover:bg-gray-700 transition duration-200"
          title="Refresh data"
        >
          <FontAwesomeIcon icon={faSync} color="gray" size="lg" />
        </button>
      </div>
      <table
        className="text-sm table-auto w-full text-lightWhiteLetter"
        id="projects-actions"
      >
        <thead>
          <tr className="w-full text-blue-400 text-left ">
            <th className="px-4 py-2 rounded-tl-lg">ID Project</th>
            <th className="px-4 py-2 border-x border-gray-500">
              Cost Material
            </th>
            <th className="px-4 py-2 border-x border-gray-500">
              Cost of materials purchased
            </th>
            <th className="px-4 py-2 border-tr border-gray-500">Difference</th>
          </tr>
        </thead>

        <tbody className="shadow-lg">
          {projects.map((project) => (
            <tr
              className="hover:bg-pageSideMenuTextHover transition duration-200"
              key={project.id}
            >
              <td className="px-4 py-1 border-t border-r border-b border-gray-500">
                {" "}
                {project.identification_number}
              </td>
              <td className="px-4 py-1 border-t border-r border-b border-gray-500">
                {project.cost_material}
              </td>
              <td className="px-4 py-1 border-t border-r border-b border-gray-500">
                {calculateTotalItemCost(project.id)}
              </td>
              <td className="px-4 py-1 border-t border-b border-gray-500">
                {project.cost_material - calculateTotalItemCost(project.id)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pt-2">
        <table
          className="text-sm table-auto w-full text-lightWhiteLetter"
          id="projects-actions"
        >
          <thead>
            <tr className="w-full text-left border border-gray-700">
              <th className="px-4 py-2 text-blue-400 rounded-tl-lg border border-gray-500">
                Total Stock
              </th>
              <td className="px-4 py-2 font-bold text-blue-400 rounded-tl-lg border border-gray-500">
                $ {calculateTotalValueSum().toFixed(2)} MXN
              </td>
            </tr>
          </thead>
        </table>
      </div>
    </div>
  );
};

export default CostProjects;
