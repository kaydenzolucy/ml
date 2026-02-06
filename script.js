// ======================
// PRICE & GENDONG
// ======================
const PRICE = {
  Master:3000, GM:4000, Epic:5000, Legend:6000,
  Mythic:13000, Honor:14000, Glory:20000, Immortal:24000
};

const GENDONG = {
  Epic:9000, Legend:10000, Mythic:15000,
  Honor:16000, Glory:25000, Immortal:35000
};

// ======================
// CURRENCY CONFIG
// ======================
let CURRENT_CURRENCY = "IDR";
let RATE_IDR_TO_MYR = 0.00030;
const FALLBACK_RATE = 0.00030;
const FEE_MYR = 10000;

// ======================
// ELEMENTS
// ======================
const currency   = document.getElementById("currency");
const rateInfo   = document.getElementById("rateInfo");
const hasil      = document.getElementById("hasil");
const pricelist  = document.getElementById("pricelist");

// ======================
// RANK CONFIG
// ======================
const RANK_ORDER = ["Master","GM","Epic","Legend","Mythic","Honor","Glory","Immortal"];
const RANK_DIVISI = ["Master","GM","Epic","Legend"];
const DIVISI = ["V","IV","III","II","I"];
const STAR_PER_DIV = 5;
const STAR_PER_RANK_STANDARD = 25;
const STAR_GLORY = 50;

// ======================
// FETCH RATE
// ======================
async function fetchRate(){
  try{
    const r = await fetch(
      "https://api.frankfurter.app/latest?from=IDR&to=MYR",
      { cache:"no-store" }
    );
    const d = await r.json();

    if(d?.rates?.MYR){
      RATE_IDR_TO_MYR = d.rates.MYR;
      rateInfo.textContent =
        `Kurs Live · 1 MYR ≈ Rp${Math.round(1/RATE_IDR_TO_MYR).toLocaleString()}`;
      return;
    }
    throw "invalid";
  }catch{
    RATE_IDR_TO_MYR = FALLBACK_RATE;
    rateInfo.textContent = "Kurs Fallback (offline)";
  }
}

// ======================
// FORMAT HARGA
// ======================
function formatHarga(rp){
  if(CURRENT_CURRENCY==="IDR"){
    return `Rp${rp.toLocaleString()}`;
  }
  return `RM ${(rp * RATE_IDR_TO_MYR).toFixed(2)}`;
}

// ======================
// CHANGE CURRENCY
// ======================
function changeCurrency(){
  CURRENT_CURRENCY = currency.value;
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
    const o=document.createElement("option");
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
    const o=document.createElement("option");
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
// DIVISI TOGGLE
// ======================
function updateDivisi(rankId,divId){
  const r=document.getElementById(rankId);
  const d=document.getElementById(divId);
  if(!r||!d) return;

  r.addEventListener("change",()=>{
    if(RANK_DIVISI.includes(r.value)){
      d.style.display="block";
    }else{
      d.style.display="none";
      d.value="";
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
    return RANK_ORDER.indexOf("Glory")*STAR_PER_RANK_STANDARD + star;
  }

  if(rank==="Immortal"){
    return RANK_ORDER.indexOf("Glory")*STAR_PER_RANK_STANDARD + STAR_GLORY + star;
  }

  if(RANK_DIVISI.includes(rank)){
    return r*STAR_PER_RANK_STANDARD+(DIVISI.indexOf(div)*STAR_PER_DIV)+star;
  }

  return r*STAR_PER_RANK_STANDARD+star;
}

function starToRank(total){
  let acc=0;
  for(let r of RANK_ORDER){
    let max=STAR_PER_RANK_STANDARD;
    if(r==="Glory") max=STAR_GLORY;
    if(total<acc+max){
      let s=total-acc;
      if(RANK_DIVISI.includes(r)){
        return `${r} ${DIVISI[Math.floor(s/STAR_PER_DIV)]} ⭐${s%STAR_PER_DIV}`;
      }
      return `${r} ⭐${s}`;
    }
    acc+=max;
  }
  return `Immortal ⭐${total-acc}`;
}

// ======================
// INVOICE
// ======================
function tampilInvoice(start,end,price,title){
  let map={},total=0;
  RANK_ORDER.forEach(r=>map[r]=0);

  for(let i=start;i<end;i++){
    let r=starToRank(i).split(" ")[0];
    map[r]++;
    total+=price[r]||0;
  }

  let out=`--- ${title} ---\n`;
  for(let r of RANK_ORDER){
    if(map[r]>0){
      out+=`${r.padEnd(10)} : ${map[r]} ⭐ x ${formatHarga(price[r])}\n`;
    }
  }

  if(CURRENT_CURRENCY==="MYR"){
    total+=FEE_MYR;
    out+=`Fee MYR     : ${formatHarga(FEE_MYR)}\n`;
  }

  out+=`TOTAL        : ${formatHarga(total)}`;
  hasil.textContent=out;
}

// ======================
// HITUNG
// ======================
function hitungPerBintang(){
  tampilInvoice(
    rankToStar(rank1.value,div1.value,+star1.value),
    rankToStar(rank1.value,div1.value,+star1.value)+ +addStar.value,
    PRICE,"JOKI PER BINTANG"
  );
}

function hitungAntarRank(){
  let s1=rankToStar(rankA.value,divA.value,+starA.value);
  let s2=rankToStar(rankB.value,divB.value,+starB.value);
  if(s2<=s1) return hasil.textContent="Rank tujuan harus lebih tinggi";
  tampilInvoice(s1,s2,PRICE,"JOKI ANTAR RANK");
}

function hitungGendongBintang(){
  tampilInvoice(
    rankToStar(rankG1.value,divG1.value,+starG1.value),
    rankToStar(rankG1.value,divG1.value,+starG1.value)+ +addStarG.value,
    GENDONG,"GENDONG PER BINTANG"
  );
}

function hitungGendongRank(){
  let s1=rankToStar(rankGA.value,divGA.value,+starGA.value);
  let s2=rankToStar(rankGB.value,divGB.value,+starGB.value);
  if(s2<=s1) return hasil.textContent="Rank tujuan harus lebih tinggi";
  tampilInvoice(s1,s2,GENDONG,"GENDONG ANTAR RANK");
}

// ======================
// ESTIMASI
// ======================
function estimasiNominal(){
  let harga = mode.value==="PRICE"?PRICE:GENDONG;
  let cur=rankToStar(rankE.value,divE.value,+starE.value);
  let saldo=+nominal.value,start=cur,used=0;

  while(harga[starToRank(cur).split(" ")[0]]<=saldo){
    saldo-=harga[starToRank(cur).split(" ")[0]];
    used+=harga[starToRank(cur).split(" ")[0]];
    cur++;
  }

  hasil.textContent=
`--- ESTIMASI ---
Naik      : ${cur-start} ⭐
Terpakai  : ${formatHarga(used)}
Sisa      : ${formatHarga(saldo)}`;
}

// ======================
// PRICE LIST
// ======================
function showPriceList(){
  let out="=== JOKI ===\n";
  for(let r in PRICE) out+=`${r.padEnd(10)} : ${formatHarga(PRICE[r])}\n`;
  out+="\n=== GENDONG ===\n";
  for(let r in GENDONG) out+=`${r.padEnd(10)} : ${formatHarga(GENDONG[r])}\n`;
  pricelist.textContent=out;
}

// ======================
// INIT
// ======================
fetchRate();
showMenu(1);
showPriceList();

// ===========================
// RANDOMIZE MINRA IMAGES
// Smooth "wayang" movement
// ===========================

const minraImgs = document.querySelectorAll(".minra-img");
const usedPositions = [];
const minDistance = 100; // jarak minimum antar gambar

// ===========================
// Inisialisasi posisi awal
// ===========================
minraImgs.forEach(img => {
  let x, y;
  let tries = 0;

  do {
    x = Math.random() * (window.innerWidth - 100);
    y = 120 + Math.random() * (window.innerHeight - 200);
    tries++;

    var tooClose = usedPositions.some(pos => {
      const dx = pos.x - x;
      const dy = pos.y - y;
      return Math.sqrt(dx*dx + dy*dy) < minDistance;
    });

  } while (tooClose && tries < 100);

  usedPositions.push({x, y});

  img.style.position = "absolute";
  img.style.left = x + "px";
  img.style.top = y + "px";

  const size = 40 + Math.random() * 60;
  img.style.width = size + "px";
  img.style.opacity = 0.4 + Math.random() * 0.5;

  // animasi smooth
  animateWayang(img, x, y);
});

// ===========================
// RANDOMIZE MINRA IMAGES
// Smooth "wayang" movement versi lambat
// ===========================

const minraImgs = document.querySelectorAll(".minra-img");
const usedPositions = [];
const minDistance = 100; // jarak minimum antar gambar

// ===========================
// Inisialisasi posisi awal
// ===========================
minraImgs.forEach(img => {
  let x, y;
  let tries = 0;

  do {
    x = Math.random() * (window.innerWidth - 100);
    y = 10 + Math.random() * (window.innerHeight - 110); // mulai dari atas
    tries++;

    var tooClose = usedPositions.some(pos => {
      const dx = pos.x - x;
      const dy = pos.y - y;
      return Math.sqrt(dx*dx + dy*dy) < minDistance;
    });

  } while (tooClose && tries < 100);

  usedPositions.push({x, y});

  img.style.position = "absolute";
  img.style.left = x + "px";
  img.style.top = y + "px";

  const size = 40 + Math.random() * 60;
  img.style.width = size + "px";
  img.style.opacity = 0.4 + Math.random() * 0.5;

  // animasi halus
  animateWayangSlow(img, x, y);
});

// ===========================
// Fungsi animasi wayang lambat
// ===========================
function animateWayangSlow(img, originX, originY) {
  const amplitudeX = 5 + Math.random() * 5;  // gerakan horizontal kecil
  const amplitudeY = 3 + Math.random() * 3;  // gerakan vertikal kecil
  const speed = 0.0003 + Math.random() * 0.0003; // sangat lambat

  let angle = (Math.random() - 0.5) * 10; // rotasi ringan
  const rotateSpeed = 0.002 + Math.random() * 0.003; // rotasi super lambat
  const phaseX = Math.random() * 2 * Math.PI;
  const phaseY = Math.random() * 2 * Math.PI;

  function move() {
    const time = Date.now();

    // offset halus untuk gerakan ringan
    const offsetX = Math.sin(time * speed + phaseX) * amplitudeX;
    const offsetY = Math.cos(time * speed + phaseY) * amplitudeY;

    img.style.left = originX + offsetX + "px";
    img.style.top = originY + offsetY + "px";

    // rotasi perlahan
    angle += rotateSpeed;
    img.style.transform = `rotate(${Math.sin(angle)*5}deg) scale(1)`; // rotasi ringan ±5deg

    requestAnimationFrame(move);
  }

  move();
}

// ===========================
// Responsif: update posisi saat resize
// ===========================
window.addEventListener("resize", () => {
  minraImgs.forEach((img, idx) => {
    const pos = usedPositions[idx];
    img.style.left = pos.x + "px";
    img.style.top = pos.y + "px";
  });
});
