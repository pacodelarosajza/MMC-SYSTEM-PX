# React + Vite
# CMS - Credits management system

## Descripción del repositorio

Este repositorio contiene el frontend del Sistema de Monitorización y Control de Materiales (MMC). La aplicación está construida con React y utiliza Vite como herramienta de construcción. Sirve como la interfaz de usuario para interactuar con el sistema, permitiendo a los usuarios gestionar y monitorear materiales y proyectos a través de una experiencia intuitiva y eficiente.

## Descripción del proyecto 

El Sistema de Monitorización y Control de Materiales (MMC) es un proyecto que consta de dos componentes principales: una API con nombre de repositorio "api-monitoring-control-mts", que maneja las operaciones CRUD (Crear, Leer, Actualizar, Eliminar) para materiales y proyectos, y esta aplicación frontend que permite la interacción visual con el sistema. Juntos, estos dos repositorios forman una aplicación completa para la gestión de recursos y seguimiento de proyectos, con una interfaz que facilita el uso del sistema para los usuarios finales.

Repository link: ["api-monitoring-control-mts"](https://github.com/GlzLXochitl/api-monitoring-control-mts.git) 

## Dependencies

The project uses the following dependencies:

- `react`: Library for building user interfaces.
- `react-dom`: Package for working with the DOM in React.

## Installation

Follow these steps to set up and run the project in your local environment:

1. Clone the repository:

   ```sh
   git clone https://github.com/GlzLXochitl/react-monitoring-control-mts.git
   cd react-monitoring-control-mts
   ```

2. Installs the project dependencies:

   ```sh
   npm install
   ```

3. Create a `.env` file in the root directory of the project and add the following environment variables:

   ```sh
   REACT_APP_API_IP_ADDRESS=http://localhost:3001
   ```

   Replace the value of `REACT_APP_API_IP_ADDRESS` with the URL of the API server. This is the URL where the API server is running.


4. Start the server in development mode:

   ```sh
   npm run dev
   ```

   This will start the server using `nodemon`, which will automatically restart the application when changes to the files are detected.

## Use

Once the server is up and running, you can access the application at `http://localhost:5173` (or whatever port you have configured).

//react-monitoring-control-mts