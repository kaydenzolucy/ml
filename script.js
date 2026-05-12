// ======================
// PRICE & GENDONG (PER STAR)
// ======================
const PRICE = {
  Warrior: 1500,
  Elite: 2000,
  Master: 2500,
  GM: 3000,
  Epic: 4000,
  Legend: 5000,
  Mythic: 6000,
  Honor: 7000,
  Glory: 8000,
  Immortal: 10000
};

const GENDONG = {
  Epic: 7000,
  Legend: 8000,
  Mythic: 10000,
  Honor: 12000,
  Glory: 15000,
  Immortal: 20000
};

// ======================
// CURRENCY CONFIG
// ======================
let CURRENT_CURRENCY = "IDR";
let RATE_IDR_TO_MYR = 0.00030;
const FALLBACK_RATE = 0.00030;
const FEE_MYR = 10000;

// ======================
// ELEMENTS
// ======================
const currency   = document.getElementById("currency");
const rateInfo   = document.getElementById("rateInfo");
const hasil      = document.getElementById("hasil");
const pricelist  = document.getElementById("pricelist");

// ======================
// RANK CONFIG (MLBB SYSTEM)
// ======================
// Ranks with divisions and stars per division
const RANKS_WITH_DIVS = {
  Warrior:  { divisions: ["III","II","I"], starsPerDiv: 3 },
  Elite:    { divisions: ["III","II","I"], starsPerDiv: 4 },
  Master:   { divisions: ["IV","III","II","I"], starsPerDiv: 4 },
  GM:       { divisions: ["V","IV","III","II","I"], starsPerDiv: 5 },
  Epic:     { divisions: ["V","IV","III","II","I"], starsPerDiv: 5 },
  Legend:   { divisions: ["V","IV","III","II","I"], starsPerDiv: 5 }
};

// Mythic+ ranks (no divisions, pure stars)
const RANK_ORDER = ["Warrior","Elite","Master","GM","Epic","Legend","Mythic","Honor","Glory","Immortal"];

// For dropdown display
const RANK_DIVISI = ["Warrior","Elite","Master","GM","Epic","Legend"];
const DIVISI = ["V","IV","III","II","I"];

// ======================
// FETCH RATE (Frankfurter + Fallback)
// ======================
async function fetchRate(){
  try{
    // Primary: Frankfurter API
    const r = await fetch(
      "https://api.frankfurter.app/latest?from=IDR&to=MYR",
      { cache:"no-store" }
    );
    if(r.ok){
      const d = await r.json();
      if(d?.rates?.MYR){
        RATE_IDR_TO_MYR = d.rates.MYR;
        rateInfo.textContent = `1 MYR ≈ Rp${Math.round(1/RATE_IDR_TO_MYR).toLocaleString()}`;
        return;
      }
    }
    throw new Error("Frankfurter failed");
  }catch(err1){
    try{
      // Fallback: exchangerate-api.com
      const r2 = await fetch(
        "https://api.exchangerate-api.com/v4/latest/IDR",
        { cache:"no-store" }
      );
      if(r2.ok){
        const d2 = await r2.json();
        if(d2?.rates?.MYR){
          RATE_IDR_TO_MYR = d2.rates.MYR;
          rateInfo.textContent = `1 MYR ≈ Rp${Math.round(1/RATE_IDR_TO_MYR).toLocaleString()}`;
          return;
        }
      }
      throw new Error("Fallback failed");
    }catch{
      // Ultimate fallback
      RATE_IDR_TO_MYR = FALLBACK_RATE;
      rateInfo.textContent = "Kurs default (offline)";
    }
  }
}

// ======================
// FORMAT HARGA
// ======================
function formatHarga(rp){
  if(CURRENT_CURRENCY === "IDR"){
    return `Rp${rp.toLocaleString()}`;
  }
  return `RM ${(rp * RATE_IDR_TO_MYR).toFixed(2)}`;
}

// ======================
// CHANGE CURRENCY
// ======================
function changeCurrency(){
  CURRENT_CURRENCY = currency.value;
  showPriceList();
}

// ======================
// INIT SELECT
// ======================
function fillRank(id){
  const el = document.getElementById(id);
  if(!el) return;
  el.innerHTML = "";
  RANK_ORDER.forEach(r => {
    const o = document.createElement("option");
    o.value = r;
    o.textContent = r;
    el.appendChild(o);
  });
}

function fillDiv(id){
  const el = document.getElementById(id);
  if(!el) return;
  el.innerHTML = "";
  DIVISI.forEach(d => {
    const o = document.createElement("option");
    o.value = d;
    o.textContent = d;
    el.appendChild(o);
  });
}

["rank1","rankA","rankB","rankG1","rankGA","rankGB","rankE"].forEach(fillRank);
["div1","divA","divB","divG1","divGA","divGB","divE"].forEach(fillDiv);

// ======================
// MENU
// ======================
function showMenu(n){
  document.querySelectorAll(".box").forEach(b => b.classList.remove("show"));
  const target = document.getElementById("menu" + n);
  if(target){
    target.classList.add("show");
    // Scroll to box smoothly
    setTimeout(() => {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }
  if(n === 6) showPriceList();
}

// ======================
// DIVISI TOGGLE (show/hide div select based on rank)
// ======================
function updateDivisi(rankId, divId){
  const r = document.getElementById(rankId);
  const d = document.getElementById(divId);
  if(!r || !d) return;

  // Initial check
  if(!RANK_DIVISI.includes(r.value)){
    d.style.display = "none";
    d.value = "";
  }

  r.addEventListener("change", () => {
    if(RANK_DIVISI.includes(r.value)){
      d.style.display = "block";
    }else{
      d.style.display = "none";
      d.value = "";
    }
  });
}

["rank1","rankA","rankB","rankG1","rankGA","rankGB","rankE"]
.forEach(id => updateDivisi(id, id.replace("rank","div")));

// ======================
// RANK -> TOTAL STARS (absolute position in ladder)
// ======================
function rankToStar(rank, div, star){
  let totalStars = 0;

  // Calculate stars for all ranks before this one
  for(const r of RANK_ORDER){
    if(r === rank) break;

    if(r === "Mythic"){
      totalStars += 25; // Mythic = 0-24 (25 stars total)
    }else if(r === "Honor"){
      totalStars += 25; // Honor = 25-49 (25 stars)
    }else if(r === "Glory"){
      totalStars += 50; // Glory = 50-99 (50 stars)
    }else if(r === "Immortal"){
      // Immortal has no fixed max, but for calculation we treat it as open
      // This shouldn't happen in normal flow
    }else{
      // Ranks with divisions
      const config = RANKS_WITH_DIVS[r];
      if(config){
        totalStars += config.divisions.length * config.starsPerDiv;
      }
    }
  }

  // Add stars within current rank
  if(RANKS_WITH_DIVS[rank]){
    const config = RANKS_WITH_DIVS[rank];
    const divIndex = config.divisions.indexOf(div);
    if(divIndex !== -1){
      totalStars += divIndex * config.starsPerDiv;
    }
    totalStars += star;
  }else{
    // Mythic+ (no divisions)
    totalStars += star;
  }

  return totalStars;
}

// ======================
// TOTAL STARS -> RANK (reverse conversion)
// ======================
function starToRank(totalStars){
  let remaining = totalStars;

  for(const rank of RANK_ORDER){
    let rankSize;

    if(rank === "Mythic"){
      rankSize = 25; // 0-24
    }else if(rank === "Honor"){
      rankSize = 25; // 25-49
    }else if(rank === "Glory"){
      rankSize = 50; // 50-99
    }else if(rank === "Immortal"){
      // Immortal starts at 100, no upper limit
      return `Immortal ⭐${remaining}`;
    }else{
      const config = RANKS_WITH_DIVS[rank];
      rankSize = config ? config.divisions.length * config.starsPerDiv : 0;
    }

    if(remaining < rankSize){
      // Within this rank
      if(RANKS_WITH_DIVS[rank]){
        const config = RANKS_WITH_DIVS[rank];
        const divIndex = Math.floor(remaining / config.starsPerDiv);
        const div = config.divisions[divIndex] || "I";
        const star = remaining % config.starsPerDiv;
        return `${rank} ${div} ⭐${star}`;
      }else{
        return `${rank} ⭐${remaining}`;
      }
    }

    remaining -= rankSize;
  }

  return `Immortal ⭐${remaining}`;
}

// ======================
// GET PRICE FOR A STAR (based on what rank it's in)
// ======================
function getPriceForStar(starNum, priceTable){
  const rankName = starToRank(starNum).split(" ")[0];
  return priceTable[rankName] || 0;
}

// ======================
// INVOICE
// ======================
function tampilInvoice(start, end, priceTable, title){
  let map = {}, total = 0;
  RANK_ORDER.forEach(r => map[r] = 0);

  for(let i = start; i < end; i++){
    const rankName = starToRank(i).split(" ")[0];
    const price = getPriceForStar(i, priceTable);
    map[rankName]++;
    total += price;
  }

  let out = `═══ ${title} ═══\n`;
  for(const r of RANK_ORDER){
    if(map[r] > 0){
      out += `${r.padEnd(10)} : ${map[r]}⭐ x ${formatHarga(PRICE[r])}\n`;
    }
  }

  if(CURRENT_CURRENCY === "MYR"){
    total += FEE_MYR;
    out += `Fee MYR     : ${formatHarga(FEE_MYR)}\n`;
  }

  out += `TOTAL        : ${formatHarga(total)}`;
  hasil.textContent = out;
}

// ======================
// HITUNG FUNCTIONS
// ======================
function hitungPerBintang(){
  const s1 = rankToStar(rank1.value, div1.value, +star1.value);
  const s2 = s1 + (+addStar.value);
  tampilInvoice(s1, s2, PRICE, "JOKI PER BINTANG");
}

function hitungAntarRank(){
  const s1 = rankToStar(rankA.value, divA.value, +starA.value);
  const s2 = rankToStar(rankB.value, divB.value, +starB.value);
  if(s2 <= s1){
    hasil.textContent = "⚠ Rank tujuan harus lebih tinggi!";
    return;
  }
  tampilInvoice(s1, s2, PRICE, "JOKI ANTAR RANK");
}

function hitungGendongBintang(){
  const s1 = rankToStar(rankG1.value, divG1.value, +starG1.value);
  const s2 = s1 + (+addStarG.value);
  tampilInvoice(s1, s2, GENDONG, "GENDONG PER BINTANG");
}

function hitungGendongRank(){
  const s1 = rankToStar(rankGA.value, divGA.value, +starGA.value);
  const s2 = rankToStar(rankGB.value, divGB.value, +starGB.value);
  if(s2 <= s1){
    hasil.textContent = "⚠ Rank tujuan harus lebih tinggi!";
    return;
  }
  tampilInvoice(s1, s2, GENDONG, "GENDONG ANTAR RANK");
}

// ======================
// ESTIMASI
// ======================
function estimasiNominal(){
  const harga = mode.value === "PRICE" ? PRICE : GENDONG;
  let cur = rankToStar(rankE.value, divE.value, +starE.value);
  const saldo = +nominal.value;
  const start = cur;
  let used = 0;

  while(true){
    const rankName = starToRank(cur).split(" ")[0];
    const price = harga[rankName] || 0;
    if(price > saldo - used) break;
    used += price;
    cur++;
  }

  hasil.textContent = 
`═══ ESTIMASI ═══
Naik       : ${cur - start} ⭐
Terpakai   : ${formatHarga(used)}
Sisa       : ${formatHarga(saldo - used)}`;
}

// ======================
// PRICE LIST
// ======================
function showPriceList(){
  let out = "═══ JOKI RANK ═══\n";
  for(const r in PRICE){
    out += `${r.padEnd(10)} : ${formatHarga(PRICE[r])}/⭐\n`;
  }
  out += "\n═══ GENDONG ═══\n";
  for(const r in GENDONG){
    out += `${r.padEnd(10)} : ${formatHarga(GENDONG[r])}/⭐\n`;
  }
  pricelist.textContent = out;
}

// ======================
// INIT
// ======================
fetchRate();
showMenu(1);
showPriceList();

// ======================
// MINRA GALLERY (Background Animation)
// ======================
const minraImgs = document.querySelectorAll(".minra-img");
const minDistance = 80;
const marginTop = 120;
const marginBottom = 50;

function getGridPositions() {
  const cols = Math.floor(window.innerWidth / minDistance);
  const rows = Math.floor((window.innerHeight - marginTop - marginBottom) / minDistance);
  const grid = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      grid.push({ x: c * minDistance + 20, y: marginTop + r * minDistance + 20 });
    }
  }
  return grid;
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

let positions = shuffle(getGridPositions());

minraImgs.forEach((img, i) => {
  const pos = positions[i % positions.length];
  img.dataset.baseX = pos.x;
  img.dataset.baseY = pos.y;
  const size = 40 + Math.random() * 60;
  img.style.width = size + "px";
  img.style.opacity = 0.4 + Math.random() * 0.5;
  animateImage(img, pos.x, pos.y);
});

function animateImage(img, baseX, baseY) {
  const maxOffset = 10;
  function move() {
    const offsetX = Math.sin(Date.now() / 1000 + baseX) * maxOffset;
    const offsetY = Math.cos(Date.now() / 1000 + baseY) * maxOffset;
    img.style.left = baseX + offsetX + "px";
    img.style.top = baseY + offsetY + "px";
    requestAnimationFrame(move);
  }
  move();
}

window.addEventListener("resize", () => {
  positions = shuffle(getGridPositions());
  minraImgs.forEach((img, i) => {
    const pos = positions[i % positions.length];
    img.dataset.baseX = pos.x;
    img.dataset.baseY = pos.y;
  });
});
