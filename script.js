// ======================
// PRICE PER BINTANG
// ======================
const PRICE = {
  Master: 3000,
  GM: 4000,
  Epic: 5000,
  Legend: 6000,
  Mythic: 13000,
  Honor: 14000,
  Glory: 20000,
  Immortal: 24000
};

const GENDONG = {
  Epic: 9000,
  Legend: 10000,
  Mythic: 15000,
  Honor: 16000,
  Glory: 25000,
  Immortal: 35000
};

// ======================
// RANK DATA
// ======================
const RANK_ORDER = [
  "Master","GM","Epic","Legend",
  "Mythic","Honor","Glory","Immortal"
];
const DIVISI = ["V","IV","III","II","I"];
const STAR_PER_DIV = 5; // 0-5 bintang per divisi
const STAR_PER_RANK = 25; // master → legend = 25 bintang (5*5)

// cumulative start star untuk Mythic+
const CUMULATIVE_START = {
  Mythic: STAR_PER_RANK * 4,      // Master → Legend = 25*4 = 100
  Honor: STAR_PER_RANK * 4 + 1*25, // Mythic dianggap 25 bintang
  Glory: STAR_PER_RANK * 4 + 1*25 + 25, // Honor start 125+?
  Immortal: STAR_PER_RANK * 4 + 1*25 + 25 + 50 // Glory start 200+?
};
// supaya mudah, kita pakai loop cumulative real count nanti di invoice

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
// SHOW/HIDE MENU
// ======================
function showMenu(n){
  document.querySelectorAll(".box").forEach(b=>b.style.display="none");
  const target = document.getElementById("menu"+n);
  if(target) target.style.display = "block";
  if(n===6) showPriceList();
}

// ======================
// RANK → TOTAL STAR
// ======================
function rankToStar(rank, div, star){
  // bawah Mythic
  if(["Master","GM","Epic","Legend"].includes(rank)){
    return RANK_ORDER.indexOf(rank)*STAR_PER_RANK + (DIVISI.indexOf(div)*STAR_PER_DIV) + star;
  }
  // Mythic+
  let base = 0;
  switch(rank){
    case "Mythic": base = 100; break;
    case "Honor": base = 125; break;  // Mythic max 25 → Honor start 125
    case "Glory": base = 150; break;  // Honor max 25 → Glory start 150
    case "Immortal": base = 200; break; // Glory max 50 → Immortal start 200
  }
  return base + star;
}

// ======================
// TOTAL STAR → RANK STRING
// ======================
function starToRank(total){
  if(total < 25) {
    let r="Master";
    let div=Math.floor(total/STAR_PER_DIV);
    let star=total%STAR_PER_DIV;
    return `${r} ${DIVISI[div]} ⭐${star}`;
  } else if(total < 50){
    let r="GM";
    let div=Math.floor((total-25)/STAR_PER_DIV);
    let star=(total-25)%STAR_PER_DIV;
    return `${r} ${DIVISI[div]} ⭐${star}`;
  } else if(total < 75){
    let r="Epic";
    let div=Math.floor((total-50)/STAR_PER_DIV);
    let star=(total-50)%STAR_PER_DIV;
    return `${r} ${DIVISI[div]} ⭐${star}`;
  } else if(total < 100){
    let r="Legend";
    let div=Math.floor((total-75)/STAR_PER_DIV);
    let star=(total-75)%STAR_PER_DIV;
    return `${r} ${DIVISI[div]} ⭐${star}`;
  } else if(total < 125){
    return `Mythic ⭐${total-100}`;
  } else if(total < 150){
    return `Honor ⭐${total-125}`;
  } else if(total < 200){
    return `Glory ⭐${total-150}`;
  } else {
    return `Immortal ⭐${total-200}`;
  }
}

// ======================
// INVOICE
// ======================
function tampilInvoice(start, end, price, title){
  let detail = {};
  let totalRp = 0;

  RANK_ORDER.forEach(r=>detail[r]=0);

  for(let s=start; s<end; s++){
    let r;
    if(s<100) r = ["Master","GM","Epic","Legend"][Math.floor(s/25)];
    else if(s<125) r="Mythic";
    else if(s<150) r="Honor";
    else if(s<200) r="Glory";
    else r="Immortal";

    if(price[r]){
      detail[r]++;
      totalRp += price[r];
    }
  }

  let out = `--- ${title} ---\n`;
  for(let r of RANK_ORDER){
    if(detail[r]>0){
      out += `${r.padEnd(10)} : ${detail[r]} ⭐  Rp${(detail[r]*price[r]).toLocaleString()}\n`;
    }
  }

  out += `-----------------------------\n`;
  out += `Total Bintang : ${end-start} ⭐\n`;
  out += `Rank Akhir    : ${starToRank(end-1)}\n`;
  out += `TOTAL         : Rp${totalRp.toLocaleString()}`;

  hasil.textContent = out;
}

// ======================
// HITUNG MENU
// ======================
function hitungPerBintang(){
  const s = rankToStar(rank1.value, div1.value, +star1.value);
  tampilInvoice(s, s + +addStar.value, PRICE, "JOKI PER BINTANG");
}

function hitungAntarRank(){
  const sStart = rankToStar(rankA.value, divA.value, +starA.value);
  const sEnd = rankToStar(rankB.value, divB.value, +starB.value);
  tampilInvoice(sStart, sEnd, PRICE, "JOKI ANTAR RANK");
}

function hitungGendongBintang(){
  const s = rankToStar(rankG1.value, divG1.value, +starG1.value);
  tampilInvoice(s, s + +addStarG.value, GENDONG, "GENDONG PER BINTANG");
}

function hitungGendongRank(){
  const sStart = rankToStar(rankGA.value, divGA.value, +starGA.value);
  const sEnd = rankToStar(rankGB.value, divGB.value, +starGB.value);
  tampilInvoice(sStart, sEnd, GENDONG, "GENDONG ANTAR RANK");
}

// ======================
// ESTIMASI NOMINAL
// ======================
function estimasiNominal(){
  const harga = mode.value==="PRICE"?PRICE:GENDONG;
  const start = rankToStar(rankE.value, divE.value, +starE.value);
  let cur=start;
  let saldo=+nominal.value;
  let used=0;

  while(true){
    let r;
    if(cur<100) r=["Master","GM","Epic","Legend"][Math.floor(cur/25)];
    else if(cur<125) r="Mythic";
    else if(cur<150) r="Honor";
    else if(cur<200) r="Glory";
    else r="Immortal";

    if(!harga[r]||saldo<harga[r]) break;
    saldo-=harga[r];
    used+=harga[r];
    cur++;
  }

  hasil.textContent =
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
  for(let r of RANK_ORDER){
    if(PRICE[r]) out += `${r.padEnd(10)} : Rp${PRICE[r].toLocaleString()}\n`;
  }

  out += "\n=== GENDONG PER BINTANG ===\n";
  for(let r of RANK_ORDER){
    if(GENDONG[r]) out += `${r.padEnd(10)} : Rp${GENDONG[r].toLocaleString()}\n`;
  }

  pricelist.textContent = out;
}

// ======================
// HIDE/SHOW DIVISI + LIMIT STAR
// ======================
function updateDivisi(rankElId, divElId, starElId){
  const rankEl = document.getElementById(rankElId);
  const divEl  = document.getElementById(divElId);
  const starEl = document.getElementById(starElId);
  if(!rankEl||!divEl||!starEl) return;

  rankEl.addEventListener("change", ()=>{
    const rank=rankEl.value;

    if(["Mythic","Honor","Glory","Immortal"].includes(rank)){
      divEl.style.maxHeight="0";
      divEl.style.overflow="hidden";
      divEl.style.transition="all 0.3s ease";
      divEl.value="";
      starEl.value=0;
      starEl.max=1000; // unlimited
    } else {
      divEl.style.maxHeight="100px";
      divEl.style.overflow="visible";
      starEl.value=0;
      starEl.max=5; // limit 5 bintang per divisi
    }
  });
}

// APPLY TO ALL MENUS
updateDivisi("rank1","div1","star1");
updateDivisi("rankA","divA","starA");
updateDivisi("rankB","divB","starB");
updateDivisi("rankG1","divG1","starG1");
updateDivisi("rankGA","divGA","starGA");
updateDivisi("rankGB","divGB","starGB");
updateDivisi("rankE","divE","starE");

// ======================
showMenu(1);
showPriceList();
