import React, { useState, useEffect, useCallback } from "react";
import Modal from "../../../components/Modal";
import ModalAcept from "../../../components/ModalAcept";
import ModalSuccess from "../../../components/ModalSuccess";
import MaterialsSubassemblies from "./MaterialsSubassemblies";
import { FaSync, FaPlus, FaTimes } from "react-icons/fa";

const MaterialsAssemblies = ({ id }) => {
  const apiIpAddress = import.meta.env.VITE_API_IP_ADDRESS;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalCancelOpen, setIsModalCancelOpen] = useState(false);
  const [isModalSuccessOpen, setIsModalSuccessOpen] = useState(false);
  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
  const [proceedWithNegativeCost, setProceedWithNegativeCost] = useState(false);
  const [formData, setFormData] = useState({
    identification_number: "",
    description: "",
    delivery_date: "",
    price: "",
    currency: "MXN",
    completed: 0,
  });
  const [charCount, setCharCount] = useState(0);
  const [rowCharCounts, setRowCharCounts] = useState([0]);
  const [rows, setRows] = useState([formData]);
  const [showSubassemblies, setShowSubassemblies] = useState(false);
  const [costMaterial, setCostMaterial] = useState(null);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      identification_number: "",
      description: "",
      delivery_date: "",
      price: "",
      currency: "MXN",
      completed: 0,
    });
    setRows([
      {
        identification_number: "",
        description: "",
        delivery_date: "",
        price: "",
        currency: "MXN",
        completed: 0,
      },
    ]);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleCancel = () => {
    setIsModalCancelOpen(true);
  };

  const confirmCancel = () => {
    setIsModalCancelOpen(false);
    closeModal();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDescriptionChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setCharCount(value.length);
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const addRow = () => {
    setRows([...rows, { ...formData }]);
    setRowCharCounts([...rowCharCounts, 0]);
  };

  const removeRow = (index) => {
    setRows(rows.filter((_, i) => i !== index));
    setRowCharCounts(rowCharCounts.filter((_, i) => i !== index));
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
    const updatedCharCounts = rowCharCounts.map((count, i) =>
      i === index ? value.length : count
    );
    setRowCharCounts(updatedCharCounts);
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (remainingCost < 0 && !proceedWithNegativeCost) {
      setIsWarningModalOpen(true);
      return;
    }
    try {
      for (const row of rows) {
        const postData = {
          project_id: id,
          ...row,
          completed_date: null,
        };

        const response = await fetch(`${apiIpAddress}/api/postAssembly`, {
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
      
      setTimeout(() => {
        
        setIsModalOpen(false);
        setShowSubassemblies(true);
      }, 1000);
    } catch (error) {
      console.error(error);
    }
  };

  const handleWarningContinue = () => {
    setProceedWithNegativeCost(true);
    setIsWarningModalOpen(false);
    handleSubmit(new Event('submit'));
  };

  const fetchProjectData = useCallback(async () => {
    try {
      const response = await fetch(`${apiIpAddress}/api/getProjects/id/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch project data");
      }
      const data = await response.json();
      setCostMaterial(data.cost_material);
    } catch (error) {
      console.error(error);
    }
  }, [id, apiIpAddress]);

  useEffect(() => {
    fetchProjectData();
  }, [fetchProjectData]);

  const calculateTotalPrice = () => {
    return rows.reduce((total, row) => total + parseFloat(row.price || 0), 0);
  };

  const remainingCost = costMaterial !== null ? costMaterial - calculateTotalPrice() : null;

  const totalPriceStyle = calculateTotalPrice() < 0 ? "text-orange-500" : "text-gray-200";
  const remainingCostStyle = remainingCost < 0 ? "text-red-500" : "text-gray-200";

  return (
    <>
      <div className="p-2">
        <button
          onClick={openModal}
          className="w-15 px-2 py-1 font-medium hover:bg-blue-600 text-sm bg-pageBackground rounded"
        >
          Add Mtl
        </button>

        {isModalOpen && (
          <div className="fixed z-10 inset-0 flex items-center justify-center bg-black bg-opacity-60 transition-opacity duration-300">
          <div className="py-12 px-10 bg-white dark:bg-gray-800 rounded-lg shadow-2xl transform scale-100 hover:scale-105 transition-transform duration-200 w-full max-w-6xl max-h-[80vh] overflow-y-auto scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-blue-200">
            <div className="px-2 flex flex-col justify-center items-center">
              <h1 className="text-1xl font-extrabold text-gray-500 text-right">
                  Materials management
                </h1>
                <h2 className="text-3xl font-bold mb-10 text-blue-500">
                  1. Registration of assemblies
                </h2>

                <form onSubmit={handleSubmit} className="w-full">
                  <table className="border border-bg-gray-800 min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg">
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
                        <>
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
                                {rowCharCounts[index]}/255
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
                                className="ml-2 w-15 p-2 font-medium text-sm hover:bg-red-600 rounded"
                                >
                                <FaTimes />
                              </button>
                            </td>
                          </tr>
                        </>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td className="text-gray-400 text-right py-1 px-8  border-gray-500 bg-opacity-40 bg-gray-700 text-left font-semibold" colSpan={4}>
                          Total Assembly Price
                        </td>
                        <td className={`pl-2 font-medium border-gray-600 ${totalPriceStyle}`} colSpan={2}>
                          $ {calculateTotalPrice().toFixed(2)}  <span className="text-gray-500">MXN</span>
                        </td>
                      </tr>
                      <tr>
                        <td className="text-blue-400 text-right py-1 px-8 border-b border-red-600 bg-opacity-20 bg-blue-500 text-left font-semibold" colSpan={4}>
                          Cost Material Project
                        </td>
                        <td className=" pl-2 text-blue-400 bg-opacity-20 bg-blue-500 font-medium border-b border-red-600" colSpan={2}>
                          $ {costMaterial !== null ? costMaterial.toFixed(2) : "Loading..."} MXN
                        </td>
                      </tr>
                      <tr>
                      <td className="text-gray-400 text-right py-1 px-8  border-gray-500 bg-opacity-40 bg-gray-700 text-left font-semibold" colSpan={4}>
                        Remaining Cost
                        </td>
                        <td className={`pl-2 font-medium border-r border-b border-gray-500 ${remainingCostStyle}`} colSpan={2}>
                          $ {remainingCost !== null ? remainingCost.toFixed(2) : "Loading..."}  <span className=" text-gray-500">MXN</span>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                  <div className="p-2">
                    <button
                      type="button"
                      onClick={addRow}
                      className="ml-2 w-15 p-2 font-medium hover:bg-blue-500 text-sm bg-blue-600 rounded"
                      >
                      <FaPlus />
                    </button>
                  </div>
                 
                  <div className="flex justify-end gap-4">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="w-32 px-4 py-2 font-medium hover:bg-red-600 bg-pageBackground rounded"
                  >
                    Cancel
                    </button>
                    <button
                      type="submit"
                      className=" px-4 py-2 font-medium hover:bg-blue-600 bg-pageBackground rounded"
                  >
                    
                      Save and continue
                    </button>
                  </div>
                </form>
                
              </div>
            </div>
          </div>
        )}
        {showSubassemblies && <MaterialsSubassemblies id={id} />}
      </div>

      <ModalAcept
        isOpen={isModalCancelOpen}
        onClose={() => setIsModalCancelOpen(false)}
        onContinue={confirmCancel}
        title="Cancel Registration"
      >
        <p>Are you sure you want to cancel the registration?</p>
      </ModalAcept>

      <ModalSuccess
        isOpen={isModalSuccessOpen}
        onClose={() => setIsModalSuccessOpen(false)}
        title="Submission successful!"
      >
        <p className="text-5xl text-green-500">✔</p>
      </ModalSuccess>

      <ModalAcept
        isOpen={isWarningModalOpen}
        onClose={() => setIsWarningModalOpen(false)}
        onContinue={handleWarningContinue}
        title="Exceeding Project Budget"
      >
        <p>You are exceeding the budget for this project. Are you sure you want to continue?</p>
      </ModalAcept>
    </>
  );
};

export default MaterialsAssemblies;
