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
let db = new sqlite3.Database('./Db-data/judgments5.db', sqlite3.OPEN_READWRITE, (err) => {
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

//get endpoint to render data on edit form
app.get('/alerts/edit', authenticateJWT, (req, res) => {
  const userId = req.user.id;

  db.all(
    'SELECT id, title, startDate, completionDate, caseTitle, caseType, assignFrom, assignTo FROM AlertsForm WHERE user_id = ?',
    [userId],
    (err, alertForms) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      return res.json(alertForms);
    }
  );
});

//update endpoint to update the render data on edit form
app.put('/alerts/edit/update/:alertId', authenticateJWT, (req, res) => {
  const alertId = req.params.alertId;
  const userId = req.user.id;
  const {
    title, startDate, completionDate, caseTitle, caseType, assignFrom, assignTo
  } = req.body;

  db.run(
    'UPDATE AlertsForm SET title = ?, startDate = ?, completionDate = ?, caseTitle = ?, caseType = ?, assignFrom = ?, assignTo = ? WHERE id = ? AND user_id = ?',
    [title, startDate, completionDate, caseTitle, caseType, assignFrom, assignTo, alertId, userId],
    (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json({ message: 'Alert form updated successfully' });
    }
  );
});


// alerts forms
app.post('/alerts', authenticateJWT, async (req, res) => {
  try {
    const { title, startDate, completionDate, assignFrom, assignTo, caseTitle, caseType } = req.body;
    const userId = req.user.id;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    db.run(
      'INSERT INTO AlertsForm (title, startDate, completionDate, assignFrom, assignTo, caseTitle, caseType, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [title, startDate, completionDate, assignFrom, assignTo, caseTitle, caseType, userId],
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

app.post('/hearings', authenticateJWT, (req, res) => {
  try {
    const { title, assignedLawyer, status, caseTitle, hearingDate, startTime, endTime } = req.body;
    const userId = req.user.id; // Assuming you have user information attached to the request

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    db.run(
      'INSERT INTO CourtHearing (title, assignedLawyer, status, caseTitle, hearingDate, startTime, endTime, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [title, assignedLawyer, status, caseTitle, hearingDate, startTime, endTime, userId],
      function (err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        return res.json({ message: 'Hearing form submitted successfully' });
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/appointments', authenticateJWT, (req, res) => {
  try {
    const {title, caseTitle, caseType,  appointmentDate, contactPerson, location, startTime, endTime, email} = req.body;

    const userId = req.user.id; // Assuming you have user information attached to the request

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    db.run(
      'INSERT INTO Appointments (title, caseTitle, caseType, appointmentDate, contactPerson, location, startTime, endTime, email, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [title, caseTitle, caseType,  appointmentDate, contactPerson, location, startTime, endTime, email, userId],
      function (err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        return res.json({ message: 'Apointment added successfully' });
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get("/calendar/alerts", authenticateJWT, (req, res) => {
  const userId = req.user.id;

  db.all(
    "SELECT id, title, startDate, completionDate, assignTo, caseTitle, caseType FROM AlertsForm WHERE user_id = ?",
    [userId],
    (err, forms) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      return res.json(forms);
    }
  );
});

app.get("/calendar/hearings", authenticateJWT, (req, res) => {
  const userId = req.user.id;

  db.all(
    "SELECT id, title, assignedLawyer, status, hearingDate, caseTitle, startTime, endTime FROM CourtHearing WHERE user_id = ?",
    [userId],
    (err, forms) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      return res.json(forms);
    }
  );
});

app.get("/calendar/appointments", authenticateJWT, (req, res) => {
  const userId = req.user.id;

  db.all(
    "SELECT id, title, caseTitle, caseType, appointmentDate, contactPerson, location, startTime, endTime, email FROM Appointments WHERE user_id = ?",
    [userId],
    (err, forms) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      return res.json(forms);
    }
  );
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

app.get('/calendar/alerts/:taskId', authenticateJWT, (req, res) => {
  const taskId = req.params.taskId;
  const userId = req.user.id;

  db.get(
    'SELECT id, title, startDate, completionDate, caseTitle, caseType, assignFrom, assignTo FROM AlertsForm WHERE id = ? AND user_id = ?',
    [taskId, userId],
    (err, event) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }

      res.json(event);
    }
  );
});

app.get('/calendar/hearings/:taskId', authenticateJWT, (req, res) => {
  const taskId = req.params.taskId;
  const userId = req.user.id;

  db.get(
    'SELECT id, title, assignedLawyer, status, hearingDate, caseTitle, startTime, endTime FROM CourtHearing WHERE id = ? AND user_id = ?',
    [taskId, userId],
    (err, event) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }

      res.json(event);
    }
  );
});

app.get('/calendar/appointments/:taskId', authenticateJWT, (req, res) => {
  const taskId = req.params.taskId;
  const userId = req.user.id;

  db.get(
    'SELECT id, title, caseTitle, caseType,  appointmentDate, contactPerson, location, startTime, endTime, email FROM Appointments WHERE id = ? AND user_id = ?',
    [taskId, userId],
    (err, event) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }

      res.json(event);
    }
  );
});

// Update a specific task event by ID
app.put('/calendar/alerts/:taskId', authenticateJWT, (req, res) => {
  const taskId = req.params.taskId;
  const userId = req.user.id;
  const { title, startDate, completionDate, caseTitle, caseType, assignFrom, assignTo } = req.body;

  db.run(
    'UPDATE AlertsForm SET title = ?, startDate = ?, completionDate = ?, caseTitle = ?, caseType = ?, assignFrom = ?, assignTo = ? WHERE id = ? AND user_id = ?',
    [title, startDate, completionDate, caseTitle, caseType, assignFrom, assignTo, taskId, userId],
    (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json({ message: 'Event updated successfully' });
    }
  );
});

app.put('/calendar/hearings/:taskId', authenticateJWT, (req, res) => {
  const taskId = req.params.taskId;
  const userId = req.user.id;
  const { title, assignedLawyer, status, hearingDate, caseTitle, startTime, endTime } = req.body;

  db.run(
    'UPDATE CourtHearing SET title = ?, assignedLawyer = ?, status = ?, hearingDate = ?, caseTitle = ?, startTime = ?, endTime = ? WHERE id = ? AND user_id = ?',
    [title, assignedLawyer, status, hearingDate, caseTitle, startTime, endTime, taskId, userId],
    (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json({ message: 'Event updated successfully' });
    }
  );
});

app.put('/calendar/appointments/:taskId', authenticateJWT, (req, res) => {
  const taskId = req.params.taskId;
  const userId = req.user.id;
  const { title, caseTitle, caseType,  appointmentDate, contactPerson, location, startTime, endTime, email } = req.body;

  db.run(
    'UPDATE Appointments SET title = ?, caseTitle = ?, caseType = ?,  appointmentDate = ?, contactPerson = ?, location = ?, startTime = ?, endTime = ?, email = ? WHERE id = ? AND user_id = ?',
    [title, caseTitle, caseType,  appointmentDate, contactPerson, location, startTime, endTime, email, userId],
    (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json({ message: 'Event updated successfully' });
    }
  );
});


// Delete a specific task event by ID
app.delete('/calendar/alerts/:taskId', authenticateJWT, (req, res) => {
  const taskId = req.params.taskId;
  const userId = req.user.id;

  db.run('DELETE FROM AlertsForm WHERE id = ? AND user_id = ?', [taskId, userId], (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json({ message: 'Event deleted successfully' });
  });
});

app.delete('/calendar/hearings/:taskId', authenticateJWT, (req, res) => {
  const taskId = req.params.taskId;
  const userId = req.user.id;

  db.run('DELETE FROM CourtHearing WHERE id = ? AND user_id = ?', [taskId, userId], (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json({ message: 'Event deleted successfully' });
  });
});

app.delete('/calendar/appointments/:taskId', authenticateJWT, (req, res) => {
  const taskId = req.params.taskId;
  const userId = req.user.id;

  db.run('DELETE FROM Appointments WHERE id = ? AND user_id = ?', [taskId, userId], (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json({ message: 'Event deleted successfully' });
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
      <style>
      
    </style>
    </head>
    <body>
      <h1>Alert Data</h1>
      <p>Title: <%= title %></p>
      <p>Case Title: <%= caseTitle %></p>
      <p>Case Type: <%= caseType %></p>
      <p>Start Date: <%= startDate %></p>
      <p>Completion Date: <%= completionDate %></p>
      <p>Assign From: <%= assignFrom %></p>
      <p>Assign To: <%= assignTo %></p>
      
      
      
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
    
    db.all(
      'SELECT fullName AS name FROM TeamMembers WHERE user_id = ? ' +
      'UNION ' +
      'SELECT firstName || " " || lastName AS name FROM ClientForm WHERE user_id = ?',
      [userId, userId],
      (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Internal Server Error' });
        }
        return res.json(result);
      }
    );
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});


//get endpoint to render teammember form data on edit form
app.get('/dashboard/teammemberform/edit', authenticateJWT, (req, res) => {
  const userId = req.user.id;

  db.all(
    'SELECT id, image, fullName, email, designation, address, state, city, zipCode, selectedGroup FROM TeamMembers WHERE user_id = ?',
    [userId],
    (err, teamMembers) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      return res.json(teamMembers);
    }
  );
});

//update endpoint to update the render data on edit form
app.put('/dashboard/teammemberform/edit/update/:memberId', authenticateJWT, (req, res) => {
  const memberId = req.params.memberId;
  const userId = req.user.id;
  const {
    image, fullName, email, designation, address, state, city, zipCode, selectedGroup
  } = req.body;

  db.run(
    'UPDATE TeamMembers SET image = ?, fullName = ?, email = ?, designation = ?, address = ?, state = ?, city = ?, zipCode = ?, selectedGroup = ? WHERE id = ? AND user_id = ?',
    [image, fullName, email, designation, address, state, city, zipCode, selectedGroup, memberId, userId],
    (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json({ message: 'Team member updated successfully' });
    }
  );
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


//get endpoint to render bill data when edit button is clicked on show bill
app.get('/bill/edit', authenticateJWT, (req, res) => {
  const userId = req.user.id;

  db.all(
    'SELECT id, billNumber, title, currentDate, dateFrom, dateTo, fullAddress, billingType, totalHours, noOfHearings, totalAmount, amount, taxType, taxPercentage, totalAmountWithTax, description, addDoc FROM BillForm WHERE user_id = ?',
    [userId],
    (err, billForms) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      return res.json(billForms);
    }
  );
});

//update endpoint to update the render data when edit button is clicked on show bill
app.put('/bill/edit/update/:billId', authenticateJWT, (req, res) => {
  const billId = req.params.billId;
  const userId = req.user.id;
  const {
    billNumber, title, currentDate, dateFrom, dateTo, fullAddress, billingType, totalHours, noOfHearings, totalAmount, amount, taxType, taxPercentage, totalAmountWithTax, description, addDoc
  } = req.body;

  db.run(
    'UPDATE BillForm SET billNumber = ?, title = ?, currentDate = ?, dateFrom = ?, dateTo = ?, fullAddress = ?, billingType = ?, totalHours = ?, noOfHearings = ?, totalAmount = ?, amount = ?, taxType = ?, taxPercentage = ?, totalAmountWithTax = ?, description = ?, addDoc = ? WHERE id = ? AND user_id = ?',
    [billNumber, title, currentDate, dateFrom, dateTo, fullAddress, billingType, totalHours, noOfHearings, totalAmount, amount, taxType, taxPercentage, totalAmountWithTax, description, addDoc, billId, userId],
    (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json({ message: 'Bill form updated successfully' });
    }
  );
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

// get endpoint to show a case so the user can edit it 
app.get("/edit/caseform", authenticateJWT, (req, res) => {
  const userId = req.user.id;

  db.all(
    "SELECT id, title, caseType, courtType, courtName, caveatNo, caseCode, caseURL, caseStatus, honorableJudge, courtHallNo, cnrNo, batchNo, dateOfFiling, practiceArea, manage, client, team, clientDesignation, opponentPartyName, lawyerName, mobileNo, emailId FROM CasesForm WHERE user_id = ?",
    [userId],
    (err, forms) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      return res.json(forms);
    }
  );
});
// get endpoint to update the case so the user can edit it 
app.put('edit/caseform/update:caseId', authenticateJWT, (req, res) => {
  const caseId = req.params.caseId;
  const userId = req.user.id;
  const {
    title, caseType, courtType, courtName, caveatNo, caseCode, caseURL,
    caseStatus, honorableJudge, courtHallNo, cnrNo, batchNo, dateOfFiling,
    practiceArea, manage, client, team, clientDesignation, opponentPartyName,
    lawyerName, mobileNo, emailId
  } = req.body;

  db.run(
    'UPDATE CasesForm SET title = ?, caseType = ?, courtType = ?, courtName = ?, caveatNo = ?, caseCode = ?, caseURL = ?, caseStatus = ?, honorableJudge = ?, courtHallNo = ?, cnrNo = ?, batchNo = ?, dateOfFiling = ?, practiceArea = ?, manage = ?, client = ?, team = ?, clientDesignation = ?, opponentPartyName = ?, lawyerName = ?, mobileNo = ?, emailId = ? WHERE id = ? AND user_id = ?',
    [title, caseType, courtType, courtName, caveatNo, caseCode, caseURL, caseStatus, honorableJudge, courtHallNo, cnrNo, batchNo, dateOfFiling, practiceArea, manage, client, team, clientDesignation, opponentPartyName, lawyerName, mobileNo, emailId, caseId, userId],
    (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json({ message: 'Case updated successfully' });
    }
  );
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
    db.all('SELECT id,title,caseCode,client,honorableJudge, opponentPartyName FROM CasesForm WHERE user_id = ?', [userId], (err, forms) => {
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



// GET endpoint to show a client in edit client form
app.get('/dashboard/clientform/edit', authenticateJWT, (req, res) => {
  const userId = req.user.id;

  db.all(
    'SELECT id, firstName, lastName, email, mobileNo, alternateMobileNo, organizationName, organizationType, organizationWebsite, caseTitle, type, homeAddress, officeAddress, assignAlerts FROM ClientForm WHERE user_id = ?',
    [userId],
    (err, clientForms) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      return res.json(clientForms);
    }
  );
});
// Update endpoint to update a client in edit client form
app.put('/clients/forms/:clientId', authenticateJWT, (req, res) => {
  const clientId = req.params.clientId;
  const userId = req.user.id;
  const {
    firstName, lastName, email, mobileNo, alternateMobileNo, organizationName,
    organizationType, organizationWebsite, caseTitle, type, homeAddress, officeAddress, assignAlerts
  } = req.body;

  db.run(
    'UPDATE ClientForm SET firstName = ?, lastName = ?, email = ?, mobileNo = ?, alternateMobileNo = ?, organizationName = ?, organizationType = ?, organizationWebsite = ?, caseTitle = ?, type = ?, homeAddress = ?, officeAddress = ?, assignAlerts = ? WHERE id = ? AND user_id = ?',
    [firstName, lastName, email, mobileNo, alternateMobileNo, organizationName, organizationType, organizationWebsite, caseTitle, type, homeAddress, officeAddress, assignAlerts, clientId, userId],
    (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json({ message: 'Client form updated successfully' });
    }
  );
});


// POST endpoint to add a new client form
app.post('/dashboard/clientform', authenticateJWT, async (req, res) => {
  try {
    const {
      firstName,lastName,email,mobileNo,alternateMobileNo,organizationName,organizationType,organizationWebsite,caseTitle,type,homeAddress,officeAddress,assignAlerts,} = req.body;
    if (!firstName || !email) {
      return res.status(400).json({ error: 'First Name and Email are required fields' });
    }
    const userId = req.user.id;
    const query = `
      INSERT INTO ClientForm (
        firstName, lastName, email, mobileNo, alternateMobileNo, organizationName, 
        organizationType, organizationWebsite, caseTitle, type, homeAddress, officeAddress, 
        assignAlerts, user_id
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(
      query,
      [
        firstName,lastName,email,mobileNo,alternateMobileNo,organizationName,organizationType,organizationWebsite,caseTitle,type,homeAddress,officeAddress,assignAlerts,userId,
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
    db.all('SELECT id,firstName,email,mobileNo,assignAlerts FROM ClientForm WHERE user_id = ?', [userId], (err, forms) => {
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
      <p>Case: <%= caseTitle %></p>
      <p>Type: <%= type %></p>
      <p>Home Address: <%= homeAddress %></p>
      <p>Office Address: <%= officeAddress %></p>
      <p>Assign Alerts: <%= assignAlerts %></p>
      
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

//endpoint for render invoice data on edit form of invoice
app.get('/invoiceform/edit', authenticateJWT, (req, res) => {
  const userId = req.user.id;

  db.all(
    'SELECT id, invoiceNumber, client, caseType, date, amount, taxType, taxPercentage, fullAddress, hearingDate, title, dateFrom, dateTo, expensesAmount, expensesTaxType, expensesTaxPercentage, expensesCumulativeAmount FROM InvoicesForm WHERE user_id = ?',
    [userId],
    (err, invoicesForms) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      return res.json(invoicesForms);
    }
  );
});

//endpoint for updating the renderinformation on edit form of invoice
app.put('/invoiceform/edit/update/:invoiceId', authenticateJWT, (req, res) => {
  const invoiceId = req.params.invoiceId;
  const userId = req.user.id;
  const {
    invoiceNumber, client, caseType, date, amount, taxType, taxPercentage, fullAddress,
    hearingDate, title, dateFrom, dateTo, expensesAmount, expensesTaxType, expensesTaxPercentage, expensesCumulativeAmount, addDoc
  } = req.body;

  db.run(
    'UPDATE InvoicesForm SET invoiceNumber = ?, client = ?, caseType = ?, date = ?, amount = ?, taxType = ?, taxPercentage = ?, fullAddress = ?, hearingDate = ?, title = ?, dateFrom = ?, dateTo = ?, expensesAmount = ?, expensesTaxType = ?, expensesTaxPercentage = ?, expensesCumulativeAmount = ?, addDoc = ? WHERE id = ? AND user_id = ?',
    [invoiceNumber, client, caseType, date, amount, taxType, taxPercentage, fullAddress, hearingDate, title, dateFrom, dateTo, expensesAmount, expensesTaxType, expensesTaxPercentage, expensesCumulativeAmount, addDoc, invoiceId, userId],
    (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json({ message: 'Invoice form updated successfully' });
    }
  );
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
    db.all('SELECT id, title, caseType FROM CasesForm WHERE user_id = ?', [userId], (err, cases) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      return res.json(cases);
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
    `
    SELECT id, 'alert' AS type, title, completionDate AS date FROM AlertsForm WHERE user_id = ?
    UNION ALL
    SELECT id, 'appointment' AS type, title, appointmentDate AS date FROM Appointments WHERE user_id = ?
    UNION ALL
    SELECT id, 'hearing' AS type, title, hearingDate AS date FROM CourtHearing WHERE user_id = ?
    `,
    [userId, userId, userId],
    (err, rows) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      try {
        const notifications = [];
        

        rows.forEach((row) => {
          const eventDate = new Date(row.date);

          const daysDifference = Math.floor(
            (eventDate - currentDate) / (24 * 60 * 60 * 1000)
          );

          if (daysDifference <= 15 && daysDifference >= 0) {
            let notificationMessage = '';

            if (row.type === 'alert') {
              notificationMessage = `Few days left for Task ${row.title} Completion. Completion Date is ${row.date}`;
            } else if (row.type === 'appointment') {
              notificationMessage = `Few days left for ${row.title} appointment. Appointment Date is ${row.date}`;
            } else if (row.type === 'hearing') {
              notificationMessage = `Few days left for ${row.title} Hearing. Hearing Date is ${row.date}`;
            }

            // Check if a notification with the same message exists and has status 'Visible'
            db.get(
              'SELECT * FROM NotificationTable WHERE userId = ? AND message = ? AND status = "Visible"',
              [userId, notificationMessage],
              (err, existingRow) => {
                if (err) {
                  console.error('Database error:', err);
                }

                if (!existingRow) {
                  // If no existing record with this message, insert a new record with status 'Visible'
                  db.run(
                    'INSERT INTO NotificationTable (userId, message, expirationDate) VALUES (?, ?, ?)',
                    [userId, notificationMessage, threeDaysAhead.toISOString(),],
                    (err) => {
                      if (err) {
                        console.error('Database error:', err);
                      } else {
                        console.log('New notification stored in NotificationTable.');
                      }
                    }
                  );
                } else {
                  // Update the existing record's message (status remains the same)
                 
db.run(
  'UPDATE NotificationTable SET userId = ?, message = ? WHERE userId = ? AND message = ?',
  [userId, notificationMessage, userId, notificationMessage],
  (err) => {
    if (err) {
      console.error('Database error:', err);
    } else {
      console.log('Existing notification message updated.');
    }
  }
);



                  
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
      function (err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Internal Server Error' });
        }

        // Notify all other users except the one who created the proxy
        // db.all(
        //   'SELECT id FROM users WHERE id != ?',
        //   [userId],
        //   (err, users) => {
        //     if (err) {
        //       console.error('Database error:', err);
        //     } else {
        //       users.forEach((user) => {
        //         const notificationMessage = `A new proxy has been generated by user ${req.user.username} for a hearing on ${req.body.dateOfHearing}`;
        //         db.run(
        //           'INSERT INTO NotificationTable (userId, message, expirationDate, proxyId) VALUES (?, ?, ?, ?)',
        //           [user.id, notificationMessage, expirationDate, proxyId],
        //           (err) => {
        //             if (err) {
        //               console.error('Database error:', err);
        //             }
        //           }
        //         );
        //       });
        //     }
        //   }
        // );

        return res.status(201).json({ message: 'Proxy created successfully' });
      }
    );
  } catch (error) {
    console.error('Processing error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});



app.get("/dashboard/user/proxy-notifications", authenticateJWT, (req, res) => {
  const userId = req.user.id;
  console.log(userId)
  const currentDate = new Date().toISOString();

  db.all(
    'SELECT id, fullName, dateOfHearing, expirationDate, status, zipStateProvince, city FROM ProxyForm WHERE user_id != ? AND expirationDate > ? AND status = "pending"',
    [userId, currentDate],
    (err, rows) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      try {
        const notifications = rows.map((row) => {
          const { fullName, dateOfHearing, zipStateProvince, city, id } = row;
          return{id:id, message:`The proxy has been generated by ${fullName}. The date of hearing is ${dateOfHearing} in state ${zipStateProvince} City - ${city}`};
        });
        // return `The proxy has been generated by ${fullName}. The date of hearing is ${dateOfHearing} in state ${zipStateProvince} City - ${city}`;

        console.log(notifications)
        return res.json(notifications);
      } catch (error) {

        console.error("Processing error:", error);
        return res.status(500).json({ error: "Internal Server Error" });
      }
    }
  );
});


app.post('/dashboard/user/accept-proxy/:proxyId', authenticateJWT, (req, res) => {
  const userId = req.user.id;
  const proxyId = req.params.proxyId;

  // Update the status of the proxy to "accepted" and set the acceptance date
  const acceptanceDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  });
  // const hearingDate = req.body.dateOfHearing;

  db.run(
    'UPDATE ProxyForm SET status = "accepted", acceptanceDate = ? WHERE id = ? AND user_id != ? AND status = "pending"',
    [acceptanceDate, proxyId, userId],
    (err) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      // console.log('hearingDate:', hearingDate);
      // Record proxy activity in ProxyActivity table
      db.run(
        'INSERT INTO ProxyActivity (creator_user_id, acceptor_user_id, proxy_id, acceptanceDate) VALUES (?, ?, ?, ?)',
        [req.user.id, userId, proxyId, acceptanceDate],
        (err) => {
          if (err) {
            console.error('Database error:', err);
          }
        }
      );

      // Retrieve the creator's user_id, fullName, dateOfHearing, and expirationDate from the ProxyForm table
      db.get(
        'SELECT user_id, fullName, dateOfHearing, expirationDate, zipStateProvince, city FROM ProxyForm WHERE id = ?',
        [proxyId],
        (err, row) => {
          if (err) {
            console.error('Database error:', err);
          } else {
            if (row.user_id) {
              // Notify the user who created the proxy
              const creatorNotificationMessage = `Your proxy for the hearing on ${row.dateOfHearing} in state ${row.zipStateProvince}, City ${row.city} has been accepted by user ${req.user.username}`;

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
app.get('/dashboard/user/accepted-proxy-notifications', authenticateJWT, (req, res) => {
  const userId = req.user.id;
  const currentDate = new Date().toISOString();

  db.all(
    'SELECT message, expirationDate FROM NotificationTable WHERE userId = ? AND expirationDate > ?',
    [userId, currentDate],
    (err, rows) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      try {
        const notifications = rows.map((row) => {
          return row.message;
        });

        return res.json(notifications);
      } catch (error) {
        console.error('Processing error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  );
});


app.delete('/dashboard/user/notifications/:notificationId', authenticateJWT, (req, res) => {
  const userId = req.user.id;
  const notificationId = req.params.notificationId;
  console.log('Notification ID to delete:', notificationId);

  // Check if the notification belongs to the authenticated user and has 'visible' status
  db.get(
    'SELECT * FROM NotificationTable WHERE id = ? AND userId = ? AND status = "Visible"',
    [notificationId, userId],
    (err, notification) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
        
      }
      console.log('Notification:', notification);

      if (!notification) {
        // If the notification doesn't exist, doesn't belong to the user, or is already deleted, return a 404 error
        return res.status(404).json({ error: 'Notification not found' });
      }

      // Update the status of the notification to 'deleted'
      db.run(
        'UPDATE NotificationTable SET status = "deleted" WHERE id = ?',
        [notificationId],
        (err) => {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
          }

          console.log('Notification marked as deleted.');
          return res.status(204).end(); // Respond with a 204 status code (No Content) to indicate successful update
        }
      );
    }
  );
});
// show proxy
// Endpoint for retrieving proxy activity for the logged-in user
app.get('/dashboard/user/proxy-activity', authenticateJWT, (req, res) => {
  const userId = req.user.id;
  const currentDate = new Date().toISOString();

  db.all(
    'SELECT pa.acceptanceDate, p.fullName AS creatorFullName, u.username AS acceptorUsername FROM ProxyActivity pa ' +
    'INNER JOIN users u ON pa.acceptor_user_id = u.id ' +
    'INNER JOIN ProxyForm p ON pa.proxy_id = p.id ' +
    'WHERE pa.creator_user_id = ? AND p.expirationDate > ?',
    [userId, currentDate],
    (err, rows) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      try {
        const proxyActivity = rows.map((row) => {
          return {
            acceptanceDate: row.acceptanceDate,
            creatorFullName: row.creatorFullName,
            acceptorUsername: row.acceptorUsername,
          };
        });

        return res.json(proxyActivity);
      } catch (error) {
        console.error('Processing error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  );
});

// Endpoint for deleting proxy activity for the logged-in user
app.delete('/dashboard/user/proxy-activity/:activityId', authenticateJWT, (req, res) => {
  const userId = req.user.id;
  const activityId = req.params.activityId;

  // Check if the activity with the given ID exists and belongs to the authenticated user
  db.get(
    'SELECT id FROM ProxyActivity WHERE id = ? AND creator_user_id = ?',
    [activityId, userId],
    (err, row) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      if (!row) {
        return res.status(404).json({ error: 'Proxy Activity not found' });
      }

      // Delete the proxy activity with the specified ID
      db.run('DELETE FROM ProxyActivity WHERE id = ?', [activityId], (deleteErr) => {
        if (deleteErr) {
          console.error('Database error:', deleteErr);
          return res.status(500).json({ error: 'Internal Server Error' });
        }

        return res.json({ message: 'Proxy Activity deleted successfully' });
      });
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
