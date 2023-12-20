const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const app = express();
 const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const secretKey = 'your_secret_key';
const ejs = require('ejs');
const pdf = require('html-pdf');
const fs = require('fs');
// const { Storage } = require('@google-cloud/storage');
const port = 8052;


// async function uploadFile() {
//   // Initialize the Google Cloud Storage client
//   const storage = new Storage({
//     keyFilename: '/path/to/your/keyfile.json', // Replace with your key file path
//     projectId: 'your-project-id', // Replace with your GCP project ID
//   });

  // Define the name of the bucket and file you want to upload
  // const bucketName = 'your-bucket-name';
  // const fileName = 'example.txt';
  // const fileContents = 'Hello, GCP!';

  // Reference to the Cloud Storage bucket
  // const bucket = storage.bucket(bucketName);
  
  // Reference to the file you want to upload
  // const file = bucket.file(fileName);

//   try {
//     // Upload the file to Cloud Storage
//     await file.save(fileContents);

//     console.log(`File ${fileName} uploaded to ${bucketName}.`);
//   } catch (err) {
//     console.error('Error uploading file:', err);
//   }
// }

// Call the function to upload the file
// uploadFile();
// Connect to the SQLite database
let db = new sqlite3.Database('../../../judgments5.db', sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error(err.message);
    throw err; // Stop further execution in this callback
  }
  
  console.log('Connected to the SQLite database.');
  // Create the users table if it doesn't exist
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,  
    hashed_password TEXT NOT NULL
  )`,
   (tableErr) => {
    if (tableErr) {
      console.error(tableErr.message);
      throw tableErr; // Stop further execution if there's an error
    }
    
    console.log('Table "users" ensured.');
  });
});


// Middleware for parsing JSON bodies and enabling CORS
app.use(express.json());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true
}));

// Authentication middleware
function authenticateJWT(req, res, next) {
  const token = req.header('x-auth-token');
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded;
    next();
  } catch (ex) {
    res.status(400).json({ error: 'Invalid token.' });
  } 
}

// Registration endpoint
app.post('/register', async (req, res) => {
  
  try {
    const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
    console.log(hashedPassword);
  db.run('INSERT INTO users (username, hashed_password) VALUES (?, ?)', [username, hashedPassword], function (err) {
      
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    const token = jwt.sign({ id: this.lastID, username }, secretKey);
    console.log(token)
    return res.header('x-auth-token', token).json({ message: 'User registered successfully', token });
  });

  } catch (error) {
    console.log(error);
  }
  
});

// Login endpoint
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  db.get('SELECT id, username, hashed_password FROM users WHERE username = ?', [username], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const validPassword = await bcrypt.compare(password, user.hashed_password);
    if (!validPassword) { 
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, secretKey);
    res.json({ token });
  });
});

// Protected route example
app.get('/protected-route', authenticateJWT, (req, res) => {
  res.json({ message: 'This is a protected route' });
});



// Endpoint to search in the database
app.get('/search', (req, res) => {
  const { searchTerm, category } = req.query;

  if (!searchTerm || !category) {
    return res.status(400).json({ error: "Missing searchTerm or category" });
  }

  let sql = '';
  const params = [`%${searchTerm}%`];

  switch (category) {
    case 'Advocate':
      sql = `SELECT * FROM judgments WHERE pet_adv LIKE ? OR res_adv LIKE ?`;
      params.push(`%${searchTerm}%`);
      break;
    case 'Judge':
      sql = `SELECT * FROM judgments WHERE judgement_by LIKE ?`;
      break;
    case 'case_no':
      sql = `SELECT * FROM judgments WHERE case_no LIKE ?`;
      break;
    default:
      return res.status(400).json({ error: "Invalid category" });
  }

  db.all(sql, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

app.get('/suggestions', (req, res, next) => {
  const { searchTerm, category } = req.query;
  if (!searchTerm || !category) {
    return res.status(400).json({ error: "Missing searchTerm or category" });
  }

  const queryMap = {
    'Advocate': `SELECT DISTINCT pet_adv AS name FROM judgments WHERE pet_adv LIKE ? UNION SELECT DISTINCT res_adv AS name FROM judgments WHERE res_adv LIKE ? LIMIT 20`,
    'Judge': `SELECT DISTINCT judgement_by AS name FROM judgments WHERE judgement_by LIKE ? LIMIT 20`,
    'case_no': `SELECT DISTINCT case_no AS name FROM judgments WHERE case_no LIKE ? LIMIT 20`
  };

  const sql = queryMap[category];
  if (!sql) {
    return res.status(400).json({ error: "Invalid category" });
  }

  const params = category === 'Advocate' ? [`%${searchTerm}%`, `%${searchTerm}%`] : [`%${searchTerm}%`];

  db.all(sql, params, (err, rows) => {
    if (err) {
      return next(err);
    }
    const suggestions = rows.map(row => row.name);
    res.json(suggestions);
  });
});


//advocate form
app.post('/advocate', authenticateJWT, async (req, res) => {
  try {
    const { hearingCourt, advocateName } = req.body;
    const userId = req.user.id;

    if (!hearingCourt || !advocateName) {
      return res.status(400).json({ error: 'Hearing court and advocate name are required' });
    }

    db.run('INSERT INTO AdvocateForm (hearingCourt, advocateName, user_id) VALUES (?, ?, ?)', [hearingCourt, advocateName, userId], function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      return res.json({ message: 'Advocate form submitted successfully' });
    });
  } catch (error) {
    console.log(error);
  }
});

// Retrieve advocate forms for the authenticated user
app.get('/advocate', authenticateJWT, (req, res) => {
  const userId = req.user.id;
  
  db.all('SELECT * FROM AdvocateForm WHERE user_id = ?', [userId], (err, forms) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    return res.json(forms);
  });
});

// after proxy form
app.post('/afterproxy', authenticateJWT, async (req, res) => {
  try {
    const { contactMethod, contactInfo } = req.body;
    const userId = req.user.id;

    if (!contactMethod) {
      return res.status(400).json({ error: 'Contact method is required' });
    }

    db.run('INSERT INTO AfterProxyForm (contactMethod, contactInfo, user_id) VALUES (?, ?, ?)', [contactMethod, contactInfo, userId], function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      return res.json({ message: 'After Proxy form submitted successfully' });
    });
  } catch (error) {
    console.log(error);
  }
});


// alerts forms
app.post('/alerts', authenticateJWT, async (req, res) => {
  try {
    const {title, startDate,completionDate,assignTo,caseTitle,statusType,priority} = req.body;
    const userId = req.user.id;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    db.run(
      'INSERT INTO AlertsForm (title, startDate, completionDate, assignTo, caseTitle, statusType, priority, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [title, startDate, completionDate, assignTo, caseTitle, statusType, priority, userId],
      function (err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        return res.json({ message: 'Alerts form submitted successfully' });
      }
    );
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/alerts', authenticateJWT, (req, res) => {
  const userId = req.user.id;
  db.all('SELECT id,title, startDate, completionDate, assignTo FROM AlertsForm WHERE user_id = ?', [userId], (err, forms) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    return res.json(forms);
  });
});
// Delete alert by ID
app.delete('/alerts/:alertId', authenticateJWT, async (req, res) => {
  try {
    const { alertId } = req.params;

    // Check if the alert with the given ID belongs to the authenticated user
    const alertExists = await db.get(
      'SELECT id FROM AlertsForm WHERE id = ? AND user_id = ?',
      [alertId, req.user.id]
    );

    if (!alertExists) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    // Delete the alert with the given ID
    await db.run('DELETE FROM AlertsForm WHERE id = ?', [alertId]);

    return res.json({ message: 'Alert deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Download alert PDF by ID
app.get('/alerts/download-pdf/:alertId', authenticateJWT, async (req, res) => {
  try {
    const { alertId } = req.params;

    // Check if the alert with the given ID belongs to the authenticated user
    const alertData = await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM AlertsForm WHERE id = ? AND user_id = ?',
        [alertId, req.user.id],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        }
      );
    });

    if (!alertData) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    // Define an HTML template for your PDF content (you can use a template engine like EJS)
    const template = `
    <html>
    <head>
      <title>Alert Data</title>
    </head>
    <body>
      <h1>Alert Data</h1>
      <p>Title: <%= title %></p>
      <p>Start Date: <%= startDate %></p>
      <p>Completion Date: <%= completionDate %></p>
      <p>Assign To: <%= assignTo %></p>
      <p>Case Title: <%= caseTitle %></p>
      <p>Priority: <%= priority %></p>
      <p>Status Type: <%= statusType %></p>
      <!-- Add more fields as needed -->
    </body>
  </html>
  
    `;

    // Compile the template with data
    const htmlContent = ejs.render(template, alertData);

    // Create a PDF from the HTML content
    pdf.create(htmlContent).toStream((err, stream) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error generating PDF' });
      }

      // Set the response headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=Alert_${alertData.id}.pdf`);

      // Pipe the PDF stream to the response
      stream.pipe(res);
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});





// endpoint = fetch in alert form only!
app.get('/dashboard/alert/teammembers', authenticateJWT, (req, res) => {
  try {
    const userId = req.user.id;
    db.all('SELECT fullName FROM TeamMembers WHERE user_id = ?', [userId], (err, fullName) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      return res.json(fullName);
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});


//Team Members form endpoints
app.post('/dashboard/teammemberform', authenticateJWT, async (req, res) => {
  try {
    const { image, fullName, email, designation, address, state, city, zipCode, selectedGroup } = req.body;
    const userId = req.user.id;

    db.run('INSERT INTO TeamMembers (image, fullName, email, designation, address, state, city, zipCode, selectedGroup, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [image, fullName, email, designation, address, state, city, zipCode, selectedGroup, userId], function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      return res.json({ message: 'Team member added successfully' });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/dashboard/teammemberform', authenticateJWT, (req, res) => {
  const userId = req.user.id;

  db.all('SELECT id,fullName, email, designation,selectedGroup FROM TeamMembers WHERE user_id = ?', [userId], (err, forms) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    return res.json(forms);
  });
});
app.delete('/dashboard/teammemberform/:memberId', authenticateJWT, async (req, res) => {
  try {
    const { memberId } = req.params;

    // Check if the team member with the given ID belongs to the authenticated user
    const memberExists = await db.get(
      'SELECT id FROM TeamMembers WHERE id = ? AND user_id = ?',
      [memberId, req.user.id]
    );

    if (!memberExists) {
      return res.status(404).json({ error: 'Team member not found' });
    }

    // Delete the team member with the given ID
    await db.run('DELETE FROM TeamMembers WHERE id = ?', [memberId]);

    return res.json({ message: 'Team member deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});
app.get('/dashboard/teammemberform/download-pdf/:memberId', authenticateJWT, async (req, res) => {
  try {
    const { memberId } = req.params;

    // Check if the team member with the given ID belongs to the authenticated user
    const memberData = await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM TeamMembers WHERE id = ? AND user_id = ?',
        [memberId, req.user.id],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        }
      );
    });

    if (!memberData) {
      return res.status(404).json({ error: 'Team member not found' });
    }

    // Define an HTML template for your PDF content (you can use a template engine like EJS)
    const template = `
    <html>
    <head>
      <title>Team Member Data</title>
    </head>
    <body>
      <h1>Team Member Data</h1>
      <p>Full Name: <%= fullName %></p>
      <p>Email: <%= email %></p>
      <p>Designation: <%= designation %></p>
      <p>Address: <%= address %></p>
      <p>State: <%= state %></p>
      <p>City: <%= city %></p>
      <p>Zip Code: <%= zipCode %></p>
      <p>Selected Group: <%= selectedGroup %></p>
    </body>
  </html>
    `;

    // Compile the template with data
    const htmlContent = ejs.render(template, memberData);

    // Create a PDF from the HTML content
    pdf.create(htmlContent).toStream((err, stream) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error generating PDF' });
      }

      // Set the response headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=TeamMember_${memberData.id}.pdf`);

      // Pipe the PDF stream to the response
      stream.pipe(res);
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});




app.get('/dashboard/groupform', authenticateJWT, (req, res) => {
  try {
    const userId = req.user.id;
    db.all('SELECT groupName FROM GroupForm WHERE user_id = ?', [userId], (err, groupName) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      return res.json(groupName);
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});





//appointmentForm
app.post('/appointment', authenticateJWT, async (req, res) => {
  try {
    const {
      title,client,email,mobile,date,time,roomNo,assignedBy,assignedTo,followUpDate,followUpTime,description,} = req.body;

    const userId = req.user.id;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    db.run(
      'INSERT INTO AppointmentForm (title, client, email, mobile, date, time, roomNo, assignedBy, assignedTo, followUpDate, followUpTime, description, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        title,client,email,mobile,date,time,roomNo,assignedBy,assignedTo,followUpDate,followUpTime,description,userId,
      ],
      function (err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        return res.json({ message: 'Appointment form submitted successfully' });
      }
    );
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});
app.get('/dashboard/clientform', authenticateJWT, (req, res) => {
  try {
    const userId = req.user.id;
    db.all('SELECT firstName FROM ClientForm WHERE user_id = ?', [userId], (err, firstName) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      return res.json(firstName);
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});




// POST Endpoint for Submitting Bill Form
app.post('/bill', authenticateJWT, async (req, res) => {
  try {
    const {
      billNumber,title,currentDate,dateFrom,dateTo,fullAddress,billingType,totalHours,noOfHearings,totalAmount,amount,taxType,taxPercentage,totalAmountWithTax,description,addDoc,} = req.body;

    const userId = req.user.id;

    if (!billNumber || !title) {
      return res.status(400).json({ error: 'Bill number and title are required' });
    }
    db.run(
      'INSERT INTO BillForm (billNumber, title, currentDate, dateFrom, dateTo, fullAddress, billingType, totalHours, noOfHearings, totalAmount, amount, taxType, taxPercentage, totalAmountWithTax, description, addDoc, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        billNumber,title,currentDate,dateFrom,dateTo,fullAddress,billingType, totalHours,noOfHearings,totalAmount,amount,taxType,taxPercentage,totalAmountWithTax,description,addDoc,userId,
      ],
      function (err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        return res.json({ message: 'Bill form submitted successfully' });
      }
    );
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});
app.get('/billdata', authenticateJWT, (req, res) => {
  const userId = req.user.id;
  db.all('SELECT id,billNumber, title, dateFrom, dateTo, amount, totalAmountWithTax FROM BillForm WHERE user_id = ?', [userId], (err, forms) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    return res.json(forms);
  });
});
app.delete('/billdata/:billId', authenticateJWT, async (req, res) => {
  try {
    const { billId } = req.params;

    // Check if the bill with the given ID belongs to the authenticated user
    const billExists = await db.get(
      'SELECT id FROM BillForm WHERE id = ? AND user_id = ?',
      [billId, req.user.id]
    );

    if (!billExists) {
      return res.status(404).json({ error: 'Bill not found' });
    }

    // Delete the bill with the given ID
    await db.run('DELETE FROM BillForm WHERE id = ?', [billId]);

    return res.json({ message: 'Bill deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Download bill PDF by ID
app.get('/billdata/download-pdf/:billId', authenticateJWT, async (req, res) => {
  try {
    const { billId } = req.params;

    // Check if the bill with the given ID belongs to the authenticated user
    const billData = await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM BillForm WHERE id = ? AND user_id = ?',
        [billId, req.user.id],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        }
      );
    });

    if (!billData) {
      return res.status(404).json({ error: 'Bill not found' });
    }

    // Define an HTML template for your PDF content (you can use a template engine like EJS)
    const template = `
    <html>
  <head>
    <title>Bill Data</title>
  </head>
  <body>
    <h1>Bill Data</h1>
    <p>Bill Number: <%= billNumber %></p>
    <p>Title: <%= title %></p>
    <p>Current Date: <%= currentDate %></p>
    <p>Date From: <%= dateFrom %></p>
    <p>Date To: <%= dateTo %></p>
    <p>Full Address: <%= fullAddress %></p>
    <p>Billing Type: <%= billingType %></p>
    <p>Total Hours: <%= totalHours %></p>
    <p>No. of Hearings: <%= noOfHearings %></p>
    <p>Total Amount: <%= totalAmount %></p>
    <p>Amount: <%= amount %></p>
    <p>Tax Type: <%= taxType %></p>
    <p>Tax Percentage: <%= taxPercentage %></p>
    <p>Total Amount With Tax: <%= totalAmountWithTax %></p>
    <p>Description: <%= description %></p>
    <!-- Add more fields as needed -->
  </body>
</html>

    `;

    // Compile the template with data
    const htmlContent = ejs.render(template, billData);

    // Create a PDF from the HTML content
    pdf.create(htmlContent).toStream((err, stream) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error generating PDF' });
      }

      // Set the response headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=Bill_${billData.id}.pdf`);

      // Pipe the PDF stream to the response
      stream.pipe(res);
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});



// POST endpoint to add a new case form
app.post('/caseform', authenticateJWT, async (req, res) => {
  try {
    const {
      title,caseType,courtType,courtName,caveatNo,caseCode,caseURL,caseStatus,honorableJudge,courtHallNo,cnrNo,batchNo,dateOfFiling,practiceArea,manage,client,team,clientDesignation, opponentPartyName,lawyerName,mobileNo,emailId,} = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Title is a required field' });
    }
    const userId = req.user.id;

    const query = `
      INSERT INTO CasesForm (
        title, caseType, courtType, courtName, caveatNo, caseCode, caseURL, caseStatus,
        honorableJudge, courtHallNo, cnrNo, batchNo, dateOfFiling, practiceArea, manage,
        client, team, clientDesignation, opponentPartyName, lawyerName, mobileNo, emailId, user_id
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(
      query,
      [
        title,caseType,courtType,courtName,caveatNo,caseCode,caseURL,caseStatus,honorableJudge,courtHallNo,cnrNo,batchNo,dateOfFiling, practiceArea, manage,client,team,clientDesignation,opponentPartyName,lawyerName,mobileNo,emailId,userId,
      ],
      function (err) {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Internal Server Error' });
        }
        return res.json({ message: 'CasesForm submitted successfully' });
      }
    );
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});
app.get('/caseformdata', authenticateJWT, (req, res) => {
  try {
    const userId = req.user.id;
    db.all('SELECT id,title,caseCode,honorableJudge,client, opponentPartyName FROM CasesForm WHERE user_id = ?', [userId], (err, forms) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      return res.json(forms);
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});
app.get('/clientform', authenticateJWT, (req, res) => {
  try {
    const userId = req.user.id;
    db.all('SELECT firstName FROM ClientForm WHERE user_id = ?', [userId], (err, firstName) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      return res.json(firstName);
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/teammemberform', authenticateJWT, (req, res) => {
  try {
    const userId = req.user.id;
    db.all('SELECT fullName FROM TeamMembers WHERE user_id = ?', [userId], (err, fullName) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      return res.json(fullName);
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});
app.delete('/dashboard/caseformdata/:caseId', authenticateJWT, async (req, res) => {
  try {
    const { caseId } = req.params;
    const userId = req.user.id;

    // Check if the case with the given ID belongs to the authenticated user
    const caseExists = await db.get(
      'SELECT id FROM CasesForm WHERE id = ? AND user_id = ?',
      [caseId, userId]
    );

    if (!caseExists) {
      return res.status(404).json({ error: 'Case not found' });
    }

    // Delete the case with the given ID
    await db.run('DELETE FROM CasesForm WHERE id = ?', [caseId]);

    return res.json({ message: 'Case deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});
app.get('/dashboard/caseformdata/download-pdf/:caseId', authenticateJWT, async (req, res) => {
  try {
    const { caseId } = req.params;
    const userId = req.user.id;

    // Check if the case with the given ID belongs to the authenticated user
    const caseData = await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM CasesForm WHERE id = ? AND user_id = ?',
        [caseId, userId],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        }
      );
    });

    console.log('Fetched Case Data:', caseData);

    if (!caseData) {
      return res.status(404).json({ error: 'Case not found' });
    }

    // Define an HTML template for your PDF content (you can use a template engine like EJS)
    const template = `
      <html>
        <head>
          <title>Case Data</title>
        </head>
        <body>
          <h1>Case Data</h1>
          <p>Title: <%= title %></p>
          <p>Case Type: <%= caseType %></p>
          <p>Court Type: <%= courtType %></p>
          <p>Court Name: <%= courtName %></p>
          <p>Caveat No: <%= caveatNo %></p>
          <p>Case Code: <%= caseCode %></p>
          <p>Case URL: <%= caseURL %></p>
          <p>Case Status: <%= caseStatus %></p>
          <p>Honorable Judge: <%= honorableJudge %></p>
          <p>Court Hall No: <%= courtHallNo %></p>
          <p>CNR No: <%= cnrNo %></p>
          <p>Batch No: <%= batchNo %></p>
          <p>Date of Filing: <%= dateOfFiling %></p>
          <p>Practice Area: <%= practiceArea %></p>
          <p>Manage: <%= manage %></p>
          <p>Client: <%= client %></p>
          <p>Team: <%= team %></p>
          <p>Client Designation: <%= clientDesignation %></p>
          <p>Opponent Party Name: <%= opponentPartyName %></p>
          <p>Lawyer Name: <%= lawyerName %></p>
          <p>Mobile No: <%= mobileNo %></p>
          <p>Email Id: <%= emailId %></p>
        </body>
      </html>
    `;

    // Compile the template with data
    const htmlContent = ejs.render(template, caseData);

    // Create a PDF from the HTML content
    pdf.create(htmlContent).toStream((err, stream) => {
      if (err) {
        console.error(err);
        
        return res.status(500).json({ error: 'Error generating PDF' });
      }

      // Set the response headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=Case_${caseData.id}.pdf`);

      // Pipe the PDF stream to the response
      stream.pipe(res);

      // Close the database connection after sending the response
      
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});




// POST endpoint to add a new client form
app.post('/dashboard/clientform', authenticateJWT, async (req, res) => {
  try {
    const {
      firstName,lastName,email,mobileNo,alternateMobileNo,organizationName,organizationType,organizationWebsite,gstNo,panNo,homeAddress,officeAddress,assignAlerts,scheduleAppointment,} = req.body;
    if (!firstName || !email) {
      return res.status(400).json({ error: 'First Name and Email are required fields' });
    }
    const userId = req.user.id;
    const query = `
      INSERT INTO ClientForm (
        firstName, lastName, email, mobileNo, alternateMobileNo, organizationName, 
        organizationType, organizationWebsite, gstNo, panNo, homeAddress, officeAddress, 
        assignAlerts, scheduleAppointment, user_id
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(
      query,
      [
        firstName,lastName,email,mobileNo,alternateMobileNo,organizationName,organizationType,organizationWebsite,gstNo,panNo,homeAddress,officeAddress,assignAlerts,scheduleAppointment,userId,
      ],
      function (err) {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Internal Server Error' });
        }
        return res.json({ message: 'ClientForm submitted successfully' });
      }
    );
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/clientformdata', authenticateJWT, (req, res) => {
  try {
    const userId = req.user.id;
    db.all('SELECT id,firstName,email,mobileNo,assignAlerts,scheduleAppointment FROM ClientForm WHERE user_id = ?', [userId], (err, forms) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      return res.json(forms);
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});
app.delete('/clientformdata/:clientId', authenticateJWT, async (req, res) => {
  try {
    const { clientId } = req.params;

    // Check if the client with the given ID belongs to the authenticated user
    const clientExists = await db.get(
      'SELECT id FROM ClientForm WHERE id = ? AND user_id = ?',
      [clientId, req.user.id]
    );

    if (!clientExists) {
      return res.status(404).json({ error: 'Client not found' });
    }

    // Delete the client with the given ID
    await db.run('DELETE FROM ClientForm WHERE id = ?', [clientId]);

    return res.json({ message: 'Client deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Download client PDF by ID
app.get('/clientformdata/download-pdf/:clientId', authenticateJWT, async (req, res) => {
  try {
    const { clientId } = req.params;

    // Check if the client with the given ID belongs to the authenticated user
    const clientData = await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM ClientForm WHERE id = ? AND user_id = ?',
        [clientId, req.user.id],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        }
      );
    });

    if (!clientData) {
      return res.status(404).json({ error: 'Client not found' });
    }

    // Define an HTML template for your PDF content (you can use a template engine like EJS)
    const template = `
    <html>
    <head>
      <title>Client Data</title>
    </head>
    <body>
      <h1>Client Data</h1>
      <p>First Name: <%= firstName %></p>
      <p>Last Name: <%= lastName %></p>
      <p>Email: <%= email %></p>
      <p>Mobile No: <%= mobileNo %></p>
      <p>Alternate Mobile No: <%= alternateMobileNo %></p>
      <p>Organization Name: <%= organizationName %></p>
      <p>Organization Type: <%= organizationType %></p>
      <p>Organization Website: <%= organizationWebsite %></p>
      <p>GST No: <%= gstNo %></p>
      <p>PAN No: <%= panNo %></p>
      <p>Home Address: <%= homeAddress %></p>
      <p>Office Address: <%= officeAddress %></p>
      <p>Assign Alerts: <%= assignAlerts %></p>
      <p>Schedule Appointment: <%= scheduleAppointment %></p>
    </body>
  </html>
    `;

    // Compile the template with data
    const htmlContent = ejs.render(template, clientData);

    // Create a PDF from the HTML content
    pdf.create(htmlContent).toStream((err, stream) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error generating PDF' });
      }

      // Set the response headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=Client_${clientData.id}.pdf`);

      // Pipe the PDF stream to the response
      stream.pipe(res);
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});




app.get('/dashboard/alertsform', authenticateJWT, (req, res) => {
  try {
    const userId = req.user.id;
    db.all('SELECT title FROM AlertsForm WHERE user_id = ?', [userId], (err, title) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      return res.json(title);
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});


// POST endpoint to add a new CNR form
app.post('/cnr', authenticateJWT, async (req, res) => {
  try {
    const { hearingCourt, caseType, caseNo, caseYear } = req.body;
    const userId = req.user.id;

    if (!hearingCourt || !caseType || !caseNo || !caseYear) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    const query = `
      INSERT INTO CnrForm (hearingCourt, caseType, caseNo, caseYear, user_id)
      VALUES (?, ?, ?, ?, ?)
    `;

    db.run(
      query,
      [hearingCourt, caseType, caseNo, caseYear, userId],
      function (err) {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Internal Server Error' });
        }
        return res.json({ message: 'CNR form submitted successfully' });
      }
    );
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});


//Group form endpoints
app.post('/dashboard/groupform', authenticateJWT, async (req, res) => {
  try {
    const { groupName, company, priority } = req.body;
    const userId = req.user.id;

    if (!groupName || !priority) {
      return res.status(400).json({ error: 'Group name and priority are required' });
    }

    db.run('INSERT INTO GroupForm (groupName, company, priority, user_id) VALUES (?, ?, ?, ?)', [groupName, company, priority, userId], function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      return res.json({ message: 'Group form submitted successfully' });
    });
  } catch (error) {
    console.log(error);
  }
});


//Invoice Form endpoints
app.post('/invoiceform', authenticateJWT, async (req, res) => {
  try {
    const {
      invoiceNumber,client,caseType,date,amount,taxType,taxPercentage,fullAddress,hearingDate,title,dateFrom,dateTo,expensesAmount,expensesTaxType,expensesTaxPercentage,expensesCumulativeAmount,addDoc} = req.body;
    const userId = req.user.id;

    if (!invoiceNumber ||  !title) {
      return res.status(400).json({ error: 'Required fields are missing' });
    }

    db.run('INSERT INTO InvoicesForm (invoiceNumber, client, caseType, date, amount, taxType, taxPercentage, fullAddress, hearingDate, title, dateFrom, dateTo, expensesAmount, expensesTaxType, expensesTaxPercentage, expensesCumulativeAmount, addDoc, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [invoiceNumber, client, caseType, date, amount, taxType, taxPercentage, fullAddress, hearingDate, title, dateFrom, dateTo, expensesAmount, expensesTaxType, expensesTaxPercentage, expensesCumulativeAmount, addDoc, userId], function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      return res.json({ message: 'Invoice form submitted successfully' });
    });
  } catch (error) {
    console.log(error);
  }
});

app.get('/invoiceformdata', authenticateJWT, (req, res) => {
  const userId = req.user.id;
  
  db.all('SELECT id,title, invoiceNumber , date, client,expensesCumulativeAmount FROM InvoicesForm WHERE user_id = ?', [userId], (err, forms) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    return res.json(forms);
  });
});
app.delete('/invoiceformdata/:invoiceId', authenticateJWT, async (req, res) => {
  try {
    const { invoiceId } = req.params;

    // Check if the invoice with the given ID belongs to the authenticated user
    const invoiceExists = await db.get(
      'SELECT id FROM InvoicesForm WHERE id = ? AND user_id = ?',
      [invoiceId, req.user.id]
    );

    if (!invoiceExists) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Delete the invoice with the given ID
    await db.run('DELETE FROM InvoicesForm WHERE id = ?', [invoiceId]);

    return res.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Download invoice PDF by ID
app.get('/invoiceformdata/download-pdf/:invoiceId', authenticateJWT, async (req, res) => {
  try {
    const { invoiceId } = req.params;

    // Check if the invoice with the given ID belongs to the authenticated user
    const invoiceData = await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM InvoicesForm WHERE id = ? AND user_id = ?',
        [invoiceId, req.user.id],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        }
      );
    });

    if (!invoiceData) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Define an HTML template for your PDF content (you can use a template engine like EJS)
    const template = `
    <html>
<head>
  <title>Invoice Data</title>
</head>
<body>
  <h1>Invoice Data</h1>
  <p>Title: <%= title %></p>
  <p>Invoice Number: <%= invoiceNumber %></p>
  <p>Date: <%= date %></p>
  <p>Client: <%= client %></p>
  <p>Case Type: <%= caseType %></p>
  <p>Amount: <%= amount %></p>
  <p>Tax Type: <%= taxType %></p>
  <p>Tax Percentage: <%= taxPercentage %></p>
  <p>Full Address: <%= fullAddress %></p>
  <p>Hearing Date: <%= hearingDate %></p>
  <p>Date From: <%= dateFrom %></p>
  <p>Date To: <%= dateTo %></p>
  <p>Expenses Amount: <%= expensesAmount %></p>
  <p>Expenses Tax Type: <%= expensesTaxType %></p>
  <p>Expenses Tax Percentage: <%= expensesTaxPercentage %></p>
  <p>Expenses Cumulative Amount: <%= expensesCumulativeAmount %></p>
  <!-- Add more fields as needed -->
</body>
</html>
    `;

    // Compile the template with data
    const htmlContent = ejs.render(template, invoiceData);

    // Create a PDF from the HTML content
    pdf.create(htmlContent).toStream((err, stream) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error generating PDF' });
      }

      // Set the response headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=Invoice_${invoiceData.id}.pdf`);

      // Pipe the PDF stream to the response
      stream.pipe(res);
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});





app.get('/clientform', authenticateJWT, (req, res) => {
  try {
    const userId = req.user.id;
    db.all('SELECT firstName FROM ClientForm WHERE user_id = ?', [userId], (err, firstName) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      return res.json(firstName);
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});
app.get('/caseform', authenticateJWT, (req, res) => {
  try {
    const userId = req.user.id;
    db.all('SELECT title FROM CasesForm WHERE user_id = ?', [userId], (err, title) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      return res.json(title);
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

//party Name form endpoints
app.post('/partyname', authenticateJWT, async (req, res) => {
  try {
    const { hearingCourt, partyName, caseYear } = req.body;
    const userId = req.user.id;

    if (!hearingCourt || !partyName || !caseYear) {
      return res.status(400).json({ error: 'Hearing court, party name, and case year are required' });
    }

    db.run('INSERT INTO PartyNameForm (hearingCourt, partyName, caseYear, user_id) VALUES (?, ?, ?, ?)', [hearingCourt, partyName, caseYear, userId], function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      return res.json({ message: 'Party name form submitted successfully' });
    });
  } catch (error) {
    console.log(error);
  }
});





//review doc form endpoints
app.post('/reviewdoc', authenticateJWT, async (req, res) => {
  try {
    const { reviewMethod, contactMethod, file, text, mobileNo } = req.body;
    const userId = req.user.id;

    if (!reviewMethod || !contactMethod) {
      return res.status(400).json({ error: 'Review method and contact method are required' });
    }

    db.run('INSERT INTO ReviewDocForm (reviewMethod, contactMethod, file, text, mobileNo, user_id) VALUES (?, ?, ?, ?, ?, ?)', [reviewMethod, contactMethod, file, text, mobileNo, userId], function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      return res.json({ message: 'Review document form submitted successfully' });
    });
  } catch (error) {
    console.log(error);
  }
});
// NOTIFICATIONS FOR ALERTS
app.get('/dashboard/user/notifications', authenticateJWT, (req, res) => {
  const userId = req.user.id; 
  const currentDate = new Date();
  const threeDaysAhead = new Date();
  threeDaysAhead.setDate(currentDate.getDate() + 15); 

  console.log('userId:', userId);
  console.log('currentDate:', currentDate.toISOString());
  console.log('threeDaysAhead:', threeDaysAhead.toISOString());

  db.all(
    'SELECT id, title, completionDate FROM AlertsForm WHERE user_id = ?',
    [userId],
    (err, rows) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      try {
        
        const notifications = [];

        
        rows.forEach((row) => {
        
          const completionDate = new Date(row.completionDate);

        
          const daysDifference = Math.floor(
            (completionDate - currentDate) / (24 * 60 * 60 * 1000)
          );

         
          if (daysDifference <= 15 && daysDifference >= 0) {
            const notificationMessage = `Few days left for Task ${row.title} Completion. Completion Date is   ${row.completionDate}`;

            
            const expirationDate = new Date();
            expirationDate.setDate(expirationDate.getDate() + 15); 

            
            db.run(
              'INSERT OR REPLACE INTO NotificationTable (userId, message, expirationDate) VALUES (?, ?, ?)',
              [userId, notificationMessage, expirationDate.toISOString()],
              (err) => {
                if (err) {
                  console.error('Database error:', err);
                } else {
                  console.log('Notification stored in NotificationTable.');
                }
              }
            );

            notifications.push(notificationMessage);
          }
        });

        console.log('Retrieved rows:', rows);

        return res.json(notifications);
      } catch (error) {
        console.error('Processing error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  );
});
// notifications for proxy
app.post('/proxy', authenticateJWT, async (req, res) => {
  const userId = req.user.id;
  const currentDate = new Date().toISOString();
  const expirationDate = new Date(req.body.dateOfHearing).toISOString(); 

  try {
    const {
      fullName,
      streetAddress,
      city,
      zipStateProvince,
      zipPostalCode,
      date,
      case: caseDescription, 
      causeTitle,
      honorableJudge,
      courtNumber,
      type,
      timeOfHearing,
      dateOfHearing,
      comments,
    } = req.body;

    // Insert proxy into ProxyForm table
    db.run(
      `INSERT INTO ProxyForm (
        fullName,
        streetAddress,
        city,
        zipStateProvince,
        zipPostalCode,
        date,
        caseDescription,
        causeTitle,
        honorableJudge,
        courtNumber,
        type,
        timeOfHearing,
        dateOfHearing,
        comments,
        user_id,
        expirationDate
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        fullName,
        streetAddress,
        city,
        zipStateProvince,
        zipPostalCode,
        date,
        caseDescription,
        causeTitle,
        honorableJudge,
        courtNumber,
        type,
        timeOfHearing,
        dateOfHearing,
        comments,
        userId,
        expirationDate,
      ],
      (err) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Internal Server Error' });
        }

        
        const notificationMessage = `You have created a new proxy for a hearing on ${req.body.dateOfHearing}`;
        db.run(
          'INSERT INTO NotificationTable (userId, message, expirationDate) VALUES (?, ?, ?)',
          [userId, notificationMessage, expirationDate],
          (err) => {
            if (err) {
              console.error('Database error:', err);
            }
          }
        );

        return res.status(201).json({ message: 'Proxy created successfully' });
      }
    );
  } catch (error) {
    console.error('Processing error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});
// Endpoint to list proxy notifications
app.get('/dashboard/user/proxy-notifications', authenticateJWT, (req, res) => {
  const userId = req.user.id; 
  const currentDate = new Date().toISOString();

  db.all(
    'SELECT id, fullName, dateOfHearing, expirationDate, status, zipStateProvince, city FROM ProxyForm WHERE user_id != ? AND expirationDate > ? AND status = "pending"',
    [userId, currentDate],
    (err, rows) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      try {
       
        const notifications = rows.map((row) => {
          const { fullName, dateOfHearing, zipStateProvince, city } = row;
          return `The proxy has been generated by ${fullName}. The date of hearing is ${dateOfHearing} in state ${zipStateProvince} City - ${city}`;
        });

        return res.json(notifications);
      } catch (error) {
        console.error('Processing error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  );
});


// Endpoint to accept a proxy
app.post('/dashboard/user/accept-proxy/:proxyId', authenticateJWT, (req, res) => {
  const userId = req.user.id; 
  const proxyId = req.params.proxyId;

  
  const acceptanceDate = new Date().toISOString();

  db.run(
    'UPDATE ProxyForm SET status = "accepted", acceptanceDate = ? WHERE id = ? AND user_id != ? AND status = "pending"',
    [acceptanceDate, proxyId, userId],
    (err) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
     
      db.get(
        'SELECT user_id, fullName, dateOfHearing, expirationDate FROM ProxyForm WHERE id = ?',
        [proxyId],
        (err, row) => {
          if (err) {
            console.error('Database error:', err);
          } else {
            if (row.user_id) {
              
              const creatorNotificationMessage = `Your proxy for hearing on ${row.dateOfHearing} in state ${req.body.zipStateProvince}, City ${req.body.city} has been accepted by user ${req.user.username}`;
              db.run(
                'INSERT INTO NotificationTable (userId, message, expirationDate) VALUES (?, ?, ?)',
                [row.user_id, creatorNotificationMessage, row.expirationDate],
                (err) => {
                  if (err) {
                    console.error('Database error:', err);
                  }
                }
              );
            }
          }
        }
      );

      return res.json({ message: 'Proxy accepted successfully' });
    }
  );
});


// Error handler middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
