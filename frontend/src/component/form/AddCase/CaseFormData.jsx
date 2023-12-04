import React, { useEffect, useState } from 'react';
import style from './CaseFormData.module.css';
import DashboardNavbar from '../../utilities/DashboardNavbar/DashboardNavbar';
import axios from 'axios';

const CasesFormData = () => {
  const [casesData, setCasesData] = useState([]);
  const [editingCase, setEditingCase] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    caseCode: '',
    honorableJudge: '',
    client: '',
    opponentPartyName: ''
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
      setCasesData(response.data);
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
        await axios.delete(`http://localhost:8052/caseformdata/${caseId}`, {
          headers: { 'x-auth-token': localStorage.getItem('token') },
        });
        fetchCasesData(); // Refetch the cases to update the UI
      } catch (error) {
        console.error(error);
      }
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
      ...editFormData
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
      <DashboardNavbar />
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
              {casesData.map((caseItem) => (
                <tr key={caseItem.id}>
                  {editingCase === caseItem.id ? (
                    // Editable row
                    <>
                      <td><input type="text" name="title" value={editFormData.title} onChange={handleEditFormChange} /></td>
                      <td><input type="text" name="caseCode" value={editFormData.caseCode} onChange={handleEditFormChange} /></td>
                      <td><input type="text" name="honorableJudge" value={editFormData.honorableJudge} onChange={handleEditFormChange} /></td>
                      <td><input type="text" name="client" value={editFormData.client} onChange={handleEditFormChange} /></td>
                      <td><input type="text" name="opponentPartyName" value={editFormData.opponentPartyName} onChange={handleEditFormChange} /></td>
                      <td>
                        <button type="submit">Save</button>
                        <button type="button" onClick={handleCancelClick}>Cancel</button>
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
                        <button type="button" onClick={() => handleEditClick(caseItem)}>Edit</button>
                        <button type="button" onClick={() => handleDeleteClick(caseItem.id)}>Delete</button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </form>
      </div>
    </div>
  );
};

export default CasesFormData;
