import React, { useEffect, useState } from 'react';
import axios from 'axios';
import style from './AlertsFormData.module.css';
import DashboardNavbar from '../../utilities/DashboardNavbar/DashboardNavbar';
import { NavLink } from 'react-router-dom';
import Modal from '../Client/People/ModelPop/Modal';
import EditTasksForm from './EditTasksForm/EditTasksForm';

const AlertsFormData = () => {
  const openModal = () => setIsModalOpen(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const closeModal = () => setIsModalOpen(false);
  const [alertsData, setAlertsData] = useState([]);
  const [editingAlert, setEditingAlert] = useState(null);

  const fetchAlertsData = async () => {
    try {
      const response = await axios.get('http://localhost:8052/alerts/edit', {
        headers: {
          'x-auth-token': localStorage.getItem('token'), // Get the token from localStorage or your authentication mechanism
        },
      });

      setAlertsData(response.data); // Set the alerts data received from the backend
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    // Fetch alerts data from the backend when the component mounts
    fetchAlertsData();
  }, []);

  const handleEditClick = (alert) => {
    setEditingAlert(alert.id); // Pass the entire alert object
    openModal();
  };
  

  const handleCancelClick = () => {
    setEditingAlert(null);
    closeModal();
  };

  const handleDeleteClick = async (alertId) => {
    if (window.confirm('Are you sure you want to delete this alert?')) {
      try {
        await axios.delete(`http://localhost:8052/alerts/${alertId}`, {
          headers: { 'x-auth-token': localStorage.getItem('token') },
        });
        fetchAlertsData(); // Refetch the alerts to update the UI
      } catch (error) {
        console.error(error);
      }
    }
    console.log('Delete button clicked with alertId:', alertId); // Add this line for debugging
  };

  const handleDownloadClick = async (alertId) => {
    try {
      // Make an HTTP GET request to download the PDF for the specified alert ID
      const response = await axios.get(`http://localhost:8052/alerts/download-pdf/${alertId}`, {
        responseType: 'blob', // Set responseType to 'blob' to receive binary data
        headers: {
          'x-auth-token': localStorage.getItem('token'),
        },
      });

      // Create a URL for the blob data
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      // Create an anchor element and trigger the download
      const a = document.createElement('a');
      a.href = url;
      a.download = `Alert_${alertId}.pdf`;
      a.click();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <DashboardNavbar />
      <div className={style.container}>
        <h2 className={style.heading}>Tasks Form Data</h2>
        <table className={style.table}>
          <thead className={style.tableHead}>
            <tr>
              <th>Title</th>
              <th>Start Date</th>
              <th>Completion Date</th>
              <th>Assign To</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody className={style.tableBody}>
            {alertsData.map((alert) => (
              <tr key={alert.id}>
                <td className={style.td}>{alert.title}</td>
                <td className={style.td}>{alert.startDate}</td>
                <td className={style.td}>{alert.completionDate}</td>
                <td className={style.td}>{alert.assignTo}</td>
                <td>
                <button className={style.btn} onClick={() => handleEditClick(alert)}>
                Edit
              </button>

                  <button
                  className={style.btn}
                    type="button"
                    onClick={() => handleDeleteClick(alert.id)}
                  >
                    Delete
                  </button>
                  <button
                  className={style.btn}
                    type="button"
                    onClick={() => handleDownloadClick(alert.id)}
                  >
                    Download PDF
                  </button>
                </td>
              </tr>
            ))}
          </tbody>

          <Modal isOpen={isModalOpen} onClose={handleCancelClick}>
  {/* Pass the selected case data to EditTasksForm */}
  {editingAlert && (
    <EditTasksForm
      alertData={alertsData.find((alert) => alert.id === editingAlert)}
      onCancel={handleCancelClick}
    />
  )}
</Modal>



        </table>
      </div>
    </>
  );
};

export default AlertsFormData;