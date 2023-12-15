import React, { useState } from "react";
import style from "./Notifications.module.css";
import DashboardNavbar from "../DashboardNavbar/DashboardNavbar";
import { FaBell, FaTrashAlt, FaCaretDown, FaCheck } from "react-icons/fa";
import { HiOutlineDotsHorizontal } from "react-icons/hi";

const Notifications = () => {
  
  const [dropdownOpen, setDropdownOpen] = useState(null);

  // Toggle dropdown
  const toggleDropdown = (notificationId, notificationType, event) => {
    event.stopPropagation();
    const dropdownId = `${notificationType}-${notificationId}`;
    setDropdownOpen(dropdownOpen === dropdownId ? null : dropdownId);
  };

  // Render dropdown menu
  const renderDropdown = (notificationId, includeAccept) => (
    <div className={style.dropdownMenu}>
      {includeAccept && (
        <button onClick={() => handleAccept(notificationId)} className={style.MenuItem}>
          Accept <FaCheck />
        </button>
      )}
      <button onClick={() => handleDelete(notificationId)} className={style.MenuItem}>
        Delete <FaTrashAlt />
      </button>
    </div>
  );

  // Handle delete notification (logic to be implemented)
  const handleDelete = (notificationId) => {
    console.log("Delete notification with id:", notificationId);
    // Logic to delete the notification
    setDropdownOpen(null); // Close dropdown after action
  };

  // Handle accept notification (logic to be implemented)
  const handleAccept = (notificationId) => {
    console.log("Accept notification with id:", notificationId);
    // Logic to accept the notification
    setDropdownOpen(null); // Close dropdown after action
  };

  // Sample notifications data (You can replace this with actual data)
  const notificationsAppints = [
    {
      id: 1,
      text: "New message from John Doe",
      date: "2022-12-01",
      read: false,
      type: "appointment",
    },
    {
      id: 2,
      text: "Meeting scheduled at 3 PM",
      date: "2022-12-02",
      read: true,
      type: "appointment",
    },
    {
      id: 3,
      text: "Meeting scheduled at 3 PM",
      date: "2022-12-02",
      read: true,
      type: "appointment",
    },
    {
      id: 4,
      text: "Meeting scheduled at 3 PM",
      date: "2022-12-02",
      read: true,
      type: "appointment",
    },
    // ... more notifications
  ];
  const notificationsProxy = [
    {
      id: 1,
      text: "New message from John : proxy",
      date: "2022-12-01",
      read: false,
      type: "proxy",
    },
    {
      id: 2,
      text: "Meeting scheduled at 3 PM : proxy",
      date: "2022-12-02",
      read: true,
      type: "proxy",
    },
    {
      id: 3,
      text: "Meeting scheduled at 3 PM : proxy",
      date: "2022-12-02",
      read: true,
      type: "proxy",
    },
    {
      id: 4,
      text: "Meeting scheduled at 3 PM : proxy",
      date: "2022-12-02",
      read: true,
      type: "proxy",
    },
    // ... more notifications
  ];

  // Render individual notification item
  const renderalerts = (notification) => (
    <div key={notification.id} className={style.notificationItem}>
      <div className={style.notificationContent}>
        <div
          className={
            notification.read
              ? style.notificationTextRead
              : style.notificationTextUnread
          }
        >
          {notification.text}
        </div>
      </div>
      {/* Attach onClick event handler to HiOutlineDotsHorizontal icon */}
      <HiOutlineDotsHorizontal className={style.dropdownToggle} onClick={(e) => toggleDropdown(notification.id, 'alerts', e)} /> 
      {dropdownOpen === `alerts-${notification.id}` && renderDropdown(notification.id, false)}
          </div>
  );

  const renderproxy = (notification) => (
    <div key={notification.id} className={style.notificationItem}>
      <div className={style.notificationContent}>
        <div
          className={
            notification.read
              ? style.notificationTextRead
              : style.notificationTextUnread
          }
        >
          {notification.text}
        </div>
      </div>
      {/* Attach onClick event handler to HiOutlineDotsHorizontal icon */}
      <HiOutlineDotsHorizontal className={style.dropdownToggle} onClick={(e) => toggleDropdown(notification.id, 'proxy', e)} />
  {dropdownOpen === `proxy-${notification.id}` && renderDropdown(notification.id, true)}
  </div>
  );

  return (
    <>
      <DashboardNavbar />
      <div className={style.notificationsContainer}>
        <div className={style.header}>
          <FaBell />
          <h2>Notifications</h2>
        </div>
        <p>alerts</p>
        <div className={style.notificationsList}>
          {notificationsAppints.map(renderalerts)}
        </div>
        <p>proxy's</p>
        <div className={style.notificationsList}>
          {notificationsProxy.map(renderproxy)}
        </div>
      </div>
    </>
  );
};

export default Notifications;
