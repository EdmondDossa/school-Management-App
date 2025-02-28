import React from 'react';
import { Link } from 'react-router-dom';

const DashboardCard = ({ title, description, link }) => {
  return (
    <Link to={link} className="block">
      <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">{title}</h2>
        <p className="text-gray-600">{description}</p>
      </div>
    </Link>
  );
};

export default DashboardCard;