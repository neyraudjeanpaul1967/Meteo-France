// --- Carrousel jours ---
// Tableau contenant les images et alt pour chaque jour de la semaine.
// Sert à afficher l'image correspondante dans le carrousel.
const jours = [
  { src: "./assets/img/lundi.png", alt: "lundi" },
  { src: "./assets/img/mardi.png", alt: "mardi" },
  { src: "./assets/img/mercredi.png", alt: "mercredi" },
  { src: "./assets/img/jeudi.png", alt: "jeudi" },
  { src: "./assets/img/vendredi.png", alt: "vendredi" },
  { src: "./assets/img/samedi.png", alt: "samedi" },
  { src: "./assets/img/dimanche.png", alt: "dimanche" },
];

// Initialisation de l'index du jour affiché dans le carrousel et récupération des éléments du DOM pour l'image et les boutons.
let index = 0;
const img = document.getElementById("carousselImg");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
let infoMatin;
let infoApres;
let infoSoir;

// Fonction qui met à jour l'image du carrousel et affiche la météo du jour sélectionné.
function updateCaroussel() {
  img.src = jours[index].src;
  img.alt = jours[index].alt;
  displayMeteoForDay(index);
}

// Gestionnaire d'événement pour le bouton précédent : décrémente l'index et met à jour le carrousel.
prevBtn.addEventListener("click", () => {
  index = (index - 1 + jours.length) % jours.length;
  updateCaroussel();
});

// Gestionnaire d'événement pour le bouton suivant : incrémente l'index et met à jour le carrousel.
nextBtn.addEventListener("click", () => {
  index = (index + 1) % jours.length;
  updateCaroussel();
});

// --- Météo API ---
// Sélection des éléments du DOM pour le formulaire, les champs de saisie, les titres, les images et les blocs d'affichage.
const form = document.querySelector(".valider");
const input = document.querySelector(".recherche");
const villeTitre = document.querySelector(".ville-titre");
const imgVille = document.querySelector(".img-ville");
const bulletin = document.querySelector(".bulletin");
const infos = document.querySelector(".infos");
const autocompleteList = document.querySelector(".autocomplete-list");

// Déclaration de la clé API et de l'URL de l'API OpenWeatherMap pour les prévisions météo.
const API_KEY = "07999b6dee5f40e19ea66fc271a547d0";
const API_URL = "https://api.openweathermap.org/data/2.5/forecast";

let forecastData = null;

// Gestionnaire de soumission du formulaire : récupère la ville, lance la requête API, affiche les résultats ou un message d'erreur.
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const ville = input.value.trim();
  if (!ville) return;

  // Affiche "Chargement..." pendant la récupération des données.
  villeTitre.textContent = "Chargement...";

  try {
    const url = `${API_URL}?q=${encodeURIComponent(
      ville
    )},fr&appid=${API_KEY}&units=metric&lang=fr`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Ville non trouvée");
    const data = await response.json();

    villeTitre.textContent = data.city.name;
    forecastData = data;
    const now = new Date();
    const currentDay = now.getDay() === 0 ? 6 : now.getDay() - 1;
    displayMeteoForDay(currentDay);
  } catch (err) {
    villeTitre.textContent = "Ville non trouvée";
    bulletin.innerHTML = "";
    infos.innerHTML = "";
    matinDiv.innerHTML = "matin";
    apresDiv.innerHTML = "après midi";
    soirDiv.innerHTML = "soiré";
  }
});

// Fonction qui affiche la météo pour un jour donné (matin, après-midi, soir) dans les blocs correspondants.
function displayMeteoForDay(dayIndex) {
  if (!forecastData) return;

  const city = forecastData.city;
  const list = forecastData.list;

  // Calcule la date du jour sélectionné à partir de l'index (0 = lundi, etc.)
  const now = new Date();
  const currentDay = now.getDay() === 0 ? 6 : now.getDay() - 1; // 0 = lundi
  const diff = dayIndex - currentDay;
  const targetDate = new Date(now);
  targetDate.setDate(now.getDate() + diff);

  // Filtre les prévisions pour ne garder que celles du jour voulu.
  const forecasts = list.filter((item) => {
    const d = new Date(item.dt_txt);
    return (
      d.getDate() === targetDate.getDate() &&
      d.getMonth() === targetDate.getMonth() &&
      d.getFullYear() === targetDate.getFullYear()
    );
  });

  // Fonction utilitaire pour trouver la prévision la plus proche d'une heure donnée.
  function getClosest(hour) {
    return forecasts.reduce((prev, curr) => {
      const currHour = new Date(curr.dt_txt).getHours();
      return Math.abs(currHour - hour) <
        Math.abs(new Date(prev.dt_txt).getHours() - hour)
        ? curr
        : prev;
    }, forecasts[0]);
  }
  const matin = getClosest(9);
  const apres = getClosest(15);
  const soir = getClosest(21);

  const matinDiv = document.querySelector("#matin");
  const apresDiv = document.querySelector("#apres");
  const soirDiv = document.querySelector("#soir");

  // Affiche les infos météo dans chaque bloc (matin, après-midi, soir)
  if (!infoMatin) {
    infoMatin = document.createElement("div");
    infoMatin.innerHTML = `<img src="https://openweathermap.org/img/wn/${
      matin.weather[0].icon
    }.png" alt="">
      <br>${Math.round(matin.main.temp)}°C<br>
      <small>${matin.weather[0].description}</small>
    `;
    matinDiv.appendChild(infoMatin);
  } else {
    infoMatin.innerHTML = `<img src="https://openweathermap.org/img/wn/${
      matin.weather[0].icon
    }.png" alt="">
      <br>${Math.round(matin.main.temp)}°C<br>
      <small>${matin.weather[0].description}</small>
    `;
  }

  if (!infoApres) {
    infoApres = document.createElement("div");
    infoApres.innerHTML = `<img src="https://openweathermap.org/img/wn/${
      apres.weather[0].icon
    }.png" alt="">
      <br>${Math.round(apres.main.temp)}°C<br>
      <small>${apres.weather[0].description}</small>
    `;
    apresDiv.appendChild(infoApres);
  } else {
    infoApres.innerHTML = `<img src="https://openweathermap.org/img/wn/${
      apres.weather[0].icon
    }.png" alt="">
      <br>${Math.round(apres.main.temp)}°C<br>
      <small>${apres.weather[0].description}</small>
    `;
  }

  if (!infoSoir) {
    infoSoir = document.createElement("div");
    infoSoir.innerHTML = `<img src="https://openweathermap.org/img/wn/${
      soir.weather[0].icon
    }.png" alt="">
      <br>${Math.round(soir.main.temp)}°C<br>
      <small>${soir.weather[0].description}</small>
    `;
    soirDiv.appendChild(infoSoir);
  } else {
    infoSoir.innerHTML = `<img src="https://openweathermap.org/img/wn/${
      soir.weather[0].icon
    }.png" alt="">
      <br>${Math.round(soir.main.temp)}°C<br>
      <small>${soir.weather[0].description}</small>
    `;
  }
  // Affiche le bulletin général avec les températures min et max du jour.
  infos.innerHTML = `
    <p>Min: ${Math.round(
      Math.min(...[matin, apres, soir].filter(Boolean).map((x) => x.main.temp))
    )}°C</p>
    <p>Max: ${Math.round(
      Math.max(...[matin, apres, soir].filter(Boolean).map((x) => x.main.temp))
    )}°C</p>
  `;
}

// Fonction pour chercher les villes françaises via l'API gouvernementale et afficher les suggestions d'autocomplétion.
async function fetchCommunes(query) {
  if (query.length < 2) {
    autocompleteList.innerHTML = "";
    return;
  }
  const url = `https://geo.api.gouv.fr/communes?nom=${encodeURIComponent(
    query
  )}&fields=nom&boost=population&limit=7`;
  const res = await fetch(url);
  const data = await res.json();
  autocompleteList.innerHTML = "";
  data.forEach((commune) => {
    const li = document.createElement("li");
    li.textContent = commune.nom;
    li.addEventListener("mousedown", () => {
      input.value = commune.nom;
      autocompleteList.innerHTML = "";
    });
    autocompleteList.appendChild(li);
  });
}

// Affiche la liste des suggestions à chaque frappe dans le champ de recherche.
input.addEventListener("input", (e) => {
  fetchCommunes(e.target.value);
});

// Ferme la liste d'autocomplétion si on clique ailleurs que dans le champ de recherche.
document.addEventListener("click", (e) => {
  if (!e.target.classList.contains("recherche")) {
    autocompleteList.innerHTML = "";
  }
});

// Affiche la météo du jour courant au chargement de la page.
const now = new Date();
const currentDay = now.getDay() === 0 ? 6 : now.getDay() - 1; // 0 = lundi
displayMeteoForDay(currentDay);
