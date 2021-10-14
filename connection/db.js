const mysql = require("mysql2");

const connectionPool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "insert_password",
  database: "db_heroes",
  connectionLimit: 5,
});

module.exports = connectionPool;
