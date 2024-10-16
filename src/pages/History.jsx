import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaShare } from "react-icons/fa";

const History = () => {
  const apiIpAddress = import.meta.env.VITE_API_IP_ADDRESS;

  const [stocks, setStocks] = useState([]);
  const [newStock, setNewStock] = useState({ item_id: "", quantity: "" });
  const [selectedStock, setSelectedStock] = useState(null);
  const [items, setItems] = useState([]);

  //const [selectedOption, setSelectedOption] = useState("search");

  useEffect(() => {
    fetchStocks();
    fetchItems(); // Cargar los items para futuras operaciones
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

  const handleCreateStock = async () => {
    try {
      await axios.post(`${apiIpAddress}/api/postStock`, newStock);
      setNewStock({ item_id: "", quantity: "" });
      fetchStocks(); // Refetch stocks after adding
    } catch (error) {
      console.error("Error creating stock:", error);
    }
  };

  const handleUpdateStock = async () => {
    if (selectedStock) {
      try {
        const updatedStock = {
          item_id: selectedStock.item_id,
          quantity: selectedStock.quantity,
        };
        await axios.patch(
          `${apiIpAddress}/api/patchStock/${selectedStock.id}`,
          updatedStock
        );
        setSelectedStock(null); // Clear selection after update
        fetchStocks(); // Refetch stocks after updating
      } catch (error) {
        console.error("Error updating stock:", error);
      }
    }
  };

  const handleDeleteStock = async (id) => {
    try {
      await axios.delete(`${apiIpAddress}/api/deleteStock/${id}`);
      fetchStocks(); // Refetch stocks after deletion
    } catch (error) {
      console.error("Error deleting stock:", error);
    }
  };

  const handleFilterItemsArrived = async () => {
    try {
      const response = await axios.get(`${apiIpAddress}/api/getItems/arrived`);
      setItems(response.data);
    } catch (error) {
      console.error("Error fetching arrived items:", error);
    }
  };

  const handleFilterItemsMissing = async () => {
    try {
      const response = await axios.get(`${apiIpAddress}/api/getItems/missing`);
      setItems(response.data);
    } catch (error) {
      console.error("Error fetching missing items:", error);
    }
  };

  return (
    <div className="min-h-screen p-8">
      {/*<div className="absolute top-0 right-0 m-4">
        <select
          value={selectedOption}
          onChange={(e) => setSelectedOption(e.target.value)}
          className="p-2 rounded bg-gray-700 text-white border-4 border-gray-700"
        >
          <option value="search" className="">
            Buscar por ID
          </option>
          <option value="filter" className="">
            Aplicar Filtros
          </option>
        </select>
      </div>*/}

      {/*{selectedOption === "search" && (
        <>*/}
      <div className="flex flex-col items-center justify-center p-[5rem]">
        <div>
          <h1 className="text-2xl font-bold mb-4">
            Search by project identifier
          </h1>
        </div>
        <div className="items-center">
          <input
            type="text"
            placeholder="ex. 000351 ..."
            className="w-96 p-2 mb-4 rounded-l focus:bg-gray-800 hover:bg-gray-800 text-sm text-gray-200 bg-pageBackground border border-gray-500 focus:outline-none focus:border-blue-500"
          />
          <button className="px-4 py-2 ml-1 bg-gray-500 text-sm text-gray-300 bg-gray-700 border border-gray-500 rounded-r hover:bg-blue-700 hover:border-blue-500 hover:text-blue-300">
            <strong>Search</strong>
          </button>
        </div>
      </div>
      {/*</>
      )}*/}

      {/*{selectedOption === "filter" && (
        <>
          <h1 className="text-2xl font-bold mb-4">Aplicar Filtros</h1>
          <div className="flex gap-3 mb-5">
            <button
              onClick={handleFilterItemsArrived}
              className="bg-purple-600 p-2 rounded text-white hover:bg-purple-500"
            >
              Mostrar Items Llegados
            </button>
            <button
              onClick={handleFilterItemsMissing}
              className="bg-pink-600 p-2 rounded text-white hover:bg-pink-500"
            >
              Mostrar Items Faltantes
            </button>
          </div>
        </>
      )}*/}

            <table className="min-w-full">
        <thead className="hover:bg-gray-500">
          <tr>
            <th className="text-left px-4 py-2">Project identifier</th>
            <th className="text-left px-4 py-2">Manager</th>
            <th className="text-left px-4 py-2">Description</th>
            <th className="text-left px-4 py-2"></th>
          </tr>
        </thead>
        <tbody className="bg-gray-800 rounded shadow-lg">
          {items.map((item) => (
            <tr
              key={item.id}
              className="border-b border-gray-700 hover:bg-gray-700"
            >
              <td className="px-4 py-2">
                <span>211715</span>
              </td>
              <td className="px-4 py-2">
                <span>Lorem ipsum dolor sithjughs.</span>
              </td>
              <td className="px-4 py-2">
                <span>Random description.</span>
              </td>
              <td className="px-4 py-2">
                <button className="p-2 rounded text-gray-300 hover:bg-gray-200 hover:text-gray-800 bg-gray-800">
                  <Link to="/dashboard/history" onClick={handleNavigate}>
                    <FaShare />
                  </Link>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default History;
