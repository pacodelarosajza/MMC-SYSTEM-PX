import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { NotificationsProvider } from './pages/NotificationsContext';

ReactDOM.createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      {/* Envuelve App con NotificationsProvider */}
      <NotificationsProvider>
        <App />
      </NotificationsProvider>
    </BrowserRouter>
  </StrictMode>
);
