import React, { useEffect, useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faInfoCircle,
  faCheck,
  faChevronUp,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import CopyToClipboard from "react-copy-to-clipboard";
import Modal from "./Modal";
import ModalAcept from "./ModalAcept";

const ProjectDetails = ({ identificationNumber }) => {
  // ip address
  const apiIpAddress = import.meta.env.VITE_API_IP_ADDRESS;

  // responses states
  const [project, setProject] = useState(null);
  const [adminProjects, setAdminProjects] = useState({});
  const [userOperProjects, setUserOperProjects] = useState({});
  const [assembliesData, setAssembliesData] = useState({});
  const [itemsData, setItemsData] = useState({});
  const [subassembliesData, setSubassembliesData] = useState({});

  const [isOpen, setIsOpen] = useState({});

  const [showInfo, setShowInfo] = useState({});
  const [showItemInfo, setShowItemInfo] = useState({});

  const [textToCopy, setTextToCopy] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalAction, setModalAction] = useState(() => {});
  const [isModalReceivedSuccess, setIsModalReceivedSuccess] = useState(false);
  const [isModalNotReceivedSuccess, setIsModalNotReceivedSuccess] =
    useState(false);
  const [checkboxTarget, setCheckboxTarget] = useState(null);

  useEffect(() => {
    fetchProjectsData();
  }, [identificationNumber]);

  const fetchProjectsData = async () => {
    try {
      const response = await axios.get(
        `${apiIpAddress}/api/getProjects/identification_number/${identificationNumber}`
      );
      const project = response.data;
      setProject(project);
      console.log("Project: ", project);

      const adminProjectsData = {};
      try {
        const adminProjectResponse = await axios.get(
          `${apiIpAddress}/api/projects/${project.id}/admins`
        );
        adminProjectsData[project.id] = adminProjectResponse.data;
      } catch (error) {
        adminProjectsData[project.id] = null;
      }

      const userOperProjectsData = {};
      try {
        const userOperProjectResponse = await axios.get(
          `${apiIpAddress}/api/projects/${project.id}/users`
        );
        userOperProjectsData[project.id] = userOperProjectResponse.data;
      } catch (error) {
        userOperProjectsData[project.id] = null;
      }

      const assembliesData = {};
      const itemsData = {};
      const subassembliesData = {};

      try {
        const assembliesResponse = await axios.get(
          `${apiIpAddress}/api/assembly/project/${project.id}`
        );
        assembliesData[project.id] = assembliesResponse.data;

        // Get items and subassemblies for each assembly
        for (const assembly of assembliesResponse.data) {
          try {
            const itemsResponse = await axios.get(
              `${apiIpAddress}/api/getItems/project/assembly/${project.id}/${assembly.id}`
            );
            itemsData[assembly.id] = itemsResponse.data;
          } catch (error) {
            itemsData[assembly.id] = null;
          }

          try {
            const subassembliesResponse = await axios.get(
              `${apiIpAddress}/api/subassembly/assembly/${assembly.id}`
            );
            subassembliesData[assembly.id] = subassembliesResponse.data;
          } catch (error) {
            subassembliesData[assembly.id] = null;
          }
        }
      } catch (error) {
        assembliesData[project.id] = null;
      }

      setAdminProjects(adminProjectsData);
      setUserOperProjects(userOperProjectsData);
      setAssembliesData(assembliesData);
      setItemsData(itemsData);
      setSubassembliesData(subassembliesData);
      console.log("Admin Projects: ", adminProjectsData);
      console.log("User Operational Projects: ", userOperProjectsData);
      console.log("Assemblies: ", assembliesData);
      console.log("Items: ", itemsData);
      console.log("Subassemblies: ", subassembliesData);
    } catch (error) {
      console.log("Error fetching project: ", error);
    }
  };

  // Get project manager
  const getProjectManager = (projectId) => {
    if (
      Array.isArray(adminProjects[projectId]) &&
      adminProjects[projectId].length > 0
    ) {
      return adminProjects[projectId].map(
        (admin) => admin["user.user_number"] || "Data N/A"
      );
    } else {
      return ["N/A"];
    }
  };

  // Get operational users
  const getUserOperational = (projectId) => {
    if (
      Array.isArray(userOperProjects[projectId]) &&
      userOperProjects[projectId].length > 0
    ) {
      return userOperProjects[projectId].map(
        (user) => user["user.user_number"] || "Data N/A"
      );
    } else {
      return ["N/A"];
    }
  };

  const toggleList = (index) => {
    setIsOpen((prevState) => ({
      ...prevState,
      [index]: !prevState[index],
    }));
  };

  const handleButtonClick = (assemblyId) => {
    setShowInfo((prevState) => ({
      ...prevState,
      [assemblyId]: !prevState[assemblyId],
    }));
  };

  const handleItemButtonClick = (itemId) => {
    setShowItemInfo((prevState) => ({
      ...prevState,
      [itemId]: !prevState[itemId],
    }));
  };

  const handleCopyAssemblyMaterials = (projectId, assemblyId) => {
    // Implement your copy logic here
  };

  const getAssemblyStatus = (completed) => {
    return completed === 0 ? "Pending" : "Completed";
  };

  // Handle checkbox change
  const handleCheckboxChange = (e) => {
    const isChecked = e.target.checked;
    const message = isChecked
      ? "Are you sure to mark the product as received?"
      : "Are you sure to remove the received mark from the product?";

    setModalMessage(message);
    setModalAction(() => () => {
      if (isChecked) {
        setIsModalReceivedSuccess(true);
      } else {
        setIsModalNotReceivedSuccess(true);
      }
      setIsModalOpen(false);
    });

    setCheckboxTarget(e.target);
    setIsModalOpen(true);
  };

  // Handle cancel
  const handleCancel = () => {
    setIsModalOpen(false);
    if (checkboxTarget) {
      checkboxTarget.checked = !checkboxTarget.checked;
    }
  };

  return (
    <>
      <div className="px-4 py-5 min-h-screen">
        {/*Details. ID del Proyecto: #{identificationNumber}*/}
        {project && (
          <div>
            {/* PROJECT DATA */}
            <div className="flex justify-center grid grid-cols-12 gap-4">
              {/* Admin Users card */}
              <div className="col-span-12 md:col-span-3 flex">
                <div className="bg-gray-800 p-4 rounded-lg shadow-lg transition-transform transform hover:translate-y-1 duration-300 flex-grow">
                  <div className="flex items-center mb-2">
                    <strong className="text-lg font-extrabold text-blue-400 pb-2">
                      Project manager
                    </strong>
                  </div>
                  <ul className="text-white">
                    {getProjectManager(project.id).map((userNumber, index) => (
                      <li key={index}>
                        {index + 1}. {userNumber}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Project Details card */}
              <div className="col-span-12 md:col-span-6 flex">
                <div className="bg-gray-800 p-4 rounded-lg shadow-lg transition-transform transform hover:translate-y-1 duration-300 flex-grow">
                  <div className="flex items-center mb-2">
                    <strong className="text-lg font-extrabold text-blue-400 pb-2">
                      Description
                    </strong>
                  </div>
                  <div className="text-white text-justify">
                    {project.description}
                  </div>
                </div>
              </div>

              {/* Operational Users card */}
              <div className="col-span-12 md:col-span-3 flex">
                <div className="bg-gray-800 p-4 rounded-lg shadow-lg transition-transform transform hover:translate-y-1 duration-300 flex-grow">
                  <div className="flex items-center mb-2">
                    <strong className="text-lg font-extrabold text-blue-400 pb-2">
                      Operational users
                    </strong>
                  </div>
                  <ul className="text-white">
                    {getUserOperational(project.id).map((userNumber, index) => (
                      <li key={index}>
                        {index + 1}. {userNumber}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <hr className="mb-3 mt-2 border-b border-gray-700" />

            <div className="flex justify-center grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-6 flex justify-center">
                <div className="text-lg text-center text-gray-500">
                  Delivery Date. <strong>{project.delivery_date}</strong>
                </div>
              </div>
              <div className="col-span-12 md:col-span-6 flex justify-center">
                <div className="text-lg text-center text-gray-500">
                  Cost Material. <strong>${project.cost_material} MXN</strong>
                </div>
              </div>
            </div>

            <div className="pt-5">
              {/* Assemblies */}
              {Array.isArray(assembliesData[project.id]) &&
                assembliesData[project.id].length > 0 && (
                  <div className="pt-20 pb-20 px-4">
                    <h2 className="text-2xl pb-10 font-medium text-gray-300 text-center">
                      List of Assemblies
                    </h2>{" "}
                    <div className="pt-3">
                      {assembliesData[project.id].map((assembly, i) => (
                        <div className="px-3 mb-5" key={i}>
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-base px-4 flex items-center">
                                <span
                                  className={`${
                                    assembly.completed === 0
                                      ? "text-gray-200"
                                      : "text-green-500 italic text-opacity-70"
                                  }`}
                                >
                                  <div className="flex items-center space-x-2">
                                    <div className="font-medium">
                                      {i + 1}.{" "}
                                      <span className="ml-2">
                                        {assembly.identification_number}
                                      </span>
                                    </div>
                                    <div>
                                      {assembly.completed === 0 ? (
                                        <span className="underline italic text-yellow-500 text-sm">
                                          PENDING
                                        </span>
                                      ) : (
                                        <FontAwesomeIcon icon={faCheck} />
                                      )}
                                    </div>
                                  </div>
                                </span>
                              </h3>
                            </div>
                            <div>
                              <CopyToClipboard text={textToCopy}>
                                <button
                                  className="px-5 py-2 font-medium mx-2 text-sm text-gray-500 hover:text-gray-200 "
                                  onClick={() =>
                                    handleCopyAssemblyMaterials(
                                      project.id,
                                      assembly.id
                                    )
                                  }
                                >
                                  Copy materials
                                </button>
                              </CopyToClipboard>
                              <button className="px-5 font-medium py-2 mx-2 text-sm text-gray-500 hover:text-gray-200 ">
                                EPICOR Format
                              </button>
                              <button
                                onClick={() => handleButtonClick(assembly.id)}
                                className=" mr-2 rounded bg-gray-900 text-gray-500 font-bold shadow-lg px-5 py-2 my-2 hover:bg-blue-800 hover:text-blue-200"
                              >
                                Assembly File
                              </button>
                              <button
                                onClick={() => toggleList(i)}
                                className="px-4 py-2 bg-gray-500 text-sm text-gray-300 bg-pageBackground rounded hover:bg-gray-700"
                              >
                                {isOpen[i] ? (
                                  <FontAwesomeIcon icon={faChevronUp} />
                                ) : (
                                  <FontAwesomeIcon icon={faChevronDown} />
                                )}
                              </button>
                            </div>
                          </div>
                          {showInfo[assembly.id] && (
                            <div className="pt-2 pb-10 px-2">
                              <table className="w-full mt-4 border-collapse border border-gray-500">
                                <thead>
                                  <tr className="w-full bg-blue-900">
                                    <th className="border border-blue-500 px-4 py-2">
                                      Field
                                    </th>
                                    <th className="border border-blue-500 px-4 py-2">
                                      Value
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr>
                                    <td className="border border-blue-500 px-4 py-2">
                                      <strong>Description</strong>
                                    </td>
                                    <td className="border border-gray-500 px-4 py-2 ">
                                      {assembly.description}
                                    </td>
                                  </tr>
                                  <tr>
                                    <td className="border border-blue-500 px-4 py-2">
                                      <strong>Price</strong>
                                    </td>
                                    <td className="border border-gray-500 px-4 py-2 ">
                                      ${assembly.price} USD
                                    </td>
                                  </tr>
                                  <tr>
                                    <td className="border border-blue-500 px-4 py-2">
                                      <strong>Delivery Date</strong>
                                    </td>
                                    <td className="border border-gray-500 px-4 py-2">
                                      {assembly.delivery_date}
                                    </td>
                                  </tr>
                                  <tr>
                                    <td className="border border-blue-500 bg-blue-900 px-4 py-2">
                                      <strong>Status</strong>
                                    </td>
                                    <td className="border bg-blue-900 bg-opacity-50 text-gray-400 border-gray-500 px-4 py-2  italic">
                                      {getAssemblyStatus(assembly.completed)}
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          )}
                          {isOpen[i] && (
                            <div className="list-disc text-white">
                              {Array.isArray(itemsData[assembly.id]) &&
                              itemsData[assembly.id].length > 0 ? (
                                itemsData[assembly.id].map((item, index) => (
                                  <div key={index}>
                                    <table className="text-sm table-auto w-full text-lightWhiteLetter">
                                      <tbody className="bg-gray-800 shadow-lg">
                                        <tr className="border-b border-gray-500 hover:bg-pageSideMenuTextHover cursor-pointer transition duration-200">
                                          <td className="py-3 px-2 flex justify-between items-center">
                                            <div className="px-2">
                                              <span className="pr-6">
                                                {index + 1}
                                              </span>
                                              <span>{item.name}</span>
                                            </div>
                                            <div className="px-2">
                                              <div className="flex items-center space-x-4">
                                                <button
                                                  onClick={() =>
                                                    handleItemButtonClick(
                                                      item.id
                                                    )
                                                  }
                                                  className=" text-gray-500 font-semibold px-10 hover:text-gray-200"
                                                >
                                                  Description
                                                </button>
                                                <input
                                                  type="checkbox"
                                                  onChange={
                                                    handleCheckboxChange
                                                  }
                                                  defaultChecked={
                                                    item.in_subassembly === 1
                                                  }
                                                  className="form-checkbox h-5 w-5 text-blue-600"
                                                />
                                              </div>
                                            </div>
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>

                                    {showItemInfo[item.id] && (
                                      <div className="pt-2 pb-10 px-2">
                                        <table className="w-full mt-4 ">
                                          <tbody>
                                            <tr>
                                              <td className="text-gray-400 font-medium border-r border-b border-gray-700 px-4 py-2">
                                                Number Material
                                              </td>
                                              <td className="text-gray-400 border-l border-b border-gray-700 px-4 py-2">
                                                {item.number_material}
                                              </td>
                                            </tr>
                                            <tr>
                                              <td className="text-gray-400 font-medium border-r border-b border-gray-700 px-4 py-2">
                                                Name
                                              </td>
                                              <td className="text-gray-400 border-l border-b border-gray-700 px-4 py-2">
                                                {item.name}
                                              </td>
                                            </tr>
                                            <tr>
                                              <td className="text-gray-400 font-medium border-r border-b border-gray-700 px-4 py-2">
                                                Description
                                              </td>
                                              <td className="text-gray-400 border-l border-b border-gray-700 px-4 py-2">
                                                {item.description}
                                              </td>
                                            </tr>
                                            <tr>
                                              <td className="text-gray-400 font-medium border-r border-b border-gray-700 px-4 py-2">
                                                Quantity required
                                              </td>
                                              <td className="text-gray-400 border-l border-b border-gray-700 px-4 py-2">
                                                {
                                                  item.subassembly_assignment_quantity
                                                }
                                              </td>
                                            </tr>
                                            <tr>
                                              <td className="text-gray-400 font-medium border-r border-b border-gray-700 px-4 py-2">
                                                Cotizacion Number
                                              </td>
                                              <td className="text-gray-400 border-l border-b border-gray-700 px-4 py-2">
                                                {item.number_cotizacion}
                                              </td>
                                            </tr>
                                            <tr>
                                              <td className="text-gray-400 font-medium border-r border-b border-gray-700 px-4 py-2">
                                                Price
                                              </td>
                                              <td className="text-gray-400 border-l border-b border-gray-700 px-4 py-2">
                                                ${item.price} MXN
                                              </td>
                                            </tr>
                                            <tr>
                                              <td className="text-gray-400 font-medium border-r border-b border-gray-700 px-4 py-2">
                                                Supplier
                                              </td>
                                              <td className="text-gray-400 border-l border-b border-gray-700 px-4 py-2">
                                                {item.supplier}
                                              </td>
                                            </tr>
                                            <tr>
                                              <td className="text-gray-300 font-medium border-r border-b border-gray-700 px-4 py-2">
                                                Order Date
                                              </td>
                                              <td className="text-gray-300 border-l border-b border-gray-700 px-4 py-2">
                                                {item.date_order}
                                              </td>
                                            </tr>
                                            <tr>
                                              <td className="text-gray-300 font-medium border-r border-b border-gray-700 px-4 py-2">
                                                Status
                                              </td>
                                              <td className="text-gray-300 border-l border-b border-gray-700 px-4 py-2 italic">
                                                {item.in_subassembly === 1
                                                  ? "Received"
                                                  : "Not Received"}
                                              </td>
                                            </tr>
                                            <tr>
                                              <td className="text-gray-300 font-medium border-r border-b border-gray-700 px-4 py-2">
                                                Arrived Date
                                              </td>
                                              <td className="text-gray-300 border-l border-b border-gray-700 px-4 py-2">
                                                {item.arrived_date}
                                              </td>
                                            </tr>
                                          </tbody>
                                        </table>
                                      </div>
                                    )}
                                  </div>
                                ))
                              ) : (
                                <div className="text-gray-400 text-center">
                                  No items found
                                </div>
                              )}
                            </div>
                          )}
                          <div className=" pt-5 px-5 ">
                            {Array.isArray(subassembliesData[assembly.id]) &&
                              subassembliesData[assembly.id].length > 0 &&
                              subassembliesData[assembly.id].map(
                                (subassembly, i) => (
                                  <div key={i} className="pt-5 px-10">
                                    <div>
                                      <div className="text-gray-300 font-medium">
                                        {i + 1}.{" "}
                                        {subassembly.identification_number}
                                      </div>
                                    </div>
                                  </div>
                                )
                              )}
                          </div>
                          <hr className="my-5 border-b border-gray-900" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </div>
        )}
      </div>
      <ModalAcept
        isOpen={isModalOpen}
        onClose={handleCancel}
        onContinue={modalAction}
        title="Material not received"
      >
        <p>{modalMessage}</p>
      </ModalAcept>

      <Modal
        isOpen={isModalReceivedSuccess}
        onClose={() => setIsModalReceivedSuccess(false)}
        title="Material received"
      >
        <p>Material has been marked as successfully received.</p>
      </Modal>

      <Modal
        isOpen={isModalNotReceivedSuccess}
        onClose={() => setIsModalNotReceivedSuccess(false)}
        title="Material not received"
      >
        <p>Material has been marked as not received.</p>
      </Modal>
    </>
  );
};

export default ProjectDetails;
