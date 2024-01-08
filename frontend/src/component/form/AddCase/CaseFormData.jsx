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
      const response = await axios.get("http://localhost:8052/edit/caseform", {
        headers: {
          "x-auth-token": localStorage.getItem("token"),
        },
      });
      const data = response.data;
      setCasesData(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleEditClick = (caseItem) => {
    setEditingCase(caseItem.id);
    openModal();
  };

  const handleCancelClick = () => {
    setEditingCase(null);
    closeModal();
  };


  const handleDeleteClick = async (caseId) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        await axios.delete(
          `http://localhost:8052/dashboard/caseformdata/${caseId}`,
          {
            headers: { "x-auth-token": localStorage.getItem("token") },
          }
        );
        fetchCasesData();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleDownloadClick = async (caseId) => {
    try {
      const response = await axios.get(
        `http://localhost:8052/dashboard/caseformdata/download-pdf/${caseId}`,
        {
          responseType: "blob",
          headers: {
            "x-auth-token": localStorage.getItem("token"),
          },
        }
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `Case_${caseId}.pdf`;
      a.click();
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
                <button className={style.btn} onClick={() => handleEditClick(caseItem)}>Edit</button>
                <button className={style.btn}  onClick={() => handleDeleteClick(caseItem.id)}>Delete</button>
                <button className={style.btn} onClick={() => handleDownloadClick(caseItem.id)}>Download</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal isOpen={isModalOpen} onClose={handleCancelClick}>
      {editingCase && (
            <EditCaseForm
              caseData={casesData.find((caseItem) => caseItem.id === editingCase)}
              onCancel={handleCancelClick}
            />
          )}
          </Modal>
    </div>
  </>
  );
};

export default CaseFormData;
