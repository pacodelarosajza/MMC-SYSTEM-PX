


import { useEffect, useState } from 'react';
import io from 'socket.io-client';
const apiIpAddress = import.meta.env.VITE_API_IP_ADDRESS;


// Conectar con el servidor de Socket.IO
const socket = io(`${apiIpAddress}`);  // Asegúrate de usar la URL correcta de tu servidor

function App() {
  const [notification, setNotification] = useState('');

  useEffect(() => {
    // Escuchar el evento 'dataUpdated' desde el servidor
    socket.on('dataUpdated', (data) => {
      setNotification(data.message);  // Actualizar el estado con el mensaje de la notificación
    });

    // Limpiar el listener cuando el componente se desmonte
    return () => {
      socket.off('dataUpdated');
    };
  }, []);

  return (
    <div>
      <h1>Notificaciones</h1>
      {notification && <div className="notification">{notification}</div>}
      {/* Aquí puedes añadir otros componentes, botones, etc. */}
    </div>
  );
}

export default App;
