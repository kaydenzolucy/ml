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
const RANK_ORDER = ["Master","GM","Epic","Legend","Mythic","Honor","Glory","Immortal"];
const DIVISI = ["V","IV","III","II","I"];
const STAR_PER_DIV = 5;

// Star awal untuk Mythic+ rank
const STAR_START = {
  Mythic:0,
  Honor:25,
  Glory:50,
  Immortal:100
};

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

// Apply init
["rank1","rankA","rankB","rankG1","rankGA","rankGB","rankE"].forEach(fillRank);
["div1","divA","divB","divG1","divGA","divGB","divE"].forEach(fillDiv);

// ======================
// SHOW/HIDE MENU
// ======================
function showMenu(n){
  document.querySelectorAll(".box").forEach(b=>b.style.display="none");
  const target = document.getElementById("menu"+n);
  if(target) target.style.display = "block";
  if(n === 6) showPriceList();
}

// ======================
// RANK + DIVISI → STAR
// ======================
function rankToStar(rank, div, star){
  if(["Master","GM","Epic","Legend"].includes(rank)){
    let rankIndex = RANK_ORDER.indexOf(rank);
    let divIndex = DIVISI.indexOf(div);
    return rankIndex * STAR_PER_DIV * DIVISI.length + divIndex * STAR_PER_DIV + star;
  } else {
    // Mythic+ tanpa divisi
    return STAR_START[rank] + star;
  }
}

// ======================
// STAR → RANK
// ======================
function starToRank(total){
  if(total < STAR_START.Honor) {
    let star = total;
    return `Mythic ⭐${star}`;
  } else if(total < STAR_START.Glory) {
    let star = total - STAR_START.Honor;
    return `Honor ⭐${star}`;
  } else if(total < STAR_START.Immortal) {
    let star = total - STAR_START.Glory;
    return `Glory ⭐${star}`;
  } else {
    let star = total - STAR_START.Immortal;
    return `Immortal ⭐${star}`;
  }
}

// ======================
// INVOICE
// ======================
function tampilInvoice(start, end, price, title){
  let detail = {};
  let total = 0;
  RANK_ORDER.forEach(r => detail[r] = 0);

  for(let s=start; s<end; s++){
    let r;
    if(s < STAR_START.Honor) r="Mythic";
    else if(s < STAR_START.Glory) r="Honor";
    else if(s < STAR_START.Immortal) r="Glory";
    else r="Immortal";

    if(price[r]){
      detail[r]++;
      total += price[r];
    }
  }

  let out = `--- ${title} ---\n`;
  for(let r of RANK_ORDER){
    if(detail[r]>0){
      out += `${r.padEnd(10)} : ${detail[r]} ⭐  Rp${(detail[r]*price[r]).toLocaleString()}\n`;
    }
  }

  out += `-----------------------------\n`;
  out += `Total Bintang : ${end-start} ⭐\n`;
  out += `Rank Akhir    : ${starToRank(end-1)}\n`;
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
  let start = rankToStar(rankA.value, divA.value, +starA.value);
  let end   = rankToStar(rankB.value, divB.value, +starB.value)+1;
  tampilInvoice(start, end, PRICE, "JOKI ANTAR RANK");
}

function hitungGendongBintang(){
  let s = rankToStar(rankG1.value, divG1.value, +starG1.value);
  tampilInvoice(s, s + +addStarG.value, GENDONG, "GENDONG PER BINTANG");
}

function hitungGendongRank(){
  let start = rankToStar(rankGA.value, divGA.value, +starGA.value);
  let end   = rankToStar(rankGB.value, divGB.value, +starGB.value)+1;
  tampilInvoice(start, end, GENDONG, "GENDONG ANTAR RANK");
}

// ======================
// ESTIMASI NOMINAL
// ======================
function estimasiNominal(){
  let harga = mode.value==="PRICE"?PRICE:GENDONG;
  let start = rankToStar(rankE.value, divE.value, +starE.value);
  let cur = start;
  let saldo = +nominal.value;
  let used = 0;

  while(true){
    let r;
    if(cur < STAR_START.Honor) r="Mythic";
    else if(cur < STAR_START.Glory) r="Honor";
    else if(cur < STAR_START.Immortal) r="Glory";
    else r="Immortal";

    if(!harga[r]||saldo<harga[r]) break;
    saldo-=harga[r];
    used+=harga[r];
    cur++;
  }

  hasil.textContent =
`--- ESTIMASI ---
Rank Awal : ${rankE.value} ${divE.value} ⭐${starE.value}
Modal     : Rp${(+nominal.value).toLocaleString()}
-----------------------------
Naik      : ${cur-start} ⭐
Rank Akhir: ${starToRank(cur-1)}
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
// HIDE DIVISI + LIMIT STAR
// ======================
function updateDivisi(rankElId, divElId, starElId){
  const rankEl = document.getElementById(rankElId);
  const divEl  = document.getElementById(divElId);
  const starEl = document.getElementById(starElId);
  if(!rankEl||!divEl||!starEl) return;

  rankEl.addEventListener("change", ()=>{
    const rank = rankEl.value;
    if(["Mythic","Honor","Glory","Immortal"].includes(rank)){
      divEl.classList.add("hidden"); // pakai css .hidden { display:none; transition:0.3s; }
      starEl.value=0;
      starEl.max=1000; // unlimited
    } else {
      divEl.classList.remove("hidden");
      starEl.value=0;
      starEl.max=5;
    }
  });
}

// APPLY
updateDivisi("rank1","div1","star1");
updateDivisi("rankA","divA","starA");
updateDivisi("rankB","divB","starB");
updateDivisi("rankG1","divG1","starG1");
updateDivisi("rankGA","divGA","starGA");
updateDivisi("rankGB","divGB","starGB");
updateDivisi("rankE","divE","starE");

// ======================
showMenu(1);
showPriceList();
