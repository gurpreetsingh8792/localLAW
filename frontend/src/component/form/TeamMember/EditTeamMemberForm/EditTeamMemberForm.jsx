import React, { useEffect, useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import styles from './EditTeamMemberForm.module.css';
import { NavLink , useNavigate} from 'react-router-dom';
import Axios from 'axios';
import Modal from '../../Client/People/ModelPop/Modal';
import GroupForm from '../../Group/GroupForm';
import Companyform from '../../Company/Companyform';

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
  mobileno: '',
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
  mobileno : Yup.string()
  .matches(/^[0-9]{10}$/, 'Mobile number must be exactly 10 digits'),
});






const EditTeamMembersForm = ({teamData, onClose}) => {
  const [groupNames, setGroupNames] = useState([]); // State to store group names
  const [formData, setFormData] = useState({});
  const openModalTwo = () => setIsModalOpenTwo(true);
  const [isModalOpenTwo, setIsModalOpenTwo] = useState(false);
  const openModalOne = () => setIsModalOpenOne(true);
  const [isModalOpenOne, setIsModalOpenOne] = useState(false);
  const closeModalTwo = () => setIsModalOpenTwo(false);
  const [companyNames, setCompanyNames] = useState([]);
  const navigate = useNavigate();

  const initialValues = {
    // image: '',
    fullName: teamData.fullName || '',
    email: teamData.email || '',
    designation: teamData.designation || '',
    address: teamData.address || '',
    state: teamData.state || '',
    city: teamData.city || '',
    zipCode: teamData.zipCode || '',
    selectedGroup: teamData.selectedGroup || '',
    selectedCompany: teamData.selectedCompany || '',
    mobileno: teamData.mobileno || '',
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
    mobileno : Yup.string()
  .matches(/^[0-9]{10}$/, 'Mobile number must be exactly 10 digits'),
  });

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
    
    


    Axios.get('http://localhost:8052/dashboard/teammemberform/edit', {
        headers: {
          'x-auth-token': localStorage.getItem('token'),
        },
      })
      .then((response) => {
        const responseData = response.data[0];
        setFormData(responseData);
      })
      .catch((error) => {
        console.error(error);
      });

    fetchGroupNames(); // Call the fetchGroupNames function when the component mounts
    fetchCompanyNames();
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
            const response = await Axios.put(
              `http://localhost:8052/dashboard/teammemberform/edit/update/${teamData.id}`,
              values,
              {
                headers: {
                  'x-auth-token': localStorage.getItem('token'),
                },
              }
            );
          
            console.log(response.data);
            alert('Team Updated successfully!');
            navigate(0);
            resetForm();
          } catch (error) {
            if (error.response && error.response.status === 400) {
              // Display error message from server
              alert(error.response.data.error);
            } else {
              console.error(error);
            }
          }
          
        }}
      >
        {({ values, setFieldValue }) => (
          <Form>
            {/* <div className={styles.imageUpload}>
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
            </div> */}

            <div className={styles.fieldGroup}>
              <Field
                type="text"
                name="fullName"
                placeholder="Full Name"
                className={styles.inputField}
              />
              <ErrorMessage name="fullName" component="div" className={styles.error} />
            </div>

            <div className={styles.fieldGroup}>
              <Field type="email" name="email" placeholder="Email" className={styles.inputField} />
              <ErrorMessage name="email" component="div" className={styles.error} />
            </div>
            <div className={styles.fieldGroup}>
              <Field type="text" name="mobileno" placeholder="Mobile Number" className={styles.inputField} />
              <ErrorMessage name="mobileno" component="div" className={styles.error} />
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
            <button type="submit" onClick={HandleCancel} className={`${styles.submitButton}, ${styles.CancelButton}`}>Cancel</button>

                      </div>
          </Form>
        )}
      </Formik>

      
    </div>
    <Modal isOpen={isModalOpenOne} onClose={() => setIsModalOpenOne(false)}>
    <GroupForm />
    </Modal>
    
    <Modal isOpen={isModalOpenTwo} onClose={() => setIsModalOpenTwo(false)}>
    <Companyform />
    </Modal>
    </div>
  );
};

export default EditTeamMembersForm;