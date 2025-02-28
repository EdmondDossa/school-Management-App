import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/', label: 'Tableau de bord' },
    { path: '/students', label: 'Mes Elèves' },
    { path: '/classes', label: 'Classes' },
    /* { path: '/schedule', label: 'Emplois du temps' }, */
  ];

  return (
    <div className="w-64 bg-white shadow-md">
      <div className="p-6">
        <h1 className="text-xl font-bold text-gray-800">School Manager</h1>
      </div>
      <nav className="mt-6">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 ${
              location.pathname === item.path ? 'bg-gray-100 font-medium' : ''
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;