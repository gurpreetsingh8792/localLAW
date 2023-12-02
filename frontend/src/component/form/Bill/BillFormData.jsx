import React, { useEffect, useState } from 'react';
import axios from 'axios';
import style from './BillFormData.module.css'
import DashboardNavbar from '../../utilities/DashboardNavbar/DashboardNavbar';

const BillFormData = () => {
  const [billData, setBillData] = useState([]);

  useEffect(() => {
    // Fetch bill data from the backend when the component mounts
    const fetchBillData = async () => {
      try {
        const response = await axios.get('http://34.105.95.235:8051/billdata', {
          headers: {
            'x-auth-token': localStorage.getItem('token'), // Get the token from localStorage or your authentication mechanism
          },
        });

        setBillData(response.data); // Set the bill data received from the backend
      } catch (error) {
        console.error(error);
      }
    };

    fetchBillData();
  }, []);

  return (
    <>
    <DashboardNavbar />
    <div className={style.container}>
    <h2 className={style.header}>Bill Form Data</h2>
    <table className={style.table}>
      <thead>
        <tr className={style.tableHeaderRow}>
          <th className={style.tableHeaderCell}>Bill Number</th>
          <th className={style.tableHeaderCell}>Title</th>
          <th className={style.tableHeaderCell}>Date From</th>
          <th className={style.tableHeaderCell}>Date To</th>
          <th className={style.tableHeaderCell}>Amount</th>
          <th className={style.tableHeaderCell}>Total Amount With Tax</th>
        </tr>
      </thead>
      <tbody>
        {billData.map((bill, index) => (
          <tr key={index} className={style.tableBodyRow}>
            <td className={style.tableBodyCell}>{bill.billNumber}</td>
            <td className={style.tableBodyCell}>{bill.title}</td>
            <td className={style.tableBodyCell}>{bill.dateFrom}</td>
            <td className={style.tableBodyCell}>{bill.dateTo}</td>
            <td className={style.tableBodyCell}>{bill.amount}</td>
            <td className={style.tableBodyCell}>{bill.totalAmountWithTax}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
  </>
  );
};

export default BillFormData;
