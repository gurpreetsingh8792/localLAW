import React, { useEffect, useState } from 'react';
import axios from 'axios';
import style from './BillFormData.module.css';
import DashboardNavbar from '../../utilities/DashboardNavbar/DashboardNavbar';
import EditBillForm from './EditBillForm/EditBillForm';
import { NavLink } from 'react-router-dom';
import Modal from '../Client/People/ModelPop/Modal';

const BillFormData = () => {
  const openModal = () => setIsModalOpen(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const closeModal = () => setIsModalOpen(false);
  const [billData, setBillData] = useState([]);
  const [editingBill, setEditingBill] = useState(null);

  const fetchBillData = async () => {
    try {
      const response = await axios.get('http://localhost:8052/bill/edit', {
        headers: {
          'x-auth-token': localStorage.getItem('token'),
        },
      });

      setBillData(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    // Fetch bill data from the backend when the component mounts
    fetchBillData();
  }, []);

  const handleDeleteClick = async (billId) => {
    if (window.confirm('Are you sure you want to delete this bill?')) {
      try {
        await axios.delete(`http://localhost:8052/billdata/${billId}`, {
          headers: { 'x-auth-token': localStorage.getItem('token') },
        });
        fetchBillData(); // Refetch the bill data to update the UI
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleEditClick = (bill) => {
    setEditingBill(bill.id);
    openModal();
  };

  const handleCancelClick = () => {
    setEditingBill(null);
    closeModal();
  };

  const handleDownloadClick = async (billId) => {
    try {
      const response = await axios.get(`http://localhost:8052/billdata/download-pdf/${billId}`, {
        responseType: 'blob',
        headers: {
          'x-auth-token': localStorage.getItem('token'),
        },
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `Bill_${billId}.pdf`;
      a.click();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <DashboardNavbar />
      <div className={style.container}>
        <h2 className={style.header}>Bill Form</h2>
        <table className={style.table}>
          <thead>
            <tr className={style.tableHeaderRow}>
              <th className={style.tableHeaderCell}>Bill Number</th>
              <th className={style.tableHeaderCell}>Title</th>
              <th className={style.tableHeaderCell}>Date From</th>
              <th className={style.tableHeaderCell}>Date To</th>
              <th className={style.tableHeaderCell}>Amount</th>
              <th className={style.tableHeaderCell}>Total Amount With Tax</th>
              <th className={style.tableHeaderCell}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {billData.map((bill) => (
              <tr key={bill.id} className={style.tableBodyRow}>
                <td className={style.tableBodyCell}>{bill.billNumber}</td>
                <td className={style.tableBodyCell}>{bill.title}</td>
                <td className={style.tableBodyCell}>{bill.dateFrom}</td>
                <td className={style.tableBodyCell}>{bill.dateTo}</td>
                <td className={style.tableBodyCell}>{bill.amount}</td>
                <td className={style.tableBodyCell}>{bill.totalAmountWithTax}</td>
                <td className={style.tableBodyCell}>
                <button className={style.btn} onClick={() => handleEditClick(bill)}>
                Edit
              </button>

                  <button
                  className={style.btn}
                    type="button"
                    onClick={() => handleDeleteClick(bill.id)}
                  >
                    Delete
                  </button>
                  <button
                  className={style.btn}
                    type="button"
                    onClick={() => handleDownloadClick(bill.id)}
                  >
                    Download PDF
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          {/* <Modal isOpen={isModalOpen} onClose={closeModal}>
             <EditBillForm onClose={closeModal}/>
          </Modal> */}
          <Modal isOpen={isModalOpen} onClose={closeModal}>
          {/* Pass the selected case data to EditCaseForm */}
          {editingBill && (
            <EditBillForm
            onClose={closeModal}
              billData={billData.find((bill) => bill.id === editingBill)}
              onCancel={handleCancelClick}
            />
          )}
        </Modal>


          
        </table>
      </div>
    </>
  );
};

export default BillFormData;
