// ======================
// PRICE & GENDONG (PER STAR)
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

// Mythic+ thresholds (continuous star system)
const HONOR_THRESHOLD = 25;
const GLORY_THRESHOLD = 50;
const IMMORTAL_THRESHOLD = 100;

// ======================
// FETCH RATE (Multiple Fallbacks)
// ======================
async function fetchRate(){
  // Try multiple APIs in order
  const apis = [
    {
      name: "Frankfurter",
      url: "https://api.frankfurter.app/latest?from=IDR&to=MYR",
      extract: (d) => d?.rates?.MYR
    },
    {
      name: "ExchangeRate-API",
      url: "https://api.exchangerate-api.com/v4/latest/IDR",
      extract: (d) => d?.rates?.MYR
    },
    {
      name: "Exchangerate.host",
      url: "https://api.exchangerate.host/latest?base=IDR&symbols=MYR",
      extract: (d) => d?.rates?.MYR
    }
  ];

  for(const api of apis){
    try{
      const r = await fetch(api.url, { cache: "no-store" });
      if(r.ok){
        const d = await r.json();
        const rate = api.extract(d);
        if(rate){
          RATE_IDR_TO_MYR = rate;
          rateInfo.textContent = `1 MYR ≈ Rp${Math.round(1/RATE_IDR_TO_MYR).toLocaleString()} (${api.name})`;
          return;
        }
      }
    }catch(e){
      console.log(`${api.name} failed:`, e.message);
    }
  }

  // All APIs failed, use fallback
  RATE_IDR_TO_MYR = FALLBACK_RATE;
  rateInfo.textContent = "Kurs default (offline)";
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
  document.querySelectorAll(".box").forEach(b=>b.classList.remove("show"));
  const target=document.getElementById("menu"+n);
  if(target) target.classList.add("show");
  if(n===6) showPriceList();
}

// ======================
// DIVISI TOGGLE
// ======================
function updateDivisi(rankId,divId){
  const r=document.getElementById(rankId);
  const d=document.getElementById(divId);
  if(!r||!d) return;

  if(!RANK_DIVISI.includes(r.value)){
    d.style.display="none";
    d.value="";
  }

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
// GET PRICE TIER FOR STAR
// ======================
function getPriceTier(starNum){
  if(starNum >= IMMORTAL_THRESHOLD) return "Immortal";
  if(starNum >= GLORY_THRESHOLD) return "Glory";
  if(starNum >= HONOR_THRESHOLD) return "Honor";
  return "Mythic";
}

// ======================
// RANK -> TOTAL STARS (ABSOLUTE)
// ======================
// For ranks WITH divisions: calculate cumulative stars
// For Mythic+: star is already absolute (continuous)
function rankToStar(rank,div,star){
  let r=RANK_ORDER.indexOf(rank);

  // Ranks with divisions (Master, GM, Epic, Legend)
  if(RANK_DIVISI.includes(rank)){
    return r*STAR_PER_RANK_STANDARD+(DIVISI.indexOf(div)*STAR_PER_DIV)+(+star);
  }

  // Mythic+ ranks: star is absolute continuous count
  // Mythic 3 = 3, Honor 34 = 34, Glory 60 = 60, Immortal 150 = 150
  return +star;
}

// ======================
// TOTAL STARS -> RANK DISPLAY
// ======================
function starToRank(total){
  // For ranks with divisions (0-99 stars range)
  if(total < 100){
    let acc=0;
    for(let r of RANK_ORDER){
      if(r==="Mythic") break;
      let max=STAR_PER_RANK_STANDARD;
      if(total<acc+max){
        let s=total-acc;
        return `${r} ${DIVISI[Math.floor(s/STAR_PER_DIV)]} ⭐${s%STAR_PER_DIV}`;
      }
      acc+=max;
    }
  }

  // Mythic+ continuous system
  if(total >= IMMORTAL_THRESHOLD) return `Immortal ⭐${total}`;
  if(total >= GLORY_THRESHOLD) return `Glory ⭐${total}`;
  if(total >= HONOR_THRESHOLD) return `Honor ⭐${total}`;
  return `Mythic ⭐${total}`;
}

// ======================
// INVOICE
// ======================
function tampilInvoice(start,end,price,title){
  if(end <= start){
    hasil.textContent = "⚠️ Rank tujuan harus lebih tinggi dari rank awal!";
    return;
  }

  let map={},total=0;
  RANK_ORDER.forEach(r=>map[r]=0);

  for(let i=start;i<end;i++){
    let tier = getPriceTier(i);
    map[tier]++;
    total+=price[tier]||0;
  }

  let out=`--- ${title} ---\n`;
  out+=`Dari: ${starToRank(start)}\n`;
  out+=`Ke:   ${starToRank(end-1)}\n`;
  out+=`Total: ${end-start} ⭐\n`;
  out+=`---------------------\n`;

  for(let r of ["Mythic","Honor","Glory","Immortal"]){
    if(map[r]>0){
      out+=`${r.padEnd(10)} : ${map[r]} ⭐ x ${formatHarga(price[r])} = ${formatHarga(map[r]*price[r])}\n`;
    }
  }

  if(CURRENT_CURRENCY==="MYR"){
    total+=FEE_MYR;
    out+=`---------------------\n`;
    out+=`Fee MYR     : ${formatHarga(FEE_MYR)}\n`;
  }

  out+=`=====================\n`;
  out+=`TOTAL        : ${formatHarga(total)}`;
  hasil.textContent=out;
}

// ======================
// HITUNG
// ======================
function hitungPerBintang(){
  const s1 = rankToStar(rank1.value,div1.value,+star1.value);
  const s2 = s1 + (+addStar.value);
  if(+addStar.value <= 0){
    hasil.textContent = "⚠️ Tambah bintang harus lebih dari 0!";
    return;
  }
  tampilInvoice(s1,s2,PRICE,"JOKI PER BINTANG");
}

function hitungAntarRank(){
  let s1=rankToStar(rankA.value,divA.value,+starA.value);
  let s2=rankToStar(rankB.value,divB.value,+starB.value);
  if(s2<=s1){
    hasil.textContent = "⚠️ Rank tujuan harus lebih tinggi dari rank awal!";
    return;
  }
  tampilInvoice(s1,s2,PRICE,"JOKI ANTAR RANK");
}

function hitungGendongBintang(){
  const s1 = rankToStar(rankG1.value,divG1.value,+starG1.value);
  const s2 = s1 + (+addStarG.value);
  if(+addStarG.value <= 0){
    hasil.textContent = "⚠️ Tambah bintang harus lebih dari 0!";
    return;
  }
  tampilInvoice(s1,s2,GENDONG,"GENDONG PER BINTANG");
}

function hitungGendongRank(){
  let s1=rankToStar(rankGA.value,divGA.value,+starGA.value);
  let s2=rankToStar(rankGB.value,divGB.value,+starGB.value);
  if(s2<=s1){
    hasil.textContent = "⚠️ Rank tujuan harus lebih tinggi dari rank awal!";
    return;
  }
  tampilInvoice(s1,s2,GENDONG,"GENDONG ANTAR RANK");
}

// ======================
// ESTIMASI
// ======================
function estimasiNominal(){
  let harga = mode.value==="PRICE"?PRICE:GENDONG;
  let cur=rankToStar(rankE.value,divE.value,+starE.value);
  let saldo=+nominal.value;

  if(saldo <= 0){
    hasil.textContent = "⚠️ Nominal harus lebih dari 0!";
    return;
  }

  let start=cur,used=0;
  let iterations = 0;

  while(iterations < 10000){
    let tier = getPriceTier(cur);
    let price = harga[tier] || 0;
    if(price <= 0 || price > saldo - used) break;
    saldo -= price;
    used += price;
    cur++;
    iterations++;
  }

  hasil.textContent=
`--- ESTIMASI ---
Rank Awal : ${starToRank(start)}
Rank Akhir: ${starToRank(cur-1)}
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

// ======================
// MINRA GALLERY
// ======================
const minraImgs = document.querySelectorAll(".minra-img");
const minDistance = 80;
const marginTop = 120;
const marginBottom = 50;

function getGridPositions() {
  const cols = Math.floor(window.innerWidth / minDistance);
  const rows = Math.floor((window.innerHeight - marginTop - marginBottom) / minDistance);
  const grid = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      grid.push({ x: c * minDistance + 20, y: marginTop + r * minDistance + 20 });
    }
  }
  return grid;
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

let positions = shuffle(getGridPositions());

minraImgs.forEach((img, i) => {
  const pos = positions[i % positions.length];
  img.dataset.baseX = pos.x;
  img.dataset.baseY = pos.y;
  const size = 40 + Math.random() * 60;
  img.style.width = size + "px";
  img.style.opacity = 0.4 + Math.random() * 0.5;
  animateImage(img, pos.x, pos.y);
});

function animateImage(img, baseX, baseY) {
  const maxOffset = 10;
  function move() {
    const offsetX = Math.sin(Date.now() / 1000 + baseX) * maxOffset;
    const offsetY = Math.cos(Date.now() / 1000 + baseY) * maxOffset;
    img.style.left = baseX + offsetX + "px";
    img.style.top = baseY + offsetY + "px";
    requestAnimationFrame(move);
  }
  move();
}

window.addEventListener("resize", () => {
  positions = shuffle(getGridPositions());
  minraImgs.forEach((img, i) => {
    const pos = positions[i % positions.length];
    img.dataset.baseX = pos.x;
    img.dataset.baseY = pos.y;
  });
});
