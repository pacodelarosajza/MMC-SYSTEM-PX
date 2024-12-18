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
import ModalAccept from "../../../components/ModalAcept"; // Corrected import statement
import EpicorModal from "../../../components/EpicorModal"; // Updated import path
import { debounce } from "lodash";
import { FaHourglassHalf } from "react-icons/fa";

const ProjectDetails = ({ identificationNumber }) => {
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
  const [showSubassemblyInfo, setShowSubassemblyInfo] = useState({}); // Table subassembly data section

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
      for (
        let i = Math.min(startRow, rowIndex);
        i <= Math.max(startRow, rowIndex);
        i++
      ) {
        for (
          let j = Math.min(startCol, colIndex);
          j <= Math.max(startCol, colIndex);
          j++
        ) {
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
    return selectedCells
      .map(([rowIndex, colIndex]) => {
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
      })
      .join("\n");
  };

  const handleCopySelectedCells = () => {
    const selectedData = getSelectedCellsData();
    navigator.clipboard.writeText(selectedData);
  };

  const handleKeyDown = (event) => {
    if (event.ctrlKey && event.key === "c") {
      // Removed functionality for copying selected cells using Ctrl+C
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

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
                  subassembly.completed_date = new Date().toISOString();
                  try {
                    await axios.patch(`${apiIpAddress}/api/patchSubassembly/${subassembly.id}`, {
                      completed: 1,
                      completed_date: subassembly.completed_date,
                    });
                  } catch (error) {
                    if (error.response && error.response.status === 404) {
                      console.error(`Subassembly ${subassembly.id} not found.`);
                    } else {
                      throw error;
                    }
                  }
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
            assembly.completed_date = new Date().toISOString();
            try {
              await axios.patch(`${apiIpAddress}/api/patchAssembly/${assembly.id}`, {
                completed: 1,
                completed_date: assembly.completed_date,
              });
            } catch (error) {
              if (error.response && error.response.status === 404) {
                console.error(`Assembly ${assembly.id} not found.`);
              } else {
                throw error;
              }
            }
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
    } catch (error) {
      console.log("Error fetching project: ", error);
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
    setIsSubassemblyOpen((prevState) => ({
      ...prevState,
      [subassemblyId]: !prevState[subassemblyId],
    }));
  };
  // Handle button click to show item info
  const handleItemButtonClick = (itemId) => {
    setShowItemInfo((prevState) => ({
      ...prevState,
      [itemId]: !prevState[itemId],
    }));
  };

  // Handle button click to show subassembly info
  const handleSubassemblyButtonClick = (subassemblyId) => {
    setShowSubassemblyInfo((prevState) => ({
      ...prevState,
      [subassemblyId]: !prevState[subassemblyId],
    }));
  };

  // OTHER FUNCTIONS
  // Handle copy assembly materials
  const handleCopyAssemblyMaterials = async (assemblyId) => {
    const assemblyItems = itemsData[assemblyId] || [];
    const subassemblyItems = subassembliesData[assemblyId]
      ? subassembliesData[assemblyId].flatMap(
          (subassembly) => subassembliesItemsData[subassembly.id] || []
        )
      : [];

    const allItems = [...assemblyItems, ...subassemblyItems];
    if (allItems.length === 0) {
      setTextToCopy("No materials to copy.");
    } else {
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
    }

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
          return {
            ...item,
            subassembly_identification_number:
              subassembly.identification_number,
          };
        }
        return item;
      })
    );

    setEpicorData(itemsWithSubassemblyInfo);
    setIsEpicorModalOpen(true);
  };

  return (
    <>
      {/* PROJECT DETAILS */}
      <div className="pt-20">
        <h2 className="text-2xl pb-3 font-bold text-gray-500 text-center">
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
          project && assembliesData[project.id] && (
            <div>
              <div className="pb-20">
                {/* LIST OF ASSEMBLIES */}
                {Array.isArray(assembliesData[project.id]) &&
                  assembliesData[project.id].length > 0 && (
                    <div className=" pb-25">
                      <div className="flex justify-end">
                        <button
                          onClick={refreshData}
                          className="p-2 my-4 mx-4 text-white rounded hover:bg-gray-800 transition duration-200"
                        >
                          <FontAwesomeIcon
                            icon={faSync}
                            color="gray"
                            size="lg"
                          />
                        </button>
                      </div>
                      <div className="pt-3">
                        {/* LIST OF ASSEMBLIES */}
                        {assembliesData[project.id].map((assembly, i) => (
                          <div className="mb-5" key={i}>
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="text-base px-4 flex items-center">
                                  <span
                                    className={`${
                                      assembly.completed === 0
                                        ? "text-gray-200"
                                        : ""
                                    }`}
                                  >
                                    <div className="flex items-center space-x-2">
                                      <div className="font-medium">
                                        {i + 1}.{" "}
                                        <span className="ml-2 text-gray-300">
                                          {assembly.identification_number}
                                        </span>
                                      </div>
                                      <div>
                                        {assembly.completed === 0 ? (
                                          <span className="mx-2 underline italic text-yellow-500 text-xs">
                                            <FaHourglassHalf />
                                          </span>
                                        ) : (
                                          <FontAwesomeIcon
                                            icon={faCheck}
                                            className="text-green-500"
                                          />
                                        )}
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
                                    } hover:text-gray-200`}
                                    onClick={() =>
                                      handleCopyAssemblyMaterials(assembly.id)
                                    }
                                    title="Double click to copy"
                                  >
                                    Copy materials
                                  </button>
                                </CopyToClipboard>
                                <button
                                  className="w-15 px-4 py-2 font-medium hover:text-gray-100 text-gray-500 hover:bg-indigo-600 text-sm bg-pageBackground rounded"
                                  onClick={() =>
                                    handleEpicorFormat(assembly.id)
                                  }
                                >
                                  EPICOR Format
                                </button>
                                <button
                                  onClick={() => handleButtonClick(assembly.id)}
                                  className="w-15 px-4 py-2 font-medium hover:bg-blue-600 text-sm bg-pageBackground rounded text-gray-300 hover:text-gray-100"
                                >
                                  Assembly File
                                </button>
                                <button
                                  onClick={() => toggleList(i)}
                                  className="px-4 text-gray-300 bg-pageBackground rounded"
                                >
                                  <FontAwesomeIcon
                                    icon={
                                      isOpen[i]
                                        ? faChevronCircleUp
                                        : faChevronCircleDown
                                    }
                                    size="1x"
                                    className="text-pageBackground bg-gray-500 p-2 rounded hover:bg-pageBackground hover:text-gray-500 transition duration-300 ease-in-out"
                                  />
                                </button>
                              </div>
                            </div>
                            {/* TABLE ASSEMBLY DATA */}
                            {showInfo[assembly.id] && (
                              <div className="pt-2 pb-10 px-2">
                                <table className="w-full mt-4 border-collapse border border-gray-500">
                                  <tbody>
                                    {[
                                      {
                                        label: "Identification Number",
                                        value: assembly.identification_number,
                                        className:
                                          "text-gray-500 italic text-base font-medium",
                                      },
                                      {
                                        label: "Description",
                                        value: assembly.description || "No description available",
                                      },
                                      {
                                        label: "Price",
                                        value: `$${assembly.price} MXN`,
                                      },
                                      {
                                        label: "Delivery Date",
                                        value: assembly.delivery_date,
                                      },
                                      {
                                        label: "Status",
                                        value: getAssemblyStatus(
                                          assembly.completed
                                        ),
                                        className:
                                          "bg-blue-900 bg-opacity-50 text-gray-400 italic",
                                      },
                                      {
                                        label: "Completed Date",
                                        value: formatDate(assembly.completed_date),
                                        className:
                                          "bg-blue-900 bg-opacity-50 text-gray-400 italic",
                                      },
                                    ].map((row, index) => (
                                      <tr key={index}>
                                        <td className="border border-blue-500 px-4 py-2">
                                          <strong>{row.label}</strong>
                                        </td>
                                        <td
                                          className={`border border-gray-500 px-4 py-2 ${
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
                            {/* LIST OF ITEMS */}
                            {isOpen[i] && (
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
                                                  <input
                                                    type="checkbox"
                                                    onChange={(e) =>
                                                      handleCheckboxChange(
                                                        e,
                                                        item.id
                                                      )
                                                    }
                                                    defaultChecked={
                                                      item.in_subassembly === 1
                                                    }
                                                    className="cursor-pointer appearance-none h-5 w-5 border rounded-sm bg-white checked:bg-green-600 checked:border-transparent focus:outline-none"
                                                  />
                                                  <FontAwesomeIcon
                                                    icon={faCheckCircle}
                                                    className={
                                                      item.in_subassembly === 1
                                                        ? "text-green-500"
                                                        : "text-gray-500"
                                                    }
                                                  />
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
                                                  value: item.description || "No description available",
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
                                                {
                                                  label: "Order Date",
                                                  value: item.date_order,
                                                  className: "italic",
                                                },
                                                {
                                                  label: "Status",
                                                  value:
                                                    item.in_subassembly ===
                                                    1 ? (
                                                      <span className="text-green-500 italic">
                                                        Received
                                                      </span>
                                                    ) : (
                                                      <span className="text-red-500 italic">
                                                        Not Received
                                                      </span>
                                                    ),
                                                },
                                                {
                                                  label: "Arrived Date",
                                                  value: item.arrived_date,
                                                  className:
                                                    "text-gray-200 font-medium italic",
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
                                    <div className="mt-3 mb-4 list-disc text-white">
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
                                                      className={`${
                                                        subassembly.completed ===
                                                        0
                                                          ? "text-gray-200"
                                                          : ""
                                                      }`}
                                                    >
                                                      <div className="flex items-center space-x-2">
                                                        <div className="font-medium">
                                                          <span className="mx-2">
                                                            {" "}
                                                            ➜{" "}
                                                          </span>
                                                          <span className="text-gray-300">
                                                            {
                                                              subassembly.identification_number
                                                            }
                                                          </span>
                                                        </div>
                                                        <div>
                                                          {subassembly.completed ===
                                                          0 ? (
                                                            <span className="mx-2 underline italic text-yellow-400 text-xs">
                                                              <FaHourglassHalf />
                                                            </span>
                                                          ) : (
                                                            <FontAwesomeIcon
                                                              icon={faCheck}
                                                              className="text-green-500"
                                                            />
                                                          )}
                                                        </div>
                                                      </div>
                                                    </span>
                                                  </h3>
                                                </div>
                                                <div className="flex items-center space-x-4">
                                                  <button
                                                    onClick={() =>
                                                      handleSubassemblyButtonClick(
                                                        subassembly.id
                                                      )
                                                    }
                                                    className="w-15 px-4 py-2 font-medium hover:bg-blue-500 text-xs bg-pageBackground rounded text-gray-500 hover:text-gray-100"
                                                  >
                                                    Subassembly File
                                                  </button>
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
                                              {/* TABLE SUBASSEMBLY DATA */}
                                              {showSubassemblyInfo[
                                                subassembly.id
                                              ] && (
                                                <div className="pt-2 pb-10 px-2">
                                                  <table className="w-full mt-4 border-collapse border border-gray-500">
                                                    <tbody>
                                                      {[
                                                        {
                                                          label:
                                                            "Identification Number",
                                                          value:
                                                            subassembly.identification_number,
                                                          className:
                                                            "text-gray-500 italic text-base font-medium",
                                                        },
                                                        {
                                                          label: "Description",
                                                          value:
                                                            subassembly.description || "No description available",
                                                        },
                                                        {
                                                          label: "Price",
                                                          value: `$${subassembly.price} MXN`,
                                                        },
                                                        {
                                                          label:
                                                            "Delivery Date",
                                                          value:
                                                            subassembly.delivery_date,
                                                        },
                                                        {
                                                          label: "Status",
                                                          value:
                                                            getAssemblyStatus(
                                                              subassembly.completed
                                                            ),
                                                          className:
                                                            "bg-blue-900 bg-opacity-50 text-gray-400 italic",
                                                        },
                                                        
                                                      ].map((row, index) => (
                                                        <tr key={index}>
                                                          <td className="border border-blue-500 px-4 py-2">
                                                            <strong>
                                                              {row.label}
                                                            </strong>
                                                          </td>
                                                          <td
                                                            className={`border border-gray-500 px-4 py-2 ${
                                                              row.className ||
                                                              ""
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
                                              {isSubassemblyOpen[
                                                subassembly.id
                                              ] && (
                                                <>
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
                                                                      <input
                                                                        type="checkbox"
                                                                        onChange={(
                                                                          e
                                                                        ) =>
                                                                          handleCheckboxChange(
                                                                            e,
                                                                            subassemblyItem.id
                                                                          )
                                                                        }
                                                                        defaultChecked={
                                                                          subassemblyItem.in_subassembly ===
                                                                          1
                                                                        }
                                                                        className="cursor-pointer appearance-none h-5 w-5 border rounded-sm bg-white checked:bg-green-600 checked:border-transparent focus:outline-none cursor-pointer"
                                                                      />
                                                                      <FontAwesomeIcon
                                                                        icon={
                                                                          faCheckCircle
                                                                        }
                                                                        className={
                                                                          subassemblyItem.in_subassembly ===
                                                                          1
                                                                            ? "text-green-500"
                                                                            : "text-gray-500"
                                                                        }
                                                                      />
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
                                                                        subassemblyItem.description || "No description available",
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
                                                                      className:
                                                                        "italic",
                                                                    },
                                                                    {
                                                                      label:
                                                                        "Status",
                                                                      value:
                                                                        subassemblyItem.in_subassembly ===
                                                                        1 ? (
                                                                          <span className="text-green-500 italic">
                                                                            Received
                                                                          </span>
                                                                        ) : (
                                                                          <span className="text-red-500 italic">
                                                                            Not
                                                                            Received
                                                                          </span>
                                                                        ),
                                                                    },
                                                                    {
                                                                      label:
                                                                        "Arrived Date",
                                                                      value:
                                                                        subassemblyItem.arrived_date,
                                                                      className:
                                                                        "text-gray-200 font-medium italic",
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
                            )}
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
      <ModalAccept
        isOpen={isModalOpen}
        onClose={handleCancel}
        onContinue={modalAction}
        title="Material not received"
      >
        {modalMessage} {/* Message to show in the modal */}
      </ModalAccept>

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
        <style>
          {`
            .epicor-modal ::selection {
              background: #66ff0071; /* Color de fondo de la selección */
              color: #000000; /* Color del texto seleccionado */
              text-decoration: underline 3px; /* Subrayado más grueso */
            }
          `}
        </style>
        <div className="epicor-modal overflow-auto max-w-full max-h-96">
          <div className="flex">
            <div className="overflow-auto max-w-full max-h-96 border-r border-gray-500">
              <table className="text-sm table-auto w-full border bg-white">
                <thead>
                  <tr className="w-full text-left">
                    <th className="px-1 py-1 bg-gray-800 text-center"></th>
                    {epicorData.some(
                      (item) => item.subassembly_identification_number
                    ) && (
                      <th className="px-1 py-1 bg-green-900 border border-green-500 text-center text-gray">
                        A
                      </th>
                    )}
                    {["A", "B", "C", "D", "E", "F", "G", "H"].map(
                      (header, index) => (
                        <th
                          key={index}
                          className="px-1 py-1 bg-green-900 border border-green-500 text-center text-gray"
                        >
                          {epicorData.some(
                            (item) => item.subassembly_identification_number
                          )
                            ? String.fromCharCode(66 + index)
                            : header}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="shadow-lg bg-white text-black">
                  <tr className="">
                    <td className="font-semibold px-2 py-2 bg-green-900 text-white border-green-500 border-b border-t border-r border-gray-700 text-center">
                      1
                    </td>
                    {epicorData.some(
                      (item) => item.subassembly_identification_number
                    ) && (
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
                      "Supplier",
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
                    <tr key={rowIndex} className="">
                      <td className="font-semibold px-2 py-2 bg-green-900 border-green-500 border-b border-t border-r border-gray-700 text-center text-white">
                        {rowIndex + 2}
                      </td>
                      {epicorData.some(
                        (item) => item.subassembly_identification_number
                      ) && (
                        <td
                          className={`px-2 py-2 border border-gray-500 text-center truncate cursor-crosshair select-text ${
                            isSelected(rowIndex + 1, 0)
                              ? "bg-blue-500 bg-opacity-50"
                              : ""
                          }`}
                          onMouseDown={() =>
                            handleCellMouseDown(rowIndex + 1, 0)
                          }
                          onMouseOver={() =>
                            handleCellMouseOver(rowIndex + 1, 0)
                          }
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
                        item.supplier,
                      ].map((value, colIndex) => (
                        <td
                          key={colIndex}
                          className={`px-2 py-2 border border-gray-500 text-center truncate cursor-crosshair select-text ${
                            isSelected(
                              rowIndex + 1,
                              epicorData.some(
                                (item) => item.subassembly_identification_number
                              )
                                ? colIndex + 1
                                : colIndex
                            )
                              ? "bg-blue-500 bg-opacity-50"
                              : ""
                          }`}
                          onMouseDown={() =>
                            handleCellMouseDown(
                              rowIndex + 1,
                              epicorData.some(
                                (item) => item.subassembly_identification_number
                              )
                                ? colIndex + 1
                                : colIndex
                            )
                          }
                          onMouseOver={() =>
                            handleCellMouseOver(
                              rowIndex + 1,
                              epicorData.some(
                                (item) => item.subassembly_identification_number
                              )
                                ? colIndex + 1
                                : colIndex
                            )
                          }
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

export default ProjectDetails;
