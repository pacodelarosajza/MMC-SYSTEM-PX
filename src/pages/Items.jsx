import React, { useState, useEffect } from 'react';
import axios from 'axios';

const items = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemsWithStock, setItemsWithStock] = useState([]);
  const [message, setMessage] = useState('');
  
  const apiIpAddress = import.meta.env.VITE_API_IP_ADDRESS;

  // Fetch items with stock on component mount
  useEffect(() => {
    const fetchItemsWithStock = async () => {
      try {
        const response = await axios.get(`${apiIpAddress}/api/items-with-stock`);
        setItemsWithStock(response.data);
      } catch (error) {
        console.error('Error al obtener ítems con stock:', error);
        setMessage('Error al cargar ítems con stock.');
      }
    };
    
    fetchItemsWithStock();
  }, [apiIpAddress]);

  const handleSearch = async () => {
    if (searchQuery.trim() === '') {
      setMessage('Por favor, ingresa un término de búsqueda.');
      return;
    }

    try {
      const response = await axios.get(`${apiIpAddress}/api/getItems`, {
        params: { query: searchQuery },
      });

      const filteredResults = response.data.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.supplier.toLowerCase().includes(searchQuery.toLowerCase())
      );

      if (filteredResults.length === 0) {
        setMessage('No se encontraron ítems que coincidan con la búsqueda.');
        setSearchResults([]);
      } else {
        setMessage('');
        setSearchResults(filteredResults);
      }
    } catch (error) {
      console.error('Error en la búsqueda:', error);
      setMessage('Error al realizar la búsqueda.');
    }
  };

  const handleSelectItem = (item) => {
    setSelectedItem(item);
    setSearchResults([]);
  };

  const handleCloseDetails = () => {
    setSelectedItem(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-900 shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold text-white mb-6">Buscar Ítem</h2>

      <div className="mb-4">
        <label className="text-white mb-1">Buscar Ítem:</label>
        <div className="flex space-x-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-grow border rounded p-2 bg-gray-800 text-white"
            placeholder="Buscar por nombre, proveedor, etc."
          />
          <button
            onClick={handleSearch}
            className="bg-blue-500 hover:bg-blue-700 text-white p-2 rounded transition duration-300 ease-in-out"
          >
            Buscar
          </button>
        </div>
        {message && <p className="mt-2 text-red-500">{message}</p>}
      </div>

      {searchResults.length > 0 && (
        <ul className="mt-4 bg-gray-800 p-4 rounded">
          {searchResults.map((item) => (
            <li
              key={item.id}
              className="flex justify-between items-center p-2 hover:bg-gray-700 rounded cursor-pointer transition duration-300 ease-in-out"
              onClick={() => handleSelectItem(item)}
            >
              <span className="text-white">{item.name} - {item.supplier}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Sección de ítems con stock */}
      <h3 className="text-xl font-bold text-white mt-8">Ítems con Stock</h3>
      {itemsWithStock.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {itemsWithStock.map((item) => (
            <div key={item.id} className="bg-gray-800 p-4 rounded shadow">
              <h4 className="text-lg font-semibold text-white">{item.name}</h4>
              <p className="text-gray-300"><strong>Descripción:</strong> {item.description}</p>
              <p className="text-gray-300"><strong>Proveedor:</strong> {item.supplier}</p>
              <p className="text-gray-300"><strong>Precio:</strong> ${item.price} {item.currency}</p>
              <p className="text-gray-300">
                <strong>Cantidad Total en Stock:</strong> 
                {item.stock_items.reduce((total, stockItem) => total + parseInt(stockItem.stock.stock_quantity), 0)} 
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-red-500">No se encontraron ítems con stock.</p>
      )}

      {selectedItem && (
        <div className="mt-6 p-4 bg-gray-800 rounded">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-white">Detalles del Ítem Seleccionado:</h3>
            <button 
              onClick={handleCloseDetails} 
              className="bg-red-500 hover:bg-red-700 text-white p-1 rounded transition duration-300 ease-in-out"
            >
              Cerrar
            </button>
          </div>
          <div className="mt-2">
            <p className="text-white"><strong>Nombre:</strong> {selectedItem.name}</p>
            <p className="text-white"><strong>Proveedor:</strong> {selectedItem.supplier}</p>
            <p className="text-white"><strong>Precio:</strong> ${selectedItem.price}</p>
            <p className="text-white"><strong>Cantidad Asignada:</strong> {selectedItem.project_assignment_quantity || "No asignada"}</p>
            <p className="text-white"><strong>Descripción:</strong> {selectedItem.description}</p>
            <p className="text-white"><strong>Fecha de Llegada:</strong> {selectedItem.arrived_date || "No disponible"}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default items;
