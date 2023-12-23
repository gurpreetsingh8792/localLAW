import style from "./Task.module.css";
import React, { useState, useEffect } from "react";
import axios from "axios";

const TaskForm = () => {
  const [caseTitles, setCaseTitles] = useState([]); // Store fetched case titles
  const [caseTypeMap, setCaseTypeMap] = useState({}); // Store case types based on titles
  const [casetitle, setCaseTitle] = useState('');
  const [casetype, setCaseType] = useState('');
  const [contactperson, setContactPerson] = useState("");
  const [location, setLocation] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [email, setEmail] = useState("");

  // const handleClose = () => {
  //   setOpenEvent(false);
  //   setOpenSlot(false);
  // };

  useEffect(() => {
    const fetchCaseTitlesAndTypes = async () => {
      try {
        const response = await axios.get('http://localhost:8052/caseform', {
          headers: { 'x-auth-token': localStorage.getItem('token') },
        });
        const data = response.data; // Assuming the API response is an array of objects with "title" and "caseType" properties

        // Process the data and update the state
        const titles = data.map((item) => item.title);
        const typeMap = {};
        data.forEach((item) => {
          typeMap[item.title] = item.caseType;
        });

        setCaseTitles(titles);
        setCaseTypeMap(typeMap);
      } catch (error) {
        console.error('Error fetching case titles and types:', error);
      }
    };

    fetchCaseTitlesAndTypes(); // Call the new function to fetch case titles and types
  }, []);
  const setNewAppointment = () => {
    // Logic for setting new tasks
  };

  return (
    <div>
      <h2 style={{}}>Appointment </h2>
      <div className={style.AppointmentVisibleForm}>
        <div className={style.formRow}>
          <label className={style.TasksVisibleTitle}>Case</label>
          <select
      className={style.TasksVisibleInput}
      value={casetitle}
      onChange={(e) => setCaseTitle(e.target.value)}
    >
      <option value="" disabled>
        Select Case Title
      </option>
      {caseTitles.map((title) => (
        <option key={title} value={title}>
          {title}
        </option>
      ))}
    </select>
        </div>
        <div className={style.formRow}>
          <label className={style.AppointmentFormTitle}>Case Type</label>
          <input
          className={style.TasksVisibleInput}
          type="text"
          value={caseTypeMap[casetitle] || ''}
          readOnly
          placeholder="Case Type"
        />
        </div>
        <div className={style.formRow}>
          <label className={style.AppointmentFormTitle}>Contact Person</label>
          <select
            className={style.TasksVisibleInput}
            value={contactperson}
            onChange={(e) => setContactPerson(e.target.value)}
          >
            <option value="" disabled selected>
              Contact Person
            </option>
            <option value="Person 1">Person 1</option>
            <option value="Person 2">Person 2</option>
            {/* Add more options as needed */}
          </select>
        </div>
        <div className={style.formRow}>
          <label className={style.AppointmentFormTitle}>Location</label>
          <input
            className={style.HearingVisibleFormInput}
            type="text"
            value={location}
            placeholder="Location"
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
        <div className={style.formRow}>
          <label className={style.AppointmentFormTitle}>Start Time</label>
          <input
            className={style.HearingVisibleFormTime}
            type="time"
            value={start ? start.toISOString().substring(11, 16) : ""}
            onChange={(e) => {
              if (start) {
                const [hours, minutes] = e.target.value.split(":");
                const newStartTime = new Date(start.setHours(hours, minutes));
                // handleStartTime(newStartTime);
              }
            }}
          />
        </div>
        <div className={style.formRow}>
          <label className={style.AppointmentFormTitle}>End Time</label>
          <input
            className={style.HearingVisibleFormTime}
            type="time"
            value={end ? end.toISOString().substring(11, 16) : ""}
            // onChange={(e) =>
            //   handleEndTime(
            //     new Date(
            //       end.setHours(...e.target.value.split(":"))
            //     )
            //   )
            // }
          />
        </div>
        <div className={style.formRow}>
          <label className={style.HearingVisibleFormTitle}>Email</label>
          <input
            className={style.HearingVisibleFormInput}
            type="email"
            // value={email}
            placeholder="Email"
            // onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>
      <div className={style.BtnContainerAppoint}>
        <button className={style.btn}
        //  onClick={}
         >
          Cancel
        </button>
        <button className={style.btn} onClick={setNewAppointment}>
          Submit
        </button>
      </div>{" "}
    </div>
  );
};

export default TaskForm;
