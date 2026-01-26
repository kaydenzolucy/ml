const PRICE = {
  Master:3000, GM:4000, Epic:5000, Legend:6000,
  Mythic:13000, Honor:14000, Glory:20000, Immortal:24000
};

const GENDONG = {
  Epic:9000, Legend:10000, Mythic:15000,
  Honor:16000, Glory:25000, Immortal:35000
};

const RANK_ORDER = ["Master","GM","Epic","Legend","Mythic","Honor","Glory","Immortal"];
const RANK_DIVISI = ["Master","GM","Epic","Legend"];
const DIVISI = ["V","IV","III","II","I"];
const STAR_PER_DIV = 5;
const STAR_PER_RANK = 25;

function fillRank(id){
  const el=document.getElementById(id);
  if(!el) return;
  el.innerHTML="";
  RANK_ORDER.forEach(r=>el.add(new Option(r,r)));
}

function fillDiv(id){
  const el=document.getElementById(id);
  if(!el) return;
  el.innerHTML="";
  DIVISI.forEach(d=>el.add(new Option(d,d)));
}

["rank1","rankA","rankB","rankG1","rankGA","rankGB","rankE"]
.forEach(fillRank);
["div1","divA","divB","divG1","divGA","divGB","divE"]
.forEach(fillDiv);

function showMenu(n){
  document.querySelectorAll(".box").forEach(b=>b.style.display="none");
  document.getElementById("menu"+n).style.display="block";
  if(n===6) showPriceList();
}

function rankToStar(rank,div,star){
  let r=RANK_ORDER.indexOf(rank);
  if(RANK_DIVISI.includes(rank)){
    return r*STAR_PER_RANK + DIVISI.indexOf(div)*STAR_PER_DIV + star;
  }
  return r*STAR_PER_RANK + star;
}

function starToRank(total){
  let r=Math.floor(total/STAR_PER_RANK);
  let rank=RANK_ORDER[r];
  let sisa=total%STAR_PER_RANK;
  if(RANK_DIVISI.includes(rank)){
    let d=Math.floor(sisa/STAR_PER_DIV);
    return `${rank} ${DIVISI[d]} ⭐${sisa%STAR_PER_DIV}`;
  }
  return `${rank} ⭐${sisa}`;
}

function tampilInvoice(start,end,price,title){
  let total=0, out=`--- ${title} ---\n`;
  for(let i=start;i<end;i++){
    let r=RANK_ORDER[Math.floor(i/STAR_PER_RANK)];
    if(price[r]){
      total+=price[r];
      out+=`${r} ⭐ +1 = Rp${price[r].toLocaleString()}\n`;
    }
  }
  out+=`-----------------\nTOTAL : Rp${total.toLocaleString()}`;
  hasil.textContent=out;
}

function hitungPerBintang(){
  let s=rankToStar(rank1.value,div1.value,+star1.value);
  tampilInvoice(s,s+ +addStar.value,PRICE,"JOKI PER BINTANG");
}

function hitungAntarRank(){
  tampilInvoice(
    rankToStar(rankA.value,divA.value,+starA.value),
    rankToStar(rankB.value,divB.value,+starB.value),
    PRICE,"JOKI ANTAR RANK"
  );
}

function hitungGendongBintang(){
  let s=rankToStar(rankG1.value,divG1.value,+starG1.value);
  tampilInvoice(s,s+ +addStarG.value,GENDONG,"GENDONG PER BINTANG");
}

function hitungGendongRank(){
  tampilInvoice(
    rankToStar(rankGA.value,divGA.value,+starGA.value),
    rankToStar(rankGB.value,divGB.value,+starGB.value),
    GENDONG,"GENDONG ANTAR RANK"
  );
}

function estimasiNominal(){
  let harga=mode.value==="PRICE"?PRICE:GENDONG;
  let cur=rankToStar(rankE.value,divE.value,+starE.value);
  let saldo=+nominal.value, naik=0;
  while(true){
    let r=RANK_ORDER[Math.floor(cur/STAR_PER_RANK)];
    if(!harga[r]||saldo<harga[r]) break;
    saldo-=harga[r]; cur++; naik++;
  }
  hasil.textContent=
`--- ESTIMASI ---
Naik ${naik} ⭐
Rank Akhir : ${starToRank(cur)}
Sisa : Rp${saldo.toLocaleString()}`;
}

function showPriceList(){
  let out="=== JOKI PER BINTANG ===\n";
  for(let r in PRICE) out+=`${r} : Rp${PRICE[r].toLocaleString()}\n`;
  out+="\n=== GENDONG PER BINTANG ===\n";
  for(let r in GENDONG) out+=`${r} : Rp${GENDONG[r].toLocaleString()}\n`;
  pricelist.textContent=out;
}

showMenu(1);
