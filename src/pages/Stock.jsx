import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTimes, faInfoCircle, faWarehouse, faTruck, faCalendarAlt, faDollarSign, faFileExcel } from '@fortawesome/free-solid-svg-icons';
import * as XLSX from 'xlsx';

import { faUpload } from '@fortawesome/free-solid-svg-icons';

import { faMoneyBillWave, faHashtag, faBoxes } from '@fortawesome/free-solid-svg-icons';

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
  const [totalCost, setTotalCost] = useState(0);
  const apiIpAddress = import.meta.env.VITE_API_IP_ADDRESS;
  

  const handleUpdateItem = async () => {
    if (!selectedItem) return;

    setMessage(''); // Limpiar el mensaje antes de empezar
    setLoading(true); // Activar el estado de carga

    try {
      const response = await axios.patch(`${apiIpAddress}/items/${selectedItem.id}`, selectedItem);

      if (response.status === 200) {
        setMessage('Item updated successfully!');

        // Si necesitas actualizar la lista de ítems localmente
        setItems(prevItems =>
          prevItems.map(item =>
            item.id === selectedItem.id ? { ...item, ...selectedItem } : item
          )
        );
      } else {
        setMessage('Unexpected response status: ' + response.status);
      }
    } catch (error) {
      // Manejo de errores detallado
      if (error.response) {
        // Respuesta del servidor con error (por ejemplo, 404, 500)
        setMessage(`Error: ${error.response.data || 'Unknown server error'}`);
      } else if (error.request) {
        // No se recibió respuesta (problema de red)
        setMessage('Network error: Please check your connection.');
      } else {
        // Error general
        setMessage(`Error: ${error.message}`);
      }
    } finally {
      setLoading(false); // Desactivar el estado de carga
    }
  };













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
        const items = response.data;

        // Calcular el costo total
        const total = items.reduce((sum, item) => {
          const itemCost = item.stock_items.reduce((stockSum, stockItem) => {
            const quantity = parseFloat(stockItem.stock.stock_quantity);
            const price = parseFloat(item.price);
            return stockSum + quantity * price;
          }, 0);
          return sum + itemCost;
        }, 0);

        setTotalCost(total.toFixed(2)); // Redondea a 2 decimales
      } catch (error) {
        console.error("Error fetching items with stock:", error);
      }
    };

    fetchItemsWithStock();
  }, []);

  // Función para manejar la búsqueda de ítems
  const handleSearch = async () => {
    if (searchQuery.trim() === '') {
      setMessage('Please, enter a name or supplier.');
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

  // 1. Función para manejar la carga de archivos Excel
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
          name: row["NUMERO DE PARTE"],
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


  const handleSubmit = async () => {
    let successCount = 0;
    let errorCount = 0;

    // 2. post
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
      setMessageStock(`${successCount} item(s) succesfully registrer`);
    }
    if (errorCount > 0) {
      setMessage((prevMessage) => `${prevMessage} ${errorCount} error(es) of submit.`);
    }
  };

 // Función para realizar la búsqueda
 const fetchSearchResults = async (query) => {
  if (!query.trim()) {
    setSearchResults([]);
    setMessage('Please enter a stock item.');
    return;
  }

  setLoading(true);

  try {
    const { data } = await axios.get(`${apiIpAddress}/api/items-with-stock`, {
      params: { query },
    });

    const normalizedQuery = query.toLowerCase();
    const filteredResults = data.filter(item => {
      const itemName = item.name?.toLowerCase() || '';
      const itemSupplier = item.supplier?.toLowerCase() || '';
      return itemName.includes(normalizedQuery) || itemSupplier.includes(normalizedQuery);
    });

    if (filteredResults.length > 0) {
      setSearchResults(filteredResults);
      setMessage('');
    } else {
      setSearchResults([]);
      setMessage('No se encontraron ítems que coincidan con la búsqueda.');
    }
  } catch (error) {
    console.error('Error al realizar la búsqueda:', error);
    setMessage('Hubo un error al conectar con el servidor.');
  } finally {
    setLoading(false);
  }
};

// Implementación de debounce para evitar múltiples solicitudes
useEffect(() => {
  const delayDebounceFn = setTimeout(() => {
    fetchSearchResults(searchQuery);
  }, 500); // 500 ms de retraso

  return () => clearTimeout(delayDebounceFn); // Limpia el temporizador si el usuario sigue escribiendo
}, [searchQuery]);




  // fin de seccion de excel ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  return (
    <div className="relative max-w-screen-xl mx-auto mb-40 p-10 shadow-2xl ">
      {/* 3. Formulario de carga de archivos Excel */}
      <div className=" shadow-lg ">
        <div className="text-center mb-6">
          <h2 className="text-4xl text-center font-extrabold text-white mb-6 tracking-tight">
            Upload Your Excel File
          </h2>
          <p className="text-gray-400 text-sm">
            Upload an Excel file to register items in the system. Supported formats: .xlsx, .xls, .xlm
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center">
          {/* Drag-and-drop area */}
          <div className="w-full md:w-2/3 flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-4 hover:bg-gray-700 transition duration-300 ease-in-out cursor-pointer relative">
            <input
              type="file"
              accept=".xlsx, .xls, .xlm"
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <FontAwesomeIcon icon={faFileExcel} className="text-green-500 text-4xl mb-2" />
            <p className="text-white font-medium">
              Drag & Drop or Click to Select File
            </p>
          </div>

          {/* Upload button */}
          <button
            onClick={handleSubmit}
            className="mt-4 md:mt-0 md:ml-4 bg-green-600 hover:bg-green-800 text-white px-6 py-3 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 flex items-center shadow-md"
          >
            <FontAwesomeIcon icon={faUpload} className="mr-2" /> Register Items
          </button>
        </div>

        {/* Estado del mensaje */}
        {messagestock && (
          <div className={`mt-6 text-lg text-center ${errorCount > 0 ? 'text-red-500' : 'text-green-500'}`}>
            {messagestock}
          </div>
        )}
      </div>

      {/* Indicador del Costo Total del Stock compacto y animado */}
      <div className="absolute top-4 right-4 flex items-center bg-gradient-to-r  text-white text-xs font-medium rounded-full px-4 py-2 shadow-lg border border-green-200 transform transition-all duration-300 hover:scale-105 hover:shadow-emerald-500/80 hover:bg-gradient-to-l bg-gray-900 via-emerald-500 bg-gray-900">

        {/* Ícono de dinero con animación de pulso */}
        <div className="relative flex items-center justify-center w-6 h-6 mr-2 bg-green-400 rounded-full">
          <span className="absolute inset-0 bg-green-200 rounded-full blur-sm opacity-50 animate-pulse"></span>
          <span className="relative text-yellow-200 text-lg animate-bounce">💵</span>
        </div>

        {/* Texto de costo con formato destacado */}
        <div className="relative text-left">
          <p className="text-[0.7rem] uppercase tracking-widest">Costo Total</p>
          <p className="text-lg font-bold tracking-wide text-yellow-100">
            ${totalCost.toLocaleString('en-US')} <span className="text-sm">MXN</span>
          </p>
        </div>
      </div>

 {/* Search section and search bar */}
<div className="mt-12 max-w-xl mx-auto">
  <h2 className="text-4xl text-center font-extrabold text-white mb-6 tracking-tight">
    Search Stock Item
  </h2>
  <div className="flex flex-col items-center">
    <label
      htmlFor="search-input"
      className="text-xl font-medium text-gray-300 mb-2"
    >
      Search for an Item:
    </label>
    <div className="flex flex-col sm:flex-row w-full sm:max-w-lg">
      <input
        id="search-input"
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full py-3 px-6 bg-gray-900 text-white placeholder-gray-500 border-2 border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 transition duration-300 ease-in-out"
        placeholder="Item name or supplier..."
        aria-label="Search input"
      />
      <button
        onClick={handleSearch}
        className="mt-4 sm:mt-0 sm:ml-4 bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg shadow-md focus:outline-none transition duration-200 transform hover:scale-105"
        aria-label="Search item"
      >
        <FontAwesomeIcon icon={faSearch} className="mr-2" />
        Search
      </button>
    </div>
    {message && (
      <p
        className="mt-4 text-blue-400 text-center font-semibold"
        aria-live="polite"
      >
        {message}
      </p>
    )}
  </div>
</div>


      {/* Spinner de carga */}
      {loading && (
        <div className="flex justify-center items-center mt-10">
          <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12"></div>
          <p className="ml-3 text-lg text-white font-semibold">Buscando...</p>
        </div>
      )}

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
          {/* Botones de navegación de resultados */}
          <div className="flex justify-center mt-12 space-x-6">
            {visibleItems < searchResults.length && (
              <button
                onClick={showMoreItems}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-lg transition duration-300 ease-in-out transform hover:scale-110"
              >
                Ver más
              </button>
            )}
            {visibleItems > 3 && (
              <button
                onClick={showLessItems}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold px-6 py-3 rounded-lg transition duration-300 ease-in-out transform hover:scale-110"
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

          {/* Form for editing item */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Name */}
            <div className="bg-gray-800 p-4 rounded-lg shadow-lg transition-transform transform hover:scale-105 duration-300">
              <div className="flex items-center mb-2">
                <FontAwesomeIcon icon={faInfoCircle} className="mr-2 text-blue-400" />
                <strong className="text-lg text-white">Name:</strong>
              </div>
              <input
                type="text"
                value={selectedItem.name}
                onChange={(e) => setSelectedItem({ ...selectedItem, name: e.target.value })}
                className="bg-gray-900 text-white p-2 rounded-md w-full"
              />
            </div>

            {/* Supplier */}
            <div className="bg-gray-800 p-4 rounded-lg shadow-lg transition-transform transform hover:scale-105 duration-300">
              <div className="flex items-center mb-2">
                <FontAwesomeIcon icon={faTruck} className="mr-2 text-indigo-400" />
                <strong className="text-lg text-white">Supplier:</strong>
              </div>
              <input
                type="text"
                value={selectedItem.supplier}
                onChange={(e) => setSelectedItem({ ...selectedItem, supplier: e.target.value })}
                className="bg-gray-900 text-white p-2 rounded-md w-full"
              />
            </div>

            {/* Price */}
            <div className="bg-gray-700 p-4 rounded-lg shadow-lg transition-transform transform hover:scale-105 duration-300">
              <div className="flex items-center mb-2">
                <FontAwesomeIcon icon={faDollarSign} className="mr-2 text-green-400" />
                <strong className="text-lg text-white">Price:</strong>
              </div>
              <input
                type="number"
                value={selectedItem.price}
                onChange={(e) => setSelectedItem({ ...selectedItem, price: e.target.value })}
                className="bg-gray-900 text-white p-2 rounded-md w-full"
              />
            </div>

            

            {/* Description */}
            <div className="bg-gray-800 p-4 rounded-lg shadow-lg transition-transform transform hover:scale-105 duration-300 col-span-full">
              <div className="flex items-center mb-2">
                <FontAwesomeIcon icon={faInfoCircle} className="mr-2 text-gray-400" />
                <strong className="text-lg text-white">Description:</strong>
              </div>
              <textarea
                value={selectedItem.description}
                onChange={(e) => setSelectedItem({ ...selectedItem, description: e.target.value })}
                className="bg-gray-900 text-white p-2 rounded-md w-full"
              />
            </div>
            {/* Currency */}
            <div className="bg-gray-700 p-4 rounded-lg shadow-lg transition-transform transform hover:scale-105 duration-300">
              <div className="flex items-center mb-2">
                <FontAwesomeIcon icon={faMoneyBillWave} className="mr-2 text-yellow-400" />
                <strong className="text-lg text-white">Currency:</strong>
              </div>
              <input
                type="text"
                value={selectedItem.currency}
                onChange={(e) => setSelectedItem({ ...selectedItem, currency: e.target.value })}
                className="bg-gray-900 text-white p-2 rounded-md w-full"
              />
            </div>

            

            {/* Total Quantity in Stock */}
            <div className="bg-gray-700 p-4 rounded-lg shadow-lg transition-transform transform hover:scale-105 duration-300">
              <div className="flex items-center mb-2">
                <FontAwesomeIcon icon={faBoxes} className="mr-2 text-purple-400" />
                <strong className="text-lg text-white">Total Quantity in Stock:</strong>
              </div>
              <input
                type="number"
                value={selectedItem.stock_quantity}
                onChange={(e) => setSelectedItem({ ...selectedItem, stock_quantity: e.target.value })}
                className="bg-gray-900 text-white p-2 rounded-md w-full"
              />
            </div>

            {/* Save Changes Button */}
            <div className="col-span-full mt-4 text-right">
              <button
                onClick={handleUpdateItem}
                className="bg-green-500 hover:bg-green-700 text-white px-6 py-2 rounded-full transition duration-300 ease-in-out transform hover:scale-110"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}




    </div>
  );
};

export default AddItemForm;
