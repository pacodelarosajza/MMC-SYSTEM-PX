import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import ModalSuccess from "../../../components/ModalSuccess";
import MtlTable from "./MtlTable"; // Import MtlTable component

const SubmitMaterials = ({ id }) => {
  const [assemblies, setAssemblies] = useState([]);
  const [subassemblies, setSubassemblies] = useState([]);
  const [showMessages, setShowMessages] = useState({});
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [isDragging, setIsDragging] = useState(false);
  const [materialsCount, setMaterialsCount] = useState({});
  const [materialsData, setMaterialsData] = useState({});
  const [isModalSuccessOpen, setIsModalSuccessOpen] = useState(false);
  const [isMtlTableOpen, setIsMtlTableOpen] = useState(false);
  const apiIpAddress = import.meta.env.VITE_API_IP_ADDRESS;
  const projectId = id; // Ensure project_id is always the id prop

  const toggleMessage = (key) => {
    setShowMessages((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleFileUpload = (key, file) => {
    if (
      file &&
      file.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = XLSX.utils.sheet_to_json(
            workbook.Sheets[sheetName]
          );
          setMaterialsCount((prev) => ({
            ...prev,
            [key]: worksheet.length,
          }));
          setMaterialsData((prev) => ({
            ...prev,
            [key]: worksheet,
          }));
        } catch (error) {
          console.error("Error reading Excel file:", error);
        }
      };
      reader.readAsArrayBuffer(file);
      setUploadedFiles((prev) => ({
        ...prev,
        [key]: file,
      }));
    } else {
      alert("Only .xlsx files are allowed");
    }
  };

  const handleFileRemove = (key) => {
    setUploadedFiles((prev) => {
      const newFiles = { ...prev };
      delete newFiles[key];
      return newFiles;
    });
    setMaterialsCount((prev) => {
      const newCount = { ...prev };
      delete newCount[key];
      return newCount;
    });
    setMaterialsData((prev) => {
      const newData = { ...prev };
      delete newData[key];
      return newData;
    });
  };

  useEffect(() => {
    const fetchAssemblies = async () => {
      try {
        const response = await fetch(
          `${apiIpAddress}/api/assembly/project/${id}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch assemblies");
        }
        const result = await response.json();
        setAssemblies(result);
      } catch (error) {
        console.error(error);
      }
    };

    fetchAssemblies();
  }, [id, apiIpAddress]);

  const fetchSubassemblies = async (assemblyId) => {
    try {
      const response = await fetch(
        `${apiIpAddress}/api/subassembly/assembly/${assemblyId}`
      );
      if (!response.ok) {
        return; // No subassemblies found, do not log an error
      }
      const result = await response.json();
      setSubassemblies((prev) => {
        const newSubassemblies = [...prev, ...result];
        const uniqueSubassemblies = newSubassemblies.filter(
          (subassembly, index, self) =>
            index === self.findIndex((s) => s.id === subassembly.id)
        );
        return uniqueSubassemblies;
      });
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    assemblies.forEach((assembly) => {
      fetchSubassemblies(assembly.id);
    });
  }, [assemblies]);

  const handleSaveAndContinue = async () => {
    for (const key in materialsData) {
      const [type, id] = key.split("-");
      let assemblyId = null;

      if (type === "subassembly") {
        try {
          const response = await fetch(`${apiIpAddress}/api/subassembly/${id}`);
          if (!response.ok) {
            throw new Error("Failed to fetch assembly_id for subassembly");
          }
          const result = await response.json();
          assemblyId = result.assembly_id;
        } catch (error) {
          console.error(error);
          alert("Failed to fetch assembly_id for subassembly");
          return;
        }
      } else {
        assemblyId = id;
      }

      for (const material of materialsData[key]) {
        const postData = {
          project_id: projectId,
          assembly_id: assemblyId,
          subassembly_id: type === "subassembly" ? id : null,
          name: material["PART NUMBER"],
          description: material["DESCRIPTION"],
          subassembly_assignment_quantity: material["QTY"],
          price: material["UNIT"],
          currency: "MXN",
          arrived_date: null,
          date_order: null,
          in_subassembly: 0,
          number_material: material["MTL"],
          number_cotizacion: material["PO"],
          supplier: material["SUPPLIER"],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        try {
          const response = await fetch(`${apiIpAddress}/api/postItem`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(postData),
          });
          const responseData = await response.json();
          if (!response.ok) {
            console.error("Response error:", responseData);
            throw new Error("Failed to post material");
          }
        } catch (error) {
          console.error("Error posting material:", error);
          if (error instanceof SyntaxError) {
            console.error("Server error: Response is not valid JSON");
          } else {
            console.error("Server error:", error.message);
          }
          alert("Failed to post material");
          return;
        }
      }
    }
    setIsModalSuccessOpen(true);
  };

  useEffect(() => {
    if (isModalSuccessOpen) {
      const timer = setTimeout(() => {
        handleModalSuccessClose();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isModalSuccessOpen]);

  const handleModalSuccessClose = () => {
    setIsModalSuccessOpen(false);
    setIsMtlTableOpen(true);
    document.querySelector('.submit-materials-container').style.display = 'none';
  };

  return (
    <>
      <div className="p-5 submit-materials-container fixed z-10 inset-0 flex items-center justify-center bg-black bg-opacity-60 transition-opacity duration-300">
        <div className="py-12 px-10 bg-white dark:bg-gray-800 rounded-lg shadow-2xl transform scale-100 transition-transform duration-200 w-full h-full overflow-y-auto scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-blue-200">
          <div className="px-2 flex flex-col justify-center items-center">
            <h1 className="text-1xl font-extrabold text-gray-500 text-right">
              Materials management
            </h1>
            <h2 className="text-3xl font-bold mb-10 text-blue-500">
              3. Submit Materials
            </h2>
            <table className="border border-gray-700 min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg mt-4">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b border-gray-700 bg-gray-700 text-center text-sm font-semibold text-gray-300">
                    Assembly
                  </th>
                  <th className="py-2 px-4 border-b border-gray-700 bg-gray-700 text-center text-sm font-semibold text-gray-300">
                    Subassembly
                  </th>
                  <th className="py-2 px-4 border-b border-gray-700 bg-gray-700 text-center text-sm font-semibold text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {assemblies.map((assembly, assemblyIndex) => (
                  <React.Fragment key={assembly.id}>
                    <tr className="hover:bg-gray-700 hover:bg-opacity-50">
                      <td className="bg-gray-700 bg-opacity-30 text-ms text-gray-300 font-medium border border-gray-600 text-center p-2">
                        {assembly.identification_number}
                      </td>
                      {subassemblies.filter(
                        (subassembly) => subassembly.assembly_id === assembly.id
                      ).length > 0 ? (
                        <>
                          <td className="text-xs text-gray-200 font-medium border border-gray-600 p-2 text-center bg-gray-700 bg-opacity-30">
                            {
                              subassemblies.filter(
                                (subassembly) =>
                                  subassembly.assembly_id === assembly.id
                              )[0].identification_number
                            }
                          </td>
                          <td className="text-xs text-gray-200 font-medium border border-gray-600 p-2">
                            <div className="flex justify-center items-center h-full">
                              <button
                                className="w-15 px-2 py-1 font-medium hover:bg-blue-600 text-xs bg-gray-800 rounded"
                                onClick={() =>
                                  toggleMessage(
                                    `subassembly-${
                                      subassemblies.filter(
                                        (subassembly) =>
                                          subassembly.assembly_id ===
                                          assembly.id
                                      )[0].id
                                    }`
                                  )
                                }
                              >
                                Materials
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="text-ms italic text-gray-500 font-medium border border-gray-600 text-center p-2">
                            No subassemblies
                          </td>
                          <td className="text-xs text-gray-200 font-medium border border-gray-600 p-2">
                            <div className="flex justify-center items-center h-full">
                              <button
                                className="w-15 px-2 py-1 font-medium hover:bg-blue-600 text-xs bg-gray-800 rounded"
                                onClick={() =>
                                  toggleMessage(`assembly-${assembly.id}`)
                                }
                              >
                                Materials
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                    {/* UPLOAD MATERIALS */}
                    {showMessages[`assembly-${assembly.id}`] &&
                      !subassemblies.filter(
                        (subassembly) => subassembly.assembly_id === assembly.id
                      ).length && (
                        <>
                          <tr className="bg-gray-900 bg-opacity-50">
                            <td
                              colSpan={5}
                              className="text-center font-semibold text-gray-400 text-lg pt-3"
                            >
                              {assembly.identification_number}
                            </td>
                          </tr>
                          <tr className="bg-gray-900 bg-opacity-50">
                            <td colSpan={5} className="text-center">
                              <div
                                className={`p-4 m-2 rounded-lg transition duration-200 ${
                                  !uploadedFiles[`assembly-${assembly.id}`]
                                    ? `border-2 border-dashed ${
                                        isDragging
                                          ? "bg-blue-500 opacity-40 border-white"
                                          : "border-blue-400 hover:border-blue-600"
                                      }`
                                    : ""
                                }`}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  setIsDragging(false);
                                  const file = e.dataTransfer.files[0];
                                  handleFileUpload(
                                    `assembly-${assembly.id}`,
                                    file
                                  );
                                }}
                                onDragOver={(e) => {
                                  e.preventDefault();
                                  setIsDragging(true);
                                }}
                                onDragLeave={() => setIsDragging(false)}
                              >
                                {!uploadedFiles[`assembly-${assembly.id}`] && (
                                  <>
                                    <p className="text-gray-500 transition duration-200">
                                      Drag and drop materials here or click to
                                      upload
                                    </p>
                                    <input
                                      type="file"
                                      accept=".xlsx"
                                      className="hidden"
                                      data-key={`assembly-${assembly.id}`}
                                      onChange={(e) => {
                                        const file = e.target.files[0];
                                        handleFileUpload(
                                          `assembly-${assembly.id}`,
                                          file
                                        );
                                      }}
                                    />
                                    <button
                                      className="bg-blue-900 text-blue-300 px-4 py-1 mt-3 rounded border border-blue-500 hover:bg-blue-700 hover:text-blue-200 hover:border-blue-400"
                                      onClick={() =>
                                        document
                                          .querySelector(
                                            `input[type="file"][data-key="assembly-${assembly.id}"]`
                                          )
                                          .click()
                                      }
                                    >
                                      Upload File
                                    </button>
                                  </>
                                )}
                                {uploadedFiles[`assembly-${assembly.id}`] && (
                                  <div className="p-2 border border-gray-300 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-between">
                                    <p className="text-gray-700 dark:text-gray-300 font-semibold text-sm">
                                      {
                                        uploadedFiles[`assembly-${assembly.id}`]
                                          .name
                                      }
                                    </p>
                                    <div className="flex items-center">
                                      <p className="text-gray-700 dark:text-gray-300 font-semibold text-sm mr-4">
                                        {
                                          materialsCount[
                                            `assembly-${assembly.id}`
                                          ]
                                        }{" "}
                                        materials
                                      </p>
                                      <button
                                        className="bg-red-900 text-red-300 px-4 py-1 rounded border border-red-500 hover:bg-red-700 hover:text-red-200 hover:border-red-400"
                                        onClick={() =>
                                          handleFileRemove(
                                            `assembly-${assembly.id}`
                                          )
                                        }
                                      >
                                        Remove File
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        </>
                      )}
                    {subassemblies
                      .filter(
                        (subassembly) => subassembly.assembly_id === assembly.id
                      )
                      .map((subassembly, subassemblyIndex) => (
                        <React.Fragment key={subassembly.id}>
                          {subassemblyIndex > 0 && (
                            <tr className="hover:bg-gray-700 hover:bg-opacity-50">
                              <td className="bg-gray-700 bg-opacity-30 text-ms text-gray-300 font-medium border border-gray-600 text-center p-2"></td>
                              <td className="text-xs text-gray-200 font-medium border border-gray-600 p-2 text-center bg-gray-700 bg-opacity-30">
                                {subassembly.identification_number}
                              </td>
                              <td className="text-xs text-gray-200 font-medium border-t border-b border-r border-gray-600 p-2">
                                <div className="flex justify-center items-center h-full">
                                  <button
                                className="w-15 px-2 py-1 font-medium hover:bg-blue-600 text-xs bg-gray-800 rounded"
                                onClick={() =>
                                      toggleMessage(
                                        `subassembly-${subassembly.id}`
                                      )
                                    }
                                  >
                                    Materials
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )}
                          {/* UPLOAD MATERIALS */}
                          {showMessages[`subassembly-${subassembly.id}`] && (
                            <>
                              <tr className="bg-gray-900 bg-opacity-50">
                                <td
                                  colSpan={5}
                                  className="text-center font-semibold text-gray-400 text-lg pt-3"
                                >
                                  {subassembly.identification_number}
                                </td>
                              </tr>
                              <tr className="bg-gray-900 bg-opacity-50">
                                <td colSpan={5} className="text-center">
                                  <div
                                    className={`p-4 m-2 rounded-lg transition duration-200 ${
                                      !uploadedFiles[
                                        `subassembly-${subassembly.id}`
                                      ]
                                        ? `border-2 border-dashed ${
                                            isDragging
                                              ? "bg-blue-500 opacity-40 border-white"
                                              : "border-blue-400 hover:border-blue-600"
                                          }`
                                        : ""
                                    }`}
                                    onDrop={(e) => {
                                      e.preventDefault();
                                      setIsDragging(false);
                                      const file = e.dataTransfer.files[0];
                                      handleFileUpload(
                                        `subassembly-${subassembly.id}`,
                                        file
                                      );
                                    }}
                                    onDragOver={(e) => {
                                      e.preventDefault();
                                      setIsDragging(true);
                                    }}
                                    onDragLeave={() => setIsDragging(false)}
                                  >
                                    {!uploadedFiles[
                                      `subassembly-${subassembly.id}`
                                    ] && (
                                      <>
                                        <p className="text-gray-500 transition duration-200">
                                          Drag and drop materials here or click
                                          to upload
                                        </p>
                                        <input
                                          type="file"
                                          accept=".xlsx"
                                          className="hidden"
                                          data-key={`subassembly-${subassembly.id}`}
                                          onChange={(e) => {
                                            const file = e.target.files[0];
                                            handleFileUpload(
                                              `subassembly-${subassembly.id}`,
                                              file
                                            );
                                          }}
                                        />
                                        <button
                                          className="bg-blue-900 text-blue-300 px-4 py-1 mt-3 rounded border border-blue-500 hover:bg-blue-700 hover:text-blue-200 hover:border-blue-400"
                                          onClick={() =>
                                            document
                                              .querySelector(
                                                `input[type="file"][data-key="subassembly-${subassembly.id}"]`
                                              )
                                              .click()
                                          }
                                        >
                                          Upload File
                                        </button>
                                      </>
                                    )}
                                    {uploadedFiles[
                                      `subassembly-${subassembly.id}`
                                    ] && (
                                      <div className="p-2 border border-gray-300 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-between">
                                        <p className="text-gray-700 dark:text-gray-300 font-semibold text-sm">
                                          {
                                            uploadedFiles[
                                              `subassembly-${subassembly.id}`
                                            ].name
                                          }
                                        </p>
                                        <div className="flex items-center">
                                          <p className="text-gray-700 dark:text-gray-300 font-semibold text-sm mr-4">
                                            {
                                              materialsCount[
                                                `subassembly-${subassembly.id}`
                                              ]
                                            }{" "}
                                            materials
                                          </p>
                                          <button
                                            className="bg-red-900 text-red-300 px-4 py-1 rounded border border-red-500 hover:bg-red-700 hover:text-red-200 hover:border-red-400"
                                            onClick={() =>
                                              handleFileRemove(
                                                `subassembly-${subassembly.id}`
                                              )
                                            }
                                          >
                                            Remove File
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            </>
                          )}
                        </React.Fragment>
                      ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pt-20 flex justify-center gap-4">
            <button
              onClick={handleSaveAndContinue}
              className=" px-4 py-2 font-medium hover:bg-blue-600 bg-pageBackground rounded"
                  >
                    
                      Save and continue
                  
            </button>
          </div>
        </div>
      </div>

      <ModalSuccess
        isOpen={isModalSuccessOpen}
        onClose={handleModalSuccessClose}
        title="Materials posted successfully!"
      >
        <p className="text-5xl text-green-500">✔</p>
      </ModalSuccess>

      {isMtlTableOpen && <MtlTable id={id} />}
    </>
  );
};

export default SubmitMaterials;
