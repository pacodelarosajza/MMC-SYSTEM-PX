import React, { useState, useEffect } from "react";

const CtrlMaterials = ({ id }) => {
  const projectId = id;
  const [items, setItems] = useState([]);
  const [assemblies, setAssemblies] = useState({});
  const [subassemblies, setSubassemblies] = useState({});
  const [projectIdState, setProjectIdState] = useState("");
  const [view, setView] = useState("less");
  const [searchTerm, setSearchTerm] = useState("");
  const apiIpAddress = import.meta.env.VITE_API_IP_ADDRESS;

  const fetchItems = async (name = "") => {
    try {
      const response = await fetch(
        `${apiIpAddress}/api/getItems${
          name ? `/name/${name}/project/${projectId}` : `/project/${projectId}`
        }`
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

  useEffect(() => {
    fetchItems();
  }, [projectId, apiIpAddress]);

  useEffect(() => {
    const fetchProjectId = async () => {
      try {
        const response = await fetch(
          `${apiIpAddress}/api/getProjects/id/${projectId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch project ID");
        }
        const result = await response.json();
        setProjectIdState(result.identification_number);
      } catch (error) {
        console.error(error);
      }
    };

    fetchProjectId();
  }, [projectId, apiIpAddress]);

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

  const handleDateChange = async (itemId, newDate) => {
    try {
      const response = await fetch(`${apiIpAddress}/api/patchItem/${itemId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ date_order: newDate }),
      });
      if (!response.ok) {
        throw new Error("Failed to update date order");
      }
      fetchItems();
    } catch (error) {
      console.error(error);
    }
  };

  const handleSearch = () => {
    fetchItems(searchTerm);
    if (searchTerm) {
      setView("search");
    }
  };

  return (
    <div>
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-semibold text-gray-500">
            Project. {projectIdState}
          </h1>
          <div id="search-bar" className="flex items-center">
            <input
              type="text"
              id="input-search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Part Number"
              className="w-80 p-2 rounded-l focus:bg-gray-700 hover:bg-gray-700 text-sm text-gray-200 bg-gray-800 border border-blue-500 focus:outline-none focus:border-blue-400"
            />
            <button
              onClick={handleSearch}
              className="px-4 py-2 ml-1 bg-blue-600 border border-blue-600 text-sm rounded-r hover:bg-blue-500 font-medium"
            >
              Search
            </button>
          </div>
        </div>

        <div className="flex pb-2 justify-end">
          <select
            value={view}
            onChange={(e) => setView(e.target.value)}
            className="w-60 p-2 rounded focus:bg-gray-700 hover:bg-gray-700 text-sm text-gray-200 bg-gray-800 focus:outline-none focus:border-blue-400"
          >
            <option value="more">More information</option>
            <option value="less">Less information</option>
            <option value="mtl">MTL View</option>
          </select>
        </div>
      </div>
      <table className="text-xs table-auto w-full text-lightWhiteLetter border border-gray-700">
        <thead>
          <tr className="bg-gray-800 text-gray-200">
            <th className="text-center py-1 px-1 border-b border-gray-200 dark:border-gray-700 bg-blue-600 text-left text-xxs font-semibold ">
              #
            </th>
            {view !== "mtl" && view !== "search" && (
              <>
                <th className="text-center py-1 px-1 border-b border-gray-200 dark:border-gray-700 bg-blue-600 text-left text-xxs font-semibold ">
                  Assembly
                </th>
                <th className="text-center py-1 px-1 border-b border-gray-200 dark:border-gray-700 bg-blue-600 text-left text-xxs font-semibold ">
                  Sebassembly
                </th>
              </>
            )}
            <th className="text-center py-1 px-1 border-b border-gray-200 dark:border-gray-700 bg-blue-600 text-left text-xxs font-semibold">
              MTL
            </th>
            <th className="text-center py-1 px-1 border-b border-gray-200 dark:border-gray-700 bg-blue-600 text-left text-xxs font-semibold">
              Part Number
            </th>
            <th className="text-center py-1 px-1 border-b border-gray-200 dark:border-gray-700 bg-blue-600 text-left text-xxs font-semibold">
              Description
            </th>
            {view === "more" && (
              <>
                <th className="text-center py-1 px-1 border-b border-gray-200 dark:border-gray-700 bg-blue-600 text-left text-xxs font-semibold">
                  QTY
                </th>
                <th className="text-center py-1 px-1 border-b border-gray-200 dark:border-gray-700 bg-blue-600 text-left text-xxs font-semibold">
                  Unit (MXN)
                </th>
                <th className="text-center py-1 px-1 border-b border-gray-200 dark:border-gray-700 bg-blue-600 text-left text-xxs font-semibold">
                  Suppler
                </th>
                <th className="text-center py-1 px-1 border-b border-gray-200 dark:border-gray-700 bg-blue-600 text-left text-xxs font-semibold">
                  PO
                </th>
              </>
            )}
            {view === "mtl" && (
              <>
                <th className="text-center py-1 px-1 border-b border-gray-200 dark:border-gray-700 bg-blue-600 text-left text-xxs font-semibold">
                  QTY
                </th>
              </>
            )}
            {view === "search" && (
              <>
                <th className="text-center py-1 px-1 border-b border-gray-200 dark:border-gray-700 bg-blue-600 text-left text-xxs font-semibold">
                  ASSEMBLY
                </th>
                <th className="text-center py-1 px-1 border-b border-gray-200 dark:border-gray-700 bg-blue-600 text-left text-xxs font-semibold">
                  SUBASSEMBLY
                </th>
                <th className="text-center py-1 px-1 border-b border-gray-200 dark:border-gray-700 bg-blue-600 text-left text-xxs font-semibold ">
                  QTY
                </th>
                <th className="text-center py-1 px-1 border-b border-gray-200 dark:border-gray-700 bg-blue-600 text-left text-xxs font-semibold">
                  UNIT (MXN)
                </th>
                <th className="text-center py-1 px-1 border-b border-gray-200 dark:border-gray-700 bg-blue-600 text-left text-xxs font-semibold ">
                  SUPPLIER
                </th>
                <th className="text-center py-1 px-1 border-b border-gray-200 dark:border-gray-700 bg-blue-600 text-left text-xxs font-semibold ">
                  PO
                </th>
              </>
            )}
            <th className="text-center py-1 px-1 border-b border-gray-200 dark:border-gray-700 bg-blue-600 text-left text-xxs font-semibold ">
              Delivery Time
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index} className="hover:bg-gray-700 hover:bg-opacity-50">
              <td className="text-gray-300 font-medium border border-gray-600 text-center p-1 hover:bg-gray-700">
                {index + 1}
              </td>
              {view !== "mtl" && view !== "search" && (
                <>
                  <td className="text-gray-300 font-medium border border-gray-600 text-center p-1 hover:bg-gray-700">
                    {assemblies[item.assembly_id] || "Loading..."}
                  </td>
                  <td className="text-gray-300 font-medium border border-gray-600 text-center p-1 hover:bg-gray-700">
                    {subassemblies[item.subassembly_id] || (
                      <span className="text-gray-500">N/A</span>
                    )}
                  </td>
                </>
              )}
              <td className="text-gray-300 font-medium border border-gray-600 text-center p-1 hover:bg-gray-700">
                {item.number_material}
              </td>
              <td className="text-gray-300 font-medium border border-gray-600 text-center p-1 hover:bg-gray-700">
                {item.name}
              </td>
              <td
                className="text-gray-300 font-medium border border-gray-600 text-center p-1 hover:bg-gray-700"
                title={item.description}
              >
                {item.description.length > 50
                  ? item.description.substring(0, 45) + "..."
                  : item.description}
              </td>
              {view === "more" && (
                <>
                  <td className="text-gray-300 font-medium border border-gray-600 text-center p-1 hover:bg-gray-700">
                    {item.subassembly_assignment_quantity}
                  </td>
                  <td className="text-gray-300 font-medium border border-gray-600 text-center p-1 hover:bg-gray-700">
                    {item.price}
                  </td>
                  <td className="text-gray-300 font-medium border border-gray-600 text-center p-1 hover:bg-gray-700">
                    {item.supplier}
                  </td>
                  <td className="text-gray-300 font-medium border border-gray-600 text-center p-1 hover:bg-gray-700">
                    {item.number_cotizacion}
                  </td>
                </>
              )}
              {view === "mtl" && (
                <>
                  <td className="text-gray-300 font-medium border border-gray-600 text-center p-1 hover:bg-gray-700">
                    {item.subassembly_assignment_quantity}
                  </td>
                </>
              )}
              {view === "search" && (
                <>
                  <td className="text-gray-300 font-medium border border-gray-600 text-center p-1 hover:bg-gray-700">
                    {assemblies[item.assembly_id] || "Loading..."}
                  </td>
                  <td className="text-gray-300 font-medium border border-gray-600 text-center p-1 hover:bg-gray-700">
                    {subassemblies[item.subassembly_id] || (
                      <span className="text-gray-500">N/A</span>
                    )}
                  </td>
                  <td className="text-gray-300 font-medium border border-gray-600 text-center p-1 hover:bg-gray-700">
                    {item.subassembly_assignment_quantity}
                  </td>
                  <td className="text-gray-300 font-medium border border-gray-600 text-center p-1 hover:bg-gray-700">
                    {item.price}
                  </td>
                  <td className="text-gray-300 font-medium border border-gray-600 text-center p-1 hover:bg-gray-700">
                    {item.supplier}
                  </td>
                  <td className="text-gray-300 font-medium border border-gray-600 text-center p-1 hover:bg-gray-700">
                    {item.number_cotizacion}
                  </td>
                </>
              )}
              <td className="text-gray-300 font-medium border border-gray-600 text-center p-1 hover:bg-gray-700">
                <input
                  type="date"
                  className={`text-xxs font-medium bg-gray-700 border border-gray-600 p-1 hover:bg-gray-700 ${
                    item.date_order ? "text-white" : "text-red-500"
                  }`}
                  value={item.date_order || ""}
                  onChange={(e) => handleDateChange(item.id, e.target.value)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CtrlMaterials;
