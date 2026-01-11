const PRICE = {
  Master:4000, GM:5000, Epic:6000, Legend:7000,
  Mythic:15000, Honor:17000, Glory:22000, Immortal:30000
};

const PAKET = {
  "Epic 10":65000, "Legend 10":75000,
  "Mythic 10":170000, "Honor 10":200000,
  "Glory 10":250000, "Immortal 10":290000
};

const RANK_ORDER = ["Master","GM","Epic","Legend","Mythic","Honor","Glory","Immortal"];
const RANK_DIVISI = ["Master","GM","Epic","Legend"];
const DIVISI = ["V","IV","III","II","I"];
const STAR_PER_DIV = 5;
const STAR_PER_RANK = 25;

function fillRank(id){
  let el=document.getElementById(id);
  RANK_ORDER.forEach(r=>el.innerHTML+=`<option>${r}</option>`);
}
function fillDiv(id){ DIVISI.forEach(d=>document.getElementById(id).innerHTML+=`<option>${d}</option>`); }

["rank1","rankA","rankB"].forEach(fillRank);
["div1","divA","divB"].forEach(fillDiv);

function showMenu(n){
  document.querySelectorAll(".box").forEach(b=>b.style.display="none");
  document.getElementById("menu"+n).style.display="block";
}

function rankToStar(rank, div, star){
  let r=RANK_ORDER.indexOf(rank);
  if(RANK_DIVISI.includes(rank)){
    let d=DIVISI.indexOf(div);
    return r*STAR_PER_RANK + d*STAR_PER_DIV + star;
  }
  return r*STAR_PER_RANK + star;
}

function hitungDetail(start,end){
  let d={}; RANK_ORDER.forEach(r=>d[r]=0);
  for(let s=start;s<end;s++){
    d[RANK_ORDER[Math.floor(s/STAR_PER_RANK)]]++;
  }
  return d;
}

function tampilInvoice(start,end){
  let detail=hitungDetail(start,end), total=0, out="--- DETAIL INVOICE ---\n";
  for(let r in detail){
    if(detail[r]>0){
      let h=detail[r]*PRICE[r]; total+=h;
      out+=`${r.padEnd(10)}: ${detail[r]}⭐ x Rp${PRICE[r].toLocaleString()} = Rp${h.toLocaleString()}\n`;
    }
  }
  out+=`-----------------------------\nTOTAL : Rp${total.toLocaleString()}`;
  document.getElementById("hasil").textContent=out;
}

function hitungPerBintang(){
  let s=rankToStar(rank1.value,div1.value,+star1.value);
  tampilInvoice(s,s+ +addStar.value);
}

function hitungAntarRank(){
  let s=rankToStar(rankA.value,divA.value,+starA.value);
  let e=rankToStar(rankB.value,divB.value,+starB.value);
  tampilInvoice(s,e);
}

// Paket
let pk="";
for(let p in PAKET){ pk+=`${p} : Rp${PAKET[p].toLocaleString()}\n`; }
paketList.textContent=pk;

// Update harga
let pe="";
for(let r in PRICE){
  pe+=`${r} : <input value="${PRICE[r]}" oninput="PRICE['${r}']=+this.value"><br>`;
}
priceEdit.innerHTML=pe;
