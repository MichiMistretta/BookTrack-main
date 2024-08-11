const mysql = require('mysql');

//connection to mysql database 
const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "seasonsix",
    database: "mydb"
});

connection.connect(function(error) {
    if (error) {
        console.log(error)
      
    } else {
        console.log("Connected to database successfully");
    }
});

module.exports = connection;


