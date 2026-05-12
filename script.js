// ======================
// DYNAMIC PRICE CONFIG (loaded from config.json)
// ======================
let PRICE = {};
let GENDONG = {};
let FEE_MYR = 10000;
let FALLBACK_RATE = 0.00030;

// ======================
// CURRENCY CONFIG
// ======================
let CURRENT_CURRENCY = "IDR";
let RATE_IDR_TO_MYR = 0.00030;

// ======================
// LOAD CONFIG FROM JSON
// ======================
async function loadConfig(){
  try{
    const r = await fetch("config.json", { cache: "no-store" });
    if(r.ok){
      const d = await r.json();
      if(d.PRICE) PRICE = d.PRICE;
      if(d.GENDONG) GENDONG = d.GENDONG;
      if(d.FEE_MYR) FEE_MYR = d.FEE_MYR;
      if(d.FALLBACK_RATE) FALLBACK_RATE = d.FALLBACK_RATE;
      console.log("✅ Config loaded!");
      return true;
    }
  }catch(e){
    console.log("❌ Failed to load config:", e);
  }
  // Fallback to default prices
  PRICE = {
    Master:3000, GM:4000, Epic:5000, Legend:6000,
    Mythic:13000, Honor:14000, Glory:20000, Immortal:24000
  };
  GENDONG = {
    Epic:9000, Legend:10000, Mythic:15000,
    Honor:16000, Glory:25000, Immortal:35000
  };
  console.log("⚠️ Using default prices");
  return false;
}

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
const MYTHIC_MAX = 24;
const HONOR_THRESHOLD = 25;
const GLORY_THRESHOLD = 50;
const IMMORTAL_THRESHOLD = 100;

// ======================
// FETCH RATE (Multiple APIs)
// ======================
async function fetchRate(){
  const apis = [
    {
      name: "ExchangeRate-API",
      url: "https://api.exchangerate-api.com/v4/latest/IDR",
      extract: (d) => d?.rates?.MYR
    },
    {
      name: "Exchangerate.host",
      url: "https://api.exchangerate.host/latest?base=IDR&symbols=MYR",
      extract: (d) => d?.rates?.MYR
    },
    {
      name: "Frankfurter",
      url: "https://api.frankfurter.app/latest?from=IDR&to=MYR",
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
          rateInfo.textContent = `1 MYR ≈ Rp${Math.round(1/RATE_IDR_TO_MYR).toLocaleString()}`;
          return;
        }
      }
    }catch(e){
      console.log(`${api.name} failed:`, e.message);
    }
  }

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
// VALIDASI INPUT
// ======================
function validateInput(rank, div, star){
  const starNum = +star;
  if(isNaN(starNum) || starNum < 0){
    return { valid: false, msg: "⚠️ Bintang tidak valid!" };
  }

  if(RANK_DIVISI.includes(rank)){
    // Ranks with divisions
    const divIndex = DIVISI.indexOf(div);
    if(divIndex === -1){
      return { valid: false, msg: `⚠️ Divisi tidak valid untuk ${rank}!` };
    }
    if(starNum > STAR_PER_DIV){
      return { valid: false, msg: `⚠️ ${rank} ${div} maksimal ⭐${STAR_PER_DIV}!` };
    }
  }else{
    // Mythic+ ranks
    if(rank === "Mythic" && starNum > MYTHIC_MAX){
      return { valid: false, msg: `⚠️ Mythic maksimal ⭐${MYTHIC_MAX}!` };
    }
  }

  return { valid: true, msg: "" };
}

// ======================
// RANK -> TOTAL STARS (HYBRID SYSTEM)
// ======================
// Lower ranks: cumulative (0-99)
// Mythic+: continuous relative (0-1000)
function rankToStar(rank, div, star){
  // Lower ranks with divisions
  if(RANK_DIVISI.includes(rank)){
    let r = RANK_ORDER.indexOf(rank);
    return r * STAR_PER_RANK_STANDARD + (DIVISI.indexOf(div) * STAR_PER_DIV) + (+star);
  }

  // Mythic+ ranks: return relative star count
  // Mythic 3 = 3, Honor 33 = 33, Glory 60 = 60
  return +star;
}

// ======================
// GET PRICE TIER FOR MYTHIC+ STAR
// ======================
function getMythicPlusTier(starNum){
  if(starNum >= IMMORTAL_THRESHOLD) return "Immortal";
  if(starNum >= GLORY_THRESHOLD) return "Glory";
  if(starNum >= HONOR_THRESHOLD) return "Honor";
  return "Mythic";
}

// ======================
// GET RANK DISPLAY NAME
// ======================
function getRankDisplay(rank, div, star){
  if(RANK_DIVISI.includes(rank)){
    return `${rank} ${div} ⭐${star}`;
  }
  return `${rank} ⭐${star}`;
}

// ======================
// INVOICE
// ======================
function tampilInvoice(startRank, startDiv, startStar, endRank, endDiv, endStar, price, title){
  // Validate inputs
  const v1 = validateInput(startRank, startDiv, startStar);
  if(!v1.valid){ hasil.textContent = v1.msg; return; }

  const v2 = validateInput(endRank, endDiv, endStar);
  if(!v2.valid){ hasil.textContent = v2.msg; return; }

  // Calculate absolute positions
  const start = rankToStar(startRank, startDiv, startStar);
  const end = rankToStar(endRank, endDiv, endStar);

  // Check if crossing from lower rank to Mythic+
  const isStartLower = RANK_DIVISI.includes(startRank);
  const isEndLower = RANK_DIVISI.includes(endRank);
  const isStartMythicPlus = !isStartLower;
  const isEndMythicPlus = !isEndLower;

  let totalStars = 0;
  let map = {};
  RANK_ORDER.forEach(r => map[r] = { count: 0, price: price[r] || 0 });

  if(isStartLower && isEndLower){
    // Both in lower ranks: simple subtraction
    if(end <= start){
      hasil.textContent = "⚠️ Rank tujuan harus lebih tinggi!";
      return;
    }
    totalStars = end - start;
    for(let i = start; i < end; i++){
      let r = starToRankLower(i);
      map[r]++;
    }
  }else if(isStartMythicPlus && isEndMythicPlus){
    // Both in Mythic+: simple subtraction
    if(end <= start){
      hasil.textContent = "⚠️ Rank tujuan harus lebih tinggi!";
      return;
    }
    totalStars = end - start;
    for(let i = start; i < end; i++){
      let tier = getMythicPlusTier(i);
      map[tier]++;
    }
  }else if(isStartLower && isEndMythicPlus){
    // Crossing from lower to Mythic+
    // 1. Stars to finish current lower rank
    let lowerRemaining = 0;
    let currentRankIndex = RANK_ORDER.indexOf(startRank);
    let currentDivIndex = DIVISI.indexOf(startDiv);
    let currentStar = +startStar;

    // Stars to finish current division
    lowerRemaining += (STAR_PER_DIV - currentStar);

    // Stars to finish remaining divisions in current rank
    lowerRemaining += (currentDivIndex) * STAR_PER_DIV;

    // Stars for ranks between current and Legend
    for(let i = currentRankIndex + 1; i < 4; i++){
      lowerRemaining += STAR_PER_RANK_STANDARD;
    }

    // 2. Mythic+ stars
    let mythicPlusStars = end; // end is already relative

    totalStars = lowerRemaining + mythicPlusStars;

    // Calculate pricing
    // Lower rank stars
    let lowerStarStart = start;
    let lowerStarEnd = (currentRankIndex + 1) * STAR_PER_RANK_STANDARD;
    for(let i = lowerStarStart; i < lowerStarEnd; i++){
      let r = starToRankLower(i);
      map[r]++;
    }

    // Mythic+ stars
    for(let i = 0; i < end; i++){
      let tier = getMythicPlusTier(i);
      map[tier]++;
    }
  }else{
    // Invalid: can't go from Mythic+ to lower rank
    hasil.textContent = "⚠️ Tidak bisa turun dari Mythic+ ke rank bawah!";
    return;
  }

  // Calculate total price
  let total = 0;
  for(let r of RANK_ORDER){
    total += map[r].count * (price[r] || 0);
  }

  // Build output
  let out = `--- ${title} ---\n`;
  out += `Dari: ${getRankDisplay(startRank, startDiv, startStar)}\n`;
  out += `Ke:   ${getRankDisplay(endRank, endDiv, endStar)}\n`;
  out += `Total: ${totalStars} ⭐\n`;
  out += `---------------------\n`;

  for(let r of RANK_ORDER){
    if(map[r].count > 0){
      out += `${r.padEnd(10)} : ${map[r].count}⭐ x ${formatHarga(price[r])} = ${formatHarga(map[r].count * price[r])}\n`;
    }
  }

  if(CURRENT_CURRENCY === "MYR"){
    total += FEE_MYR;
    out += `---------------------\n`;
    out += `Fee MYR     : ${formatHarga(FEE_MYR)}\n`;
  }

  out += `=====================\n`;
  out += `TOTAL        : ${formatHarga(total)}`;
  hasil.textContent = out;
}

// ======================
// STAR TO RANK (Lower ranks only)
// ======================
function starToRankLower(total){
  let acc = 0;
  for(let r of RANK_ORDER){
    if(r === "Mythic") break;
    let max = STAR_PER_RANK_STANDARD;
    if(total < acc + max){
      let s = total - acc;
      return `${r} ${DIVISI[Math.floor(s / STAR_PER_DIV)]} ⭐${s % STAR_PER_DIV}`;
    }
    acc += max;
  }
  return `Mythic ⭐${total - acc}`;
}

// ======================
// HITUNG FUNCTIONS
// ======================
function hitungPerBintang(){
  const s1 = rankToStar(rank1.value, div1.value, +star1.value);
  const s2 = s1 + (+addStar.value);
  if(+addStar.value <= 0){
    hasil.textContent = "⚠️ Tambah bintang harus lebih dari 0!";
    return;
  }
  tampilInvoice(rank1.value, div1.value, +star1.value, rank1.value, div1.value, s2, PRICE, "JOKI PER BINTANG");
}

function hitungAntarRank(){
  tampilInvoice(rankA.value, divA.value, +starA.value, rankB.value, divB.value, +starB.value, PRICE, "JOKI ANTAR RANK");
}

function hitungGendongBintang(){
  const s1 = rankToStar(rankG1.value, divG1.value, +starG1.value);
  const s2 = s1 + (+addStarG.value);
  if(+addStarG.value <= 0){
    hasil.textContent = "⚠️ Tambah bintang harus lebih dari 0!";
    return;
  }
  tampilInvoice(rankG1.value, divG1.value, +starG1.value, rankG1.value, divG1.value, s2, GENDONG, "GENDONG PER BINTANG");
}

function hitungGendongRank(){
  tampilInvoice(rankGA.value, divGA.value, +starGA.value, rankGB.value, divGB.value, +starGB.value, GENDONG, "GENDONG ANTAR RANK");
}

// ======================
// ESTIMASI
// ======================
function estimasiNominal(){
  let harga = mode.value === "PRICE" ? PRICE : GENDONG;
  let curRank = rankE.value;
  let curDiv = divE.value;
  let curStar = +starE.value;
  let saldo = +nominal.value;

  if(saldo <= 0){
    hasil.textContent = "⚠️ Nominal harus lebih dari 0!";
    return;
  }

  let isLower = RANK_DIVISI.includes(curRank);
  let start, used = 0, totalNaik = 0;

  if(isLower){
    start = rankToStar(curRank, curDiv, curStar);
    // Simulate climbing within lower ranks first
    let current = start;
    while(true){
      let r = starToRankLower(current).split(" ")[0];
      let price = harga[r] || 0;
      if(price <= 0 || price > saldo - used) break;
      used += price;
      current++;
      totalNaik++;
    }
    hasil.textContent =
`--- ESTIMASI ---
Rank Awal : ${getRankDisplay(curRank, curDiv, curStar)}
Rank Akhir: ${starToRankLower(current - 1)}
Naik      : ${totalNaik} ⭐
Terpakai  : ${formatHarga(used)}
Sisa      : ${formatHarga(saldo - used)}`;
  }else{
    // Mythic+ estimation
    start = +curStar;
    let current = start;
    while(true){
      let tier = getMythicPlusTier(current);
      let price = harga[tier] || 0;
      if(price <= 0 || price > saldo - used) break;
      used += price;
      current++;
      totalNaik++;
    }
    hasil.textContent =
`--- ESTIMASI ---
Rank Awal : ${getRankDisplay(curRank, curDiv, curStar)}
Rank Akhir: ${curRank} ⭐${current - 1}
Naik      : ${totalNaik} ⭐
Terpakai  : ${formatHarga(used)}
Sisa      : ${formatHarga(saldo - used)}`;
  }
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
(async function init(){
  await loadConfig();
  loadLocalConfig(); // Override with localStorage if exists
  await fetchRate();
  showMenu(1);
  showPriceList();
})();

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

// ======================
// ADMIN PANEL FUNCTIONS
// ======================
function showAdmin(){
  document.getElementById("adminOverlay").classList.add("show");
  loadAdminPrices();
  document.body.style.overflow = "hidden";
}

function closeAdmin(){
  document.getElementById("adminOverlay").classList.remove("show");
  document.body.style.overflow = "";
}

function loadAdminPrices(){
  // Load current prices into admin form
  const priceKeys = ["Master","GM","Epic","Legend","Mythic","Honor","Glory","Immortal"];
  const gendongKeys = ["Epic","Legend","Mythic","Honor","Glory","Immortal"];

  priceKeys.forEach(k => {
    const el = document.getElementById("admin_p_" + k);
    if(el && PRICE[k]) el.value = PRICE[k];
  });

  gendongKeys.forEach(k => {
    const el = document.getElementById("admin_g_" + k);
    if(el && GENDONG[k]) el.value = GENDONG[k];
  });

  document.getElementById("admin_fee").value = FEE_MYR;
}

function savePrices(){
  // Read from admin form
  const priceKeys = ["Master","GM","Epic","Legend","Mythic","Honor","Glory","Immortal"];
  const gendongKeys = ["Epic","Legend","Mythic","Honor","Glory","Immortal"];

  priceKeys.forEach(k => {
    const el = document.getElementById("admin_p_" + k);
    if(el) PRICE[k] = +el.value;
  });

  gendongKeys.forEach(k => {
    const el = document.getElementById("admin_g_" + k);
    if(el) GENDONG[k] = +el.value;
  });

  FEE_MYR = +document.getElementById("admin_fee").value;

  // Save to localStorage
  const config = {
    updated: new Date().toISOString(),
    PRICE: PRICE,
    GENDONG: GENDONG,
    FEE_MYR: FEE_MYR,
    FALLBACK_RATE: FALLBACK_RATE
  };
  localStorage.setItem("minra_config", JSON.stringify(config));

  // Update displays
  showPriceList();

  // Show success
  const output = document.getElementById("adminOutput");
  output.textContent = "✅ Harga berhasil disimpan!\n\nHarga baru akan langsung aktif di website ini.\nUntuk update permanen, klik 'Export JSON' dan paste ke config.json di GitHub.";
  output.classList.add("show");

  // Hide after 3 seconds
  setTimeout(() => output.classList.remove("show"), 5000);
}

function exportJSON(){
  const config = {
    updated: new Date().toISOString().split("T")[0],
    note: "Edit harga di bawah ini, lalu save. Website akan otomatis update!",
    PRICE: PRICE,
    GENDONG: GENDONG,
    FEE_MYR: FEE_MYR,
    FALLBACK_RATE: FALLBACK_RATE
  };

  const json = JSON.stringify(config, null, 2);

  // Copy to clipboard
  navigator.clipboard.writeText(json).then(() => {
    const output = document.getElementById("adminOutput");
    output.textContent = "📋 JSON sudah di-copy!\n\nCara update di GitHub:\n1. Buka config.json di repo GitHub\n2. Klik tombol ✏️ Edit\n3. Hapus semua isi, paste JSON ini\n4. Scroll bawah, isi 'Update harga' di commit message\n5. Klik 'Commit changes'\n\n✨ Website akan update dalam 1-2 menit!";
    output.classList.add("show");
  }).catch(() => {
    const output = document.getElementById("adminOutput");
    output.textContent = json + "\n\n⚠️ Gagal auto-copy. Silakan copy manual di atas.";
    output.classList.add("show");
  });
}

// Load from localStorage on startup (overrides config.json)
function loadLocalConfig(){
  try{
    const saved = localStorage.getItem("minra_config");
    if(saved){
      const d = JSON.parse(saved);
      if(d.PRICE) PRICE = d.PRICE;
      if(d.GENDONG) GENDONG = d.GENDONG;
      if(d.FEE_MYR) FEE_MYR = d.FEE_MYR;
      if(d.FALLBACK_RATE) FALLBACK_RATE = d.FALLBACK_RATE;
      console.log("✅ Loaded from localStorage");
      return true;
    }
  }catch(e){
    console.log("❌ localStorage error:", e);
  }
  return false;
}
