const express = require("express");
const path = require("path");
const multer = require("multer");
const pool = require("./db");

const app = express();
const port = 3000;


// Konfigurasi upload gambar
const upload = multer({ dest: "uploads/" });

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

// Fungsi format tanggal untuk input type="date"
function formatDateToInput(date) {
  if (!date) return '';
  const d = new Date(date);
  const year = d.getFullYear();
  const month = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// GET Home Page (menampilkan semua project dan form edit jika ada)
app.get("/", async (req, res) => {
  try {
    const { edit } = req.query;

    let project = null;

    if (edit) {
      const result = await pool.query("SELECT * FROM projects WHERE id = $1", [edit]);
      if (result.rows.length > 0) {
        project = result.rows[0];

        // Format tanggal agar bisa tampil di <input type="date">
        project.startdate = formatDateToInput(project.startdate);
        project.enddate = formatDateToInput(project.enddate);
      }
    }

    const allProjects = await pool.query("SELECT * FROM projects ORDER BY id DESC");

    res.render("index", {
      projects: allProjects.rows,
      project,
    });
  } catch (err) {
    console.error("Error GET /:", err);
    res.status(500).send("Gagal mengambil data");
  }
});

// POST: Tambah project baru
app.post("/add-project", upload.single("image"), async (req, res) => {
  const {
    name, startDate, endDate, deskripsi,
    techno1, techno2, techno3, techno4
  } = req.body;

  const image = req.file ? req.file.filename : null;

  try {
    await pool.query(`
      INSERT INTO projects (name, startDate, endDate, deskripsi, techno1, techno2, techno3, techno4, image)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [
      name,
      startDate,
      endDate,
      deskripsi,
      techno1,
      techno2,
      techno3,
      techno4,
      image
    ]);

    res.redirect("/");
  } catch (err) {
    console.log("startDate:", startDate, "endDate:", endDate);
    console.error("Insert error:", err);
    res.status(500).send("Database insert error");
  }
});

// POST: Edit project
app.post("/edit-project/:id", upload.single("image"), async (req, res) => {
  const id = req.params.id;
  const {
    name, startDate, endDate, deskripsi,
    techno1, techno2, techno3, techno4
  } = req.body;

  const image = req.file ? req.file.filename : null;

  try {
    if (image) {
      // Jika ada gambar baru di-upload
      await pool.query(`
        UPDATE projects
        SET name = $1, startDate = $2, endDate = $3, deskripsi = $4,
            techno1 = $5, techno2 = $6, techno3 = $7, techno4 = $8, image = $9
        WHERE id = $10
      `, [
        name,
        startDate,
        endDate,
        deskripsi,
        techno1,
        techno2,
        techno3,
        techno4,
        image,
        id
      ]);
    } else {
      // Tanpa update gambar
      await pool.query(`
        UPDATE projects
        SET name = $1, startDate = $2, endDate = $3, deskripsi = $4,
            techno1 = $5, techno2 = $6, techno3 = $7, techno4 = $8
        WHERE id = $9
      `, [
        name,
        startDate,
        endDate,
        deskripsi,
        techno1,
        techno2,
        techno3,
        techno4,
        id
      ]);
    }

    res.redirect("/");
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).send("Database update error");
  }
});

const hbs = require("hbs");
hbs.registerHelper("formatDate", function (date) {
  const d = new Date(date);
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
});

// POST: Hapus project
app.post("/delete-project/:id", async (req, res) => {
  const id = req.params.id;

  try {
    await pool.query("DELETE FROM projects WHERE id = $1", [id]);
    res.redirect("/");
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).send("Database delete error");
  }
});

// Jalankan server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
