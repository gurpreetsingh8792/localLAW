import React, { useEffect, useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { NavLink, useNavigate } from 'react-router-dom';
import styles from './InvoicesForm.module.css';
import axios from 'axios';
import DashboardNavbar from '../../utilities/DashboardNavbar/DashboardNavbar';


const generateInvoiceNo = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const date = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${year}${month}${date}-${hours}${minutes}${seconds}`;
};

const initialValues = {
  client: '',
  caseType: '',
  date: '',
  amount: '',
  taxType: '',
  taxPercentage: '',
  CumulativeAmount: '',
  fullAddress: '',
  hearingDate: '',
  title: '',
  dateFrom: '',
  dateTo: '',
  expensesAmount: '',
  expensesTaxType: '',
  expensesTaxPercentage: '',
  expensesCumulativeAmount: '',
  addDoc: '',
  totalAmount: '',
  invoiceNumber: generateInvoiceNo(),
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
  title: Yup.string(),
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


const InvoicesForm = () => {
  const [clientNames, setClientNames] = useState([]); // State to store client names
  const [caseTitles, setCaseTitles] = useState([]); // State to store case titles
  

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

    fetchClientNames(); // Call the fetchClientNames function when the component mounts
    fetchCaseTitles(); // Call the fetchCaseTitles function when the component mounts
  }, []);

  const handleSubmit = async (values, { resetForm }) => {
    try {
      // Make an HTTP POST request to the backend with the full server URL
      const response = await axios.post('http://localhost:8052/invoiceform', values, {
        headers: {
          'x-auth-token': localStorage.getItem('token'), // Get the token from localStorage or your authentication mechanism
        },
      });

      console.log(response.data); // Log the response from the backend
      alert('Invoice Added successfully!');
      resetForm();
    } catch (error) {
      console.error(error);
    }
  };

  const navigate = useNavigate();
  const HandleCancel=()=>{
    navigate('/dashboard')
  }


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

  



  return (
    <>
    <DashboardNavbar />
    <div className={styles.formContainer}>
    <h2 style={{textAlign:'center'}}>Generate Invoice's</h2>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, setFieldValue, values }) => (
          <Form>
            <div className={styles.invoiceNo}><span style={{ color: 'var(--color-primary)'}}>INV-</span>
  {generateInvoiceNo()}</div>
  
  <label className={styles.label} htmlFor="title">Title</label>
            <Field type="text" name="title" className={styles.inputFieldTitle} />
            <ErrorMessage name="title" component="div" className={styles.errorMessage} />
            


            <div className={styles.clientContainer}>
            <Field as="select" name="client" className={styles.selectFieldClient}>
                  <option value="">Select People</option>
                  {clientNames.map((clientName) => (
                    <option key={clientName} value={clientName}>
                      {clientName}
                    </option>
                  ))}
                </Field>
              <NavLink to="/dashboard/peopleform" className={styles.link}>
                Add new People
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
              <Field type="number" name="amount" className={styles.inputField} placeholder="Amount"  onChange={(e) => handleNormalChange(e, setFieldValue, values)}/>
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
                <Field 
  type="number" 
  name="expensesAmount" 
  className={styles.inputField} 
  placeholder="Amount"
  onChange={(e) => handleExpensesChange(e, setFieldValue, values)}
/>

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
              <Field 
  type="number" 
  name="expensesTaxPercentage" 
  className={styles.inputField} 
  placeholder="Tax Percentage"
  onChange={(e) => handleExpensesChange(e, setFieldValue, values)}
/>
<Field 
  type="number" 
  name="expensesCumulativeAmount" 
  className={styles.inputField} 
  placeholder="Cumulative Amount"
 
  readOnly
/>
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
            <Field type="file" name="addDoc" accept=".pdf" className={styles.fileField} />
            <ErrorMessage name="addDoc" component="div" className={styles.errorMessage} />
         
          <div className={styles.BtnContainer}>
            <button type="submit" className={styles.submitButton} disabled={isSubmitting}>Submit</button>
            <button type="submit" onClick={HandleCancel}   className={`${styles.submitButton}, ${styles.buttonCancel}`}  disabled={isSubmitting}>Cancel</button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
    </>
  );
};

export default InvoicesForm;
