import React, { useState, useEffect } from "react";
import { useLocation } from 'react-router-dom';
import axios from "axios";
import AppProjectDetails from "./ProjectDetails";

const OldProject = () => {
  const apiIpAddress = import.meta.env.VITE_API_IP_ADDRESS;
  const location = useLocation();
  const { projectId } = location.state || {};

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId) {
        setError('No project ID provided.');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${apiIpAddress}/api/getProjects/${projectId}`);
        setProject(response.data);
        setLoading(false);
      } catch (err) {
        setError('Error fetching project details. Please try again later.');
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  return (
    <div className="px-4 py-5 min-h-screen">
      <h1 className="text-2xl font-bold text-center">Old Projects</h1>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {project && (
        <>
          <h1>Old Project Details</h1>
          <p>Project ID: {projectId}</p>
          <AppProjectDetails project={project} />
        </>
      )}
    </div>
  );
};

export default OldProject;