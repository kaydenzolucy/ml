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
// STAR → RANK & DIVISI
// ======================
function starToRankFull(star){
  // Master → Legend
  if(star < 25){
    let rankIndex = Math.floor(star/5);
    let divIndex = star%5;
    return {rank:RANK_ORDER[rankIndex], div:DIVISI[divIndex], star:divIndex};
  }
  // Mythic+
  else if(star < 50) return {rank:"Mythic", div:"", star:star-25};
  else if(star < 100) return {rank:"Honor", div:"", star:star-50};
  else if(star < 150) return {rank:"Glory", div:"", star:star-100};
  else return {rank:"Immortal", div:"", star:star-150};
}

// ======================
// RANK → STAR
// ======================
function rankToStar(rank, div, star){
  if(["Master","GM","Epic","Legend"].includes(rank)){
    return RANK_ORDER.indexOf(rank)*5 + DIVISI.indexOf(div) + star;
  }
  if(rank==="Mythic") return 25 + star;
  if(rank==="Honor") return 50 + star;
  if(rank==="Glory") return 100 + star;
  if(rank==="Immortal") return 150 + star;
  return 0;
}

// ======================
// INVOICE GENERATOR
// ======================
function tampilInvoice(start, end, price, title){
  let total = 0;
  let detail = {};

  for(let i=start; i<end; i++){
    let info = starToRankFull(i);
    if(!detail[info.rank]) detail[info.rank]=0;
    detail[info.rank]++;
    total += price[info.rank] || 0;
  }

  let out = `--- ${title} ---\n`;
  for(let r of RANK_ORDER){
    if(detail[r]) out += `${r.padEnd(10)} : ${detail[r]} ⭐  Rp${(detail[r]*price[r]).toLocaleString()}\n`;
  }

  out += "-----------------------------\n";
  out += `Total Bintang : ${end-start} ⭐\n`;
  out += `Rank Akhir    : ${starToRankFull(end-1).rank} ⭐${starToRankFull(end-1).star}\n`;
  out += `TOTAL         : Rp${total.toLocaleString()}`;

  document.getElementById("hasil").textContent = out;
}

// ======================
// HITUNG MENU
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
// ESTIMASI NOMINAL
// ======================
function estimasiNominal(){
  let harga = mode.value==="PRICE"?PRICE:GENDONG;
  let start = rankToStar(rankE.value, divE.value, +starE.value);
  let cur = start;
  let saldo = +nominal.value;
  let used = 0;

  while(true){
    let info = starToRankFull(cur);
    let r = info.rank;
    if(!harga[r] || saldo<harga[r]) break;
    saldo -= harga[r];
    used += harga[r];
    cur++;
  }

  let akhir = starToRankFull(cur-1);
  document.getElementById("hasil").textContent=
`--- ESTIMASI ---
Rank Awal : ${rankE.value} ${divE.value} ⭐${starE.value}
Modal     : Rp${(+nominal.value).toLocaleString()}
-----------------------------
Naik      : ${cur-start} ⭐
Rank Akhir: ${akhir.rank} ⭐${akhir.star}
Terpakai  : Rp${used.toLocaleString()}
Sisa      : Rp${saldo.toLocaleString()}`;
}

// ======================
// PRICE LIST
// ======================
function showPriceList(){
  let out = "=== JOKI PER BINTANG ===\n";
  for(let r of RANK_ORDER) if(PRICE[r]) out += `${r.padEnd(10)} : Rp${PRICE[r].toLocaleString()}\n`;
  out+="\n=== GENDONG PER BINTANG ===\n";
  for(let r of RANK_ORDER) if(GENDONG[r]) out += `${r.padEnd(10)} : Rp${GENDONG[r].toLocaleString()}\n`;
  document.getElementById("pricelist").textContent = out;
}

// ======================
// AUTO HIDE DIVISI
// ======================
function updateDivisi(rankElId, divElId, starElId){
  const rankEl = document.getElementById(rankElId);
  const divEl = document.getElementById(divElId);
  const starEl = document.getElementById(starElId);
  if(!rankEl||!divEl||!starEl) return;

  rankEl.addEventListener("change",()=>{
    const rank = rankEl.value;
    if(["Mythic","Honor","Glory","Immortal"].includes(rank)){
      divEl.style.maxHeight="0";
      divEl.style.overflow="hidden";
      divEl.value="";
      starEl.max=1000;
    }else{
      divEl.style.maxHeight="100px";
      divEl.style.overflow="visible";
      starEl.max=5;
    }
    starEl.value=0;
  });
}

["rank1","rankA","rankB","rankG1","rankGA","rankGB","rankE"].forEach(r=>{
  updateDivisi(r, r.replace("rank","div"), r.replace("rank","star"));
});

showMenu(1);
showPriceList();
