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

const RANK_ORDER=["Master","GM","Epic","Legend","Mythic","Honor","Glory","Immortal"];
const RANK_DIVISI=["Master","GM","Epic","Legend"];
const DIVISI=["V","IV","III","II","I"];
const STAR_PER_DIV=5;
const STAR_PER_RANK=25;

// ======================
// INIT SELECT
function fillRank(id){
  const el=document.getElementById(id); if(!el) return;
  el.innerHTML="";
  RANK_ORDER.forEach(r=>{
    let o=document.createElement("option");
    o.value=r;o.textContent=r;el.appendChild(o);
  });
}
function fillDiv(id){
  const el=document.getElementById(id); if(!el) return;
  el.innerHTML="";
  DIVISI.forEach(d=>{
    let o=document.createElement("option");
    o.value=d;o.textContent=d;el.appendChild(o);
  });
}

// apply fill
["rank1","rankA","rankB","rankG1","rankGA","rankGB","rankE"].forEach(fillRank);
["div1","divA","divB","divG1","divGA","divGB","divE"].forEach(fillDiv);

// ======================
// MENU
function showMenu(n){
  document.querySelectorAll(".box").forEach(b=>b.classList.remove("show"));
  const target=document.getElementById("menu"+n);
  if(target) target.classList.add("show");
  if(n===6) showPriceList();
}

// ======================
// HIDE DIVISI UNTUK MYTHIC+
function updateDivisi(rankElId, divElId){
  const rankEl=document.getElementById(rankElId);
  const divEl=document.getElementById(divElId);
  if(!rankEl||!divEl) return;

  rankEl.addEventListener("change", ()=>{
    if(!RANK_DIVISI.includes(rankEl.value)){
      divEl.style.display="none";
      divEl.value="";
    } else {
      divEl.style.display="block";
    }
  });
}

// apply hide divisi
["rank1","rankA","rankB","rankG1","rankGA","rankGB","rankE"].forEach(id=>{
  updateDivisi(id,id.replace(/rank/,"div"));
});

// ======================
// LOGIC RANK ↔ STAR
function rankToStar(rank, div, star){
  let r=RANK_ORDER.indexOf(rank);
  if(RANK_DIVISI.includes(rank)){
    return r*STAR_PER_RANK+(DIVISI.indexOf(div)*STAR_PER_DIV)+star;
  }
  return r*STAR_PER_RANK+star;
}

function starToRank(total){
  let r=Math.min(Math.floor(total/STAR_PER_RANK),RANK_ORDER.length-1);
  let rank=RANK_ORDER[r];
  let sisa=total%STAR_PER_RANK;
  if(RANK_DIVISI.includes(rank)){
    return `${rank} ${DIVISI[Math.floor(sisa/STAR_PER_DIV)]} ⭐${sisa%STAR_PER_DIV}`;
  }
  return `${rank} ⭐${sisa}`;
}

// ======================
// INVOICE RINGKAS
function tampilInvoice(start,end,price,title){
  let d={},total=0;
  RANK_ORDER.forEach(r=>d[r]=0);

  for(let s=start;s<end;s++){
    let r=RANK_ORDER[Math.floor(s/STAR_PER_RANK)];
    if(price[r]){
      d[r]++; total+=price[r];
    }
  }

  let out=`--- ${title} ---\n`;
  for(let r of RANK_ORDER){
    if(d[r]>0){
      out+=`${r.padEnd(10)} : ${d[r]} ⭐ x Rp${price[r].toLocaleString()} = Rp${(d[r]*price[r]).toLocaleString()}\n`;
    }
  }

  out+=`-----------------------------\n`;
  out+=`Total Bintang : ${end-start} ⭐\n`;
  out+=`Rank Akhir    : ${starToRank(end)}\n`;
  out+=`TOTAL         : Rp${total.toLocaleString()}`;

  hasil.textContent=out;
}

// ======================
// HITUNG
function hitungPerBintang(){
  let s=rankToStar(rank1.value,div1.value,+star1.value);
  tampilInvoice(s,s+ +addStar.value,PRICE,"JOKI PER BINTANG");
}

function hitungAntarRank(){
  let s1=rankToStar(rankA.value,divA.value,+starA.value);
  let s2=rankToStar(rankB.value,divB.value,+starB.value);
  if(s2<=s1){ hasil.textContent="Error: Rank Tujuan harus lebih tinggi dari Rank Awal"; return;}
  tampilInvoice(s1,s2,PRICE,"JOKI ANTAR RANK");
}

function hitungGendongBintang(){
  let s=rankToStar(rankG1.value,divG1.value,+starG1.value);
  tampilInvoice(s,s+ +addStarG.value,GENDONG,"GENDONG PER BINTANG");
}

function hitungGendongRank(){
  let s1=rankToStar(rankGA.value,divGA.value,+starGA.value);
  let s2=rankToStar(rankGB.value,divGB.value,+starGB.value);
  if(s2<=s1){ hasil.textContent="Error: Rank Tujuan harus lebih tinggi dari Rank Awal"; return;}
  tampilInvoice(s1,s2,GENDONG,"GENDONG ANTAR RANK");
}

// ======================
// ESTIMASI NOMINAL
function estimasiNominal(){
  let harga=mode.value==="PRICE"?PRICE:GENDONG;
  let cur=rankToStar(rankE.value,divE.value,+starE.value);
  let saldo=+nominal.value,used=0,start=cur;

  while(true){
    let r=RANK_ORDER[Math.floor(cur/STAR_PER_RANK)];
    if(!harga[r]||saldo<harga[r]) break;
    saldo-=harga[r]; used+=harga[r]; cur++;
  }

  hasil.textContent=
`--- ESTIMASI ---
Rank Awal : ${rankE.value} ${divE.value} ⭐${starE.value}
Modal     : Rp${nominal.value}
-----------------------------
Naik      : ${cur-start} ⭐
Rank Akhir: ${starToRank(cur)}
Terpakai  : Rp${used.toLocaleString()}
Sisa      : Rp${saldo.toLocaleString()}`;
}

// ======================
// PRICE LIST
function showPriceList(){
  let out="=== JOKI PER BINTANG ===\n";
  for(let r of RANK_ORDER) if(PRICE[r])
    out+=`${r.padEnd(10)} : Rp${PRICE[r].toLocaleString()}\n`;

  out+="\n=== GENDONG PER BINTANG ===\n";
  for(let r of RANK_ORDER) if(GENDONG[r])
    out+=`${r.padEnd(10)} : Rp${GENDONG[r].toLocaleString()}\n`;

  pricelist.textContent=out;
}

// ======================
// INIT
showMenu(1);
showPriceList();
