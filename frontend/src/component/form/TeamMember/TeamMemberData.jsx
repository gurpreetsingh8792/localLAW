import React, { useEffect, useState } from 'react';
import axios from 'axios';
import style from './TeamMemberData.module.css';
import DashboardNavbar from '../../utilities/DashboardNavbar/DashboardNavbar';

const TeamMemberdata = () => {
  const [teamMembers, setTeamMembers] = useState([]);

  useEffect(() => {
    // Fetch team members data from the backend when the component mounts
    const fetchTeamMembers = async () => {
      try {
        const response = await axios.get('http://34.105.95.235:8052/dashboard/teammemberform', {
          headers: {
            'x-auth-token': localStorage.getItem('token'), // Get the token from localStorage or your authentication mechanism
          },
        });

        setTeamMembers(response.data); // Set the team members data received from the backend
      } catch (error) {
        console.error(error);
      }
    };

    fetchTeamMembers();
  }, []);

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
        </tr>
      </thead>
      <tbody>
        {teamMembers.map((member, index) => (
            <tr className={style.tr} key={index}>
            <td className={style.td}>{member.fullName}</td>
            <td className={style.td}>{member.email}</td>
            <td className={style.td}>{member.designation}</td>
            <td className={style.td}>{member.selectedGroup}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
        </>
  );
};

export default TeamMemberdata;
