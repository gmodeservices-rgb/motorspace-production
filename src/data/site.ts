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

export const blogPosts = [
  {
    slug: "buy-car-kenya-safely",
    title: "How to Buy a Car in Kenya Safely",
    category: "Buying Guide",
    excerpt: "Essential steps and checks to make a confident purchase.",
    date: "2026-06-01",
    image:
      "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80",
  },
  {
    slug: "best-cars-import-kenya",
    title: "Best Cars to Import to Kenya",
    category: "Imports",
    excerpt: "Top reliable, fuel-efficient and family-friendly options.",
    date: "2026-05-25",
    image:
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",
  },
  {
    slug: "local-vs-import",
    title: "Local Purchase vs Importing: Which Is Better?",
    category: "Insights",
    excerpt: "A side-by-side breakdown of cost, time and quality.",
    date: "2026-05-15",
    image:
      "https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=1200&q=80",
  },
  {
    slug: "car-import-duty-kenya",
    title: "Understanding Car Import Duty in Kenya",
    category: "Imports",
    excerpt: "How KRA calculates duty and what to expect.",
    date: "2026-05-05",
    image:
      "https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=1200&q=80",
  },
  {
    slug: "best-suvs-kenyan-roads",
    title: "Best SUVs for Kenyan Roads",
    category: "Reviews",
    excerpt: "Comfortable, capable and reliable picks for any terrain.",
    date: "2026-04-28",
    image:
      "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=1200&q=80",
  },
  {
    slug: "used-car-tips",
    title: "Tips Before Buying a Used Car",
    category: "Buying Guide",
    excerpt: "Inspect, test drive and verify documents like a pro.",
    date: "2026-04-15",
    image:
      "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=1200&q=80",
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
