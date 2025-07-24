const express = require("express");
const path = require("path");
const { Pool } = require("pg");
const hbs = require("hbs");

const app = express();
const port = 3000;

// memanggil database
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "Db_Projects",
  password: "H3Hasbi",
  port: 5432
});

// konfigurasi yang berfungsi sebagai middleware dan view engine setup
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

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

// Route home
app.get("/", (req, res) => {
  const { edit } = req.query;

  if (edit) {
    // Ambil project yang mau diedit
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

      // Ambil semua data untuk ditampilkan
      pool.query("SELECT * FROM projects ORDER BY id DESC", (err, allResult) => {
        if (err) {
          console.error("Error ambil semua data:", err);
          return res.status(500).send("Gagal ambil semua data");
        }

        res.render("index", {
          projects: allResult.rows,
          project: project
        });
      });
    });

  } else {
    // Jika tidak sedang edit
    pool.query("SELECT * FROM projects ORDER BY id DESC", (err, result) => {
      if (err) {
        console.error("Error ambil semua data:", err);
        return res.status(500).send("Gagal ambil data");
      }

      res.render("index", {
        projects: result.rows
      });
    });
  }
});

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


// === Jalankan Server ===
app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
