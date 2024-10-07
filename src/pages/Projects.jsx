import React, { useState, useEffect } from "react";
import axios from "axios";

const Projects = () => {
  const apiIpAddress = import.meta.env.VITE_API_IP_ADDRESS;

  const [projectsInfo, setProjectsInfo] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    const fetchProjectsInfo = async () => {
      try {
        const projectsInfoResponse = await axios.get(
          `${apiIpAddress}/api/getProjectsActives`
        );
        console.log("Projects info response:", projectsInfoResponse.data);
        setProjectsInfo(projectsInfoResponse.data);
      } catch (error) {
        console.error("Error fetching projects info:", error);
      }
    };

    fetchProjectsInfo();
  }, [apiIpAddress]);

  const handleMoreInfo = (projectId) => {
    const project = projectsInfo.find((p) => p.id === projectId);
    setSelectedProject(project);
  };

  return (
    <div className="pr-4">
      <div className="flex justify-between items-center pt-4 pb-4 mb-5">
        <h1 className="text-2xl font-semibold leading-7 text-Slate-100">
          Projects
        </h1>
        <div className="flex items-center">
          <input
            type="text"
            placeholder="#000351 ..."
            className="w-80 p-2 rounded-l text-sm text-gray-500 focus:outline-none"
          />
          <button className="p-2 bg-gray-500 text-sm rounded-r hover:bg-gray-700">
            <strong>Search</strong>
          </button>
        </div>
      </div>

      <div>
        <div className="pl-4">
          <button className="p-2 bg-gray-500 text-sm rounded-t hover:bg-gray-700">
            <strong>New</strong>
          </button>
        </div>

        <div className="flex grid grid-cols-12 gap-2">
          <div
            className="card border border-gray-500 rounded col-span-12 md:col-span-3"
            id="pj-list-projects"
          >
            <ul className="block list-group list-group-flush">
              {projectsInfo.map((project) => (
                <li
                  key={project.id}
                  className="m-2 list-group-item border-b border-gray-500 p-4 cursor-pointer hover:bg-gray-700 transition duration-200"
                  onClick={() => handleMoreInfo(project.id)}
                >
                  <div className="text-lg">
                    <strong>#{project.identification_number}</strong>
                    <br />
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-12 md:col-span-9">
            <div className="card border border-gray-700 rounded" id="pj-info-projects">
              <div className="m-4">
                {selectedProject ? (
                  <div>
                    <h2 className="text-xl font-bold">{selectedProject.name}</h2>
                    <p><strong>Description</strong><br/>{selectedProject.description}</p><br/>
                    <p><strong>Delivery Date</strong><br/>{selectedProject.delivery_date}</p><br/>
                    <p><strong>Completed</strong><br/>{selectedProject.completed ? 'Yes' : 'No'}</p><br/>
                    <p><strong>Cost Material</strong><br/>${selectedProject.cost_material}</p>
                  </div>
                ) : (
                  "Select a project to see the details"
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Projects;