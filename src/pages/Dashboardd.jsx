<main className={`flex-1 p-4 transition-all duration-300 ml-64 mr-64`}>
  {!showChildRoutes ? (
    <>
      <h1 className="text-2xl font-semibold mb-4"> Dashboard</h1>
      <p className="text-2xl font-semibold mb-4"> Proyectos</p>

      {/* Projects Overview Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-4 overflow-auto max-h-[calc(100vh-150px)]">
        {projects.map((project) => (
          <div
            key={project.id}
            className="bg-gray-700 p-3 rounded-lg shadow-md text-sm cursor-pointer hover:bg-gray-600 transition duration-200"
            onClick={() => alert(`Detalles del Proyecto ID: ${project.id}`)}
          >
            <h2 className="font-bold text-lg">ID: {project.id}</h2>
            <p className="text-blue-400"><strong>Número de Identificación:</strong> {project.identification_number}</p>
            <p className="text-green-400"><strong>Fecha de Entrega:</strong> {new Date(project.delivery_date).toLocaleDateString()}</p>
            <p className={`font-semibold ${project.completed ? 'text-green-500' : 'text-red-500'}`}><strong>Estado:</strong> {project.completed ? 'Completo' : 'Incompleto'}</p>
            <p className="text-yellow-400"><strong>Costo de Material:</strong> ${project.cost_material}</p>
            <p className="text-purple-400"><strong>Descripción:</strong> {project.description}</p>
            
            {/* Progress Bar */}
            <div className="mt-2">
              <strong>Progreso:</strong>
              <div className="relative w-full bg-gray-300 rounded h-2">
                <div
                  className={`absolute top-0 left-0 h-2 rounded transition-all duration-300 ${
                    project.progress >= 100 ? 'bg-green-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${project.progress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-400 text-right">{project.progress}%</p>
            </div>
          </div>
        ))}
      </section>

      {/* Resto de los proyectos */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {projects.slice(2).map((project) => (
          <div
            key={project.id}
            className="bg-gray-700 p-3 rounded-lg shadow-md text-sm cursor-pointer hover:bg-gray-600 transition duration-200"
            onClick={() => alert(`Detalles del Proyecto ID: ${project.id}`)}
          >
            <h2 className="font-bold text-lg">ID: {project.id}</h2>
            <p className="text-blue-400"><strong>Número de Identificación:</strong> {project.identification_number}</p>
            <p className="text-green-400"><strong>Fecha de Entrega:</strong> {new Date(project.delivery_date).toLocaleDateString()}</p>
            <p className={`font-semibold ${project.completed ? 'text-green-500' : 'text-red-500'}`}><strong>Estado:</strong> {project.completed ? 'Completo' : 'Incompleto'}</p>
            <p className="text-yellow-400"><strong>Costo de Material:</strong> ${project.cost_material}</p>
            <p className="text-purple-400"><strong>Descripción:</strong> {project.description}</p>

            {/* Progress Bar */}
            <div className="mt-2">
              <strong>Progreso:</strong>
              <div className="relative w-full bg-gray-300 rounded h-2">
                <div
                  className={`absolute top-0 left-0 h-2 rounded transition-all duration-300 ${
                    project.progress >= 100 ? 'bg-green-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${project.progress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-400 text-right">{project.progress}%</p>
            </div>
          </div>
        ))}
      </section>
    </>
  ) : (
    <Outlet /> // Renderiza las rutas hijas
  )}
</main>
