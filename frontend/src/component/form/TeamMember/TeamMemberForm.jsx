import React, { useEffect, useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import styles from './TeamMemberForm.module.css';
import { NavLink, useNavigate } from 'react-router-dom';
import DashboardNavbar from '../../utilities/DashboardNavbar/DashboardNavbar';
import Axios from 'axios';
import Companyform from '../Company/Companyform';
import Modal from '../Client/People/ModelPop/Modal';
import GroupForm from '../Group/GroupForm'

const initialValues = {
  image: '',
  fullName: '',
  email: '',
  designation: '',
  address: '',
  state: '',
  city: '',
  zipCode: '',
  selectedGroup: '',
  selectedCompany: '',
};

const validationSchema = Yup.object().shape({
  fullName: Yup.string().required('Full Name is required'),
  email: Yup.string().email('Invalid email format').required('Email is required'),
  designation: Yup.string(),
  address: Yup.string(),
  state: Yup.string(),
  city: Yup.string(),
  zipCode: Yup.string(),
  selectedGroup: Yup.string(),
  selectedCompany: Yup.string(),
  image: Yup.mixed(),
});




const TeamMembers = () => {
  const [groupNames, setGroupNames] = useState([]); // State to store group names
  const openModalOne = () => setIsModalOpenOne(true);
  const [isModalOpenOne, setIsModalOpenOne] = useState(false);
  const openModalTwo = () => setIsModalOpenTwo(true);
  const [isModalOpenTwo, setIsModalOpenTwo] = useState(false);
  const closeModalOne = () => setIsModalOpenOne(false);
  const closeModalTwo = () => setIsModalOpenTwo(false);
  const [companyNames, setCompanyNames] = useState([]); // State to store group names

  useEffect(() => {
    // Fetch group names and populate the select options
    const fetchGroupNames = async () => {
      try {
        const response = await Axios.get('http://localhost:8052/dashboard/groupform', {
          headers: {
            'x-auth-token': localStorage.getItem('token'), // Get the token from localStorage or your authentication mechanism
          },
        });
        
        // Extract the group names from the response data
        const groupNamesArray = response.data.map((group) => group.groupName);
        setGroupNames(groupNamesArray);
      } catch (error) {
        console.error(error);
      }
    };
    const fetchCompanyNames = async () => {
      try {
        const response = await Axios.get('http://localhost:8052/dashboard/company', {
          headers: {
            'x-auth-token': localStorage.getItem('token'), // Get the token from localStorage or your authentication mechanism
          },
        });
        
        // Extract the group names from the response data
        const companyNamesArray = response.data.map((company) => company.companyName);
        setCompanyNames(companyNamesArray);
      } catch (error) {
        console.error(error);
      }
    };
    
    fetchCompanyNames();
    
    fetchGroupNames(); // Call the fetchGroupNames function when the component mounts
  }, []);

  const navigate = useNavigate();
  const HandleCancel=()=>{
    navigate('/dashboard')
  }
  

  return (
    <div className={styles.MainContainer}>
    <DashboardNavbar />
    <div className={styles.formContainer}>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={async (values, { resetForm }) => {
          try {
            // Make an HTTP POST request to the backend with the full server URL
            const response = await Axios.post('http://localhost:8052/dashboard/teammemberform', values, {
              headers: {
                'x-auth-token': localStorage.getItem('token'), // Get the token from localStorage or your authentication mechanism
              },
            });
      
            console.log(response.data); // Log the response from the backend
            alert('Team Member Added successfully!');
            resetForm();
          } catch (error) {
            console.error(error);
          }
        }}
      >
        {({ values, setFieldValue }) => (
          <Form>
            <div className={styles.imageUpload}>
              <label className={styles.imageLabel} htmlFor="image">
                {values.image ? (
                  <img
                    src={URL.createObjectURL(values.image)}
                    alt="Uploaded"
                    className={styles.uploadedImage}
                  />
                ) : (
                  <div className={styles.emptyImage}>Click here to Upload</div>
                  
                )}
              </label>
              <input
                type="file"
                id="image"
                name="image"
                accept=".png, .jpg, .jpeg"
                onChange={(event) => {
                  setFieldValue('image', event.currentTarget.files[0]);
                }}
                className={styles.imageInput}
              />
              <ErrorMessage name="image" component="div" className={styles.error} />
            </div>

            <div className={styles.fieldGroup}>
              <Field
                type="text"
                name="fullName" 
                placeholder="Full Name *"
                className={styles.inputField}
              />
              <ErrorMessage name="fullName" component="div" className={styles.error} />
            </div>

            <div className={styles.fieldGroup}>
              <Field type="email" name="email" placeholder="Email" className={styles.inputField} />
              <ErrorMessage name="email" component="div" className={styles.error} />
            </div>

            <div className={styles.fieldGroup}>
              <Field
                type="text"
                name="designation"
                placeholder="Designation"
                className={styles.inputField}
              />
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
              <Field type="text" name="state" placeholder="State" className={styles.inputField} />
            </div>

            <div className={styles.fieldGroup}>
              <Field type="text" name="city" placeholder="City" className={styles.inputField} />
            </div>

            <div className={styles.fieldGroup}>
              <Field type="text" name="zipCode" placeholder="Zip Code" className={styles.inputField} />
            </div>

            <div className={styles.horizontalFields}>
                <div className={styles.fieldGroup}>
                  <Field as="select" name="selectedGroup" className={styles.selectField}>
                    <option value="">Select a Group</option>
                    {groupNames.map((groupName) => (
                      <option key={groupName} value={groupName}>
                        {groupName}
                      </option>
                    ))}
                  </Field>
                  <ErrorMessage name="selectedGroup" component="div" className={styles.error} />
                </div>

              <div className={styles.fieldGroup}>
                <NavLink to={"#"} className={styles.link} onClick={openModalOne}>
                  Add Group
                </NavLink>
              </div>

            </div>
            <div className={styles.horizontalFields}>
                <div className={styles.fieldGroup}>
                  <Field as="select" name="selectedCompany" className={styles.selectField}>
                    <option value="">Select a Company</option>
                    {companyNames.map((companyName) => (
                      <option key={companyName} value={companyName}>
                        {companyName}
                      </option>
                    ))}
                  </Field>
                  <ErrorMessage name="selectedGroup" component="div" className={styles.error} />
            </div>

              <div className={styles.fieldGroup}>
                <NavLink to={"#"} className={styles.link} onClick={openModalTwo}>
                  Add Company
                </NavLink>
              </div>

            </div>
            
            <div className={styles.BtnContainer}>
              <button type="submit" className={styles.submitButton}>Submit</button>
              <button type="submit" onClick={HandleCancel} className={`${styles.submitButton}, ${styles.buttonCancel}`}>Cancel</button>
            </div>
          </Form>
        )}
      </Formik>
    </div>

    <Modal isOpen={isModalOpenOne} onClose={() => setIsModalOpenOne(false)}>
    
      <GroupForm onClose={closeModalOne}/>

    </Modal>

    <Modal isOpen={isModalOpenTwo} onClose={() => setIsModalOpenTwo(false)}>
    <Companyform onClose={closeModalTwo}/>
    </Modal>
    </div>
  );
};

export default TeamMembers;