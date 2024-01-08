import React, { useEffect, useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import styles from './Group.module.css';
import SideNav from '../../utilities/SideNavBar/SideNav';
import Axios from 'axios';

const initialValues = {
  groupName: '',
  company:'',
  priority: '',
};

const validationSchema = Yup.object().shape({
  groupName: Yup.string().required('Group Name is required'),
  company: Yup.string(),
  priority: Yup.string().required('Priority is required'),
});

const GroupForm = ({onClose, onGroupAdded }) => {
  const [companyNames, setCompanyNames] = useState([]); // State to store client names
  const priorityOptions = [
    { value: 'critical', label: 'Critical' },
    { value: 'important', label: 'Important' },
    { value: 'super critical', label: 'Super Critical' },
    { value: 'routine', label: 'Routine' },
    { value: 'normal', label: 'Normal' },
  ];

  const HandleCancel=()=>{
    onClose();
  }

  useEffect(() => {
    // Fetch client names and populate the select options
    const fetchCompanyNames = async () => {
      try {
        const clientResponse = await Axios.get('http://localhost:8052/companies', {
          headers: {
            'x-auth-token': localStorage.getItem('token'), // Get the token from localStorage or your authentication mechanism
          },
        });

        // Extract the client names from the response data
        const clientNameArray = clientResponse.data.map((company) => company.companyName);
        setCompanyNames(clientNameArray);
      } catch (error) {
        console.error(error);
      }
    };



    fetchCompanyNames(); 
   
  }, []);


  return (
    <>
    <div className={styles.formContainer}>
      
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={async (values, { resetForm }) => {
          try {
            // Make an HTTP POST request to the backend with the full server URL
            const response = await Axios.post('http://localhost:8052/dashboard/groupform', values, {
              headers: {
                'x-auth-token': localStorage.getItem('token'), // Get the token from localStorage or your authentication mechanism
              },
            });
      
            console.log(response.data); // Log the response from the backend
            alert('Group Added successfully!');
            resetForm();
          } catch (error) {
            console.error(error);
          }
        }}
      >
        <Form>
          <div className={styles.fieldGroup}>
            <label htmlFor="groupName" className={styles.label}>
              Group Name
            </label>
            <Field
              type="text"
              name="groupName"
              placeholder="Enter Group Name"
              className={styles.inputField}
            />
            <ErrorMessage name="groupName" component="div" className={styles.error} />
          </div>
          <div className={styles.fieldGroup}>
            <label htmlFor="company" className={styles.label}>
               Company
            </label>
            
            <Field as="select" name="company" className={styles.inputField}>
                  <option value="">Select companies</option>
                  {companyNames.map((companyName) => (
                    <option key={companyName} value={companyName}>
                      {companyName}
                    </option>
                  ))}
                </Field>
            <ErrorMessage name="company" component="div" className={styles.error} />
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="priority" className={styles.label}>
              Priority
            </label>
            <Field
              as="select"
              name="priority"
              className={styles.selectField}
            >
              <option value="" disabled>Select Priority</option>
              {priorityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Field>
            <ErrorMessage name="priority" component="div" className={styles.error} />
          </div>

          <button type="submit" className={styles.submitButton}>Submit</button>
          <button type="submit" onClick={HandleCancel} className={styles.submitButton}>Cancel</button>
        </Form>
      </Formik>
    </div>
    </>
  );
};

export default GroupForm;
