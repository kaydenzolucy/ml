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
const DIVISI = ["V","IV","III","II","I"];
const STAR_PER_DIV = 5;

// STAR START untuk Mythic+
const MYTHIC_START = 0;    // untuk Mythic bintang mulai 0
const HONOR_START  = 25;
const GLORY_START  = 50;
const IMMORTAL_START = 100;

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
  if(n === 6) showPriceList();
}

// ======================
// RANK → STAR
// ======================
function rankToStar(rank, div, star){
  let total = 0;
  if(RANK_ORDER.indexOf(rank) < RANK_ORDER.indexOf("Mythic")){
    // Rank bawah Mythic
    let rankIndex = RANK_ORDER.indexOf(rank);
    total += rankIndex * STAR_PER_DIV * DIVISI.length; // total bintang dari rank sebelumnya
    total += DIVISI.indexOf(div) * STAR_PER_DIV;       // bintang dari divisi sebelumnya
    total += star;                                     // bintang sekarang
  } else {
    // Mythic+
    if(rank === "Mythic") total = MYTHIC_START + star;
    if(rank === "Honor") total = HONOR_START + star;
    if(rank === "Glory") total = GLORY_START + star;
    if(rank === "Immortal") total = IMMORTAL_START + star;
  }
  return total;
}

// ======================
// STAR → RANK + DIVISI
// ======================
function starToRank(total){
  if(total < HONOR_START){
    let rankIndex = Math.floor(total / (DIVISI.length * STAR_PER_DIV));
    let divIndex  = Math.floor((total % (DIVISI.length * STAR_PER_DIV)) / STAR_PER_DIV);
    let star      = total % STAR_PER_DIV;
    return `${RANK_ORDER[rankIndex]} ${DIVISI[divIndex]} ⭐${star}`;
  } else if(total < GLORY_START){
    return `Mythic ⭐${total - MYTHIC_START}`;
  } else if(total < IMMORTAL_START){
    return `Honor ⭐${total - HONOR_START}`;
  } else if(total < IMMORTAL_START + 50){
    return `Glory ⭐${total - GLORY_START}`;
  } else {
    return `Immortal ⭐${total - IMMORTAL_START}`;
  }
}

// ======================
// INVOICE
// ======================
function tampilInvoice(start, end, price, title){
  let detail = {};
  let totalPrice = 0;

  // inisialisasi detail
  RANK_ORDER.forEach(r=>detail[r]=0);

  for(let s=start; s<end; s++){
    let r, starInRank;
    if(s < DIVISI.length*STAR_PER_DIV*RANK_ORDER.indexOf("Mythic")){
      // bawah Mythic
      let rankIndex = Math.floor(s / (DIVISI.length * STAR_PER_DIV));
      r = RANK_ORDER[rankIndex];
      starInRank = 1;
    } else if(s < HONOR_START){
      r = "Mythic";
      starInRank = 1;
    } else if(s < GLORY_START){
      r = "Honor";
      starInRank = 1;
    } else if(s < IMMORTAL_START){
      r = "Glory";
      starInRank = 1;
    } else {
      r = "Immortal";
      starInRank = 1;
    }

    if(price[r]){
      detail[r] += starInRank;
      totalPrice += price[r] * starInRank;
    }
  }

  let out = `--- ${title} ---\n`;
  for(let r of RANK_ORDER){
    if(detail[r]>0){
      out += `${r.padEnd(10)} : ${detail[r]} ⭐  Rp${(detail[r]*price[r]).toLocaleString()}\n`;
    }
  }
  out += `-----------------------------\n`;
  out += `Total Bintang : ${end - start} ⭐\n`;
  out += `Rank Akhir    : ${starToRank(end-1)}\n`;
  out += `TOTAL         : Rp${totalPrice.toLocaleString()}`;

  hasil.textContent = out;
}

// ======================
// HITUNG
// ======================
function hitungPerBintang(){
  let s = rankToStar(rank1.value, div1.value, +star1.value);
  let add = +addStar.value;
  tampilInvoice(s, s+add, PRICE, "JOKI PER BINTANG");
}

function hitungAntarRank(){
  let start = rankToStar(rankA.value, divA.value, +starA.value);
  let end   = rankToStar(rankB.value, divB.value, +starB.value);
  tampilInvoice(start, end, PRICE, "JOKI ANTAR RANK");
}

function hitungGendongBintang(){
  let s = rankToStar(rankG1.value, divG1.value, +starG1.value);
  let add = +addStarG.value;
  tampilInvoice(s, s+add, GENDONG, "GENDONG PER BINTANG");
}

function hitungGendongRank(){
  let start = rankToStar(rankGA.value, divGA.value, +starGA.value);
  let end   = rankToStar(rankGB.value, divGB.value, +starGB.value);
  tampilInvoice(start, end, GENDONG, "GENDONG ANTAR RANK");
}

// ======================
// ESTIMASI NOMINAL
// ======================
function estimasiNominal(){
  let harga = mode.value==="PRICE"?PRICE:GENDONG;
  let start = rankToStar(rankE.value, divE.value, +starE.value);
  let cur   = start;
  let saldo = +nominal.value;
  let used  = 0;

  while(true){
    let r;
    if(cur < DIVISI.length*STAR_PER_DIV*RANK_ORDER.indexOf("Mythic")){
      let rankIndex = Math.floor(cur / (DIVISI.length*STAR_PER_DIV));
      r = RANK_ORDER[rankIndex];
    } else if(cur < HONOR_START){
      r="Mythic";
    } else if(cur < GLORY_START){
      r="Honor";
    } else if(cur < IMMORTAL_START){
      r="Glory";
    } else {
      r="Immortal";
    }

    if(!harga[r] || saldo<harga[r]) break;
    saldo -= harga[r];
    used  += harga[r];
    cur++;
  }

  hasil.textContent = `--- ESTIMASI ---\nRank Awal : ${rankE.value} ${divE.value} ⭐${starE.value}\nModal     : Rp${(+nominal.value).toLocaleString()}\n-----------------------------\nNaik      : ${cur-start} ⭐\nRank Akhir: ${starToRank(cur-1)}\nTerpakai  : Rp${used.toLocaleString()}\nSisa      : Rp${saldo.toLocaleString()}`;
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
// HIDE/SHOW DIVISI + LIMIT STAR
// ======================
function updateDivisi(rankElId, divElId, starElId){
  const rankEl = document.getElementById(rankElId);
  const divEl  = document.getElementById(divElId);
  const starEl = document.getElementById(starElId);
  if(!rankEl || !divEl || !starEl) return;

  rankEl.addEventListener("change", ()=>{
    const rank = rankEl.value;
    if(["Mythic","Honor","Glory","Immortal"].includes(rank)){
      divEl.style.maxHeight = "0";
      divEl.style.overflow = "hidden";
      divEl.style.transition = "all 0.3s ease";
      divEl.value = "";
      starEl.value = 0;
      starEl.max = 1000; // unlimited for mythic+
    } else {
      divEl.style.maxHeight = "100px";
      divEl.style.overflow = "visible";
      starEl.value = 0;
      starEl.max = 5; // limit per divisi
    }
  });
}

["rank1","rankA","rankB","rankG1","rankGA","rankGB","rankE"].forEach(id=>{
  let divId = id.replace(/rank/,"div");
  let starId = id.replace(/rank/,"star");
  updateDivisi(id,divId,starId);
});

// ======================
showMenu(1);
showPriceList();
