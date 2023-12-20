import React, { useEffect, useState } from "react";
import style from "./CaseFormData.module.css";
import axios from "axios";
import { NavLink } from "react-router-dom";
import DashboardNavbar from '../../utilities/DashboardNavbar/DashboardNavbar'

const CaseFormData = () => {
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

  const handleDeleteClick = async (caseId) => {
    if (window.confirm("Are you sure you want to delete this case?")) {
      try {
        await axios.delete(
          `http://localhost:8052/dashboard/caseformdata/${caseId}`,
          {
            headers: { "x-auth-token": localStorage.getItem("token") },
          }
        );
        fetchCasesData(); // Refetch the cases to update the UI
      } catch (error) {
        console.error(error);
      }
    }
    console.log("Delete button clicked with caseId:", caseId); // Add this line for debugging
  };
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
    <DashboardNavbar/>
    <div className={style.Container}>
  <div className={style.casesContainer}>
    <h2 className={style.header}>Cases Form Data</h2>
    {casesData.map((caseItem) => (
      <div className={style.card} key={caseItem.id}>
        {/* Card Content */}
        <div className={style.cardHeader}>
          <h3>{caseItem.title}</h3>
        </div>
        <div className={style.cardBody}>
          <p><strong>Case Code:</strong> {caseItem.caseCode}</p>
          <p><strong>Client:</strong> {caseItem.client}</p>
          <p><strong>Lawyer:</strong> {caseItem.client}</p>
          <p><strong>Judge:</strong> {caseItem.honorableJudge}</p>
          <p><strong>Hearing Date:</strong> {caseItem.honorableJudge}</p>
          <p><strong>Description:</strong> {caseItem.honorableJudge}</p>
          <p><strong>Opponent:</strong> {caseItem.opponentPartyName}</p>
        </div>
        <div className={style.cardActions}>
          <button className={style.btn} onClick={() => handleEditClick(caseItem)}>Edit</button>
          <button className={style.btn} onClick={() => handleDeleteClick(caseItem.id)}>Delete</button>
          <button className={style.btn} onClick={() => handleDownloadClick(caseItem.id)}>Download</button>
        </div>
      </div>
    ))}
  </div>
</div>

    </>
  );
};

export default CaseFormData;
