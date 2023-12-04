
import React, { useEffect, useState } from 'react';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { NavLink } from 'react-router-dom';
import styles from './Appointment.module.css';
import SideNav from '../../utilities/SideNavBar/SideNav';
import axios from 'axios';

const validationSchema = Yup.object().shape({
  title: Yup.string().required('Title is required'),
  client: Yup.string(),
  email: Yup.string().email('Invalid email').required('Email is required'),
  mobile: Yup.string()
    .matches(/^\d{10}$/, 'Invalid mobile number')
    .required('Mobile No is required'),
  date: Yup.date().required('Date is required'),
  time: Yup.string().required('Time is required'),
  roomNo: Yup.string().required('Room No is required'),
  assignedBy: Yup.string().required('Assigned By is required'),
  assignedTo: Yup.string().required('Assigned To is required'),
  followUpDate: Yup.date().required('Follow-up Date is required'),
  followUpTime: Yup.string().required('Follow-up Time is required'),
  description: Yup.string().required('Description is required'),
});

const initialValues = {
  title: '',
  client: '',
  email: '',
  mobile: '',
  date: '',
  time: '',
  roomNo: '',
  assignedBy: '',
  assignedTo: '',
  followUpDate: '',
  followUpTime: '',
  description: '',
};

const AppointmentForm = () => {
  const [clientNames, setClientNames] = useState([]); // State to store client first names

  useEffect(() => {
    // Fetch client first names and populate the select options
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

    fetchClientNames(); // Call the fetchClientNames function when the component mounts
  }, []);


  const handleSubmit = async (values, { resetForm }) => {
    try {
      // Make an HTTP POST request to the backend with the full server URL
      const response = await axios.post('http://localhost:8052/appointment', values, {
        headers: {
          'x-auth-token': localStorage.getItem('token'), // Get the token from localStorage or your authentication mechanism
        },
      });

      console.log(response.data); // Log the response from the backend
      alert('Appointment Added successfully!');
      resetForm();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
    <SideNav />
    <div className={styles.appointmentForm}>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        <Form>
          <div className={styles.formSection}>
            <div className={styles.label}>Title</div>
            <Field className={styles.style} type="text" name="title" />
            <ErrorMessage name="title" component="div" className={styles.error} />
          </div>

          <div className={styles.formSection}>
            <div className={styles.label}>Client</div>
            <Field className={styles.style1} as="select" name="client">
                <option value="">Select Client</option>
                {clientNames.map((firstName) => (
                  <option key={firstName} value={firstName}>
                    {firstName}
                  </option>
                ))}
              </Field>
            <NavLink to="/clientform" className={styles.link}>
              Add New Client
            </NavLink>
          </div>

          <div className={styles.horizontalFields}>
            <div className={styles.field}>
              <div className={styles.label}>Email</div>
              <Field className={styles.style2} type="text" name="email" />
              <ErrorMessage name="email" component="div" className={styles.error} />
            </div>

            <div className={styles.field}>
              <div className={styles.label}>Mobile No</div>
              <Field className={styles.style2} type="text" name="mobile" />
              <ErrorMessage name="mobile" component="div" className={styles.error} />
            </div>

            <div className={styles.field}>
              <div className={styles.label}>Date</div>
              <Field className={styles.style2} type="date" name="date" />
              <ErrorMessage name="date" component="div" className={styles.error} />
            </div>
          </div>

          <div className={styles.horizontalFields}>
            <div className={styles.field}>
              <div className={styles.label}>Time</div>
              <Field className={styles.style2} type="text" name="time" />
              <ErrorMessage name="time" component="div" className={styles.error} />
            </div>

            <div className={styles.field}>
              <div className={styles.label}>Room No</div>
              <Field className={styles.style2} type="text" name="roomNo" />
              <ErrorMessage name="roomNo" component="div" className={styles.error} />
            </div>

            <div className={styles.field}>
              <div className={styles.label}>Assigned By</div>
              <Field className={styles.style2} type="text" name="assignedBy" />
              <ErrorMessage name="assignedBy" component="div" className={styles.error} />
            </div>
          </div>

          <div className={styles.horizontalFields}>
            <div className={styles.field}>
              <div className={styles.label}>Assigned To</div>
              <Field className={styles.style2} type="text" name="assignedTo" />
              <ErrorMessage name="assignedTo" component="div" className={styles.error} />
            </div>

            <div className={styles.field}>
              <div className={styles.label}>Follow-up Date</div>
              <Field className={styles.style2} type="date" name="followUpDate" />
              <ErrorMessage name="followUpDate" component="div" className={styles.error} />
            </div>

            <div className={styles.field}>
              <div className={styles.label}>Follow-up Time</div>
              <Field className={styles.style2} type="text" name="followUpTime" />
              <ErrorMessage name="followUpTime" component="div" className={styles.error} />
            </div>
          </div>

          <div className={styles.formSection}>
            <div className={styles.label}>Description</div>
            <Field className={styles.textarea} as="textarea" name="description" />
            <ErrorMessage
              name="description"
              component="div"
              className={styles.error}
            />
          </div>

          <div >
            <button className={styles.submitButton} type="submit">Submit</button>
          </div>
        </Form>
      </Formik>
    </div>
    </>
  );
};

export default AppointmentForm;
