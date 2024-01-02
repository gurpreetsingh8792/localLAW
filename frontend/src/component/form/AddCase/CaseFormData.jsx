import React, { useEffect, useState } from "react";
import style from "./CaseFormData.module.css";
import axios from "axios";
import { NavLink } from "react-router-dom";
import DashboardNavbar from '../../utilities/DashboardNavbar/DashboardNavbar'
import Modal from "../Client/People/ModelPop/Modal";
import TaskForm from "../Client/People/ModelPop/TaskForm";
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



  const handleDeleteClick = async (clientId) => {
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
    <div className={style.Container}>
      <div className={style.casesContainer}>
        <h2 className={style.header}>Cases Form Data</h2>
        {casesData.map((caseItem) => (
          <div className={style.card} key={caseItem.id}>
            <div className={style.cardHeader}>
              <h3>{caseItem.title}</h3>
            </div>
            <div className={style.cardBody}>
              <p><strong>Case Code:</strong> {caseItem.caseCode}</p>
              <p><strong>Client:</strong> {caseItem.client}</p>
              <p><strong>Judge:</strong> {caseItem.honorableJudge}</p>
              <p><strong>Lawyer:</strong> {caseItem.honorableJudge}</p>
              <p><strong>Hearing Date:</strong> {caseItem.honorableJudge}</p>
              <p><strong>Description:</strong> {caseItem.honorableJudge}</p>
              <p><strong>Opponent:</strong> {caseItem.opponentPartyName}</p>
            </div>
            <div className={style.cardActions}>
              <button className={style.btn} onClick={() => handleEditClick(caseItem)}>
                Edit
              </button>
              <button className={style.btn} onClick={() => handleDeleteClick(caseItem.id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
        <Modal isOpen={isModalOpen} onClose={handleCancelClick}>
          {/* Pass the selected case data to EditCaseForm */}
          {editingCase && (
            <EditCaseForm
              caseData={casesData.find((caseItem) => caseItem.id === editingCase)}
              onCancel={handleCancelClick}
            />
          )}
        </Modal>
      </div>
    </div>
  </>
  );
};

export default CaseFormData;
