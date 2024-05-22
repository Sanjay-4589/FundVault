const express = require("express");
const mysql = require("mysql2");
const app = express();
const port = 3000;

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "sanjay@123",
  database: "fundvault",
});

app.set("view engine", "ejs");

db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log("Connected to MySQL database");
});

app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/login.html");
});

var UserDetails;
var AccDetails;
var InsDetails;
var LoanDetails;
var present_userId;


app.post("/login", (req, res) => {
  const { UserID, password } = req.body;
  present_userId  = UserID;
  const query = "SELECT * FROM user WHERE UserID = ? AND password = ?";
  db.query(query, [UserID, password], (err, results) => {
    if (err) {
      throw err;
    }
    if (results.length > 0) {
      UserDetails = results;
      console.log("user details", UserDetails);

      // Fetch account details
      const accQ = `CALL GetAccDetails(?)`;
      db.query(accQ, [UserID], (err, resultAcc) => {
        if (err) {
          throw err;
        } else {
          AccDetails = resultAcc;
          // console.log("Account Details : ", AccDetails);

          // Fetch insurance details
          const insQ = `CALL GetInsDetails(?)`;
          db.query(insQ, [UserID], (err, resultIns) => {
            if (err) {
              throw err;
            } else {
              InsDetails = resultIns;
              // console.log("insDetails : ", InsDetails);

              // Fetch loan details
              const loanQ = `CALL GetLoanDetails(?)`;
              db.query(loanQ, [UserID], (err, resultLoan) => {
                if (err) {
                  throw err;
                } else {
                  LoanDetails = resultLoan;
                  // console.log("Loan Details : ", LoanDetails);

                  // Render response only when all data is fetched
                  if (UserDetails && AccDetails && InsDetails && LoanDetails) {
                    console.log(present_userId);
                    res.render("home", {
                      UserDetails,
                      AccDetails,
                      InsDetails,
                      LoanDetails,
                    });
                  } else {
                    res.send({
                      status: "failure",
                      message: "Error in fetching data from database.",
                    });
                  }
                }
              });
            }
          });
        }
      });
    } else {
      res.send({ status: "failure", message: "User not found" });
    }
  });
});
app.post("/signup", (req, res) => {
  const { username, UserID, EmailId, PhoneNo, password } = req.body;
  present_userId = UserID;
  const query =
    "INSERT INTO user (UserID,UserName,EmailID,PhoneNo,password) VALUES (? , ? , ? , ? , ?)";
  db.query(
    query,
    [UserID, username, EmailId, PhoneNo, password],
    (err, results) => {
      if (err) {
        res.send("Error signing up");
        console.log(err);
      } else {
        // res.send("Sign up successful");
        console.log(present_userId);
        res.render("signUpDetails");
      }
    }
  );
});

app.post("/signUpDetails", (req, res) => {
  const {
    accNo,
    accType,
    balance,
    salary,
    loanNo,
    totalLoan,
    outstanding,
    emi,
    date,
    insID,
    coverage,
    insEMI,
    startDate,
    endDate,
    paymentDate,
  } = req.body;

  const Accquery =
    "INSERT INTO accounts(UserID,AccNo,AccType,balance) VALUES (? , ? , ? , ? )";
  db.query(
    Accquery,
    [present_userId, accNo, accType, balance],
    (err, results) => {
      if (err) {
        res.send("Error signing up1");
        console.log(err);
      } else {
      }
    }
  );
  const loanquery =
    "INSERT INTO loan(UserID,LoanNo,TotalLoan,Outstanding,EMI,date) VALUES (? , ? , ? , ? , ?,?)";
  db.query(
    loanquery,
    [present_userId, loanNo, totalLoan, outstanding, emi, date],
    (err, results) => {
      if (err) {
        res.send("Error signing up2");
        console.log(err);
      } else {
        res.redirect('/');
      }
    }
  );
  const insuquery =
    "INSERT INTO insurance(UserID,insID,Coverage,EMI,start_date,End_date,date_Of_Payment) VALUES (? , ? , ? , ? ,?,?,?)";
  db.query(
    insuquery,
    [present_userId, insID, coverage, insEMI, startDate, endDate, paymentDate],
    (err, results) => {
      if (err) {
        res.send("Error signing up3");
        console.log(err);
      } else {
        // res.send("Sign up successful");
        res.sendFile(__dirname + "/views/login.html");
      }
    }
    // res.render("app");
  );
});
app.post("/balance:UserID",(req,res)=>{
  console.log("rendering");
    res.render("balanceCheck",{UserDetails,AccDetails});
});
app.post("/insurance:UserID",(req,res)=>{
    res.render("insuranceCheck",{UserDetails,AccDetails,InsDetails});
});
app.post("/loan:UserID",(req,res)=>{
  res.render("loanCheck",{UserDetails,AccDetails,LoanDetails,InsDetails});
});
app.post('/editBalance', (req, res) => {
  const newBalance = req.body.newBalance;
  const query = "UPDATE accounts SET balance=? WHERE userId=?";
  
  db.query(query,[newBalance,present_userId], (err, results) => {
      if (err) {
          console.error(err);
          return res.status(500).send('Error updating balance');
      }
      // Render the home.ejs page with updated data
      const accQ = `CALL GetAccDetails(?)`;
      db.query(accQ, [present_userId], (err, resultAcc) => {
        if (err) {
          throw err;
        } else {
          AccDetails = resultAcc;
        }
      });
      res.render("home", {
        UserDetails,
        AccDetails,
        InsDetails,
        LoanDetails
      });
    });
});

app.post("/redirectFromInsurance", (req, res) => {
  res.render("home", {
    UserDetails,
    AccDetails,
    InsDetails,
    LoanDetails
  });
});

app.post("/redirectFromLoan", (req, res) => {
  res.render("home", {
    UserDetails,
    AccDetails,
    InsDetails,
    LoanDetails
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
