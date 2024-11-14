import React, { useEffect, useState } from "react";

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visibleUsers, setVisibleUsers] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [editUser, setEditUser] = useState(null);
  const [message, setMessage] = useState('');



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

  // Mapeo de tipos de usuario a sus valores numéricos
  const userTypeMapping = {
    admin: 1,
    operational: 2,
    viewer: 3
  };

  // Función que convierte un término de búsqueda parcial a un ID de tipo de usuario
  const getUserTypeId = (term) => {
    const lowerTerm = term.toLowerCase();
    // Encuentra un tipo de usuario cuyo nombre contenga el término de búsqueda
    const matchedType = Object.keys(userTypeMapping).find((type) => type.includes(lowerTerm));
    return matchedType ? userTypeMapping[matchedType] : term;
  };

  // Filtrado de usuarios en función del término de búsqueda
  const filteredUsers = users.filter((user) => {
    const search = searchTerm.toLowerCase();
    const userTypeId = getUserTypeId(search);

    return (
      user.email.toLowerCase().includes(search) ||
      user.user_number.toLowerCase().includes(search) ||
      user.user_type_id === Number(userTypeId)
    );
  });


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




  const handleUpdateUser = async (id) => {
    try {
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

      setMessage('Usuario actualizado correctamente.'); // Mensaje de éxito
      setEditUser(null); // Cierra el formulario de edición
    } catch (error) {
      console.error("Error en la actualización:", error);
      setMessage('Error al actualizar el usuario.'); // Mensaje de error
    }
  };



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

    <div className=" ">
      <br></br>
      <h2 className="text-4xl text-center font-extrabold text-gradient bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500 mb-8">
        Search a User
      </h2>

      {/* Campo de búsqueda general */}
<div className="relative mb-6">
  <label className="block text-gray-300 mb-2 text-lg font-semibold">
    Buscar Usuarios
  </label>
  <div className="relative flex items-center">
    <input
      type="text"
      placeholder="Buscar por correo electrónico, número de usuario o tipo (ej. 'admin')"
      className="w-full p-4 pl-12 pr-4 border border-gray-700 rounded-lg bg-gray-900 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 transition duration-300 ease-in-out"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
    <span className="absolute left-4 text-gray-400">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zm-5.707 8.293a1 1 0 011.414 0l1.586 1.586a7 7 0 109.192 0l1.586-1.586a1 1 0 011.414 1.414l-1.586 1.586a7 7 0 11-9.192 0l-1.586-1.586a1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
    </span>
  </div>
</div>


      {/* Tabla de usuarios */}
      <table className="min-w-full bg-gray-900 border border-gray-800 rounded-lg shadow-lg">
        <thead className="bg-gray-800">
          <tr>
            <th className="border-b border-gray-700 px-6 py-4 text-left text-gray-300 font-semibold text-sm uppercase tracking-wider">
              ID
            </th>
            <th className="border-b border-gray-700 px-6 py-4 text-left text-gray-300 font-semibold text-sm uppercase tracking-wider">
              Email
            </th>
            <th className="border-b border-gray-700 px-6 py-4 text-left text-gray-300 font-semibold text-sm uppercase tracking-wider">
              User Type
            </th>
            <th className="border-b border-gray-700 px-6 py-4 text-left text-gray-300 font-semibold text-sm uppercase tracking-wider">
              User Number
            </th>
            <th className="border-b border-gray-700 px-6 py-4 text-left text-gray-300 font-semibold text-sm uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.slice(0, visibleUsers).map((user) => (
            <tr
              key={user.id}
              className="hover:bg-gray-700 transition duration-200 ease-in-out"
            >
              <td className="border-b border-gray-700 px-6 py-4 text-gray-200 text-sm">
                {user.id}
              </td>
              <td className="border-b border-gray-700 px-6 py-4 text-gray-200 text-sm">
                {user.email}
              </td>
              <td className="border-b border-gray-700 px-6 py-4 text-gray-200 text-sm">
                {user.user_type_id === 1
                  ? "Admin"
                  : user.user_type_id === 2
                    ? "Operational"
                    : user.user_type_id === 3
                      ? "Viewer"
                      : "Desconocido"}
              </td>
              <td className="border-b border-gray-700 px-6 py-4 text-gray-200 text-sm">
                {user.user_number}
              </td>
              <td className="border-b border-gray-700 px-6 py-4 flex space-x-2">
                <button
                  onClick={() => setEditUser(user)}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:from-blue-600 hover:to-blue-700 transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteUser(user.id)}
                  className="bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:from-red-600 hover:to-red-700 transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-opacity-50"
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
        <div className="mt-8 p-6 bg-gray-900 border border-gray-800 rounded-lg shadow-lg">
          {/* Mensaje de éxito o error */}
          {message && (
            <div className={`mt-4 p-3 rounded-lg ${message.includes('Error') ? 'bg-red-600' : 'bg-green-600'} text-white`}>
              {message}
            </div>
          )}

          <h2 className="text-2xl font-extrabold text-gray-300 mb-4">Edit User</h2>
          <div>
            {/* Dropdown para seleccionar el tipo de usuario */}
            <label className="text-gray-300 mb-2">User Type:</label>
            <select
              className="w-full p-3 mb-4 border border-gray-700 rounded-lg bg-gray-800 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600 transition duration-200"
              value={editUser.user_type_id}
              onChange={(e) =>
                setEditUser({ ...editUser, user_type_id: e.target.value })
              }
            >
              <option value="1">Admin</option>
              <option value="2">Operational</option>
              <option value="3">Viewer</option>
            </select>

            <label className="text-gray-300 mb-2">Email:</label>
            <input
              type="email"
              className="w-full p-3 mb-4 border border-gray-700 rounded-lg bg-gray-800 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 transition duration-200"
              placeholder="Enter user email"
              value={editUser.email}
              onChange={(e) =>
                setEditUser({ ...editUser, email: e.target.value })
              }
            />

            <label className="text-gray-300 mb-2">User Number:</label>
            <input
              type="text"
              className="w-full p-3 mb-4 border border-gray-700 rounded-lg bg-gray-800 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 transition duration-200"
              placeholder="Enter user number"
              value={editUser.user_number}
              onChange={(e) =>
                setEditUser({ ...editUser, user_number: e.target.value })
              }
            />

            <label className="text-gray-300 mb-2">Password:</label>
            <input
              type="password"
              className="w-full p-3 mb-4 border border-gray-700 rounded-lg bg-gray-800 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 transition duration-200"
              placeholder="Enter password"
              value={editUser.password}
              onChange={(e) =>
                setEditUser({ ...editUser, password: e.target.value })
              }
            />

            <div className="flex space-x-2">
              <button
                onClick={() => handleUpdateUser(editUser.id)}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:from-blue-600 hover:to-blue-700 transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50"
              >
                Save Changes
              </button>

              <button
                onClick={() => setEditUser(null)}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:from-red-600 hover:to-red-700 transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-opacity-50"
              >
                Cancel
              </button>

            </div>
          </div>
        </div>

      )}
    </div>
  );
};

export default UsersPage;
