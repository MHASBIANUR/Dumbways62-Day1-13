const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "Db_Projects", // ganti sesuai nama database kamu
  password: "H3Hasbi", // ganti sesuai password PostgreSQL kamu
  port: 5432
});

module.exports = pool;
