import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { sideNavLinks } from "./data";
import style from "./sidenav.module.css";
import { FaBars } from "react-icons/fa";
import { MdClose } from "react-icons/md";

const SideNav = () => {
  const [isOpen, setIsOpen] = useState(false); // State to track if sidebar is open

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      <div className={style.container}>
        {/* Conditionally render the hamburger or close icon based on the sidebar's state */}
        {!isOpen ? (
          <FaBars className={style.hamBurger} onClick={handleOpen} />
        ) : (
          <MdClose className={style.closeIcon} onClick={handleClose} />
        )}

        {/* Apply dynamic classes based on the sidebar's state */}
        <nav className={`${style.navContainer} ${isOpen ? style.open : style.close}`}>
          <div className={style.linksContainer}>
            <ul>
              {sideNavLinks.map(({ name, path, icon }, index) => (
                <li key={index}>
                  <NavLink className={style.listContainer} to={path} onClick={handleClose}>
                    {icon}
                    {name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </div>
    </>
  );
};

export default SideNav;
