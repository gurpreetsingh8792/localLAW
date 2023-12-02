import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { sideNavLinks, formLinks } from "./data"; // Assuming formLinks is exported from './data'
import style from "./sidenav.module.css";
import { FaBars, FaCaretDown, FaCaretUp } from "react-icons/fa";
import { MdClose } from "react-icons/md";

const SideNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State to track dropdown visibility

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  return (
    <>
      <div className={style.container}>
        {!isOpen ? (
          <FaBars className={style.hamBurger} onClick={handleOpen} />
        ) : (
          <MdClose className={style.closeIcon} onClick={handleClose} />
        )}

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
              
              {/* Dropdown Toggle */}
              <li>
                <div className={style.dropdown}>
                  <button className={style.dropdownToggle} onClick={toggleDropdown}>
                    Forms
                    {isDropdownOpen ? <FaCaretUp /> : <FaCaretDown />}
                  </button>
                  {isDropdownOpen && (
                    <ul className={style.dropdownMenu}>
                      {formLinks.map(({ name, path, icon }, index) => (
                        <li className={style.formLink} key={`form-link-${index}`}>
                          <NavLink className={style.dropdownItem} to={path} onClick={handleClose}>
                            {icon}
                            {name}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </li>
            </ul>
          </div>
        </nav>
      </div>
    </>
  );
};

export default SideNav;
