import React, { useState } from "react";
import { Calendar as BigCalendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import style from "./CalendarForm.module.css";
import DashboardNavBar from "../../utilities/DashboardNavbar/DashboardNavbar";
import {
  ChakraProvider,
  Tab,
  TabList,
  TabPanels,
  Tabs,
  useColorModeValue,
} from "@chakra-ui/react";
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
  const [assignmentfrom, setAssignmentFrom] = useState("");
  const [assignmentto, setAssignmentTo] = useState("");
  const [email, setEmail] = useState("");
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);
  const [client, setClient] = useState("");
  const [desc, setDesc] = useState("");
  const [location, setLocation] = useState("");
  const [casetype, setCaseType] = useState("");
  const [contactperson, setContactPerson] = useState("");
  const [openSlot, setOpenSlot] = useState(false);
  const [openEvent, setOpenEvent] = useState(false);
  const [clickedEvent, setClickedEvent] = useState(null);

  // chakra ui

  const eventColors = {
    Tasks: "lightcoral",
    hearing: "lightblue",
    appointment: "lightgreen",
  };

  // validation
  const handleValidation = () => {
    let isValid = true;
    const newErrors = { casetitle: "", start: "", end: "", casetype: "" };

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
    setContactPerson(event.contactperson);
    setAssignmentFrom(event.assignmentfrom)
    setAssignmentTo(event.assignmentto)
  };

  const handleStartTime = (date) => {
    setStart(date);
  };

  const handleEndTime = (date) => {
    setEnd(date);
  };

  const setNewTasks = () => {
    console.log("Attempting to submit with", {
      casetitle:"",
      start,
      end,
      casetype,
      assignmentfrom,
      assignmentto,
    });

    if (handleValidation()) {
      let newEvent = {
        title: casetitle,
        start: new Date(start), // Ensure these are valid Date objects
        end: new Date(end),
        casetype,
        assignmentfrom,
        assignmentto,
        type: "Tasks",
      };
      console.log("Creating new event", newEvent);

      setEvents([...events, newEvent]);
      handleClose();
      setCaseTitle("");
      setStart(null);
      setEnd(null);
      setAssignmentFrom("");
      setAssignmentTo("");
    } else {
      console.error("Validation failed:", errors);
    }
  };

  const setNewAppointment = () => {

    if (handleValidation()) {

    let newEvent = {
      title: casetitle,
      start: new Date(start),
      end: new Date(end),
      location,
      email,
      casetype,
      type: "appointment",
      contactperson,
      style: { backgroundColor: "green" },
    };
    console.log("Creating new event", newEvent);


    setEvents([...events, newEvent]);
    handleClose();
    setCaseTitle("");


  } else {
    console.error("Validation failed:", errors);
  }

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
          <ChakraProvider>
            <div className={style.modal}>
              <div className={style.modalContent}>
                <span className={style.closeButton} onClick={handleClose}>
                  &times;
                </span>
                <h2 className={style.header}>
                  {moment(start).format("MMMM Do YYYY")}
                </h2>
                <Tabs >
                  <TabList>
                    <Tab utton className={style.btn1} onClick={showForm1}>
                      Tasks
                    </Tab>
                    <Tab className={style.btn2} onClick={showForm2}>
                      Hearing Date
                    </Tab>
                    <Tab className={style.btn3} onClick={showForm3}>
                      Appointment
                    </Tab>
                  </TabList>
                </Tabs>

                {visibleForm === "Tasks" && (
                  <>
                    <div className={style.visibleForm}>
                      <div className={style.TasksVisibleContainer}>
                        <label className={style.TasksVisibleTitle}>
                          Case
                        </label>
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
                        <label className={style.TasksVisibleTitle}>
                          Start Date
                        </label>
                        <input
                          className={style.TasksVisibleInput}
                          type="date"
                          value={moment(start).format("YYYY-MM-DD")}
                          onChange={(e) => setStart(e.target.value)}
                        />
                        <label className={style.TasksVisibleTitle}>
                        Assignment From
                      </label>
                        
                      <input
                        className={style.TasksVisibleInput}
                        type="text"
                        value={assignmentfrom}
                        placeholder="From"
                        onChange={(e) => setAssignmentFrom(e.target.value)}
                      />
                        <br />
                      </div>
                      <div className={style.TimeContainer}>
                        
                      <label className={style.TasksVisibleTitle}>
                          Case Title
                        </label>
                        <input
                          className={style.TasksVisibleInput}
                          type="text"
                          value={casetitle}
                          placeholder="Case Title"
                          onChange={(e) => setCaseTitle(e.target.value)}
                        />
                        
                        <label className={style.TasksVisibleTitle}>
                          End Date
                        </label>
                        <input
                          className={style.TasksVisibleInput}
                          type="date"
                          value={moment(end).format("YYYY-MM-DD")}
                          onChange={(e) => setEnd(e.target.value)}
                        />
                        
                        
                      <label className={style.TasksVisibleTitle}>
                        Assignment To
                      </label>
                      <input
                        className={style.TasksVisibleInput}
                        type="text"
                        value={assignmentto}
                        placeholder="To"
                        onChange={(e) => setAssignmentTo(e.target.value)}
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
                      <div className={style.formRow}>
                      <label className={style.TasksVisibleTitle}>
                          Case
                        </label>
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
                        <label className={style.HearingVisibleFormTitle}>
                        Assigned Lawyer
                        </label>
                        <input
                          className={style.HearingVisibleFormInput}
                          type="text"
                          value={casetype}
                          placeholder="Case type"
                          onChange={(e) => setCaseType(e.target.value)}
                        />
                      </div>
                      <div className={style.formRow}>
                        <label className={style.HearingVisibleFormTitle}>
                        Status
                        </label>
                        <input
                          className={style.HearingVisibleFormInput}
                          type="text"
                          value={client}
                          placeholder="Assign Team Member"
                          onChange={(e) => setClient(e.target.value)}
                        />
                      </div>
                      <div className={style.formRow}>
                        <label className={style.HearingVisibleFormTitle}>
                        Hearing Date
                        </label>
                        <input
                          className={style.HearingVisibleFormDate}
                          type="date"
                          value={desc}
                          onChange={(e) => setDesc(e.target.value)}
                        />
                      </div>
                      <div className={style.formRow}>
                        <label className={style.HearingVisibleFormTitle}>
                          Start Time
                        </label>
                        <input
                          className={style.HearingVisibleFormTime}
                          type="time"
                          value={
                            start ? start.toISOString().substring(11, 16) : ""
                          }
                          onChange={(e) => {
                            if (start) {
                              const [hours, minutes] =
                                e.target.value.split(":");
                              const newStartTime = new Date(
                                start.setHours(hours, minutes)
                              );
                              handleStartTime(newStartTime);
                            }
                          }}
                        />
                      </div>
                      <div className={style.formRow}>
                        <label className={style.HearingVisibleFormTitle}>
                          End Time
                        </label>
                        <input
                          className={style.HearingVisibleFormTime}
                          type="time"
                          value={end ? end.toISOString().substring(11, 16) : ""}
                          onChange={(e) =>
                            handleEndTime(
                              new Date(
                                end.setHours(...e.target.value.split(":"))
                              )
                            )
                          }
                        />
                      </div>
                      
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
                    <div className={style.AppointmentVisibleForm}>
                      <div className={style.formRow}>
                      <label className={style.TasksVisibleTitle}>
                          Case
                        </label>
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
                      <label className={style.AppointmentFormTitle}>
                          Case Title
                        </label>
                        <input
                          className={style.HearingVisibleFormInput}
                          type="text"
                          value={casetitle}
                          placeholder="Title"
                          onChange={(e) => setCaseTitle(e.target.value)}
                        />
                      </div>
                      <div className={style.formRow}>

                      <label className={style.AppointmentFormTitle}>
                        Contact Person
                        </label>
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
                        <label className={style.AppointmentFormTitle}>
                          Location
                        </label>
                        <input
                          className={style.HearingVisibleFormInput}
                          type="text"
                          value={location}
                          placeholder="Location"
                          onChange={(e) => setLocation(e.target.value)}
                        />
                      </div>
                      <div className={style.formRow}>
                        <label className={style.AppointmentFormTitle}>
                          Start Time
                        </label>
                        <input
                          className={style.HearingVisibleFormTime}
                          type="time"
                          value={
                            start ? start.toISOString().substring(11, 16) : ""
                          }
                          onChange={(e) => {
                            if (start) {
                              const [hours, minutes] =
                                e.target.value.split(":");
                              const newStartTime = new Date(
                                start.setHours(hours, minutes)
                              );
                              handleStartTime(newStartTime);
                            }
                          }}
                        />
                      </div>
                      <div className={style.formRow}>
                        <label className={style.AppointmentFormTitle}>
                          End Time
                        </label>
                        <input
                          className={style.HearingVisibleFormTime}
                          type="time"
                          value={end ? end.toISOString().substring(11, 16) : ""}
                          onChange={(e) =>
                            handleEndTime(
                              new Date(
                                end.setHours(...e.target.value.split(":"))
                              )
                            )
                          }
                        />
                      </div>
                      <div className={style.formRow}>
                        <label className={style.HearingVisibleFormTitle}>
                          Email
                        </label>
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
          </ChakraProvider>
        )}

        {openEvent && (
          <div className={style.modal}>
            <div className={style.modalContent}>
              {clickedEvent.type === "Tasks" && (
                <>
                <h2 style={{textAlign:"center",paddingBottom:"2rem"}}>Update Tasks</h2>
                  <div className={style.visibleForm}>
                      <div className={style.TasksVisibleContainer}>
                        <label className={style.TasksVisibleTitle}>
                          Case
                        </label>
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
                        <label className={style.TasksVisibleTitle}>
                          Start Date
                        </label>
                        <input
                          className={style.TasksVisibleInput}
                          type="date"
                          value={moment(start).format("YYYY-MM-DD")}
                          onChange={(e) => setStart(e.target.value)}
                        />
                        <label className={style.TasksVisibleTitle}>
                        Assignment From
                      </label>
                        
                      <input
                        className={style.TasksVisibleInput}
                        type="text"
                        value={assignmentfrom}
                        placeholder="From"
                        onChange={(e) => setAssignmentFrom(e.target.value)}
                      />
                        <br />
                      </div>
                      <div className={style.TimeContainer}>
                        
                      <label className={style.TasksVisibleTitle}>
                          Case Title
                        </label>
                        <input
                          className={style.TasksVisibleInput}
                          type="text"
                          value={casetitle}
                          placeholder="Case Title"
                          onChange={(e) => setCaseTitle(e.target.value)}
                        />
                        
                        <label className={style.TasksVisibleTitle}>
                          End Date
                        </label>
                        <input
                          className={style.TasksVisibleInput}
                          type="date"
                          value={moment(end).format("YYYY-MM-DD")}
                          onChange={(e) => setEnd(e.target.value)}
                        />
                        
                        
                      <label className={style.TasksVisibleTitle}>
                        Assignment To
                      </label>
                      <input
                        className={style.TasksVisibleInput}
                        type="text"
                        value={assignmentto}
                        placeholder="To"
                        onChange={(e) => setAssignmentTo(e.target.value)}
                      />
                      </div>
                    </div>
                    <div className={style.btnContainerclickedEvent}>
                  <button className={style.btn} onClick={handleClose}>
                    Cancel
                  </button>
                  <button className={style.btn} onClick={updateEvent}>
                    Update
                  </button>
                  <button className={style.btn} onClick={deleteEvent}>
                    delete
                  </button>
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
                  <div className={style.btnContainer}>
                  <button className={style.btn} onClick={handleClose}>
                    Cancel
                  </button>
                  <button className={style.btn} onClick={updateEvent}>
                    Update
                  </button>
                  <button className={style.btn} onClick={deleteEvent}>
                    delete
                  </button>
                  </div>
                </>
              )}

              {clickedEvent.type === "Appointment" && (
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
                  <div className={style.btnContainer}>
                  <button className={style.btn} onClick={handleClose}>
                    Cancel
                  </button>
                  <button className={style.btn} onClick={updateEvent}>
                    Update
                  </button>
                  <button className={style.btn} onClick={deleteEvent}>
                    delete
                  </button>
                  </div>
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
