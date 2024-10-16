import React, { useEffect, useState } from 'react';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visibleUsers, setVisibleUsers] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [editUser, setEditUser] = useState(null);
  const [userTypeId, setUserTypeId] = useState('');
  const [emailSearch, setEmailSearch] = useState('');
  const [userNumberSearch, setUserNumberSearch] = useState('');
  const [showSearchMenu, setShowSearchMenu] = useState(false);

  const apiIpAddress = import.meta.env.VITE_API_IP_ADDRESS;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${apiIpAddress}/api/getUsers`);
        if (!response.ok) {
          throw new Error('Error fetching users');
        }
        const data = await response.json();
        setUsers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [apiIpAddress]);



  
  const handleShowMore = () => {
    setVisibleUsers((prev) => prev + 5);
  };

  const handleDeleteUser = async (id) => {
    try {
      await fetch(`${apiIpAddress}/api/users/logicDelete/${id}`, {
        method: 'PATCH',
      });
      setUsers(users.filter((user) => user.id !== id));
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleSearchByEmail = async () => {
    if (emailSearch) {
      try {
        const response = await fetch(`${apiIpAddress}/api/users/${emailSearch}`);
        if (response.ok) {
          const user = await response.json();
          setUsers([user]);
        } else {
          setError("Usuario no encontrado");
        }
      } catch (error) {
        setError("Error al buscar el usuario");
      }
    }
  };

  const handleSearchByUserNumber = async () => {
    if (userNumberSearch) {
      try {
        const response = await fetch(`${apiIpAddress}/api/users/userNum/${userNumberSearch}`);
        if (response.ok) {
          const user = await response.json();
          setUsers([user]);
        } else {
          setError("Usuario no encontrado");
        }
      } catch (error) {
        setError("Error al buscar el usuario");
      }
    }
  };

  // Llamada para actualizar el usuario
const handleUpdateUser = async (id) => {
  try {
    // Si el usuario está siendo "eliminado", asigna la fecha actual
    const currentDate = new Date().toISOString(); // Fecha en formato ISO

    const response = await fetch(`/api/users/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_type_id: editUser.user_type_id,
        email: editUser.email,
        username: editUser.username,
        user_number: editUser.user_number,
        password: editUser.password,
        deleted_at: editUser.deleted_at ? currentDate : null, // Asigna la fecha actual automáticamente si es necesario
      }),
    });

    if (!response.ok) {
      throw new Error("Error al actualizar el usuario");
    }

    const updatedUser = await response.json();
    console.log("Usuario actualizado:", updatedUser);

    setEditUser(null); // Cierra el formulario de edición
  } catch (error) {
    console.error("Error en la actualización:", error);
  }
};
  const handleGetUsersByUserType = async () => {
    if (userTypeId) {
      try {
        const response = await fetch(`${apiIpAddress}/getUsersByUserType/${userTypeId}`);
        if (response.ok) {
          const data = await response.json();
          setUsers(data);
        } else {
          setError("No se encontraron usuarios con el tipo de usuario dado");
        }
      } catch (error) {
        setError("Error al obtener usuarios por tipo");
      }
    }
  };

  const filteredUsers = users
    .filter(user =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.user_number.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.email.localeCompare(b.email);
      } else {
        return b.email.localeCompare(a.email);
      }
    });

  if (loading) {
    return <p className="text-center text-lg font-semibold mt-5 text-gray-300">Cargando usuarios...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500 font-semibold mt-5">{error}</p>;
  }

  return (
    <div className="container mx-auto px-4 py-10 bg-gray-900 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-center text-white mb-6">Lista de Usuarios</h1>

      {/* Contenedor principal para las búsquedas */}
<div className="p-4 bg-gray-900 rounded-lg shadow-lg mb-6">
  {/* Campo de búsqueda por email */}
  <div className="mb-4">
    <label className="block text-gray-300 mb-1">Email:</label>
    <div className="flex items-center">
      <input
        type="text"
        placeholder="Buscar por email"
        className="flex-grow p-2 border border-gray-700 rounded-lg bg-gray-800 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600 transition duration-200"
        value={emailSearch}
        onChange={(e) => setEmailSearch(e.target.value)}
      />
      <button
        onClick={handleSearchByEmail}
        className="ml-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
      >
        Buscar
      </button>
    </div>
  </div>

  {/* Campo de búsqueda por número de usuario */}
  <div className="mb-4">
    <label className="block text-gray-300 mb-1">Número de usuario:</label>
    <div className="flex items-center">
      <input
        type="text"
        placeholder="Buscar por número"
        className="flex-grow p-2 border border-gray-700 rounded-lg bg-gray-800 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600 transition duration-200"
        value={userNumberSearch}
        onChange={(e) => setUserNumberSearch(e.target.value)}
      />
      <button
        onClick={handleSearchByUserNumber}
        className="ml-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
      >
        Buscar
      </button>
    </div>
  </div>

  {/* Campo para obtener usuarios por tipo */}
  <div className="mb-4">
    <label className="block text-gray-300 mb-1">Tipo de usuario:</label>
    <div className="flex items-center">
      <input
        type="number"
        placeholder="ID tipo de usuario"
        className="flex-grow p-2 border border-gray-700 rounded-lg bg-gray-800 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600 transition duration-200"
        value={userTypeId}
        onChange={(e) => setUserTypeId(e.target.value)}
      />
      <button
        onClick={handleGetUsersByUserType}
        className="ml-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
      >
        Obtener
      </button>
    </div>
  </div>

  {/* Opciones de ordenación */}
  <div className="mb-4 flex items-center">
    <label className="text-gray-300 mr-2">Ordenar por:</label>
    <select
      className="p-1 border border-gray-700 rounded-lg bg-gray-800 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600 transition duration-200"
      onChange={(e) => setSortOrder(e.target.value)}
      value={sortOrder}
    >
      <option value="asc">Email Ascendente</option>
      <option value="desc">Email Descendente</option>
    </select>
    <button
      className="ml-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition duration-200"
      onClick={handleShowMore}
    >
      Mostrar más
    </button>
  </div>
</div>

{/* Tabla de usuarios */}
<table className="min-w-full bg-gray-800 border border-gray-700 rounded-lg shadow-md">
  <thead className="bg-gray-700">
    <tr>
      <th className="border-b border-gray-600 px-4 py-3 text-left text-gray-300">ID</th>
      <th className="border-b border-gray-600 px-4 py-3 text-left text-gray-300">Email</th>
      <th className="border-b border-gray-600 px-4 py-3 text-left text-gray-300">Nombre de Usuario</th>
      <th className="border-b border-gray-600 px-4 py-3 text-left text-gray-300">Número de Usuario</th>
      <th className="border-b border-gray-600 px-4 py-3 text-left text-gray-300">Acciones</th>
    </tr>
  </thead>
  <tbody>
    {filteredUsers.slice(0, visibleUsers).map((user) => (
      <tr key={user.id} className="hover:bg-gray-600 transition duration-200">
        <td className="border-b border-gray-600 px-4 py-3 text-gray-200">{user.id}</td>
        <td className="border-b border-gray-600 px-4 py-3 text-gray-200">{user.email}</td>
        <td className="border-b border-gray-600 px-4 py-3 text-gray-200">{user.username}</td>
        <td className="border-b border-gray-600 px-4 py-3 text-gray-200">{user.user_number}</td>
        <td className="border-b border-gray-600 px-4 py-3">
          <button
            onClick={() => setEditUser(user)}
            className="bg-yellow-500 text-white px-3 py-1 rounded-lg hover:bg-yellow-600 transition duration-200"
          >
            Editar
          </button>
          <button
            onClick={() => handleDeleteUser(user.id)}
            className="ml-2 bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition duration-200"
          >
            Eliminar
          </button>
        </td>
      </tr>
    ))}
  </tbody>
</table>

       {/* Formulario para editar usuario */}
    {editUser && (
      <div className="mt-8 p-4 bg-gray-700 rounded-lg shadow-lg">
        <h2 className="text-lg font-bold text-white mb-4">Editar Usuario</h2>
        <div>
          <label className="text-gray-300">ID Tipo de Usuario:</label>
          <input
            type="number"
            className="w-full p-2 mb-4 border border-gray-600 rounded-lg bg-gray-800 text-gray-200"
            value={editUser.user_type_id}
            onChange={(e) => setEditUser({ ...editUser, user_type_id: e.target.value })}
          />
          <label className="text-gray-300">Email:</label>
          <input
            type="email"
            className="w-full p-2 mb-4 border border-gray-600 rounded-lg bg-gray-800 text-gray-200"
            value={editUser.email}
            onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
          />
          <label className="text-gray-300">Nombre de Usuario:</label>
          <input
            type="text"
            className="w-full p-2 mb-4 border border-gray-600 rounded-lg bg-gray-800 text-gray-200"
            value={editUser.username}
            onChange={(e) => setEditUser({ ...editUser, username: e.target.value })}
          />
          <label className="text-gray-300">Número de Usuario:</label>
          <input
            type="text"
            className="w-full p-2 mb-4 border border-gray-600 rounded-lg bg-gray-800 text-gray-200"
            value={editUser.user_number}
            onChange={(e) => setEditUser({ ...editUser, user_number: e.target.value })}
          />
          <label className="text-gray-300">Contraseña:</label>
          <input
            type="password"
            className="w-full p-2 mb-4 border border-gray-600 rounded-lg bg-gray-800 text-gray-200"
            value={editUser.password}
            onChange={(e) => setEditUser({ ...editUser, password: e.target.value })}
          />
          <button
            onClick={() => handleUpdateUser(editUser.id)}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition duration-200"
          >
            Guardar Cambios
          </button>
          <button
            onClick={() => setEditUser(null)}
            className="ml-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition duration-200"
          >
            Cancelar
          </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
