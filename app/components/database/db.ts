import mysql from "mysql2/promise";
import { Pool } from "pg";

const dbType = process.env.DB_TYPE;

let connection: any;

if (dbType === "postgres") {
  connection = new Pool({
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT || "5432"),
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
  });
} else if (dbType === "mysql") {
  connection = mysql.createPool({
    host: process.env.MYSQL_HOST,
    port: parseInt(process.env.MYSQL_PORT || "3306"),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DB,
  });
} else {
  throw new Error("Unsupported DB_TYPE. Must be mysql or postgres");
}

export default connection;
