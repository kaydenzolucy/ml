// ======================
// PRICE & GENDONG
// ======================
const PRICE = {
  Master:3000, GM:4000, Epic:5000, Legend:6000,
  Mythic:13000, Honor:14000, Glory:20000, Immortal:24000
};

const GENDONG = {
  Epic:9000, Legend:10000, Mythic:15000, Honor:16000,
  Glory:25000, Immortal:35000
};

// ======================
// RANK & DIVISI
// ======================
const RANK_ORDER = ["Master","GM","Epic","Legend","Mythic","Honor","Glory","Immortal"];
const DIVISI = ["V","IV","III","II","I"];
const STAR_PER_DIV = 5;
const STAR_PER_RANK = 25; // Master-GM-Epic-Legend

// START BINTANG Mythic+
const MYTHIC_START = 100;  // mulai dari bintang 0 untuk Mythic+
const HONOR_START  = 125;
const GLORY_START  = 150;
const IMMORTAL_START = 200;

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
  if(target) target.style.display="block";
  if(n===6) showPriceList();
}

// ======================
// STAR CONVERSION
// ======================
function rankToStar(rank, div, star){
  if(RANK_ORDER.indexOf(rank) < RANK_ORDER.indexOf("Mythic")){
    let rankIndex = RANK_ORDER.indexOf(rank);
    let base = rankIndex*STAR_PER_RANK;
    let divIndex = DIVISI.indexOf(div);
    return base + divIndex*STAR_PER_DIV + star;
  }
  if(rank==="Mythic") return MYTHIC_START + star;
  if(rank==="Honor") return HONOR_START + star;
  if(rank==="Glory") return GLORY_START + star;
  if(rank==="Immortal") return IMMORTAL_START + star;
  return 0;
}

function starToRank(total){
  // bawah Mythic
  if(total < MYTHIC_START){
    let rankIndex = Math.floor(total/STAR_PER_RANK);
    let starInRank = total % STAR_PER_RANK;
    let divIndex = Math.floor(starInRank/STAR_PER_DIV);
    let star = starInRank % STAR_PER_DIV;
    return `${RANK_ORDER[rankIndex]} ${DIVISI[divIndex]} ⭐${star}`;
  }
  // Mythic+
  if(total < HONOR_START) return `Mythic ⭐${total-MYTHIC_START+1}`;
  if(total < GLORY_START) return `Honor ⭐${total-HONOR_START+1}`;
  if(total < IMMORTAL_START) return `Glory ⭐${total-GLORY_START+1}`;
  return `Immortal ⭐${total-IMMORTAL_START+1}`;
}

// ======================
// INVOICE
// ======================
function tampilInvoice(start, end, price, title){
  let detail = {};
  RANK_ORDER.forEach(r=>detail[r]=0);
  let totalPrice = 0;

  for(let s=start; s<end; s++){
    let r, rankStar;
    if(s < MYTHIC_START){
      let rankIndex = Math.floor(s/STAR_PER_RANK);
      r = RANK_ORDER[rankIndex];
      let starInRank = (s % STAR_PER_RANK);
      let divIndex = Math.floor(starInRank/STAR_PER_DIV);
      let star = (starInRank % STAR_PER_DIV) + 1; // bintang mulai dari 1
      rankStar = star;
    } else if(s < HONOR_START){
      r = "Mythic";
      rankStar = s-MYTHIC_START+1;
    } else if(s < GLORY_START){
      r = "Honor";
      rankStar = s-HONOR_START+1;
    } else if(s < IMMORTAL_START){
      r = "Glory";
      rankStar = s-GLORY_START+1;
    } else {
      r = "Immortal";
      rankStar = s-IMMORTAL_START+1;
    }

    detail[r] = (detail[r]||0)+1;
    totalPrice += price[r]||0;
  }

  // OUTPUT
  let out = `--- ${title} ---\n`;
  for(let r of RANK_ORDER){
    if(detail[r]>0){
      out += `${r.padEnd(10)} : ${detail[r]} ⭐  Rp${(detail[r]*price[r]).toLocaleString()}\n`;
    }
  }
  out += "-----------------------------\n";
  out += `Total Bintang : ${end-start} ⭐\n`;
  out += `Rank Akhir    : ${starToRank(end-1)}\n`;
  out += `TOTAL         : Rp${totalPrice.toLocaleString()}`;

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
  let harga = mode.value==="PRICE"?PRICE:GENDONG;
  let start = rankToStar(rankE.value, divE.value, +starE.value);
  let cur = start;
  let saldo = +nominal.value;
  let used = 0;

  while(true){
    let r;
    if(cur<MYTHIC_START) r = RANK_ORDER[Math.floor(cur/STAR_PER_RANK)];
    else if(cur<HONOR_START) r="Mythic";
    else if(cur<GLORY_START) r="Honor";
    else if(cur<IMMORTAL_START) r="Glory";
    else r="Immortal";

    if(!harga[r] || saldo<harga[r]) break;
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
      divEl.style.maxHeight="0";
      divEl.style.overflow="hidden";
      divEl.style.transition="all 0.3s";
      divEl.value="";
      starEl.value=0;
      starEl.max=1000; // unlimited for mythic+
    } else {
      divEl.style.maxHeight="100px";
      divEl.style.overflow="visible";
      starEl.value=0;
      starEl.max=5; // limit per divisi
    }
  });
}

["rank1","rankA","rankB","rankG1","rankGA","rankGB","rankE"].forEach(id=>{
  updateDivisi(id,id.replace("rank","div"),id.replace("rank","star"));
});

// ======================
showMenu(1);
showPriceList();
