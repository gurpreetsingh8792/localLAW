const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const app = express();
 const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const secretKey = 'your_secret_key';
const port = 8052;

// Connect to the SQLite database
let db = new sqlite3.Database('./Data_base/New-db/judgments5.db', sqlite3.OPEN_READWRITE, (err) => {
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
    const { title, startDate, completionDate, assignTo } = req.body;
    const userId = req.user.id;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    db.run('INSERT INTO AlertsForm (title, startDate, completionDate, assignTo, user_id) VALUES (?, ?, ?, ?, ?)', [title, startDate, completionDate, assignTo, userId], function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      return res.json({ message: 'Alerts form submitted successfully' });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.get('/alerts', authenticateJWT, (req, res) => {
  const userId = req.user.id;
  db.all('SELECT title, startDate, completionDate, assignTo FROM AlertsForm WHERE user_id = ?', [userId], (err, forms) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    return res.json(forms);
  });
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

  db.all('SELECT fullName, email, designation,selectedGroup FROM TeamMembers WHERE user_id = ?', [userId], (err, forms) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    return res.json(forms);
  });
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
  db.all('SELECT billNumber, title, dateFrom, dateTo, amount, totalAmountWithTax FROM BillForm WHERE user_id = ?', [userId], (err, forms) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    return res.json(forms);
  });
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
    db.all('SELECT title,caseCode,honorableJudge,client, opponentPartyName FROM CasesForm WHERE user_id = ?', [userId], (err, forms) => {
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


// POST endpoint to add a new client form
app.post('/clientform', authenticateJWT, async (req, res) => {
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
    db.all('SELECT firstName,email,mobileNo,assignAlerts,scheduleAppointment FROM ClientForm WHERE user_id = ?', [userId], (err, forms) => {
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
    const { groupName, priority } = req.body;
    const userId = req.user.id;

    if (!groupName || !priority) {
      return res.status(400).json({ error: 'Group name and priority are required' });
    }

    db.run('INSERT INTO GroupForm (groupName, priority, user_id) VALUES (?, ?, ?)', [groupName, priority, userId], function (err) {
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
  
  db.all('SELECT title, invoiceNumber , date, client,expensesCumulativeAmount FROM InvoicesForm WHERE user_id = ?', [userId], (err, forms) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    return res.json(forms);
  });
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

//Proxy Form endpoints
app.post('/proxy', authenticateJWT, async (req, res) => {
  try {
    const {
      fullName,
      streetAddress,
      city,
      zipStateProvince,
      zipPostalCode,
      date,
      caseFile,
      causeTitle,
      honorableJudge,
      courtNumber,
      type,
      timeOfHearing,
      dateOfHearing,
      comments
    } = req.body;
    const userId = req.user.id;

    if (!fullName || !zipPostalCode || !dateOfHearing || !courtNumber) {
      return res.status(400).json({ error: 'Required fields are missing' });
    }

    db.run('INSERT INTO ProxyForm (fullName, streetAddress, city, zipStateProvince, zipPostalCode, date, caseFile, causeTitle, honorableJudge, courtNumber, type, timeOfHearing, dateOfHearing, comments, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [fullName, streetAddress, city, zipStateProvince, zipPostalCode, date, caseFile, causeTitle, honorableJudge, courtNumber, type, timeOfHearing, dateOfHearing, comments, userId], function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      return res.json({ message: 'Proxy form submitted successfully' });
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

// Error handler middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
