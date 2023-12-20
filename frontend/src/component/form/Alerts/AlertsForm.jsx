import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import styles from './Alerts.module.css';
import { NavLink } from 'react-router-dom';
import axios from 'axios';
import DashboardNavbar from '../../utilities/DashboardNavbar/DashboardNavbar';

const AlertsForm = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [cases, setCases] = useState([]); // State to store cases

  useEffect(() => {
    // Fetch team member full names and populate the select options
    const fetchTeamMembers = async () => {
      try {
        const response = await axios.get('http://localhost:8052/dashboard/alert/teammembers', {
          headers: {
            'x-auth-token': localStorage.getItem('token'), // Get the token from localStorage or your authentication mechanism
          },
        });

        // Extract the full names from the response data
        const fullNamesArray = response.data.map((member) => member.fullName);
        setTeamMembers(fullNamesArray);
      } catch (error) {
        console.error(error);
      }
    };

    fetchTeamMembers(); // Call the fetchTeamMembers function when the component mounts

    // Fetch cases data
    const fetchCases = async () => {
      try {
        const response = await axios.get('http://localhost:8052/caseform', {
          headers: {
            'x-auth-token': localStorage.getItem('token'),
          },
        });

        // Extract the case titles from the response data
        const casesArray = response.data.map((caseItem) => caseItem.title);
        setCases(casesArray);
      } catch (error) {
        console.error(error);
      }
    };

    fetchCases(); // Call the fetchCases function when the component mounts
  }, []);


  const initialValues = {
    title: '',
    startDate: '',
    completionDate: '',
    assignTo: '',
    statusType: '', // Add Status Type field
    priority: '',   // Add Priority field
  };

  const validationSchema = Yup.object().shape({
    title: Yup.string().required('Title is required'),
    startDate: Yup.date(),
    completionDate: Yup.date(),
    assignTo: Yup.string(),
    statusType: Yup.string(),
    priority: Yup.string(),
  });

  const onSubmit = async (values, { resetForm }) => {
    try {
      // Make an HTTP POST request to the backend with the full server URL
      const response = await axios.post('http://localhost:8052/alerts', values, {
        headers: {
          'x-auth-token': localStorage.getItem('token'), // Get the token from localStorage or your authentication mechanism
        },
      });

      console.log(response.data); // Log the response from the backend
      alert('Alerts Form submitted successfully!');
      resetForm();
    } catch (error) {
      console.error(error);
    }
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit,
  });

  return (
    <>
      <DashboardNavbar />
      <div className={styles.formContainer}>
      <h2 style={{textAlign:'center'}}> Tasks</h2>
        <form onSubmit={formik.handleSubmit}>
          <div className={styles.formField}>
            <label className={styles.label} htmlFor="title">
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              className={styles.inputField}
              {...formik.getFieldProps('title')}
            />
            {formik.touched.title && formik.errors.title && (
              <div className={styles.error}>{formik.errors.title}</div>
            )}
          </div>
          <div className={styles.formField}>
              <label className={styles.label} htmlFor="case">
                Case
              </label>
              <select
                id="case"
                name="caseTitle"
                className={styles.selectField}
                {...formik.getFieldProps('caseTitle')}
              >
                <option value="">Select a case</option>
                {cases.map((caseTitle) => (
                  <option key={caseTitle} value={caseTitle}>
                    {caseTitle}
                  </option>
                ))}
              </select>
              {formik.touched.case && formik.errors.case && (
                <div className={styles.error}>{formik.errors.case}</div>
              )}
            </div>
          <div className={styles.horizontalFields}>
          <div className={styles.formField}>
            <label className={styles.label} htmlFor="startDate">
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              className={styles.date}
              {...formik.getFieldProps('startDate')}
            />
            {formik.touched.startDate && formik.errors.startDate && (
              <div className={styles.error}>{formik.errors.startDate}</div>
            )}
          </div>

          <div className={styles.formField}>
            <label className={styles.label} htmlFor="completionDate">
              Completion Date
            </label>
            <input
              type="date"
              id="completionDate"
              name="completionDate"
              className={styles.cdate}
              {...formik.getFieldProps('completionDate')}
            />
            {formik.touched.completionDate && formik.errors.completionDate && (
              <div className={styles.error}>{formik.errors.completionDate}</div>
            )}
          </div>
          </div>
          <div className={styles.horizontalFields}>
            <div className={styles.formField}>
              <label className={styles.label} htmlFor="assignTo">
                Assign To
              </label>
              <select
                id="assignTo"
                name="assignTo"
                className={styles.selectField}
                {...formik.getFieldProps('assignTo')}
              >
                <option value="">Select an option</option>
                {teamMembers.map((fullName) => (
                  <option key={fullName} value={fullName}>
                    {fullName}
                  </option>
                ))}
              </select>
              {formik.touched.assignTo && formik.errors.assignTo && (
                <div className={styles.error}>{formik.errors.assignTo}</div>
              )}
            </div>

            <div className={styles.formField}>
              <NavLink to="/dashboard/teammemberform" className={styles.link}>
                Add New Member
              </NavLink>
            </div>
          </div>

          <div className={styles.horizontalFields}>
  <div className={styles.statusPriorityFields}>
    <div className={styles.formField}>
      <label className={styles.label} htmlFor="statusType">
        Status Type
      </label>
      <select
        id="statusType"
        name="statusType"
        className={styles.selectField}
        {...formik.getFieldProps('statusType')}
      >
        <option value="">Select an option</option>
        <option value="completed">Completed</option>
        <option value="open">Open</option>
        <option value="inProgress">In Progress</option>
        <option value="timeRunning">Time Running</option>
      </select>
      {formik.touched.statusType && formik.errors.statusType && (
        <div className={styles.error}>{formik.errors.statusType}</div>
      )}
    </div>

    <div className={styles.formField}>
      <label className={styles.label} htmlFor="priority">
        Priority
      </label>
      <select
        id="priority"
        name="priority"
        className={styles.selectField}
        {...formik.getFieldProps('priority')}
      >
        <option value="">Select an option</option>
        <option value="critical">Critical</option>
        <option value="superCritical">Super Critical</option>
        <option value="importantRoutine">Important Routine</option>
        <option value="normal">Normal</option>
      </select>
      {formik.touched.priority && formik.errors.priority && (
        <div className={styles.error}>{formik.errors.priority}</div>
      )}
    </div>
  </div>
</div>

          <button type="submit" className={styles.submitButton}>
            Submit
          </button>
        </form>
      </div>
    </>
  );
};

export default AlertsForm;
