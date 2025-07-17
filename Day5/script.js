let form = document.getElementById("form");
let myProject = document.getElementById("myProject");
let projectData = null; // Untuk menyimpan data sementara

form.addEventListener("submit", function (event) {
  event.preventDefault();

  // Ambil data input
  let name = document.getElementById("name").value;
  let startDate = document.getElementById("startDate").value;
  let endDate = document.getElementById("endDate").value;
  let deskripsi = document.getElementById("deskripsi").value;

  let selectedTech = [];
  if (document.getElementById("techno1").checked) selectedTech.push("Node.js");
  if (document.getElementById("techno2").checked) selectedTech.push("React.js");
  if (document.getElementById("techno3").checked) selectedTech.push("Next.js");
  if (document.getElementById("techno4").checked) selectedTech.push("TypeScript");

  let imageInput = document.getElementById("image");
  let imageFile = imageInput.files[0];
  let imageURL = imageFile ? URL.createObjectURL(imageFile) : projectData?.imageURL;

  // Simpan data
  projectData = { name, startDate, endDate, deskripsi, selectedTech, imageURL };

  // Tampilkan
  renderProject();

  // Reset form
  form.reset();
});

function renderProject() {
  const { name, startDate, endDate, deskripsi, selectedTech, imageURL } = projectData;

  myProject.innerHTML = `
    <div>
      <img src="${imageURL}" alt="Uploaded Image" width="150" />
      <p><strong>Nama:</strong> ${name}</p>
      <p><strong>Start Date:</strong> ${startDate}</p>
      <p><strong>End Date:</strong> ${endDate}</p>
      <p><strong>Deskripsi:</strong> ${deskripsi}</p>
      <p><strong>Technologies:</strong> ${selectedTech.join(", ")}</p>
      <button onclick="editProject()">Edit</button>
      <button onclick="deleteProject()">Hapus</button>
    </div>
  `;
}

function editProject() {
  // Masukkan kembali data ke form
  document.getElementById("name").value = projectData.name;
  document.getElementById("startDate").value = projectData.startDate;
  document.getElementById("endDate").value = projectData.endDate;
  document.getElementById("deskripsi").value = projectData.deskripsi;

  document.getElementById("techno1").checked = projectData.selectedTech.includes("Node.js");
  document.getElementById("techno2").checked = projectData.selectedTech.includes("React.js");
  document.getElementById("techno3").checked = projectData.selectedTech.includes("Next.js");
  document.getElementById("techno4").checked = projectData.selectedTech.includes("TypeScript");

  // Kosongkan image karena tidak bisa di-set ulang secara langsung
  alert("Silakan pilih ulang gambar jika ingin mengubah.");

  // Hapus tampilan sementara agar nanti diganti dengan data baru
  myProject.innerHTML = "";
}

function deleteProject() {
  projectData = null;
  myProject.innerHTML = "";
}
