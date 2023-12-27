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

  return (
    <div>
      <h2>Proxy Activity</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div>
          {proxyActivity.map((activity, index) => (
            <div key={index}>
              <p>Acceptance Date: {activity.acceptanceDate}</p>
              <p>Creator: {activity.creatorFullName}</p>
              <p>Acceptor: {activity.acceptorUsername}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProxyData;
