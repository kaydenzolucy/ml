// ======================
// CURRENCY
// ======================
let CURRENCY="IDR";
let RATE_MYR=0.00030;

async function fetchRate(){
  try{
    const r=await fetch("https://api.exchangerate.host/latest?base=IDR&symbols=MYR");
    const j=await r.json();
    RATE_MYR=j.rates.MYR;
    rateInfo.textContent=`1 IDR ≈ ${RATE_MYR.toFixed(6)} MYR`;
  }catch{
    rateInfo.textContent="Fallback rate active";
  }
}
currencySelect.onchange=()=>CURRENCY=currencySelect.value;
function uang(v){
  return CURRENCY==="IDR"
    ? "Rp"+v.toLocaleString("id-ID")
    : "RM"+(v*RATE_MYR).toFixed(2);
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
function fillRank(id){const e=document.getElementById(id);RANK_ORDER.forEach(r=>e.append(new Option(r,r)));}
function fillDiv(id){const e=document.getElementById(id);DIVISI.forEach(d=>e.append(new Option(d,d)));}

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
if(RANK_DIVISI.includes(rank))
return r*STAR_PER_RANK_STANDARD+(DIVISI.indexOf(div)*STAR_PER_DIV)+star;
return r*STAR_PER_RANK_STANDARD+star;
}
function starToRank(t){
let r=Math.floor(t/STAR_PER_RANK_STANDARD);
let s=t%STAR_PER_RANK_STANDARD;
return `${RANK_ORDER[r]} ⭐${s}`;
}

// ======================
function tampilInvoice(start,end,price,title){
let total=0;
let out=`--- ${title} ---\n`;
for(let i=start;i<end;i++){
let r=starToRank(i).split(" ")[0];
total+=price[r]||0;
}
out+=`Total Bintang : ${end-start}\n`;
out+=`Rank Akhir    : ${starToRank(end)}\n`;
out+=`TOTAL         : ${uang(total)}`;
hasil.textContent=out;
}

// ======================
function hitungPerBintang(){
let s=rankToStar(rank1.value,div1.value,+star1.value);
tampilInvoice(s,s+ +addStar.value,PRICE,"JOKI PER BINTANG");
}
function hitungAntarRank(){
let s1=rankToStar(rankA.value,divA.value,+starA.value);
let s2=rankToStar(rankB.value,divB.value,+starB.value);
tampilInvoice(s1,s2,PRICE,"JOKI ANTAR RANK");
}
function hitungGendongBintang(){
let s=rankToStar(rankG1.value,divG1.value,+starG1.value);
tampilInvoice(s,s+ +addStarG.value,GENDONG,"GENDONG PER BINTANG");
}
function hitungGendongRank(){
let s1=rankToStar(rankGA.value,divGA.value,+starGA.value);
let s2=rankToStar(rankGB.value,divGB.value,+starGB.value);
tampilInvoice(s1,s2,GENDONG,"GENDONG ANTAR RANK");
}

// ======================
function estimasiNominal(){
let saldo=+nominal.value;
if(CURRENCY==="MYR") saldo/=RATE_MYR;
let cur=rankToStar(rankE.value,divE.value,+starE.value);
let harga=mode.value==="PRICE"?PRICE:GENDONG;
let used=0,start=cur;
while(harga[starToRank(cur).split(" ")[0]] && saldo>=harga[starToRank(cur).split(" ")[0]]){
let h=harga[starToRank(cur).split(" ")[0]];
saldo-=h;used+=h;cur++;
}
hasil.textContent=
`--- ESTIMASI ---
Naik : ${cur-start} ⭐
Rank Akhir : ${starToRank(cur)}
Terpakai : ${uang(used)}
Sisa : ${uang(saldo)}`;
}

// ======================
function showPriceList(){
let out="=== PRICE LIST ===\n";
for(let r in PRICE) out+=`${r} : ${uang(PRICE[r])}\n`;
out+="\n=== GENDONG ===\n";
for(let r in GENDONG) out+=`${r} : ${uang(GENDONG[r])}\n`;
pricelist.textContent=out;
}

// INIT
fetchRate();
showMenu(1);
