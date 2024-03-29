import React, { useEffect, useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { NavLink, useNavigate } from 'react-router-dom';
import styles from './EditInvoiceForm.module.css';
import axios from 'axios';





const EditInvoicesForm = ({ invoiceData, onClose }) => {
  const [clientNames, setClientNames] = useState([]); // State to store client names
  const [caseTitles, setCaseTitles] = useState([]); // State to store case titles
  const [formData, setFormData] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePath, setFilePath] = useState(null); // Add this line
  const [filePathMessage, setFilePathMessage] = useState("");
  const [initialAddDocFileName, setInitialAddDocFileName] = useState(""); // Store initial file name
  const navigate = useNavigate();

  const initialValues = {
    client: invoiceData.client || '',
    caseType: invoiceData.caseType || '',
    date: invoiceData.date || '',
    amount: invoiceData.amount || '',
    taxType: invoiceData.taxType || '',
    taxPercentage: invoiceData.taxPercentage || '',
    CumulativeAmount: invoiceData.CumulativeAmount || '',
    fullAddress: invoiceData.fullAddress || '',
    hearingDate: invoiceData.hearingDate || '',
    title: invoiceData.title || '',
    dateFrom: invoiceData.dateFrom || '',
    dateTo: invoiceData.dateTo || '',
    expensesAmount: invoiceData.expensesAmount || '',
    expensesTaxType: invoiceData.expensesTaxType || '',
    expensesTaxPercentage: invoiceData.expensesTaxPercentage || '',
    expensesCumulativeAmount: invoiceData.expensesCumulativeAmount || '',
    totalAmount: invoiceData.totalAmount || '',
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
  CumulativeAmount: Yup.number().min(0),
  fullAddress: Yup.string(),
  hearingDate: Yup.date(),
  title: Yup.string().required('title is required'),
  dateFrom: Yup.date(),
  dateTo: Yup.date()
  .min(
    Yup.ref('dateFrom'),
    "Date To can't be before the Date From"
  ),
  expensesAmount: Yup.number().min(0, 'Amount must be greater than or equal to 0'),
  expensesTaxType: Yup.string(),
  expensesTaxPercentage: Yup.number().min(0, 'Tax Percentage must be greater than or equal to 0'),
  expensesCumulativeAmount: Yup.number().min(0, 'Cumulative Amount must be greater than or equal to 0'),
  totalAmount: Yup.number().min(0),
  addDoc: Yup.mixed(),
});
const calculateNormalTotalWithTax = (amount, taxPercentage) => {
  return amount + (amount * (taxPercentage / 100));
};

const calculateExpensesTotalWithTax = (expensesAmount, expensesTaxPercentage) => {
  return expensesAmount + (expensesAmount * (expensesTaxPercentage / 100));
};

const calculateTotalAmount = (cumulativeAmount, expensesCumulativeAmount) => {
  return (parseFloat(cumulativeAmount) || 0) + (parseFloat(expensesCumulativeAmount) || 0);
};

const handleNormalChange = (e, setFieldValue, values) => {
  const { name, value } = e.target;
  setFieldValue(name, value);

  const amount = name === 'amount' ? parseFloat(value) || 0 : parseFloat(values.amount) || 0;
  const taxPercentage = name === 'taxPercentage' ? parseFloat(value) || 0 : parseFloat(values.taxPercentage) || 0;
  const cumulativeAmount = calculateNormalTotalWithTax(amount, taxPercentage);

  setFieldValue('CumulativeAmount', cumulativeAmount.toFixed(2));
  const totalAmount = calculateTotalAmount(cumulativeAmount, values.expensesCumulativeAmount);
  setFieldValue('totalAmount', totalAmount.toFixed(2));
};

const handleExpensesChange = (e, setFieldValue, values) => {
  const { name, value } = e.target;
  setFieldValue(name, value);

  const expensesAmount = name === 'expensesAmount' ? parseFloat(value) || 0 : parseFloat(values.expensesAmount) || 0;
  const expensesTaxPercentage = name === 'expensesTaxPercentage' ? parseFloat(value) || 0 : parseFloat(values.expensesTaxPercentage) || 0;
  const expensesCumulativeAmount = calculateExpensesTotalWithTax(expensesAmount, expensesTaxPercentage);

  setFieldValue('expensesCumulativeAmount', expensesCumulativeAmount.toFixed(2));
  const totalAmount = calculateTotalAmount(values.CumulativeAmount, expensesCumulativeAmount);
  setFieldValue('totalAmount', totalAmount.toFixed(2));
};

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
      navigate(0);
      resetForm();
    } catch (error) {
      console.error(error);
    }
  };

  const HandleCancel=()=>{
    onClose();
  }

  return (
    <>
    <div className={styles.formContainer}>
    <h2 style={{textAlign:'center'}}>Generate Invoice's</h2>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, setFieldValue, values  }) => (
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
              <NavLink to="/dashboard/peopleform" className={styles.link}>
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
              <Field type="number" name="amount" className={styles.inputField} placeholder="Amount" onChange={(e) => handleNormalChange(e, setFieldValue, values)}/>
              <Field as="select" name="taxType" className={styles.selectFieldTaxType}>
                <option value="">Select Tax Type</option>
                <option value="SGST">SGST</option>
                <option value="CGST">CGST</option>
                <option value="IGST">IGST</option>
                <option value="ST">ST</option>
              </Field>
              <Field type="number" name="taxPercentage" className={styles.inputField} placeholder="Tax Percentage" onChange={(e) => handleNormalChange(e, setFieldValue, values)}/>
            </div>
            <ErrorMessage name="amount" component="div" className={styles.errorMessage} />
            <ErrorMessage name="taxType" component="div" className={styles.errorMessage} />
            <ErrorMessage name="taxPercentage" component="div" className={styles.errorMessage} />

            <Field 
  type="number" 
  name="CumulativeAmount" 
  className={styles.inputField} 
  placeholder="Cumulative Amount"

  readOnly
  
/>
<ErrorMessage name="CumulativeAmount" component="div" className={styles.errorMessage} />

            <Field as="textarea" name="fullAddress" className={styles.textareaField} placeholder="Full Address" />
            <ErrorMessage name="fullAddress" component="div" className={styles.errorMessage} />

            {/* <label className={styles.label} htmlFor="hearingDate">Hearing Date</label>
            <Field type="date" name="hearingDate" className={styles.inputFieldHearingDate} />
            <ErrorMessage name="hearingDate" component="div" className={styles.errorMessage} /> */}

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
                <Field type="number" name="expensesAmount" className={styles.inputField3} placeholder="Amount"  onChange={(e) => handleExpensesChange(e, setFieldValue, values)} />
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
              <Field type="number" name="expensesTaxPercentage" className={styles.inputField} placeholder="Tax Percentage" onChange={(e) => handleExpensesChange(e, setFieldValue, values)}/>
              <Field type="number" name="expensesCumulativeAmount" className={styles.inputField} placeholder="Cumulative Amount" readOnly/>
            </div>
            <ErrorMessage name="expensesTaxType" component="div" className={styles.errorMessage} />
            <ErrorMessage name="expensesTaxPercentage" component="div" className={styles.errorMessage} />
            <ErrorMessage name="expensesCumulativeAmount" component="div" className={styles.errorMessage} />
            <Field 
  type="number" 
  name="totalAmount" 
  className={styles.input0Field} 
  placeholder="Total Amount Including Expenses"
  readOnly
/>
<ErrorMessage name="totalAmount" component="div" className={styles.errorMessage} />
            
            {/* <span className={styles.fileNameSpan}>
  {initialAddDocFileName || "No file chosen"}
</span> */}
<input
  type="file"
  name="addDoc"
  accept=".pdf"
  className={styles.fileField}
  onChange={handleFileChange}
/>

         
          <div className={styles.BtnContainer}>
            <button type="submit" className={styles.submitButton} disabled={isSubmitting}>Submit</button>
            <button type="submit" onClick={HandleCancel} className={`${styles.submitButton}, ${styles.CancelButton}`} disabled={isSubmitting}>Cancel</button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
    </>
  );
};

export default EditInvoicesForm;
