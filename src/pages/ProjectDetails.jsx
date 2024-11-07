import React, { useEffect, useState } from "react";
import axios from "axios";

const ProjectDetails = ({ identificationNumber }) => {
  // ip address
  const apiIpAddress = import.meta.env.VITE_API_IP_ADDRESS;

  // responses states
  const [project, setProject] = useState(null);
  const [adminProjects, setAdminProjects] = useState({});

  useEffect(() => {
    fetchProjectsData();
  }, [identificationNumber]);

  const fetchProjectsData = async () => {
    try {
      const response = await axios.get(
        `${apiIpAddress}/api/getProjects/identification_number/${identificationNumber}`
      );
      const projects = response.data;
      setProject(projects);

      const adminProjectsData = {};
      for (const project of projects) {
        try {
          const adminProjectResponse = await axios.get(
            `${apiIpAddress}/api/projects/${project.id}/admins`
          );
          adminProjectsData[project.id] = adminProjectResponse.data;
        } catch (error) {
          adminProjectsData[project.id] = null;
        }
      }
      setAdminProjects(adminProjectsData);
      
    } catch (error) {
      console.log("Error fetching project: ", error);
    }
  };

  // Get project manager
  const getProjectManager = (projectId) => {
    return Array.isArray(adminProjects[projectId]) &&
      adminProjects[projectId].length > 0
      ? adminProjects[projectId][0]?.["user.user_number"] || "Data N/A"
      : "N/A";
  };

  return (
    <div className="px-4 py-5 min-h-screen">
      {/*Details. ID del Proyecto: #{identificationNumber}*/}
      {project && (
        <div>
          <div className="flex justify-center mx-5 grid-cols-12 text-sm">
            <div className="col-span-6">
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-5">
                  <strong>Project manager: </strong>
                </div>
                <div className="col-span-7">
                  <ul>
                    <li>{getProjectManager(project.id)}</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="col-span-6">
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-5">
                  <strong>Operational users:</strong>
                </div>
                <div className="col-span-7">
                  <ul>
                    {/*getUserOperational(selectedProject.id).map(
                      (userNumber, index) => (
                        <div key={index}>• {userNumber}</div>
                      )
                    )*/}
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-5">
            <strong className="text-xl">Description</strong>
            <br />
            {project.description}
          </div>
          <hr className="mb-3 mt-2 border-b border-gray-700" />
          <div className="px-20 grid grid-cols-12 w-full gap-4">
            <div className="col-span-6">
              Delivery Date. <strong>{project.delivery_date}</strong>
            </div>
            <div className="col-span-6">
              Cost Material. <strong>${project.cost_material} MXN</strong>
            </div>
          </div>
          
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;