import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Error = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Make an HTTP GET request to fetch notifications from your backend
    axios.get('http://localhost:8052/dashboard/user/notifications', {
      headers: {
        'x-auth-token': localStorage.getItem('token'), // Get the token from localStorage or your authentication mechanism
      },
    })
    .then((response) => {
      // Handle the response data here
      setNotifications(response.data);
      setLoading(false);
    })
    .catch((error) => {
      console.error(error);
      // Handle errors here
    });
  }, []);

  return (
    <div>
      <h1>Notifications</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {notifications.map((notification, index) => (
            <li key={index}>{notification}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Error;
