import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const CostProject = ({ projectId }) => {
  const [items, setItems] = useState([]);
  const [project, setProject] = useState(null); // Change to single project
  const [projectItems, setProjectItems] = useState({});
  const [assemblies, setAssemblies] = useState([]); // Add state for assemblies
  const [assemblyMaterials, setAssemblyMaterials] = useState({}); // Add state for assembly materials
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

  // Función para obtener el proyecto
  const fetchProject = async () => {
    try {
      const response = await axios.get(`${apiIpAddress}/api/getProjects/id/${projectId}`);
      setProject(response.data);
      fetchProjectItems(projectId);
      fetchAssemblies(projectId); // Fetch assemblies for the project
    } catch (error) {
      console.error("Error fetching project:", error);
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

  // Función para obtener los ensambles de un proyecto
  const fetchAssemblies = async (projectId) => {
    try {
      const response = await axios.get(`${apiIpAddress}/api/assembly/project/${projectId}`);
      setAssemblies(response.data);
      response.data.forEach((assembly) => fetchAssemblyMaterials(projectId, assembly.id)); // Fetch materials for each assembly
    } catch (error) {
      console.error(`Error fetching assemblies for project ${projectId}:`, error);
    }
  };

  // Función para obtener los materiales de un ensamble
  const fetchAssemblyMaterials = async (projectId, assemblyId) => {
    try {
      const response = await axios.get(`${apiIpAddress}/api/getItems/project/assembly/${projectId}/${assemblyId}`);
      setAssemblyMaterials((prev) => ({ ...prev, [assemblyId]: response.data }));
    } catch (error) {
      console.error(`Error fetching materials for assembly ${assemblyId}:`, error);
    }
  };

  const calculateTotalValueSum = () => {
    return items.reduce((sum, item) => {
      const totalStockQuantity = item.stock_items.reduce(
        (stockSum, stockItem) => stockSum + parseFloat(stockItem.stock.stock_quantity),
        0
      );
      return sum + totalStockQuantity * parseFloat(item.price);
    }, 0).toFixed(2);
  };

  const calculateTotalAssemblyCost = () => {
    return assemblies.reduce((sum, assembly) => sum + parseFloat(assembly.price), 0).toFixed(2);
  };

  const calculateTotalMaterialCost = (assemblyId) => {
    if (!assemblyMaterials[assemblyId]) return 0;
    return assemblyMaterials[assemblyId].reduce(
      (sum, material) => sum + parseFloat(material.price),
      0
    ).toFixed(2);
  };

  const calculateTotalMaterialsPurchased = () => {
    return assemblies.reduce((sum, assembly) => sum + parseFloat(calculateTotalMaterialCost(assembly.id)), 0).toFixed(2);
  };

  const calculateTotalDifference = () => {
    return (calculateTotalAssemblyCost() - calculateTotalMaterialsPurchased()).toFixed(2);
  };

  const calculateTotalProjectDifference = () => {
    return (calculateTotalAssemblyCost() - parseFloat(project.cost_material)).toFixed(2);
  };

  useEffect(() => {
    fetchItems();
    fetchProject();
  }, [projectId]);

  const calculateTotalItemCost = (projectId) => {
    if (!projectItems[projectId]) return 0;
    return projectItems[projectId].reduce(
      (sum, item) => sum + parseFloat(item.price),
      0
    ).toFixed(2);
  };

  const formatNumber = (number) => {
    const formattedNumber = parseFloat(number).toFixed(2);
    return formattedNumber < 0 ? <span style={{ color: 'red' }}>${formattedNumber} MXN</span> : `$${formattedNumber} MXN`;
  };

  return (
    <div id="card" className="p-5 bg-gray-800  rounded">
      <div className="flex justify-between items-center">
        <h2 className="pb-5 text-xl text-blue-400 font-bold">
          Project costs
        </h2>
      </div>
      {project && (
        <table
          className="text-sm table-auto w-full text-lightWhiteLetter"
          id="projects-actions"
        >
          <thead>
            <tr className="w-full text-blue-400 text-left ">
              <th className="px-4 py-2 rounded-tl-lg">ID Assemblies</th>
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
            {assemblies.map((assembly) => (
              <tr key={assembly.id}>
                <td className="px-4 py-2 border border-gray-500">{assembly.identification_number}</td>
                <td className="px-4 py-2 border border-gray-500">{formatNumber(assembly.price)}</td>
                <td className="px-4 py-2 border border-gray-500">{formatNumber(calculateTotalMaterialCost(assembly.id))}</td>
                <td className="px-4 py-2 border border-gray-500">{formatNumber(parseFloat(assembly.price) - parseFloat(calculateTotalMaterialCost(assembly.id)))}</td>
              </tr>
            ))}
            <tr className="w-full text-blue-300 text-left ">
              <td className="px-4 py-2 border border-t-2  border-t-blue-400  border-gray-500 font-bold text-blue-400">Total</td>
              <td className="px-4 py-2 border border-t-2  border-t-green-400 border-gray-500 font-bold">{formatNumber(calculateTotalAssemblyCost())}</td>
              <td className="px-4 py-2 border border-t-2  border-t-blue-400 border-gray-500 font-bold">{formatNumber(calculateTotalMaterialsPurchased())}</td>
              <td className="px-4 py-2 border border-t-2 border-t-blue-400 border-gray-500 font-bold">{formatNumber(calculateTotalDifference())}</td>
            </tr>
            </tbody>
            <thead>
            <tr className="w-full text-blue-400 text-left ">
              <th className="px-4 py-2 rounded-tl-lg">ID Project</th>
              <th className="px-4 py-2 border-x border-gray-500">
                
              </th>
              <th className="px-4 py-2 border-x border-gray-500">
               
              </th>
              <th className="px-4 py-2 border-tr border-gray-500"></th>
            </tr>
          </thead>
          <tbody className="shadow-lg"> 
            <tr
              className="hover:bg-pageSideMenuTextHover transition duration-200"
              key={project.id}
            >
              <td className="px-4 py-1 border border-gray-500">
                {" "}
                # {project.identification_number}
              </td>
              <td className="px-4 py-1 border border-gray-500">
                {formatNumber(project.cost_material)}
              </td>
              <td className="px-4 py-1 border border-gray-500">
                {formatNumber(calculateTotalItemCost(project.id))}
              </td>
              <td className="px-4 py-1 border border-gray-500">
                {formatNumber(parseFloat(project.cost_material) - parseFloat(calculateTotalItemCost(project.id)))}
              </td>
            </tr>
            <tr className="w-full text-green-400 text-left ">
              <td className="px-4 py-2 border-r border-t-2  border-t-blue-400  border-gray-500 font-bold">Difference</td>
              <td className="px-4 py-2 border-t-2  border-t-green-400 border-gray-500 font-bold">{formatNumber(calculateTotalProjectDifference())}</td>
              <td className="px-4 py-2 border-r border-l border-t-2  border-t-blue-400 border-gray-500 font-bold"></td>
              <td className="px-4 py-2 border-l border-t-2 border-t-blue-400 border-gray-500 font-bold"></td>
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
};

export default CostProject;
