import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ProxyData = () => {
  const [proxyActivity, setProxyActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Make an HTTP GET request to fetch proxy activity data from the backend
    axios.get('http://localhost:8052/dashboard/user/proxy-activity', {
      headers: {
        'x-auth-token': localStorage.getItem('token'), // Include authentication token if required
      },
    })
    .then((response) => {
      setProxyActivity(response.data);
      setLoading(false);
    })
    .catch((error) => {
      console.error('Error fetching data:', error);
      setLoading(false);
    });
  }, []);
  const handleDelete = (activityId) => {
    // Make an HTTP DELETE request to delete the proxy activity with the given ID
    axios.delete(`http://localhost:8052/dashboard/user/proxy-activity/${activityId}`, {
      headers: {
        'x-auth-token': localStorage.getItem('token'), // Include authentication token if required
      },
    })
    .then((response) => {
      // Remove the deleted activity from the state
      setProxyActivity((prevActivity) => prevActivity.filter((activity) => activity.id !== activityId));
    })
    .catch((error) => {
      console.error('Error deleting data:', error);
    });
  };
  

  return (
    <div>
      <h2>Proxy Activity</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div>
          {proxyActivity.map((activity) => (
            <div key={activity.id}>
              
              <p>Creator: {activity.creatorFullName}</p>
              <p>Acceptor: {activity.acceptorUsername}</p>
              <p>Acceptance Date: {activity.acceptanceDate}</p>
              <p>Court: {activity.type}</p>
              <p>Hearing Date: {activity.hearingDate}</p>
              <p>State: {activity.zipStateProvince}</p>
              <button onClick={() => handleDelete(activity.id)}>Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProxyData;
