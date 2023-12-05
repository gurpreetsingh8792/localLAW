import React, { useEffect, useState } from 'react';
import style from './CaseFormData.module.css';
import axios from 'axios';
import { NavLink } from 'react-router-dom';

const CaseFormData = () => {
  const [casesData, setCasesData] = useState([]);
  const [editingCase, setEditingCase] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    caseCode: '',
    honorableJudge: '',
    client: '',
    opponentPartyName: '',
  });

  useEffect(() => {
    fetchCasesData();
  }, []);

  const fetchCasesData = async () => {
    try {
      const response = await axios.get('http://localhost:8052/caseformdata', {
        headers: {
          'x-auth-token': localStorage.getItem('token'),
        },
      });
      const data = response.data;
      setCasesData(response.data);
      console.log('Fetched data:', data); // Log the fetched data
      setCasesData(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleEditClick = (caseItem) => {
    setEditingCase(caseItem.id);
    setEditFormData(caseItem);
  };

  const handleCancelClick = () => {
    setEditingCase(null);
  };

  const handleDeleteClick = async (caseId) => {
    if (window.confirm('Are you sure you want to delete this case?')) {
      try {
        await axios.delete(`http://localhost:8052/dashboard/caseformdata/${caseId}`, {
          headers: { 'x-auth-token': localStorage.getItem('token') },
        });
        fetchCasesData(); // Refetch the cases to update the UI
      } catch (error) {
        console.error(error);
      }
    }
    console.log('Delete button clicked with caseId:', caseId); // Add this line for debugging
  };
  const handleDownloadClick = async (caseId) => {
    try {
      // Make an HTTP GET request to download the PDF for the specified case ID
      const response = await axios.get(`http://localhost:8052/dashboard/caseformdata/download-pdf/${caseId}`, {
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
      a.download = `Case_${caseId}.pdf`;
      a.click();
    } catch (error) {
      console.error(error);
    }
  };
  
  
  const handleEditFormChange = (event) => {
    const { name, value } = event.target;
    setEditFormData({ ...editFormData, [name]: value });
  };

  const handleEditFormSubmit = async (event) => {
    event.preventDefault();
    const editedCase = {
      id: editingCase,
      ...editFormData,
    };

    try {
      await axios.put(`http://localhost:8052/caseformdata/${editingCase}`, editedCase, {
        headers: { 'x-auth-token': localStorage.getItem('token') },
      });
      setEditingCase(null);
      fetchCasesData();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className={style.Container}>
      <div className={style.casesContainer}>
        <h2 className={style.header}>Cases Form Data</h2>
        <form onSubmit={handleEditFormSubmit}>
          <table className={style.casesTable}>
            <thead>
              <tr>
                <th>Title</th>
                <th>Case Code</th>
                <th>Honorable Judge</th>
                <th>Client</th>
                <th>Opponent Party Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
            {casesData.map((caseItem) => {
  console.log('Case Item:', caseItem);
  console.log('Case Item ID:', caseItem.id);
    return (
      <tr key={caseItem.id}> {/* Add the unique "key" prop here */}
      
        {editingCase === caseItem.id ? (
          // Editable row
          <>
            <td>
              <input
                type="text"
                name="title"
                value={editFormData.title}
                onChange={handleEditFormChange}
              />
            </td>
            <td>
              <input
                type="text"
                name="caseCode"
                value={editFormData.caseCode}
                onChange={handleEditFormChange}
              />
            </td>
            <td>
              <input
                type="text"
                name="honorableJudge"
                value={editFormData.honorableJudge}
                onChange={handleEditFormChange}
              />
            </td>
            <td>
              <input
                type="text"
                name="client"
                value={editFormData.client}
                onChange={handleEditFormChange}
              />
            </td>
            <td>
              <input
                type="text"
                name="opponentPartyName"
                value={editFormData.opponentPartyName}
                onChange={handleEditFormChange}
              />
            </td>
            <td>
              <button type="submit">Save</button>
              <button type="button" onClick={handleCancelClick}>
                Cancel
              </button>
            </td>
          </>
        ) : (
          // Non-editable row
          <>
            <td>{caseItem.title}</td>
            <td>{caseItem.caseCode}</td>
            <td>{caseItem.honorableJudge}</td>
            <td>{caseItem.client}</td>
            <td>{caseItem.opponentPartyName}</td>
            <td>
              <NavLink to='/dashboard/caseform'>
              <button type="button" onClick={() => handleEditClick(caseItem)}>
                Edit
              </button>
              </NavLink>
              <button type="button" onClick={() => handleDeleteClick(caseItem.id)}>
               Delete
             </button>


              <button type="button" onClick={() => handleDownloadClick(caseItem.id)}>
                Download PDF
              </button>
            </td>
          </>
        )}
      </tr>
    );
  })}
</tbody>
          </table>
        </form>
      </div>
    </div>
  );
};

export default CaseFormData;
