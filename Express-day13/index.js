const express = require("express");
const path = require("path");
const { Pool } = require("pg");
const hbs = require("hbs");
const bcrypt = require("bcrypt");
const flash = require("express-flash");
const session = require("express-session");
const { log } = require("console");

const app = express();
const port = 3000;

// konfigurasi yang berfungsi sebagai middleware dan view engine setup
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

app.use(session({ secret: 'secret-key', resave: false, saveUninitialized: true, }));
app.use(flash());


// Jalankan Server
app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});

// memanggil database
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "Db_Projects",
  password: "H3Hasbi",
  port: 5432
});

// route login
app.get("/login", login);
app.post("/login", handleLogin);

app.get("/register", register);
app.post("/register", handleRegister);


// Route Tambah Project
app.post("/add-project", (req, res) => {
  const { name, startDate, endDate, deskripsi, techno1, techno2, techno3, techno4 } = req.body;

  pool.query(`
    INSERT INTO projects (name, startDate, endDate, deskripsi, techno1, techno2, techno3, techno4)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
  `, [name, startDate, endDate, deskripsi, techno1, techno2, techno3, techno4],
    (err) => {
      if (err) {
        console.error("Error tambah project:", err);
        return res.status(500).send("Gagal menambahkan project");
      }

      res.redirect("/");
    }
  );
});

// Format tanggal untuk input form
function formatDateToInput(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toISOString().split("T")[0]; // YYYY-MM-DD
}

// Format tanggal untuk tampilan hbs
hbs.registerHelper("formatDate", function (date) {
  const d = new Date(date);
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
});

// Route Edit Project
app.post("/edit-project/:id", (req, res) => {
  const id = req.params.id;
  const { name, startDate, endDate, deskripsi, techno1, techno2, techno3, techno4 } = req.body;

  pool.query(`
    UPDATE projects
    SET name = $1, startDate = $2, endDate = $3, deskripsi = $4,
        techno1 = $5, techno2 = $6, techno3 = $7, techno4 = $8
    WHERE id = $9
  `, [name, startDate, endDate, deskripsi, techno1, techno2, techno3, techno4, id],
    (err) => {
      if (err) {
        console.error("Error edit project:", err);
        return res.status(500).send("Gagal mengedit project");
      }

      res.redirect("/");
    }
  );
});


// Route home
app.get("/", (req, res) => {
  const { edit } = req.query;
  const userData = req.session.user ? req.session.user.name : null;

  if (edit) {
    pool.query("SELECT * FROM projects WHERE id = $1", [edit], (err, editResult) => {
      if (err) {
        console.error("Error ambil data edit:", err);
        return res.status(500).send("Gagal ambil data edit");
      }

      let project = editResult.rows[0];
      if (project) {
        project.startdate = formatDateToInput(project.startdate);
        project.enddate = formatDateToInput(project.enddate);
      }

      pool.query("SELECT * FROM projects ORDER BY id DESC", (err, allResult) => {
        if (err) {
          console.error("Error ambil semua data:", err);
          return res.status(500).send("Gagal ambil semua data");
        }

        res.render("index", {
          projects: allResult.rows,
          project: project,
          userData: userData   // <-- kirim userData ke view
        });
      });
    });

  } else {
    pool.query("SELECT * FROM projects ORDER BY id DESC", (err, result) => {
      if (err) {
        console.error("Error ambil semua data:", err);
        return res.status(500).send("Gagal ambil data");
      }

      res.render("index", {
        projects: result.rows,
        userData: userData  // <-- kirim userData ke view
      });
    });
  }
});



// Route Hapus Project
app.post("/delete-project/:id", (req, res) => {
  const id = req.params.id;

  pool.query("DELETE FROM projects WHERE id = $1", [id], (err) => {
    if (err) {
      console.error("Error hapus project:", err);
      return res.status(500).send("Gagal menghapus project");
    }

    res.redirect("/");
  });
});

function register(req, res) {
  res.render("register");
}

async function handleRegister(req, res) {
  try {
    let { name, email, password } = req.body;

    const isRegistered = await pool.query(
      `SELECT * FROM public."user" WHERE email = $1`, [email]
    );

    if (isRegistered.rows.length > 0) {
      req.flash("message", "Email sudah terdaftar");
      return res.redirect("/register");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO public."user"(email, password, name) VALUES ($1, $2, $3)`,
      [email, hashedPassword, name]
    );

    res.redirect("/login");

  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).send("Terjadi kesalahan saat register.");
  }
}

function login(req, res) {
  res.render("login");
}

async function handleLogin(req, res) {
  const { email, password } = req.body;

  const isRegistered = await pool.query(
    `SELECT * FROM public.user WHERE email='${email}'`
  );

  const isMatch = await bcrypt.compare(password, isRegistered.rows[0].password);
  console.log(isMatch);

  if (!isMatch) {
    return res.redirect("/login");
  }

  req.session.user = {
    name : isRegistered.rows[0].name,
  };

  res.redirect("/");

}
