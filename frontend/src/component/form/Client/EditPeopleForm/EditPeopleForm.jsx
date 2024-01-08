import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import styles from './EditPeopleForm.module.css';
import { NavLink , useNavigate} from 'react-router-dom';
import axios from 'axios';
import Modal from '../../Client/People/ModelPop/Modal'
// import TaskForm;



const EditPeopleForm = ({ clientData }) => {
  const [alertTitles, setAlertTitles] = useState([]); // State to store alert titles
  const [formData, setFormData] = useState({});
  const [caseTitles, setCaseTitles] = useState([]);
  const [appointmentTitles, setAppointmentTitles] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch alert titles and populate the select options
    const fetchAlertTitles = async () => {
      try {
        const response = await axios.get('http://localhost:8052/dashboard/alertsform', {
          headers: {
            'x-auth-token': localStorage.getItem('token'), // Get the token from localStorage or your authentication mechanism
          },
        });

        // Extract the alert titles from the response data
        const alertTitlesArray = response.data.map((alert) => alert.title);
        setAlertTitles(alertTitlesArray);
      } catch (error) {
        console.error(error);
      }
    };
    axios
      .get('http://localhost:8052/dashboard/clientform/edit', {
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

      const fetchCaseTitles = async () => {
        try {
          const response = await axios.get("http://localhost:8052/caseform", {
            headers: {
              "x-auth-token": localStorage.getItem("token"),
            },
          });
    
          // Extract the case titles from the response data
          const caseTitlesArray = response.data.map((caseItem) => caseItem.title);
          setCaseTitles(caseTitlesArray);
        } catch (error) {
          console.error(error);
        }
      };
      const fetchAppointmentTitles = async () => {
        try {
          const response = await axios.get(
            "http://localhost:8052/dashboard/people/appointmentsdates",
            {
              headers: {
                "x-auth-token": localStorage.getItem("token"), // Get the token from localStorage or your authentication mechanism
              },
            }
          );
  
          // Extract the appointment titles from the response data
          const appointmentTitlesArray = response.data.map((appointment) => appointment.title);
          setAppointmentTitles(appointmentTitlesArray);
        } catch (error) {
          console.error(error);
        }
      };
  
      fetchAppointmentTitles();
      fetchAlertTitles();
      fetchCaseTitles();
  }, []);
  const initialValues = {
    firstName: clientData.firstName || '',
    lastName: clientData.lastName || '',
    email: clientData.email || '',
    mobileNo: clientData.mobileNo || '',
    alternateMobileNo: clientData.alternateMobileNo || '',
    organizationName: clientData.organizationName || '',
    organizationType: clientData.organizationType || '',
    organizationWebsite: clientData.organizationWebsite || '',
    caseTitle: clientData.caseTitle || '',
    type: clientData.type || '',
    homeAddress: clientData.homeAddress || '',
    officeAddress: clientData.officeAddress || '',
    assignAlerts: clientData.assignAlerts || '',
    addNewAlert: '',
    assignAppointments: clientData.assignAppointments || '',
  };

  const validationSchema = Yup.object().shape({
    firstName: Yup.string().required('Full Name is required'),
    lastName: Yup.string(),
    email: Yup.string().email('Invalid email format').required('Email is required'),
    mobileNo: Yup.string(),
    alternateMobileNo: Yup.string(),
    organizationName: Yup.string(),
    organizationType: Yup.string(),
    organizationWebsite: Yup.string().url('Invalid URL format'),
    gstNo: Yup.string(),
    panNo: Yup.string(),
    homeAddress: Yup.string(),
    officeAddress: Yup.string(),
    assignAlerts: Yup.string(),
    addNewAlert: Yup.string(),
    assignAppointments: Yup.string(),
    
  });

  const onSubmit = async (values, { resetForm }) => {
    try {
      // Make an HTTP POST request to update the case
      const response = await axios.put(
        `http://localhost:8052/clients/forms/${clientData.id}`,
        values,
        {
          headers: {
            'x-auth-token': localStorage.getItem('token'),
          },
        }
      );
  
      console.log(response.data);
      alert('Case Updated successfully!');
      navigate(0);
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
    <div className={styles.clientForm}>
      

      <form onSubmit={formik.handleSubmit}>
      
        <div className={styles.formSection}>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="firstName">Full Name</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              className={styles.inputField}
              {...formik.getFieldProps('firstName')}
            />
            {formik.touched.firstName && formik.errors.firstName && (
              <div className={styles.error}>{formik.errors.firstName}</div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="lastName">Last Name</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              className={styles.inputField}
              {...formik.getFieldProps('lastName')}
            />
            {formik.touched.lastName && formik.errors.lastName && (
              <div className={styles.error}>{formik.errors.lastName}</div>
            )}
          </div>
        </div>
        <div className={styles.formSection}>
          <div className={styles.formGroup}>
  <label className={styles.label} htmlFor="caseTitle">
    Case
  </label>
  <select
    id="caseTitle"
    name="caseTitle"
    className={styles.inputField}
    {...formik.getFieldProps("caseTitle")}
  >
    <option value="">Select a case Title</option>
    {caseTitles.map((title) => (
      <option key={title} value={title}>
        {title}
      </option>
    ))}
  </select>

  {formik.touched.case && formik.errors.case && (
    <div className={styles.error}>{formik.errors.case}</div>
  )}
</div>

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="type">
                Type
              </label>
              <select
                id="type"
                name="type"
                className={styles.inputField}
                {...formik.getFieldProps("type")}
              >
                <option value="">Select Type</option>
                <option value="Client">Client</option>
                <option value="Lawyers">Lawyers</option>
                <option value="OpposingClient">Opposing Client</option>
                <option value="Witness">Witness</option>
              </select>

              {formik.touched.type && formik.errors.type && (
                <div className={styles.error}>{formik.errors.type}</div>
              )}
            </div>
          </div>

        <div className={styles.formSection}>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              className={styles.inputFieldEmail}
              {...formik.getFieldProps('email')}
            />
            {formik.touched.email && formik.errors.email && (
              <div className={styles.error}>{formik.errors.email}</div>
            )}
          </div>
        </div>

        <div className={styles.formSection}>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="mobileNo">Mobile No.</label>
            <input
              type="text"
              id="mobileNo"
              name="mobileNo"
              className={styles.inputField}
              {...formik.getFieldProps('mobileNo')}
              pattern="[0-9]{10}"
        title="Please enter a 10-digit mobile number"
            />
            {formik.touched.mobileNo && formik.errors.mobileNo && (
              <div className={styles.error}>{formik.errors.mobileNo}</div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="alternateMobileNo">Alternate Mobile No.</label>
            <input
              type="text"
              id="alternateMobileNo"
              name="alternateMobileNo"
              className={styles.inputField}
              {...formik.getFieldProps('alternateMobileNo')}
            />
            {formik.touched.alternateMobileNo && formik.errors.alternateMobileNo && (
              <div className={styles.error}>{formik.errors.alternateMobileNo}</div>
            )}
          </div>
        </div>
        
        <div className={styles.formSection}>
          <div className={styles.formGroup3}>
            <label className={styles.label} htmlFor="organizationName">Organization Name</label>
            <input
              type="text"
              id="organizationName"
              name="organizationName"
              className={styles.input3}
              {...formik.getFieldProps('organizationName')}
            />
            {formik.touched.organizationName && formik.errors.organizationName && (
              <div className={styles.error}>{formik.errors.organizationName}</div>
            )}
          </div>

          <div className={styles.formGroup3}>
            <label className={styles.label} htmlFor="organizationType">Organization Type</label>
            <input
              type="text"
              id="organizationType"
              name="organizationType"
              className={styles.input3}
              {...formik.getFieldProps('organizationType')}
            />
            {formik.touched.organizationType && formik.errors.organizationType && (
              <div className={styles.error}>{formik.errors.organizationType}</div>
            )}
          </div>

          <div className={styles.formGroup3}>
            <label className={styles.label} htmlFor="organizationWebsite">Organization Website</label>
            <input
              type="url"
              id="organizationWebsite"
              name="organizationWebsite"
              className={styles.input3}
              {...formik.getFieldProps('organizationWebsite')}
            />
            {formik.touched.organizationWebsite && formik.errors.organizationWebsite && (
              <div className={styles.error}>{formik.errors.organizationWebsite}</div>
            )}
          </div>
        </div>
        
        

        <div className={styles.formSection}>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="homeAddress">Home Address</label>
            <textarea
              id="homeAddress"
              name="homeAddress"
              className={styles.inputFieldTextarea}
              {...formik.getFieldProps('homeAddress')}
            />
            {formik.touched.homeAddress && formik.errors.homeAddress && (
              <div className={styles.error}>{formik.errors.homeAddress}</div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="officeAddress">Office Address</label>
            
            <textarea 
            
              id="officeAddress"
              name="officeAddress"
              className={styles.inputFieldTextarea}
              {...formik.getFieldProps('officeAddress')}
              
            />
            
            {formik.touched.officeAddress && formik.errors.officeAddress && (
              <div className={styles.error}>{formik.errors.officeAddress}</div>
            )}
          </div>
        </div>

        <div className={styles.formSection}>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="assignAlerts">Assign Tasks</label>
            <select
                id="assignAlerts"
                name="assignAlerts"
                className={styles.inputField}
                {...formik.getFieldProps('assignAlerts')}
              >
                <option value="">Select an option</option>
                {alertTitles.map((title) => (
                  <option key={title} value={title}>
                    {title}
                  </option>
                ))}
              </select>
          </div>

          <div className={styles.formGroup}>
          
          <NavLink
            to={"/dashboard/alertsform"}
            id="addNewAlert"
            name="addNewAlert"
            className={styles.link}
            // onClick={handleAddNewAlertClick}
          >
            Add New Tasks
          </NavLink>
        </div>
        </div>

                  
        <div className={styles.formSection}>

<div className={styles.formGroup}>
    <label className={styles.label} htmlFor="assignAppointments">
      Assign Appointment
    </label>
    <select
      id="assignAppointments"
      name="assignAppointments"
      className={styles.inputField}
      {...formik.getFieldProps("assignAppointments")}
    >
      <option value="">Select an option</option>
      {appointmentTitles.map((title) => (
        <option key={title} value={title}>
          {title}
        </option>
      ))}
    </select>

  </div>

  {/* <NavLink to="#" onClick={openModal}>Book an Appointment</NavLink>
          <Modal isOpen={isModalOpen} onClose={closeModal}>
          </Modal> */}
          

</div>

       

        <div className={styles.formSection}>
          <button type="submit" className={styles.submitButton}>
            UPDATE
          </button>
        </div>
      </form>
    </div>
</>
  );
};
export default EditPeopleForm;
