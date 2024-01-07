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
      console.log(tasks)
    })
    .catch((error) => {
      console.error(error);
      setError(error);
    })
    .finally(() => {
      setTasksLoading(false);
    });

    axios.get('http://localhost:8052/dashboard/user/accepted-proxy-notifications', {
      headers: {
        'x-auth-token': localStorage.getItem('token'),
      },
    })
    .then((response) => {
      // Assuming the response contains accepted proxy notifications
      setTasks(response.data);
      console.log(response, tasks)
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
      console.log(response, "hello")
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

    // Send a DELETE request to your delete endpoint
    axios.delete(`http://localhost:8052/dashboard/user/notifications/${id}`, {
      headers: {
        'x-auth-token': localStorage.getItem('token'),
      },
    })
    .then((response) => {
      console.log(`${type} deleted successfully`);
      // You can update your UI or perform any necessary actions upon success
      if (type === 'alert') {
        setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
      } else if (type === 'proxy') {
        setProxy(prevProxies => prevProxies.filter(proxy => proxy.id !== id));
      }
    })
    .catch((error) => {
      console.error(`Error deleting ${type}:`, error);
      // Handle errors if needed
    });
  };
  

  const handleAccept = async (id, type) => {
    console.log(`Accept ${type} with ID: ${id}`); // Make sure `id` is not undefined
  
  if (typeof id === 'undefined') {
    console.error('ID is undefined. Cannot accept proxy.');
    return;
  }
  
    try {
      // Replace with your server URL and the appropriate endpoint
      const response = await axios.post(`http://localhost:8052/dashboard/user/accept-proxy/${id}`, {
        // You might need to send additional data in the request body
      }, {
        headers: {
          'x-auth-token': localStorage.getItem('token'), // assuming you're using token-based authentication
        },
      });
  
      console.log('Proxy accepted successfully:', response.data);
  
      // You might want to update your local state to reflect the change
      // For example, removing the accepted proxy from the list
      if (type === 'proxy') {
        setProxy(prevProxies => prevProxies.filter(proxy => proxy.id !== id));
        console.log(id)
      }
  
      // Or fetch the updated list of proxies again
      // fetchProxies(); // if you have a function to fetch proxies
  
    } catch (error) {
      console.error('Error accepting proxy:', error);
      // Handle error (e.g., show an error message to the user)
    }
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

    {/* <div className={style.MenuItem} onClick={() => { 
  console.log('Accepting proxy with ID:', proxyItem.id); 
  handleAccept(proxyItem.id, 'proxy'); 
}}>Accept</div> */}

    <div className={style.notificationsContainer}>
    <div className={style.tasksProxiesContainer}>
          {/* ... (header and loading indicators remain the same) */}

      {/* Alerts Section */}
         <div className={style.tasksSection}>
        <h2 className="header">Tasks</h2>
        {tasksLoading ? <p>Loading Tasks...</p> : (
          <ul>
            {tasks.map((alert, index) => (
              <li key={index} className={style.notificationItem}>
                <span className={style.notificationTextUnread}>{alert}</span>
                {/* <button onClick={() => toggleDropdown(index, 'alert')} className={style.dropdownToggle}>⋮</button> */}
                {/* {showDropdown[`alert-${index}`] && (
                  <div className={`${style.dropdownMenu} ${showDropdown[`alert-${index}`] ? style.dropdownMenuVisible : ''}`}>                  
                    <div className={style.MenuItem} onClick={() => handleDelete(alert.id, 'alert')}>Delete</div>
                  </div>
                )} */}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Proxies Section */}
      <div className={style.proxiesSection}>
          <h2 className="header">Proxies</h2>
          {proxyLoading ? <p>Loading proxies...</p> : (

          <ul>
            {proxy.map((proxyItem, index) => (
              <li key={index} className={style.notificationItem}>
                <span className={style.notificationTextUnread}>{proxyItem.message}</span>
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
    </div>

  </>
  );
};

export default Notifications;