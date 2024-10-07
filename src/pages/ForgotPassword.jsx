// ForgotPassword.jsx
import React, { useState } from "react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(null);

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    try {
      // Primero, obtenemos al usuario por email
      const userResponse = await fetch(`http://10.12.6.181:3001/api/users/${email}`);
      
      if (userResponse.ok) {
        const user = await userResponse.json();

        // Ahora hacemos un PATCH para restablecer la contraseña
        const resetResponse = await fetch(`http://10.12.6.181:3001/api/users/${user.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ /* Aquí puedes incluir el nuevo password u otros datos necesarios */ }),
        });

        if (resetResponse.ok) {
          setMessage("Se ha restablecido la contraseña exitosamente.");
        } else {
          setMessage("Error al restablecer la contraseña.");
        }
      } else {
        setMessage("No se encontró un usuario con ese correo electrónico.");
      }
    } catch (err) {
      setMessage("Error del servidor. Intenta nuevamente más tarde.");
    }
  };

  return (
    <div className="forgot-password-container">
      <h2>Olvidé mi Contraseña</h2>
      {message && <p>{message}</p>}
      <form onSubmit={handleForgotPassword}>
        <div>
          <label htmlFor="email">Correo electrónico</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button type="submit">Restablecer Contraseña</button>
      </form>
    </div>
  );
};

export default ForgotPassword;
