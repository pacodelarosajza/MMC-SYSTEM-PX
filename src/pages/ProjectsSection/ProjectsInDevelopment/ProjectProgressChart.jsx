
import React from "react";
import { Bar } from "react-chartjs-2";

const ProjectProgressChart = ({ activeProjects, progresses }) => {
  const chartData = {
    labels: activeProjects.map((project) => project.identification_number),
    datasets: [
      {
        label: "Progress (%)",
        data: activeProjects.map((project) => progresses[project.id] || 0),
        backgroundColor: activeProjects.map((project) => {
          const progress = progresses[project.id] || 0;
          if (progress < 25) return "rgba(255, 99, 132, 0.6)"; // red
          if (progress < 50) return "rgba(54, 162, 235, 0.6)"; // blue
          return "rgba(75, 192, 192, 0.6)"; // green
        }),
        borderColor: activeProjects.map((project) => {
          const progress = progresses[project.id] || 0;
          if (progress < 25) return "rgba(255, 99, 132, 1)"; // red
          if (progress < 50) return "rgba(54, 162, 235, 1)"; // blue
          return "rgba(75, 192, 192, 1)"; // green
        }),
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Hide the legend
      },
      title: {
        display: false, // Remove the title
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: 'rgba(255, 255, 255, 0.2)', // Make grid lines more prominent
          lineWidth: 1.5,
        },
      },
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.2)', // Make grid lines more prominent
          lineWidth: 1.5,
        },
      },
    },
  };

  return <Bar data={chartData} options={chartOptions} />;
};

export default ProjectProgressChart;