// ======================
// PRICE & GENDONG
// ======================
const PRICE={
  Master:3000,GM:4000,Epic:5000,Legend:6000,
  Mythic:13000,Honor:14000,Glory:20000,Immortal:24000
};

const GENDONG={
  Epic:9000,Legend:10000,Mythic:15000,
  Honor:16000,Glory:25000,Immortal:35000
};

// ======================
// CURRENCY CONFIG
// ======================
let CURRENT_CURRENCY="IDR";
let RATE_IDR_TO_MYR=0.00030; // fallback default
const FALLBACK_RATE=0.00030; // ~ 1 IDR = 0.00030 MYR
const FEE_MYR=10000; // Rp 10.000

// ======================
// RANK CONFIG
// ======================
const RANK_ORDER=["Master","GM","Epic","Legend","Mythic","Honor","Glory","Immortal"];
const RANK_DIVISI=["Master","GM","Epic","Legend"];
const DIVISI=["V","IV","III","II","I"];
const STAR_PER_DIV=5;
const STAR_PER_RANK_STANDARD=25;
const STAR_GLORY=50;
const STAR_IMMORTAL=Infinity;

// ======================
// FETCH RATE + FALLBACK
// ======================
async function fetchRate(){
  try{
    let r = await fetch("https://api.exchangerate.host/latest?base=IDR&symbols=MYR",{cache:"no-store"});
    let d = await r.json();
    if(d && d.rates && d.rates.MYR){
      RATE_IDR_TO_MYR=d.rates.MYR;
      rateInfo.textContent=`Kurs Live · 1 MYR ≈ Rp${Math.round(1/RATE_IDR_TO_MYR).toLocaleString()}`;
      return;
    }
    throw "Invalid API";
  }catch{
    RATE_IDR_TO_MYR=FALLBACK_RATE;
    rateInfo.textContent="Kurs Fallback (offline)";
  }
}

// ======================
// FORMAT HARGA
// ======================
function formatHarga(rp){
  if(CURRENT_CURRENCY==="IDR"){
    return `Rp${rp.toLocaleString()}`;
  }
  let rm = rp * RATE_IDR_TO_MYR;
  return `RM ${rm.toFixed(2)}`;
}

// ======================
// CHANGE CURRENCY
// ======================
function changeCurrency(){
  CURRENT_CURRENCY=currency.value;
  showPriceList();
}

// ======================
// INIT SELECT
// ======================
function fillRank(id){
  const el=document.getElementById(id);
  if(!el) return;
  el.innerHTML="";
  RANK_ORDER.forEach(r=>{
    let o=document.createElement("option");
    o.value=r;
    o.textContent=r;
    el.appendChild(o);
  });
}

function fillDiv(id){
  const el=document.getElementById(id);
  if(!el) return;
  el.innerHTML="";
  DIVISI.forEach(d=>{
    let o=document.createElement("option");
    o.value=d;
    o.textContent=d;
    el.appendChild(o);
  });
}

["rank1","rankA","rankB","rankG1","rankGA","rankGB","rankE"].forEach(fillRank);
["div1","divA","divB","divG1","divGA","divGB","divE"].forEach(fillDiv);

// ======================
// MENU
// ======================
function showMenu(n){
  document.querySelectorAll(".box").forEach(b=>b.style.display="none");
  const target=document.getElementById("menu"+n);
  if(target) target.style.display="block";
  if(n===6) showPriceList();
}

// ======================
// HIDE DIVISI UNTUK MYTHIC+
// ======================
function updateDivisi(rankElId,divElId){
  const rankEl=document.getElementById(rankElId);
  const divEl=document.getElementById(divElId);
  if(!rankEl||!divEl) return;

  rankEl.addEventListener("change",()=>{
    if(!RANK_DIVISI.includes(rankEl.value)){
      divEl.style.display="none";
      divEl.value="";
    }else{
      divEl.style.display="block";
    }
  });
}

["rank1","rankA","rankB","rankG1","rankGA","rankGB","rankE"]
.forEach(id=>updateDivisi(id,id.replace("rank","div")));

// ======================
// RANK <-> STAR
// ======================
function rankToStar(rank,div,star){
  let r=RANK_ORDER.indexOf(rank);

  if(rank==="Glory"){
    let t=0;
    for(let i=0;i<RANK_ORDER.indexOf("Glory");i++) t+=STAR_PER_RANK_STANDARD;
    return t+star;
  }

  if(rank==="Immortal"){
    let t=0;
    for(let i=0;i<RANK_ORDER.indexOf("Glory");i++) t+=STAR_PER_RANK_STANDARD;
    t+=STAR_GLORY;
    return t+star;
  }

  if(RANK_DIVISI.includes(rank)){
    return r*STAR_PER_RANK_STANDARD+(DIVISI.indexOf(div)*STAR_PER_DIV)+star;
  }

  return r*STAR_PER_RANK_STANDARD+star;
}

function starToRank(total){
  let cumulative=[0];
  for(let i=0;i<RANK_ORDER.length;i++){
    let max=STAR_PER_RANK_STANDARD;
    if(RANK_ORDER[i]==="Glory") max=STAR_GLORY;
    if(RANK_ORDER[i]==="Immortal") max=Infinity;
    cumulative.push(cumulative[i]+max);
  }

  let idx=cumulative.findIndex((v,i)=>total<cumulative[i+1]);
  if(idx===-1) idx=RANK_ORDER.length-1;

  let rank=RANK_ORDER[idx];
  let s=total-cumulative[idx];

  if(rank==="Glory"||rank==="Immortal"){
    return `${rank} ⭐${s}`;
  }

  if(RANK_DIVISI.includes(rank)){
    let d=Math.floor(s/STAR_PER_DIV);
    let st=s%STAR_PER_DIV;
    return `${rank} ${DIVISI[d]} ⭐${st}`;
  }

  return `${rank} ⭐${s}`;
}

// ======================
// INVOICE
// ======================
function tampilInvoice(start,end,price,title){
  let d={},total=0;
  RANK_ORDER.forEach(r=>d[r]=0);

  let s=start;
  while(s<end){
    let r=starToRank(s).split(" ")[0];
    d[r]++;
    total+=price[r]||0;
    s++;
  }

  let out=`--- ${title} ---\n`;

  for(let r of RANK_ORDER){
    if(d[r]>0){
      out+=`${r.padEnd(10)} : ${d[r]} ⭐ x ${formatHarga(price[r])}\n`;
    }
  }

  out+=`-----------------------------\n`;
  out+=`Total Bintang : ${end-start} ⭐\n`;
  out+=`Rank Akhir    : ${starToRank(end)}\n`;

  if(CURRENT_CURRENCY==="MYR"){
    out+=`Fee Transaksi : ${formatHarga(FEE_MYR)} (Rp10.000)\n`;
    total+=FEE_MYR;
  }

  out+=`TOTAL         : ${formatHarga(total)}`;
  hasil.textContent=out;
}

// ======================
// HITUNG
// ======================
function hitungPerBintang(){
  let s=rankToStar(rank1.value,div1.value,+star1.value);
  tampilInvoice(s,s+ +addStar.value,PRICE,"JOKI PER BINTANG");
}

function hitungAntarRank(){
  let s1=rankToStar(rankA.value,divA.value,+starA.value);
  let s2=rankToStar(rankB.value,divB.value,+starB.value);
  if(s2<=s1){
    hasil.textContent="Error: Rank Tujuan harus lebih tinggi dari Rank Awal";
    return;
  }
  tampilInvoice(s1,s2,PRICE,"JOKI ANTAR RANK");
}

function hitungGendongBintang(){
  let s=rankToStar(rankG1.value,divG1.value,+starG1.value);
  tampilInvoice(s,s+ +addStarG.value,GENDONG,"GENDONG PER BINTANG");
}

function hitungGendongRank(){
  let s1=rankToStar(rankGA.value,divGA.value,+starGA.value);
  let s2=rankToStar(rankGB.value,divGB.value,+starGB.value);
  if(s2<=s1){
    hasil.textContent="Error: Rank Tujuan harus lebih tinggi dari Rank Awal";
    return;
  }
  tampilInvoice(s1,s2,GENDONG,"GENDONG ANTAR RANK");
}

// ======================
// ESTIMASI NOMINAL
// ======================
function estimasiNominal(){
  let harga=mode.value==="PRICE"?PRICE:GENDONG;
  let cur=rankToStar(rankE.value,divE.value,+starE.value);
  let saldo=+nominal.value,used=0,start=cur;

  while(true){
    let r=starToRank(cur).split(" ")[0];
    if(!harga[r]||saldo<harga[r]) break;
    saldo-=harga[r];
    used+=harga[r];
    cur++;
  }

  let totalUsed=used;
  if(CURRENT_CURRENCY==="MYR"){
    totalUsed+=FEE_MYR;
    saldo-=FEE_MYR;
  }

  hasil.textContent=
`--- ESTIMASI ---
Rank Awal : ${rankE.value} ${divE.value} ⭐${starE.value}
Modal     : ${formatHarga(+nominal.value)}

Naik      : ${cur-start} ⭐
Rank Akhir: ${starToRank(cur)}
Terpakai  : ${formatHarga(totalUsed)}
Sisa      : ${formatHarga(saldo)}`;
}

// ======================
// PRICE LIST
// ======================
function showPriceList(){
  let out="=== JOKI PER BINTANG ===\n";
  for(let r of RANK_ORDER) if(PRICE[r])
    out+=`${r.padEnd(10)} : ${formatHarga(PRICE[r])}\n`;

  out+="\n=== GENDONG PER BINTANG ===\n";
  for(let r of RANK_ORDER) if(GENDONG[r])
    out+=`${r.padEnd(10)} : ${formatHarga(GENDONG[r])}\n`;

  if(CURRENT_CURRENCY==="MYR"){
    out+="\n⚠ Fee Ringgit Malaysia\nRp10.000 / transaksi (otomatis)\n";
  }

  pricelist.textContent=out;
}

// ======================
// INIT
// ======================
fetchRate();
showMenu(1);
showPriceList();
