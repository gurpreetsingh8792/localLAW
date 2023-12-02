import React from 'react';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
// import { FaBars } from "react-icons/fa";
// import { MdClose } from "react-icons/md";
import { links } from "./data";
import style from './Navbar.module.css'

const DashboardNavbar = () => {
  const [isNavShowing, setIsNavShowing] = useState(false);

  const [hoveredMenuItem, setHoveredMenuItem] = useState(null);

  const renderSubmenu = (submenu) => (
    <ul>
      {submenu.map((item, index) => (
        <li key={index}>
          <NavLink to={item.path}>{item.name}</NavLink>
        </li>
      ))}
    </ul>
  );

  return (
    <>
      <nav className={style.Container}>
        <div className='navbar-menu-links'>
          <ul className={style.Links}>
            {links.map(({ name, path, submenu }, index) => (
              <li key={index} 
                  onMouseEnter={() => submenu && setHoveredMenuItem(name)}
                  onMouseLeave={() => submenu && setHoveredMenuItem(null)}>
                <NavLink to={path}>
                  {name}
                </NavLink>
                {/* Show submenu if hovered */}
                {submenu && hoveredMenuItem === name && (
                  <div className={style.DropDown}>
                    {renderSubmenu(submenu)}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </>
  );
}

export default DashboardNavbar;