import React, { useEffect, useState } from "react";
import styles from "./People.module.css";
import { NavLink,useNavigate } from "react-router-dom";
import axios from "axios";
import * as Yup from "yup";
import { useFormik } from "formik";
import DashboardNavbar from "../../../utilities/DashboardNavbar/DashboardNavbar";
import AlertsForm from "../../Alerts/AlertsForm";
import Modal from './ModelPop/Modal'
import TaskForm from "./ModelPop/AppointmentForm";
import AppointmentForm from "./ModelPop/AppointmentForm";

const PeopleForm = () => {
  const [caseTitles, setCaseTitles] = useState([]);
  const [alertTitles, setAlertTitles] = useState([]); 
  const [appointmentTitles, setAppointmentTitles] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  useEffect(() => {
    // Fetch alert titles and populate the select options
    const fetchAlertTitles = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8052/dashboard/alertsform",
          {
            headers: {
              "x-auth-token": localStorage.getItem("token"), // Get the token from localStorage or your authentication mechanism
            },
          }
        );

        // Extract the alert titles from the response data
        const alertTitlesArray = response.data.map((alert) => alert.title);
        setAlertTitles(alertTitlesArray);
      } catch (error) {
        console.error(error);
      }
    };

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

    // Call the fetchAlertTitles function when the component mounts
  }, []);
  const initialValues = {
    firstName: "",
    lastName: "",
    caseTitle: "",
    type: "",
    email: "",
    mobileNo: "",
    alternateMobileNo: "",
    organizationName: "",
    organizationType: "",
    organizationWebsite: "",
    gstNo: "",
    panNo: "",
    homeAddress: "",
    officeAddress: "",
    assignAlerts: "",
    addNewAlert: "",
    scheduleAppointment: "",
    assignAppointments:""
  };

  const validationSchema = Yup.object().shape({
    firstName: Yup.string().required("First Name is required"),
    lastName: Yup.string().required("Last Name is required"),
    caseTitle: Yup.string().required("Case is required"),
    type: Yup.string(),
    email: Yup.string()
      .email("Invalid email format")
      .required("Email is required"),
    mobileNo: Yup.string(),
    alternateMobileNo: Yup.string(),
    organizationName: Yup.string(),
    organizationType: Yup.string(),
    organizationWebsite: Yup.string().url("Invalid URL format"),
    gstNo: Yup.string(),
    panNo: Yup.string(),
    homeAddress: Yup.string(),
    officeAddress: Yup.string(),
    assignAlerts: Yup.string(),
    addNewAlert: Yup.string(),
    scheduleAppointment: Yup.date().nullable(),
    assignAppointments: Yup.string(),
  });

  const onSubmit = async (values, { resetForm }) => {
    try {
      // Make an HTTP POST request to the backend with the full server URL
      const response = await axios.post(
        "http://localhost:8052/dashboard/clientform",
        values,
        {
          headers: {
            "x-auth-token": localStorage.getItem("token"), // Get the token from localStorage or your authentication mechanism
          },
        }
      );

      console.log(response.data); // Log the response from the backend
      alert("People Added successfully!");
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

  const navigate = useNavigate();
  const HandleCancel=()=>{
    navigate('/dashboard')
  }

  return (
    <>
      <DashboardNavbar />
      <div className={styles.clientForm}>
        <h2 style={{ textAlign: "center" }}> Add People</h2>

        <form onSubmit={formik.handleSubmit}>
          <div className={styles.formSection}>
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="firstName">
                first Name
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                className={styles.inputField}
                {...formik.getFieldProps("firstName")}
              />
              {formik.touched.firstName && formik.errors.firstName && (
                <div className={styles.error}>{formik.errors.firstName}</div>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="lastName">
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                className={styles.inputField}
                {...formik.getFieldProps("lastName")}
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
    {/* Conditional rendering for 'Lawyer Types' dropdown */}

    {formik.values.type === "Lawyers" && (
      <div className={styles.formSection}>
        <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="lawyerType">
                Lawyer
            </label>
            <select
                id="lawyerType"
                name="lawyerType"
                className={styles.inputField}
                {...formik.getFieldProps("lawyerType")}
            >
                <option value="">Select Lawyer Type</option>
                <option value="CorporateLawyer">Corporate Lawyer</option>
                <option value="CriminalDefenseLawyer">Criminal Defense Lawyer</option>
                <option value="FamilyLawyer">Family Lawyer</option>
                <option value="TaxLawyer">Tax Lawyer</option>
                <option value="IntellectualPropertyLawyer">Intellectual Property Lawyer</option>
                <option value="EmploymentLawyer">Employment Lawyer</option>
                <option value="EnvironmentalLawyer">Environmental Lawyer</option>
                <option value="EstatePlanningLawyer">Estate Planning Lawyer</option>
                <option value="PersonalInjuryLawyer">Personal Injury Lawyer</option>
                <option value="ImmigrationLawyer">Immigration Lawyer</option>
                <option value="BankruptcyLawyer">Bankruptcy Lawyer</option>
                <option value="CivilLitigation Lawyer">Civil Litigation Lawyer</option>
                <option value="RealEstateLawyer">Real Estate Lawyer</option>
                <option value="ConstitutionalLawyer">Constitutional Lawyer</option>
                <option value="EntertainmentLawyer">Entertainment Lawyer</option>
                {/* Add more lawyer types as needed */}
            </select>

            {formik.touched.lawyerType && formik.errors.lawyerType && (
                <div className={styles.error}>{formik.errors.lawyerType}</div>
            )}
        </div>
</div>
    )}



          <div className={styles.formSection}>
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="email">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className={styles.inputFieldEmail}
                {...formik.getFieldProps("email")}
              />
              {formik.touched.email && formik.errors.email && (
                <div className={styles.error}>{formik.errors.email}</div>
              )}
            </div>
          </div>

          <div className={styles.formSection}>
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="mobileNo">
                Mobile No.
              </label>
              <input
                type="text"
                id="mobileNo"
                name="mobileNo"
                className={styles.inputField}
                {...formik.getFieldProps("mobileNo")}
                pattern="[0-9]{10}"
                title="Please enter a 10-digit mobile number"
              />
              {formik.touched.mobileNo && formik.errors.mobileNo && (
                <div className={styles.error}>{formik.errors.mobileNo}</div>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="alternateMobileNo">
                Alternate Mobile No.
              </label>
              <input
                type="text"
                id="alternateMobileNo"
                name="alternateMobileNo"
                className={styles.inputField}
                {...formik.getFieldProps("alternateMobileNo")}
              />
              {formik.touched.alternateMobileNo &&
                formik.errors.alternateMobileNo && (
                  <div className={styles.error}>
                    {formik.errors.alternateMobileNo}
                  </div>
                )}
            </div>
          </div>

          <div className={styles.formSection}>
            <div className={styles.formGroup3}>
              <label className={styles.label} htmlFor="organizationName">
                Organization Name
              </label>
              <input
                type="text"
                id="organizationName"
                name="organizationName"
                className={styles.input3}
                {...formik.getFieldProps("organizationName")}
              />
              {formik.touched.organizationName &&
                formik.errors.organizationName && (
                  <div className={styles.error}>
                    {formik.errors.organizationName}
                  </div>
                )}
            </div>

            <div className={styles.formGroup3}>
              <label className={styles.label} htmlFor="organizationType">
                Organization Type
              </label>
              <input
                type="text"
                id="organizationType"
                name="organizationType"
                className={styles.input3}
                {...formik.getFieldProps("organizationType")}
              />
              {formik.touched.organizationType &&
                formik.errors.organizationType && (
                  <div className={styles.error}>
                    {formik.errors.organizationType}
                  </div>
                )}
            </div>

            <div className={styles.formGroup3}>
              <label className={styles.label} htmlFor="organizationWebsite">
                Organization Website
              </label>
              <input
                type="url"
                id="organizationWebsite"
                name="organizationWebsite"
                className={styles.input3}
                {...formik.getFieldProps("organizationWebsite")}
              />
              {formik.touched.organizationWebsite &&
                formik.errors.organizationWebsite && (
                  <div className={styles.error}>
                    {formik.errors.organizationWebsite}
                  </div>
                )}
            </div>
          </div>

          <div className={styles.formSection}>
            {/* <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="gstNo">GST No.</label>
            <input
              type="text"
              id="gstNo"
              name="gstNo"
              className={styles.inputField}
              {...formik.getFieldProps('gstNo')}
            />
          </div> */}

            {/* <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="panNo">PAN No.</label>
            <input
              type="text"
              id="panNo"
              name="panNo"
              className={styles.inputField}
              {...formik.getFieldProps('panNo')}
            />
          </div> */}
          </div>

          <div className={styles.formSection}>
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="homeAddress">
                Home Address
              </label>
              <textarea
                id="homeAddress"
                name="homeAddress"
                className={styles.inputFieldTextarea}
                {...formik.getFieldProps("homeAddress")}
              />
              {formik.touched.homeAddress && formik.errors.homeAddress && (
                <div className={styles.error}>{formik.errors.homeAddress}</div>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="officeAddress">
                Office Address
              </label>

              <textarea
                id="officeAddress"
                name="officeAddress"
                className={styles.inputFieldTextarea}
                {...formik.getFieldProps("officeAddress")}
              />

              {formik.touched.officeAddress && formik.errors.officeAddress && (
                <div className={styles.error}>
                  {formik.errors.officeAddress}
                </div>
              )}
            </div>
          </div>

          <div className={styles.formSection}>
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="assignAlerts">
                Assign Tasks
              </label>
              <select
                id="assignAlerts"
                name="assignAlerts"
                className={styles.inputField}
                {...formik.getFieldProps("assignAlerts")}
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

          <NavLink to="#" onClick={openModal}>Book an Appointment</NavLink>
          
          </div>


          <div className={styles.BtnContainer}>
            <button type="submit" className={styles.submitButton}>Submit</button>
            <button type="submit" onClick={HandleCancel} className={`${styles.submitButton} ${styles.cancelButton}`}>Cancel</button>
          </div>
        </form>
      </div>
          <Modal isOpen={isModalOpen} onClose={closeModal}>
             <AppointmentForm onClose={closeModal}/>
          </Modal>
    </>
  );
};

export default PeopleForm;
