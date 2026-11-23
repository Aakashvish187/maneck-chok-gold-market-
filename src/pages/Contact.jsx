import { MessageCircle, Phone, MapPin, Clock, ExternalLink } from 'lucide-react';
import { useStore } from '../lib/store';
import { waLink, generalMessage } from '../lib/whatsapp';

const options = [
  ['Ask about a design', 'Namaste, I would like to ask about a design from your catalogue.'],
  ['Request a call back', 'Namaste, please call me back about your jewellery collection.'],
  ['Wholesale enquiry', 'Namaste, I would like to know about wholesale terms for your collection.'],
  ['Visit the shop', 'Namaste, I plan to visit your shop. What are your timings?'],
];

export default function Contact() {
  const { shop } = useStore();

  const row = (Icon, label, value, href) => (
    <div className="flex gap-3 sm:gap-4 py-3.5 sm:py-4 border-b border-ink/15 items-center">
      <Icon size={20} className="text-brass shrink-0" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="text-[10px] uppercase tracking-[0.2em] text-ink/50 font-medium">{label}</p>
        {href && value ? (
          <a
            href={href}
            className="hover:text-burgundy underline underline-offset-4 break-words text-sm sm:text-base font-medium min-h-[44px] inline-flex items-center"
          >
            {value}
          </a>
        ) : (
          <p className={`text-sm sm:text-base ${value ? 'text-ink' : 'text-ink/50'}`}>
            {value || 'Not set yet. Add in Admin > Shop info.'}
          </p>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 pt-6 sm:pt-10 md:pt-14 pb-12">
      <p className="label">Get in touch</p>
      <h1 className="text-3xl sm:text-5xl md:text-6xl mt-1.5 font-serif">Contact</h1>
      <div className="rule mt-4 sm:mt-8" />

      <div className="grid md:grid-cols-2 gap-8 md:gap-12 mt-6 sm:mt-10">
        <div>
          {row(
            MessageCircle,
            'WhatsApp',
            shop.whatsapp ? `+${shop.whatsapp.replace(/\D/g, '')}` : '',
            shop.whatsapp ? waLink(shop.whatsapp, generalMessage) : ''
          )}
          {row(Phone, 'Phone', shop.phone, shop.phone ? `tel:${shop.phone.replace(/[^\d+]/g, '')}` : '')}
          {row(MapPin, 'Address', shop.address)}
          {row(Clock, 'Opening hours', shop.hours)}

          {shop.mapsUrl ? (
            <a
              href={shop.mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="btn btn-line mt-6 w-full sm:w-auto"
            >
              <ExternalLink size={16} aria-hidden="true" /> Open in Google Maps
            </a>
          ) : (
            <p className="text-xs sm:text-sm text-ink/50 mt-4">Google Maps link: not set (demo).</p>
          )}

          <p className="note mt-6 text-sm sm:text-base">
            Demo: contact details are left blank on purpose. The owner fills them in.
          </p>
        </div>

        <div>
          <h2 className="text-2xl sm:text-3xl font-serif">Enquire on WhatsApp</h2>
          <p className="text-ink/75 mt-1.5 text-xs sm:text-sm leading-relaxed">
            Choose a topic; WhatsApp opens with the message ready to send.
          </p>

          <ul className="mt-4 sm:mt-6 border-t border-ink/25">
            {options.map(([label, msg]) => (
              <li key={label} className="border-b border-ink/15">
                <a
                  href={waLink(shop.whatsapp, msg)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between py-3.5 sm:py-4 hover:text-burgundy min-h-[48px] active:bg-ink/5 px-1 transition-colors"
                >
                  <span className="font-serif text-lg sm:text-2xl">{label}</span>
                  <MessageCircle size={18} className="text-brass shrink-0" aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
