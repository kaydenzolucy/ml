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
const pricelist  = document.getElementById("pricelist");
const invoiceCard = document.getElementById("invoiceCard");
const invoiceTitle = document.getElementById("invoiceTitle");
const invoiceBadge = document.getElementById("invoiceBadge");
const invoiceBody = document.getElementById("invoiceBody");
const btnCopy = document.getElementById("btnCopy");
const btnWA = document.getElementById("btnWA");

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
const HONOR_MIN = 25;
const HONOR_MAX = 49;
const GLORY_MIN = 50;
const GLORY_MAX = 99;
const IMMORTAL_MIN = 100;
const IMMORTAL_MAX = 1000; // Practical max

// Rank max stars mapping
const RANK_MAX_STARS = {
  "Master": 24,   // V to I, 5 stars each = 25, but 0-24 index
  "GM": 24,
  "Epic": 24,
  "Legend": 24,
  "Mythic": 24,   // Mythic 0-24
  "Honor": 49,    // Honor 25-49
  "Glory": 99,    // Glory 50-99
  "Immortal": 1000 // Immortal 100+
};

// Rank min stars mapping
const RANK_MIN_STARS = {
  "Master": 0,
  "GM": 0,
  "Epic": 0,
  "Legend": 0,
  "Mythic": 0,
  "Honor": 25,
  "Glory": 50,
  "Immortal": 100
};

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

  // Hide invoice and errors when switching menu
  hideInvoice();
  hideAllErrors();

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
// ERROR HANDLING
// ======================
function showError(menuNum, title, details){
  const el = document.getElementById("error" + menuNum);
  if(!el) return;

  let html = `<div class="error-title">⚠️ ${title}</div>`;
  if(details && details.length > 0){
    html += `<div class="error-detail">`;
    details.forEach(d => {
      html += `• ${d}<br>`;
    });
    html += `</div>`;
  }

  el.innerHTML = html;
  el.classList.add("show");
}

function hideError(menuNum){
  const el = document.getElementById("error" + menuNum);
  if(el){
    el.classList.remove("show");
    el.innerHTML = "";
  }
}

function hideAllErrors(){
  for(let i = 1; i <= 5; i++){
    hideError(i);
  }
}

// ======================
// VALIDASI INPUT
// ======================
function validateInput(rank, div, star, context){
  const errors = [];
  const starNum = +star;

  // Check if star is a valid number
  if(star === "" || star === null || star === undefined){
    errors.push("Bintang tidak boleh kosong!");
    return { valid: false, msg: "Bintang tidak boleh kosong!", errors: errors };
  }

  if(isNaN(starNum)){
    errors.push(`Bintang "${star}" bukan angka yang valid!`);
    return { valid: false, msg: "Bintang tidak valid!", errors: errors };
  }

  if(starNum < 0){
    errors.push(`Bintang tidak boleh negatif (dapat: ${starNum})!`);
    return { valid: false, msg: "Bintang tidak boleh negatif!", errors: errors };
  }

  // Ranks with divisions
  if(RANK_DIVISI.includes(rank)){
    const divIndex = DIVISI.indexOf(div);
    if(divIndex === -1){
      errors.push(`Divisi "${div}" tidak valid untuk rank ${rank}!`);
      return { valid: false, msg: `Divisi tidak valid untuk ${rank}!`, errors: errors };
    }
    if(starNum > STAR_PER_DIV){
      errors.push(`${rank} ${div} maksimal ⭐${STAR_PER_DIV} (dapat: ${starNum})!`);
      return { valid: false, msg: `${rank} ${div} maksimal ⭐${STAR_PER_DIV}!`, errors: errors };
    }
  }else{
    // Mythic+ ranks - check max stars per tier
    const maxStar = RANK_MAX_STARS[rank];
    const minStar = RANK_MIN_STARS[rank];

    if(starNum > maxStar){
      errors.push(`${rank} maksimal ⭐${maxStar} (dapat: ${starNum})!`);
      return { valid: false, msg: `${rank} maksimal ⭐${maxStar}!`, errors: errors };
    }

    if(starNum < minStar && rank !== "Mythic"){
      errors.push(`${rank} minimal ⭐${minStar} (dapat: ${starNum})!`);
      return { valid: false, msg: `${rank} minimal ⭐${minStar}!`, errors: errors };
    }
  }

  return { valid: true, msg: "", errors: [] };
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
  return +star;
}

// ======================
// GET PRICE TIER FOR MYTHIC+ STAR
// ======================
function getMythicPlusTier(starNum){
  if(starNum >= IMMORTAL_MIN) return "Immortal";
  if(starNum >= GLORY_MIN) return "Glory";
  if(starNum >= HONOR_MIN) return "Honor";
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
// INVOICE - Styled Display
// ======================
let currentInvoiceText = "";

function hideInvoice(){
  invoiceCard.classList.remove("show");
  currentInvoiceText = "";
}

function showInvoice(title, badge, fromRank, fromDiv, fromStar, toRank, toDiv, toStar, totalStars, breakdown, total, feeMYR){
  invoiceTitle.textContent = title;
  invoiceBadge.textContent = badge;

  let html = '';

  // From/To section
  html += `
    <div class="invoice-row">
      <span class="label">📍 Dari</span>
      <span class="value rank">${getRankDisplay(fromRank, fromDiv, fromStar)}</span>
    </div>
    <div class="invoice-row">
      <span class="label">🎯 Ke</span>
      <span class="value rank">${getRankDisplay(toRank, toDiv, toStar)}</span>
    </div>
    <div class="invoice-row">
      <span class="label">⭐ Total Bintang</span>
      <span class="value">${totalStars} ⭐</span>
    </div>
  `;

  html += '<div class="invoice-divider"></div>';

  // Breakdown
  if(breakdown && breakdown.length > 0){
    html += '<div class="breakdown-title">Rincian Harga</div>';
    html += '<div class="invoice-breakdown">';
    breakdown.forEach(item => {
      html += `
        <div class="breakdown-item">
          <span class="tier-name">${item.tier}</span>
          <span class="tier-calc">${item.count}⭐ × ${formatHarga(item.price)}</span>
          <span class="tier-price">${formatHarga(item.subtotal)}</span>
        </div>
      `;
    });
    html += '</div>';
  }

  // Fee MYR
  if(feeMYR > 0){
    html += `
      <div class="breakdown-item" style="background:rgba(251,191,36,0.08); border:1px solid rgba(251,191,36,0.15);">
        <span class="tier-name" style="color:var(--yellow);">💱 Fee MYR</span>
        <span></span>
        <span class="tier-price" style="color:var(--yellow);">${formatHarga(feeMYR)}</span>
      </div>
    `;
  }

  // Total
  html += `
    <div class="invoice-total">
      <span class="total-label">💰 TOTAL</span>
      <span class="total-value">${formatHarga(total)}</span>
    </div>
  `;

  invoiceBody.innerHTML = html;
  invoiceCard.classList.add("show");

  // Build text version for copy
  buildInvoiceText(title, fromRank, fromDiv, fromStar, toRank, toDiv, toStar, totalStars, breakdown, total, feeMYR);

  // Update WA link
  const waText = encodeURIComponent(currentInvoiceText);
  btnWA.href = `https://wa.me/?text=${waText}`;
}

function buildInvoiceText(title, fromRank, fromDiv, fromStar, toRank, toDiv, toStar, totalStars, breakdown, total, feeMYR){
  let text = `🐱 *MINRA JOKI MLBB* 🐱\n`;
  text += `═════════════════════\n`;
  text += `*${title}*\n\n`;
  text += `📍 *Dari:* ${getRankDisplay(fromRank, fromDiv, fromStar)}\n`;
  text += `🎯 *Ke:* ${getRankDisplay(toRank, toDiv, toStar)}\n`;
  text += `⭐ *Total:* ${totalStars} bintang\n`;
  text += `═════════════════════\n`;

  if(breakdown && breakdown.length > 0){
    breakdown.forEach(item => {
      text += `${item.tier}: ${item.count}⭐ × ${formatHarga(item.price)} = ${formatHarga(item.subtotal)}\n`;
    });
  }

  if(feeMYR > 0){
    text += `💱 Fee MYR: ${formatHarga(feeMYR)}\n`;
  }

  text += `═════════════════════\n`;
  text += `💰 *TOTAL: ${formatHarga(total)}*\n`;
  text += `═════════════════════\n`;
  text += `Order via MINRA 🐱`;

  currentInvoiceText = text;
}

function copyInvoice(){
  if(!currentInvoiceText) return;

  navigator.clipboard.writeText(currentInvoiceText.replace(/\n/g, "\n")).then(() => {
    btnCopy.innerHTML = '<span>✅</span> Tersalin!';
    btnCopy.classList.add("copied");
    setTimeout(() => {
      btnCopy.innerHTML = '<span>📋</span> Copy Invoice';
      btnCopy.classList.remove("copied");
    }, 2000);
  }).catch(() => {
    btnCopy.innerHTML = '<span>❌</span> Gagal';
    setTimeout(() => {
      btnCopy.innerHTML = '<span>📋</span> Copy Invoice';
    }, 2000);
  });
}

// ======================
// CORE CALCULATION
// ======================
function calculateInvoice(startRank, startDiv, startStar, endRank, endDiv, endStar, price, title, menuNum){
  // Validate inputs
  const v1 = validateInput(startRank, startDiv, startStar, "rank awal");
  if(!v1.valid){ 
    hideInvoice();
    showError(menuNum, v1.msg, v1.errors);
    return null; 
  }

  const v2 = validateInput(endRank, endDiv, endStar, "rank tujuan");
  if(!v2.valid){ 
    hideInvoice();
    showError(menuNum, v2.msg, v2.errors);
    return null; 
  }

  // Calculate absolute positions
  const start = rankToStar(startRank, startDiv, startStar);
  const end = rankToStar(endRank, endDiv, endStar);

  // Check if crossing from lower rank to Mythic+
  const isStartLower = RANK_DIVISI.includes(startRank);
  const isEndLower = RANK_DIVISI.includes(endRank);

  let totalStars = 0;
  let breakdown = [];
  let map = {};
  RANK_ORDER.forEach(r => map[r] = { count: 0, price: price[r] || 0 });

  if(isStartLower && isEndLower){
    // Both in lower ranks: simple subtraction
    if(end <= start){
      hideInvoice();
      showError(menuNum, "Rank tujuan harus lebih tinggi!", [
        `Rank awal: ${getRankDisplay(startRank, startDiv, startStar)}`,
        `Rank tujuan: ${getRankDisplay(endRank, endDiv, endStar)}`,
        `Posisi awal (${start}) >= posisi tujuan (${end})`
      ]);
      return null;
    }
    totalStars = end - start;
    for(let i = start; i < end; i++){
      let r = starToRankLower(i);
      map[r].count++;
    }
  }else if(!isStartLower && !isEndLower){
    // Both in Mythic+: simple subtraction
    if(end <= start){
      hideInvoice();
      showError(menuNum, "Rank tujuan harus lebih tinggi!", [
        `Rank awal: ${getRankDisplay(startRank, startDiv, startStar)}`,
        `Rank tujuan: ${getRankDisplay(endRank, endDiv, endStar)}`,
        `Bintang awal (${start}) >= bintang tujuan (${end})`
      ]);
      return null;
    }
    totalStars = end - start;
    for(let i = start; i < end; i++){
      let tier = getMythicPlusTier(i);
      map[tier].count++;
    }
  }else if(isStartLower && !isEndLower){
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
    let lowerStarEnd = 4 * STAR_PER_RANK_STANDARD; // End of Legend
    for(let i = lowerStarStart; i < lowerStarEnd; i++){
      let r = starToRankLower(i);
      map[r].count++;
    }

    // Mythic+ stars
    for(let i = 0; i < end; i++){
      let tier = getMythicPlusTier(i);
      map[tier].count++;
    }
  }else{
    // Invalid: can't go from Mythic+ to lower rank
    hideInvoice();
    showError(menuNum, "Tidak bisa turun dari Mythic+ ke rank bawah!", [
      `Rank awal: ${getRankDisplay(startRank, startDiv, startStar)} (Mythic+)`,
      `Rank tujuan: ${getRankDisplay(endRank, endDiv, endStar)} (Lower)`,
      `Sistem tidak mendukung penurunan rank dari Mythic+`
    ]);
    return null;
  }

  // Calculate total price
  let total = 0;
  for(let r of RANK_ORDER){
    total += map[r].count * (price[r] || 0);
  }

  // Build breakdown array
  let bd = [];
  for(let r of RANK_ORDER){
    if(map[r].count > 0){
      bd.push({
        tier: r,
        count: map[r].count,
        price: price[r] || 0,
        subtotal: map[r].count * (price[r] || 0)
      });
    }
  }

  // MYR fee
  let feeMYR = 0;
  if(CURRENT_CURRENCY === "MYR"){
    feeMYR = FEE_MYR;
    total += feeMYR;
  }

  return {
    totalStars,
    breakdown: bd,
    total,
    feeMYR
  };
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
      return r;
    }
    acc += max;
  }
  return "Mythic";
}

// ======================
// HITUNG FUNCTIONS
// ======================
function hitungPerBintang(){
  hideError(1);
  const s1 = rankToStar(rank1.value, div1.value, +star1.value);
  const add = +addStar.value;

  if(isNaN(add) || add <= 0){
    hideInvoice();
    showError(1, "Tambah bintang harus lebih dari 0!", [
      `Input: "${addStar.value}"`,
      `Harus berupa angka positif`
    ]);
    return;
  }

  const s2 = s1 + add;
  const result = calculateInvoice(rank1.value, div1.value, +star1.value, rank1.value, div1.value, s2, PRICE, "JOKI PER BINTANG", 1);

  if(result){
    showInvoice(
      "JOKI PER BINTANG",
      "JOKI",
      rank1.value, div1.value, +star1.value,
      rank1.value, div1.value, s2,
      result.totalStars,
      result.breakdown,
      result.total,
      result.feeMYR
    );
  }
}

function hitungAntarRank(){
  hideError(2);
  const result = calculateInvoice(rankA.value, divA.value, +starA.value, rankB.value, divB.value, +starB.value, PRICE, "JOKI ANTAR RANK", 2);

  if(result){
    showInvoice(
      "JOKI ANTAR RANK",
      "JOKI",
      rankA.value, divA.value, +starA.value,
      rankB.value, divB.value, +starB.value,
      result.totalStars,
      result.breakdown,
      result.total,
      result.feeMYR
    );
  }
}

function hitungGendongBintang(){
  hideError(3);
  const s1 = rankToStar(rankG1.value, divG1.value, +starG1.value);
  const add = +addStarG.value;

  if(isNaN(add) || add <= 0){
    hideInvoice();
    showError(3, "Tambah bintang harus lebih dari 0!", [
      `Input: "${addStarG.value}"`,
      `Harus berupa angka positif`
    ]);
    return;
  }

  const s2 = s1 + add;
  const result = calculateInvoice(rankG1.value, divG1.value, +starG1.value, rankG1.value, divG1.value, s2, GENDONG, "GENDONG PER BINTANG", 3);

  if(result){
    showInvoice(
      "GENDONG PER BINTANG",
      "GENDONG",
      rankG1.value, divG1.value, +starG1.value,
      rankG1.value, divG1.value, s2,
      result.totalStars,
      result.breakdown,
      result.total,
      result.feeMYR
    );
  }
}

function hitungGendongRank(){
  hideError(4);
  const result = calculateInvoice(rankGA.value, divGA.value, +starGA.value, rankGB.value, divGB.value, +starGB.value, GENDONG, "GENDONG ANTAR RANK", 4);

  if(result){
    showInvoice(
      "GENDONG ANTAR RANK",
      "GENDONG",
      rankGA.value, divGA.value, +starGA.value,
      rankGB.value, divGB.value, +starGB.value,
      result.totalStars,
      result.breakdown,
      result.total,
      result.feeMYR
    );
  }
}

// ======================
// ESTIMASI
// ======================
function estimasiNominal(){
  hideError(5);

  let harga = mode.value === "PRICE" ? PRICE : GENDONG;
  let curRank = rankE.value;
  let curDiv = divE.value;
  let curStar = +starE.value;
  let saldo = +nominal.value;

  // Validate inputs
  const v = validateInput(curRank, curDiv, curStar, "rank saat ini");
  if(!v.valid){
    hideInvoice();
    showError(5, v.msg, v.errors);
    return;
  }

  if(isNaN(saldo) || saldo <= 0){
    hideInvoice();
    showError(5, "Nominal harus lebih dari 0!", [
      `Input: "${nominal.value}"`,
      `Harus berupa angka positif`
    ]);
    return;
  }

  let isLower = RANK_DIVISI.includes(curRank);
  let start, used = 0, totalNaik = 0;
  let bd = [];

  if(isLower){
    start = rankToStar(curRank, curDiv, curStar);
    // Simulate climbing within lower ranks first
    let current = start;
    while(true){
      let r = starToRankLower(current);
      let price = harga[r] || 0;
      if(price <= 0 || price > saldo - used) break;

      // Track breakdown
      let existing = bd.find(b => b.tier === r);
      if(existing){
        existing.count++;
        existing.subtotal += price;
      }else{
        bd.push({ tier: r, count: 1, price: price, subtotal: price });
      }

      used += price;
      current++;
      totalNaik++;

      // Safety limit
      if(totalNaik > 200) break;
    }

    let feeMYR = CURRENT_CURRENCY === "MYR" ? FEE_MYR : 0;
    let total = used + feeMYR;

    showInvoice(
      "ESTIMASI NOMINAL",
      "ESTIMASI",
      curRank, curDiv, curStar,
      curRank, curDiv, curStar + totalNaik,
      totalNaik,
      bd,
      total,
      feeMYR
    );

    // Override body to show estimation-specific info
    let html = '';
    html += `
      <div class="invoice-row">
        <span class="label">📍 Rank Awal</span>
        <span class="value rank">${getRankDisplay(curRank, curDiv, curStar)}</span>
      </div>
      <div class="invoice-row">
        <span class="label">🎯 Rank Akhir (est)</span>
        <span class="value rank">${starToRankLower(current - 1)}</span>
      </div>
      <div class="invoice-row">
        <span class="label">⭐ Naik</span>
        <span class="value">${totalNaik} ⭐</span>
      </div>
      <div class="invoice-row">
        <span class="label">💵 Budget</span>
        <span class="value">${formatHarga(saldo)}</span>
      </div>
      <div class="invoice-row">
        <span class="label">💸 Terpakai</span>
        <span class="value">${formatHarga(used)}</span>
      </div>
      <div class="invoice-row">
        <span class="label">💰 Sisa</span>
        <span class="value" style="color:var(--green);">${formatHarga(saldo - used)}</span>
      </div>
    `;

    if(bd.length > 0){
      html += '<div class="invoice-divider"></div>';
      html += '<div class="breakdown-title">Rincian</div>';
      html += '<div class="invoice-breakdown">';
      bd.forEach(item => {
        html += `
          <div class="breakdown-item">
            <span class="tier-name">${item.tier}</span>
            <span class="tier-calc">${item.count}⭐ × ${formatHarga(item.price)}</span>
            <span class="tier-price">${formatHarga(item.subtotal)}</span>
          </div>
        `;
      });
      html += '</div>';
    }

    if(feeMYR > 0){
      html += `
        <div class="breakdown-item" style="background:rgba(251,191,36,0.08); border:1px solid rgba(251,191,36,0.15);">
          <span class="tier-name" style="color:var(--yellow);">💱 Fee MYR</span>
          <span></span>
          <span class="tier-price" style="color:var(--yellow);">${formatHarga(feeMYR)}</span>
        </div>
      `;
    }

    html += `
      <div class="invoice-total">
        <span class="total-label">💰 TOTAL</span>
        <span class="total-value">${formatHarga(total)}</span>
      </div>
    `;

    invoiceBody.innerHTML = html;

  }else{
    // Mythic+ estimation
    start = +curStar;
    let current = start;
    while(true){
      let tier = getMythicPlusTier(current);
      let price = harga[tier] || 0;
      if(price <= 0 || price > saldo - used) break;

      let existing = bd.find(b => b.tier === tier);
      if(existing){
        existing.count++;
        existing.subtotal += price;
      }else{
        bd.push({ tier: tier, count: 1, price: price, subtotal: price });
      }

      used += price;
      current++;
      totalNaik++;

      if(totalNaik > 200) break;
    }

    let feeMYR = CURRENT_CURRENCY === "MYR" ? FEE_MYR : 0;
    let total = used + feeMYR;

    showInvoice(
      "ESTIMASI NOMINAL",
      "ESTIMASI",
      curRank, curDiv, curStar,
      curRank, curDiv, current - 1,
      totalNaik,
      bd,
      total,
      feeMYR
    );

    let html = '';
    html += `
      <div class="invoice-row">
        <span class="label">📍 Rank Awal</span>
        <span class="value rank">${getRankDisplay(curRank, curDiv, curStar)}</span>
      </div>
      <div class="invoice-row">
        <span class="label">🎯 Rank Akhir (est)</span>
        <span class="value rank">${curRank} ⭐${current - 1}</span>
      </div>
      <div class="invoice-row">
        <span class="label">⭐ Naik</span>
        <span class="value">${totalNaik} ⭐</span>
      </div>
      <div class="invoice-row">
        <span class="label">💵 Budget</span>
        <span class="value">${formatHarga(saldo)}</span>
      </div>
      <div class="invoice-row">
        <span class="label">💸 Terpakai</span>
        <span class="value">${formatHarga(used)}</span>
      </div>
      <div class="invoice-row">
        <span class="label">💰 Sisa</span>
        <span class="value" style="color:var(--green);">${formatHarga(saldo - used)}</span>
      </div>
    `;

    if(bd.length > 0){
      html += '<div class="invoice-divider"></div>';
      html += '<div class="breakdown-title">Rincian</div>';
      html += '<div class="invoice-breakdown">';
      bd.forEach(item => {
        html += `
          <div class="breakdown-item">
            <span class="tier-name">${item.tier}</span>
            <span class="tier-calc">${item.count}⭐ × ${formatHarga(item.price)}</span>
            <span class="tier-price">${formatHarga(item.subtotal)}</span>
          </div>
        `;
      });
      html += '</div>';
    }

    if(feeMYR > 0){
      html += `
        <div class="breakdown-item" style="background:rgba(251,191,36,0.08); border:1px solid rgba(251,191,36,0.15);">
          <span class="tier-name" style="color:var(--yellow);">💱 Fee MYR</span>
          <span></span>
          <span class="tier-price" style="color:var(--yellow);">${formatHarga(feeMYR)}</span>
        </div>
      `;
    }

    html += `
      <div class="invoice-total">
        <span class="total-label">💰 TOTAL</span>
        <span class="total-value">${formatHarga(total)}</span>
      </div>
    `;

    invoiceBody.innerHTML = html;
  }
}

// ======================
// PRICE LIST - Styled
// ======================
function showPriceList(){
  let html = '';

  // Joki Rank Card
  html += '<div class="pricelist-card">';
  html += '<div class="pricelist-card-header joki"><span class="icon">💎</span> Joki Rank (per ⭐)</div>';
  html += '<div class="pricelist-items">';

  const tierColors = {
    "Master": "master", "GM": "gm", "Epic": "epic", "Legend": "legend",
    "Mythic": "mythic", "Honor": "honor", "Glory": "glory", "Immortal": "immortal"
  };

  for(let r in PRICE){
    html += `
      <div class="pricelist-item">
        <span class="tier"><span class="tier-dot ${tierColors[r] || ''}"></span>${r}</span>
        <span class="price">${formatHarga(PRICE[r])}</span>
      </div>
    `;
  }

  html += '</div>';
  html += '<div class="pricelist-note">💡 Harga per bintang untuk joki rank</div>';
  html += '</div>';

  // Gendong Card
  html += '<div class="pricelist-card">';
  html += '<div class="pricelist-card-header gendong"><span class="icon">🔥</span> Gendong (per ⭐)</div>';
  html += '<div class="pricelist-items">';

  for(let r in GENDONG){
    html += `
      <div class="pricelist-item">
        <span class="tier"><span class="tier-dot ${tierColors[r] || ''}"></span>${r}</span>
        <span class="price">${formatHarga(GENDONG[r])}</span>
      </div>
    `;
  }

  html += '</div>';
  html += '<div class="pricelist-note">💡 Harga per bintang untuk gendong</div>';
  html += '</div>';

  // Fee info
  if(CURRENT_CURRENCY === "MYR"){
    html += '<div class="pricelist-card">';
    html += '<div class="pricelist-card-header" style="background:rgba(251,191,36,0.1); color:var(--yellow);"><span class="icon">💱</span> Info Tambahan</div>';
    html += '<div class="pricelist-items">';
    html += `
      <div class="pricelist-item">
        <span class="tier"><span class="tier-dot" style="background:var(--yellow);"></span>Fee MYR</span>
        <span class="price">${formatHarga(FEE_MYR)}</span>
      </div>
    `;
    html += '</div>';
    html += '<div class="pricelist-note">💡 Fee tambahan untuk pembayaran MYR</div>';
    html += '</div>';
  }

  pricelist.innerHTML = html;
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
    if(el && PRICE[k] !== undefined) el.value = PRICE[k];
  });

  gendongKeys.forEach(k => {
    const el = document.getElementById("admin_g_" + k);
    if(el && GENDONG[k] !== undefined) el.value = GENDONG[k];
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
