// Note: This script is meant to be run via `wrangler d1 execute DB --file scripts/seed-cards.sql --local` or similar, but since we have JS, we can just generate a SQL file.

import * as fs from 'fs';
import { createId } from '@paralleldrive/cuid2';

// Usage: node --experimental-strip-types scripts/seed-cards.ts

const seedCards = [
  {
    certNumber: '135618180',
    cardName: '2023 POKEMON JAPANESE SV2A-POKEMON CARD 151 #200 VENUSAUR EX SPECIAL ART RARE',
    frontImage: 'https://www.psacard.com/cert/135618180/image1', // Replace with valid URL if needed, but we will just use mock URLs that look real for now or if they load.
    backImage: 'https://www.psacard.com/cert/135618180/image2',
    itemGrade: 'MINT 9',
    labelType: 'W/ FUGITIVE INK TECHNOLOGY',
    reverseCertBarcode: 'YES',
    year: '2023',
    brandTitle: 'POKEMON JAPANESE SV2A-POKEMON CARD 151',
    subject: 'VENUSAUR EX',
    cardNumber: '200',
    category: 'TCG CARDS',
    varietyPedigree: 'SPECIAL ART RARE',
    psaEstimate: '$98.00',
    psaPopulation: 2263,
    psaPopHigher: 23608,
    status: 'ACTIVE',
  },
  {
    certNumber: '42721323',
    cardName: '1999 POKEMON GAME #4 CHARIZARD HOLO',
    frontImage: 'https://www.psacard.com/cert/42721323/image1',
    backImage: 'https://www.psacard.com/cert/42721323/image2',
    itemGrade: 'NEAR MINT-MINT 8',
    labelType: 'W/ FUGITIVE INK TECHNOLOGY',
    reverseCertBarcode: 'YES',
    year: '1999',
    brandTitle: 'POKEMON GAME',
    subject: 'CHARIZARD',
    cardNumber: '4',
    category: 'TCG CARDS',
    varietyPedigree: 'HOLO',
    psaEstimate: '$6500.00',
    psaPopulation: 5543,
    psaPopHigher: 432,
    status: 'ACTIVE',
  },
  {
    certNumber: '89101234',
    cardName: '2021 POKEMON SWSH BLACK STAR PROMO #SWSH100 CHARIZARD VMAX FULL ART',
    frontImage: 'https://www.psacard.com/cert/89101234/image1',
    backImage: 'https://www.psacard.com/cert/89101234/image2',
    itemGrade: 'GEM MT 10',
    labelType: 'W/ FUGITIVE INK TECHNOLOGY',
    reverseCertBarcode: 'YES',
    year: '2021',
    brandTitle: 'POKEMON SWSH BLACK STAR PROMO',
    subject: 'CHARIZARD VMAX',
    cardNumber: 'SWSH100',
    category: 'TCG CARDS',
    varietyPedigree: 'FULL ART',
    psaEstimate: '$120.00',
    psaPopulation: 12433,
    psaPopHigher: 0,
    status: 'ACTIVE',
  },
  {
    certNumber: '55667788',
    cardName: '2002 POKEMON NEO DESTINY #107 SHINING CHARIZARD 1ST EDITION',
    frontImage: 'https://www.psacard.com/cert/55667788/image1',
    backImage: 'https://www.psacard.com/cert/55667788/image2',
    itemGrade: 'MINT 9',
    labelType: 'W/ FUGITIVE INK TECHNOLOGY',
    reverseCertBarcode: 'YES',
    year: '2002',
    brandTitle: 'POKEMON NEO DESTINY',
    subject: 'SHINING CHARIZARD',
    cardNumber: '107',
    category: 'TCG CARDS',
    varietyPedigree: '1ST EDITION',
    psaEstimate: '$3450.00',
    psaPopulation: 850,
    psaPopHigher: 112,
    status: 'ACTIVE',
  },
  {
    certNumber: '99887766',
    cardName: '1999 POKEMON GAME #1 ALAKAZAM 1ST EDITION-THICK STAMP HOLO',
    frontImage: 'https://www.psacard.com/cert/99887766/image1',
    backImage: 'https://www.psacard.com/cert/99887766/image2',
    itemGrade: 'NM-MT 8',
    labelType: 'W/ FUGITIVE INK TECHNOLOGY',
    reverseCertBarcode: 'YES',
    year: '1999',
    brandTitle: 'POKEMON GAME',
    subject: 'ALAKAZAM',
    cardNumber: '1',
    category: 'TCG CARDS',
    varietyPedigree: '1ST EDITION-THICK STAMP',
    psaEstimate: '$1500.00',
    psaPopulation: 452,
    psaPopHigher: 60,
    status: 'ACTIVE',
  },
];

let sql = '';
for (const card of seedCards) {
  const id = createId();
  sql += `INSERT INTO cards (id, cert_number, card_name, front_image, back_image, item_grade, label_type, reverse_cert_barcode, year, brand_title, subject, card_number, category, variety_pedigree, psa_estimate, psa_population, psa_pop_higher, status, created_at)
VALUES ('${id}', '${card.certNumber}', '${card.cardName}', '${card.frontImage}', '${card.backImage}', '${card.itemGrade}', '${card.labelType}', '${card.reverseCertBarcode}', '${card.year}', '${card.brandTitle}', '${card.subject}', '${card.cardNumber}', '${card.category}', '${card.varietyPedigree}', '${card.psaEstimate}', ${card.psaPopulation}, ${card.psaPopHigher}, '${card.status}', ${Date.now()});\n`;
}

fs.writeFileSync('scripts/seed-cards.sql', sql);
console.log('Generated scripts/seed-cards.sql');
