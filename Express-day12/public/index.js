// Ambil elemen
const form = document.getElementById("form");
const myProject = document.getElementById("myProject");
let projectData = [];
let editIndex = null;

// Event saat submit form
form.addEventListener("submit", function (event) {
  event.preventDefault();

  // Ambil input
  const name = document.getElementById("name").value;
  const startDate = document.getElementById("startDate").value;
  const endDate = document.getElementById("endDate").value;
  const deskripsi = document.getElementById("deskripsi").value;
  const imageInput = document.getElementById("image");
  const imageFile = imageInput.files[0];
  const imageURL = imageFile ? URL.createObjectURL(imageFile) : "";

  // Validasi sederhana
  if (!name || !startDate || !endDate || !deskripsi) {
    alert("Semua field harus diisi!");
    return;
  }

  // Ambil data teknologi yang dipilih
  const techOptions = [
    { id: "techno1", name: "Node.js" },
    { id: "techno2", name: "React.js" },
    { id: "techno3", name: "Next.js" },
    { id: "techno4", name: "TypeScript" }
  ];

  const selectedTech = techOptions
    .map(tech => (document.getElementById(tech.id).checked ? tech.name : null))
    .filter(Boolean);

  // Simpan data
  const data = { name, startDate, endDate, deskripsi, selectedTech, imageURL };

  if (editIndex !== null) {
    projectData[editIndex] = data;
    editIndex = null;
  } else {
    projectData.push(data);
  }

  form.reset();
  renderProject();
});

// Tampilkan semua project
function renderProject() {
  myProject.innerHTML = projectData
    .map((project, index) => {
      const { name, startDate, endDate, deskripsi, selectedTech, imageURL } = project;

      const techIcons = {
        "Node.js": '<i class="fab fa-node-js tech-icon" title="Node.js"></i>',
        "React.js": '<i class="fab fa-react tech-icon" title="React.js"></i>',
        "Next.js": '<img src="https://cdn.worldvectorlogo.com/logos/nextjs-2.svg" alt="Next.js" class="tech-icon-img" title="Next.js">',
        "TypeScript": '<i class="bi bi-typescript tech-icon" title="TypeScript"></i>',
      };

      const techIconHTML = selectedTech.map(tech => techIcons[tech] || tech).join(" ");

      return `
        <div class="card">
          ${imageURL ? `<img src="${imageURL}" alt="Foto" style="width: 100%; height: 200px; object-fit: cover;">` : ""}
          <div class="card-content">
            <h3>${name}</h3>
            <p><strong>Start:</strong> ${startDate}</p>
            <p><strong>End:</strong> ${endDate}</p>
            <p><strong>Deskripsi:</strong> ${deskripsi}</p>
            <p><strong>Tech:</strong> ${techIconHTML}</p>
            <button onclick="editProject(${index})">Edit</button>
            <button onclick="deleteProject(${index})">Hapus</button>
          </div>
        </div>
      `;
    })
    .join("");
}

// Hapus project
function deleteProject(index) {
  const project = projectData[index];
  if (project.imageURL) URL.revokeObjectURL(project.imageURL); // Optional: Bebaskan memori
  projectData.splice(index, 1);
  renderProject();
}

// Edit project
function editProject(index) {
  const project = projectData[index];
  document.getElementById("name").value = project.name;
  document.getElementById("startDate").value = project.startDate;
  document.getElementById("endDate").value = project.endDate;
  document.getElementById("deskripsi").value = project.deskripsi;

  const techMap = {
    "Node.js": "techno1",
    "React.js": "techno2",
    "Next.js": "techno3",
    "TypeScript": "techno4"
  };

  Object.keys(techMap).forEach(tech => {
    document.getElementById(techMap[tech]).checked = project.selectedTech.includes(tech);
  });

  editIndex = index;
}
