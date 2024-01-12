import React from 'react';
import { useState, useContext, useEffect } from 'react';
import axios from "axios";
import { NavLink } from 'react-router-dom';
// import { FaBars } from "react-icons/fa";
// import { MdClose } from "react-icons/md";
import { links } from "./data";
import style from './Navbar.module.css'
import { IoSettings } from "react-icons/io5";

import { NotificationContext } from '../Notifications/NotificationsContext'; // adjust path as needed

const DashboardNavbar = () => {
  
  const { notifications } = useContext(NotificationContext);
  const [isNavShowing, setIsNavShowing] = useState(false);
  const [hoveredMenuItem, setHoveredMenuItem] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [proxy, setProxy] = useState([]);
  const [resetNotifications, setResetNotifications] = useState(false);
  
  const notificationsCount = tasks.length + proxy.length;


  const mergeNotifications = (existing, newNotifications) => {
    // Assuming each notification has a unique identifier, like 'id'
    const existingIds = new Set(existing.map(notif => notif.id));
    const filteredNewNotifications = newNotifications.filter(notif => !existingIds.has(notif.id));
  
    // Concatenate the filtered new notifications to the existing ones
    return existing.concat(filteredNewNotifications);
  };

  const resetNotificationCount = () => {
    // Reset tasks and proxy arrays
    setTasks([]);
    setProxy([]);
    setResetNotifications(true);
  };


  const renderSubmenu = (submenu) => (
    <ul>
      {submenu.map((item, index) => (
        <li key={index}>
          <NavLink to={item.path}>{item.name}</NavLink>
        </li>
      ))}
    </ul>
  );

  useEffect(() => {
    axios.get('http://localhost:8052/dashboard/user/notifications', {
      headers: {
        'x-auth-token': localStorage.getItem('token'),
      },
    })
    .then((response) => {
      if (resetNotifications) {
        setTasks(response.data); // Assuming response.data is an array of new notifications
        setResetNotifications(false);
      } else {
        setTasks(response.data);
        // Logic to add new notifications to existing ones
      }
      
    })
}, [resetNotifications])

  useEffect(() => {
    axios.get('http://localhost:8052/dashboard/user/proxy-notifications', {
      headers: {
        'x-auth-token': localStorage.getItem('token'),
      },
    })
    .then((response) => {
      if (resetNotifications) {
        setProxy(response.data); // Assuming response.data is an array of new notifications
        setResetNotifications(false);
      } else {
        setProxy(response.data);
        // Logic to add new proxy notifications to existing ones
      }
      // console.log(response, "hello")
    })
  }, [resetNotifications]);

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
                  <div className={style.BellIcon} onClick={resetNotificationCount}>
                  {bell }
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
                  <span className={style.NotifiCount}>{notificationsCount}</span>
                  {/* <span className={style.NotifiCount}>{Notification.length}</span> */}
          </ul>
        </div>
        {/* <NavLink className={style.IconContainer} to={"/dashboard/notificationssetting"}> <IoSettings className={style.SettingIcon} />  </NavLink> */}
      </nav>
    </>
  );
}

export default DashboardNavbar;