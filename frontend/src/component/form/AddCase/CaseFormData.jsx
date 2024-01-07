import React, { useEffect, useState } from "react";
import style from "./CaseFormData.module.css";
import axios from "axios";
import { NavLink } from "react-router-dom";
import DashboardNavbar from '../../utilities/DashboardNavbar/DashboardNavbar'
import Modal from "../Client/People/ModelPop/Modal";
// import TaskForm from "../Client/People/ModelPop/TaskForm";
import EditCaseForm from "./EditCaseForm/EditCaseForm";
import CaseHistory from "./CaseHistory/CaseHistory";

const CaseFormData = () => {
  const openModal = () => setIsModalOpen(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const closeModal = () => setIsModalOpen(false);
  const [casesData, setCasesData] = useState([]);
  const [editingCase, setEditingCase] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: "",
    caseCode: "",
    honorableJudge: "",
    client: "",
    opponentPartyName: "",
  });

  useEffect(() => {
    fetchCasesData();
  }, []);
  





  
  const fetchCasesData = async () => {
    try {
      const response = await axios.get("http://localhost:8052/caseformdata", {
        headers: {
          "x-auth-token": localStorage.getItem("token"),
        },
      });
      const data = response.data;
      setCasesData(response.data);
      console.log("Fetched data:", data); // Log the fetched data
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



  const handleDeleteClick = async (clientId) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        await axios.delete(`http://localhost:8052/clientformdata/${clientId}`, {
          headers: { 'x-auth-token': localStorage.getItem('token') },
        });
        fetchCasesData(); // Refetch the clients to update the UI
      } catch (error) {
        console.error(error);
      }
    }
    console.log('Delete button clicked with clientId:', clientId); // Add this line for debugging
  };

  useEffect(() => {
    // Fetch client data from the backend when the component mounts
    fetchCasesData();
  }, []);


 
  const handleDownloadClick = async (caseId) => {
    try {
      // Make an HTTP GET request to download the PDF for the specified case ID
      const response = await axios.get(
        `http://localhost:8052/dashboard/caseformdata/download-pdf/${caseId}`,
        {
          responseType: "blob", // Set responseType to 'blob' to receive binary data
          headers: {
            "x-auth-token": localStorage.getItem("token"),
          },
        }
      );

      // Create a URL for the blob data
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      // Create an anchor element and trigger the download
      const a = document.createElement("a");
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
      await axios.put(
        `http://localhost:8052/caseformdata/${editingCase}`,
        editedCase,
        {
          headers: { "x-auth-token": localStorage.getItem("token") },
        }
      );
      setEditingCase(null);
      fetchCasesData();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
    <DashboardNavbar />
    <div className={style.container}>
      <h2 className={style.heading}>Cases Form Data</h2>
      <table className={style.table}>
      <thead className={style.tableHead}>
          <tr>
            <th>Title</th>
            <th>Case Code</th>
            <th>Client</th>
            <th>Judge</th>
            <th>Opponent Party Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody className={style.tableBody}>

          {casesData.map((caseItem) => (
            <tr className={style.CaseInfo} key={caseItem.id}>
            
              <td><NavLink style={{color:'white'}} to={"/case/cases"}>{caseItem.title}</NavLink></td>
              <td>{caseItem.caseCode}</td>
              <td>{caseItem.client}</td>
              <td>{caseItem.honorableJudge}</td>
              <td>{caseItem.opponentPartyName}</td>
              
              <td>
                <button className={style.btn} onClick={() => setIsModalOpen(true)}>Edit</button>
                <button className={style.btn}  onClick={() => handleDeleteClick(caseItem.id)}>Delete</button>
                <button className={style.btn} onClick={() => handleDownloadClick(caseItem.id)}>Download</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <EditCaseForm onClose={closeModal}/>
      </Modal>
    </div>
  </>
  );
};

export default CaseFormData;
