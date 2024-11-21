import React, { useState, useEffect } from "react";
import SubmitMaterials from "./SubmitMaterials"; // Import the new component

const MaterialsSubassemblies = ({ id }) => {
  const [data, setData] = useState([]);
  const [subassemblies, setSubassemblies] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [formData, setFormData] = useState({
    identification_number: "",
    description: "",
    delivery_date: "",
    price: "",
    currency: "MXN",
    completed: 0,
  });
  const [charCount, setCharCount] = useState(0);
  const [rows, setRows] = useState([formData]);
  const [isSubmitMaterialsOpen, setIsSubmitMaterialsOpen] = useState(false); // New state
  const apiIpAddress = import.meta.env.VITE_API_IP_ADDRESS;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${apiIpAddress}/api/assembly/project/${id}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, [id, apiIpAddress]);

  const fetchSubassemblies = async () => {
    try {
      const response = await fetch(
        `${apiIpAddress}/api/subassembly/assembly/${selectedItemId.id}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch subassemblies");
      }
      const result = await response.json();
      setSubassemblies(result);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (selectedItemId) {
      fetchSubassemblies();
    } else {
      setSubassemblies([]);
    }
  }, [selectedItemId, apiIpAddress]);

  const handleAddClick = (itemId, identificationNumber) => {
    setSelectedItemId({ id: itemId, identificationNumber });
    setSubassemblies([]); // Reset subassemblies when a new item is selected
  };

  const handleDeactivateClick = () => {
    setSelectedItemId(null);
    setRows([formData]);
  };

  const handleRowChange = (index, e) => {
    const { name, value } = e.target;
    const updatedRows = rows.map((row, i) =>
      i === index ? { ...row, [name]: value } : row
    );
    setRows(updatedRows);
  };

  const handleRowDescriptionChange = (index, e) => {
    const { name, value } = e.target;
    const updatedRows = rows.map((row, i) =>
      i === index ? { ...row, [name]: value } : row
    );
    setRows(updatedRows);
    setCharCount(value.length);
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const addRow = () => {
    setRows([...rows, { ...formData }]);
  };

  const removeRow = (index) => {
    setRows(rows.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      for (const row of rows) {
        const postData = {
          assembly_id: selectedItemId.id,
          ...row,
          completed_date: null,
        };

        const response = await fetch(`${apiIpAddress}/api/postSubassembly`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(postData),
        });

        if (!response.ok) {
          // Handle error response
          throw new Error("Failed to submit row");
        }
      }
      // Handle successful response
    } catch (error) {
      console.error(error);
    }
  };

  const handleRefreshClick = () => {
    if (selectedItemId) {
      fetchSubassemblies();
    }
  };

  const handleContinueClick = () => {
    setIsSubmitMaterialsOpen(true);
  };

  return (
    <>
      {isSubmitMaterialsOpen ? (
        <SubmitMaterials id={id} onClose={() => setIsSubmitMaterialsOpen(false)} />
      ) : (
        <div className="fixed z-10 inset-0 flex items-center justify-center bg-black bg-opacity-60 transition-opacity duration-300">
          <div className="py-12 px-10 bg-white dark:bg-gray-800 rounded-lg shadow-2xl transform scale-100 hover:scale-105 transition-transform duration-200 w-full max-w-6xl max-h-[80vh] overflow-y-auto scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-blue-200">
            <div className="px-2 flex flex-col justify-center items-center">
              <h1 className="text-1xl font-extrabold text-gray-500 text-right">
                Materials management
              </h1>
              <h2 className="text-2xl font-bold mb-6 text-blue-600">
                2. Registration of subassemblies
              </h2>
              {/* TABLA DE GET DE ENSAMBLES */}
              <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg mt-2">
                <thead>
                  <tr>
                    <th className="text-center py-1 px-1 border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">
                      No.
                    </th>
                    <th className="py-1 px-2 border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">
                      Identification Number
                    </th>
                    <th className="py-1 px-2 border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">
                      Description
                    </th>
                    <th className="py-1 px-2 border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">
                      Delivery Date
                    </th>
                    <th
                      className="py-1 px-2 border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 text-left text-xs font-semibold text-gray-600 dark:text-gray-300"
                      colSpan={2}
                    >
                      Price <span className="text-xs text-gray-500">(MXN)</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, index) => (
                    <tr key={index}>
                      <td className="text-gray-400 font-medium border border-gray-600 text-center p-2">
                        {index + 1}
                      </td>
                      <td className="text-ms text-gray-300 font-medium border border-gray-600 text-center p-2">
                        {item.identification_number}
                      </td>
                      <td className="text-xs text-gray-400 font-medium border border-gray-600 p-2">
                        {item.description.length > 50
                          ? item.description.substring(0, 50) + "..."
                          : item.description}
                      </td>
                      <td className="text-ms text-gray-300 font-medium border border-gray-600 text-center p-2">
                        {item.delivery_date}
                      </td>
                      <td className="text-ms text-gray-300 font-medium border border-gray-600 text-center p-2">
                        {item.price}
                      </td>
                      <td className="border border-gray-600 text-center p-1">
                        <button
                          type="button"
                          onClick={() =>
                            handleAddClick(item.id, item.identification_number)
                          }
                          className="w-15 px-2 py-1 text-gray-400 text-xs bg-pageBackground border border-pageBackground hover:bg-yellow-900 hover:border-yellow-500 hover:text-yellow-300 rounded"
                        >
                          Add
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6">
              {selectedItemId ? (
                <>
                  <div className="flex justify-end mt-4">
                    <button
                      type="button"
                      onClick={handleDeactivateClick}
                      className="px-2 py-1 ml-1 bg-orange-900 text-sm text-orange-300 border border-orange-500 rounded hover:bg-orange-700 haver:border-orange-300"
                    >
                      <strong>x</strong>
                    </button>
                  </div>
                  <div className="flex mt-5 gap-2">
                    <h1 className="text-1xl text-gray-600">
                      Subassemblies for assembly
                    </h1>
                    <h1 className="text-1xl font-medium text-gray-400">
                      {selectedItemId.identificationNumber}
                    </h1>
                  </div>
                  <form onSubmit={handleSubmit} className="mt-5 w-full">
                    <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg">
                      <thead>
                        <tr>
                          <th className="text-center py-2 px-2 border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                            No.
                          </th>
                          <th className="py-2 px-4 border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                            Identification Number
                          </th>
                          <th className="py-2 px-4 border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                            Description <br />
                            <span className="text-xs text-gray-500">
                              (Non-mandatory)
                            </span>
                          </th>
                          <th className="py-2 px-4 border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                            Delivery Date
                          </th>
                          <th
                            className="py-2 px-4 border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 text-left text-sm font-semibold text-gray-600 dark:text-gray-300"
                            colSpan={2}
                          >
                            Price{" "}
                            <span className="text-xs text-gray-500">(MXN)</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((row, index) => (
                          <tr key={index}>
                            <td className="text-gray-400 font-medium border border-gray-600 text-center">
                              {index + 1}
                            </td>
                            <td className="text-gray-300 font-medium border border-gray-600">
                              <input
                                type="text"
                                name="identification_number"
                                value={row.identification_number}
                                onChange={(e) => handleRowChange(index, e)}
                                className="w-full px-2 py-1 bg-transparent appearance-none border-none focus:outline-none tracking-wide"
                                required
                              />
                            </td>
                            <td className="text-gray-300 font-medium border border-gray-600">
                              <textarea
                                name="description"
                                value={
                                  row.description.length > 255
                                    ? row.description.substring(0, 50) + "..."
                                    : row.description
                                }
                                onChange={(e) =>
                                  handleRowDescriptionChange(index, e)
                                }
                                maxLength="255"
                                className="w-full px-2 py-1 bg-transparent appearance-none border-none focus:outline-none tracking-wide resize-none overflow-hidden"
                                required
                              />
                              <div className="text-right text-xs text-gray-400">
                                {charCount}/255
                              </div>
                            </td>
                            <td className="text-gray-300 font-medium border border-gray-600">
                              <input
                                type="date"
                                name="delivery_date"
                                value={row.delivery_date}
                                onChange={(e) => handleRowChange(index, e)}
                                className="w-full px-2 py-1 bg-transparent appearance-none border-none focus:outline-none tracking-wide"
                                required
                              />
                            </td>
                            <td className="text-gray-300 font-medium border-l border-b border-t border-gray-600">
                              <input
                                type="number"
                                name="price"
                                value={row.price}
                                onChange={(e) => handleRowChange(index, e)}
                                className="w-full px-2 py-1 bg-transparent appearance-none border-none focus:outline-none tracking-wide"
                                min="0"
                                step="0.01"
                                required
                              />
                            </td>
                            <td className="text-gray-200 font-medium border-r border-b border-gray-600">
                              <button
                                type="button"
                                onClick={() => removeRow(index)}
                                className="ml-2 px-2 bg-red-900 text-red-300 rounded hover:bg-red-700 hover:text-red-200 text-sm"
                              >
                                x
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="flex items-center">
                      <div className="p-2">
                        <button
                          type="button"
                          onClick={addRow}
                          className="px-4 py-2 ml-1 bg-orange-900 text-sm text-gray-300 border border-orange-500 rounded hover:bg-orange-700 haver:border-orange-300 text-orange-200 hover:text-orange-100"
                        >
                          Add Row
                        </button>
                      </div>
                      <div className="flex justify-end gap-4">
                        <button
                          type="submit"
                          className="px-8 py-2 text-gray-400 text-sm bg-pageBackground border border-pageBackground hover:border hover:bg-blue-900 hover:border-blue-500 hover:text-blue-300 rounded"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  </form>
                  {/* TABLA DE GET DE SUBENSAMBLES */}
                  <div className="flex items-center justify-between">
                    <div className="flex mt-5 gap-2">
                      <h1 className="text-1xl text-gray-600">
                        List of subassemblies of assembly
                      </h1>
                      <h1 className="text-1xl font-medium text-gray-400">
                        {selectedItemId.identificationNumber}
                      </h1>
                    </div>
                    <div className="flex items-center  py-1 mt-5">
                      <button
                        onClick={handleRefreshClick}
                        className="p-2 ml-auto text-white rounded hover:bg-gray-800 transition duration-200"
                      >
                        <FaSync color="gray" size={15} />
                      </button>
                    </div>
                  </div>

                  <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg mt-4">
                    <thead>
                      <tr>
                        <th className="text-center py-2 px-2 border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                          No.
                        </th>
                        <th className="py-2 px-4 border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                          Identification Number
                        </th>
                        <th className="py-2 px-4 border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                          Description
                        </th>
                        <th className="py-2 px-4 border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                          Delivery Date
                        </th>
                        <th
                          className="py-2 px-4 border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 text-left text-sm font-semibold text-gray-600 dark:text-gray-300"
                          colSpan={2}
                        >
                          Price{" "}
                          <span className="text-xs text-gray-500">(MXN)</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {subassemblies.length > 0 ? (
                        subassemblies.map((item, index) => (
                          <tr key={index}>
                            <td className="text-gray-400 font-medium border border-gray-600 text-center p-2">
                              {index + 1}
                            </td>
                            <td className="text-ms text-gray-300 font-medium border border-gray-600 text-center p-2">
                              {item.identification_number}
                            </td>
                            <td className="text-xs text-gray-400 font-medium border border-gray-600 p-2">
                              {item.description.length > 50
                                ? item.description.substring(0, 50) + "..."
                                : item.description}
                            </td>
                            <td className="text-ms text-gray-300 font-medium border border-gray-600 text-center p-2">
                              {item.delivery_date}
                            </td>
                            <td className="text-ms text-gray-300 font-medium border border-gray-600 text-center p-2">
                              {item.price}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="6"
                            className="text-center text-gray-500 py-4"
                          >
                            No subassemblies registered.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </>
              ) : (
                <div className="mx-3 my-10 flex items-center text-gray-500">
                  <span>
                    Click on a button add to register subassemblies in the
                    assembly...
                  </span>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <button
                type="button"
                onClick={handleContinueClick}
                className="px-8 py-1 text-gray-400 text-sm bg-pageBackground border border-pageBackground hover:border hover:bg-blue-900 hover:border-blue-500 hover:text-blue-300 rounded"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MaterialsSubassemblies;
