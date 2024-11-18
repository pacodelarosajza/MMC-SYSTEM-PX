import React, { useState, useEffect, useCallback } from "react";
import Modal from "../../../components/Modal";
import ModalAcept from "../../../components/ModalAcept";
import ModalSuccess from "../../../components/ModalSuccess";
import MaterialsSubassemblies from "./MaterialsSubassemblies";

const MaterialsAssemblies = ({ id }) => {
  const apiIpAddress = import.meta.env.VITE_API_IP_ADDRESS;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalCancelOpen, setIsModalCancelOpen] = useState(false);
  const [isModalSuccessOpen, setIsModalSuccessOpen] = useState(false);
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
  const [showSubassemblies, setShowSubassemblies] = useState(false);

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
  };

  const removeRow = (index) => {
    setRows(rows.filter((_, i) => i !== index));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      setIsModalSuccessOpen(true);
      setTimeout(() => {
        setIsModalSuccessOpen(false);
        setIsModalOpen(false);
        setShowSubassemblies(true);
      }, 1000);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <div className="p-4">
        <button
          onClick={openModal}
          className="w-15 px-2 py-1 text-gray-400 text-xs bg-pageBackground border border-pageBackground hover:bg-yellow-900 hover:border-yellow-500 hover:text-yellow-300 rounded"
        >
          Materials
        </button>

        {isModalOpen && (
          <div className="fixed z-10 inset-0 flex items-center justify-center bg-black bg-opacity-60 transition-opacity duration-300">
            <div className="py-12 px-10 bg-white dark:bg-gray-800 rounded-lg shadow-2xl transform scale-100 hover:scale-105 transition-transform duration-200 w-full max-w-6xl max-h-[80vh] overflow-y-auto scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-blue-200">
              <div className="px-2 flex flex-col justify-center items-center">
                <h1 className="text-1xl font-extrabold text-gray-500 text-right">
                  Materials management
                </h1>
                <h2 className="text-3xl font-bold mb-10 text-blue-600">
                  1. Registration of assemblies
                </h2>

                <form onSubmit={handleSubmit} className="w-full">
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
                        </>
                      ))}
                    </tbody>
                  </table>
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
                      type="button"
                      onClick={handleCancel}
                      className="px-10 py-1 text-gray-400 text-lg bg-pageBackground border border-pageBackground hover:border hover:bg-red-900 hover:border-red-500 hover:text-red-300 rounded"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-10 py-1 text-gray-400 text-lg bg-pageBackground border border-pageBackground hover:border hover:bg-blue-900 hover:border-blue-500 hover:text-blue-300 rounded"
                    >
                      Continue
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
    </>
  );
};

export default MaterialsAssemblies;
