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
// RANK → STAR (MLBB nyata)
// ======================
function rankToStar(rank, div, star){
  if(["Master","GM","Epic","Legend"].includes(rank)){
    return (DIVISI.indexOf(div) + 5*(RANK_ORDER.indexOf(rank))) * STAR_PER_DIV + star;
  }
  if(rank==="Mythic") return star;
  if(rank==="Honor") return 25 + star;
  if(rank==="Glory") return 50 + star;
  if(rank==="Immortal") return 100 + star;
  return 0;
}

// ======================
// STAR → RANK (MLBB nyata)
// ======================
function starToRank(star){
  if(star < 25) { // Master-GM-Epic-Legend
    let rankIndex = Math.floor(star/5);
    let divIndex = star%5;
    return `${RANK_ORDER[rankIndex]} ${DIVISI[divIndex]} ⭐${divIndex}`;
  }
  else if(star < 50) return `Mythic ⭐${star - 25}`;
  else if(star < 100) return `Honor ⭐${star - 50}`;
  else if(star < 150) return `Glory ⭐${star - 100}`;
  else return `Immortal ⭐${star - 150}`;
}

// ======================
// INVOICE
// ======================
function tampilInvoice(start, end, price, title){
  let total = 0;
  let detail = {};

  for(let i=start;i<end;i++){
    let rank="", star=0;
    if(i<25){ // Master-Legend
      let idx = Math.floor(i/5);
      let divIdx = i%5;
      rank = RANK_ORDER[idx];
      star = 1;
    } else if(i<50){ rank="Mythic"; star=1; }
    else if(i<100){ rank="Honor"; star=1; }
    else if(i<150){ rank="Glory"; star=1; }
    else{ rank="Immortal"; star=1; }

    if(!detail[rank]) detail[rank]=0;
    detail[rank]+=star;
    total += price[rank];
  }

  let out = `--- ${title} ---\n`;
  for(let r of RANK_ORDER){
    if(detail[r]) out += `${r.padEnd(10)} : ${detail[r]} ⭐  Rp${(detail[r]*price[r]).toLocaleString()}\n`;
  }

  out += "-----------------------------\n";
  out += `Total Bintang : ${end-start} ⭐\n`;
  out += `Rank Akhir    : ${starToRank(end-1)}\n`;
  out += `TOTAL         : Rp${total.toLocaleString()}`;

  document.getElementById("hasil").textContent = out;
}

// ======================
// HITUNG
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
    let r="";
    if(cur<25){ r=RANK_ORDER[Math.floor(cur/5)]; }
    else if(cur<50) r="Mythic";
    else if(cur<100) r="Honor";
    else if(cur<150) r="Glory";
    else r="Immortal";

    if(!harga[r]||saldo<harga[r]) break;
    saldo-=harga[r];
    used+=harga[r];
    cur++;
  }

  document.getElementById("hasil").textContent=
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
  for(let r of RANK_ORDER) if(PRICE[r]) out+=`${r.padEnd(10)} : Rp${PRICE[r].toLocaleString()}\n`;
  out+="\n=== GENDONG PER BINTANG ===\n";
  for(let r of RANK_ORDER) if(GENDONG[r]) out+=`${r.padEnd(10)} : Rp${GENDONG[r].toLocaleString()}\n`;
  document.getElementById("pricelist").textContent=out;
}

// ======================
// AUTO HIDE DIVISI
// ======================
function updateDivisi(rankElId, divElId, starElId){
  const rankEl=document.getElementById(rankElId);
  const divEl=document.getElementById(divElId);
  const starEl=document.getElementById(starElId);
  if(!rankEl||!divEl||!starEl) return;

  rankEl.addEventListener("change",()=>{
    const rank = rankEl.value;
    if(["Mythic","Honor","Glory","Immortal"].includes(rank)){
      divEl.style.maxHeight="0";
      divEl.style.overflow="hidden";
      divEl.style.transition="all 0.3s ease";
      divEl.value="";
      starEl.value=0;
      starEl.max=1000;
    }else{
      divEl.style.maxHeight="100px";
      divEl.style.overflow="visible";
      starEl.value=0;
      starEl.max=5;
    }
  });
}

["rank1","rankA","rankB","rankG1","rankGA","rankGB","rankE"].forEach(r=>{
  updateDivisi(r, r.replace("rank","div"), r.replace("rank","star"));
});

// ======================
showMenu(1);
showPriceList();
