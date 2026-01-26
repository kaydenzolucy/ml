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
const STAR_PER_DIV = 5; // Master-GM-Epic-Legend per divisi
const STAR_MYTHIC = {Mythic:24, Honor:25, Glory:50, Immortal:Infinity}; // Mythic+

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
// RANK/DIVISI → STAR (AKURAT)
// ======================
function rankToStar(rank, div, star){
  let index = RANK_ORDER.indexOf(rank);
  if(index < 0) return 0;
  if(index <= 3){ // Master-GM-Epic-Legend
    let divIndex = DIVISI.indexOf(div);
    return index*25 + divIndex*STAR_PER_DIV + star;
  } else { // Mythic+
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
// STAR → RANK/DIVISI (AKURAT)
// ======================
function starToRank(total){
  if(total < STAR_MYTHIC.Mythic) {
    let rank = "Mythic";
    return `${rank} ⭐${total}`;
  } else if(total < STAR_MYTHIC.Mythic + STAR_MYTHIC.Honor){
    return `Honor ⭐${total - STAR_MYTHIC.Mythic}`;
  } else if(total < STAR_MYTHIC.Mythic + STAR_MYTHIC.Honor + STAR_MYTHIC.Glory){
    return `Glory ⭐${total - STAR_MYTHIC.Mythic - STAR_MYTHIC.Honor}`;
  } else {
    return `Immortal ⭐${total - STAR_MYTHIC.Mythic - STAR_MYTHIC.Honor - STAR_MYTHIC.Glory}`;
  }
}

// ======================
// INVOICE DETAIL (PER BINTANG AKURAT)
// ======================
function tampilInvoice(start, end, price, title){
  let detail = {};
  RANK_ORDER.forEach(r => detail[r] = 0);
  let total = 0;
  let cur = start;

  while(cur < end){
    let r = "";
    let star = 1;

    // Tentukan rank dan star sesuai urutan
    if(cur < 25){ r="Master"; star = cur; }
    else if(cur < 50){ r="GM"; star = cur - 25; }
    else if(cur < 75){ r="Epic"; star = cur - 50; }
    else if(cur < 100){ r="Legend"; star = cur - 75; }
    else if(cur < 124){ r="Mythic"; star = cur - 100; }
    else if(cur < 149){ r="Honor"; star = cur - 124; }
    else if(cur < 199){ r="Glory"; star = cur - 149; }
    else { r="Immortal"; star = cur - 199; }

    detail[r]++;
    total += price[r] || 0;
    cur++;
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
  let s1 = rankToStar(rankA.value, divA.value, +starA.value);
  let s2 = rankToStar(rankB.value, divB.value, +starB.value);
  if(s2 <= s1){
    hasil.textContent = "--- JOKI ANTAR RANK ---\nError: Rank Tujuan harus lebih tinggi dari Rank Awal";
    return;
  }
  tampilInvoice(s1, s2, PRICE, "JOKI ANTAR RANK");
}

function hitungGendongBintang(){
  let s = rankToStar(rankG1.value, divG1.value, +starG1.value);
  tampilInvoice(s, s + +addStarG.value, GENDONG, "GENDONG PER BINTANG");
}

function hitungGendongRank(){
  let s1 = rankToStar(rankGA.value, divGA.value, +starGA.value);
  let s2 = rankToStar(rankGB.value, divGB.value, +starGB.value);
  if(s2 <= s1){
    hasil.textContent = "--- GENDONG ANTAR RANK ---\nError: Rank Tujuan harus lebih tinggi dari Rank Awal";
    return;
  }
  tampilInvoice(s1, s2, GENDONG, "GENDONG ANTAR RANK");
}

// ======================
// ESTIMASI NOMINAL
// ======================
function estimasiNominal(){
  let harga = mode.value==="PRICE"?PRICE:GENDONG;
  let start = rankToStar(rankE.value, divE.value, +starE.value);
  let saldo = +nominal.value;
  let used = 0;
  let cur = start;

  while(true){
    let r="";
    if(cur<25) r="Master";
    else if(cur<50) r="GM";
    else if(cur<75) r="Epic";
    else if(cur<100) r="Legend";
    else if(cur<124) r="Mythic";
    else if(cur<149) r="Honor";
    else if(cur<199) r="Glory";
    else r="Immortal";

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
  for(let r of RANK_ORDER){if(PRICE[r]) out += `${r.padEnd(10)} : Rp${PRICE[r].toLocaleString()}\n`;}
  out += "\n=== GENDONG PER BINTANG ===\n";
  for(let r of RANK_ORDER){if(GENDONG[r]) out += `${r.padEnd(10)} : Rp${GENDONG[r].toLocaleString()}\n`;}
  pricelist.textContent = out;
}

// ======================
// UPDATE DIVISI
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
      starEl.max=1000;
    } else {
      divEl.style.maxHeight="100px";
      divEl.style.overflow="visible";
      starEl.value=0;
      starEl.max=5;
    }
  });
}

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
