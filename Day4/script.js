// add form

let name = document.getElementById("name");

let startDate = document.getElementById("startDate");

let endDate = document.getElementById("endDate");

let description = document.getElementById("description");

// technologies

let technologi1 = document.getElementById("technologi1");

let technologi2 = document.getElementById("technologi2");

let technologi3 = document.getElementById("technologi3");

let technologi4 = document.getElementById("technologi4");

let image = document.getElementById("image");

let addSubmit = document.getElementById("submit");

// localStorage API
function setLocalStorage(name, value) {
  localStorage.setItem(name, JSON.stringify(value));
}

function getLocalStorage(name) {
  return JSON.parse(localStorage.getItem(name));
}

function countDuration(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start) || isNaN(end)) {
    return "Tanggal tidak valid";
  }

  if (end < start) {
    return "Tanggal akhir harus setelah tanggal mulai";
  }

  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  let days = end.getDate() - start.getDate();

  // Koreksi jika hari negatif
  if (days < 0) {
    months--;
    const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0); // hari terakhir bulan sebelumnya
    days += prevMonth.getDate();
  }

  // Koreksi jika bulan negatif
  if (months < 0) {
    years--;
    months += 12;
  }

  const parts = [];
  if (years > 0) parts.push(`${years} tahun`);
  if (months > 0) parts.push(`${months} bulan`);
  if (days > 0) parts.push(`${days} hari`);
  if (parts.length === 0) return "0 hari"; // jika sama

  return parts.join(" ");
}

function objectUrlToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = function (event) {
      resolve(event.target.result); // hasil base64
    };

    reader.onerror = function (error) {
      reject(error);
    };

    reader.readAsDataURL(file); // hasilnya base64 dengan prefix mime-type
  });
}

function renderElement() {
  let card = "";

  myProject.map((e, i) => {
    card += `<div class="card">
                      <div class="cardImage" style="background-image: url(${
                        e.image
                      });"></div>
                      <div class="cardTitle">${e.name}</div>
                      <p class="cardDuration">Durasi: ${countDuration(
                        e.startDate,
                        e.endDate
                      )}</p>
                      <p class="cardDesc">${e.description}</p>
                      <div class="cardIcon">
                      </div>
                      <div class="cardButton">
                          <button class="cardEdit">edit</button>
                          <button class="cardDelete">delete</button>
                      </div>
                  </div>`;
  });

  cardsElement.innerHTML = card;

  // icons data
  let icons = [
    {
      name: "Node JS",
      imageUrl:
        "https://img.icons8.com/?size=100&id=54087&format=png&color=000000",
    },
    {
      name: "React JS",
      imageUrl:
        "https://img.icons8.com/?size=100&id=Ax6abTiOhdzW&format=png&color=000000",
    },
    {
      name: "Next JS",
      imageUrl:
        "https://img.icons8.com/?size=100&id=MWiBjkuHeMVq&format=png&color=000000",
    },
    {
      name: "Typescript",
      imageUrl:
        "https://img.icons8.com/?size=100&id=uJM6fQYqDaZK&format=png&color=000000",
    },
  ];

  let cardIcon = document.getElementsByClassName("cardIcon");

  myProject.map((x, i) => {
    let icon = "";

    icons.map((y, j) => {
      if (x.technologi1 === true && j === 0) {
        icon += `<img src="${icons[0].imageUrl}" alt="icon ${icons[0].name}" class="icon">`;
      }

      if (x.technologi2 === true && j === 1) {
        icon += `<img src="${icons[1].imageUrl}" alt="icon ${icons[1].name}" class="icon">`;
      }

      if (x.technologi3 === true && j === 2) {
        icon += `<img src="${icons[2].imageUrl}" alt="icon ${icons[2].name}" class="icon">`;
      }

      if (x.technologi4 === true && j === 3) {
        icon += `<img src="${icons[3].imageUrl}" alt="icon ${icons[3].name}" class="icon">`;
      }
    });

    cardIcon[i].innerHTML = icon;
  });

  let cardDelete = document.querySelectorAll(".cardDelete");

  myProject.map((e, i) => {
    cardDelete[i].addEventListener("click", () => {
      let result = confirm("Yakin ingin menghapus?");

      if (result) {
        myProject.splice(i, 1);
        renderElement();
      }
    });
  });
}

let myProject = [];

let cardsElement = document.querySelector(".cards");

addSubmit.addEventListener("click", async () => {
  myProject.push({
    name: name.value,
    startDate: startDate.value,
    endDate: endDate.value,
    description: description.value,
    technologi1: technologi1.checked,
    technologi2: technologi2.checked,
    technologi3: technologi3.checked,
    technologi4: technologi4.checked,
    image: image.files ? await objectUrlToBase64(image.files[0]) : null,
  });

  let card = "";

  myProject.map((e, i) => {
    card += `<div class="card">
                      <div class="cardImage" style="background-image: url(${
                        e.image
                      });"></div>
                      <div class="cardTitle">${e.name}</div>
                      <p class="cardDuration">Durasi: ${countDuration(
                        e.startDate,
                        e.endDate
                      )}</p>
                      <p class="cardDesc">${e.description}</p>
                      <div class="cardIcon">
                      </div>
                      <div class="cardButton">
                          <button class="cardEdit">edit</button>
                          <button class="cardDelete">delete</button>
                      </div>
                  </div>`;
  });

  cardsElement.innerHTML = card;

  // icons data
  let icons = [
    {
      name: "Node JS",
      imageUrl:
        "https://img.icons8.com/?size=100&id=54087&format=png&color=000000",
    },
    {
      name: "React JS",
      imageUrl:
        "https://img.icons8.com/?size=100&id=Ax6abTiOhdzW&format=png&color=000000",
    },
    {
      name: "Next JS",
      imageUrl:
        "https://img.icons8.com/?size=100&id=MWiBjkuHeMVq&format=png&color=000000",
    },
    {
      name: "Typescript",
      imageUrl:
        "https://img.icons8.com/?size=100&id=uJM6fQYqDaZK&format=png&color=000000",
    },
  ];

  let cardIcon = document.getElementsByClassName("cardIcon");

  myProject.map((x, i) => {
    let icon = "";

    icons.map((y, j) => {
      if (x.technologi1 === true && j === 0) {
        icon += `<img src="${icons[0].imageUrl}" alt="icon ${icons[0].name}" class="icon">`;
      }

      if (x.technologi2 === true && j === 1) {
        icon += `<img src="${icons[1].imageUrl}" alt="icon ${icons[1].name}" class="icon">`;
      }

      if (x.technologi3 === true && j === 2) {
        icon += `<img src="${icons[2].imageUrl}" alt="icon ${icons[2].name}" class="icon">`;
      }

      if (x.technologi4 === true && j === 3) {
        icon += `<img src="${icons[3].imageUrl}" alt="icon ${icons[3].name}" class="icon">`;
      }
    });

    cardIcon[i].innerHTML = icon;
  });

  let cardDelete = document.querySelectorAll(".cardDelete");

  myProject.map((e, i) => {
    cardDelete[i].addEventListener("click", () => {
      let result = confirm("Yakin ingin menghapus?");

      if (result) {
        myProject.splice(i, 1);
        renderElement();
      }
    });
  });
});