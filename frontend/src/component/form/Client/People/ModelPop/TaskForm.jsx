import style from "./Task.module.css";
import React, { useState } from "react";

const TaskForm = () => {
  const [casetype, setCaseType] = useState("");
  const [casetitle, setCaseTitle] = useState("");
  const [contactperson, setContactPerson] = useState("");
  const [location, setLocation] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [email, setEmail] = useState("");

  // const handleClose = () => {
  //   setOpenEvent(false);
  //   setOpenSlot(false);
  // };
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
            value={casetype}
            onChange={(e) => setCaseType(e.target.value)}
          >
            <option value="" disabled selected>
              Select Case Type
            </option>
            <option value="Type1">Type 1</option>
            <option value="Type2">Type 2</option>
            {/* Add more options as needed */}
          </select>
        </div>
        <div className={style.formRow}>
          <label className={style.AppointmentFormTitle}>Case Title</label>
          <input
            className={style.HearingVisibleFormInput}
            type="text"
            value={casetitle}
            placeholder="Title"
            onChange={(e) => setCaseTitle(e.target.value)}
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
