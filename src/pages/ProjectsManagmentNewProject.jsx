import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import AppForm from "./ProjectsManagmentForm";
import Modal from "./Modal";

const ProjectsManagmentForm = () => {
  const apiIpAddress = import.meta.env.VITE_API_IP_ADDRESS; // API IP address

  //STATES FOR THE NEW PROJECT
  // Initial states for the project and user-project relationship
  const initialProjectState = {
    identification_number: "",
    delivery_date: "",
    completed: 0,
    cost_material: "",
    description: "",
  };
  const [newProject, setNewProject] = useState(initialProjectState);

  // STATES FOR THE PROJECT MANAGER AND PERSONNEL WITH RECEPTION AUTHORIZATION SELECTORS
  const [adminUsers, setAdminUsers] = useState([]);
  const [userSelections, setUserSelections] = useState([
    // Initial state for the project manager selector
    { id: Date.now(), value: "" },
  ]);
  const [operUsers, setOperUsers] = useState([]);
  const [userOperSelections, setUserOperSelections] = useState([
    // Initial state for the personnel with reception authorization selector
    { id: Date.now(), value: "" },
  ]);

  // STATE FOR THE ASSEMBLIES AND SUBASSEMBLIES TABLE
  const [InTable, setInTable] = useState([]); // Assemblies table states
  const [InTableSubass, setInTableSubass] = useState([]); // Subassemblies table states

  // FETCH ADMIN AND OPERATIONAL USERS WHEN THE COMPONENT MOUNTS. GETERS
  useEffect(() => {
    fetchAdminUsers();
    fetchOperUsers();
  }, []);

  const fetchAdminUsers = async () => {
    try {
      const response = await axios.get(`${apiIpAddress}/getUsersByUserType/1`);
      setAdminUsers(response.data);
    } catch (error) {
      console.error("Error fetching admin users:", error);
    }
  };

  const fetchOperUsers = async () => {
    try {
      const response = await axios.get(`${apiIpAddress}/getUsersByUserType/2`);
      setOperUsers(response.data);
    } catch (error) {
      console.error("Error fetching operational users:", error);
    }
  };

  // STATES FOR MODAL ERROR FORM WINDOW
  const [isModalErrorProjectFieldsOpen, setIsModalErrorProjectFieldsOpen] =
    useState(false);
  const [isModalErrorUserAdminFieldOpen, setIsModalErrorUserAdminFieldOpen] =
    useState(false);
  const [isModalErrorUserOperFieldOpen, setIsModalErrorUserOperFieldOpen] =
    useState(false);
  const [isModalErrorAssemblyFieldOpen, setIsModalErrorAssemblyFieldOpen] =
    useState(false);
  const [
    isModalErrorSubassemblyFieldOpen,
    setIsModalErrorSubassemblyFieldOpen,
  ] = useState(false);

  // STATES FOR MODAL SUCCESS FORM WINDOW
  const [isModalSuccessProjectOpen, setIsModalSuccessProjectOpen] =
    useState(false);

  // TODO: HANDLE CREATE PROJECT
  const handleCreateProject = async (event) => {
    event.preventDefault();

    // Validar campos requeridos
    if (
      !newProject.identification_number ||
      !newProject.cost_material ||
      !newProject.delivery_date
    ) {
      setIsModalErrorProjectFieldsOpen(true);
      return;
    }

    try {
      if (
        userSelections.length === 0 ||
        userSelections.some((selection) => !selection.value)
      ) {
        setIsModalErrorUserAdminFieldOpen(true);
        return;
      }
      if (
        userOperSelections.length === 0 ||
        userOperSelections.some((selection) => !selection.value)
      ) {
        setIsModalErrorUserOperFieldOpen(true);
        return;
      }
      if (InTable.length === 0) {
        setIsModalErrorAssemblyFieldOpen(true);
        return;
      }
      /*if (InTableSubass.length === 0) {
        setIsModalErrorSubassemblyFieldOpen(true);
        return;
      }*/

      // Post the new project
      const projectResponse = await axios.post(
        `${apiIpAddress}/api/postProject`,
        newProject
      );
      const projectId = projectResponse.data.id;

      // Post each user-project relationship
      const userProjectPromises = userSelections.map((userSelection) =>
        axios.post(`${apiIpAddress}/api/user_assign_project`, {
          users_id: userSelection.value,
          project_id: projectId, // Use `project_id` as expected by the API
        })
      );
      const userOperProjectPromises = userOperSelections.map(
        (userOperSelection) =>
          axios.post(`${apiIpAddress}/api/user_assign_project`, {
            users_id: userOperSelection.value,
            project_id: projectId, // Use `project_id` as expected by the API
          })
      );
      await Promise.all([...userProjectPromises, ...userOperProjectPromises]);

      const assemblyPromises = InTable.map((row) =>
        axios.post(`${apiIpAddress}/api/postAssembly`, {
          project_id: projectId,
          identification_number: row.identification_number,
          description: row.description, // || null,
          delivery_date: row.delivery_date,
          completed_date: null,
          price: row.price,
          currency: "MXN",
          completed: 0,
        })
      );
      const assemblyResponses = await Promise.all(assemblyPromises);
      const assemblyIds = assemblyResponses.map((response) => response.data.id);

      /*post each subassembly
      const subassemblyPromises = InTableSubass.map((rowSubass) =>
        axios.post(`${apiIpAddress}/api/postSubassembly`, {
          assembly_id: rowSubass.assemblyIds,
          identification_number: rowSubass.identification_number,
          description: rowSubass.description || null,
          delivery_date: rowSubass.delivery_date,
          completed_date: null,
          price: rowSubass.price,
          currency: "MXN",
          completed: 0,
        })
      );
      const subassemblyResponses = await Promise.all(subassemblyPromises);
      const subassemblyIds = subassemblyResponses.map(
        (response) => response.data.id
      );*/

      // Reset form state after successful submission
      setNewProject(initialProjectState);
      setUserSelections([{ id: Date.now(), value: "" }]);
      setUserOperSelections([{ id: Date.now(), value: "" }]);
      setInTable([]);
      //setInTableSubass([]);
      /*alert(`Project registration successful. Project ID: ${projectId}`);
      alert(
        `Assembly registration successful. Assembly IDs: ${assemblyIds.join(
          ", "
        )}`
      );*/
      setIsModalSuccessProjectOpen(true);
      /*alert(
        `Subassembly registration successful. Subassembly IDs: ${subassemblyIds.join(
          ", "
        )}`
      );*/
    } catch (error) {
      console.error("Error creating project:", error);
      alert("Project registration failed: " + error.message);
    }
  };

  //HANDLE INPUT CHANGE FOR NEW PROJECT
  const handleChange = (event) => {
    const { name, value } = event.target;
    setNewProject((prevProject) => ({
      ...prevProject,
      [name]: value,
    }));
  };

  //PROJECT MANAGER AND PERSONNEL WITH RECEPTION AUTHORIZATION SELECTORS OPERATIONS
  // PROJECT MANAGER SELECTOR OPERATIONS
  const addUserSelection = () => {
    setUserSelections([...userSelections, { id: Date.now(), value: "" }]);
  };

  const removeUserSelection = (id) => {
    setUserSelections(
      userSelections.filter((userSelection) => userSelection.id !== id)
    );
  };

  const handleUserChange = (id, value) => {
    setUserSelections(
      userSelections.map((userSelection) =>
        userSelection.id === id ? { ...userSelection, value } : userSelection
      )
    );
  };

  const selectedUsers = userSelections.map(
    (userSelection) => userSelection.value
  );

  // PERSONNEL WITH RECEPTION AUTHORIZATION SELECTOR OPERATIONS
  const addUserOperSelection = () => {
    setUserOperSelections([
      ...userOperSelections,
      { id: Date.now(), value: "" },
    ]);
  };

  const removeUserOperSelection = (id) => {
    setUserOperSelections(
      userOperSelections.filter(
        (userOperSelection) => userOperSelection.id !== id
      )
    );
  };

  const handleUserOperChange = (id, value) => {
    setUserOperSelections(
      userOperSelections.map((userOperSelection) =>
        userOperSelection.id === id
          ? { ...userOperSelection, value }
          : userOperSelection
      )
    );
  };

  const selectedUsersOper = userOperSelections.map(
    (userOperSelection) => userOperSelection.value
  );

  // NEW PROJECT "CARD" OPERATIONS
  const [showCard, setShowCard] = useState(false);
  const handleButtonClick = () => {
    setShowCard(!showCard);
  };

  // ASSEMBLIES AND SUBASSEMBLIES TABLE OPERATIONS
  // ASSEMBLIES TABLE OPERATIONS

  const [isDivVisible, setIsDivVisible] = useState(false);
  const handleToggleDiv = () => {
    setIsDivVisible(!isDivVisible); // Toggle visibility of the div
  };

  const addRowInTable = () => {
    const newRow = {
      id: Date.now(),
      identification_number: "",
      description: "",
      delivery_date: "",
      price: "",
    };
    setInTable([...InTable, newRow]);
  };

  const removeRow = (id) => {
    setInTable(InTable.filter((row) => row.id !== id)); // Remove a row from the assemblies table
  };

  const handleInputChange = (id, field, value) => {
    const updatedTable = InTable.map((row) => {
      if (row.id === id) {
        return { ...row, [field]: value };
      }
      return row;
    });
    setInTable(updatedTable);
  };

  // SUBASSEMBLIES TABLE OPERATIONS
  const [isDivVisibleSubass, setIsDivVisibleSubass] = useState(false);
  const handleToggleDivSubass = () => {
    setIsDivVisibleSubass(!isDivVisibleSubass); // Toggle visibility of the subassemblies div
  };

  const addRowInTableSubass = () => {
    const newRowSubass = {
      id: Date.now(),
      identification_number: "",
      description: "",
      delivery_date: "",
      price: "",
    };
    setInTableSubass([...InTableSubass, newRowSubass]);
  };

  const removeRowSubass = (id) => {
    setInTableSubass(InTableSubass.filter((rowSubass) => rowSubass.id !== id)); // Remove a row from the subassemblies table
  };

  const handleInputChangeSubass = (id, field, value) => {
    const updatedTable = InTableSubass.map((rowSubass) => {
      if (rowSubass.id === id) {
        return { ...rowSubass, [field]: value };
      }
      return rowSubass;
    });
    setInTableSubass(updatedTable);
  };

  // SELECTOR FOR CHOOSING THE WAY TO REGISTER MATERIALS
  const [addItemsForm, setaddItemsForm] = useState("");
  const handleAddItemsForm = (event) => {
    setaddItemsForm(event.target.value); // Handle change in the selector for choosing the way to register materials
  };

  // SELECTOR FILE CONTAINER OPERATIONS
  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const handleFileClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0]; // Handle file change
    if (file) {
      setFileName(file.name);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault(); // Handle drag over
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false); // Handle drag leave
  };

  const handleDrop = (event) => {
    event.preventDefault(); // Handle drop
    setDragActive(false);
    const file = event.dataTransfer.files[0];
    if (file) {
      setFileName(file.name);
    }
  };

  const handleRemoveFile = () => {
    setFileName(""); // Handle remove file
    fileInputRef.current.value = null;
  };

  return (
    <div className=" py-10 pb-20">
      <button
        onClick={handleButtonClick}
        className="w-full bg-gray-900 border border-blue-500 text-blue-400 font-bold shadow-lg px-5 py-2 my-2 hover:border hover:bg-blue-900 hover:border-blue-500 hover:text-blue-300 rounded"
      >
        Register a new project
      </button>

      {showCard && (
        <div className="bg-gray-800 px-5 rounded-lg shadow-lg mb-5">
          <div className="pt-5 pb-3 text-sm text-gray-200">
            <h5 className=" pb-1 ">
              Complete the following information to register a project. Remember
              that, although you can edit the data later, once uploaded, all
              users will be able to see the project information.
              <strong>
                {" "}
                Fields marked with <span className="text-red-500">*</span> are
                required.
              </strong>
            </h5>
          </div>
          <AppForm />
        </div>
      )}
    </div>
  );
};

export default ProjectsManagmentForm;
