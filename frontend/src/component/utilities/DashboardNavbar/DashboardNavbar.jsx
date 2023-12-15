import React from 'react';
import { useState, useContext  } from 'react';
import { NavLink } from 'react-router-dom';
// import { FaBars } from "react-icons/fa";
// import { MdClose } from "react-icons/md";
import { links } from "./data";
import style from './Navbar.module.css'
import { NotificationContext } from '../Notifications/NotificationsContext'; // adjust path as needed

const DashboardNavbar = () => {
  const { notifications } = useContext(NotificationContext);
  const [isNavShowing, setIsNavShowing] = useState(false);
console.log(notifications)
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
            {links.map(({ name, path, submenu, bell }, index) => (
              <li key={index} 
                  onMouseEnter={() => submenu && setHoveredMenuItem(name)}
                  onMouseLeave={() => submenu && setHoveredMenuItem(null)}>
                <NavLink to={path}>
                  {name}
                  <div className={style.BellIcon}>
                  {bell}
                  </div>
                </NavLink>

                {/* Show submenu if hovered */}
                {submenu && hoveredMenuItem === name && (
                  <div className={style.DropDown}>
                    {renderSubmenu(submenu)}
                  </div>
                )}
              </li>
            ))}
                  <span className={style.NotifiCount}>{notifications.length}</span>
          </ul>
        </div>
      </nav>
    </>
  );
}

export default DashboardNavbar;