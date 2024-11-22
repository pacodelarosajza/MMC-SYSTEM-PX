// src/components/News/News.jsx
import React, { useState } from 'react';
import NewAssemblies from './News/NewAssemblies';
import NewItems from './News/NewItems';
import NewProjects from './News/NewProjects';
import NewSubassemblies from './News/NewSubassemblies';

const News = () => {
  const [activeSection, setActiveSection] = useState('Assemblies');

  // Función para renderizar la sección activa
  const renderSection = () => {
    switch (activeSection) {
      case 'Assemblies':
        return <NewAssemblies />;
      case 'Items':
        return <NewItems />;
      case 'Projects':
        return <NewProjects />;
      case 'Subassemblies':
        return <NewSubassemblies />;
      default:
        return <NewAssemblies />;
    }
  };

  return (
    <div className="min-h-screen text-white flex">
      {/* --- Menú lateral --- */}
      <aside className="w-1/4 p-6">
        <h2 className="text-2xl font-bold mb-8">News</h2>
        <nav className="space-y-4">
          <button
            onClick={() => setActiveSection('Assemblies')}
            className={`block w-full text-left p-2 rounded ${
              activeSection === 'Assemblies' ? 'bg-indigo-500' : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            Assemblies
          </button>
          <button
            onClick={() => setActiveSection('Items')}
            className={`block w-full text-left p-2 rounded ${
              activeSection === 'Items' ? 'bg-indigo-500' : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            Items
          </button>
          <button
            onClick={() => setActiveSection('Projects')}
            className={`block w-full text-left p-2 rounded ${
              activeSection === 'Projects' ? 'bg-indigo-500' : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            Projects
          </button>
          <button
            onClick={() => setActiveSection('Subassemblies')}
            className={`block w-full text-left p-2 rounded ${
              activeSection === 'Subassemblies' ? 'bg-indigo-500' : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            Subassemblies
          </button>
        </nav>
      </aside>

      {/* --- Sección de contenido dinámico --- */}
      <main className="flex-1 p-8">
        {renderSection()}
      </main>
    </div>
  );
};

export default News;
