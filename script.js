// ======================
// PRICE
// ======================
const PRICE = {
  Master:3000,
  GM:4000,
  Epic:5000,
  Legend:6000,
  Mythic:13000,
  Honor:14000,
  Glory:20000,
  Immortal:24000
};

const GENDONG = {
  Epic:9000,
  Legend:10000,
  Mythic:15000,
  Honor:16000,
  Glory:25000,
  Immortal:35000
};

// ======================
// RANK DATA
// ======================
const RANK_ORDER = [
  "Master","GM","Epic","Legend",
  "Mythic","Honor","Glory","Immortal"
];

const RANK_DIVISI = ["Master","GM","Epic","Legend"];
const DIVISI = ["V","IV","III","II","I"];

const STAR_PER_DIV = 5; // 0-5 bintang per divisi
const STAR_PER_RANK = 25; // 5 divisi x 6 bintang

// batas mythic+
const MYTHIC_START   = 0;    // ⭐1
const HONOR_START    = 25;   // ⭐26
const GLORY_START    = 50;   // ⭐51
const IMMORTAL_START = 100;  // ⭐101

// ======================
// INIT SELECT
// ======================
function fillRank(id){
  const el = document.getElementById(id);
  if(!el) return;
  el.innerHTML = "";
  RANK_ORDER.forEach(r=>{
    let o = document.createElement("option");
    o.value = r;
    o.textContent = r;
    el.appendChild(o);
  });
}

function fillDiv(id){
  const el = document.getElementById(id);
  if(!el) return;
  el.innerHTML = "";
  DIVISI.forEach(d=>{
    let o = document.createElement("option");
    o.value = d;
    o.textContent = d;
    el.appendChild(o);
  });
}

[
  "rank1","rankA","rankB",
  "rankG1","rankGA","rankGB",
  "rankE"
].forEach(fillRank);

[
  "div1","divA","divB",
  "divG1","divGA","divGB",
  "divE"
].forEach(fillDiv);

// ======================
// MENU
// ======================
function showMenu(n){
  document.querySelectorAll(".box").forEach(b=>b.style.display="none");
  const target = document.getElementById("menu"+n);
  if(target) target.style.display = "block";
  if(n === 6) showPriceList();
}

// ======================
// RANK → TOTAL STAR
// ======================
function rankToStar(rank, div, star){
  if(RANK_DIVISI.includes(rank)){
    let rIndex = RANK_ORDER.indexOf(rank);
    return rIndex*STAR_PER_RANK + DIVISI.indexOf(div)*STAR_PER_DIV + star;
  }

  // Mythic+
  if(rank === "Mythic")   return MYTHIC_START + star;
  if(rank === "Honor")    return HONOR_START + (star - 26);
  if(rank === "Glory")    return GLORY_START + (star - 51);
  if(rank === "Immortal") return IMMORTAL_START + (star - 101);

  return 0;
}

// ======================
// TOTAL STAR → RANK
// ======================
function starToRank(total){
  // rank bawah
  let rIndex = Math.floor(total / STAR_PER_RANK);
  let rank = RANK_ORDER[rIndex] || "Immortal";

  if(RANK_DIVISI.includes(rank)){
    let sisa = total % STAR_PER_RANK;
    let divIndex = Math.floor(sisa / STAR_PER_DIV);
    let starInDiv = sisa % STAR_PER_DIV;
    return `${rank} ${DIVISI[divIndex] || DIVISI[DIVISI.length-1]} ⭐${starInDiv}`;
  }

  // Mythic+
  if(total < HONOR_START) return `Mythic ⭐${total + 1}`;
  if(total < GLORY_START) return `Honor ⭐${total - HONOR_START + 26}`;
  if(total < IMMORTAL_START) return `Glory ⭐${total - GLORY_START + 51}`;
  return `Immortal ⭐${total - IMMORTAL_START + 101}`;
}

// ======================
// INVOICE RINGKAS
// ======================
function tampilInvoice(start, end, price, title){
  let detail = {};
  let total = 0;
  RANK_ORDER.forEach(r => detail[r] = 0);

  for(let s = start; s < end; s++){
    let r = RANK_ORDER[Math.min(Math.floor(s / STAR_PER_RANK), RANK_ORDER.length - 1)];

    // Mythic+
    if(s >= MYTHIC_START){
      if(s < HONOR_START) r = "Mythic";
      else if(s < GLORY_START) r = "Honor";
      else if(s < IMMORTAL_START) r = "Glory";
      else r = "Immortal";
    }

    if(price[r]){
      detail[r]++;
      total += price[r];
    }
  }

  let out = `--- ${title} ---\n`;
  for(let r of RANK_ORDER){
    if(detail[r] > 0){
      out += `${r.padEnd(10)} : ${detail[r]} ⭐  Rp${(detail[r] * price[r]).toLocaleString()}\n`;
    }
  }

  out += `-----------------------------\n`;
  out += `Total Bintang : ${end - start} ⭐\n`;
  out += `Rank Akhir    : ${starToRank(end)}\n`;
  out += `TOTAL         : Rp${total.toLocaleString()}`;

  hasil.textContent = out;
}

// ======================
// HITUNG
// ======================
function hitungPerBintang(){
  let s = rankToStar(rank1.value, div1.value, +star1.value);
  tampilInvoice(s, s + +addStar.value, PRICE, "JOKI PER BINTANG");
}

function hitungAntarRank(){
  tampilInvoice(
    rankToStar(rankA.value, divA.value, +starA.value),
    rankToStar(rankB.value, divB.value, +starB.value),
    PRICE,
    "JOKI ANTAR RANK"
  );
}

function hitungGendongBintang(){
  let s = rankToStar(rankG1.value, divG1.value, +starG1.value);
  tampilInvoice(s, s + +addStarG.value, GENDONG, "GENDONG PER BINTANG");
}

function hitungGendongRank(){
  tampilInvoice(
    rankToStar(rankGA.value, divGA.value, +starGA.value),
    rankToStar(rankGB.value, divGB.value, +starGB.value),
    GENDONG,
    "GENDONG ANTAR RANK"
  );
}

// ======================
// ESTIMASI NOMINAL
// ======================
function estimasiNominal(){
  let harga = mode.value === "PRICE" ? PRICE : GENDONG;

  let start = rankToStar(rankE.value, divE.value, +starE.value);
  let cur = start;
  let saldo = +nominal.value;
  let used = 0;

  while(true){
    let r = RANK_ORDER[Math.min(Math.floor(cur / STAR_PER_RANK), RANK_ORDER.length - 1)];
    if(cur >= MYTHIC_START){
      if(cur < HONOR_START) r = "Mythic";
      else if(cur < GLORY_START) r = "Honor";
      else if(cur < IMMORTAL_START) r = "Glory";
      else r = "Immortal";
    }

    if(!harga[r] || saldo < harga[r]) break;
    saldo -= harga[r];
    used += harga[r];
    cur++;
  }

  hasil.textContent =
`--- ESTIMASI ---
Rank Awal : ${rankE.value} ${divE.value} ⭐${starE.value}
Modal     : Rp${(+nominal.value).toLocaleString()}
-----------------------------
Naik      : ${cur - start} ⭐
Rank Akhir: ${starToRank(cur)}
Terpakai  : Rp${used.toLocaleString()}
Sisa      : Rp${saldo.toLocaleString()}`;
}

// ======================
// PRICE LIST
// ======================
function showPriceList(){
  let out = "=== JOKI PER BINTANG ===\n";
  for(let r of RANK_ORDER){
    if(PRICE[r]) out += `${r.padEnd(10)} : Rp${PRICE[r].toLocaleString()}\n`;
  }

  out += "\n=== GENDONG PER BINTANG ===\n";
  for(let r of RANK_ORDER){
    if(GENDONG[r]) out += `${r.padEnd(10)} : Rp${GENDONG[r].toLocaleString()}\n`;
  }

  pricelist.textContent = out;
}

// ======================
// INPUT LIMIT + DIVISI ANIMASI + RESET STAR
// ======================
function updateInput(rankSelectId, divSelectId, starInputId){
  const rankEl = document.getElementById(rankSelectId);
  const divEl  = document.getElementById(divSelectId);
  const starEl = document.getElementById(starInputId);

  if(!rankEl || !starEl) return;

  if(divEl){
    divEl.style.transition = "all .3s ease";
    divEl.style.overflow = "hidden";
  }

  function apply(){
    const rank = rankEl.value;
    starEl.value = "";

    if(RANK_DIVISI.includes(rank)){
      if(divEl){
        divEl.style.display = "block";
        divEl.style.opacity = "1";
        divEl.style.maxHeight = "60px";
        divEl.disabled = false;
      }
      starEl.min = 0;
      starEl.max = 5;
      starEl.placeholder = "0 - 5";
      return;
    }

    if(divEl){
      divEl.style.opacity = "0";
      divEl.style.maxHeight = "0";
      setTimeout(()=> divEl.style.display = "none", 300);
      divEl.disabled = true;
    }

    if(rank === "Mythic"){
      starEl.min = 1;
      starEl.max = 25;
      starEl.placeholder = "1 - 25";
    }
    else if(rank === "Honor"){
      starEl.min = 26;
      starEl.max = 50;
      starEl.placeholder = "26 - 50";
    }
    else if(rank === "Glory"){
      starEl.min = 51;
      starEl.max = 100;
      starEl.placeholder = "51 - 100";
    }
    else if(rank === "Immortal"){
      starEl.min = 101;
      starEl.max = 9999;
      starEl.placeholder = "101+";
    }
  }

  rankEl.addEventListener("change", apply);
  apply();
}

// ======================
// APPLY KE SEMUA INPUT
// ======================
updateInput("rank1","div1","star1");
updateInput("rankA","divA","starA");
updateInput("rankB","divB","starB");
updateInput("rankG1","divG1","starG1");
updateInput("rankGA","divGA","starGA");
updateInput("rankGB","divGB","starGB");
updateInput("rankE","divE","starE");

// ======================
showMenu(1);
