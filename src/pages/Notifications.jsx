import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { FaBell, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const NotificationsComponent = () => {
    const [notifications, setNotifications] = useState([]);
    const navigate = useNavigate();
    const previousItemsRef = useRef([]);
    const previousAssembliesRef = useRef([]);
    const previousProjectsRef = useRef([]); // Referencia para almacenar los proyectos previos

    const apiIpAddress = import.meta.env.VITE_API_IP_ADDRESS;


    const fetchProjects = async () => {
        try {
            const response = await axios.get(`${apiIpAddress}/api/getProjects`);
            const projects = response.data;
            const newNotifications = [];

            // Comparar los proyectos anteriores con los nuevos
            projects.forEach((project) => {
                const prevProject = previousProjectsRef.current.find((prev) => prev.id === project.id);
                if (prevProject) {
                    const changedFields = [];

                    // Compare relevant project fields
                    if (prevProject.identification_number !== project.identification_number) {
                        changedFields.push(`Identification number updated: ${project.identification_number}`);
                    }
                    if (prevProject.delivery_date !== project.delivery_date) {
                        changedFields.push(`Delivery date updated: ${project.delivery_date}`);
                    }
                    if (prevProject.completed !== project.completed) {
                        changedFields.push(`Status updated: ${project.completed === 1 ? 'Completed' : 'Not completed'}`);
                    }
                    if (prevProject.cost_material !== project.cost_material) {
                        changedFields.push(`Material cost updated: ${project.cost_material}`);
                    }
                    if (prevProject.description !== project.description) {
                        changedFields.push(`Description updated: ${project.description}`);
                    }
                    if (prevProject.created_at !== project.created_at) {
                        changedFields.push(`Creation date updated: ${project.created_at}`);
                    }
                    if (prevProject.updated_at !== project.updated_at) {
                        changedFields.push(`Last update date: ${project.updated_at}`);
                    }

                    // If there are changes, add a notification
                    if (changedFields.length > 0) {
                        newNotifications.push({
                            type: project.completed === 1 ? "success" : "warning",
                            message: `Changes in project ID: ${project.id} (${project.identification_number})`,
                            details: {
                                id: project.id,
                                changes: changedFields.join(", "),
                                deliveryDate: project.delivery_date,
                                cost: project.cost_material,
                            },
                        });
                    }
                }
            });

            if (newNotifications.length > 0) {
                setNotifications((prev) => [...newNotifications, ...prev]);
            }

            // Actualizar los proyectos previos
            previousProjectsRef.current = projects;
        } catch (error) {
            console.error("Error al obtener proyectos:", error);
        }
    };

    useEffect(() => {
        const intervalId = setInterval(() => {
            fetchItems();
            fetchAssemblyByDeliveryDate();
            fetchProjects(); // Llamada al endpoint de proyectos
        }, 10000); // Cada 10 segundos

        return () => clearInterval(intervalId);
    }, []);


    // Función genérica para comparar campos y agregar notificaciones
    const compareAndNotify = (prevData, newData, fields, type, messageGenerator) => {
        const notifications = [];

        newData.forEach((item) => {
            const prevItem = prevData.current.find((prev) => prev.id === item.id);
            if (prevItem) {
                const changedFields = [];

                fields.forEach((field) => {
                    if (prevItem[field] !== item[field]) {
                        changedFields.push(messageGenerator(field, item[field]));
                    }
                });

                if (changedFields.length > 0) {
                    notifications.push({
                        type,
                        message: `Cambios en el ${type === "material" ? "material" : "ensamblaje"} ID: ${item.id} (${item.name || item.project?.identification_number})`,
                        details: {
                            id: item.id,
                            changes: changedFields.join(", "),
                        },
                    });
                }
            }
        });

        if (notifications.length > 0) {
            setNotifications((prev) => [...notifications, ...prev]);
        }
    };

    // Función para obtener materiales
    const fetchItems = async () => {
        try {
            const response = await axios.get(`${apiIpAddress}/api/getItems`);
            const items = response.data;

            compareAndNotify(previousItemsRef, items, ['in_subassembly', 'arrived_date', 'description', 'price', 'supplier', 'number_material'], "material", (field, value) => {
                switch (field) {
                    case 'in_subassembly':
                        return `Reception status updated: ${value === 1 ? 'Material received' : 'Material not received'}`;
                    case 'arrived_date':
                        return `Arrival date updated: ${value || 'Not available'}`;
                    case 'description':
                        return `Material description: ${value}`;
                    case 'price':
                        return `Price updated: ${value}`;
                    case 'supplier':
                        return `Supplier updated: ${value}`;
                    case 'number_material':
                        return `Material number updated: ${value}`;
                    default:
                        return '';
                }
            });


            previousItemsRef.current = items;
        } catch (error) {
            console.error("Error al obtener materiales:", error);
        }
    };

    // Función para obtener ensamblajes por fecha de entrega
    const fetchAssemblyByDeliveryDate = async () => {
        try {
            const response = await axios.get(`${apiIpAddress}/api/getAssemblyByDeliveryDate`);
            const assemblies = response.data;

            compareAndNotify(previousAssembliesRef, assemblies, ['delivery_date', 'completed'], "ensamblaje", (field, value) => {
                switch (field) {
                    case 'delivery_date':
                        return `Fecha de entrega actualizada: ${value}`;
                    case 'completed':
                        return `Estado actualizado: ${value === 1 ? 'Complete' : 'Not complete'}`;
                    default:
                        return '';
                }
            });

            previousAssembliesRef.current = assemblies;
        } catch (error) {
            console.error("Error al obtener ensamblajes:", error);
        }
    };

    useEffect(() => {
        const intervalId = setInterval(() => {
            fetchItems();
            fetchAssemblyByDeliveryDate();
        }, 10000);

        return () => clearInterval(intervalId);
    }, []);



    const closeNotification = (id) => {
        setNotifications((prev) => prev.filter(notification => notification.details.id !== id));
    };

    return (
        <div className="notification-container">
            <div className="flex justify-center items-center text-sm text-lightWhiteLetter font-bold mb-4 mt-6">
                <FaBell className="mr-2" />
                <h2>Notifications</h2>
            </div>
            <ul className="space-y-1">
                {notifications.map((notification, index) => (
                    <li
                        key={index}
                        className={`p-2 rounded text-xs text-left notifiGrayLetter ${notification.type === "material" ? "border-l-4 border-blue-800" : "border-l-4 border-yellow-800"}`}
                    >
                        <div className="flex justify-between items-center">
                            <span className="font-medium">
                                {notification.type === "project" && <span className="text-blue-500 font-bold">Proyecto Completed</span>}
                                {notification.type === "Item" && <span className="text-blue-500 font-bold">Item Update</span>}
                                {notification.type === "Assambly" && <span className="text-yellow-500 font-bold">Assambly Update</span>}
                                <br />
                                {notification.message}
                                <br />
                                <span className="text-xs text-gray-400">{notification.details.changes}</span>
                            </span>
                            <button
                                className="text-gray-400 hover:text-gray-500 ml-2"
                                onClick={() => closeNotification(notification.details.id)}
                            >
                                <FaTimes />
                            </button>
                        </div>

                    </li>
                ))}
            </ul>
        </div>
    );
};

export default NotificationsComponent;
