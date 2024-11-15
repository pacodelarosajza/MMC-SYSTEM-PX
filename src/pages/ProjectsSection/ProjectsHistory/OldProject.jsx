import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import AppProjectDetails from "./OldProjectDetails";

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
        setError("No project ID provided.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `${apiIpAddress}/api/getProjects/id/${projectId}`
        );
        setProject(response.data);
        setLoading(false);
      } catch (err) {
        setError("Error fetching project details. Please try again later.");
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  return (
    <div className="px-4 py-5 min-h-screen">
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {project && (
        <>
          <div className="px-4 py-5 min-h-screen">
            <div className="m-10 text-right">
              <div className="flex justify-end">
                <h1 className="text-4xl pb-3 text-gray-700">PROYECT.</h1>
                <strong className="text-4xl pb-3 font-bold text-gray-500">
                  {project.identification_number}
                </strong>
              </div>
              <div className="text-gray-300">
                <span className="font-semibold text-xl">
                  {new Date(project.created_at).toLocaleDateString()} -{" "}
                  {new Date(project.updated_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            {loading && <p>Loading...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {project && (
              <>
                <div className="mb-4">
                  <div className="flex">
                    <strong className="text-2xl text-gray-500">
                      Cost Material
                    </strong>
                    <p className="pl-1 text-4xl font-semibold text-gray-200">
                      ${project.cost_material}
                    </p>
                  </div>
                  <div className="mt-5">
                    <strong className="text-gray-500 text-lg">
                      Description
                    </strong>
                    <p className="text-gray-200">{project.description}</p>
                  </div>
                </div>
                <AppProjectDetails
                  project={project}
                  identificationNumber={project.identification_number}
                />
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default OldProject;
