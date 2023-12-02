import React, { useEffect, useState } from 'react';
import axios from 'axios';
import style from './InvoicesFormData.module.css'
import DashboardNavbar from '../../utilities/DashboardNavbar/DashboardNavbar'

const InvoicesFormData = () => {
  const [invoicesData, setInvoicesData] = useState([]);

  useEffect(() => {
    // Fetch invoice data from the backend when the component mounts
    const fetchInvoicesData = async () => {
      try {
        const response = await axios.get('http://34.105.95.235:8051/invoiceformdata', {
          headers: {
            'x-auth-token': localStorage.getItem('token'), // Get the token from localStorage or your authentication mechanism
          },
        });

        setInvoicesData(response.data); // Set the invoice data received from the backend
      } catch (error) {
        console.error(error);
      }
    };

    fetchInvoicesData();
  }, []);

  return (
    <div>
    <DashboardNavbar />
    <div className={style.container}>
      <h2 className={style.header}>Invoices Form Data</h2>
      <table className={style.table}>
        <thead>
          <tr className={style.tableHeaderRow}>
            <th className={style.tableHeaderCell}>Title</th>
            <th className={style.tableHeaderCell}>Invoice Number</th>
            <th className={style.tableHeaderCell}>Date</th>
            <th className={style.tableHeaderCell}>Client</th>
            <th className={style.tableHeaderCell}>Expenses Cumulative Amount</th>
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </div>
  );
};

export default InvoicesFormData;
