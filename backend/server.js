const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const app = express();
const port = 4000;

// Middleware for parsing JSON bodies, and CORS
app.use(express.json());
app.use(cors({
    origin:"*",
    methods:['GET','POST','PUT','PATCH','DELETE'],
    credentials:true
}));

// Connect to the SQLite database
let db = new sqlite3.Database('./judgments4.db', (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Connected to the SQLite database.');
});

// Error handler middleware
app.use((err, req, res, next) => {
  console.log(err.stack);
  res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

// Endpoint to search in the database based on the searchTerm and specific category
app.get('/search', (req, res) => {
  const { searchTerm, category } = req.query;
  console.log("searchteam: ",searchTerm,"category: ", category)

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
    console.log("hi 56", err)
    console.log("params: ", params)
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    console.log("hi 61",rows)
    res.json(rows);
  });
});


// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
