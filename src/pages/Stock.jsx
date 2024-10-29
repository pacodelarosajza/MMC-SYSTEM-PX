import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTimes, faInfoCircle, faWarehouse, faTruck, faCalendarAlt, faDollarSign } from '@fortawesome/free-solid-svg-icons';
import * as XLSX from 'xlsx';

const AddItemForm = () => {
  // Estados para manejar búsqueda, resultados, y selección de ítems
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);

  const apiIpAddress = import.meta.env.VITE_API_IP_ADDRESS;

  // Función para obtener ítems con stock
  useEffect(() => {
    const fetchItemsWithStock = async () => {
      try {
        const response = await axios.get(`${apiIpAddress}/api/items-with-stock`);
        setSearchResults(response.data);
      } catch (error) {
        console.error('Error al obtener ítems con stock:', error);
        setMessage('Error al cargar ítems con stock.');
      }
    };

    fetchItemsWithStock();
  }, [apiIpAddress]);

  // Función para manejar la búsqueda de ítems
  const handleSearch = async () => {
    if (searchQuery.trim() === '') {
      setMessage('Por favor, ingresa un término de búsqueda.');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.get(`${apiIpAddress}/api/items-with-stock`, {
        params: { query: searchQuery },
      });

      // Filtrar resultados de la búsqueda
      const filteredResults = response.data.filter(item =>
        item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.supplier?.toLowerCase().includes(searchQuery.toLowerCase())
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
    } finally {
      setLoading(false);
    }
  };

  // Función para seleccionar un ítem de los resultados
  const handleSelectItem = (item) => {
    setSelectedItem(item);
    setSearchResults([]);
  };

  // Función para cerrar el detalle del ítem seleccionado
  const handleCloseDetails = () => {
    setSelectedItem(null);
  };

   // Función para manejar la carga de archivos Excel
const handleFileUpload = async (event) => {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = (e) => {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const json = XLSX.utils.sheet_to_json(sheet);

    const mappedItems = json.map((row, index) => {
      const cost = row["COSTO TOTAL"];

      if (cost === undefined) {
        console.warn(`Advertencia: El costo está vacío para el item ${row["NUMERO DE PARTE"]}`);
      }

      return {
        number_material: row["NUMERO DE PARTE"],
        description: row["DESCRIPCION"] || "Sin Descripción",
        supplier: row["FABRICANTE"] || "Proveedor Desconocido",
        stock_quantity: row["CANTIDAD"] || 0,
        price: cost || 0, // Si no hay costo, asigna 0
        currency: currency|| "MXN",
      };
    });

    setItems(mappedItems);
  };

  reader.readAsArrayBuffer(file);
};

// Función para enviar los datos cargados del Excel
const handleSubmit = async () => {
  for (const item of items) {
    try {
      await axios.post(`${apiIpAddress}/api/items-create`, item);
      console.log("Item registrado:", item);
    } catch (error) {
      console.error("Error al registrar el item:", item, error);
    }
  }
};


  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-900 shadow-lg rounded-lg animate-fadeIn">
      <h2 className="text-3xl font-extrabold text-white mb-6 text-center">Item Stock Search</h2>

      {/* Sección de búsqueda de ítems */}
      <div className="mb-6">
        <label className="text-lg font-semibold text-white mb-2 block">Search for an Item:</label>
        <div className="flex space-x-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border-2 border-blue-500 rounded-lg bg-gray-800 text-white focus:outline-none focus:border-blue-700 transition duration-300"
            placeholder="Enter item name or supplier..."
          />
          <button
            onClick={handleSearch}
            className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 flex items-center"
          >
            <FontAwesomeIcon icon={faSearch} className="mr-2" /> Search
          </button>
        </div>
        {message && <p className="mt-4 text-red-500 text-center font-semibold">{message}</p>}
      </div>

      {/* Spinner de carga */}
      {loading && (
        <div className="flex justify-center items-center text-white mt-4">
          <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="ml-2">Buscando...</p>
        </div>
      )}

      {/* Lista de resultados de búsqueda */}
      {searchResults.length > 0 && (
        <ul className="mt-4 bg-gray-800 p-4 rounded-lg space-y-2 animate-slideIn">
          {searchResults.map((item) => (
            <li
              key={item.id}
              className="flex justify-between items-center p-3 bg-gray-700 hover:bg-gray-600 rounded-lg cursor-pointer transition duration-300 ease-in-out transform hover:scale-105"
              onClick={() => handleSelectItem(item)}
            >
              <span className="text-white font-medium">
                <FontAwesomeIcon icon={faWarehouse} className="mr-2" />
                {item.name} - {item.supplier}
              </span>
            </li>
          ))}
        </ul>
      )}

     {/* Detalles del ítem seleccionado */}
     {selectedItem && (
        <div className="mt-8 p-6 bg-gray-800 rounded-lg shadow-lg transition-opacity duration-300 ease-in-out opacity-100 animate-fadeIn">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-3xl font-bold text-white">Detalles del Ítem en Stock</h3>
            <button
              onClick={handleCloseDetails}
              className="bg-red-500 hover:bg-red-700 text-white px-4 py-2 rounded-full transition duration-300 ease-in-out transform hover:scale-110 flex items-center"
            >
              <FontAwesomeIcon icon={faTimes} className="mr-2" /> Cerrar
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/** Utilizamos un estilo más limpio para cada detalle **/}
            <div className="bg-gray-700 p-4 rounded-lg shadow-md">
              <div className="flex items-center mb-2">
                <FontAwesomeIcon icon={faInfoCircle} className="mr-2 text-blue-400" />
                <strong className="text-lg text-white">Nombre:</strong>
              </div>
              <span className="text-white">{selectedItem.name}</span>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg shadow-md">
              <div className="flex items-center mb-2">
                <FontAwesomeIcon icon={faTruck} className="mr-2 text-indigo-400" />
                <strong className="text-lg text-white">Proveedor:</strong>
              </div>
              <span className="text-white">{selectedItem.supplier}</span>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg shadow-md">
              <div className="flex items-center mb-2">
                <FontAwesomeIcon icon={faDollarSign} className="mr-2 text-green-400" />
                <strong className="text-lg text-white">Precio:</strong>
              </div>
              <span className="text-white">${selectedItem.price}</span>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg shadow-md">
              <div className="flex items-center mb-2">
                <FontAwesomeIcon icon={faWarehouse} className="mr-2 text-yellow-400" />
                <strong className="text-lg text-white">Currency:</strong>
              </div>
              <span className="text-white">{selectedItem.currency}</span>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg shadow-md col-span-full ">
              <div className="flex items-center mb-2">
                <FontAwesomeIcon icon={faInfoCircle} className="mr-2 text-gray-400" />
                <strong className="text-lg text-white">Descripción:</strong>
              </div>
              <span className="text-white">{selectedItem.description}</span>
            </div>

            <div className="bg-gray-700 p-4 rounded-lg shadow-md ">
              <div className="flex items-center mb-2">
                <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-red-400" />
                <strong className="text-lg text-white">Número de Material:</strong>
              </div>
              <span className="text-white">{selectedItem.number_material || "No Disponible"}</span>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg shadow-md ">
              <div className="flex items-center mb-2">
                <FontAwesomeIcon icon={faWarehouse} className="mr-2 text-yellow-500" />
                <strong className="text-lg text-white">Cantidad Total en Stock:</strong>
              </div>
              <span className="text-white">{selectedItem.stock_items[0]?.stock.stock_quantity || 'No Disponible'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Formulario de carga de archivos Excel */}
      <div className="mt-8 bg-gray-800 p-6 rounded-lg shadow-lg animate-fadeIn">
        <label className="text-lg font-semibold text-white mb-2 block">Upload Excel File:</label>
        <input type="file" accept=".xlsx, .xls, xlm" onChange={handleFileUpload} className="text-white"/>
        <button
          onClick={handleSubmit}
          className="bg-green-500 hover:bg-green-700 text-white px-4 py-2 mt-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 flex items-center"
        >
          <FontAwesomeIcon icon={faInfoCircle} className="mr-2" /> Register Items
        </button>
      </div>
    </div>
  );
};

export default AddItemForm;
