// Builds wa.me links. Number must be digits with country code, e.g. 91XXXXXXXXXX.
export const cleanNumber = (n = '') => String(n).replace(/\D/g, '');

export function waLink(number, text) {
  const num = cleanNumber(number);
  const q = encodeURIComponent(text);
  // Without a number WhatsApp opens its contact picker, so the demo still works.
  return num ? `https://wa.me/${num}?text=${q}` : `https://wa.me/?text=${q}`;
}

export const productUrl = (code) => `${window.location.origin}/product/${encodeURIComponent(code)}`;

export const productMessage = (p) =>
  `Namaste, I am interested in this design from Shree Jewellers.\n\nDesign: ${p.name}\nCode: ${p.code}\nLink: ${productUrl(p.code)}\n\nPlease share details.`;

export const generalMessage = 'Namaste, I saw your digital catalogue and would like to enquire about your jewellery.';
