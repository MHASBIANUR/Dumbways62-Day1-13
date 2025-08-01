// Import library yang dibutuhkan
const express = require("express");
const path = require("path");
const { Pool } = require("pg");
const hbs = require("hbs");
const bcrypt = require("bcrypt");
const flash = require("express-flash");
const session = require("express-session");
const { log } = require("console");
const multer = require("multer");

// Inisialisasi express
const app = express();
const port = 3000;

// Middleware konfigurasi
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

app.use(session({ secret: 'secret-key', resave: false, saveUninitialized: true }));
app.use(flash());

// Menjalankan server
app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});

// Connect database postgreSQL
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "Db_Projects",
  password: "H3Hasbi",
  port: 5432
});

// Route untuk login dan register
app.get("/login", login);
app.post("/login", handleLogin);

app.get("/register", register);
app.post("/register", handleRegister);

// Penyimpanan file upload dengan multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});
const upload = multer({ storage: storage });

// Fungsi menghitung durasi
function getDuration(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffInMs = end - start;
  const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
  return `${diffInDays} hari`;
}

// Tambah Project
app.post("/add-project", upload.single("image"), (req, res) => {
  const { name, startDate, endDate, deskripsi, techno1, techno2, techno3, techno4 } = req.body;
  const image = req.file ? req.file.filename : null;

  pool.query(`
    INSERT INTO projects (name, startDate, endDate, deskripsi, techno1, techno2, techno3, techno4, image)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
  `, [name, startDate, endDate, deskripsi, techno1, techno2, techno3, techno4, image],
    (err) => {
      if (err) {
        console.error("Error tambah project:", err);
        return res.status(500).send("Gagal menambahkan project");
      }
      res.redirect("/");
    }
  );
});

// Fungsi format tanggal untuk input type="date"
function formatDateToInput(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toISOString().split("T")[0];
}

// Helper untuk format tanggal di tampilan
hbs.registerHelper("formatDate", function (date) {
  const d = new Date(date);
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
});

// Menampilkan semua project
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

        const projects = allResult.rows.map(project => {
          return {
            ...project,
            duration: getDuration(project.startdate, project.enddate)
          };
        });

        res.render("index", {
          projects,
          project,
          userData
        });
      });
    });

  } else {
    pool.query("SELECT * FROM projects ORDER BY id DESC", (err, result) => {
      if (err) {
        console.error("Error ambil semua data:", err);
        return res.status(500).send("Gagal ambil data");
      }

      const projects = result.rows.map(project => {
        return {
          ...project,
          duration: getDuration(project.startdate, project.enddate)
        };
      });

      res.render("index", {
        projects,
        userData
      });
    });
  }
});

// Edit project
app.post("/edit-project/:id", upload.single("image"), (req, res) => {
  const id = req.params.id;
  const { name, startDate, endDate, deskripsi, techno1, techno2, techno3, techno4 } = req.body;
  const newImage = req.file ? req.file.filename : null;

  pool.query("SELECT image FROM projects WHERE id = $1", [id], (err, result) => {
    if (err) {
      console.error("Error ambil image lama:", err);
      return res.status(500).send("Gagal ambil image lama");
    }

    const oldImage = result.rows[0].image;
    const finalImage = newImage || oldImage;

    pool.query(`
      UPDATE projects
      SET name = $1, startDate = $2, endDate = $3, deskripsi = $4,
          techno1 = $5, techno2 = $6, techno3 = $7, techno4 = $8, image = $9
      WHERE id = $10
    `, [name, startDate, endDate, deskripsi, techno1, techno2, techno3, techno4, finalImage, id],
      (err) => {
        if (err) {
          console.error("Error update project:", err);
          return res.status(500).send("Gagal mengedit project");
        }
        res.redirect("/");
      }
    );
  });
});

// Hapus project
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

// Halaman register
function register(req, res) {
  res.render("register");
}

// Handler proses register
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

// Halaman login
function login(req, res) {
  res.render("login");
}

// Handler proses login
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
    name: isRegistered.rows[0].name,
  };

  res.redirect("/home");
}

// Logout
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Gagal logout:", err);
      return res.status(500).send("Gagal logout");
    }

    res.redirect("/login");
  });
});

// Home setelah login
app.get("/home", (req, res) => {
  const userData = req.session.user ? req.session.user.name : null;
  res.render("home", { userData });
});

// Halaman contact
app.get("/contact", (req, res) => {
  const userData = req.session.user ? req.session.user.name : null;
  res.render("contact", { userData });
});

// tampilan My Projects
app.get("/myprojects", async (req, res) => {
  const userData = req.session.user ? req.session.user.name : null;

  try {
    const result = await pool.query("SELECT * FROM projects ORDER BY id DESC");

    const projects = result.rows.map(project => {
      return {
        ...project,
        duration: getDuration(project.startdate, project.enddate)
      };
    });

    res.render("myprojects", {
      userData,
      projects
    });
  } catch (err) {
    console.error("Gagal ambil data project untuk My Projects:", err);
    res.status(500).send("Gagal ambil data projects");
  }
});

