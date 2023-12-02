import React, { useEffect, useState } from 'react';
import axios from 'axios';
import style from './AlertsFormData.module.css'
import DashboardNavbar from '../../utilities/DashboardNavbar/DashboardNavbar';


const AlertsFormData = () => {
  const [alertsData, setAlertsData] = useState([]); // State to store alerts data

  useEffect(() => {
    // ... fetch team members as before

    // Fetch alerts data
    const fetchAlertsData = async () => {
      try {
        const response = await axios.get('http://34.105.95.235:8051/alerts', {
          headers: {
            'x-auth-token': localStorage.getItem('token'),
          },
        });
        setAlertsData(response.data); // Set the alerts data received from the backend
      } catch (error) {
        console.error(error);
      }
    };

    fetchAlertsData();
  }, []);
  return (
    <>
      <DashboardNavbar />
    <div className={style.container}>
  <h2 className={style.heading}>Alerts Form Data</h2>
  <table className={style.table}>
    <thead className={style.tableHead}>
      <tr>
        <th>Title</th>
        <th>Start Date</th>
        <th>Completion Date</th>
        <th>Assign To</th>
      </tr>
    </thead>
    <tbody className={style.tableBody}>
      {alertsData.map((alert, index) => (
        <tr key={index}>
          <td>{alert.title}</td>
          <td>{alert.startDate}</td>
          <td>{alert.completionDate}</td>
          <td>{alert.assignTo}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
    </>

  )
}

export default AlertsFormData