import React, { useEffect, useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { NavLink } from 'react-router-dom';
import styles from './EditInvoiceForm.module.css';
import axios from 'axios';





const EditInvoicesForm = ({ invoiceData }) => {
  const [clientNames, setClientNames] = useState([]); // State to store client names
  const [caseTitles, setCaseTitles] = useState([]); // State to store case titles
  const [formData, setFormData] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePath, setFilePath] = useState(null); // Add this line
  const [filePathMessage, setFilePathMessage] = useState("");
  const [initialAddDocFileName, setInitialAddDocFileName] = useState(""); // Store initial file name

  const initialValues = {
    client: invoiceData.client || '',
    caseType: invoiceData.caseType || '',
    date: invoiceData.date || '',
    amount: invoiceData.amount || '',
    taxType: invoiceData.taxType || '',
    taxPercentage: invoiceData.taxPercentage || '',
    fullAddress: invoiceData.fullAddress || '',
    hearingDate: invoiceData.hearingDate || '',
    title: invoiceData.title || '',
    dateFrom: invoiceData.dateFrom || '',
    dateTo: invoiceData.dateTo || '',
    expensesAmount: invoiceData.expensesAmount || '',
    expensesTaxType: invoiceData.expensesTaxType || '',
    expensesTaxPercentage: invoiceData.expensesTaxPercentage || '',
    expensesCumulativeAmount: invoiceData.expensesCumulativeAmount || '',
    addDoc: invoiceData.addDoc || '',
    invoiceNumber: invoiceData.invoiceNumber || '',
    setInitialAddDocFileName: invoiceData.addDoc || "",
    
  };

  
const validationSchema = Yup.object().shape({
  client: Yup.string(),
  caseType: Yup.string(),
  date: Yup.date(),
  amount: Yup.number().min(0, 'Amount must be greater than or equal to 0'),
  taxType: Yup.string(),
  taxPercentage: Yup.number().min(0, 'Tax Percentage must be greater than or equal to 0'),
  fullAddress: Yup.string(),
  hearingDate: Yup.date(),
  title: Yup.string().required('title is required'),
  dateFrom: Yup.date(),
  dateTo: Yup.date(),
  expensesAmount: Yup.number().min(0, 'Amount must be greater than or equal to 0'),
  expensesTaxType: Yup.string(),
  expensesTaxPercentage: Yup.number().min(0, 'Tax Percentage must be greater than or equal to 0'),
  expensesCumulativeAmount: Yup.number().min(0, 'Cumulative Amount must be greater than or equal to 0'),
  addDoc: Yup.mixed(),
});
  

  useEffect(() => {
    // Fetch client names and populate the select options
    const fetchClientNames = async () => {
      try {
        const clientResponse = await axios.get('http://localhost:8052/clientform', {
          headers: {
            'x-auth-token': localStorage.getItem('token'), // Get the token from localStorage or your authentication mechanism
          },
        });

        // Extract the client names from the response data
        const clientNameArray = clientResponse.data.map((client) => client.firstName);
        setClientNames(clientNameArray);
      } catch (error) {
        console.error(error);
      }
    };

    // Fetch case titles and populate the select options
    const fetchCaseTitles = async () => {
      try {
        const caseResponse = await axios.get('http://localhost:8052/caseform', {
          headers: {
            'x-auth-token': localStorage.getItem('token'), // Get the token from localStorage or your authentication mechanism
          },
        });

        // Extract the case titles from the response data
        const caseTitleArray = caseResponse.data.map((caseItem) => caseItem.title);
        setCaseTitles(caseTitleArray);
      } catch (error) {
        console.error(error);
      }
    };

    axios
      .get('http://localhost:8052/invoiceform/edit', {
        headers: {
          'x-auth-token': localStorage.getItem('token'),
        },
      })
      .then((response) => {
        const responseData = response.data[0];
        setFormData(responseData);
        if (responseData.addDoc) {
          // Extract the file name from the path
          const fileName = responseData.addDoc.split('\\').pop();
          setInitialAddDocFileName(fileName); // Set the initial file name
        }
      })
    
      .catch((error) => {
        console.error(error);
      });


    fetchClientNames(); // Call the fetchClientNames function when the component mounts
    fetchCaseTitles(); // Call the fetchCaseTitles function when the component mounts
  }, [invoiceData.id]);

  const handleFileChange = (event) => {
    setSelectedFile(event.currentTarget.files[0]);
    setFilePathMessage(`You have chosen this file: ${event.currentTarget.files[0].name}. If you want to change, then choose another file.`);
  };
  const handleSubmit = async (values, { resetForm }) => {
    try {
      // Make an HTTP POST request to update the case
      const response = await axios.put(
        `http://localhost:8052/invoiceform/edit/update/${invoiceData.id}`,
        values,
        {
          headers: {
            'x-auth-token': localStorage.getItem('token'),
          },
        }
      );
  
      console.log(response.data);
      alert('Invoice Updated successfully!');
      resetForm();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
    <div className={styles.formContainer}>
    <h2 style={{textAlign:'center'}}>Generate Invoice's</h2>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form>
            <div className={styles.invoiceNo}><span style={{ color: 'var(--color-primary)'}}>INV-</span>{initialValues.invoiceNumber}</div>
            <div className={styles.clientContainer}>
            <Field as="select" name="client" className={styles.selectFieldClient}>
                  <option value="">Select Client</option>
                  {clientNames.map((clientName) => (
                    <option key={clientName} value={clientName}>
                      {clientName}
                    </option>
                  ))}
                </Field>
              <NavLink to="/clientform" className={styles.link}>
                Add New Client
              </NavLink>
            </div>
            <ErrorMessage name="client" component="div" className={styles.errorMessage} />

            <div className={styles.fieldContainer}>
            <Field as="select" id="caseType" name="caseType" className={styles.selectFieldType}>
                  <option value="">Select a Case</option>
                  {caseTitles.map((caseTitle) => (
                    <option key={caseTitle} value={caseTitle}>
                      {caseTitle}
                    </option>
                  ))}
                </Field>
              <Field type="date" name="date" className={styles.inputField} />
            </div>
            <ErrorMessage name="caseType" component="div" className={styles.errorMessage} />
            <ErrorMessage name="date" component="div" className={styles.errorMessage} />

            <div className={styles.fieldContainer}>
              <Field type="number" name="amount" className={styles.inputField} placeholder="Amount" />
              <Field as="select" name="taxType" className={styles.selectFieldTaxType}>
                <option value="">Select Tax Type</option>
                <option value="SGST">SGST</option>
                <option value="CGST">CGST</option>
                <option value="IGST">IGST</option>
                <option value="ST">ST</option>
              </Field>
              <Field type="number" name="taxPercentage" className={styles.inputField} placeholder="Tax Percentage" />
            </div>
            <ErrorMessage name="amount" component="div" className={styles.errorMessage} />
            <ErrorMessage name="taxType" component="div" className={styles.errorMessage} />
            <ErrorMessage name="taxPercentage" component="div" className={styles.errorMessage} />

            <Field as="textarea" name="fullAddress" className={styles.textareaField} placeholder="Full Address" />
            <ErrorMessage name="fullAddress" component="div" className={styles.errorMessage} />

            <label className={styles.label} htmlFor="hearingDate">Hearing Date</label>
            <Field type="date" name="hearingDate" className={styles.inputFieldHearingDate} />
            <ErrorMessage name="hearingDate" component="div" className={styles.errorMessage} />

            <div className={styles.expensesTitle}>EXPENSES</div>
            <label className={styles.label} htmlFor="title">Title</label>
            <Field type="text" name="title" className={styles.inputFieldTitle} />
            <ErrorMessage name="title" component="div" className={styles.errorMessage} />

            <div className={styles.fieldContainer}>
              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="dateFrom">
                  Date From:
                </label>
                <Field type="date" name="dateFrom" className={styles.inputField1} />
              </div>
              <div className={styles.fieldGroup3}>
                <label className={styles.label} htmlFor="dateTo">
                  Date To:
                </label>
                <Field type="date" name="dateTo" className={styles.inputField2} />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="expensesAmount">
                  Amount:
                </label>
                <Field type="number" name="expensesAmount" className={styles.inputField3} placeholder="Amount" />
              </div>
            </div>
            <ErrorMessage name="dateFrom" component="div" className={styles.errorMessage} />
            <ErrorMessage name="dateTo" component="div" className={styles.errorMessage} />
            <ErrorMessage name="expensesAmount" component="div" className={styles.errorMessage} />

            <div className={styles.fieldContainer}>
              <Field as="select" name="expensesTaxType" className={styles.selectFieldTaxType}>
                <option value="">Select Tax Type</option>
                <option value="SGST">SGST</option>
                <option value="CGST">CGST</option>
                <option value="IGST">IGST</option>
                <option value="ST">ST</option>
              </Field>
              <Field type="number" name="expensesTaxPercentage" className={styles.inputField} placeholder="Tax Percentage" />
              <Field type="number" name="expensesCumulativeAmount" className={styles.inputField} placeholder="Cumulative Amount" />
            </div>
            <ErrorMessage name="expensesTaxType" component="div" className={styles.errorMessage} />
            <ErrorMessage name="expensesTaxPercentage" component="div" className={styles.errorMessage} />
            <ErrorMessage name="expensesCumulativeAmount" component="div" className={styles.errorMessage} />
            
            <span className={styles.fileNameSpan}>
  {initialAddDocFileName || "No file chosen"}
</span>
<input
  type="file"
  name="addDoc"
  accept=".pdf"
  className={styles.fileField}
  onChange={handleFileChange}
/>

         
          <div className={styles.BtnContainer}>
            <button type="submit" className={styles.submitButton} disabled={isSubmitting}>Submit</button>
            <button type="submit" className={styles.submitButton} disabled={isSubmitting}>Cancel</button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
    </>
  );
};

export default EditInvoicesForm;
