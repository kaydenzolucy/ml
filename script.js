// ======================
// HARGA
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
// DATA RANK
// ======================
const RANK_ORDER = ["Master","GM","Epic","Legend","Mythic","Honor","Glory","Immortal"];
const RANK_DIVISI = ["Master","GM","Epic","Legend"];
const DIVISI = ["V","IV","III","II","I"];
const STAR_PER_DIV = 5;
const STAR_PER_RANK = 25;

// ======================
// INIT SELECT
// ======================
function fillRank(id){
  const el = document.getElementById(id);
  if(!el) return;
  el.innerHTML = "";
  RANK_ORDER.forEach(r=>{
    let opt = document.createElement("option");
    opt.value = r;
    opt.textContent = r;
    el.appendChild(opt);
  });
}

function fillDiv(id){
  const el = document.getElementById(id);
  if(!el) return;
  el.innerHTML = "";
  DIVISI.forEach(d=>{
    let opt = document.createElement("option");
    opt.value = d;
    opt.textContent = d;
    el.appendChild(opt);
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
  if(target) target.style.display="block";
}

// ======================
// RANK <-> STAR (FIX LOGIC)
// ======================
function rankToStar(rank, div, star){
  let r = RANK_ORDER.indexOf(rank);
  if(r < 0) return 0;

  if(RANK_DIVISI.includes(rank)){
    let d = DIVISI.indexOf(div);
    return (r * STAR_PER_RANK) + (d * STAR_PER_DIV) + star;
  }

  return (r * STAR_PER_RANK) + star;
}

function starToRank(total){
  let rIndex = Math.floor(total / STAR_PER_RANK);
  if(rIndex >= RANK_ORDER.length) rIndex = RANK_ORDER.length - 1;

  let rank = RANK_ORDER[rIndex];
  let sisa = total % STAR_PER_RANK;

  if(RANK_DIVISI.includes(rank)){
    let dIndex = Math.floor(sisa / STAR_PER_DIV);
    let star = sisa % STAR_PER_DIV;
    return `${rank} ${DIVISI[dIndex]} ⭐${star}`;
  }

  return `${rank} ⭐${sisa}`;
}

// ======================
// DETAIL INVOICE
// ======================
function hitungDetail(start,end){
  let d = {};
  RANK_ORDER.forEach(r=>d[r]=0);

  for(let s=start; s<end; s++){
    let idx = Math.floor(s / STAR_PER_RANK);
    let rank = RANK_ORDER[idx];
    if(rank) d[rank]++;
  }
  return d;
}

function tampilInvoice(start,end,price,title){
  let detail = hitungDetail(start,end);
  let total = 0;
  let out = `--- ${title} ---\n`;

  for(let r in detail){
    if(detail[r] > 0 && price[r]){
      let h = detail[r] * price[r];
      total += h;
      out += `${r.padEnd(10)} : ${detail[r]}⭐ x Rp${price[r].toLocaleString()} = Rp${h.toLocaleString()}\n`;
    }
  }

  out += `-----------------------------\n`;
  out += `TOTAL : Rp${total.toLocaleString()}`;
  hasil.textContent = out;
}

// ======================
// JOKI NORMAL
// ======================
function hitungPerBintang(){
  let s = rankToStar(rank1.value, div1.value, +star1.value);
  tampilInvoice(s, s + +addStar.value, PRICE, "JOKI PER BINTANG");
}

function hitungAntarRank(){
  let s = rankToStar(rankA.value, divA.value, +starA.value);
  let e = rankToStar(rankB.value, divB.value, +starB.value);
  tampilInvoice(s, e, PRICE, "JOKI ANTAR RANK");
}

// ======================
// GENDONG
// ======================
function hitungGendongBintang(){
  let s = rankToStar(rankG1.value, divG1.value, +starG1.value);
  tampilInvoice(s, s + +addStarG.value, GENDONG, "GENDONG PER BINTANG");
}

function hitungGendongRank(){
  let s = rankToStar(rankGA.value, divGA.value, +starGA.value);
  let e = rankToStar(rankGB.value, divGB.value, +starGB.value);
  tampilInvoice(s, e, GENDONG, "GENDONG ANTAR RANK");
}

// ======================
// MENU 5 - ESTIMASI NOMINAL (FIX UTAMA)
// ======================
function estimasiNominal(){
  let harga = mode.value === "PRICE" ? PRICE : GENDONG;

  let startStar = rankToStar(rankE.value, divE.value, +starE.value);
  let saldo = +nominal.value;
  let currentStar = startStar;
  let used = 0;

  while(true){
    let rankNow = RANK_ORDER[Math.floor(currentStar / STAR_PER_RANK)];
    let cost = harga[rankNow];
    if(!cost || saldo < cost) break;

    saldo -= cost;
    used += cost;
    currentStar++;
  }

  let naik = currentStar - startStar;

  let out = `--- ESTIMASI ${mode.value} ---\n`;
  out += `Rank Awal  : ${rankE.value} ${divE.value} ⭐${starE.value}\n`;
  out += `Modal      : Rp${(+nominal.value).toLocaleString()}\n`;
  out += `-----------------------------\n`;
  out += `Naik       : ${naik} ⭐\n`;
  out += `Rank Akhir : ${starToRank(currentStar)}\n`;
  out += `Terpakai   : Rp${used.toLocaleString()}\n`;
  out += `Sisa       : Rp${saldo.toLocaleString()}`;

  hasil.textContent = out;
}

// ======================
showMenu(1);
