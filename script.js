// ======================
// CURRENCY
// ======================
let CURRENCY="IDR";
let RATE_MYR=0;

async function fetchRate(){
  try{
    const r=await fetch("https://api.exchangerate.host/latest?base=IDR&symbols=MYR");
    const d=await r.json();
    RATE_MYR=d.rates.MYR;
    rateInfo.textContent=`1 IDR ≈ ${RATE_MYR.toFixed(6)} MYR`;
  }catch{
    rateInfo.textContent="Rate error";
  }
}

currencySelect.onchange=()=>CURRENCY=currencySelect.value;

function money(v){
  return CURRENCY==="IDR"
    ? `Rp${v.toLocaleString("id-ID")}`
    : `RM${(v*RATE_MYR).toFixed(2)}`;
}

// ======================
// PRICE
// ======================
const PRICE={Master:3000,GM:4000,Epic:5000,Legend:6000,Mythic:13000,Honor:14000,Glory:20000,Immortal:24000};
const GENDONG={Epic:9000,Legend:10000,Mythic:15000,Honor:16000,Glory:25000,Immortal:35000};

const RANK_ORDER=["Master","GM","Epic","Legend","Mythic","Honor","Glory","Immortal"];
const RANK_DIVISI=["Master","GM","Epic","Legend"];
const DIVISI=["V","IV","III","II","I"];
const STAR_PER_DIV=5;
const STAR_PER_RANK_STANDARD=25;
const STAR_GLORY=50;

// ======================
// INIT SELECT
function fillRank(id){
  let e=document.getElementById(id); if(!e) return;
  RANK_ORDER.forEach(r=>e.add(new Option(r,r)));
}
function fillDiv(id){
  let e=document.getElementById(id); if(!e) return;
  DIVISI.forEach(d=>e.add(new Option(d,d)));
}

["rank1","rankA","rankB","rankG1","rankGA","rankGB","rankE"].forEach(fillRank);
["div1","divA","divB","divG1","divGA","divGB","divE"].forEach(fillDiv);

// ======================
function showMenu(n){
  document.querySelectorAll(".box").forEach(b=>b.style.display="none");
  document.getElementById("menu"+n).style.display="block";
  if(n===6) showPriceList();
}

// ======================
function rankToStar(rank,div,star){
  let r=RANK_ORDER.indexOf(rank);
  if(rank==="Glory") return r*25+star;
  if(rank==="Immortal") return r*25+STAR_GLORY+star;
  if(RANK_DIVISI.includes(rank))
    return r*25+(DIVISI.indexOf(div)*5)+star;
  return r*25+star;
}

function starToRank(t){
  let c=0;
  for(let r of RANK_ORDER){
    let max=r==="Glory"?STAR_GLORY:25;
    if(t<c+max) return `${r} ⭐${t-c}`;
    c+=max;
  }
  return `Immortal ⭐${t-c}`;
}

// ======================
function tampilInvoice(s,e,p,title){
  let total=0,out=`--- ${title} ---\n`;
  for(let i=s;i<e;i++){
    let r=starToRank(i).split(" ")[0];
    total+=p[r]||0;
  }
  out+=`Total Bintang : ${e-s} ⭐\n`;
  out+=`Rank Akhir    : ${starToRank(e)}\n`;
  out+=`TOTAL         : ${money(total)}`;
  hasil.textContent=out;
}

// ======================
function hitungPerBintang(){
  tampilInvoice(
    rankToStar(rank1.value,div1.value,+star1.value),
    rankToStar(rank1.value,div1.value,+star1.value)+ +addStar.value,
    PRICE,"JOKI PER BINTANG");
}

function hitungAntarRank(){
  let s=rankToStar(rankA.value,divA.value,+starA.value);
  let e=rankToStar(rankB.value,divB.value,+starB.value);
  if(e<=s) return hasil.textContent="Rank tujuan harus lebih tinggi";
  tampilInvoice(s,e,PRICE,"JOKI ANTAR RANK");
}

function hitungGendongBintang(){
  tampilInvoice(
    rankToStar(rankG1.value,divG1.value,+starG1.value),
    rankToStar(rankG1.value,divG1.value,+starG1.value)+ +addStarG.value,
    GENDONG,"GENDONG PER BINTANG");
}

function hitungGendongRank(){
  let s=rankToStar(rankGA.value,divGA.value,+starGA.value);
  let e=rankToStar(rankGB.value,divGB.value,+starGB.value);
  if(e<=s) return hasil.textContent="Rank tujuan harus lebih tinggi";
  tampilInvoice(s,e,GENDONG,"GENDONG ANTAR RANK");
}

// ======================
function estimasiNominal(){
  let harga=mode.value==="PRICE"?PRICE:GENDONG;
  let saldo=+nominal.value;
  if(CURRENCY==="MYR") saldo/=RATE_MYR;

  let cur=rankToStar(rankE.value,divE.value,+starE.value),used=0,start=cur;
  while(harga[starToRank(cur).split(" ")[0]] && saldo>=harga[starToRank(cur).split(" ")[0]]){
    let r=starToRank(cur).split(" ")[0];
    saldo-=harga[r]; used+=harga[r]; cur++;
  }

  hasil.textContent=
`--- ESTIMASI ---
Naik      : ${cur-start} ⭐
Rank Akhir: ${starToRank(cur)}
Terpakai  : ${money(used)}
Sisa      : ${money(saldo)}`;
}

// ======================
function showPriceList(){
  let o="=== PRICE LIST ===\n";
  for(let r of RANK_ORDER)
    if(PRICE[r]) o+=`${r.padEnd(10)} : ${money(PRICE[r])}\n`;
  o+="\n=== GENDONG ===\n";
  for(let r of RANK_ORDER)
    if(GENDONG[r]) o+=`${r.padEnd(10)} : ${money(GENDONG[r])}\n`;
  pricelist.textContent=o;
}

fetchRate();
showMenu(1);
