import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTimes, faInfoCircle, faWarehouse, faTruck, faCalendarAlt, faDollarSign, faFileExcel } from '@fortawesome/free-solid-svg-icons';
import * as XLSX from 'xlsx';

const AddItemForm = () => {
  // Estados para manejar búsqueda, resultados, y selección de ítems
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [messagestock, setMessageStock] = useState('');
  const [successfulCount, setSuccessfulCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [visibleItems, setVisibleItems] = useState(3);


  const apiIpAddress = import.meta.env.VITE_API_IP_ADDRESS;
  // Función para mostrar más elementos
  const showMoreItems = () => {
    setVisibleItems((prev) => prev + 6); // Incrementa el límite en 6
  };

  // Función para mostrar menos elementos
  const showLessItems = () => {
    setVisibleItems(3); // Resetea a 6 elementos visibles
  };

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

      const mappedItems = json.map((row) => {
        const cost = row[" COSTO "];

        if (cost === undefined) {
          console.warn(`Advertencia: El costo está vacío para el item ${row["NUMERO DE PARTE"]}`);
        }

        return {
          number_material: row["NUMERO DE PARTE"],
          description: row["DESCRIPCION"] || "Sin Descripción",
          supplier: row["FABRICANTE"] || "Proveedor Desconocido",
          stock_quantity: row["CANTIDAD"] || 0,
          price: cost || 0, // Si no hay costo, asigna 0
        };
      });

      setItems(mappedItems);
    };

    reader.readAsArrayBuffer(file);
  };

  // Función para manejar el arrastre de archivos
  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      handleFileUpload({ target: { files: [file] } });
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault(); // Previene el comportamiento por defecto para permitir el drop
  };

  const handleSubmit = async () => {
    let successCount = 0;
    let errorCount = 0;

    for (const item of items) {
      try {
        await axios.post(`${apiIpAddress}/api/items-create`, item);
        console.log("Item registrado:", item);
        successCount++;
      } catch (error) {
        console.error("Error al registrar el item:", item, error);
        errorCount++;
      }
    }

    setSuccessfulCount(successCount);
    setErrorCount(errorCount);

    if (successCount > 0) {
      setMessageStock(`${successCount} item(s) registrado(s) correctamente.`);
    }
    if (errorCount > 0) {
      setMessage((prevMessage) => `${prevMessage} ${errorCount} error(es) al registrar items.`);
    }
  };

  // fin de seccion de excel ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  return (
    <div className="max-w-screen-2xl mb-80 p-16 bg-gray-900 shadow-lg rounded-lg animate-fadeIn">
      <h2 className="text-3xl text-center font-extrabold text-gradient bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">Search Stock Item</h2>

      {/* Sección de búsqueda de ítems */}
      <div className="mb-6">
        <label className="text-center font-extrabold  bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">Search for an Item:</label>
        <div className="flex space-x-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border-2 border-white rounded-lg bg-gray-800 text-white focus:outline-none focus:border-blue-700 transition duration-300"
            placeholder="Enter item name or supplier..."
          />
          <button
            onClick={handleSearch}
            className="bg-white hover:bg-white text-black px-4 py-2 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 flex items-center"
          >
            <FontAwesomeIcon icon={faSearch} className="mr-2" /> Search
          </button>
        </div>
        {message && <p className="mt-4 text-green-500 text-center font-semibold">{message}</p>}
      </div>

      {/* Spinner de carga */}
      {loading && (
        <div className="flex justify-center items-center text-green mt-4">
          <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="ml-2">Buscando...</p>
        </div>
      )}

      {/* Lista de resultados de búsqueda en formato de recuadros */}
      {/* Lista de resultados de búsqueda en formato de recuadros */}
{searchResults.length > 0 && (
  <>
    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 animate-slideIn">
      {searchResults.slice(0, visibleItems).map((item) => (
        <div
          key={item.id}
          className="flex flex-col p-6 bg-gray-700 hover:bg-gray-600 rounded-xl shadow-lg cursor-pointer transition duration-300 ease-in-out transform hover:scale-105"
          onClick={() => handleSelectItem(item)}
        >
          <div className="flex items-center mb-4">
            <FontAwesomeIcon icon={faWarehouse} className="text-blue-400 mr-2" />
            <h3 className="text-lg font-semibold text-white">{item.name}</h3>
          </div>
          <p className="text-sm text-gray-300">Supplier: {item.supplier}</p>
        </div>
      ))}
    </div>

    {/* Botones para ver más y ver menos */}
    <div className="flex justify-center mt-4 space-x-4">
      {visibleItems < searchResults.length && (
        <button
          onClick={showMoreItems}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
        >
          Ver más
        </button>
      )}
      {visibleItems > 3 && (
        <button
          onClick={showLessItems}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
        >
          Ver menos
        </button>
      )}
    </div>
  </>
)}



      {/* Selected Item Details */}
      {selectedItem && (
        <div className="mt-8 p-6 bg-gray-900 rounded-lg shadow-lg transition-opacity duration-300 ease-in-out opacity-100 animate-fadeIn">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-3xl font-extrabold text-gradient bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">
              Item Details in Stock
            </h3>
            <button
              onClick={handleCloseDetails}
              className="bg-red-600 hover:bg-red-800 text-white px-4 py-2 rounded-full transition duration-300 ease-in-out transform hover:scale-110 flex items-center shadow-md"
            >
              <FontAwesomeIcon icon={faTimes} className="mr-2" /> Close
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Item Name */}
            <div className="bg-gray-800 p-4 rounded-lg shadow-lg transition-transform transform hover:scale-105 duration-300">
              <div className="flex items-center mb-2">
                <FontAwesomeIcon icon={faInfoCircle} className="mr-2 text-blue-400" />
                <strong className="text-lg text-white">Name:</strong>
              </div>
              <span className="text-white">{selectedItem.name}</span>
            </div>

            {/* Supplier */}
            <div className="bg-gray-800 p-4 rounded-lg shadow-lg transition-transform transform hover:scale-105 duration-300">
              <div className="flex items-center mb-2">
                <FontAwesomeIcon icon={faTruck} className="mr-2 text-indigo-400" />
                <strong className="text-lg text-white">Supplier:</strong>
              </div>
              <span className="text-white">{selectedItem.supplier}</span>
            </div>

            {/* Price */}
            <div className="bg-gray-700 p-4 rounded-lg shadow-lg transition-transform transform hover:scale-105 duration-300">
              <div className="flex items-center mb-2">
                <FontAwesomeIcon icon={faDollarSign} className="mr-2 text-green-400" />
                <strong className="text-lg text-white">Price:</strong>
              </div>
              <span className="text-white">${selectedItem.price}</span>
            </div>

            {/* Currency */}
            <div className="bg-gray-700 p-4 rounded-lg shadow-lg transition-transform transform hover:scale-105 duration-300">
              <div className="flex items-center mb-2">
                <FontAwesomeIcon icon={faWarehouse} className="mr-2 text-blue-400" />
                <strong className="text-lg text-white">Currency:</strong>
              </div>
              <span className="text-white">{selectedItem.currency}</span>
            </div>

            {/* Description */}
            <div className="bg-gray-800 p-4 rounded-lg shadow-lg transition-transform transform hover:scale-105 duration-300 col-span-full">
              <div className="flex items-center mb-2">
                <FontAwesomeIcon icon={faInfoCircle} className="mr-2 text-gray-400" />
                <strong className="text-lg text-white">Description:</strong>
              </div>
              <span className="text-white">{selectedItem.description}</span>
            </div>

            {/* Material Number */}
            <div className="bg-gray-700 p-4 rounded-lg shadow-lg transition-transform transform hover:scale-105 duration-300">
              <div className="flex items-center mb-2">
                <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-red-400" />
                <strong className="text-lg text-white">Material Number:</strong>
              </div>
              <span className="text-white">{selectedItem.number_material || "Not Available"}</span>
            </div>

            {/* Total Quantity in Stock */}
            <div className="bg-gray-700 p-4 rounded-lg shadow-lg transition-transform transform hover:scale-105 duration-300">
              <div className="flex items-center mb-2">
                <FontAwesomeIcon icon={faWarehouse} className="mr-2 text-blue-500" />
                <strong className="text-lg text-white">Total Quantity in Stock:</strong>
              </div>
              <span className="text-white">{selectedItem.stock_items[0]?.stock.stock_quantity || 'Not Available'}</span>
            </div>

            {/* Total Stock Price */}
            <div className="bg-gray-800 p-4 rounded-lg shadow-lg transition-transform transform hover:scale-105 duration-300 col-span-full">
              <div className="flex items-center mb-2">
                <FontAwesomeIcon icon={faInfoCircle} className="mr-2 text-gray-400" />
                <strong className="text-lg text-white">Total Stock Price:</strong>
              </div>
              <span className="text-white">
                ${(
                  selectedItem.price * (selectedItem.stock_items[0]?.stock.stock_quantity || 0)
                ).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Formulario de carga de archivos Excel */}
      <div className="mt-8 bg-gray-900 p-6 rounded-lg shadow-lg animate-fadeIn">
        <label className="text-lg font-semibold text-gradient bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-green-500 mb-2 block">
          Upload Excel File:
        </label>
        <div className="flex items-center">
          <input
            type="file"
            accept=".xlsx, .xls, .xlm"
            onChange={handleFileUpload}
            className="text-white bg-gray-800 border border-gray-700 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300 ease-in-out flex-1"
          />
          <button
            onClick={handleSubmit}
            className="bg-green-600 hover:bg-green-800 text-white px-4 py-2 ml-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 flex items-center shadow-md"
          >
            <FontAwesomeIcon icon={faInfoCircle} className="mr-2" /> Registrer Items
          </button>
        </div>

        {/* Mensaje de estado */}
        {messagestock && (
          <div className={`mt-4 text-lg ${errorCount > 0 ? 'text-red-500' : 'text-green-500'}`}>
            {messagestock}
          </div>
        )}
      </div>

    </div>
  );
};

export default AddItemForm;
