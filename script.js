const PRICE = {
  Master: 4000,
  GM: 5000,
  Epic: 6000,
  Legend: 7000,
  Mythic: 15000,
  Honor: 17000,
  Glory: 22000,
  Immortal: 30000
};

const RANK_ORDER = [
  "Master","GM","Epic","Legend",
  "Mythic","Honor","Glory","Immortal"
];

const RANK_DIVISI = ["Master","GM","Epic","Legend"];
const DIVISI = ["V","IV","III","II","I"];
const STAR_PER_DIV = 5;
const STAR_PER_RANK = 25;

// Populate rank
const rankAwal = document.getElementById("rankAwal");
const divAwal = document.getElementById("divAwal");

RANK_ORDER.forEach(r => {
  let o = document.createElement("option");
  o.value = r;
  o.textContent = r;
  rankAwal.appendChild(o);
});

rankAwal.onchange = updateDivisi;
updateDivisi();

function updateDivisi() {
  divAwal.innerHTML = "";
  if (RANK_DIVISI.includes(rankAwal.value)) {
    DIVISI.forEach(d => {
      let o = document.createElement("option");
      o.value = d;
      o.textContent = d;
      divAwal.appendChild(o);
    });
  } else {
    let o = document.createElement("option");
    o.textContent = "-";
    divAwal.appendChild(o);
  }
}

function rankToStar(rank, div, star) {
  let r = RANK_ORDER.indexOf(rank);
  if (RANK_DIVISI.includes(rank)) {
    let d = DIVISI.indexOf(div);
    return r * STAR_PER_RANK + d * STAR_PER_DIV + star;
  }
  return r * STAR_PER_RANK + star;
}

function hitung() {
  let rank = rankAwal.value;
  let div = divAwal.value;
  let star = parseInt(document.getElementById("starAwal").value);
  let add = parseInt(document.getElementById("tambahStar").value);

  let start = rankToStar(rank, div, star);
  let end = start + add;

  let detail = {};
  RANK_ORDER.forEach(r => detail[r] = 0);

  for (let s = start; s < end; s++) {
    let r = RANK_ORDER[Math.floor(s / STAR_PER_RANK)];
    detail[r]++;
  }

  let output = "--- DETAIL INVOICE ---\n";
  let total = 0;

  for (let r of RANK_ORDER) {
    if (detail[r] > 0) {
      let harga = detail[r] * PRICE[r];
      total += harga;
      output += `${r.padEnd(10)}: ${detail[r]}⭐ x Rp${PRICE[r].toLocaleString()} = Rp${harga.toLocaleString()}\n`;
    }
  }

  output += "------------------------------\n";
  output += `TOTAL        : Rp${total.toLocaleString()}`;

  document.getElementById("hasil").textContent = output;
}
