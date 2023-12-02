import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import styles from './Group.module.css';
import SideNav from '../../utilities/SideNavBar/SideNav';
import Axios from 'axios';

const initialValues = {
  groupName: '',
  priority: '',
};

const validationSchema = Yup.object().shape({
  groupName: Yup.string().required('Group Name is required'),
  priority: Yup.string().required('Priority is required'),
});

const GroupForm = () => {
  const priorityOptions = [
    { value: 'critical', label: 'Critical' },
    { value: 'important', label: 'Important' },
  ];

  return (
    <>
    <SideNav />
    <div className={styles.formContainer}>
      
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={async (values, { resetForm }) => {
          try {
            // Make an HTTP POST request to the backend with the full server URL
            const response = await Axios.post('http://34.105.95.235:8052/dashboard/groupform', values, {
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

          <button type="submit" className={styles.submitButton}>
            Submit
          </button>
        </Form>
      </Formik>
    </div>
    </>
  );
};

export default GroupForm;
