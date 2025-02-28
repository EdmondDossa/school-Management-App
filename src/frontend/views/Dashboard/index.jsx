import React from 'react';
import DashboardCard from '../../components/DashboardCard';

const Dashboard = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <DashboardCard 
        title="Étudiants" 
        description="Gérez les informations des étudiants"
        link="/students"
      />
      <DashboardCard 
        title="Classes" 
        description="Gérez les classes et les affectations"
        link="/classes"
      />
      <DashboardCard 
        title="Emplois du temps" 
        description="Consultez et modifiez les emplois du temps"
        link="/schedule"
      />
    </div>
  );
};

export default Dashboard;