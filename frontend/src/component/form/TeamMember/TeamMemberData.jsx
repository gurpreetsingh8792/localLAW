import React, { useEffect, useState } from 'react';
import axios from 'axios';
import style from './TeamMemberData.module.css';
import DashboardNavbar from '../../utilities/DashboardNavbar/DashboardNavbar';

const TeamMemberdata = () => {
  const [teamMembers, setTeamMembers] = useState([]);

  const fetchTeamMembers = async () => {
    try {
      const response = await axios.get('http://localhost:8052/dashboard/teammemberform', {
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
              <th className={style.th}>Designation</th>
              <th className={style.th}>Selected Group</th>
              <th className={style.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {teamMembers.map((member, index) => (
              <tr className={style.tr} key={index}>
                <td className={style.td}>{member.fullName}</td>
                <td className={style.td}>{member.email}</td>
                <td className={style.td}>{member.designation}</td>
                <td className={style.td}>{member.selectedGroup}</td>
                <td className={style.td}>
                  <button
                    type="button"
                    onClick={() => handleDeleteClick(member.id)}
                  >
                    Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownloadClick(member.id)}
                  >
                    Download PDF
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default TeamMemberdata;
