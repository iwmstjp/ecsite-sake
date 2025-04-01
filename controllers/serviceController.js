async function getTop10SakeId() {
  const response = await fetch(
    "https://muro.sakenowa.com/sakenowa-data/api/rankings"
  );
  const data = await response.json();
  const rankDate = data.yearMonth;
  let top10 = [];
  for (let i = 0; i < 10; i++) {
    top10.push(data.overall[i].brandId);
  }
  return [top10, rankDate];
}

async function getTop10Sake(sakeIds) {
  const response = await fetch(
    "https://muro.sakenowa.com/sakenowa-data/api/brands"
  );
  const data = await response.json();
  const top10Sake = data.brands.filter((item) => sakeIds.includes(item.id));
  return top10Sake;
}
//{ id: 1, name: 'sake', breweryId: 1 }

module.exports = { getTop10SakeId, getTop10Sake };
