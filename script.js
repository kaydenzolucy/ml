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
  RANK_ORDER.forEach(r=>{
    const opt = document.createElement("option");
    opt.textContent = r;
    el.appendChild(opt);
  });
}

function fillDiv(id){
  const el = document.getElementById(id);
  DIVISI.forEach(d=>{
    const opt = document.createElement("option");
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
// LOGIC
// ======================
function rankToStar(rank, div, star){
  let r = RANK_ORDER.indexOf(rank);
  if(RANK_DIVISI.includes(rank)){
    let d = DIVISI.indexOf(div);
    return r * STAR_PER_RANK + d * STAR_PER_DIV + star;
  }
  return r * STAR_PER_RANK + star;
}

function starToRank(totalStar){
  let rankIndex = Math.floor(totalStar / STAR_PER_RANK);
  let sisa = totalStar % STAR_PER_RANK;
  let div = Math.floor(sisa / STAR_PER_DIV);
  let star = sisa % STAR_PER_DIV;
  return `${RANK_ORDER[rankIndex]} ${DIVISI[div]} (${star}⭐)`;
}

// ======================
// ESTIMASI NOMINAL
// ======================
function estimasiNominal(){
  let mode = document.getElementById("mode").value;
  let harga = mode === "PRICE" ? PRICE : GENDONG;

  let start = rankToStar(
    rankE.value,
    divE.value,
    +starE.value
  );

  let saldo = +nominal.value;
  let now = start;
  let spent = 0;

  while(true){
    let r = RANK_ORDER[Math.floor(now / STAR_PER_RANK)];
    let cost = harga[r];
    if(!cost || saldo < cost) break;
    saldo -= cost;
    spent += cost;
    now++;
  }

  let out = `--- ESTIMASI ${mode === "PRICE" ? "JOKI" : "GENDONG"} ---\n`;
  out += `Bintang didapat : ${now - start}\n`;
  out += `Rank akhir     : ${starToRank(now)}\n`;
  out += `Terpakai       : Rp${spent.toLocaleString()}\n`;
  out += `Sisa saldo     : Rp${saldo.toLocaleString()}`;

  document.getElementById("hasil").textContent = out;
}

// ======================
// HITUNG NORMAL
// ======================
function tampilInvoice(start,end,price,title){
  let total=0;
  let out = `--- ${title} ---\n`;

  for(let s=start; s<end; s++){
    let r = RANK_ORDER[Math.floor(s/STAR_PER_RANK)];
    if(price[r]){
      total += price[r];
    }
  }

  out += `TOTAL : Rp${total.toLocaleString()}`;
  document.getElementById("hasil").textContent = out;
}

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
showMenu(1);
