// ======================
// PRICE & GENDONG
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
const STAR_PER_DIV = 5;       // tiap divisi Master-GM-Epic-Legend
const STAR_PER_RANK = STAR_PER_DIV * DIVISI.length; // 25 per rank Master–Legend
const STAR_MYTHIC = {Mythic:24, Honor:25, Glory:50, Immortal:100}; // Mythic+

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

["rank1","rankA","rankB","rankG1","rankGA","rankGB","rankE"].forEach(fillRank);
["div1","divA","divB","divG1","divGA","divGB","divE"].forEach(fillDiv);

// ======================
// SHOW/HIDE MENU
// ======================
function showMenu(n){
  document.querySelectorAll(".box").forEach(b=>b.style.display="none");
  const target = document.getElementById("menu"+n);
  if(target) target.style.display = "block";
  if(n===6) showPriceList();
}

// ======================
// RANK/DIVISI → STAR
// ======================
function rankToStar(rank, div, star){
  if(["Master","GM","Epic","Legend"].includes(rank)){
    let divIndex = DIVISI.indexOf(div);
    return RANK_ORDER.indexOf(rank)*STAR_PER_RANK + divIndex*STAR_PER_DIV + star;
  } else {
    switch(rank){
      case "Mythic": return star;
      case "Honor": return STAR_MYTHIC.Mythic + star;
      case "Glory": return STAR_MYTHIC.Mythic + STAR_MYTHIC.Honor + star;
      case "Immortal": return STAR_MYTHIC.Mythic + STAR_MYTHIC.Honor + STAR_MYTHIC.Glory + star;
    }
  }
  return 0;
}

// ======================
// STAR → RANK/DIVISI
// ======================
function starToRank(total){
  if(total < STAR_PER_RANK * 4){ // Master–Legend
    let rankIndex = Math.floor(total / STAR_PER_RANK);
    let rank = RANK_ORDER[rankIndex];
    let rem = total % STAR_PER_RANK;
    let divIndex = Math.floor(rem / STAR_PER_DIV);
    let star = rem % STAR_PER_DIV;
    return `${rank} ${DIVISI[divIndex]} ⭐${star}`;
  } else { // Mythic+
    if(total < STAR_MYTHIC.Mythic) return `Mythic ⭐${total}`;
    else if(total < STAR_MYTHIC.Mythic + STAR_MYTHIC.Honor) return `Honor ⭐${total - STAR_MYTHIC.Mythic}`;
    else if(total < STAR_MYTHIC.Mythic + STAR_MYTHIC.Honor + STAR_MYTHIC.Glory) return `Glory ⭐${total - STAR_MYTHIC.Mythic - STAR_MYTHIC.Honor}`;
    else return `Immortal ⭐${total - STAR_MYTHIC.Mythic - STAR_MYTHIC.Honor - STAR_MYTHIC.Glory}`;
  }
}

// ======================
// INVOICE DETAIL
// ======================
function tampilInvoice(start, end, price, title){
  let detail = {};
  RANK_ORDER.forEach(r => detail[r] = 0);
  let total = 0;

  for(let cur = start; cur < end; cur++){
    let r;
    if(cur < STAR_PER_RANK*4){ // Master–Legend
      let rankIndex = Math.floor(cur / STAR_PER_RANK);
      r = RANK_ORDER[rankIndex];
    } else if(cur < STAR_MYTHIC.Mythic) r = "Mythic";
    else if(cur < STAR_MYTHIC.Mythic + STAR_MYTHIC.Honor) r = "Honor";
    else if(cur < STAR_MYTHIC.Mythic + STAR_MYTHIC.Honor + STAR_MYTHIC.Glory) r = "Glory";
    else r = "Immortal";

    detail[r]++;
    total += price[r] || 0;
  }

  let out = `--- ${title} ---\n`;
  for(let r of RANK_ORDER){
    if(detail[r] > 0){
      out += `${r.padEnd(10)} : ${detail[r]} ⭐  Rp${(detail[r]*price[r]).toLocaleString()}\n`;
    }
  }
  out += `-----------------------------\n`;
  out += `Total Bintang : ${end - start} ⭐\n`;
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
  let sStart = rankToStar(rankA.value, divA.value, +starA.value);
  let sEnd = rankToStar(rankB.value, divB.value, +starB.value);
  if(sEnd <= sStart){
    hasil.textContent = "Error: Rank Tujuan harus lebih tinggi dari Rank Awal";
    return;
  }
  tampilInvoice(sStart, sEnd, PRICE, "JOKI ANTAR RANK");
}

function hitungGendongBintang(){
  let s = rankToStar(rankG1.value, divG1.value, +starG1.value);
  tampilInvoice(s, s + +addStarG.value, GENDONG, "GENDONG PER BINTANG");
}

function hitungGendongRank(){
  let sStart = rankToStar(rankGA.value, divGA.value, +starGA.value);
  let sEnd = rankToStar(rankGB.value, divGB.value, +starGB.value);
  if(sEnd <= sStart){
    hasil.textContent = "Error: Rank Tujuan harus lebih tinggi dari Rank Awal";
    return;
  }
  tampilInvoice(sStart, sEnd, GENDONG, "GENDONG ANTAR RANK");
}

// ======================
// ESTIMASI NOMINAL
// ======================
function estimasiNominal(){
  let harga = mode.value==="PRICE" ? PRICE : GENDONG;
  let start = rankToStar(rankE.value, divE.value, +starE.value);
  let cur = start;
  let saldo = +nominal.value;
  let used = 0;

  while(true){
    let r;
    if(cur < STAR_PER_RANK*4){
      let rankIndex = Math.floor(cur / STAR_PER_RANK);
      r = RANK_ORDER[rankIndex];
    } else if(cur < STAR_MYTHIC.Mythic) r = "Mythic";
    else if(cur < STAR_MYTHIC.Mythic + STAR_MYTHIC.Honor) r = "Honor";
    else if(cur < STAR_MYTHIC.Mythic + STAR_MYTHIC.Honor + STAR_MYTHIC.Glory) r = "Glory";
    else r = "Immortal";

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
Rank Akhir: ${starToRank(cur-1)}
Terpakai  : Rp${used.toLocaleString()}
Sisa      : Rp${saldo.toLocaleString()}`;
}

// ======================
// PRICE LIST
// ======================
function showPriceList(){
  let out = "=== JOKI PER BINTANG ===\n";
  for(let r of RANK_ORDER){if(PRICE[r]) out += `${r.padEnd(10)} : Rp${PRICE[r].toLocaleString()}\n`;}
  out += "\n=== GENDONG PER BINTANG ===\n";
  for(let r of RANK_ORDER){if(GENDONG[r]) out += `${r.padEnd(10)} : Rp${GENDONG[r].toLocaleString()}\n`;}
  pricelist.textContent = out;
}

// ======================
// HIDE/SHOW DIVISI & LIMIT STAR
// ======================
function updateDivisi(rankElId, divElId, starElId){
  const rankEl = document.getElementById(rankElId);
  const divEl = document.getElementById(divElId);
  const starEl = document.getElementById(starElId);
  if(!rankEl || !divEl || !starEl) return;

  rankEl.addEventListener("change", ()=>{
    const rank = rankEl.value;
    if(["Mythic","Honor","Glory","Immortal"].includes(rank)){
      divEl.style.maxHeight="0";
      divEl.style.overflow="hidden";
      divEl.value="";
      starEl.value=0;
      starEl.max=1000; // unlimited Mythic+
    } else {
      divEl.style.maxHeight="100px";
      divEl.style.overflow="visible";
      starEl.value=0;
      starEl.max=5;
    }
  });
}

// ======================
// APPLY DIVISI LOGIC
// ======================
["rank1","rankA","rankB","rankG1","rankGA","rankGB","rankE"].forEach(id=>{
  const divId = id.replace(/rank/,"div");
  const starId = id.replace(/rank/,"star");
  updateDivisi(id, divId, starId);
});

// ======================
// INIT
// ======================
showMenu(1);
showPriceList();
