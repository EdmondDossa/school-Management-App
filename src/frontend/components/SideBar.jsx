import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  School,
  CalendarDays,
  Users,
  GraduationCap,
  Settings,
  SchoolIcon,
  LayoutDashboard,
  User,
  BookOpen,
  Speech,
  CalendarCog,
} from "lucide-react";

const SideBar = () => {
  const location = useLocation();

  const menuItems = [
    { path: "/", label: "Tableau de bord", icon: <LayoutDashboard /> },
    { path: "/etablissements", label: "Etablissement", icon: <School /> },
    {
      path: "/annees-scolaires",
      label: "Années scolaire",
      icon: <CalendarDays />,
    },
    { path: "/eleves", label: "Elèves", icon: <User /> },
    { path: "/professeurs", label: "Professeurs", icon: <Speech /> },
    { path: "/matieres", label: "Matières", icon: <BookOpen /> },
    { path: "/classes", label: "Classes", icon: <Users /> },
    {
      path: "/emplois-du-temps",
      label: "Emplois du temps",
      icon: <CalendarCog />,
    },
  ];

  return (
    <div className="w-64 bg-[#2871FA] shadow-lg shadow-[#00000014]">
      <nav>
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center px-6 py-3 focus:outline-none hover:text-[#2871FA] font-bold hover:bg-[#FFFFFF] ${
              location.pathname === item.path
                ? "bg-[#FFFFFF] text-[#2871FA]"
                : "text-[#FFFFFF]"
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

export default SideBar;
