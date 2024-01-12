import React, { useState, useEffect } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import axios from 'axios';
import DashboardNavbar from "../../utilities/DashboardNavbar/DashboardNavbar";
import style from "./GenrteDocs.module.css";
import { CircularProgress, CircularProgressLabel } from "@chakra-ui/react";
import { stateDistrictsMap } from "./data";
import jsPDF from 'jspdf';
import { useNavigate } from "react-router-dom";



// District

// Define a validation schema
const validationSchema = Yup.object().shape({
  state: Yup.string().required("State is required"),
  district: Yup.string().required("District is required"),
  Town: Yup.string().required("Town is required"),
  // CaseType: Yup.string().required("CaseType search period is required"),
  // propertyType: Yup.string().required("Property type is required"),
  // PreviousCase: Yup.string().required("Previous case type is required"),
  casetype: Yup.string().required("Case type is required"),
  History: Yup.string(),
  // History: Yup.string().required("History is required"),
  fullName: Yup.string().required("Full name is required"),
  address: Yup.string().required("Address is required"),
  
});

const GenrateDocs = () => {
 
  const [selectedState, setSelectedState] = useState("");
  const [districts, setDistricts] = useState([]);
  const [sectionData, setSectionData] = useState("");
  const [isSectionEditable, setSectionEditable] = useState(false);
  const [casetype, setCaseType] = useState("");
  //
  const [analysisStatus, setAnalysisStatus] = useState(null); // 'success', 'error', or null
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisError, setAnalysisError] = useState(null);


  const handleProceedClick = () => {
    if (!analysisResult) {
      console.error("No analysis result to generate the PDF");
      return;
    }
  
    const pdf = new jsPDF();
    pdf.setFontSize(12); 
    pdf.setFont("times", "normal"); 
  
    // Define the starting positions
    let yPosition = 20;
    const leftMargin = 20;
    const pageWidth = pdf.internal.pageSize.width;
    const lineHeight = 10; // Adjust line height as needed
  
    // Assuming analysisResult is a string. Modify this part based on your actual result structure
    const lines = pdf.splitTextToSize(analysisResult, pageWidth - 2 * leftMargin);
  
    lines.forEach((line) => {
      pdf.text(line, leftMargin, yPosition);
      yPosition += lineHeight;
  
      // Check if the page needs to be added (avoid overflow)
      if (yPosition > pdf.internal.pageSize.height - 20) {
        pdf.addPage();
        yPosition = 20;
      }
    });
  
    pdf.save("AnalysisResults.pdf");
  };
  
  
  


  // const handleAnalyzeClick = async (values) => {
  //   setIsAnalyzing(true);
  //   setAnalysisResult(null);
  //   setAnalysisError(null);
  //   // Create URLSearchParams from the form values
  //   const queryParams = new URLSearchParams({
  //     state: values.state,
  //     case_no: values.CaseNo,
  //     description: values.description,
  //     history: values.History,
  //     District: values.district,
  //     town: values.Town,
  //     case_type: values.casetype,
  //     full_name: values.fullName,
  //     address: values.address,
  //   });

  //   const url = `/proxy/law_sections/?${queryParams.toString()}`;
  //   // Prepare the formData for the file
  //   const formData = new FormData();
  //   if (values.fileUpload) {
  //     formData.append('pdf_file', values.fileUpload);
  //   }
  
  //   try {
  //     // Make the POST request with axios
  //     const response = await axios.post(url, formData, {
  //       headers: {
  //         'x-auth-token': localStorage.getItem('token'),
  //       },
  //     });
  
  //     setAnalysisResult(response.data); // Adjust according to your API response
  //     console.log('Analysis Result:', response.data);
  //   } catch (error) {
  //     setAnalysisError(error.message);
  //     console.error('Error:', error);
  //   } finally {
  //     setIsAnalyzing(false);
  //   }
  // };
  

  const handleAnalyzeClick = async (values) => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setAnalysisError(null);

    if (values.fileUpload) {
      const blob = dataURLtoBlob(values.fileUpload);
      console.log(blob)
      const formData = new FormData();
      formData.append('pdf_file', blob);
      console.log(formData)

      // Construct the query parameters
      const queryParams = new URLSearchParams({
        state: values.state,
        case_no: values.CaseNo,
        description: values.description,
        history: values.History,
        District: values.district,
        town: values.Town,
        case_type: values.casetype,
        full_name: values.fullName,
        address: values.address
      });

      // Append query parameters to the URL
      const url = `http://34.105.29.122:8000/law_sections/?${queryParams.toString()}`;

      try {
        const response = await fetch(url, {
          method: 'POST',
          body: formData
        });

        if (response.ok) {
          const responseData = await response.json();
          setAnalysisResult(responseData);
        } else {
          throw new Error('Failed to analyze data');
        }
      } catch (error) {
        setAnalysisError(error.message);
      } finally {
        setIsAnalyzing(false);
      }
    } else {
      setAnalysisError("No file uploaded.");
      setIsAnalyzing(false);
    }
  };

  
  
  const handleFileUpload = (event, setFieldValue) => {
    const file = event.currentTarget.files[0];
    if (file) {
      const reader = new FileReader();
  
      reader.onload = (e) => {
        setFieldValue("fileUpload", e.target.result); // Store the Data URL in Formik's state
      };
  
      reader.readAsDataURL(file); // Convert file to Data URL
    }
  };
  



  const handleStateChange = (event, setFieldValue) => {
    const state = event.target.value;
    setSelectedState(state);
    setDistricts(stateDistrictsMap[state] || []);
    setFieldValue("state", state);
    setFieldValue("district", "");
  };

  useEffect(() => {
    setTimeout(() => {
      const fetchedData = ""; // Example section data
      setSectionData(fetchedData);
      setSectionEditable(true);
    }, 2000);
  }, []);

  

  const navigate = useNavigate();
  const HandleCancel=()=>{
    navigate('/dashboard')
  }


  return (
    <>
      <DashboardNavbar />
      <Formik
        initialValues={{
          state: "",
          district: "",
          Town: "",
          // CaseType: "",
          casetype: "",
          // propertyType: "",
          // propertyIdType: "",
          History: "",
          fullName: "",
          address: "",
          CaseNo: "",
          Previouscase: "",
          fileUpload: null, 
        }}
        validationSchema={validationSchema}
        onSubmit={(values) => {
          // Handle form submission
          console.log(values);
        }}
      >
        {({ errors, touched, isValid, dirty, setFieldValue, values }) => (
          console.log({ errors, touched, isValid, dirty }),
          (
            <div className={style.formContainer}>
              <Form>
                <h1 style={{ textAlign: "center" }}>Genrate Document's</h1>
                <div className={style.formRow}>
                  <div className={style.FormGroup}>
                    <label htmlFor="state" className={style.Label}>
                      State
                    </label>
                    <Field
                      as="select"
                      className={style.Field}
                      name="state"
                      onChange={(e) => handleStateChange(e, setFieldValue)}
                    >
                      <option value="">Select State</option>
                      {Object.keys(stateDistrictsMap).map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </Field>
                    {errors.state && touched.state ? (
                      <div className={style.error}>{errors.state}</div>
                    ) : null}
                  </div>

                  <div className={style.FormGroup}>
                    <label htmlFor="district" className={style.Label}>
                      District
                    </label>
                    <Field as="select" className={style.Field} name="district">
                      <option value="">Select District</option>
                      {districts.map((district) => (
                        <option key={district} value={district}>
                          {district}
                        </option>
                      ))}
                    </Field>
                    {errors.district && touched.district ? (
                      <div className={style.error}>{errors.district}</div>
                    ) : null}
                  </div>
                </div>

                <div className={style.formRow}>
                  <div className={style.FormGroup}>
                    <label htmlFor="Town" className={style.Label}>
                      Town
                    </label>
                    <Field
                      className={style.Field}
                      name="Town"
                      placeholder="Town"
                    />
                    {errors.Town && touched.Town ? (
                      <div className={style.error}>{errors.Town}</div>
                    ) : null}
                  </div>

                  <div className={style.FormGroup}>
                    <label htmlFor="casetype" className={style.Label}>
                      Case type
                    </label>
                    <Field
                      className={style.Field}
                      as="select"
                      name="casetype"
                      onChange={(e) => {
                        setCaseType(e.target.value);
                        setFieldValue("casetype", e.target.value);
                      }}
                      value={casetype}
                    >
                      <option value="">Select Case Type</option>
                      <option name="Criminal" value="Criminal">
                        Criminal
                      </option>
                      <option name="Criminal" value="CustomerComplaints">
                        Customer Complaints
                      </option>
                      <option name="Criminal" value="Insurance">
                        Insurance
                      </option>
                    </Field>
                    {errors.casetype && touched.casetype ? (
                      <div className={style.error}>{errors.casetype}</div>
                    ) : null}
                  </div>
                </div>

                {casetype === "Criminal" && (
                  <div className={style.formRow}>
                    <div className={style.FormGroup}>
                      <label className={style.Label} name="Previouscase">
                        Previous case (Optionals)
                      </label>
                      <Field
                        className={style.Field}
                        type="text"
                        name="Previouscase"
                        placeholder="Privious case"
                      />
                      {errors.CaseType && touched.CaseType ? (
                        <div className={style.error}>{errors.CaseType}</div>
                      ) : null}
                    </div>
                    <div className={style.FormGroup}>
                      <label className={style.Label} name="CaseNo">
                        Case No (Optionals)
                      </label>
                      <Field
                        className={style.Field}
                        type="text"
                        name="CaseNo"
                        placeholder="Case No"
                      />
                      {errors.CaseType && touched.CaseType ? (
                        <div className={style.error}>{errors.CaseType}</div>
                      ) : null}
                    </div>

                    <div className={style.FormGroup}>
                      <label htmlFor="Document" className={style.Label}>
                        Upload Documents (Optionals)
                      </label>

                      <Field
                        id="Document"
                        className={style.HiddenFileInput}
                        type="file"
                        name="Document"
                        onChange={(event) => handleFileUpload(event, setFieldValue)}
                        // You can add an 'onChange' event here if you need to handle the file input
                      />
                      {/* Update this to display errors for the 'Document' field */}
                      {errors.Document && touched.Document ? (
                        <div className={style.error}>{errors.Document}</div>
                      ) : null}
                    </div>
                  </div>
                )}

                {(casetype === "CustomerComplaints" ||
                  casetype === "Insurance") && (
                  <div className={style.formRow}>
                    <div className={style.FormGroup}>
                      <label className={style.Label} name="Previouscase">
                        Previous case{" "}
                      </label>
                      <Field
                        className={style.Field}
                        type="text"
                        name="Previouscase"
                        placeholder="Privious case"
                      />
                      {errors.CaseType && touched.CaseType ? (
                        <div className={style.error}>{errors.CaseType}</div>
                      ) : null}
                    </div>
                    <div className={style.FormGroup}>
                      <label className={style.Label} name="CaseNo">
                        Case No{" "}
                      </label>
                      <Field
                        className={style.Field}
                        type="text"
                        name="CaseNo"
                        placeholder="Case No"
                      />
                      {errors.CaseType && touched.CaseType ? (
                        <div className={style.error}>{errors.CaseType}</div>
                      ) : null}
                    </div>

                    <div className={style.FormGroup}>
                      <label htmlFor="Document" className={style.Label}>
                        Upload Documents
                      </label>
                      <Field
                        id="Document"
                        className={style.HiddenFileInput}
                        type="file"
                        name="Document"
                        onChange={(event) => handleFileUpload(event, setFieldValue)}

                      />
                      {/* Update this to display errors for the 'Document' field */}
                      {errors.Document && touched.Document ? (
                        <div className={style.error}>{errors.Document}</div>
                      ) : null}
                    </div>
                  </div>
                )}

                <div className={style.formRow}>
                  <div className={style.FormGroup}>
                    <label htmlFor="History" className={style.Label}>
                      History
                    </label>
                    <Field
                      className={style.Field}
                      name="History"
                      placeholder="Any History"
                    />
                    {errors.History && touched.History ? (
                      <div className={style.error}>{errors.History}</div>
                    ) : null}
                  </div>

                  <div className={style.FormGroup}>
                    <label htmlFor="sectionInvolved" className={style.Label}>
                      Section Involved
                    </label>
                    <Field
                      className={style.Field}
                      name="sectionInvolved"
                      placeholder="Section Involved"
                      disabled={!isSectionEditable}
                      value={sectionData || ""} // Set the value to the data fetched
                    />
                    {errors.sectionInvolved && touched.sectionInvolved && (
                      <div className={style.error}>
                        {errors.sectionInvolved}
                      </div>
                    )}
                  </div>
                </div>
                <div className={style.formRow}>
                  <div className={style.FormGroup}>
                    <label htmlFor="fullName" className={style.Label}>
                      Full Name
                    </label>
                    <Field
                      className={style.Field}
                      name="fullName"
                      placeholder="Full Name"
                    />
                    {errors.fullName && touched.fullName ? (
                      <div className={style.error}>{errors.fullName}</div>
                    ) : null}
                  </div>

                  <div className={style.FormGroup}>
                    <label htmlFor="address" className={style.Label}>
                      Address
                    </label>
                    <Field
                      className={style.Field}
                      name="address"
                      placeholder="Address"
                    />
                    {errors.address && touched.address ? (
                      <div className={style.error}>{errors.address}</div>
                    ) : null}
                  </div>
                </div>
                <div className={style.FormGroup}>
                  <label htmlFor="description" className={style.Label}>
                    Descriptions
                  </label>
                  <Field
                    as="textarea"
                    className={style.TextAreaField}
                    name="description"
                    placeholder="Enter your description here"
                  />
                  {errors.description && touched.description && (
                    <div className={style.error}>{errors.description}</div>
                  )}
                </div>

                {/* <CircularProgress
                  className={style.Circle}
                  isIndeterminate
                  color="blue"
                  thickness="15px"
                  size={20}
                /> */}
                <div className={style.btnContainer}>
                <button type="submit" onClick={HandleCancel} className={style.button}>
                  Cancel
                </button>
                <button
  type="button"
  className={style.button}
  onClick={() => handleAnalyzeClick(values)}
  disabled={!isValid || !dirty || isAnalyzing} // Enable only if the form is valid, dirty, and not analyzing
>
  Analyze A.I
  {isAnalyzing && (
    <CircularProgress
      className={style.Circle}
      isIndeterminate
      color="blue"
      thickness="15px"
      size={20}
    />
  )}
</button>

                  <button
                    type="button"
                    className={style.button}
                    onClick={handleProceedClick}
                    disabled={!analysisResult}
                  >
                    Proceed
                  </button>
                </div>
                {analysisError && (
                  <div className={style.error}>{analysisError}</div>
                )}
              </Form>
            </div>
          )
        )}
      </Formik>
    </>
  );
};
function dataURLtoBlob(dataurl) {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while(n--) {
      u8arr[n] = bstr.charCodeAt(n);
  }

  return new Blob([u8arr], {type: mime});
}
export default GenrateDocs;
