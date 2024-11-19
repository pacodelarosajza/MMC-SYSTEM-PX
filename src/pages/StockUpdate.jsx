import { useState, useEffect } from 'react';
import axios from 'axios';

const EditarItem = ({ itemSeleccionado, actualizarItem }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    currency: '',
    number_material: '',
    supplier: '',
    stock_quantity: ''
  });

  // Este useEffect se ejecuta cuando itemSeleccionado cambia, llenando el formulario con los datos del item seleccionado
  useEffect(() => {
    if (itemSeleccionado) {
      setFormData({
        name: itemSeleccionado.name,
        description: itemSeleccionado.description,
        price: itemSeleccionado.price,
        currency: itemSeleccionado.currency,
        number_material: itemSeleccionado.number_material,
        supplier: itemSeleccionado.supplier,
        stock_quantity: itemSeleccionado.stock_quantity
      });
    }
  }, [itemSeleccionado]);

  // Maneja los cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  // Maneja el envío del formulario y la actualización de los datos
  const handleSubmit = async (e) => {
    e.preventDefault();
    const itemId = itemSeleccionado.id; // Asegúrate de tener el ID del item seleccionado

    try {
      const response = await axios.put(
        `http://localhost:3002/api/items/item${itemId}/stock`,
        formData
      );
      if (response.status === 200) {
        actualizarItem(formData); // Aquí actualizas el item en el estado del componente padre
        alert('Item actualizado con éxito');
      }
    } catch (error) {
      console.error('Error al actualizar el item:', error);
      alert('Hubo un error al actualizar el item');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="name">Nombre:</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
        />
      </div>

      <div>
        <label htmlFor="description">Descripción:</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
        />
      </div>

      <div>
        <label htmlFor="price">Precio:</label>
        <input
          type="number"
          step="0.01"
          id="price"
          name="price"
          value={formData.price}
          onChange={handleChange}
        />
      </div>

      <div>
        <label htmlFor="currency">Moneda:</label>
        <input
          type="text"
          id="currency"
          name="currency"
          value={formData.currency}
          onChange={handleChange}
        />
      </div>

      <div>
        <label htmlFor="number_material">Número de material:</label>
        <input
          type="number"
          id="number_material"
          name="number_material"
          value={formData.number_material}
          onChange={handleChange}
        />
      </div>

      <div>
        <label htmlFor="supplier">Proveedor:</label>
        <input
          type="text"
          id="supplier"
          name="supplier"
          value={formData.supplier}
          onChange={handleChange}
        />
      </div>

      <div>
        <label htmlFor="stock_quantity">Cantidad de stock:</label>
        <input
          type="number"
          id="stock_quantity"
          name="stock_quantity"
          value={formData.stock_quantity}
          onChange={handleChange}
        />
      </div>

      <button type="submit">Actualizar Item</button>
    </form>
  );
};

export default EditarItem;
