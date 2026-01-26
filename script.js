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
// RANK DATA
// ======================
const RANK_ORDER=["Master","GM","Epic","Legend","Mythic","Honor","Glory","Immortal"];
const RANK_DIVISI=["Master","GM","Epic","Legend"];
const DIVISI=["V","IV","III","II","I"];
const STAR_PER_DIV=5;
const STAR_PER_RANK=25;

// ======================
// INIT SELECT
// ======================
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

[
"rank1","rankA","rankB","rankG1","rankGA","rankGB","rankE"
].forEach(fillRank);
[
"div1","divA","divB","divG1","divGA","divGB","divE"
].forEach(fillDiv);

// ======================
// HIDE DIVISI untuk Mythic+
function updateDivisi(rankElId, divElId){
  const rankEl=document.getElementById(rankElId);
  const divEl=document.getElementById(divElId);
  if(!rankEl||!divEl) return;

  rankEl.addEventListener("change", ()=>{
    if(!RANK_DIVISI.includes(rankEl.value)){
      divEl.style.maxHeight="0";
      divEl.style.overflow="hidden";
      divEl.value="";
    } else {
      divEl.style.maxHeight="100px";
      divEl.style.overflow="visible";
    }
  });
}
["rank1","rankA","rankB","rankG1","rankGA","rankGB","rankE"].forEach(id=>{
  updateDivisi(id,id.replace(/rank/,"div"));
});

// ======================
// RANK → STAR
function rankToStar(rank, div, star){
  let total=0;
  for(let r of RANK_ORDER){
    if(r===rank) break;
    if(RANK_DIVISI.includes(r)) total += STAR_PER_RANK; 
    else if(r==="Mythic") total+=24;
    else if(r==="Honor") total+=25;
    else if(r==="Glory") total+=50;
    else if(r==="Immortal") total+=0; // Immortal dihitung akhir
  }
  if(RANK_DIVISI.includes(rank)) total += DIVISI.indexOf(div)*STAR_PER_DIV + star;
  else total += star;
  return total;
}

// ======================
// STAR → RANK
function starToRank(total){
  let stars=total;
  let out="";
  const limit={Mythic:24,Honor:25,Glory:50}; // Immortal unlimited

  for(let r of RANK_ORDER){
    let max=0;
    if(RANK_DIVISI.includes(r)) max=STAR_PER_RANK;
    else if(r==="Mythic") max=limit.Mythic;
    else if(r==="Honor") max=limit.Honor;
    else if(r==="Glory") max=limit.Glory;
    else if(r==="Immortal") max=Infinity;

    if(stars<max){
      if(RANK_DIVISI.includes(r)){
        let divIndex=Math.floor(stars/STAR_PER_DIV);
        out=`${r} ${DIVISI[divIndex]} ⭐${stars%STAR_PER_DIV}`;
      } else out=`${r} ⭐${stars}`;
      break;
    } else stars-=max;
  }
  return out;
}

// ======================
// INVOICE
function tampilInvoice(start,end,price,title){
  let detail={},total=0;
  RANK_ORDER.forEach(r=>detail[r]=0);

  let s=start;
  while(s<end){
    let r="";
    if(s<24) r="Mythic";
    else if(s<24+25) r="Honor";
    else if(s<24+25+50) r="Glory";
    else r="Immortal";

    detail[r]++;
    total+=price[r]||0;
    s++;
  }

  let out=`--- ${title} ---\n`;
  for(let r of RANK_ORDER){
    if(detail[r]>0) out+=`${r.padEnd(10)} : ${detail[r]} ⭐  Rp${(detail[r]*price[r]).toLocaleString()}\n`;
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
  let saldo=+nominal.value,start=cur,used=0;

  while(true){
    let r="";
    if(cur<24) r="Mythic";
    else if(cur<24+25) r="Honor";
    else if(cur<24+25+50) r="Glory";
    else r="Immortal";

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
