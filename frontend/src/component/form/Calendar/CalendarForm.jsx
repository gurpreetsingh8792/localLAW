import React, { useState, useEffect } from "react";
import { Calendar as BigCalendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import style from "./CalendarForm.module.css";
import axios from "axios";
import DashboardNavBar from "../../utilities/DashboardNavbar/DashboardNavbar";
import { useNavigate } from "react-router-dom";
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

  const [visibleForm, setVisibleForm] = useState("Tasks");
  const showForm1 = () => setVisibleForm("Tasks");
  const showForm2 = () => setVisibleForm("Hearing Date");
  const showForm3 = () => setVisibleForm("appointment");

  const [events, setEvents] = useState([]);
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [caseTitles, setCaseTitles] = useState([]); // Store fetched case titles
  const [caseTypeMap, setCaseTypeMap] = useState({}); // Store case types based on titles
  const [casetitle, setCaseTitle] = useState("");
  const [casetype, setCaseType] = useState("");
  const [teamMembers, setTeamMembers] = useState([]);
  const [assignmentfrom, setAssignmentFrom] = useState("");
  const [assignmentto, setAssignmentTo] = useState("");
  const [email, setEmail] = useState("");
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);
  const [client, setClient] = useState("");
  const [desc, setDesc] = useState("");
  const [location, setLocation] = useState("");
  const [clientNames, setClientNames] = useState([]);
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

  const createEvent = (task) => {
    return {
      id: task.id, // Add "id" field to uniquely identify tasks
      title: task.title,
      start: new Date(task.startDate),
      end: new Date(task.completionDate),
      caseTitle: task.caseTitle,
      caseType: task.caseType,
      assignFrom: task.assignFrom,
      assignTo: task.assignTo,
      type: "Tasks",
    };
  };
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8052/calendar/alerts",
          {
            headers: { "x-auth-token": localStorage.getItem("token") },
          }
        );
        const tasks = response.data;
        const taskEvents = tasks.map(createEvent);
        setEvents((prevEvents) => [...prevEvents, ...taskEvents]);
        setEvents(taskEvents);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    const fetchAppointments = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8052/calendar/appointments",
          {
            headers: { "x-auth-token": localStorage.getItem("token") },
          }
        );

        const appointments = response.data;
        const appointmentEvents = appointments.map((appointment) => ({
          id: appointment.id,
          title: appointment.title,
          start: new Date(appointment.appointmentDate),
          end: new Date(appointment.appointmentDate),
          type: "appointment",
          style: { backgroundColor: "green" },
        }));

        setEvents((prevEvents) => [...prevEvents, ...appointmentEvents]);
      } catch (error) {
        console.error("Error fetching appointments:", error);
      }
    };

    const fetchHearings = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8052/calendar/hearings",
          {
            headers: { "x-auth-token": localStorage.getItem("token") },
          }
        );
        const hearings = response.data;
        const hearingEvents = hearings.map((hearing) => ({
          id: hearing.id,
          title: hearing.title,
          start: new Date(hearing.hearingDate),
          end: new Date(hearing.hearingDate),
          type: "hearing",
          style: { backgroundColor: "blue" },
        }));
        setEvents((prevEvents) => [...prevEvents, ...hearingEvents]);
      } catch (error) {
        console.error("Error fetching hearings:", error);
      }
    };

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
    const fetchTeamMembers = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8052/dashboard/alert/teammembers",
          {
            headers: { "x-auth-token": localStorage.getItem("token") },
          }
        );
        setTeamMembers(response.data.map((member) => member.name));
      } catch (error) {
        console.error("Error fetching team members:", error);
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
    fetchTasks();
    fetchAppointments();
    fetchHearings();
    fetchCaseTitlesAndTypes(); // Call the new function to fetch case titles and types
    fetchTeamMembers();
  }, []);
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
    setVisibleForm("Tasks");
  };

  const handleEventSelected = (event) => {
    setOpenEvent(true);
    setClickedEvent(event);

    if (event.type === "Tasks") {
      axios
        .get(`http://localhost:8052/calendar/alerts/${event.id}`, {
          headers: {
            "x-auth-token": localStorage.getItem("token"),
          },
        })
        .then((response) => {
          const taskDetails = response.data;
          setTitle(taskDetails.title);
          setCaseTitle(taskDetails.caseTitle);
          setStart(taskDetails.startDate);
          setEnd(taskDetails.completionDate);
          setAssignmentFrom(taskDetails.assignFrom);
          setAssignmentTo(taskDetails.assignTo);
          // Update other state variables as needed
        })
        .catch((error) => {
          console.error("Error fetching task details:", error);
        });
    } else if (event.type === "hearing") {
      axios
        .get(`http://localhost:8052/calendar/hearings/${event.id}`, {
          headers: {
            "x-auth-token": localStorage.getItem("token"),
          },
        })
        .then((response) => {
          const hearingDetails = response.data;

          setTitle(hearingDetails.title);
          setCaseType(hearingDetails.assignedLawyer);
          setCaseTitle(hearingDetails.caseTitle); // Set the case title
          setClient(hearingDetails.status); // Set the status or client field
          setDesc(hearingDetails.hearingDate); // Set the hearing date (you may need to format it)
          setStart(
            hearingDetails.startTime
              ? new Date(`1970-01-01T${hearingDetails.startTime}:00`)
              : null
          );
          setEnd(
            hearingDetails.endTime
              ? new Date(`1970-01-01T${hearingDetails.endTime}:00`)
              : null
          );
        })
        .catch((error) => {
          console.error("Error fetching hearing details:", error);
        });
    } else if (event.type === "appointment") {
      axios
        .get(`http://localhost:8052/calendar/appointments/${event.id}`, {
          headers: {
            "x-auth-token": localStorage.getItem("token"),
          },
        })
        .then((response) => {
          const appointmentDetails = response.data;
          // Update your state with appointment details as needed
          setTitle(appointmentDetails.title);
          setCaseTitle(appointmentDetails.caseTitle);
          setCaseType(appointmentDetails.caseType);
          setContactPerson(appointmentDetails.contactPerson);
          setLocation(appointmentDetails.location);
          setDesc(appointmentDetails.appointmentDate);
          setEmail(appointmentDetails.email);
          setStart(
            appointmentDetails.startTime
              ? new Date(`1970-01-01T${appointmentDetails.startTime}:00`)
              : null
          );
          setEnd(
            appointmentDetails.endTime
              ? new Date(`1970-01-01T${appointmentDetails.endTime}:00`)
              : null
          );
          // Update other state variables as needed
        })
        .catch((error) => {
          console.error("Error fetching appointment details:", error);
        });
    }
  };

  const handleStartTime = (newStartTime) => {
    setStart(newStartTime);
  };

  const handleEndTime = (newEndTime) => {
    setEnd(newEndTime);
  };

  const setNewTasks = () => {
    if (handleValidation()) {
      const newTaskData = {
        title, // Use the state variable 'title' here for the new "title" field
        caseTitle: casetitle,
        caseType: caseTypeMap[casetitle] || "",
        startDate: start,
        completionDate: end,
        assignFrom: assignmentfrom,
        assignTo: assignmentto,
      };
      axios
        .post("http://localhost:8052/alerts", newTaskData, {
          headers: {
            "x-auth-token": localStorage.getItem("token"),
          },
        })
        .then((response) => {
          // Handle success
          console.log("Task saved successfully:", response.data);
          navigate(0);
          handleClose();
          setCaseTitle("");
          setTitle(""); // Reset the 'title' state
          setStart(null);
          setEnd(null);
          setAssignmentFrom("");
          setAssignmentTo("");
          // Reset other form fields as needed
        })
        .catch((error) => {
          // Handle error
          console.error("Error saving task:", error);
        });
    } else {
      console.error("Validation failed:", errors);
    }
  };


  const setNewAppointment = () => {
    if (handleValidation()) {
      let newEvent = {
       title,
        caseTitle: casetitle,
        caseType: caseTypeMap[casetitle] || "",
        appointmentDate: desc,
        contactPerson: contactperson, // Use the correct variable name 'contactperson'
        location,
        startTime: start,
        endTime: end,
        email,  
        type: "appointment",
        style: { backgroundColor: "green" },
      };
      console.log("Creating new event", newEvent);
      // Send the new appointment data to the backend
      axios
        .post("http://localhost:8052/appointments", newEvent, {
          headers: {
            "x-auth-token": localStorage.getItem("token"),
          },
        })
        .then((response) => {
          // Handle success
          console.log("Appointment saved successfully:", response.data);
          

          // Create a new appointment event to add to the calendar
          const newAppointmentEvent = {
            id: response.data.id, // Replace with the correct ID field from your response
            title: response.data.title,
            desc: response.data.appointmentDate,
            start: new Date(response.data.start),
            end: new Date(response.data.end),
            type: "appointment",
            style: { backgroundColor: "green" },
          };

          // Add the new appointment event to the events array
          setEvents([...events, newAppointmentEvent]);
          navigate(0);

          // Reset form fields and update the events state if needed
          handleClose();
          setTitle("");
          setCaseTitle("");
          setContactPerson("");
          setLocation("");
          setStart(null);
          setEnd(null);
          setEmail("");
          // Reset other form fields as needed

          // You may want to fetch updated events from the server here if needed
          // Example:
          // fetchAppointments();
        })
        .catch((error) => {
          // Handle error
          console.error("Error saving appointment:", error);
        });
    } else {
      console.error("Validation failed:", errors);
    }
  };

  const setNewHearing = () => {
    if (handleValidation()) {
      const newHearingData = {
        title: title,
        caseTitle: casetitle,
        assignedLawyer: casetype,
        status: client,
        hearingDate: desc,
        // startTime: start,
        startTime: start ,
        // endTime: end ,
        endTime: end ,
      };

      axios
        .post("http://localhost:8052/hearings", newHearingData, {
          headers: {
            "x-auth-token": localStorage.getItem("token"),
          },
        })
        .then((response) => {
          console.log("Hearing saved successfully:", response.data);
          const newEvent = {
            title: response.data.title, // Replace with the correct field name for hearing title
            start: new Date(response.data.hearingDate), // Replace with the correct field name for hearing date
            end: new Date(response.data.hearingDate), // You may need to adjust this based on your data model
            desc: response.data.hearingDate, // Replace with the correct field name for hearing date
            client: response.data.status, // Replace with the correct field name for status
            location: "", // You may need to add the correct field for location
            type: "hearing",
            style: { backgroundColor: "blue" },
          };
          setEvents([...events, newEvent]); // Add the new hearing to the events array
          navigate(0);
          handleClose();
          setCaseTitle("");
          setTitle(""); // Reset the 'title' state
          setStart(null);
          setEnd(null);
          setDesc("");
          setClient("");
          // Reset other form fields as needed
        })
        .catch((error) => {
          // Handle error
          console.error("Error saving hearing:", error);
        });
    } else {
      console.error("Validation failed:", errors);
    }
  };

  // Function to update a Task event
  const updateTaskEvent = () => {
    if (clickedEvent && clickedEvent.type === "Tasks") {
      const taskIdToUpdate = clickedEvent.id;

      const updatedTaskData = {
        title,
        caseTitle: casetitle,
        caseType: caseTypeMap[casetitle] || "",
        startDate: start,
        completionDate: end,
        assignFrom: assignmentfrom,
        assignTo: assignmentto,
      };

      axios
        .put(
          `http://localhost:8052/calendar/alerts/${taskIdToUpdate}`,
          updatedTaskData,
          {
            headers: {
              "x-auth-token": localStorage.getItem("token"),
            },
          }
        )
        .then((response) => {
          // Handle success
          console.log("Task updated successfully:", response.data);
          handleClose();

          // Update the event in the events state with the new data
          const updatedEvents = events.map((event) =>
            event.id === taskIdToUpdate
              ? { ...event, ...updatedTaskData }
              : event
          );
          setEvents(updatedEvents);
        })
        .catch((error) => {
          // Handle error
          console.error("Error updating task:", error);
        });
    } else {
      console.error("No task selected to update");
    }
  };

  // Function to update a Hearing event
  const updateHearingEvent = () => {
    if (clickedEvent && clickedEvent.type === "hearing") {
      const hearingIdToUpdate = clickedEvent.id;

      const updatedHearingData = {
        title,
        caseTitle: casetitle,
        assignedLawyer: casetype, // Replace with the correct field name for assigned lawyer
        status: client, // Replace with the correct field name for status
        hearingDate: desc, // Replace with the correct field name for hearing date
        startTime: start, // Provide a default value if start is null
        endTime: end, // Provide a default value if end is null
      };

      axios
        .put(
          `http://localhost:8052/calendar/hearings/${hearingIdToUpdate}`,
          updatedHearingData,
          {
            headers: {
              "x-auth-token": localStorage.getItem("token"),
            },
          }
        )
        .then((response) => {
          // Handle success
          console.log("Hearing updated successfully:", response.data);
          handleClose();

          // Update the event in the events state with the new data
          const updatedEvents = events.map((event) =>
            event.id === hearingIdToUpdate
              ? { ...event, ...updatedHearingData }
              : event
          );
          setEvents(updatedEvents);
        })
        .catch((error) => {
          // Handle error
          console.error("Error updating hearing:", error);
        });
    } else {
      console.error("No hearing selected to update");
    }
  };

  const updateAppointmentEvent = () => {
    if (clickedEvent && clickedEvent.type === "appointment") {
      const appointmentIdToUpdate = clickedEvent.id;
  
      const updatedAppointmentData = {
        title,
        caseTitle: casetitle,
        caseType: caseTypeMap[casetitle] || "",
        appointmentDate: desc,
        contactPerson: contactperson,
        location,
        startTime: start ? start.toISOString().substring(11, 16) : "",
        endTime: end ? end.toISOString().substring(11, 16) : "",
        email,
      };
  
      axios
        .put(
          `http://localhost:8052/calendar/appointments/${appointmentIdToUpdate}`,
          updatedAppointmentData,
          {
            headers: {
              "x-auth-token": localStorage.getItem("token"),
            },
          }
        )
        .then((response) => {
          // Handle success
          console.log("Appointment updated successfully:", response.data);
          handleClose();
  
          // Update the event in the events state with the new data
          const updatedEvents = events.map((event) =>
            event.id === appointmentIdToUpdate
              ? { ...event, ...updatedAppointmentData }
              : event
          );
          setEvents(updatedEvents);
        })
        .catch((error) => {
          // Handle error
          console.error("Error updating appointment:", error);
        });
    } else {
      console.error("No appointment selected to update");
    }
  };


  // Function to delete a Task event
  const deleteTaskEvent = () => {
    if (clickedEvent && clickedEvent.type === "Tasks") {
      const taskIdToDelete = clickedEvent.id;

      axios
        .delete(`http://localhost:8052/calendar/alerts/${taskIdToDelete}`, {
          headers: {
            "x-auth-token": localStorage.getItem("token"),
          },
        })
        .then((response) => {
          // Handle success
          console.log("Task deleted successfully:", response.data);
          handleClose();

          // Remove the deleted event from the events state
          const updatedEvents = events.filter(
            (event) => event.id !== taskIdToDelete
          );
          setEvents(updatedEvents);
        })
        .catch((error) => {
          // Handle error
          console.error("Error deleting task:", error);
        });
    } else {
      console.error("No task selected to delete");
    }
  };

  // Function to delete a Hearing event
  const deleteHearingEvent = () => {
    if (clickedEvent && clickedEvent.type === "hearing") {
      const hearingIdToDelete = clickedEvent.id;

      axios
        .delete(
          `http://localhost:8052/calendar/hearings/${hearingIdToDelete}`,
          {
            headers: {
              "x-auth-token": localStorage.getItem("token"),
            },
          }
        )
        .then((response) => {
          // Handle success
          console.log("Hearing deleted successfully:", response.data);
          handleClose();

          // Remove the deleted event from the events state
          const updatedEvents = events.filter(
            (event) => event.id !== hearingIdToDelete
          );
          setEvents(updatedEvents);
        })
        .catch((error) => {
          // Handle error
          console.error("Error deleting hearing:", error);
        });
    } else {
      console.error("No hearing selected to delete");
    }
  };
  const deleteAppointmentEvent = () => {
    if (clickedEvent && clickedEvent.type === "appointment") {
      const appointmentIdToDelete = clickedEvent.id;
  
      axios
        .delete(
          `http://localhost:8052/calendar/appointments/${appointmentIdToDelete}`,
          {
            headers: {
              "x-auth-token": localStorage.getItem("token"),
            },
          }
        )
        .then((response) => {
          // Handle success
          console.log("Appointment deleted successfully:", response.data);
          handleClose();
  
          // Remove the deleted event from the events state
          const updatedEvents = events.filter(
            (event) => event.id !== appointmentIdToDelete
          );
          setEvents(updatedEvents);
        })
        .catch((error) => {
          // Handle error
          console.error("Error deleting appointment:", error);
        });
    } else {
      console.error("No appointment selected to delete");
    }
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
            title: event.title,
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
                <Tabs>
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
                    {/* <div className={style.visibleForm}> */}

                    <div className={style.formGroup}>
                      <label className={style.TasksVisibleTitle}>Title</label>
                      <input
                        className={style.TasksVisibleInput}
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                      />
                    </div>

                    <div className={style.formRow}>
                      <div className={style.formGroup}>
                        <label className={style.TasksVisibleTitle}>
                          Case Title
                        </label>
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

                      <div className={style.formGroup}>
                        <label className={style.TasksVisibleTitle}>
                          Case Type
                        </label>
                        <input
                          className={style.TasksVisibleInput}
                          type="text"
                          value={caseTypeMap[casetitle] || ""}
                          readOnly
                          placeholder="Case Type"
                        />
                      </div>
                    </div>

                    <div className={style.formRow}>
                      <div className={style.formGroup}>
                        <label className={style.TasksVisibleTitle}>
                          Assignment From
                        </label>
                        <select
                          id="assignFrom"
                          name="assignFrom"
                          className="selectField"
                          value={assignmentfrom}
                          onChange={(e) => setAssignmentFrom(e.target.value)}
                        >
                          <option value="">Select an option</option>
                          {teamMembers.map((member) => (
                            <option key={member} value={member}>
                              {member}
                            </option>
                          ))}
                        </select>
                        <br />
                      </div>

                      <div className={style.formGroup}>
                        <label className={style.TasksVisibleTitle}>
                          Assignment To
                        </label>
                        <select
                          id="assignTo"
                          name="assignTo"
                          className="selectField"
                          value={assignmentto}
                          onChange={(e) => setAssignmentTo(e.target.value)}
                        >
                          <option value="">Select an option</option>
                          {teamMembers.map((member) => (
                            <option key={member} value={member}>
                              {member}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className={style.formRow}>
                      <div className={style.formGroup}>
                        <label className={style.TasksVisibleTitle}>
                          Start Date
                        </label>
                        <input
                          className={style.TasksVisibleInput}
                          type="date"
                          value={moment(start).format("YYYY-MM-DD")}
                          onChange={(e) => setStart(e.target.value)}
                        />
                      </div>

                      <div className={style.formGroup}>
                        <label className={style.TasksVisibleTitle}>
                          End Date
                        </label>
                        <input
                          className={style.TasksVisibleInput}
                          type="date"
                          value={moment(end).format("YYYY-MM-DD")}
                          onChange={(e) => setEnd(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className={style.BtnContainerTask}>
                      <button className={style.btn} onClick={handleClose}>
                        Cancel
                      </button>
                      <button className={style.btn} onClick={setNewTasks}>
                        Submit
                      </button>
                    </div>
                    {/* </div> */}

                  </>
                )}

                {visibleForm === "Hearing Date" && (
                  <>
                    <div className={style.HearingVisibleForm}>
                      <div className={style.formGroup}>
                        <label className={style.TasksVisibleTitle}>Title</label>
                        <input
                          className={style.TasksVisibleInput}
                          type="text"
                          value={title}
                          placeholder="Enter Title"
                          onChange={(e) => setTitle(e.target.value)}
                        />
                      </div>

                      <div className={style.formRow}>
                        <div className={style.formGroup}>
                          <label className={style.TasksVisibleTitle}>
                            Case Title
                          </label>
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
                        <div className={style.formGroup}>
                          <label className={style.TasksVisibleTitle}>
                            Case Type
                          </label>
                          <input
                            className={style.TasksVisibleInput}
                            type="text"
                            value={caseTypeMap[casetitle] || ""}
                            readOnly
                            placeholder="Case Type"
                          />
                        </div>
                      </div>

                      <div className={style.formRow}>
                        <div className={style.formGroup}>
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

                        <div className={style.formGroup}>
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
                      </div>

                      <div className={style.formRow}>
                        <div className={style.formGroup}>
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

                        <div className={style.formGroup}>
                          <label className={style.HearingVisibleFormTitle}>
                            Start Time
                          </label>
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
                          <label className={style.HearingVisibleFormTitle}>
                            End Time
                          </label>
                          <input
                            className={style.HearingVisibleFormTime}
                            type="time"
                            value={
                              end ? end.toISOString().substring(11, 16) : ""
                            }
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
                    </div>
                    <div className={style.BtnContainerHearing}>
                      <button className={style.btn} onClick={setNewHearing}>
                        Submit
                      </button>
                      <button className={style.btn} onClick={handleClose}>
                        Cancel
                      </button>
                    </div>
                  </>
                )}

                {visibleForm === "appointment" && (
                  <>
                    <div className={style.AppointmentVisibleForm}>
                      
                      <div className={style.formRow}>
                        <div className={style.formGroup}>
                          <label className={style.AppointmentFormTitle}>
                            Title
                          </label>
                          <input
                            className={style.TasksVisibleInput}
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                          />
                        </div>

                        <div className={style.formGroup}>
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

                      <div className={style.formRow}>
                        <div className={style.formGroup}>
                          <label className={style.TasksVisibleTitle}>
                            Case Title
                          </label>
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

                        <div className={style.formGroup}>
                          <label className={style.AppointmentFormTitle}>
                            Case Type
                          </label>
                          <input
                            className={style.TasksVisibleInput}
                            type="text"
                            value={caseTypeMap[casetitle] || ""}
                            readOnly
                            placeholder="Case Type"
                          />
                        </div>
                      </div>

                      <div className={style.formRow}>
                        <div className={style.formGroup}>
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

                        <div className={style.formGroup}>
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
                      </div>

                      <div className={style.formRow}>
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

                        <div className={style.formGroup}>
                          <label className={style.AppointmentFormTitle}>
                            Start Time
                          </label>

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
                          <label className={style.AppointmentFormTitle}>
                            End Time
                          </label>
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
                      </div>
                    </div>

                    <div className={style.BtnContainer}>
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

        {openEvent && clickedEvent && (
          <div className={style.modal}>
            <div className={style.modalContent}>
              {clickedEvent.type === "Tasks" && (
                <div>
                  <h2 style={{ textAlign: "center" }}>Update Tasks</h2>

                  {/* Title */}
                  <div className={style.formGroup}>
                    <label className={style.TasksVisibleTitle}>Title</label>
                    <input
                      className={style.TasksVisibleInput}
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  <div className={style.formRow}>
                    <div className={style.formGroup}>
                      {/* Case Title (Dropdown) */}
                      <label className={style.TasksVisibleTitle}>
                        Case Title
                      </label>
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

                    {/* Start Date */}
                    <div className={style.formGroup}>
                      <label className={style.TasksVisibleTitle}>
                        Case Type
                      </label>
                      <input
                        className={style.TasksVisibleInput}
                        type="text"
                        value={caseTypeMap[casetitle] || ""}
                        readOnly
                        placeholder="Case Type"
                      />
                    </div>
                  </div>

                  {/* Assignment From (Dropdown) */}
                  <div className={style.formRow}>
                    <div className={style.formGroup}>
                      <label className={style.TasksVisibleTitle}>
                        Assignment From
                      </label>
                      <select
                        id="assignFrom"
                        name="assignFrom"
                        className="selectField"
                        value={assignmentfrom}
                        onChange={(e) => setAssignmentFrom(e.target.value)}
                      >
                        <option value="">Select an option</option>
                        {teamMembers.map((member) => (
                          <option key={member} value={member}>
                            {member}
                          </option>
                        ))}
                      </select>
                      <br />
                    </div>

                    {/* Case Type (Read-only) */}

                    <div className={style.formGroup}>
                      <label className={style.TasksVisibleTitle}>
                        Assignment To 
                      </label>
                      <br/>
                      <select
                        id="assignTo"
                        name="assignTo"
                        className="selectField"
                        value={assignmentto}
                        onChange={(e) => setAssignmentTo(e.target.value)}
                      >
                        <option value="">Select an option</option>
                        {teamMembers.map((member) => (
                          <option key={member} value={member}>
                            {member}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* End Date */}
                  <div className={style.formRow}>
                    <div className={style.formGroup}>
                      <label className={style.TasksVisibleTitle}>
                        Start Date
                      </label>
                      <input
                        className={style.TasksVisibleInput}
                        type="date"
                        value={moment(start).format("YYYY-MM-DD")}
                        onChange={(e) => setStart(e.target.value)}
                      />
                    </div>

                    {/* Assignment To (Dropdown) */}
                    <div className={style.formGroup}>
                      <label className={style.TasksVisibleTitle}>
                        End Date
                      </label>
                      <input
                        className={style.TasksVisibleInput}
                        type="date"
                        value={moment(end).format("YYYY-MM-DD")}
                        onChange={(e) => setEnd(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className={style.BtnContainerTask}>
                    <button className={style.btn} onClick={handleClose}>
                      Cancel
                    </button>
                    <button className={style.btn} onClick={updateTaskEvent}>
                      Update
                    </button>
                    <button className={style.btn} onClick={deleteTaskEvent}>
                      Delete
                    </button>
                  </div>
                </div>
              )}

              {clickedEvent.type === "hearing" && (
                <>
                  <h2 style={{ textAlign: "center" }}>Update Hearing</h2>

                  <div className={style.HearingVisibleForm}>
                      <div className={style.formGroup}>
                        <label className={style.TasksVisibleTitle}>Title</label>
                        <input
                          className={style.TasksVisibleInput}
                          type="text"
                          value={title}
                          placeholder="Enter Title"
                          onChange={(e) => setTitle(e.target.value)}
                        />
                      </div>

                      <div className={style.formRow}>
                        <div className={style.formGroup}>
                          <label className={style.TasksVisibleTitle}>
                            Case Title
                          </label>
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
                        <div className={style.formGroup}>
                          <label className={style.TasksVisibleTitle}>
                            Case Type
                          </label>
                          <input
                            className={style.TasksVisibleInput}
                            type="text"
                            value={caseTypeMap[casetitle] || ""}
                            readOnly
                            placeholder="Case Type"
                          />
                        </div>
                      </div>

                      <div className={style.formRow}>
                        <div className={style.formGroup}>
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

                        <div className={style.formGroup}>
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
                      </div>

                      <div className={style.formRow}>
                        <div className={style.formGroup}>
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

                        <div className={style.formGroup}>
                          <label className={style.HearingVisibleFormTitle}>
                            Start Time
                          </label>
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
                          <label className={style.HearingVisibleFormTitle}>
                            End Time
                          </label>
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
                      </div>
                    </div>
                  <div className={style.BtnContainerUpdateHearing}>
                    <button className={style.btn} onClick={handleClose}>
                      Cancel
                    </button>
                    <button className={style.btn} onClick={updateHearingEvent}>
                      Update
                    </button>
                    <button className={style.btn} onClick={deleteHearingEvent}>
                      Delete
                    </button>
                  </div>
                </>
              )}

              {clickedEvent.type === "appointment" && (
                <>
                  <h2 style={{ textAlign: "center" }}>Update Appointment</h2>

                  <div className={style.AppointmentVisibleForm}>
                    <div className={style.formRow}>
                      <div className={style.formGroup}>
                        <label className={style.AppointmentFormTitle}>
                          Title
                        </label>
                        <input
                          className={style.TasksVisibleInput}
                          type="text"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                        />
                      </div>

                      <div className={style.formGroup}>
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

                    <div className={style.formRow}>
                      <div className={style.formGroup}>
                        <label className={style.TasksVisibleTitle}>
                          Case Title
                        </label>
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

                      <div className={style.formGroup}>
                        <label className={style.AppointmentFormTitle}>
                          Case Type
                        </label>
                        <input
                          className={style.TasksVisibleInput}
                          type="text"
                          value={caseTypeMap[casetitle] || ""}
                          readOnly
                          placeholder="Case Type"
                        />
                      </div>
                    </div>

                    <div className={style.formRow}>
                      <div className={style.formGroup}>
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

                      <div className={style.formGroup}>
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
                    </div>

                    <div className={style.formRow}>
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

                      <div className={style.formGroup}>
                        <label className={style.AppointmentFormTitle}>
                          Start Time
                        </label>
                        <input
                          className={style.HearingVisibleFormTime}
                          type="time"
                          value={start || ""}
                          onChange={(e) => {
                            const newStartTime = e.target.value;
                            handleStartTime(newStartTime);
                          }}
                        />
                      </div>

                      <div className={style.formGroup}>
                        <label className={style.AppointmentFormTitle}>
                          End Time
                        </label>
                        <input
                          className={style.HearingVisibleFormTime}
                          type="time"
                          value={end || ""}
                          onChange={(e) => {
                            const newEndTime = e.target.value;
                            console.log(handleEndTime(newEndTime));
                          }}
                        />
                      </div>
                    </div>

                    <div className={style.BtnContainerUpdateAppointment}>
                      <button className={style.btn} onClick={handleClose}>
                        Cancel
                      </button>
                      <button
                        className={style.btn}
                        onClick={updateHearingEvent}
                      >
                        Update
                      </button>
                      <button
                        className={style.btn}
                        onClick={deleteHearingEvent}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Calendar;