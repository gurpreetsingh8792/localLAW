import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import styles from './Task.module.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const TaskForm = ({onClose}) => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [cases, setCases] = useState([]);
  const [selectedCaseTitle, setSelectedCaseTitle] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const response = await axios.get('http://localhost:8052/dashboard/alert/teammembers', {
          headers: { 'x-auth-token': localStorage.getItem('token') },
        });
        setTeamMembers(response.data.map((member) => member.name));
      } catch (error) {
        console.error('Error fetching team members:', error);
      }
    };

    const fetchCases = async () => {
      try {
        const response = await axios.get('http://localhost:8052/caseform', {
          headers: { 'x-auth-token': localStorage.getItem('token') },
        });
        setCases(response.data);
        console.log("Cases:", response.data); // Logging loaded cases
      } catch (error) {
        console.error('Error fetching cases:', error);
      }
    };

    fetchTeamMembers();
    fetchCases();
  }, []);

  const initialValues = {
    title: '',
    caseTitle: '',
    caseType: '', // Remove the initial value here
    startDate: '',
    completionDate: '',
    assignFrom: '',
    assignTo: '',
  };

  const validationSchema = Yup.object().shape({
    title: Yup.string().required('Title is required'),
    caseTitle: Yup.string().required('Case Title is required'),
    caseType: Yup.string(),
    startDate: Yup.date(),
    completionDate: Yup.date(),
    assignFrom: Yup.string(),
    assignTo: Yup.string(),
  });

  const onSubmit = async (values, { resetForm }) => {
    try {
      const response = await axios.post('http://localhost:8052/alerts', values, {
        headers: { 'x-auth-token': localStorage.getItem('token') },
      });
      console.log('Form submission response:', response.data);
      alert('Alerts Form submitted successfully!');
      navigate(0);
      resetForm();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const formik = useFormik({ initialValues, validationSchema, onSubmit });

  // Modify the handleCaseTitleChange function
  const handleCaseTitleChange = (event) => {
    const selectedId = parseInt(event.target.value);
    const selectedCase = cases.find((caseItem) => caseItem.id === selectedId);
  
    if (selectedCase) {
      setSelectedCaseTitle(selectedCase.title); // Update selectedCaseTitle
      formik.setFieldValue('caseType', selectedCase.caseType);
    } else {
      setSelectedCaseTitle(''); // Clear the selectedCaseTitle if no case is selected
      formik.setFieldValue('caseType', ''); // Clear the field if no case is selected
    }
  
    // Update the formik field value for caseTitle
    formik.setFieldValue('caseTitle', event.target.value);
  };

 
  const HandleCancel = () => {
    onClose();
  };

  return (
    <>
    <div className={styles.formContainer}>
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
          <div className={styles.horizontalFields}>
            <div className={styles.statusPriorityFields}>
            <div className={styles.formField}>
  <label className={styles.label} htmlFor="caseTitle">Case Title</label>
  <select
    id="caseTitle"
    name="caseTitle"
    className={styles.selectField}
    onChange={handleCaseTitleChange}
    value={formik.values.caseTitle}
    onBlur={formik.handleBlur}
  >
    <option value="">Select a case Title</option>
    {cases.map((caseItem) => (
      <option key={caseItem.id} value={caseItem.id}>
        {caseItem.title}
      </option>
    ))}
  </select>
  {formik.touched.caseTitle && formik.errors.caseTitle && (
    <div className={styles.error}>{formik.errors.caseTitle}</div>
  )}
</div>
              <div className={styles.formField}>
                <label className={styles.label} htmlFor="caseType">Case Type</label>
                <input
                  id="caseType"
                  name="caseType"
                  className={styles.inputField}
                  value={formik.values.caseType} // Use formik's field value here
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.caseType && formik.errors.caseType && (
                  <div className={styles.error}>{formik.errors.caseType}</div>
                )}
                {/* Debugging Display */}
                {/* <div>Debug Case Type: {formik.values.caseType}</div> */}
              </div>
            </div>
          </div>
          <div className={styles.horizontalFields}>
            <div className={styles.statusPriorityFields}>
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
          </div>
          <div className={styles.horizontalFields}>
            <div className={styles.statusPriorityFields}>
              <div className={styles.formField}>
                <label className={styles.label} htmlFor="assignFrom">
                  Assign From
                </label>
                <select
                  id="assignFrom"
                  name="assignFrom"
                  className={styles.selectField}
                  {...formik.getFieldProps('assignFrom')}
                >
                  <option value="">Select an option</option>
                  {teamMembers.map((fullName) => (
                    <option key={fullName} value={fullName}>
                      {fullName}
                    </option>
                  ))}
                </select>
                {formik.touched.assignFrom && formik.errors.assignFrom && (
                  <div className={styles.error}>{formik.errors.assignFrom}</div>
                )}
              </div>
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
            </div>
          </div>
          <div className={styles.BtnContainer}>
          <button type="submit" className={styles.submitButton}>Submit</button>
          <button type="submit" onClick={HandleCancel} className={`${styles.submitButton}, ${styles.ButtonCancel}`}>cancel</button>
          </div>
        </form>
      </div>
    </>
  );
};

export default TaskForm ;
