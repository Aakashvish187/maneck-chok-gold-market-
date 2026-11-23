// Default editable shop details. Nothing here is a real contact detail.
// WhatsApp number is intentionally empty: set VITE_WHATSAPP_NUMBER or edit it in Admin > Shop info.
export const DEFAULT_SHOP = {
  name: 'Shree Jewellers',
  tagline: 'Manek Chowk, Ahmedabad',
  about:
    'Shree Jewellers is a demonstration profile showing how a traditional jewellery shop can present its collection online. Replace this text in Admin > Shop info with the owner\'s own words.',
  whatsapp: import.meta.env.VITE_WHATSAPP_NUMBER || '',
  phone: '',
  address: 'Manek Chowk, Ahmedabad, Gujarat, India (add full shop address)',
  mapsUrl: '',
  hours: 'Add opening hours here',
  heroImage: '/photos/hero.webp',
  shopImage: '/photos/about.webp',
  showPrices: false,
};
