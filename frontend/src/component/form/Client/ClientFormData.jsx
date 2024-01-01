import React, { useEffect, useState } from 'react';
import style from './ClientFormData.module.css';
import axios from 'axios';
import DashboardNavbar from '../../utilities/DashboardNavbar/DashboardNavbar';
import { NavLink } from 'react-router-dom';
import EditPeopleForm from './EditPeopleForm/EditPeopleForm';
import Modal from './People/ModelPop/Modal';

const ClientFormData = () => {
  const openModal = () => setIsModalOpen(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const closeModal = () => setIsModalOpen(false);
  const [clientData, setClientData] = useState([]);

  const fetchClientData = async () => {
    try {
      const response = await axios.get('http://localhost:8052/clientformdata', {
        headers: {
          'x-auth-token': localStorage.getItem('token'), // Get the token from localStorage or your authentication mechanism
        },
      });

      setClientData(response.data); // Set the client data received from the backend
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    // Fetch client data from the backend when the component mounts
    fetchClientData();
  }, []);

  const handleDeleteClick = async (clientId) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        await axios.delete(`http://localhost:8052/clientformdata/${clientId}`, {
          headers: { 'x-auth-token': localStorage.getItem('token') },
        });
        fetchClientData(); // Refetch the clients to update the UI
      } catch (error) {
        console.error(error);
      }
    }
    console.log('Delete button clicked with clientId:', clientId); // Add this line for debugging
  };

  const handleDownloadClick = async (clientId) => {
    try {
      // Make an HTTP GET request to download the PDF for the specified client ID
      const response = await axios.get(`http://localhost:8052/clientformdata/download-pdf/${clientId}`, {
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
      a.download = `Client_${clientId}.pdf`;
      a.click();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <DashboardNavbar />
      <div className={style.container}>
        <h2 className={style.heading}>People Form Data</h2>
        <table className={style.table}>
          <thead className={style.tableHead}>
            <tr>
              <th>First Name</th>
              <th>Email</th>
              <th>Mobile No</th>
              <th>Assign Alerts</th>
              {/* <th>Schedule Appointment</th> */}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody className={style.tableBody}>
            {clientData.map((clientItem, index) => (
              <tr className={style.DataColume} key={index}>
                <td>{clientItem.firstName}</td>
                <td>{clientItem.email}</td>
                <td>{clientItem.mobileNo}</td>
                <td>{clientItem.assignAlerts}</td>
                {/* <td>{clientItem.scheduleAppointment}</td> */}
                
                <NavLink to="#"><button className={style.btn} onClick={openModal}>Edit</button></NavLink>
                  <button
                    className={style.btn}
                    type="button"
                    onClick={() => handleDeleteClick(clientItem.id)}
                  >
                    Delete
                  </button>
                  <button
                             className={style.btn}
                    type="button"
                    onClick={() => handleDownloadClick(clientItem.id)}
                  >
                    Download PDF
                  </button>
              </tr>
                
            ))}
          </tbody>
                  <Modal isOpen={isModalOpen} onClose={closeModal}>
                    <EditPeopleForm />
                  </Modal>
        </table>
      </div>
      
    </>
    
  );
};

export default ClientFormData;
