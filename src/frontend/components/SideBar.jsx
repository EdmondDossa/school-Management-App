import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  School,
  CalendarDays,
  Users,
  SidebarOpenIcon,
  LayoutDashboard,
  User,
  BookOpen,
  Speech,
  CalendarCog,
  SidebarCloseIcon,
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

  const [isNavbarHidden, setNavbarHidden] = useState(false);
  const toggleNavBarVisibility = () => setNavbarHidden(!isNavbarHidden);

  return (
    <div
      className={`${
        isNavbarHidden ? "w-[60px]" : "w-64"
      } h-full overflow-y-auto no-scrollbar shadow-lg shadow-[#00000014] bg-[#2871FA] relative transition-all ease-linear `}
    >
      <nav className="bg-[#2871FA] h-auto pb-[20px]">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            title={isNavbarHidden ? item.label : ""}
            className={`
                    flex px-6 py-3 outline-none focus:outline-none hover:text-[#2871FA] font-bold hover:bg-[#FFFFFF] 
                    ${
                      location.pathname === item.path ||
                      (item.path.length > 1 &&
                        location.pathname.startsWith(item.path))
                        ? "bg-[#FFFFFF] text-[#2871FA]"
                        : "text-[#FFFFFF]"
                    }
                    ${isNavbarHidden ? "place-content-center" : ""}
                    `}
          >
            <span className="mr-2">{item.icon}</span>
            {!isNavbarHidden ? item.label : ""}
          </Link>
        ))}
      </nav>
      <div
        className={`flex items-center  ${
          !isNavbarHidden ? "justify-end" : "justify-center"
        } w-full h-[50px] z-50 bg-[#2871FA] text-white sticky bottom-0 cursor-pointer`}
      >
        {!isNavbarHidden ? (
          <SidebarCloseIcon onClick={toggleNavBarVisibility} />
        ) : (
          <SidebarOpenIcon onClick={toggleNavBarVisibility} />
        )}
      </div>
    </div>
  );
};

export default SideBar;
