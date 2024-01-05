import React, { useEffect, useState } from 'react';
import axios from 'axios';
import style from './InvoicesFormData.module.css';
import DashboardNavbar from '../../utilities/DashboardNavbar/DashboardNavbar';
import Modal from '../Client/People/ModelPop/Modal';
import EditInvoicesForm from './EditInvoiceForm/EditInvoice';
import { NavLink } from 'react-router-dom';

const InvoicesFormData = () => {
  const [invoicesData, setInvoicesData] = useState([]);
  const openModal = () => setIsModalOpen(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const closeModal = () => setIsModalOpen(false);

  const fetchInvoicesData = async () => {
    try {
      const response = await axios.get('http://localhost:8052/invoiceformdata', {
        headers: {
          'x-auth-token': localStorage.getItem('token'),
        },
      });

      setInvoicesData(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    // Fetch invoice data from the backend when the component mounts
    fetchInvoicesData();
  }, []);

  const handleDeleteClick = async (invoiceId) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        await axios.delete(`http://localhost:8052/invoiceformdata/${invoiceId}`, {
          headers: { 'x-auth-token': localStorage.getItem('token') },
        });
        // Refetch the invoices to update the UI
        fetchInvoicesData();
      } catch (error) {
        console.error(error);
      }
    }
    console.log('Delete button clicked with invoiceId:', invoiceId);
  };

  const handleDownloadClick = async (invoiceId) => {
    try {
      const response = await axios.get(`http://localhost:8052/invoiceformdata/download-pdf/${invoiceId}`, {
        responseType: 'blob',
        headers: {
          'x-auth-token': localStorage.getItem('token'),
        },
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `Invoice_${invoiceId}.pdf`;
      a.click();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <DashboardNavbar />
      <div className={style.container}>
        <h2 className={style.header}>Invoices Form</h2>
        <table className={style.table}>
          <thead>
            <tr className={style.tableHeaderRow}>
              <th className={style.tableHeaderCell}>Title</th>
              <th className={style.tableHeaderCell}>Invoice Number</th>
              <th className={style.tableHeaderCell}>Date</th>
              <th className={style.tableHeaderCell}>Client</th>
              <th className={style.tableHeaderCell}>Expenses Cumulative Amount</th>
              <th className={style.tableHeaderCell}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoicesData.map((invoice, index) => (
              <tr key={index} className={style.tableBodyRow}>
                <td className={style.tableBodyCell}>{invoice.title}</td>
                <td className={style.tableBodyCell}>{invoice.invoiceNumber}</td>
                <td className={style.tableBodyCell}>{invoice.date}</td>
                <td className={style.tableBodyCell}>{invoice.client}</td>
                <td className={style.tableBodyCell}>{invoice.expensesCumulativeAmount}</td>
                <td className={style.tableBodyCell}>
                
                <NavLink to="#"><button className={style.btn} onClick={openModal}>Edit</button></NavLink>

                  <button
                  className={style.btn}
                    type="button"
                    onClick={() => handleDeleteClick(invoice.id)}
                  >
                    Delete
                  </button>
                  <button
                  className={style.btn}
                    type="button"
                    onClick={() => handleDownloadClick(invoice.id)}
                  >
                    Download PDF
                  </button>
                </td>
              </tr>
            ))}
            <Modal isOpen={isModalOpen} onClose={closeModal}>
                    <EditInvoicesForm />
                  </Modal>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InvoicesFormData;
