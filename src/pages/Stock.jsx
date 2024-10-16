import React, { useState } from 'react';
import axios from 'axios';

const AddItemForm = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [stockQuantity, setStockQuantity] = useState(0);
  const [message, setMessage] = useState('');

  // Estado para el formulario de agregar ítem
  const [newItem, setNewItem] = useState({
    project_id: '',
    assembly_id: '',
    name: '',
    description: '',
    quantity: '',
    price: '',
    currency: '',
    arrived_date: '',
    date_order: '',
    in_assembly: 0,
    number_material: '',
    number_price_item: '',
    supplier: '',
  });

  const apiIpAddress = import.meta.env.VITE_API_IP_ADDRESS;

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

  const handleSelectItem = async (item) => {
    setSelectedItem(item);
    setSearchResults([]);
    setStockQuantity(0);

    try {
      const response = await axios.get(`${apiIpAddress}/api/getStock/${item.id}`);
      setStockQuantity(response.data.quantity !== undefined ? response.data.quantity : 0);
    } catch (error) {
      console.error('Error al obtener el stock:', error);
      setStockQuantity(0);
      setMessage('Error al obtener la cantidad en stock.');
    }
  };

  const handleCloseDetails = () => {
    setSelectedItem(null);
    setStockQuantity(0);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewItem(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.post(`${apiIpAddress}/api/postItem`, newItem);
      setMessage('Ítem agregado exitosamente.');
      setNewItem({
        project_id: '',
        assembly_id: '',
        name: '',
        description: '',
        quantity: '',
        price: '',
        currency: '',
        arrived_date: '',
        date_order: '',
        in_assembly: 0, 
        number_material: null, // Establecer como null
        number_price_item: null, // Establecer como null
        supplier: '',
      });
    } catch (error) {
      console.error('Error al agregar el ítem:', error);
      setMessage('Error al agregar el ítem.');
    }
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
          <p className="text-white"><strong>Nombre:</strong> {selectedItem.name}</p>
          <p className="text-white"><strong>Proveedor:</strong> {selectedItem.supplier}</p>
          <p className="text-white"><strong>Precio:</strong> ${selectedItem.price}</p>
          <p className="text-white"><strong>Cantidad:</strong> {selectedItem.quantity}</p>
          <p className="text-white"><strong>Descripción:</strong> {selectedItem.description}</p>
          <p className="text-white"><strong>Cantidad en Stock:</strong> {stockQuantity}</p>
        </div>
      )}

      {/* Formulario para agregar un nuevo ítem */}
      <form onSubmit={handleSubmit} className="mt-8 bg-gray-800 p-4 rounded">
        <h3 className="text-lg font-bold text-white mb-4">Agregar Nuevo Ítem</h3>

        <div className="mb-4">
          <label className="text-white mb-1">Nombre:</label>
          <input
            type="text"
            name="name"
            value={newItem.name}
            onChange={handleInputChange}
            className="border rounded p-2 bg-gray-700 text-white w-full"
            required
          />
        </div>

        <div className="mb-4">
          <label className="text-white mb-1">Descripción:</label>
          <input
            type="text"
            name="description"
            value={newItem.description}
            onChange={handleInputChange}
            className="border rounded p-2 bg-gray-700 text-white w-full"
            required
          />
        </div>

        <div className="mb-4">
          <label className="text-white mb-1">Cantidad:</label>
          <input
            type="number"
            name="quantity"
            value={newItem.quantity}
            onChange={handleInputChange}
            className="border rounded p-2 bg-gray-700 text-white w-full"
            required
          />
        </div>

        <div className="mb-4">
          <label className="text-white mb-1">Precio:</label>
          <input
            type="number"
            name="price"
            value={newItem.price}
            onChange={handleInputChange}
            className="border rounded p-2 bg-gray-700 text-white w-full"
            required
          />
        </div>

        <div className="mb-4">
          <label className="text-white mb-1">Moneda:</label>
          <input
            type="text"
            name="currency"
            value={newItem.currency}
            onChange={handleInputChange}
            className="border rounded p-2 bg-gray-700 text-white w-full"
            required
          />
        </div>

        <div className="mb-4">
          <label className="text-white mb-1">Fecha de Llegada:</label>
          <input
            type="date"
            name="arrived_date"
            value={newItem.arrived_date}
            onChange={handleInputChange}
            className="border rounded p-2 bg-gray-700 text-white w-full"
            required
          />
        </div>

        <div className="mb-4">
          <label className="text-white mb-1">Fecha de Pedido:</label>
          <input
            type="date"
            name="date_order"
            value={newItem.date_order}
            onChange={handleInputChange}
            className="border rounded p-2 bg-gray-700 text-white w-full"
            required
          />
        </div>

     

       

        <div className="mb-4">
          <label className="text-white mb-1">Proveedor:</label>
          <input
            type="text"
            name="supplier"
            value={newItem.supplier}
            onChange={handleInputChange}
            className="border rounded p-2 bg-gray-700 text-white w-full"
            required
          />
        </div>

        <button
          type="submit"
          className="bg-green-500 hover:bg-green-700 text-white p-2 rounded transition duration-300 ease-in-out"
        >
          Agregar Ítem
        </button>
        {message && <p className="mt-2 text-red-500">{message}</p>}
      </form>
    </div>
  );
};

export default AddItemForm;
