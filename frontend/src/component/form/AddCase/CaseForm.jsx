import React, { useEffect, useState } from 'react';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { NavLink, useNavigate } from 'react-router-dom';
import styles from './AddCase.module.css';
import axios from 'axios';
import DashboardNavbar from '../../utilities/DashboardNavbar/DashboardNavbar';


const CaseForm = () => {
  const [clientNames, setClientNames] = useState([]); // State to store client first names
  const [teamMembers, setTeamMembers] = useState([]); // State to store team member full names
  const [isForm1Submitted, setIsForm1Submitted] = useState(false);
  const [isForm2Submitted, setIsForm2Submitted] = useState(false);
  const [titleError, setTitleError] = useState('');

  const [caseId, setCaseId] = useState(null);
  const navigate = useNavigate();

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

    // Fetch team member full names and populate the select options
    const fetchTeamMembers = async () => {
      try {
        const response = await axios.get('http://localhost:8052/teammemberform', {
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

    fetchClientNames(); // Call the fetchClientNames function when the component mounts
    fetchTeamMembers(); // Call the fetchTeamMembers function when the component mounts
  }, []);

const initialValues = {
  title: '',
  caseType: '',
  courtType: '',
  courtName: '',
  caveatNo: '',
  caseCode: '',
  caseURL: '',
  caseStatus: '',
  honorableJudge: '',
  courtHallNo: '',
  cnrNo: '',
  batchNo: '',
  dateOfFiling: '',
  practiceArea: '',

  
};


const concernedPersonFormInitialValues = { 
  manage: '',
  client: '',
  addNewClient: '',
  team: '',
  addNewMember: '',
  type: '', 
  lawyerType: '',
  clientDesignation: '',
  opponentPartyName: '',
  lawyerName: '',
  mobileNo: '',
  emailId: '',
 };


const validationSchema = Yup.object().shape({
  title: Yup.string().required('Title is required'),
  caseType: Yup.string().required('Case type is required'),
  cnrNo: Yup.string().required('CNR No. is required'),
  // Add validation for other fields as needed
  dateOfFiling: Yup.date().required('Date of Filling is required')
    .test(
      'is-not-less-than-current-date',
      'Invalid Date',
      value => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset hours to start of the day for comparison
        return value && new Date(value) >= today;
      }
    ),
});

const concernedPersonFormValidationSchema = Yup.object().shape({ 
  opponentPartyName: Yup.string().required('Opponent Party Name is required'),

 });

// const concernedPersonFormValidationSchema = Yup.object().shape({ 

// });


const handleSubmit = async (values, { resetForm, setErrors }) => {
  try {
    const response = await axios.post('http://localhost:8052/caseform', values, {
      headers: {
        'x-auth-token': localStorage.getItem('token'),
      },
    });
    alert('Case Added successfully!');
    setCaseId(response.data.caseId);
    setIsForm1Submitted(true);
    resetForm();
  } catch (error) {
    if (error.response && error.response.status === 400) {
      setTitleError(error.response.data.error);
      setErrors({ title: ' ' }); // Trigger field error
    } else {
      console.error(error);
    }
  }
};

const handleConcernedPersonSubmit = async (values, { resetForm }) => {
  if (caseId) {
    try {
      values.caseId = caseId; // Attach the caseId to the form data
      const response = await axios.post('http://localhost:8052/concernedperson', values, {
        headers: {
          'x-auth-token': localStorage.getItem('token'),
        },
      });
      alert('Concerned Person and Opponent Added successfully!');
      setIsForm2Submitted(true);
      navigate(-1);
      resetForm();
      setIsForm1Submitted(true);

    } catch (error) {
      console.error(error);
    }
  } else {
    alert('Error: No associated case found.');
  }
};



  return (
    <>
      <DashboardNavbar />
      <div className={styles.container}>
      <h2 style={{textAlign:'center'}}>Add Case</h2>


      {!isForm1Submitted && ( // Conditional rendering based on isForm1Submitted
      <Formik
        initialValues={{ initialValues}}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}>

        {({ values }) => (
          <Form>
            
          <div className={styles.row}>
            <div className={styles.column}> 
            <label className={styles.label}>Title:</label>
              <Field type="text" name="title" className={styles.inputTitle} />
              <ErrorMessage name="title" component="div" className={styles.error} />
              {titleError && <div className={styles.error}>{titleError}</div>}
              </div>
            </div>

            {/* Case Type (Radio Buttons) */}
           
            <div className={styles.row}>
            <div className={styles.column}>
            <label className={styles.label}>Case Type:</label>
            <div className={styles.radioGroup}>
                    <label>
                      <Field type="radio" name="caseType" value="litigation" className={styles.radio} /> Litigation
                    </label>
                    <label>
                      <Field type="radio" name="caseType" value="non-litigation" className={styles.radio} /> Non-Litigation
                    </label>
                    <label>
                      <Field type="radio" name="caseType" value="caveat" className={styles.radio} /> Caveat
                    </label>
                  </div>
              <ErrorMessage name="caseType" component="div" className={styles.error} />
            </div>
            </div>

            {/* Court Type (Radio Buttons - Displayed when 'Litigation' selected) */}
            {values.caseType === 'litigation' && (
              <div className={styles.row}>
                <div className={styles.column}>
                <label className={styles.label}>Court Type:</label>
                {/* Add radio buttons for Court Type */}
                <div className={styles.radioGroup}>
        <label>
          <Field type="radio" name="courtType" value="High" className={styles.radio} />High
        </label>
        <label>
          <Field type="radio" name="courtType" value="Consumer" className={styles.radio} />Consumer
        </label>
        <label>
          <Field type="radio" name="courtType" value="Supreme" className={styles.radio} />Supreme
        </label>
        <label>
          <Field type="radio" name="courtType" value="District" className={styles.radio} />District
        </label>
        <label>
          <Field type="radio" name="courtType" value="Tribunal" className={styles.radio} />Tribunal
        </label>
        <label>
          <Field type="radio" name="courtType" value="Revenue" className={styles.radio} />Revenue
        </label>
        <label>
          <Field type="radio" name="courtType" value="Department" className={styles.radio} />Department
        </label>
        <label>
          <Field type="radio" name="courtType" value="LokAdalat" className={styles.radio} />Lok Adalat
        </label>
        <label>
          <Field type="radio" name="courtType" value="Other" className={styles.radio} />Other
        </label>
      </div>
              </div>
              </div>
            )}

            {/* Court Name and Caveat No (Displayed when 'Caveat' selected) */}
            {values.caseType === 'caveat' && (
              <>
                
                <div className={styles.row}>
                   <div className={styles.column}>
                  <label className={styles.label}>Court Name:</label>
                  <Field type="text" name="courtName" className={styles.inputCaveat1} />
                  </div>
                  <div className={styles.column}>
                  <label className={styles.labelCaveat2}>Caveat No:</label>
                  <Field type="text" name="caveatNo" className={styles.inputCaveat2} />
                  </div>
                </div>
              </>
            )}

            {/* Case Code */}
            
            <div className={styles.row}>
            <div className={styles.column}>
              <label className={styles.label}>Case Code:</label>
              <Field type="text" name="caseCode" className={styles.input} />
            </div>

            {/* Case URL */}
            
            
            <div className={styles.column}>
              <label className={styles.label}>Case URL:</label>
              <Field type="text" name="caseURL" className={styles.input} />
            </div>

            {/* Honorable Judge */}
            <div className={styles.column}>
             <label className={styles.label}>Honorable Judge:</label>
             <Field type="text" name="honorableJudge" className={styles.input} />
            </div>
            {/* Case Status (Select Options) */}
            
            <div className={styles.column}>
              <label className={styles.label}>Case Status:</label>
              <Field as="select" name="caseStatus" className={styles.selectCaseStatus}>
                <option value="">Select</option>
                <option value="Closed">Closed</option>
                <option value="Transfered"> Transfered(NOC Given) </option>
                <option value="DirectionMatters">Direction Matters</option>
                <option value="OrderRecieved">Order Recieved</option>
              </Field>
              <ErrorMessage name="caseStatus" component="div" className={styles.error} />
            </div>
            </div>

            {/* Court Hall No */}
           
            <div className={styles.row}>
            <div className={styles.column}>
            <label className={styles.label}>Court Hall No:</label>
              <Field type="text" name="courtHallNo" className={styles.input} />
            </div>

            {/* CNR No */}
            
            <div className={styles.column}>
            <label className={styles.label}>CNR No:</label>
              <Field type="text" name="cnrNo" className={styles.input} required />
              
            </div>

            {/* Batch No */}
            
            <div className={styles.column}>
            <label className={styles.label}>Batch No:</label>
              <Field type="text" name="batchNo" className={styles.input} />
            </div>

            {/* Date of Filing (Date Picker) */}
           
            <div className={styles.column}>
            <label className={styles.label}>Date of Filing:</label>
              <Field type="date" name="dateOfFiling" className={styles.inputDate} />
              
            </div>
            
            
            </div>
            <ErrorMessage name="dateOfFiling" component="div" className={styles.error1} />

            {/* Practice Area (Select Options) */}
            
            
            <div className={styles.row}>
            <div className={styles.column}>
            <label className={styles.label}>Practice Area:</label>
              <Field as="select" name="practiceArea" className={styles.selectPa}>
                <option value="">Select</option>
                <option value="Intellectual Property">Intellectual Property</option>
                <option value="Immigration">Immigration</option>
                <option value="Industrial and Labouror">Industrial and Labouror</option>
                <option value="Insurance">Insurance</option>
                <option value="Traffic and Accident">Traffic and Accident</option>
                <option value="Maritime">Maritime</option>
                <option value="Media and Entertainment">Media and Entertainment</option>
                <option value="Marriage, Family and Adoption (NOC)">Marriage, Family and Adoption (NOC)</option>
                <option value="Alternative Dispute Resolution (NOC)">Alternative Dispute Resolution (NOC)</option>
                <option value="Human and Animal Rights (NOC)">Human and Animal Rights (NOC)</option>
                <option value="Enviorment (NOC)">Enviorment (NOC)</option>
                <option value="Criminal, Check bounce, Cyber Crimes (NOC)">Criminal, Check bounce, Cyber Crimes (NOC)</option>
                <option value="Direct Tax (NOC)">Direct Tax (NOC)</option>
                <option value="Indirect Tax (NOC)">Indirect Tax (NOC)</option>
                <option value="Consumer Protection (NOC)">Consumer Protection (NOC)</option>
                <option value="Constitution and Public Law (NOC)">Constitution and Public Law (NOC)</option>
              </Field>
            </div>

            {/* Manage (Select Options) */}
           
            <div className={styles.column}>
            <label className={styles.labelManage}>Priority:</label>
              <Field as="select" name="manage" className={styles.selectManage}>
                <option value="">Select</option>
                <option value="Super Critical"> Super Critical</option>
                <option value="Critical">Critical</option>
                <option value="Important">Important</option>
                <option value="Routine">Routine</option>
                <option value="Normal">Normal</option>
              </Field>
            </div>
            </div>


            <div className={styles.BtnContainer}>
              <button type="submit" className={styles.submitButton}>Submit</button>
              <NavLink to={"/dashboard/Importcase"}>
              <button type="submit" className={`${styles.submitButton}, ${styles.CancelButton}`}>Cancel</button>
              </NavLink>
              </div>
          </Form>
        )}
      </Formik>
      )}


          



  {isForm1Submitted && (
          <>
      <Formik
        initialValues={concernedPersonFormInitialValues}
          validationSchema={concernedPersonFormValidationSchema}
          onSubmit={handleConcernedPersonSubmit}
        >
        {({ values }) => (
  <Form>

  <div className={styles.heading}>Concerned Person</div>
            {/* Client (Select Options) */}
            
            <div className={styles.row}>
            <div className={styles.column}>
            <label className={styles.label}>People:</label>
            <Field as="select" name="client" className={styles.selectClient}>
                    <option value="">Select</option>
                    {clientNames.map((firstName) => (
                      <option key={firstName} value={firstName}>
                        {firstName}
                      </option>
                    ))}
                  </Field>
              <NavLink className={styles.linkClient} to="/dashboard/peopleform">Add New People</NavLink>
            </div>
            <div className={styles.columnTeam}>
            <label className={styles.labelTeam}>Team:</label>
            <Field as="select" name="assignTo" className={styles.selectTeam}>
                    <option value="">Select an option</option>
                    {teamMembers.map((fullName) => (
                      <option key={fullName} value={fullName}>
                        {fullName}
                      </option>
                    ))}
                  </Field>
              <NavLink className={styles.linkTeam} to="/dashboard/teammemberform">Add New Member</NavLink>
            </div>
            </div>

           
<div className={styles.formGroup}>

<div className={styles.column}>
  <label className={styles.label} htmlFor="type">Type</label>
  <Field as="select" name="type"  className={styles.selectCd}>
    <option value="">Select Type</option>
    <option value="Client">Client</option>
    <option value="Lawyers">Lawyers</option>
    <option value="OpposingClient">Opposing Client</option>
    <option value="Witness">Witness</option>
  </Field>
  <ErrorMessage name="type" component="div" className={styles.error} />
</div>
</div>


{/* Conditional Lawyer Type Dropdown */}
{values.type === "Lawyers" && (
  <div className={styles.formGroup}>
    <div className={styles.column}>
    <label className={styles.label} htmlFor="lawyerType">Lawyer Type</label>
    <Field as="select" name="lawyerType" className={styles.selectCd}>
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
      <option value="CivilLitigationLawyer">Civil Litigation Lawyer</option>
      <option value="RealEstateLawyer">Real Estate Lawyer</option>
      <option value="ConstitutionalLawyer">Constitutional Lawyer</option>
      <option value="EntertainmentLawyer">Entertainment Lawyer</option>
    </Field>
    <ErrorMessage name="lawyerType" component="div" className={styles.error} />
  </div>
  </div>
)}   




 {/* Opponent (Heading) */}
 <div className={styles.heading}>Opponent</div>

{/* Opponent Party Name */}
<div className={styles.row1}>
<div className={styles.column}>
<label className={styles.label}>Party:</label>
  <Field type="text" name="opponentPartyName" className={styles.inputopn} />
  <ErrorMessage name="opponentPartyName" component="div" className={styles.error} />
</div>

{/* Lawyer Name */}

<div className={styles.column}>
<label className={styles.labelln}>Lawyer Name:</label>
  <Field type="text" name="lawyerName" className={styles.inputln} />
</div>
</div>

{/* Mobile No */}
<div className={styles.row1}>
<div className={styles.column}>
<label className={styles.label}>Mobile No:</label>
  <Field type="text" name="mobileNo" className={styles.inputmn} />
</div>

{/* Email Id */}
<div className={styles.column}>
  <label className={styles.labelei}>Email Id:</label>
  <Field type="text" name="emailId" className={styles.inputei} />
</div>
</div>
    <div className={styles.BtnContainer}>
              <button type="submit" className={styles.submitButton}>Submit</button>
              <NavLink to={"/dashboard/Importcase"}>
              <button type="submit" className={`${styles.submitButton}, ${styles.CancelButton}`}>Cancel</button>
              </NavLink>
              </div> 
               </Form>
              )}

</Formik>
    </>
        )}



</div>
    </>
  );
};

export default CaseForm;
