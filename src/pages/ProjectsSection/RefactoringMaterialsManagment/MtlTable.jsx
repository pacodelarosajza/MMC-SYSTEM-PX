import React, { useState, useEffect } from "react";
import SearchStock from "./SearchStock";

const MtlTable = ({ id }) => {
  const [items, setItems] = useState([]);
  const [assemblies, setAssemblies] = useState({});
  const [subassemblies, setSubassemblies] = useState({});
  const [projectId, setProjectId] = useState("");
  const [showSearchStock, setShowSearchStock] = useState(false);
  const apiIpAddress = import.meta.env.VITE_API_IP_ADDRESS;

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch(
          `${apiIpAddress}/api/getItems/project/${id}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch items");
        }
        const result = await response.json();
        setItems(result);
      } catch (error) {
        console.error(error);
      }
    };

    fetchItems();
  }, [id, apiIpAddress]);

  useEffect(() => {
    const fetchProjectId = async () => {
      try {
        const response = await fetch(
          `${apiIpAddress}/api/getProjects/id/${id}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch project ID");
        }
        const result = await response.json();
        setProjectId(result.identification_number);
      } catch (error) {
        console.error(error);
      }
    };

    fetchProjectId();
  }, [id, apiIpAddress]);

  useEffect(() => {
    const fetchAssemblyName = async (assemblyId) => {
      try {
        const response = await fetch(
          `${apiIpAddress}/api/getAssambly/${assemblyId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch assembly name");
        }
        const result = await response.json();
        setAssemblies((prev) => ({
          ...prev,
          [assemblyId]: result.identification_number,
        }));
      } catch (error) {
        console.error(error);
      }
    };

    const fetchSubassemblyName = async (subassemblyId) => {
      try {
        const response = await fetch(
          `${apiIpAddress}/api/subassembly/${subassemblyId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch subassembly name");
        }
        const result = await response.json();
        setSubassemblies((prev) => ({
          ...prev,
          [subassemblyId]: result.identification_number,
        }));
      } catch (error) {
        console.error(error);
      }
    };

    items.forEach((item) => {
      if (item.assembly_id && !assemblies[item.assembly_id]) {
        fetchAssemblyName(item.assembly_id);
      }
      if (item.subassembly_id && !subassemblies[item.subassembly_id]) {
        fetchSubassemblyName(item.subassembly_id);
      }
    });
  }, [items, assemblies, subassemblies, apiIpAddress]);

  const handleClose = () => {
    window.location.reload();
  };

  if (showSearchStock) {
    return <SearchStock id={id} />;
  }

  return (
    <div className="p-5 submit-materials-container fixed z-10 inset-0 flex items-center justify-center bg-black bg-opacity-60 transition-opacity duration-300">
      <div className="py-6 px-6 bg-white dark:bg-gray-800 rounded-lg shadow-2xl transform scale-100 transition-transform duration-200 w-full h-full overflow-y-auto scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-blue-200">
        <div className="px-2 flex flex-col">
          <h1 className="text-lg font-extrabold text-gray-500">
            Materials management
          </h1>
          <h1 className="text-xl font-bold mb-4 text-blue-500">
            4. Materials Table
          </h1>
          <div className="flex justify-center items-center">
            <h1 className="text-3xl font-semibold text-gray-500">
              Project. {projectId}
            </h1>
          </div>
          <table className="w-full">
            <tbody>
              <tr>
           l<td
                  colSpan="7"
                  className="text-right text-lg text-gray-300 font-medium p-1"
                >
                  Total UNIT:
                  $ {items
                    .reduce((total, item) => total + parseFloat(item.price), 0)
                    .toFixed(2)} MXN
                </td>
              </tr>
            </tbody>
          </table>
          <div className="fixed top-2 right-2 my-4">
            <button
              className=" px-4 py-2 mx-2 font-medium hover:bg-blue-600 bg-pageBackground rounded"
              onClick={() => setShowSearchStock(true)}
            >
              Search for matches in stock
            </button>
            <button
              className=" px-4 py-2 mx-2 font-medium hover:bg-red-600 bg-pageBackground rounded"
              onClick={handleClose}
            >
              Close
            </button>
          </div>
          <table className="mb-10 border border-gray-700 min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg mt-2">
            <thead>
              <tr>
                <th className="text-center py-1 px-1 border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">
                  No.
                </th>
                <th className="text-center py-2 px-2 border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">
                  Assembly
                </th>
                <th className="text-center py-2 px-2 border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">
                  Subassembly
                </th>
                <th className="text-center py-2 px-2 border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">
                  MTL
                </th>
                <th className="text-center py-2 px-2 border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">
                  PART NUMBER
                </th>
                <th className="text-center py-2 px-2 border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">
                  DESCRIPTION
                </th>
                <th className="text-center py-2 px-2 border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">
                  QTY
                </th>
                <th className="text-center py-2 px-2 border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">
                  UNIT
                </th>
                <th className="text-center py-2 px-2 border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">
                  SUPPLIER
                </th>
                <th className="text-center py-2 px-2 border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">
                  PO
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index} className="hover:bg-gray-700">
                  <td className="text-gray-400 font-medium border border-gray-600 text-center p-1 hover:bg-gray-500">
                    {index + 1}
                  </td>
                  <td className="text-xs text-gray-300 font-medium border border-gray-600 text-center p-1 hover:bg-gray-600">
                    {assemblies[item.assembly_id] || "Loading..."}
                  </td>
                  <td className="text-xs text-gray-300 font-medium border border-gray-600 text-center p-1 hover:bg-gray-600">
                    {subassemblies[item.subassembly_id] || (
                      <span className="text-gray-500">N/A</span>
                    )}
                  </td>
                  <td className="text-xs text-gray-300 font-medium border border-gray-600 text-center p-1 hover:bg-gray-600">
                    {item.number_material}
                  </td>
                  <td className="text-xs text-gray-300 font-medium border border-gray-600 text-center p-1 hover:bg-gray-600">
                    {item.name}
                  </td>
                  <td className="text-xs text-gray-400 font-medium border border-gray-600 p-1 hover:bg-gray-600">
                    {item.description.length > 50
                      ? item.description.substring(0, 50) + "..."
                      : item.description}
                  </td>
                  <td className="text-xs text-gray-300 font-medium border border-gray-600 text-center p-1 hover:bg-gray-600">
                    {item.subassembly_assignment_quantity}
                  </td>
                  <td className="text-xs text-gray-300 font-medium border border-gray-600 text-center p-1 hover:bg-gray-600">
                    {item.price}
                  </td>
                  <td className="text-xs text-gray-300 font-medium border border-gray-600 text-center p-1 hover:bg-gray-600">
                    {item.supplier}
                  </td>
                  <td className="text-xs text-gray-300 font-medium border border-gray-600 text-center p-1 hover:bg-gray-600">
                    {item.number_cotizacion}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MtlTable;
