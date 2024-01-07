import style from "./AppointmentForm.module.css";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AppointmentForm = ({ onClose }) => {
  const [caseTitles, setCaseTitles] = useState([]); // Store fetched case titles
  const [caseTypeMap, setCaseTypeMap] = useState({}); // Store case types based on titles
  const [casetitle, setCaseTitle] = useState("");
  const [casetype, setCaseType] = useState("");
  const [contactperson, setContactPerson] = useState("");
  const [location, setLocation] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [clientNames, setClientNames] = useState([]); // State to store client first names
  // const handleClose = () => {
  //   setOpenEvent(false);
  //   setOpenSlot(false);
  // };
  const handleStartTime = (newStartTime) => {
    setStart(newStartTime);
  };

  // const navigate = useNavigate();
  const HandleCancel = () => {
    onClose();
  };

  const handleEndTime = (newEndTime) => {
    setEnd(newEndTime);
  };
  useEffect(() => {
    const fetchCaseTitlesAndTypes = async () => {
      try {
        const response = await axios.get("http://localhost:8052/caseform", {
          headers: { "x-auth-token": localStorage.getItem("token") },
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
        console.error("Error fetching case titles and types:", error);
      }
    };

    const fetchClientNames = async () => {
      try {
        const response = await axios.get('http://localhost:8052/clientform', {
          headers: {
            'x-auth-token': localStorage.getItem('token'), // Get the token from localStorage or your authentication mechanism
          },
        });

        // Extract the first names from the response data
        const firstNamesArray = response.data.map((client) => client.firstName);
        setClientNames(firstNamesArray);
      } catch (error) {
        console.error(error);
      }
    };

    fetchClientNames();
    fetchCaseTitlesAndTypes(); // Call the new function to fetch case titles and types

  }, []);
  const setNewAppointment = async () => {
    try {
      const formData = {
        title,
        caseTitle: casetitle,
        caseType: caseTypeMap[casetitle] || "",
        appointmentDate: desc,
        contactPerson: contactperson, // Use the correct variable name 'contactperson'
        location,
        startTime: start,
        endTime: end,
        email,
      };

      // Send a POST request to your backend API
      const response = await axios.post(
        "http://localhost:8052/appointments",
        formData,
        {
          headers: { "x-auth-token": localStorage.getItem("token") },
        }
      );

      // Handle the response from the server
      if (response.status === 200) {
        // Appointment was successfully added
        console.log("Appointment added successfully");
        // You can perform any additional actions or show a success message here.
      } else {
        // Handle errors here
        console.error("Error adding appointment:", response.data.error);
        // You can show an error message to the user if needed.
      }
    } catch (error) {
      console.error("Error adding appointment:", error);
      // Handle any other errors here
    }
  };

  return (
    <div>
      <h2 style={{textAlign:'center'}}>Appointment </h2>

      <div className={style.AppointmentVisibleForm}>

        <div className={style.formRow}>
        <div className={style.formGroup}>

          <label className={style.AppointmentFormTitle}>Title</label>
          <input
            className={style.TasksVisibleInput}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          </div>
          <div className={style.formGroup}>

          <label className={style.TasksVisibleTitle}>Case Title</label>
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
        </div>

        <div className={style.formRow}>
        <div className={style.formGroup}>

          <label className={style.AppointmentFormTitle}>Case Type</label>
          <input
            className={style.TasksVisibleInput}
            type="text"
            value={caseTypeMap[casetitle] || ""}
            readOnly
            placeholder="Case Type"
          />
          </div>

          <div className={style.formGroup}>
          <label className={style.HearingVisibleFormTitle}>
            Appointment Date
          </label>
          <input
            className={style.HearingVisibleFormDate}
            type="date"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
          </div>
        </div>
        <div className={style.formRow}>
        <div className={style.formGroup}>

          <label className={style.AppointmentFormTitle}>Contact Person</label>
          <select
            className={style.TasksVisibleInput}
            value={contactperson}
            onChange={(e) => setContactPerson(e.target.value)}
          >
            {/* <option value="" disabled selected>
              Contact Person
            </option>
            <option value="Person 1">Person 1</option>
            <option value="Person 2">Person 2</option>
            Add more options as needed */}
            <option value=""  disabled selected>Select contact person</option>
                    {clientNames.map((firstName) => (
                      <option key={firstName} value={firstName}>
                        {firstName}
                      </option>
                    ))}
          </select>
          </div>

          <div className={style.formGroup}>
          <label className={style.AppointmentFormTitle}>Location</label>
          <input
            className={style.HearingVisibleFormInput}
            type="text"
            value={location}
            placeholder="Location"
            onChange={(e) => setLocation(e.target.value)}
          />
          </div>
        </div>

        <div className={style.formRow}>
          <div className={style.formGroup}>
            <label className={style.AppointmentFormTitle}>Start Time</label>
            <input
              className={style.formInput}
              type="time"
              value={start || ""}
              onChange={(e) => {
                const newStartTime = e.target.value;
                handleStartTime(newStartTime);
              }}
            />
          </div>

          <div className={style.formGroup}>
            <label className={style.AppointmentFormTitle}>End Time</label>
            <input
              className={style.formInput}
              type="time"
              value={end || ""}
              onChange={(e) => {
                const newEndTime = e.target.value;
                handleEndTime(newEndTime);
              }}
            />
          </div>

          <div className={style.formGroup}>
          <label className={style.HearingVisibleFormTitle}>Email</label>
          <input
            className={style.HearingVisibleFormInput}
            type="email"
            value={email}
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        </div>
      <div className={style.BtnContainerAppoint}>
        <button className={style.btn} onClick={setNewAppointment}>
          Submit
        </button>
        <button className={style.btn} onClick={HandleCancel}>
          Cancel
        </button>
      </div>
      </div>
    </div>
  );
};

export default AppointmentForm;
