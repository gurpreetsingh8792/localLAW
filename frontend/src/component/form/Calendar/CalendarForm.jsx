import React, { useState } from "react";
import { Calendar as BigCalendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import style from "./CalendarForm.module.css";
import DashboardNavBar from "../../utilities/DashboardNavbar/DashboardNavbar"
// import { useFormik } from "formik";

const localizer = momentLocalizer(moment);

const Calendar = () => {
  const [errors, setErrors] = useState({ title: "", desc: "" });

  const [visibleForm, setVisibleForm] = useState(null);
  const showForm1 = () => setVisibleForm("Tasks");
  const showForm2 = () => setVisibleForm("Hearing Date");
  const showForm3 = () => setVisibleForm("Appointment");

  const [events, setEvents] = useState([]);
  const [casetitle, setCaseTitle] = useState("");
  const [email, setEmail] = useState("");
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);
  const [client, setClient] = useState("");
  const [desc, setDesc] = useState("");
  const [location, setLocation] = useState("");
  const [casetype, setCaseType] = useState("");

  const [openSlot, setOpenSlot] = useState(false);
  const [openEvent, setOpenEvent] = useState(false);
  const [clickedEvent, setClickedEvent] = useState({});

  const eventColors = {
    Tasks: "lightcoral",
    hearing: "lightblue",
    appointment: "lightgreen",
  };

  // validation
  const handleValidation = () => {
    let isValid = true;
    const newErrors = { casetitle: "",start:"",end:"",casetype:"" };

    if (!casetitle.trim()) {
      newErrors.casetitle = "Title is required";
      isValid = false;
    }

    // if (!desc.trim()) {
    //   newErrors.desc = "Description is required";
    //   isValid = false;
    // }

    setErrors(newErrors);
    return isValid;
  };

  const handleClose = () => {
    setOpenEvent(false);
    setOpenSlot(false);
  };

  const handleSlotSelected = (slotInfo) => {
    console.log("Real slotInfo", slotInfo);
    setStart(slotInfo.start);
    setEnd(slotInfo.end);
    setOpenSlot(true);
  };

  const handleEventSelected = (event) => {
    setOpenEvent(true);
    setClickedEvent(event);
    setCaseTitle(event.casetitle);
    setEmail(event.email);
    setStart(event.start);
    setEnd(event.end);
    setClient(event.client);
    setDesc(event.desc);
    setLocation(event.location);
    setCaseType(event.casetype);
  };

  const handleStartTime = (date) => {
    setStart(date);
  };

  const handleEndTime = (date) => {
    setEnd(date);
  };

  const setNewTasks = () => {
    console.log("Attempting to submit with", { casetitle, start, end, casetype });
  
    if (handleValidation()) {
      let newEvent = {
        title: casetitle,
        start: new Date(start), // Ensure these are valid Date objects
        end: new Date(end),
        casetype,
        type: "Tasks",
      };
      console.log("Creating new event", newEvent);
  
      setEvents([...events, newEvent]);
      handleClose();
      setCaseTitle("");
      setStart(null);
      setEnd(null);
    } else {
      console.error("Validation failed:", errors);
    }
  };
  
  

  const setNewAppointment = () => {
    let newEvent = {
      casetitle,
      start: new Date(start),
      end: new Date(end),
      desc,
      email,
      client,
      type: "appointment",
      style: { backgroundColor: "green" },
    };
    setEvents([...events, newEvent]);
    handleClose();
  };

  const setNewHearing = () => {
    let newEvent = {
      casetitle,
      start: new Date(start),
      end: new Date(end),
      desc,
      client,
      location,
      type: "hearing",
      style: { backgroundColor: "blue" },
    };
    setEvents([...events, newEvent]);
    handleClose();
  };

  const updateEvent = () => {
    const index = events.findIndex((event) => event === clickedEvent);
    let updatedEvent = {
      ...clickedEvent,
      title: casetitle,
      casetype,
      start: new Date(start),
      end: new Date(end),
      desc,
      email,
      client,
      location,
      style: { backgroundColor: eventColors[clickedEvent.type] },
    };

    let updatedEvents = [...events];
    updatedEvents[index] = updatedEvent;
    setEvents(updatedEvents);
    handleClose();
  };

  const deleteEvent = () => {
    const updatedEvents = events.filter((event) => event.start !== start);
    setEvents(updatedEvents);
    handleClose();
  };

  return (
    <>
      <DashboardNavBar />
      <div id="Calendar" className={style.calendarContainer}>
        <BigCalendar
          events={events}
          localizer={localizer}
          views={["month", "week", "day", "agenda"]}
          timeslots={2}
          defaultView="month"
          defaultDate={new Date()}
          selectable={true}
          onSelectEvent={(event) => handleEventSelected(event)}
          onSelectSlot={(slotInfo) => handleSlotSelected(slotInfo)}
          eventPropGetter={(event) => ({
            style: {
              backgroundColor: eventColors[event.type],
            },
            casetitle: `${event.title} - ${moment(event.start).format(
              "MMMM Do YYYY, h:mm A"
            )} to ${moment(event.end).format("h:mm A")}`,
            desc: event.desc, // Display description in the tooltip
          })}
        />

        {openSlot && (
          <div className={style.modal}>
            <div className={style.modalContent}>
              <span className={style.closeButton} onClick={handleClose}>
                &times;
              </span>
              <h2 className={style.header}>
                {moment(start).format("MMMM Do YYYY")}
              </h2>
              <button className={style.btn1} onClick={showForm1}>
                Tasks
              </button>
              <button className={style.btn2} onClick={showForm2}>
                Hearing Date
              </button>
              <button className={style.btn3} onClick={showForm3}>
                Appointment
              </button>

              {visibleForm === "Tasks" && (
                <>
                <div className={style.visibleForm}>
                  <div className={style.TasksVisibleContainer}>
                    <h6 className={style.TasksVisibleTitle}>Case</h6>
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
                    <h6 className={style.TasksVisibleTitle}>Case Title</h6>
                    <input
                      className={style.TasksVisibleInput}
                      type="text"
                      value={casetitle}
                      placeholder="Case Title"
                      onChange={(e) => setCaseTitle(e.target.value)}
                    />
                    <br />
                  </div>
                    <div className={style.TimeContainer}>
                      <h6 className={style.TasksVisibleTitle}>Start Date</h6>
                      <input
                        className={style.TasksVisibleInput}
                        type="date"
                        value={moment(start).format("YYYY-MM-DD")} 
                        onChange={(e) => setStart(e.target.value)}
                      />
                      <h6 className={style.TasksVisibleTitle}>End Date</h6>
                      <input
                        className={style.TasksVisibleInput}
                        type="date"
                        value={moment(end).format("YYYY-MM-DD")} 
                        onChange={(e) => setEnd(e.target.value)}
                      />
                    </div>
                    </div>
                  <div className={style.btnContainer}>
                    <button className={style.btn} onClick={handleClose}>
                      Cancel
                    </button>
                    <button className={style.btn} onClick={setNewTasks}>
                      Submit
                    </button>
                  </div>
                </>
              )}

              {visibleForm === "Hearing Date" && (
                <>
                  <div className={style.HearingVisibleForm}>
                    <h6 className={style.HearingVisibleFormTitle}>Title</h6>
                    <input
                      className={style.HearingVisibleFormInput}
                      type="text"
                      value={casetitle}
                      placeholder="Title"
                      onChange={(e) => setCaseTitle(e.target.value)}
                    />
                    <h6 className={style.HearingVisibleFormTitle}>Case type</h6>
                    <input
                      className={style.HearingVisibleFormInput}
                      type="text"
                      value={casetype}
                      placeholder="Case type"
                      onChange={(e) => setCaseType(e.target.value)}
                    />
                    {/* <br /> */}
                    <br />
                    <h6 className={style.HearingVisibleFormTitle}>
                      Assign Team Member
                    </h6>
                    <input
                      className={style.HearingVisibleFormInput}
                      type="text"
                      value={client}
                      placeholder="Assign Team Member"
                      onChange={(e) => setClient(e.target.value)}
                    />
                    <h6 className={style.HearingVisibleFormTitle}>Location</h6>
                    <input
                      className={style.HearingVisibleFormInput}
                      type="text"
                      value={location}
                      placeholder="Location"
                      onChange={(e) => setLocation(e.target.value)}
                    />
                    <br />
                    <input
                      className={style.HearingVisibleFormTime}
                      type="time"
                      value={start ? start.toISOString().substring(11, 16) : ""}
                      onChange={(e) => {
                        if (start) {
                          const [hours, minutes] = e.target.value.split(":");
                          const newStartTime = new Date(
                            start.setHours(hours, minutes)
                          );
                          handleStartTime(newStartTime);
                        }
                      }}
                    />
                    <input
                      className={style.HearingVisibleFormTime}
                      type="time"
                      value={end ? end.toISOString().substring(11, 16) : ""}
                      onChange={(e) =>
                        handleEndTime(
                          new Date(end.setHours(...e.target.value.split(":")))
                        )
                      }
                    />
                    a
                    <input
                      className={style.HearingVisibleFormDate}
                      type="date"
                      value={desc}
                      onChange={(e) => setDesc(e.target.value)}
                    />
                  </div>
                  <div className={style.btnContainer}>
                    <button className={style.btn} onClick={handleClose}>
                      Cancel
                    </button>
                    <button className={style.btn} onClick={setNewHearing}>
                      Submit
                    </button>
                  </div>
                </>
              )}

              {visibleForm === "Appointment" && (
                <>
                  <div>
                    <input
                      type="text"
                      value={casetitle}
                      placeholder="Title"
                      onChange={(e) => setCaseTitle(e.target.title)}
                    />
                    <input
                      type="email"
                      value={email}
                      placeholder="Email"
                      onChange={(e) => setEmail(e.target.email)}
                    />
                    <br />
                    <input
                      type="text"
                      value={desc}
                      placeholder="Description"
                      onChange={(e) => setDesc(e.target.desc)}
                    />
                    <input
                      type="text"
                      value={client}
                      placeholder="Client Name"
                      onChange={(e) => setClient(e.target.client)}
                    />
                    <br />
                    <input
                      type="time"
                      value={start ? start.toISOString().substring(11, 16) : ""}
                      onChange={(e) => {
                        if (start) {
                          const [hours, minutes] = e.target.value.split(":");
                          const newStartTime = new Date(
                            start.setHours(hours, minutes)
                          );
                          handleStartTime(newStartTime);
                        }
                      }}
                    />
                    <input
                      type="time"
                      value={end ? end.toISOString().substring(11, 16) : ""}
                      onChange={(e) =>
                        handleEndTime(
                          new Date(end.setHours(...e.target.value.split(":")))
                        )
                      }
                    />
                  </div>
                  <div className={style.btnContainer}>
                    <button className={style.btn} onClick={handleClose}>
                      Cancel
                    </button>
                    <button className={style.btn} onClick={setNewAppointment}>
                      Submit
                    </button>
                  </div>
                </>
              )}
              <br />
            </div>
          </div>
        )}

        {openEvent && (
          <div className={style.modal}>
            <div className={style.modalContent}>
              {clickedEvent.type === "Tasks" && (
                <>
                  <div className={style.TasksUpdateContainer}>
                    <h2>Update Tasks</h2>
                    <div className={style.visibleForm}>
                  <div className={style.TasksVisibleContainer}>
                    <h6 className={style.TasksVisibleTitle}>Case</h6>
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
                    <h6 className={style.TasksVisibleTitle}>Case Title</h6>
                    <input
                      className={style.TasksVisibleInput}
                      type="text"
                      value={casetitle}
                      placeholder="Case Title"
                      onChange={(e) => setCaseTitle(e.target.value)}
                    />
                    <br />
                  </div>
                    <div className={style.TimeContainer}>
                      <h6 className={style.TasksVisibleTitle}>Start Date</h6>
                      <input
                        className={style.TasksVisibleInput}
                        type="date"
                        value={moment(start).format("YYYY-MM-DD")} 
                        onChange={(e) => setStart(e.target.value)}
                      />
                      <h6 className={style.TasksVisibleTitle}>End Date</h6>
                      <input
                        className={style.TasksVisibleInput}
                        type="date"
                        value={moment(end).format("YYYY-MM-DD")} 
                        onChange={(e) => setEnd(e.target.value)}
                      />
                    </div>
                    </div>
                    <br />
                    <div className={style.btnOpenEvent}>
                      <button className={style.btn} onClick={handleClose}>
                        Cancel
                      </button>
                      <button className={style.btn} onClick={updateEvent}>
                        Update
                      </button>
                      <button className={style.btn} onClick={deleteEvent}>
                        Delete
                      </button>
                    </div>
                  </div>
                </>
              )}

              {clickedEvent.type === "hearing" && (
                <>
                  <div>
                    <input
                      type="text"
                      value={casetitle}
                      placeholder="Title"
                      onChange={(e) => setCaseTitle(e.target.value)}
                    />
                    <input
                      type="text"
                      value={casetype}
                      placeholder="Case type"
                      onChange={(e) => setCaseType(e.target.value)}
                    />
                    <br />
                    <input
                      type="date"
                      value={desc}
                      onChange={(e) => setDesc(e.target.value)}
                    />
                    <br />
                    <input
                      type="text"
                      value={client}
                      placeholder="Assign Team Member"
                      onChange={(e) => setClient(e.target.value)}
                    />
                    <input
                      type="text"
                      value={location}
                      placeholder="Location"
                      onChange={(e) => setLocation(e.target.value)}
                    />
                    <br />
                    <input
                      type="time"
                      value={start ? start.toISOString().substring(11, 16) : ""}
                      onChange={(e) => {
                        if (start) {
                          const [hours, minutes] = e.target.value.split(":");
                          const newStartTime = new Date(
                            start.setHours(hours, minutes)
                          );
                          handleStartTime(newStartTime);
                        }
                      }}
                    />
                    <input
                      type="time"
                      value={end ? end.toISOString().substring(11, 16) : ""}
                      onChange={(e) =>
                        handleEndTime(
                          new Date(end.setHours(...e.target.value.split(":")))
                        )
                      }
                    />

                    <input
                      type="text"
                      value={client}
                      placeholder="Client Name"
                      onChange={(e) => setClient(e.target.value)}
                    />

                    <br />
                    <input
                      type="time"
                      value={start ? start.toISOString().substring(11, 16) : ""}
                      onChange={(e) => {
                        // Check if start is a valid Date object
                        if (start) {
                          const [hours, minutes] = e.target.value.split(":");
                          const newStartTime = new Date(
                            start.setHours(hours, minutes)
                          );
                          handleStartTime(newStartTime);
                        }
                      }}
                    />
                    <input
                      type="time"
                      value={end ? end.toISOString().substring(11, 16) : ""}
                      onChange={(e) =>
                        handleEndTime(
                          new Date(end.setHours(...e.target.value.split(":")))
                        )
                      }
                    />
                  </div>
                  <button className={style.btn} onClick={handleClose}>
                    Cancel
                  </button>
                  <button className={style.btn} onClick={updateEvent}>
                    Update
                  </button>
                  <button className={style.btn} onClick={deleteEvent}>
                    delete
                  </button>
                </>
              )}

              {/* Common buttons like Cancel, Confirm Edit, Delete */}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Calendar;
