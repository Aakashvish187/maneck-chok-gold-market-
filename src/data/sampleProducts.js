// SAMPLE DATA ONLY. These 30 designs are demo placeholders, not a real inventory.
// No prices are invented: price is null everywhere. Images are empty so the UI shows
// a clearly marked "photo placeholder". Replace with real, licensed photographs via the admin panel.

export const CATEGORIES = [
  { id: 'chains', name: 'Gold Chains', gu: 'ગોલ્ડ ચેઇન', code: 'CH' },
  { id: 'necklaces', name: 'Necklaces', gu: 'નેકલેસ', code: 'NK' },
  { id: 'bangles', name: 'Bangles', gu: 'બંગડી', code: 'BG' },
  { id: 'rings', name: 'Rings', gu: 'વીંટી', code: 'RG' },
  { id: 'earrings', name: 'Earrings', gu: 'બુટ્ટી', code: 'ER' },
  { id: 'bridal', name: 'Bridal Sets', gu: 'બ્રાઇડલ સેટ', code: 'BR' },
];

const rows = {
  chains: [
    ['Rope Chain', 'Twisted rope links', 'Daily wear'],
    ['Box Chain', 'Square box links', 'Daily wear'],
    ['Curb Chain', 'Flat interlocked curb links', 'Gents'],
    ['Singapore Chain', 'Fine twisted weave', 'Ladies'],
    ['Figaro Chain', 'Alternating short and long links', 'Gents'],
  ],
  necklaces: [
    ['Temple Necklace', 'Traditional temple motifs', 'Festive'],
    ['Mango Mala', 'Mango (kairi) motif strand', 'Traditional'],
    ['Layered Haar', 'Long layered strands', 'Festive'],
    ['Choker Set', 'Close-fit choker style', 'Occasion wear'],
    ['Antique Finish Necklace', 'Matte antique finish', 'Traditional'],
  ],
  bangles: [
    ['Plain Kadli Bangle', 'Smooth round profile', 'Daily wear'],
    ['Patla Bangle', 'Flat band style', 'Traditional'],
    ['Kada', 'Broad bracelet style', 'Gents / Ladies'],
    ['Filigree Bangle', 'Fine openwork pattern', 'Festive'],
    ['Carved Bangle', 'Hand-carved surface', 'Occasion wear'],
  ],
  rings: [
    ['Solitaire-Style Ring', 'Single stone setting', 'Ladies'],
    ['Signet Ring', 'Flat engraved top', 'Gents'],
    ['Band Ring', 'Plain polished band', 'Couple / Daily'],
    ['Floral Ring', 'Flower motif crown', 'Ladies'],
    ['Cocktail Ring', 'Broad statement top', 'Occasion wear'],
  ],
  earrings: [
    ['Jhumka', 'Dome and bell shape', 'Traditional'],
    ['Stud Earrings', 'Simple stud pair', 'Daily wear'],
    ['Chandbali', 'Crescent-shaped drop', 'Festive'],
    ['Drop Earrings', 'Long elegant drop', 'Occasion wear'],
    ['Hoop Earrings', 'Round hoop pair', 'Daily wear'],
  ],
  bridal: [
    ['Bridal Necklace Set', 'Necklace, earrings and tikka', 'Wedding'],
    ['Rani Haar Set', 'Long haar with matching earrings', 'Wedding'],
    ['Temple Bridal Set', 'Temple motif full set', 'Wedding'],
    ['Kundan-Style Set', 'Kundan-style setting', 'Wedding'],
    ['Heritage Bridal Set', 'Antique finish bridal set', 'Wedding'],
  ],
};

let n = 0;
export const SAMPLE_PRODUCTS = CATEGORIES.flatMap((c) =>
  rows[c.id].map(([name, desc, use], i) => {
    n += 1;
    const code = `SJ-${c.code}-${String(i + 1).padStart(3, '0')}`;
    return {
      id: `sample-${n}`,
      code,
      name,
      category: c.id,
      description: desc,
      specs: { Style: desc, 'Best for': use, Details: 'Weight, size and making charges: ask on WhatsApp' },
      price: null,
      images: [`/photos/${code}.webp`],
      visible: true,
      featured: n % 5 === 1, // 6 featured designs
      is_sample: true,
    };
  })
);
