import React from "react";

import AppTable from "./ProjectsManagmentTable"; 
import AppForm from "./ProjectsManagmentFormTEST";

function RefactoringProjectsManagment() {
  return (
    <>
      <div className="px-4 py-5 min-h-screen">
        <h1 className="text-2xl mt-5 px-10 font-bold text-right">
          Projects management
        </h1>
        {/*<AppTable />*/} 
        <AppForm /> 
      </div>
    </>
  );
}

export default RefactoringProjectsManagment;
