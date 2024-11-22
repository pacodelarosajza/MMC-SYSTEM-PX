import React from "react";
import AppTable from "./MaterialsManagmentTable";

function RefactoringMaterialsManagment() {
  return (
    <>
      <div className="min-h-screen m-5 mt-10">
        <h1 className="text-3xl font-extrabold text-gray-500 mt-5 text-right">
          Materials management
        </h1>
        <div className="px-5 py-3">
          <AppTable />
        </div>   
         
      </div>
    </>
  );
}

export default RefactoringMaterialsManagment;
