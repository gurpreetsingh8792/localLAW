import React, { useEffect, useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import styles from './Companyform.module.css';
import { NavLink } from 'react-router-dom';
import DashboardNavbar from '../../utilities/DashboardNavbar/DashboardNavbar';
import Axios from 'axios';

const initialValues = {
  companyName: '',
  person: '',
  email: '',
  contactNumber: '',
  websiteLink: '',
  address: '',
  };

const validationSchema = Yup.object().shape({
  companyName: Yup.string().required('Company Name is required'),
  email: Yup.string().email('Invalid email format').required('Email is required'),
  person: Yup.string(),
  address: Yup.string(),
  contactNumber: Yup.string(),
  websiteLink: Yup.string(),
  selectedGroup: Yup.string(),
});




const Companyform = ({onClose}) => {

  const [companyNames, setCompanyNames] = useState([]); // State to store group names
  const [clientNames, setClientNames] = useState([]);

  useEffect(() => {
    // Fetch group names and populate the select options
    const fetchClientNames = async () => {
      try {
        const response = await Axios.get('http://localhost:8052/clientform', {
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
    // Call the fetchTeamMembers function when the component mounts
  }, []);

  const HandleCancel=()=>{
    onClose();
  }

  return (
      <div className={styles.MainContainer}>
    <div className={styles.formContainer}>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={async (values, { resetForm }) => {
          try {
            // Make an HTTP POST request to the backend with the full server URL
            const response = await Axios.post('http://localhost:8052/dashboard/teammemberform/companyform', values, {
              headers: {
                'x-auth-token': localStorage.getItem('token'), // Get the token from localStorage or your authentication mechanism
              },
            });
      
            console.log(response.data); // Log the response from the backend
            alert('Company Added successfully!');
            resetForm();
          } catch (error) {
            console.error(error);
          }
        }}
      >
        {({ values, setFieldValue }) => (
          <Form>
            
    <h2>Company Name</h2>

            <div className={styles.fieldGroup}>
              <Field
                type="text"
                name="companyName"
                placeholder="Company Name"
                className={styles.inputField}
              />

              <ErrorMessage name="CompanyName" component="div" className={styles.error} />
            </div>

            <div className={styles.fieldGroup}>
              <Field type="email" name="email" placeholder="Email" className={styles.inputField} />
              <ErrorMessage name="email" component="div" className={styles.error} />
            </div>

            <div className={styles.fieldGroup}>
              {/* <Field
                type="text"
                name="person"
                placeholder="person"
                className={styles.inputField}
              /> */}
              <Field as="select" name="person" className={styles.selectField}>
                    <option value="">Select Person</option>
                    {clientNames.map((firstName) => (
                      <option key={firstName} value={firstName}>
                        {firstName}
                      </option>
                    ))}
                  </Field>
            </div>

            <div className={styles.fieldGroup}>
              <Field
                type="text"
                name="address"
                placeholder="Address"
                className={styles.inputField}
              />
            </div>

            <div className={styles.fieldGroup}>
              <Field type="text" name="contactNumber" placeholder="Contact Number" className={styles.inputField} />
            </div>

            <div className={styles.fieldGroup}>
              <Field type="text" name="websiteLink" placeholder="URL Link" className={styles.inputField} />
            </div>
              
                      <div className={styles.BtnContainer}>
            <button type="submit" className={styles.submitButton}>Submit</button>
            <button type="submit" onClick={HandleCancel} className={`${styles.submitButton}, ${styles.CancelButton}`}>Cancel</button>

                      </div>
          </Form>
        )}
      </Formik>
    </div>
    </div>
  );
};

export default Companyform;
