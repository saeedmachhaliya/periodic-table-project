// ============================================================
//  PERIODIC TABLE — Interactive Element Explorer
//  Cosmic Dark Theme · app.js
// ============================================================

// ─── DOM REFERENCES ─────────────────────────────────────────
const tileArray        = document.querySelectorAll(".elementTile");
const modalContainer   = document.querySelector(".modalContainer");
const closeButton      = document.querySelector(".closeButton");
const previousButton   = document.querySelector(".previousButton");
const nextButton       = document.querySelector(".nextButton");
const modalFactLabel   = document.querySelector(".modalFactLabel");
const modalLabels      = document.querySelectorAll(".modalLabel");

const modalHeading     = document.querySelector(".modalHeading");
const modalElementSymbol = document.querySelector(".modalElementSymbol");
const atomicNumber     = document.querySelector(".atomicNumber");
const elementalGroup   = document.querySelector(".elementalGroup");
const elementState     = document.querySelector(".elementState");
const yearDiscovered   = document.querySelector(".yearDiscovered");
const elementFacts     = document.querySelector(".elementFacts");
const elementHistory   = document.querySelector(".elementHistory");

// ─── DATA SOURCE (CORS-safe, no API key needed) ─────────────
const DATA_URL =
  "https://raw.githubusercontent.com/Bowserinator/Periodic-Table-JSON/master/PeriodicTableJSON.json";

// ─── STATE ──────────────────────────────────────────────────
let selectedTileIndex = null;
let allElementsData   = null;

// ─── FETCH (cached) ─────────────────────────────────────────
async function fetchAllElements() {
  if (allElementsData) return allElementsData;
  try {
    const response = await fetch(DATA_URL);
    const data     = await response.json();
    allElementsData = data.elements;
    return allElementsData;
  } catch (err) {
    console.error("Failed to fetch element data:", err);
  }
}

// ─── COLOR MAP (matches CSS class colors) ───────────────────
const GROUP_COLORS = {
  "Non-Metal":           "#eab308",   // yellow
  "Noble Gas":           "#ec4899",   // pink
  "Alkali Metal":        "#ef4444",   // red
  "Alkaline Earth Metal":"#8b5cf6",   // violet
  "Metalloid":           "#14b8a6",   // teal
  "Post Transition Metal":"#84cc16",  // lime
  "Halogen":             "#f97316",   // orange
  "Transition Metal":    "#0ea5e9",   // sky blue
  "Lanthanide":          "#6366f1",   // indigo
  "Actinide":            "#f59e0b",   // amber
};

function getGroupColor(group) {
  return GROUP_COLORS[group] || "#7c3aed";
}

// ─── POPULATE MODAL ─────────────────────────────────────────
async function openModal(tileIndex) {
  const tile               = tileArray[tileIndex];
  const clickedElementNum  = Number(tile.querySelector(".elementNumber").innerText);
  const clickedGroup       = tile.getAttribute("title");

  // Show overlay immediately
  modalContainer.style.display = "block";
  selectedTileIndex = tileIndex;

  // Fetch data
  const elements = await fetchAllElements();
  if (!elements) return;

  const el = elements.find(e => e.number === clickedElementNum);
  if (!el) return;

  // ── Populate fields ──
  modalElementSymbol.innerText = el.symbol;
  modalHeading.innerText       = el.name;
  atomicNumber.innerText       = el.number;
  elementalGroup.innerText     = clickedGroup;
  elementState.innerText       = el.phase       || "Unknown";
  yearDiscovered.innerText     = el.discovered_by || "Unknown";

  // ── Apply accent color ──
  const color = getGroupColor(clickedGroup);

  modalElementSymbol.style.borderColor    = color;
  modalElementSymbol.style.boxShadow      = `0 0 16px ${color}40`;
  modalHeading.style.borderBottomColor    = color;

  modalLabels.forEach(label => {
    label.style.borderLeftColor = color;
    // Only color the label text (not the span.modalInfo inside it)
    label.style.color = color;
  });
  // Reset .modalInfo spans to muted color
  document.querySelectorAll(".modalInfo").forEach(info => {
    info.style.color = "#94a3b8";
  });

  // ── Facts / Summary ──
  if (el.summary) {
    modalFactLabel.style.display = "block";
    elementFacts.textContent     = el.summary;
    elementHistory.textContent   = el.summary;
  } else {
    modalFactLabel.style.display = "none";
    elementFacts.textContent     = "";
    elementHistory.textContent   = "No detailed history available.";
  }

  // Scroll infoSection back to top on each open
  const infoSection = document.querySelector(".infoSection");
  if (infoSection) infoSection.scrollTop = 0;
}

// ─── TILE CLICK LISTENERS ────────────────────────────────────
tileArray.forEach((tile, index) => {
  tile.addEventListener("click", () => openModal(index));
});

// ─── CLOSE MODAL ────────────────────────────────────────────
function closeModal() {
  modalContainer.style.display = "none";
}

closeButton.addEventListener("click", closeModal);

// Close when clicking the dark overlay (outside the card)
modalContainer.addEventListener("click", (e) => {
  if (e.target === modalContainer) closeModal();
});

// ─── PREVIOUS / NEXT ────────────────────────────────────────
function handlePrev() {
  if (selectedTileIndex === null) return;
  selectedTileIndex = (selectedTileIndex - 1 + tileArray.length) % tileArray.length;
  openModal(selectedTileIndex);
}

function handleNext() {
  if (selectedTileIndex === null) return;
  selectedTileIndex = (selectedTileIndex + 1) % tileArray.length;
  openModal(selectedTileIndex);
}

previousButton.addEventListener("click", handlePrev);
nextButton.addEventListener("click", handleNext);

// ─── KEYBOARD NAVIGATION ────────────────────────────────────
document.addEventListener("keydown", (e) => {
  switch (e.key) {
    case "ArrowLeft":  handlePrev();  break;
    case "ArrowRight": handleNext();  break;
    case "Escape":     closeModal();  break;
  }
});
