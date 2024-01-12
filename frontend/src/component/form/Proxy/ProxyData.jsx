import React, { useEffect, useState } from 'react';
import style from './ProxyData.module.css'
import axios from 'axios';
import DashboardNavbar from '../../utilities/DashboardNavbar/DashboardNavbar';

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
    <>
    <DashboardNavbar />

    <div className={style.container}>
      <h2 className={style.heading}>Proxy Activity</h2>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div>
      <table className={style.table}>
        <thead className={style.tableHead}>

        
        <tr>
            <th>Creator </th>
            <th>Acceptor</th>
            <th>Acceptance Date</th>
            <th>Court</th>
            <th>Hearing Date</th>
            <th>State</th>
            <th>Actions</th>

          </tr>

          </thead>

          <tbody className={style.tableBody}>
          {proxyActivity.map((activity) => (
            <tr className={style.CaseInfo} key={activity.id}>
              
              <td> {activity.creatorFullName}</td>
              <td> {activity.acceptorUsername}</td>
              <td> {activity.acceptanceDate}</td>
              <td> {activity.type}</td>
              <td> {activity.hearingDate}</td>
              <td> {activity.zipStateProvince}</td>

              <button className={style.btn} onClick={() => handleDelete(activity.id)}>Delete</button>
              
            </tr>
          ))}
</tbody>
</table>
        </div>
      )}
    </div>
</>
  );
};

export default ProxyData;
