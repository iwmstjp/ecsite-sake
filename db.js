const { Client } = require("pg");
const dotenv = require("dotenv");
dotenv.config();
const client = new Client({
  user: process.env.USER,
  host: process.env.HOST,
  database: process.env.DATABASE_URL,
  password: process.env.PASSWORD,
  port: process.env.PORT,
});
client.connect();
client.query("SELECT NOW()", (err, res) => {
    console.log(err, res);
    client.end();
  });