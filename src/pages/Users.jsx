import React, { useEffect, useState } from "react";

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visibleUsers, setVisibleUsers] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [editUser, setEditUser] = useState(null);
  const [userTypeId, setUserTypeId] = useState("");
  const [emailSearch, setEmailSearch] = useState("");
  const [userNumberSearch, setUserNumberSearch] = useState("");
  const [showSearchMenu, setShowSearchMenu] = useState(false);

  const apiIpAddress = import.meta.env.VITE_API_IP_ADDRESS;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${apiIpAddress}/api/getUsers`);
        if (!response.ok) {
          throw new Error("Error fetching users");
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
        method: "PATCH",
      });
      setUsers(users.filter((user) => user.id !== id));
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleSearchByEmail = async () => {
    if (emailSearch) {
      try {
        const response = await fetch(
          `${apiIpAddress}/api/users/${emailSearch}`
        );
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
        const response = await fetch(
          `${apiIpAddress}/api/users/userNum/${userNumberSearch}`
        );
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

      const response = await fetch(`${apiIpAddress}/api/users/${id}`, {
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
        const response = await fetch(
          `${apiIpAddress}/getUsersByUserType/${userTypeId}`
        );
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
    .filter(
      (user) =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.user_number.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortOrder === "asc") {
        return a.email.localeCompare(b.email);
      } else {
        return b.email.localeCompare(a.email);
      }
    });

  if (loading) {
    return (
      <p className="text-center text-lg font-semibold mt-5 text-gray-300">
        Cargando usuarios...
      </p>
    );
  }

  if (error) {
    return (
      <p className="text-center text-red-500 font-semibold mt-5">{error}</p>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 bg-gray-900 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-center text-white mb-6">
        Users list
      </h1>

      {/* Contenedor principal para las búsquedas */}
      <div className="p-4 bg-gray-900 rounded-lg shadow-lg mb-6">
        {/* Campo de búsqueda por email */}
        <div className="mb-4">
          <label className="block text-gray-300 mb-1">Email:</label>
          <div className="flex items-center">
            <input
              type="text"
              placeholder="Search for Email"
              className="flex-grow p-2 border border-gray-700 rounded-lg bg-gray-800 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600 transition duration-200"
              value={emailSearch}
              onChange={(e) => setEmailSearch(e.target.value)}
            />
            <button
              onClick={handleSearchByEmail}
              className="ml-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
            >
              Search
            </button>
          </div>
        </div>

        {/* Campo de búsqueda por número de usuario */}
        <div className="mb-4">
          <label className="block text-gray-300 mb-1">User Number:</label>
          <div className="flex items-center">
            <input
              type="text"
              placeholder="Search for User Number"
              className="flex-grow p-2 border border-gray-700 rounded-lg bg-gray-800 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600 transition duration-200"
              value={userNumberSearch}
              onChange={(e) => setUserNumberSearch(e.target.value)}
            />
            <button
              onClick={handleSearchByUserNumber}
              className="ml-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
            >
              Search
            </button>
          </div>
        </div>

        {/* Campo para obtener usuarios por tipo */}
        <div className="mb-4">
          <label className="block text-gray-300 mb-1">Users type:</label>
          <div className="flex items-center">
            <input
              type="number"
              placeholder="User For Type Admin, Operational, Viewer"
              className="flex-grow p-2 border border-gray-700 rounded-lg bg-gray-800 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600 transition duration-200"
              value={userTypeId}
              onChange={(e) => setUserTypeId(e.target.value)}
            />
            <button
              onClick={handleGetUsersByUserType}
              className="ml-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
            >
              Obtain
            </button>
          </div>
        </div>

        {/* Opciones de ordenación */}
        <div className="mb-4 flex items-center">
          <label className="text-gray-300 mr-2">Order for:</label>
          <select
            className="p-1 border border-gray-700 rounded-lg bg-gray-800 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600 transition duration-200"
            onChange={(e) => setSortOrder(e.target.value)}
            value={sortOrder}
          >
            <option value="asc">Ascending Email</option>
            <option value="desc">Descending Email </option>
          </select>
          <button
            className="ml-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition duration-200"
            onClick={handleShowMore}
          >
            Show More
          </button>
        </div>
      </div>

      {/* Tabla de usuarios */}
      <table className="min-w-full bg-gray-800 border border-gray-700 rounded-lg shadow-md">
        <thead className="bg-gray-700">
          <tr>
            <th className="border-b border-gray-600 px-4 py-3 text-left text-gray-300">
              ID
            </th>
            <th className="border-b border-gray-600 px-4 py-3 text-left text-gray-300">
              Email
            </th>
            <th className="border-b border-gray-600 px-4 py-3 text-left text-gray-300">
              User Type
            </th>
            <th className="border-b border-gray-600 px-4 py-3 text-left text-gray-300">
              User Number
            </th>
            <th className="border-b border-gray-600 px-4 py-3 text-left text-gray-300">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.slice(0, visibleUsers).map((user) => (
            <tr
              key={user.id}
              className="hover:bg-gray-600 transition duration-200"
            >
              <td className="border-b border-gray-600 px-4 py-3 text-gray-200">
                {user.id}
              </td>
              <td className="border-b border-gray-600 px-4 py-3 text-gray-200">
                {user.email}
              </td>
              <td className="border-b border-gray-600 px-4 py-3 text-gray-200">
                {user.user_type_id === 1
                  ? "Admin"
                  : user.user_type_id === 2
                  ? "Operational"
                  : user.user_type_id === 3
                  ? "Viewer"
                  : "Desconocido"}
              </td>

              <td className="border-b border-gray-600 px-4 py-3 text-gray-200">
                {user.user_number}
              </td>
              <td className="border-b border-gray-600 px-4 py-3">
                <button
                  onClick={() => setEditUser(user)}
                  className="bg-gradient-to-r from-green-500 to-green-400 text-white font-bold py-2 px-4 rounded-lg shadow-lg hover:from-green-600 hover:to-green-500 hover:shadow-xl transition-all duration-300 ease-in-out"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteUser(user.id)}
                  className="ml-2 bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition duration-200"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Formulario para editar usuario */}
      {editUser && (
        <div className="mt-8 p-4 bg-gray-700 rounded-lg shadow-lg">
          <h2 className="text-lg font-bold text-white mb-4">Edit User</h2>
          <div>
            {/* Dropdown para seleccionar el tipo de usuario */}
            <label className="text-gray-300">Tipo de Usuario:</label>
            <select
              className="w-full p-2 mb-4 border border-gray-600 rounded-lg bg-gray-800 text-gray-200"
              value={editUser.user_type_id}
              onChange={(e) =>
                setEditUser({ ...editUser, user_type_id: e.target.value })
              }
            >
              <option value="1">Admin</option>
              <option value="2">Operational</option>
              <option value="3">Viewer</option>
            </select>

            <label className="text-gray-300">Email:</label>
            <input
              type="email"
              className="w-full p-2 mb-4 border border-gray-600 rounded-lg bg-gray-800 text-gray-200"
              value={editUser.email}
              onChange={(e) =>
                setEditUser({ ...editUser, email: e.target.value })
              }
            />

            <label className="text-gray-300">Número de Usuario:</label>
            <input
              type="text"
              className="w-full p-2 mb-4 border border-gray-600 rounded-lg bg-gray-800 text-gray-200"
              value={editUser.user_number}
              onChange={(e) =>
                setEditUser({ ...editUser, user_number: e.target.value })
              }
            />

            <label className="text-gray-300">Password:</label>
            <input
              type="password"
              className="w-full p-2 mb-4 border border-gray-600 rounded-lg bg-gray-800 text-gray-200"
              value={editUser.password}
              onChange={(e) =>
                setEditUser({ ...editUser, password: e.target.value })
              }
            />

            <button
              onClick={() => handleUpdateUser(editUser.id)}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition duration-200"
            >
              Save Changes
            </button>

            <button
              onClick={() => setEditUser(null)}
              className="ml-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
