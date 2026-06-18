export const site = {
  name: "Motorspace Kenya",
  motto: "Driving Prestige, Delivering Value.",
  phone: "0705 769 779",
  phoneHref: "tel:0705769779",
  whatsapp: "0705 769 779",
  whatsappNumber: "254705769779",
  whatsappHref: "https://wa.me/254705769779",
  email: "info@motorspacekenya.co.ke",
  emailHref: "mailto:info@motorspacekenya.co.ke",
  location: "Nairobi, Kenya",
  website: "www.motorspacekenya.co.ke",
  socials: {
    instagram: "https://www.instagram.com/motorspace_kenyaa?igsh=MTFvam9tZDFuNW9qeA==",
    facebook: "https://www.facebook.com/share/1cPF94myCB/",
    tiktok: "",
  },
};

export const whatsappMessages = {
  general:
    "Hello Motorspace Kenya, I hope you are well. I found you on your website and would love friendly guidance on finding the right car. Please help me with the next steps.",
  importRequest:
    "Hello Motorspace Kenya, I hope you are well. I would like help importing a car. Please guide me on sourcing, costs, timelines, and the next steps.",
  carInquiry: (carName: string) =>
    `Hello Motorspace Kenya, I hope you are well. I found the ${carName} on your website and I am interested. Is it still available, and could you kindly guide me on pricing, viewing, and next steps?`,
};

export function getWhatsAppUrl(message?: string) {
  if (!message) return site.whatsappHref;
  return `${site.whatsappHref}?text=${encodeURIComponent(message)}`;
}

export const testimonials = [
  {
    name: "James M.",
    location: "Nairobi",
    text: "motorspaceKenya helped me import my Toyota Harrier smoothly. The process was transparent from start to finish.",
  },
  {
    name: "Aisha K.",
    location: "Mombasa",
    text: "Professional team that delivered exactly what they promised. My CX-5 is a dream to drive.",
  },
  {
    name: "Daniel O.",
    location: "Kisumu",
    text: "Reliable, honest and quick to respond. They sourced a rare model for me at a great price.",
  },
  {
    name: "Mary W.",
    location: "Nakuru",
    text: "Excellent customer support throughout. Will definitely buy from them again.",
  },
];

export const faqs = [
  {
    q: "Do you sell locally available cars?",
    a: "Yes, we offer a curated selection of both locally available and imported vehicles.",
  },
  {
    q: "Can you help me import a car?",
    a: "Absolutely. We guide you through sourcing, shipping, clearance and registration.",
  },
  {
    q: "Which countries can I import from?",
    a: "We import from Japan, the UK, Singapore, Thailand and other major markets.",
  },
  {
    q: "How long does the import process take?",
    a: "Typically 6-10 weeks depending on the source country and shipping schedule.",
  },
  {
    q: "Can I request a specific car?",
    a: "Yes, share your preferred make, model, year and budget and we'll source it for you.",
  },
  {
    q: "Do you offer financing?",
    a: "We partner with leading banks and SACCOs to help you access flexible financing.",
  },
  {
    q: "Can I trade in my current vehicle?",
    a: "Yes. Submit your car details and we will evaluate it for trade-in or direct purchase.",
  },
  {
    q: "Are the listed cars inspected?",
    a: "Every car undergoes a thorough inspection before listing on our platform.",
  },
  {
    q: "How do I book a viewing?",
    a: "Use the WhatsApp or contact form on any car page to schedule a viewing.",
  },
  {
    q: "Can you deliver cars outside Nairobi?",
    a: "Yes, we offer Kenya-wide delivery to all major towns.",
  },
];

export const categories = [
  "SUVs",
  "Sedans",
  "Hatchbacks",
  "Pickups",
  "Vans",
  "Luxury Cars",
  "Hybrid Cars",
  "Electric Cars",
];
