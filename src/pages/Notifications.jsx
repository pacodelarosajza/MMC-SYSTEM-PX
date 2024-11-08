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
    const notifiedDeliveries = useRef(new Set()); // Guardar IDs de proyectos notificados

    const notifiedAssemblies = useRef(new Set()); // Aquí debe estar el useRef



    const apiIpAddress = import.meta.env.VITE_API_IP_ADDRESS;

    const fetchProjects = async () => {
        try {
            const response = await axios.get(`${apiIpAddress}/api/getProjects`);
            const projects = response.data;
            const newNotifications = [];
            const today = new Date();
            const daysBeforeDelivery = 7; // Número de días para notificar antes de la entrega

            // Comparar los proyectos anteriores con los nuevos
            projects.forEach((project) => {
                const prevProject = previousProjectsRef.current.find((prev) => prev.id === project.id);

                // Verificar si la fecha de entrega está cercana y si no se ha notificado aún
                const deliveryDate = new Date(project.delivery_date);
                const timeDiff = deliveryDate - today;
                const daysUntilDelivery = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
                if (daysUntilDelivery <= daysBeforeDelivery && !notifiedDeliveries.current.has(project.id)) {
                    // Add notification for upcoming delivery
                    newNotifications.push({
                        type: "info",
                        message: (
                            <>
                                <div className="p-2 rounded-lg bg-green-800 bg-opacity-60 border border-green-500 text-white shadow-sm hover:shadow-md transition-all duration-300 ease-in-out relative">
                                    <strong className="block text-xs font-semibold text-green-400">
                                        🚚 Delivery Coming
                                    </strong>
                                    <div className="mt-1 text-xs text-gray-300">
                                        <span className="font-semibold">ID:</span>
                                        <span className="text-green-300"> #{project.identification_number}</span>
                                    </div>
                                    <div className="mt-1 text-xs text-gray-300">
                                        <span className="font-semibold">Date:</span>
                                        <span className="text-green-300">{new Date(project.delivery_date).toLocaleDateString()}</span>
                                    </div>
                                    <div className="mt-1 text-xs font-medium text-green-300">
                                        ⏳ {daysUntilDelivery} day{daysUntilDelivery !== 1 ? 's' : ''} left!
                                    </div>

                                    {/* Borde verde estático */}
                                    <div className="absolute inset-0 border-2 border-green-500 rounded-lg opacity-30"></div>
                                </div>


                            </>
                        ),
                        details: {
                            id: project.id,
                            deliveryDate: project.delivery_date,
                        },
                    });
                    // Mark the project as notified
                    notifiedDeliveries.current.add(project.id);
                }


                // Verificar cambios en los datos del proyecto
                if (prevProject) {
                    const changedFields = [];
                    const fieldsToCompare = [
                        { field: "identification_number", message: "Identification number updated" },
                        { field: "delivery_date", message: "Delivery date updated" },
                        { field: "completed", message: `Status updated: ${project.completed === 1 ? 'Completed' : 'Not completed'}` },
                        { field: "cost_material", message: "Material cost updated" },
                        { field: "description", message: "Description updated" },
                        { field: "created_at", message: "Creation date updated" },
                        { field: "updated_at", message: "Last update date" },
                    ];

                    // Detectar cambios en los campos del proyecto
                    fieldsToCompare.forEach(({ field, message }) => {
                        if (prevProject[field] !== project[field]) {
                            changedFields.push(`${message}: ${project[field]}`);
                        }
                    });

                    // Si hay cambios, agregar una notificación
                    if (changedFields.length > 0) {
                        const notificationType = project.completed === 1 ? "success" : "warning";
                        const statusText = project.completed === 1 ? "Completed" : "Not Completed";

                        newNotifications.push({
                            type: notificationType,
                            message: (
                                <div className="p-2 rounded-lg bg-green-800 bg-opacity-60 border border-green-500 text-white shadow-sm hover:shadow-md transition-all duration-300 ease-in-out relative">
                                    <strong className="block text-xs font-semibold text-green-400">
                                        <p>Proyect</p>{statusText} 🚚
                                    </strong>
                                    <div className="mt-1 text-xs text-gray-300">
                                        <span className="font-semibold">#</span>
                                        <span className="text-green-300"> ({project.identification_number})</span>
                                    </div>
                                    <div className="mt-1 text-xs text-gray-300">
                                        <span className="font-semibold">Changes:</span>
                                        <span className="text-green-300"> {changedFields.join(", ")}</span>
                                    </div>
                                </div>
                            ),
                            details: {
                                id: project.id,
                                changes: changedFields.join(", "),
                            },
                        });
                    }

                }
            });

            // Actualizar notificaciones si hay nuevas
            if (newNotifications.length > 0) {
                setNotifications((prev) => [...newNotifications, ...prev]);
            }

            // Actualizar los proyectos previos
            previousProjectsRef.current = projects;
        } catch (error) {
            console.error("Error al obtener proyectos:", error.message || error);
        }
    };

    fetchProjects(); // Llamar a la función al montar el componente


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
                    message: (
                        <div className={`p-3 rounded-lg border ${type === "item" ? "bg-blue-800 border-blue-600 text-blue-200" : "bg-green-800 border-green-600 text-green-200"}`}>
                            {/* Título Sección */}
                            <strong className="block text-sm font-semibold">
                                Changes in the {type === "item" ? "Item" : "Assembly"}
                            </strong>

                            {/* ID y Nombre Sección */}
                            <div className="text-xs font-medium text-gray-300">
                                <span className="ml-2 italic">({item.name || item.identification_number || item.number_material})</span>

                            </div>

                            {/* Cambios Sección */}
                            <p className={`mt-1 text-xs ${type === "item" ? "lightWhiteLetter" : "lightWhiteLetter"} italic`}>
                                {changedFields.join(", ")}
                            </p>
                        </div>
                    ),
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

        // Comparar y notificar cambios de los materiales
        compareAndNotify(previousItemsRef, items, ['in_subassembly', 'arrived_date', 'description', 'price', 'supplier', 'number_material'], "item", (field, value) => {
            switch (field) {
                case 'in_subassembly':
                    return `Reception status updated: ${value === 1 ? 'Material received' : 'Material not received'}`;
                case 'arrived_date':
                    return `Arrival date updated: ${value || 'Not available'}`;
                case 'description':
                    return `Material description updated: ${value}`;
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

        // Actualizar los materiales previos
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

            const now = new Date();
            const thresholdDays = 3; // Definir el umbral de proximidad (por ejemplo, 3 días)

            assemblies.forEach((assembly) => {
                const deliveryDate = new Date(assembly.delivery_date);
                const timeDiff = deliveryDate - now;
                const daysRemaining = Math.floor(timeDiff / (1000 * 3600 * 24)); // Calcular los días restantes

                if (daysRemaining <= thresholdDays && daysRemaining > 0 && !notifiedAssemblies.current.has(assembly.id)) {
                    // Add notification only if not previously notified
                    setNotifications((prev) => [
                        ...prev,
                        {
                            type: "Assembly",
                            message: (
                                <>
                                    <span className="text-blue-500 text-sm font-medium">🚧 Assembly Deadline Approaching</span>
                                    <div className="mt-1 text-xs lightWhiteLetter">
                                        <span className="font-semibold">Assembly ID:</span> <span className="text-green-400">{assembly.identification_number}</span>
                                    </div>
                                    <div className="mt-1 text-xs lightWhiteLetter">
                                        <span className="font-semibold">Remaining Days:</span> <span className="text-green-400">{daysRemaining} {daysRemaining === 1 ? 'day' : 'days'}</span>
                                    </div>
                                    <div className="mt-1 text-xs lightWhiteLetter">
                                        <span className="font-semibold">Delivery Date:</span> <span className="text-green-400">{new Date(assembly.delivery_date).toLocaleDateString()}</span>
                                    </div>
                                </>
                            ),
                            details: {
                                id: assembly.id,
                                changes: `Delivery Date: ${assembly.delivery_date}`,
                            },
                        },
                    ]);
                    // Mark as notified
                    notifiedAssemblies.current.add(assembly.id);
                }
            });

            // Comparar y notificar cambios
            compareAndNotify(previousAssembliesRef, assemblies, ['delivery_date', 'completed'], "ensamblaje", (field, value) => {
                switch (field) {
                    case 'delivery_date':
                        return `Fecha de entrega actualizada: ${value}`;
                    case 'completed':
                        return `Status : ${value === 1 ? 'Complete' : 'Not complete'}`;
                    default:
                        return '';
                }
            });

            // Actualizar los ensamblajes previos
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
                        className={`p-2 rounded text-xs text-left notifiGrayLetter ${notification.type === "material" ? "border-l-4 border-blue-800" : "border-l-4 border-green-400"}`}
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
