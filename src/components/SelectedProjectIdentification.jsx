import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSync } from "@fortawesome/free-solid-svg-icons";

const SelectedProjectIdentification = ({ id, onReload }) => {
  const [assemblies, setAssemblies] = useState([]);
  const [materials, setMaterials] = useState({});
  const [materialCounts, setMaterialCounts] = useState({});
  const apiIpAddress = import.meta.env.VITE_API_IP_ADDRESS;

  useEffect(() => {
    const fetchAssemblies = async () => {
      try {
        const response = await axios.get(`${apiIpAddress}/api/assembly/project/${id}`);
        setAssemblies(response.data);
      } catch (error) {
        console.error("Error fetching assemblies:", error);
      }
    };

    fetchAssemblies();
  }, [id, apiIpAddress]);

  useEffect(() => {
    const fetchMaterials = async (assemblyId) => {
      try {
        const response = await axios.get(`${apiIpAddress}/api/getItems/assembly/${assemblyId}`);
        const materials = response.data;
        const totalMaterials = materials.length;
        const inSubassemblyCount = materials.filter(material => material.in_subassembly === 1).length;
        const completionPercentage = totalMaterials > 0 ? (inSubassemblyCount / totalMaterials) * 100 : 0;
        setMaterials(prevMaterials => ({ ...prevMaterials, [assemblyId]: materials }));
        setMaterialCounts(prevCounts => ({ ...prevCounts, [assemblyId]: { total: totalMaterials, inSubassembly: inSubassemblyCount, completionPercentage } }));
      } catch (error) {
        console.error(`Error fetching materials for assembly ${assemblyId}:`, error);
      }
    };

    assemblies.forEach(assembly => {
      if (!materials[assembly.id]) {
        fetchMaterials(assembly.id);
      }
    });
  }, [assemblies, apiIpAddress, materials]);

  const sortedAssemblies = [...assemblies].sort((a, b) => {
    const aCompletion = materialCounts[a.id] ? materialCounts[a.id].completionPercentage : 0;
    const bCompletion = materialCounts[b.id] ? materialCounts[b.id].completionPercentage : 0;
    return aCompletion - bCompletion;
  });

  const getProgressColor = (progress) => {
    if (progress < 25) return "rgba(255, 99, 132, 0.6)"; // red
    if (progress < 50) return "rgba(54, 162, 235, 0.6)"; // blue
    return "rgba(75, 192, 192, 0.6)"; // green
  };

  return (
    <div className="card bg-gray-800 rounded-lg shadow-md p-4">
      <div className="text-center mt-4 mx-5">
        <div className="my-5">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-300">Progress of materials</h3>
            <button
              onClick={onReload}
              className="p-2 text-white rounded hover:bg-gray-800 transition duration-200"
              title="Refresh data"
            >
              <FontAwesomeIcon icon={faSync} color="gray" size="lg" />
            </button>
          </div>
          <div style={{ height: '350px', width: '100%' }}>
            <Bar
              data={{
                labels: sortedAssemblies.map(assembly => assembly.id),
                datasets: [{
                  label: 'Completion Percentage',
                  data: sortedAssemblies.map(assembly => materialCounts[assembly.id] ? materialCounts[assembly.id].completionPercentage : 0),
                  backgroundColor: sortedAssemblies.map(assembly => getProgressColor(materialCounts[assembly.id] ? materialCounts[assembly.id].completionPercentage : 0)),
                  borderColor: sortedAssemblies.map(assembly => getProgressColor(materialCounts[assembly.id] ? materialCounts[assembly.id].completionPercentage : 0).replace('0.2', '1')),
                  borderWidth: 1,
                }]
              }}
              options={{
                indexAxis: 'y', // Change to horizontal bar chart
                maintainAspectRatio: false,
                scales: {
                  x: { // Change y to x for horizontal bar chart
                    beginAtZero: true,
                    max: 100,
                    grid: {
                      color: 'rgba(255, 255, 255, 0.2)', // Make grid lines more prominent
                      lineWidth: 1.5,
                    },
                  },
                  y: {
                    grid: {
                      color: 'rgba(255, 255, 255, 0.2)', // Make grid lines more prominent
                      lineWidth: 1.5,
                    },
                  },
                },
                plugins: {
                  legend: {
                    display: false
                  }
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectedProjectIdentification;