# MMC - Materials Monitoring and Control System

## Repository Description

This repository contains the frontend of the Materials Monitoring and Control System (MMC). The application is built with React and uses Vite as the build tool. It serves as the user interface to interact with the system, allowing users to manage and monitor materials and projects through an intuitive and efficient experience.

## Project Description

The Materials Monitoring and Control System (MMC) is a broader project composed of this frontend application and another component, called "api-monitoring-control-mts", which handles CRUD (Create, Read, Update, Delete) operations for materials and projects. Together, these two repositories form a complete application for resource management and project tracking, providing an easy-to-use interface and a robust backend infrastructure.

Repository link: ["api-monitoring-control-mts"](https://github.com/GlzLXochitl/api-monitoring-control-mts.git)

## Dependencies

The project uses the following main dependencies:

- `react`: Main library for building the user interface.
- `react-router-dom`: For navigation and routing in the application.
- `axios`: For making HTTP requests.
- `chart.js`: For data visualization through charts.
- `socket.io-client`: For real-time communication.
- `tailwindcss`: For design and styling.
- `@fortawesome/react-fontawesome`: For icons.
- `vite`: For fast development and bundling.

## Installation

Follow these steps to set up and run the project in your local environment:

1. Clone the repository:

   ```sh
   git clone https://github.com/pacodelarosajza/MMC-SYSTEM-PX.git
   cd MMC-SYSTEM-PX
   ```

2. Install the project dependencies:

   ```sh
   npm install
   ```

3. Set up environment variables:

   - Create a `.env` file in the root directory of the project.
   - Add the `VITE_API_IP_ADDRESS` variable to the `.env` file with the IP address of the API server.

   ```env
   VITE_API_IP_ADDRESS=your_api_server_ip_address
   ```

   - Also, ensure that the backend is configured to recognize the frontend by setting the `CLIENT_IP_ADDRESS` environment variable in the backend's configuration.

4. Start the server in development mode:

   ```sh
   npm run dev
   ```

   This will start the server using `nodemon`, which will automatically restart the application when file changes are detected.

## Usage

Once the server is running, you can access the application at `http://localhost:5173` (or any port you have configured).
