import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MdDashboard, MdSchool, MdPeople, MdClass, MdBook, MdPerson, MdAccessTime } from "react-icons/md";

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/', label: 'Tableau de bord', icon: <MdDashboard /> },
    { path: '/etablissements', label: 'Etablissement', icon: <MdSchool /> },
    { path: '/eleves', label: 'Elèves', icon: <MdPeople /> },
    { path: '/classes', label: 'Classes', icon: <MdClass /> },
    { path: '/matieres', label: 'Matières', icon: <MdBook /> },
    { path: '/professeurs', label: 'Professeurs', icon: <MdPerson /> },
    { path: '/emplois-du-temps', label: 'Emplois du temps', icon: <MdAccessTime /> },
  ];  

  return (
    <div className="w-64 bg-[#2871FA] shadow-md">
      <nav>
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center px-6 py-3 hover:text-[#2871FA] font-bold hover:bg-[#FFFFFF] ${
              location.pathname === item.path ? 'bg-[#FFFFFF] text-[#2871FA]' : 'text-[#FFFFFF]'
            }`}
          >
            <span className="mr-2">{item.icon}</span>
            {item.label}
          </Link>        
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;