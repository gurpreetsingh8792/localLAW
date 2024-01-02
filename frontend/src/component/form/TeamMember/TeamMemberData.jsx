import React, { useEffect, useState } from 'react';
import axios from 'axios';
import style from './TeamMemberData.module.css';
import DashboardNavbar from '../../utilities/DashboardNavbar/DashboardNavbar';
import { NavLink } from 'react-router-dom';
import EditTeamMembersForm from './EditTeamMemberForm/EditTeamMemberForm';
import Modal from '../Client/People/ModelPop/Modal';

const TeamMemberdata = () => {
  const openModal = () => setIsModalOpen(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const closeModal = () => setIsModalOpen(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const [editingTeam, setEditingTeam] = useState(null);

  const fetchTeamMembers = async () => {
    try {
      const response = await axios.get('http://localhost:8052/dashboard/teammemberform/edit', {
        headers: {
          'x-auth-token': localStorage.getItem('token'),
        },
      });

      setTeamMembers(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    // Fetch team members data from the backend when the component mounts
    fetchTeamMembers();
  }, []);

  const handleEditClick = (member) => {
    setEditingTeam(member.id);
    openModal();
  };

  const handleCancelClick = () => {
    setEditingTeam(null);
    closeModal();
  };


  const handleDeleteClick = async (memberId) => {
    if (window.confirm('Are you sure you want to delete this team member?')) {
      try {
        await axios.delete(`http://localhost:8052/dashboard/teammemberform/${memberId}`, {
          headers: { 'x-auth-token': localStorage.getItem('token') },
        });
        fetchTeamMembers(); // Refetch the team members to update the UI
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleDownloadClick = async (memberId) => {
    try {
      // Make an HTTP GET request to download the PDF for the specified team member ID
      const response = await axios.get(`http://localhost:8052/dashboard/teammemberform/download-pdf/${memberId}`, {
        responseType: 'blob',
        headers: {
          'x-auth-token': localStorage.getItem('token'),
        },
      });
  
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
  
      const a = document.createElement('a');
      a.href = url;
      a.download = `TeamMember_${memberId}.pdf`;
      a.click();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <DashboardNavbar />
      <div className={style.container}>
        <h2 className={style.title}>Team Members Data</h2>
        <table className={style.table}>
          <thead>
            <tr className={style.tr}>
              <th className={style.th}>Full Name</th>
              <th className={style.th}>Email</th>
              <th className={style.th}>Contact number</th>
              <th className={style.th}>Assigned Group</th>
              <th className={style.th}>Assigned Campany</th>
              {/* <th className={style.th}>Designation</th>
              <th className={style.th}>Selected Group</th> */}
              <th className={style.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {teamMembers.map((member) => (
              <tr className={style.trs} key={member.id}>
                <td className={style.td}>{member.fullName}</td>
                <td className={style.td}>{member.email}</td>
                <td className={style.td}>{member.designation}</td>
                <td className={style.td}>{member.selectedGroup}</td>
                <td className={style.td}>{member.selectedGroup}</td>
                <td className={style.td}>
                <button className={style.btn} onClick={() => handleEditClick(member)}>
                Edit
              </button>

                  <button
                  className={style.btn}
                    type="button"
                    onClick={() => handleDeleteClick(member.id)}
                  >
                    Delete
                  </button>
                  <button
                  className={style.btn}
                    type="button"
                    onClick={() => handleDownloadClick(member.id)}
                  >
                    Download PDF
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <Modal isOpen={isModalOpen} onClose={handleCancelClick}>
          {/* Pass the selected case data to EditCaseForm */}
          {editingTeam && (
            <EditTeamMembersForm
              teamData={teamMembers.find((member) => member.id === editingTeam)}
              onCancel={handleCancelClick}
            />
          )}
        </Modal>

        </table>
      </div>
    </>
  );
};

export default TeamMemberdata;
