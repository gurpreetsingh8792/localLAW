import React, { useEffect, useState } from 'react';
import style from './ClientFormData.module.css'
import axios from 'axios';
import DashboardNavbar from '../../utilities/DashboardNavbar/DashboardNavbar';

const ClientFormData = () => {
  const [clientData, setClientData] = useState([]);

  useEffect(() => {
    // Fetch case data from the backend when the component mounts
    const fetchClientData = async () => {
      try {
        const response = await axios.get('http://localhost:4000/clientformdata', {
          headers: {
            'x-auth-token': localStorage.getItem('token'), // Get the token from localStorage or your authentication mechanism
          },
        });

        setClientData(response.data); // Set the case data received from the backend
      } catch (error) {
        console.error(error);
      }
    };

    fetchClientData();
  }, []);

  return (
    <>
    <DashboardNavbar />
    <div className={style.container}>
    <h2 className={style.heading}>Client Form Data</h2>
    <table className={style.table}>
      <thead className={style.tableHead}>
        <tr>
          <th>First Name</th>
          <th>Email</th>
          <th>Mobile No</th>
          <th>Assign Alerts</th>
          <th>Schedule Appointment</th>
        </tr>
      </thead>
      <tbody className={style.tableBody}>
        {clientData.map((clientItem, index) => (
          <tr key={index}>
            <td>{clientItem.firstName}</td>
            <td>{clientItem.email}</td>
            <td>{clientItem.mobileNo}</td>
            <td>{clientItem.assignAlerts}</td>
            <td>{clientItem.scheduleAppointment}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
  
</>
  );
};

export default ClientFormData;
