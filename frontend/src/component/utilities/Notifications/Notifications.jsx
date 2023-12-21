import React, { useEffect, useState } from "react";
import axios from "axios";
import DashboardNavbar from "../DashboardNavbar/DashboardNavbar";
import style from './Notifications.module.css'

const Notifications = () => {
  const [tasks, setTasks] = useState([]);
  const [proxy, setProxy] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [proxyLoading, setProxyLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDropdown, setShowDropdown] = useState({});

  useEffect(() => {
    axios.get('http://localhost:8052/dashboard/user/notifications', {
      headers: {
        'x-auth-token': localStorage.getItem('token'),
      },
    })
    .then((response) => {
      setTasks(response.data);
    })
    .catch((error) => {
      console.error(error);
      setError(error);
    })
    .finally(() => {
      setTasksLoading(false);
    });
  }, []);

  useEffect(() => {
    axios.get('http://localhost:8052/dashboard/user/proxy-notifications', {
      headers: {
        'x-auth-token': localStorage.getItem('token'),
      },
    })
    .then((response) => {
      setProxy(response.data);
    })
    .catch((error) => {
      console.error(error);
      setError(error);
    })
    .finally(() => {
      setProxyLoading(false);
    });
  }, []);

  // Method to handle delete action
  const handleDelete = (id, type) => {
    console.log(`Delete ${type} with ID: ${id}`);
    // Implement delete logic here
  };

  // Method to handle accept action
  const handleAccept = (id, type) => {
    console.log(`Accept ${type} with ID: ${id}`);
    axios.post(`http://localhost:8052/dashboard/user/accept-proxy/${id}`, null, {
      headers: {
        'x-auth-token': localStorage.getItem('token'),
      },
    })
    .then((response) => {
      console.log('Proxy accepted successfully');
      // You can update your UI or perform any necessary actions upon success
    })
    .catch((error) => {
      console.error('Error accepting proxy:', error);
      // Handle errors if needed
    });
  };
  

  const toggleDropdown = (index, type) => {
    setShowDropdown(prevState => ({
      ...prevState,
      [`${type}-${index}`]: !prevState[`${type}-${index}`]
    }));
  };


  return (
    <>
    <DashboardNavbar/>
    <div className={style.notificationsContainer}>
      {/* ... (header and loading indicators remain the same) */}

      {/* Alerts Section */}
      <div>
        <h2 className="header">Alerts</h2>
        {tasksLoading ? <p>Loading alerts...</p> : (
          <ul>
            {tasks.map((alert, index) => (
              <li key={index} className={style.notificationItem}>
                <span className={style.notificationTextUnread}>{alert}</span>
                <button onClick={() => toggleDropdown(index, 'alert')} className={style.dropdownToggle}>⋮</button>
                {showDropdown[`alert-${index}`] && (
                  <div className={`${style.dropdownMenu} ${showDropdown[`alert-${index}`] ? style.dropdownMenuVisible : ''}`}>                    <div className={style.MenuItem} onClick={() => handleDelete(alert.id, 'alert')}>Delete</div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Proxies Section */}
      <div>
        <h2 className="header">Proxies</h2>
        {proxyLoading ? <p>Loading proxies...</p> : (
          <ul>
            {proxy.map((proxyItem, index) => (
              <li key={index} className={style.notificationItem}>
                <span className={style.notificationTextUnread}>{proxyItem}</span>
                <button onClick={() => toggleDropdown(index, 'proxy')} className={style.dropdownToggle}>⋮</button>
                {showDropdown[`proxy-${index}`] && (
                  <div className={`${style.dropdownMenu} ${showDropdown[`proxy-${index}`] ? style.dropdownMenuVisible : ''}`}>                    <div className={style.MenuItem} onClick={() => handleDelete(proxyItem.id, 'proxy')}>Delete</div>
                    <div className={style.MenuItem} onClick={() => handleAccept(proxyItem.id, 'proxy')}>Accept</div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  </>
  );
};

export default Notifications;
