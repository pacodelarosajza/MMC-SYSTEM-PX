import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faChevronUp,
  faChevronDown,
  faSpinner,
  faInfoCircle,
  faChevronCircleUp,
  faChevronCircleDown,
  faSync,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";
import CopyToClipboard from "react-copy-to-clipboard";
import Modal from "../../../components/Modal";
import ModalAcept from "../../../components/ModalAcept";
import EpicorModal from "../../../components/EpicorModal"; // Import the new EpicorModal component
import { debounce } from "lodash";

const OldProjectDetails = ({ identificationNumber }) => {
  // IP ADDRESS
  const apiIpAddress = import.meta.env.VITE_API_IP_ADDRESS;

  // RESPONSES STATES
  const [project, setProject] = useState(null);
  const [adminProjects, setAdminProjects] = useState({});
  const [userOperProjects, setUserOperProjects] = useState({});
  const [assembliesData, setAssembliesData] = useState({});
  const [itemsData, setItemsData] = useState({});
  const [subassembliesData, setSubassembliesData] = useState({});
  const [subassembliesItemsData, setSubassembliesItemsData] = useState({});

  // OPEN SECTIONS
  const [isOpen, setIsOpen] = useState({}); // Assembly details
  const [isSubassemblyOpen, setIsSubassemblyOpen] = useState({}); // Subassembly details
  const [showInfo, setShowInfo] = useState({}); // Table assembly data section
  const [showItemInfo, setShowItemInfo] = useState({}); // Table item data section

  // ACTIONS
  const [textToCopy, setTextToCopy] = useState(""); // Copy to clipboard text
  const [copyStatus, setCopyStatus] = useState({}); // Track copy status for each assembly

  // MODALS (checkbox)
  const [isModalOpen, setIsModalOpen] = useState(false); // Generic modal. Visible control when a checkbox is clicked
  const [modalMessage, setModalMessage] = useState(""); // Generic modal message. Message to show in the generic modal
  const [modalAction, setModalAction] = useState(() => {}); // Generic modal action. Action to execute when the continue button is clicked
  const [isModalReceivedSuccess, setIsModalReceivedSuccess] = useState(false); // Received success modal
  const [isModalNotReceivedSuccess, setIsModalNotReceivedSuccess] =
    useState(false); // Not received success modal
  const [checkboxTarget, setCheckboxTarget] = useState(null); // Checkbox target

  // LOADING STATE
  const [isLoading, setIsLoading] = useState(true);

  const [isEpicorModalOpen, setIsEpicorModalOpen] = useState(false); // EPICOR modal state
  const [epicorData, setEpicorData] = useState([]); // EPICOR data

  const [selectedCells, setSelectedCells] = useState([]);
  const [isSelecting, setIsSelecting] = useState(false);

  const handleCellMouseDown = (rowIndex, colIndex) => {
    setIsSelecting(true);
    setSelectedCells([[rowIndex, colIndex]]);
    document.body.style.userSelect = "none"; // Prevent text selection
  };

  const handleCellMouseOver = (rowIndex, colIndex) => {
    if (isSelecting) {
      const [startRow, startCol] = selectedCells[0];
      const newSelectedCells = [];
      for (let i = Math.min(startRow, rowIndex); i <= Math.max(startRow, rowIndex); i++) {
        for (let j = Math.min(startCol, colIndex); j <= Math.max(startCol, colIndex); j++) {
          newSelectedCells.push([i, j]);
        }
      }
      setSelectedCells(newSelectedCells);
    }
  };

  const handleMouseUp = () => {
    setIsSelecting(false);
    document.body.style.userSelect = "auto"; // Re-enable text selection
  };

  useEffect(() => {
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const isSelected = (rowIndex, colIndex) => {
    return selectedCells.some(([r, c]) => r === rowIndex && c === colIndex);
  };

  const getSelectedCellsData = () => {
    return selectedCells.map(([rowIndex, colIndex]) => {
      const item = epicorData[rowIndex - 1];
      const value = [
        item.number_material,
        item.name,
        item.description,
        item.subassembly_assignment_quantity,
        item.price,
        "FALSE",
        "FALSE",
        item.supplier,
      ][colIndex];
      return value;
    }).join("\n");
  };

  const handleCopySelectedCells = () => {
    const selectedData = getSelectedCellsData();
    navigator.clipboard.writeText(selectedData);
  };

  const handleKeyDown = (event) => {
    if (event.ctrlKey && event.key === 'c') {
      // Removed functionality for copying selected cells using Ctrl+C
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // USE EFFECT TO FETCH DATA
  useEffect(() => {
    const debouncedFetch = debounce(fetchProjectsData, 300);
    debouncedFetch();
    return () => {
      debouncedFetch.cancel();
    };
  }, [identificationNumber]);

  //FETCH DATA
  const fetchProjectsData = async () => {
    setIsLoading(true);
    try {
      // Fetch project data
      const response = await axios.get(
        `${apiIpAddress}/api/getProjects/identification_number/${identificationNumber}`
      );
      const project = response.data;
      setProject(project);

      // Fetch admin and operational users
      const [adminProjectResponse, userOperProjectResponse] = await Promise.all(
        [
          axios
            .get(`${apiIpAddress}/api/projects/${project.id}/admins`)
            .catch(() => null),
          axios
            .get(`${apiIpAddress}/api/projects/${project.id}/users`)
            .catch(() => null),
        ]
      );

      const adminProjectsData = {
        [project.id]: adminProjectResponse ? adminProjectResponse.data : null,
      };
      const userOperProjectsData = {
        [project.id]: userOperProjectResponse
          ? userOperProjectResponse.data
          : null,
      };

      // Fetch assemblies, items and subassemblies
      const assembliesResponse = await axios.get(
        `${apiIpAddress}/api/assembly/project/${project.id}`
      );
      const assembliesData = {
        [project.id]: assembliesResponse.data,
      };

      const itemsData = {};
      const subassembliesData = {};
      const subassembliesItemsData = {};

      await Promise.all(
        assembliesResponse.data.map(async (assembly) => {
          const [itemsResponse, subassembliesResponse] = await Promise.all([
            axios
              .get(`${apiIpAddress}/api/getItems/assembly/${assembly.id}`)
              .catch(() => null),
            axios
              .get(`${apiIpAddress}/api/subassembly/assembly/${assembly.id}`)
              .catch(() => null),
          ]);

          itemsData[assembly.id] = itemsResponse ? itemsResponse.data : null;
          subassembliesData[assembly.id] = subassembliesResponse
            ? subassembliesResponse.data
            : null;

          if (subassembliesResponse) {
            await Promise.all(
              subassembliesResponse.data.map(async (subassembly) => {
                const subassemblyItemsResponse = await axios
                  .get(
                    `${apiIpAddress}/api/subassembly/items/${subassembly.id}`
                  )
                  .catch(() => null);
                subassembliesItemsData[subassembly.id] =
                  subassemblyItemsResponse
                    ? subassemblyItemsResponse.data
                    : null;

                // Check if all items in the subassembly are completed
                const allSubassemblyItemsCompleted = subassemblyItemsResponse
                  ? subassemblyItemsResponse.data.every(
                      (item) => item.in_subassembly === 1
                    )
                  : true;

                if (allSubassemblyItemsCompleted) {
                  subassembly.completed = 1;
                }
              })
            );
          }

          // Check if all items in the assembly and its subassemblies are completed
          const allItemsCompleted =
            itemsResponse &&
            itemsResponse.data.every((item) => item.in_subassembly === 1);

          const allSubassembliesCompleted = subassembliesResponse
            ? subassembliesResponse.data.every(
                (subassembly) => subassembly.completed === 1
              )
            : true;

          if (allItemsCompleted && allSubassembliesCompleted) {
            assembly.completed = 1;
          }
        })
      );

      // Set states
      setAdminProjects(adminProjectsData);
      setUserOperProjects(userOperProjectsData);
      setAssembliesData(assembliesData);
      setItemsData(itemsData);
      setSubassembliesData(subassembliesData);
      setSubassembliesItemsData(subassembliesItemsData);

      // Log data
    } catch (error) {
      console.error("Error fetching project: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = async () => {
    setIsLoading(true); // Set loading state to true
    await fetchProjectsData();
    setIsLoading(false); // Set loading state to false
  };

  // GET FUNCTIONS
  // project manager
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

  // operational users
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

  // FUNCTIONS TO HANDLE BUTTONS
  // Handle button click to show assembly info
  const handleButtonClick = (assemblyId) => {
    setShowInfo((prevState) => ({
      ...prevState,
      [assemblyId]: !prevState[assemblyId],
    }));
  };
  // Toggle list of items for each assembly
  const toggleList = (index) => {
    setIsOpen((prevState) => ({
      ...prevState,
      [index]: !prevState[index],
    }));
  };
  // Toggle list of subassemblies for each assembly
  const toggleSubassemblyList = (subassemblyId) => {
    setIsSubassemblyOpen((prevState) => {
      const isOpen = !prevState[subassemblyId];
      if (isOpen && !subassemblyDetails[subassemblyId]) {
        handleSubassemblyFile(subassemblyId);
      }
      return {
        ...prevState,
        [subassemblyId]: isOpen,
      };
    });
  };
  // Handle button click to show item info
  const handleItemButtonClick = (itemId) => {
    setShowItemInfo((prevState) => ({
      ...prevState,
      [itemId]: !prevState[itemId],
    }));
  };

  // OTHER FUNCTIONS
  // Handle copy assembly materials
  const handleCopyAssemblyMaterials = async (assemblyId) => {
    const assemblyItems = itemsData[assemblyId] || [];
    const subassemblyItems = subassembliesData[assemblyId]
      ? subassembliesData[assembly.id].flatMap(
          (subassembly) => subassembliesItemsData[subassembly.id] || []
        )
      : [];
  
    const allItems = [...assemblyItems, ...subassemblyItems];
    const materialsList = await Promise.all(
      allItems.map(async (item) => {
        let subassemblyIdPart = "";
        if (item.subassembly_id > 0) {
          const subassemblyResponse = await axios.get(
            `${apiIpAddress}/api/subassembly/${item.subassembly_id}`
          );
          const subassembly = subassemblyResponse.data;
          subassemblyIdPart = `Subassembly ID: ${subassembly.identification_number}\n`;
        }
        return `${subassemblyIdPart}\nMat. ${item.number_material}\n${item.name}\n${item.description}\nQty: ${item.subassembly_assignment_quantity}\nSuppl: ${item.supplier}\n${item.price} ${item.currency}`;
      })
    );
  
    setTextToCopy(materialsList.join("\n"));
    setCopyStatus((prevState) => ({ ...prevState, [assemblyId]: true }));
    setTimeout(() => {
      setCopyStatus((prevState) => ({ ...prevState, [assemblyId]: false }));
    }, 2000); // Reset status after 2 seconds
  };

  // Get assembly status
  const getAssemblyStatus = (completed) => {
    return completed === 0 ? "Pending" : "Completed";
  };
  // Handle checkbox change
  const handleCheckboxChange = async (e, itemId) => {
    const isChecked = e.target.checked;
    const message = isChecked
      ? "Are you sure to mark the product as received?"
      : "Are you sure to remove the received mark from the product?";

    setModalMessage(message);
    setModalAction(() => async () => {
      try {
        setIsLoading(true); // Set loading state to true
        const currentDate = new Date().toISOString();
        await axios.patch(`${apiIpAddress}/api/patchItem/${itemId}`, {
          in_subassembly: isChecked ? 1 : 0,
          arrived_date: currentDate,
        });
        if (isChecked) {
          setIsModalReceivedSuccess(true);
        } else {
          setIsModalNotReceivedSuccess(true);
        }
        await fetchProjectsData(); // Refresh data after change
      } catch (error) {
        console.error("Error updating item: ", error);
      } finally {
        setIsLoading(false); // Set loading state to false
      }
      setIsModalOpen(false);
    });

    setCheckboxTarget(e.target);
    setIsModalOpen(true);
  };

  // Handle cancel modal action (checkbox)
  const handleCancel = () => {
    setIsModalOpen(false);
    if (checkboxTarget) {
      checkboxTarget.checked = !checkboxTarget.checked;
    }
  };

  // Handle EPICOR format button click
  const handleEpicorFormat = async (assemblyId) => {
    const assemblyItems = itemsData[assemblyId] || [];
    const subassemblyItems = subassembliesData[assemblyId]
      ? subassembliesData[assemblyId].flatMap(
          (subassembly) => subassembliesItemsData[subassembly.id] || []
        )
      : [];
  
    const allItems = [...assemblyItems, ...subassemblyItems];
    const itemsWithSubassemblyInfo = await Promise.all(
      allItems.map(async (item) => {
        if (item.subassembly_id > 0) {
          const subassemblyResponse = await axios.get(
            `${apiIpAddress}/api/subassembly/${item.subassembly_id}`
          );
          const subassembly = subassemblyResponse.data;
          return { ...item, subassembly_identification_number: subassembly.identification_number };
        }
        return item;
      })
    );
  
    setEpicorData(itemsWithSubassemblyInfo);
    setIsEpicorModalOpen(true);
  };

  const [subassemblyDetails, setSubassemblyDetails] = useState({}); // New state for subassembly details
  const [subassemblyError, setSubassemblyError] = useState({}); // New state for subassembly errors

  const handleSubassemblyFile = async (subassemblyId) => {
    try {
      const response = await axios.get(`${apiIpAddress}/api/subassembly/${subassemblyId}`);
      setSubassemblyDetails((prevState) => ({
        ...prevState,
        [subassemblyId]: response.data,
      }));
      setSubassemblyError((prevState) => ({
        ...prevState,
        [subassemblyId]: null,
      }));
    } catch (error) {
      console.error("Error fetching subassembly details: ", error);
      setSubassemblyError((prevState) => ({
        ...prevState,
        [subassemblyId]: "Error fetching subassembly details",
      }));
    }
  };

  const calculateTotalSubassemblyPrice = (subassemblyId) => {
    const items = subassembliesItemsData[subassemblyId] || [];
    return items.reduce((total, item) => total + parseFloat(item.price || 0), 0).toFixed(2);
  };

  return (
    <>
      {/* PROJECT DETAILS */}
      <div className="pt-10">
        <h2 className="text-2xl pb-5 font-bold text-center">
          List of Assemblies
        </h2>{" "}
        {isLoading ? (
          // Loading spinner design
          <div className="flex justify-center items-center h-screen">
            <FontAwesomeIcon
              icon={faSpinner}
              spin
              size="3x"
              className="text-gray-500"
            />
          </div>
        ) : (
          project && (
            <div>
              <div className="pb-20">
                {/* LIST OF ASSEMBLIES */}
                {Array.isArray(assembliesData[project.id]) &&
                  assembliesData[project.id].length > 0 && (
                    <div className=" pb-25">
                      
                      <div className="pt-3">
                        {/* LIST OF ASSEMBLIES */}
                        {assembliesData[project.id].map((assembly, i) => (
                          <div className="mb-5" key={i}>
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="text-base px-4 flex items-center">
                                  <span
                                    className="text-gray-300"
                                  >
                                    <div className="flex items-center space-x-2">
                                      <div className="font-semibold text-lg text-indigo-400">
                                      
                                        <span className="ml-2">
                                          {assembly.identification_number}
                                        </span>
                                      </div>
                                      
                                    </div>
                                  </span>
                                </h3>
                              </div>
                              <div className="flex items-center space-x-4">
                                <CopyToClipboard text={textToCopy}>
                                  <button
                                    className={`font-medium text-sm ${
                                      copyStatus[assembly.id]
                                        ? "text-green-500"
                                        : "text-gray-500 transition-colors duration-1000"
                                    }text-gray-500 transition-colors duration-1000  hover:text-gray-200`}
                                    onClick={() =>
                                      handleCopyAssemblyMaterials(assembly.id)
                                    }
                                    title="Double click to copy"
                                  >
                                    Copy materials
                                  </button>
                                </CopyToClipboard>
                                <button
 className="w-15 px-4 py-2 font-medium hover:text-gray-100 text-gray-500 hover:bg-indigo-600 text-sm bg-pageBackground rounded"                                    onClick={() => handleEpicorFormat(assembly.id)}
                                >
                                  EPICOR Format
                                </button>
                               
                               
                              </div>
                            </div>
                            {/* TABLE ASSEMBLY DATA */}
                            
                              <div className="pt-2 pb-10 px-2">
                                <table className="w-full mt-4 border-collapse border border-gray-500 text-sm">
                                  <tbody>
                                    {[
                                      {
                                        label: "Identification Number",
                                        value: assembly.identification_number,
                                        className:
                                          "text-gray-500 italic font-medium",
                                      },
                                      {
                                        label: "Description",
                                        value: assembly.description,
                                      },
                                      {
                                        label: "Price",
                                        value: `$${assembly.price} USD`,
                                      },
                                      
                                    ].map((row, index) => (
                                      <tr key={index}>
                                        <td className="border border-blue-500 px-2 py-1">
                                          <strong>{row.label}</strong>
                                        </td>
                                        <td
                                          className={`border border-gray-500 px-2 py-1 ${
                                            row.className || ""
                                          }`}
                                        >
                                          {row.value}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            
                       
                              <div className="mt-3 mb-4 list-disc text-white">
                                {Array.isArray(itemsData[assembly.id]) &&
                                itemsData[assembly.id].length > 0 ? (
                                  itemsData[assembly.id].map((item, index) => (
                                    <div key={index}>
                                      <table className="text-sm table-auto w-full text-lightWhiteLetter">
                                        <tbody className="bg-gray-800 shadow-lg">
                                          <tr className="border-b border-gray-500 hover:bg-pageSideMenuTextHover transition duration-200">
                                            <td className="py-3 px-2 flex justify-between items-center">
                                              <div className="px-6">
                                                <span className="pr-6">
                                                  {index + 1}
                                                  {". "}
                                                </span>
                                                <span>
                                                  {item.number_material}
                                                </span>{" "}
                                                <span className="text-gray-500">
                                                  / {item.name}
                                                </span>
                                              </div>
                                              <div className="px-10">
                                                <div className="flex items-center space-x-4">
                                                  <button
                                                    onClick={() =>
                                                      handleItemButtonClick(
                                                        item.id
                                                      )
                                                    }
                                                    className="text-gray-500 cursor-pointer font-semibold px-10 hover:text-gray-200"
                                                  >
                                                    Description
                                                  </button>
                                                  
                                                </div>
                                              </div>
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
                                      {/* TABLE ITEM DATA */}
                                      {showItemInfo[item.id] && (
                                        <div className="pt-2 pb-10 px-2">
                                          <table className="w-full mt-4">
                                            <tbody>
                                              {[
                                                {
                                                  label: "Number Material",
                                                  value: item.number_material,
                                                },
                                                {
                                                  label: "Name",
                                                  value: item.name,
                                                },
                                                {
                                                  label: "Description",
                                                  value: item.description,
                                                },
                                                {
                                                  label: "Quantity required",
                                                  value:
                                                    item.subassembly_assignment_quantity,
                                                },
                                                {
                                                  label: "Cotizacion Number",
                                                  value: item.number_cotizacion,
                                                },
                                                {
                                                  label: "Price",
                                                  value: `$${item.price} MXN`,
                                                },
                                                {
                                                  label: "Supplier",
                                                  value: item.supplier,
                                                },
                                                
                                              ].map((row, index) => (
                                                <tr key={index}>
                                                  <td className="text-gray-400 font-medium border-r border-b border-gray-700 px-4 py-2">
                                                    {row.label}
                                                  </td>
                                                  <td
                                                    className={`text-gray-400 border-l border-b border-gray-700 px-4 py-2 ${
                                                      row.className || ""
                                                    }`}
                                                  >
                                                    {row.value}
                                                  </td>
                                                </tr>
                                              ))}
                                            </tbody>
                                          </table>
                                        </div>
                                      )}
                                    </div>
                                  ))
                                ) : (
                                  <>
                                    <div className="text-gray-500 mt-3 mb-4 text-center">
                                      {Array.isArray(
                                        subassembliesData[assembly.id]
                                      ) &&
                                      subassembliesData[assembly.id].length >
                                        0 ? (
                                        subassembliesData[assembly.id].map(
                                          (subassembly, i) => (
                                            <div key={i} className="px-10">
                                              <hr className="my-2 border-b border-gray-900 opacity-50 shadow-md" />
                                              <div className="flex items-center justify-between">
                                                <div>
                                                  <h3 className="text-base px-4 flex items-center">
                                                    <span
                                                      className="text-gray-300"
                                                    >
                                                      <div className="flex items-center space-x-2">
                                                        <div className="font-medium">
                                                          <span className="mx-2 text-gray-400">
                                                            {" "}
                                                            ➜{" "}
                                                          </span>
                                                          <span className="">
                                                            {
                                                              subassembly.identification_number
                                                            }
                                                          </span>
                                                        </div>
                                                       
                                                      </div>
                                                    </span>
                                                  </h3>
                                                </div>
                                                <div className="flex items-center space-x-4">
                                                 
                                                  <button
                                                    onClick={() =>
                                                      toggleSubassemblyList(
                                                        subassembly.id
                                                      )
                                                    }
                                                    className="px-4 py-2 bg-gray-500 text-sm text-gray-300 bg-pageBackground rounded hover:bg-gray-700"
                                                  >
                                                    <FontAwesomeIcon
                                                      icon={
                                                        isSubassemblyOpen[
                                                          subassembly.id
                                                        ]
                                                          ? faChevronUp
                                                          : faChevronDown
                                                      }
                                                    />
                                                  </button>
                                                  
                                                </div>
                                              </div>

                                              {isSubassemblyOpen[
                                                subassembly.id
                                              ] && (
                                                <>
                                                  {subassemblyError[subassembly.id] ? (
                                                    <div className="text-red-500 my-5 text-center">{subassemblyError[subassembly.id]}</div>
                                                  ) : subassemblyDetails[subassembly.id] && (
                                                    <div className="pt-2 pb-10 px-2">
                                                      <table className="w-full mt-4 border-collapse border border-gray-500 text-sm">
                                                        <tbody>
                                                          {[
                                                            { label: "Identification Number", value: subassemblyDetails[subassembly.id].identification_number },
                                                            { label: "Description", value: subassemblyDetails[subassembly.id].description },
                                                            { label: "Price", value: `$${subassemblyDetails[subassembly.id].price} USD` },
                                                            { label: "Total Subassembly Price", value: `$${calculateTotalSubassemblyPrice(subassembly.id)} USD` },
                                                            // Add more fields as needed
                                                          ].map((row, index) => (
                                                            <tr key={index}>
                                                               <td className="border border-blue-500 px-2 py-1">
                                                                <strong>{row.label}</strong>
                                                              </td>
                                                              <td className={`border border-gray-500 px-2 py-1 ${row.className || ""}`}>
                                                                {row.value}
                                                              </td>
                                                            </tr>
                                                          ))}
                                                        </tbody>
                                                      </table>
                                                    </div>
                                                  )}
                                                  {Array.isArray(
                                                    subassembliesItemsData[
                                                      subassembly.id
                                                    ]
                                                  ) &&
                                                  subassembliesItemsData[
                                                    subassembly.id
                                                  ].length > 0 ? (
                                                    subassembliesItemsData[
                                                      subassembly.id
                                                    ].map(
                                                      (subassemblyItem, j) => (
                                                        <div key={j}>
                                                          <table className="text-sm table-auto w-full text-lightWhiteLetter">
                                                            <tbody className="bg-gray-800 shadow-lg">
                                                              <tr className="border-b border-gray-500 hover:bg-pageSideMenuTextHover transition duration-200">
                                                                <td className="py-3 px-2 flex justify-between items-center">
                                                                  <div className="px-6">
                                                                    <span className="pr-6">
                                                                      {j + 1}
                                                                      {". "}
                                                                    </span>
                                                                    <span>
                                                                      {
                                                                        subassemblyItem.number_material
                                                                      }
                                                                    </span>{" "}
                                                                    <span className="text-gray-500">
                                                                      /{" "}
                                                                      {
                                                                        subassemblyItem.name
                                                                      }
                                                                    </span>
                                                                  </div>
                                                                  <div className="px-2">
                                                                    <div className="flex items-center space-x-4">
                                                                      <button
                                                                        onClick={() =>
                                                                          handleItemButtonClick(
                                                                            subassemblyItem.id
                                                                          )
                                                                        }
                                                                        className="text-gray-500 font-semibold px-10 hover:text-gray-200"
                                                                      >
                                                                        Description
                                                                      </button>
                                                                                                                                          </div>
                                                                  </div>
                                                                </td>
                                                              </tr>
                                                            </tbody>
                                                          </table>
                                                          {/* TABLE ITEM DATA */}
                                                          {showItemInfo[
                                                            subassemblyItem.id
                                                          ] && (
                                                            <div className="pt-2 pb-10 px-2">
                                                              <table className="w-full mt-4">
                                                                <tbody>
                                                                  {[
                                                                    {
                                                                      label:
                                                                        "Number Material",
                                                                      value:
                                                                        subassemblyItem.number_material,
                                                                    },
                                                                    {
                                                                      label:
                                                                        "Name",
                                                                      value:
                                                                        subassemblyItem.name,
                                                                    },
                                                                    {
                                                                      label:
                                                                        "Description",
                                                                      value:
                                                                        subassemblyItem.description,
                                                                    },
                                                                    {
                                                                      label:
                                                                        "Quantity required",
                                                                      value:
                                                                        subassemblyItem.subassembly_assignment_quantity,
                                                                    },
                                                                    {
                                                                      label:
                                                                        "Cotizacion Number",
                                                                      value:
                                                                        subassemblyItem.number_cotizacion,
                                                                    },
                                                                    {
                                                                      label:
                                                                        "Price",
                                                                      value: `$${subassemblyItem.price} MXN`,
                                                                    },
                                                                    {
                                                                      label:
                                                                        "Supplier",
                                                                      value:
                                                                        subassemblyItem.supplier,
                                                                    },
                                                                    {
                                                                      label:
                                                                        "Order Date",
                                                                      value:
                                                                        subassemblyItem.date_order,
                                                             
                                                                    },
                                                                    
                                                                    {
                                                                      label:
                                                                        "Arrived Date",
                                                                      value:
                                                                        subassemblyItem.arrived_date,
                                                                   
                                                                    },
                                                                  ].map(
                                                                    (
                                                                      item,
                                                                      index
                                                                    ) => (
                                                                      <tr
                                                                        key={
                                                                          index
                                                                        }
                                                                      >
                                                                        <td className="text-gray-400 font-medium border-r border-b border-gray-700 px-4 py-2">
                                                                          {
                                                                            item.label
                                                                          }
                                                                        </td>
                                                                        <td
                                                                          className={`text-gray-400 border-l border-b border-gray-700 px-4 py-2 ${
                                                                            item.className ||
                                                                            ""
                                                                          }`}
                                                                        >
                                                                          {
                                                                            item.value
                                                                          }
                                                                        </td>
                                                                      </tr>
                                                                    )
                                                                  )}
                                                                </tbody>
                                                              </table>
                                                            </div>
                                                          )}
                                                        </div>
                                                      )
                                                    )
                                                  ) : (
                                                    <div className="text-gray-500 my-5 text-center">
                                                      No items found
                                                    </div>
                                                  )}
                                                </>
                                              )}
                                            </div>
                                          )
                                        )
                                      ) : (
                                        <div className="text-gray-500 my-5 text-center">
                                          No items found
                                        </div>
                                      )}
                                    </div>
                                  </>
                                )}
                              </div>
                            
                            <hr className="my-2 border-b-2 border-gray-900" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          )
        )}
      </div>

      {/* MODALS */}
      {/* Generic modal */}
      <ModalAcept
        isOpen={isModalOpen}
        onClose={handleCancel}
        onContinue={modalAction}
        title="Material not received"
      >
        {modalMessage} {/* Message to show in the modal */}
      </ModalAcept>

      {/* Received success modal */}
      <Modal
        isOpen={isModalReceivedSuccess}
        onClose={() => setIsModalReceivedSuccess(false)}
        title="Material received"
      >
        Material has been marked as successfully received.
      </Modal>

      {/* Not received success modal */}
      <Modal
        isOpen={isModalNotReceivedSuccess}
        onClose={() => setIsModalNotReceivedSuccess(false)}
        title="Material not received"
      >
        Material has been marked as not received.
      </Modal>

      {/* EPICOR format modal */}
      <EpicorModal
        isOpen={isEpicorModalOpen}
        onClose={() => setIsEpicorModalOpen(false)}
        title="EPICOR Format"
      >
        <div className="overflow-auto max-w-full max-h-96">
          <div className="flex">
            <div className="overflow-auto max-w-full max-h-96 border-r border-gray-500">
              <table className="text-sm table-auto w-full border bg-white">
                <thead>
                  <tr className="w-full text-left">
                    <th className="px-1 py-1 bg-gray-800 text-center"></th>
                    {epicorData.some(item => item.subassembly_identification_number) && (
                      <th className="px-1 py-1 bg-green-900 border border-green-500 text-center text-gray">
                        A
                      </th>
                    )}
                    {["A", "B", "C", "D", "E", "F", "G", "H"].map((header, index) => (
                      <th
                        key={index}
                        className="px-1 py-1 bg-green-900 border border-green-500 text-center text-gray"
                      >
                        {epicorData.some(item => item.subassembly_identification_number) ? String.fromCharCode(66 + index) : header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="shadow-lg bg-white text-black">
                  <tr className="">
                    <td className="font-semibold px-2 py-2 bg-green-900 text-white border-green-500 border-b border-t border-r border-gray-700 text-center">
                      1
                    </td>
                    {epicorData.some(item => item.subassembly_identification_number) && (
                      <td className="px-2 py-2 bg-blue-900 border  border-blue-400 truncate text-white text-center font-semibold">
                        Subassembly ID
                      </td>
                    )}
                    {[
                      "Material",
                      "Part",
                      "Description",
                      "Quantity",
                      "Cost",
                      "-",
                      "-",
                      "Supplier"
                    ].map((header, index) => (
                      <td
                        key={index}
                        className="px-2 py-2 bg-blue-900 border  border-blue-400 truncate text-white text-center font-semibold"
                      >
                        {header}
                      </td>
                    ))}
                  </tr>
                  {epicorData.map((item, rowIndex) => (
                    <tr
                      key={rowIndex}
                      className=""
                    >
                      <td className="font-semibold px-2 py-2 bg-green-900 border-green-500 border-b border-t border-r border-gray-700 text-center text-white">
                        {rowIndex + 2}
                      </td>
                      {epicorData.some(item => item.subassembly_identification_number) && (
                        <td
                          className={`px-2 py-2 border border-gray-500 text-center truncate cursor-crosshair select-text ${
                            isSelected(rowIndex + 1, 0) ? "bg-blue-500 bg-opacity-50" : ""
                          }`}
                          onMouseDown={() => handleCellMouseDown(rowIndex + 1, 0)}
                          onMouseOver={() => handleCellMouseOver(rowIndex + 1, 0)}
                        >
                          {item.subassembly_identification_number || ""}
                        </td>
                      )}
                      {[
                        item.number_material,
                        item.name,
                        item.description,
                        item.subassembly_assignment_quantity,
                        item.price,
                        "FALSE",
                        "FALSE",
                        item.supplier
                      ].map((value, colIndex) => (
                        <td
                          key={colIndex}
                          className={`px-2 py-2 border border-gray-500 text-center truncate cursor-crosshair select-text ${
                            isSelected(rowIndex + 1, epicorData.some(item => item.subassembly_identification_number) ? colIndex + 1 : colIndex) ? "bg-blue-500 bg-opacity-50" : ""
                          }`}
                          onMouseDown={() => handleCellMouseDown(rowIndex + 1, epicorData.some(item => item.subassembly_identification_number) ? colIndex + 1 : colIndex)}
                          onMouseOver={() => handleCellMouseOver(rowIndex + 1, epicorData.some(item => item.subassembly_identification_number) ? colIndex + 1 : colIndex)}
                        >
                          {value}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="flex">
            <button
              onClick={handleCopySelectedCells}
              className="mt-2 ml-10 px-3 py-1 border border-blue-200 bg-blue-500 text-sm text-green-300 hover:border-blue-400 hover:bg-blue-800 hover:text-blue-200 rounded"
            >
              Copy selected cells in blue
            </button>
          </div>
        </div>
      </EpicorModal>
    </>
  );
};

export default OldProjectDetails;
