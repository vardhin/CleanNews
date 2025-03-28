import { Code, Building2, Globe, Trophy, DollarSign, AlertTriangle, Umbrella, Briefcase, Leaf, Map, Users } from 'lucide-svelte';

export const featuredArticle = {
  title: "Israel strikes Beirut for first time since ceasefire deal agreed with Hezbollah",
  description: "Israeli forces conduct first strike on Beirut following the recently established ceasefire agreement with Hezbollah.",
  imageUrl: "https://images.unsplash.com/photo-1652829801221-657a18291061?q=80&w=1000",
  category: "Israel-Hamas Conflict"
};

export const featuredArticles = [
  {
    title: "Tech Giants Face New Scrutiny Over Anti-Competitive Practices",
    description: "Leading tech corporations are under investigation for alleged monopolistic behaviors impacting market competition and consumer choice.",
    imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800",
    category: "Tech"
  },
  {
    title: "Global Climate Summit Yields Breakthrough Agreement",
    description: "World leaders reach historic consensus on ambitious climate action targets and funding mechanisms.",
    imageUrl: "https://images.unsplash.com/photo-1535932942092-0c430fdf6f81?w=800",
    category: "World"
  },
  {
    title: "Artificial Intelligence Transforms Healthcare Diagnosis",
    description: "New AI-powered diagnostic tools show promising results in early disease detection and treatment planning.",
    imageUrl: "https://images.unsplash.com/photo-1576671081837-49000212a370?w=800",
    category: "Tech"
  }
];

export const categories = [
  { text: "Israel-Hamas Conflict", icon: "alert-triangle" },
  { text: "EU", icon: "globe" },
  { text: "Natural Disasters", icon: "umbrella" },
  { text: "Social Media", icon: "users" },
  { text: "Artificial Intelligence", icon: "code" },
  { text: "IT", icon: "code" },
  { text: "European Union", icon: "globe" },
  { text: "Donald Trump", icon: "users" },
  { text: "Taxes", icon: "dollar-sign" },
  { text: "Amazon", icon: "briefcase" },
  { text: "Baseball", icon: "trophy" }
];

export const articles = [
  {
    title: "Israel strikes Beirut for first time since ceasefire deal agreed with Hezbollah",
    description: "Israeli forces conduct first strike on Beirut following the recently established ceasefire agreement with Hezbollah.",
    imageUrl: "https://images.unsplash.com/photo-1652829801221-657a18291061?q=80&w=1000",
    category: "Israel-Hamas Conflict",
    stats: { leftAuthors: 12, centerAuthors: 44, rightAuthors: 8 }
  },
  {
    title: "Early signs of heart problems linked to smaller brain volumes: American Academy of Neurology",
    description: "Research shows correlation between early cardiovascular issues and reduced brain volume according to new neurological findings.",
    imageUrl: "https://images.unsplash.com/photo-1628348070889-cb656235b4eb?q=80&w=1000",
    category: "Health",
    stats: { leftAuthors: 2, centerAuthors: 17, rightAuthors: 3 }
  },
  {
    title: "China's Xi Jinping meets foreign CEOs to urge trade stability",
    description: "Chinese President hosts meeting with international business leaders to promote stable trade relations amid global economic tensions.",
    imageUrl: "https://images.unsplash.com/photo-1574280363402-2f672940b871?q=80&w=1000",
    category: "Business",
    stats: { leftAuthors: 4, centerAuthors: 13, rightAuthors: 7 }
  },
  {
    title: "At least 4 police, 3 suspected militants killed in Kashmir fighting",
    description: "Deadly clash in Kashmir results in casualties among police forces and militant groups as regional tensions persist.",
    imageUrl: "https://images.unsplash.com/photo-1590301157890-4810ed352733?q=80&w=1000",
    category: "World",
    stats: { leftAuthors: 5, centerAuthors: 8, rightAuthors: 3 }
  },
  {
    title: "At least 2 dead in Nepal after pro-monarchy supporters clash with police during rally",
    description: "Protests supporting monarchy restoration in Nepal turn deadly with multiple casualties reported following confrontations with authorities.",
    imageUrl: "https://images.unsplash.com/photo-1623776025811-fd139155574b?q=80&w=1000",
    category: "World",
    stats: { leftAuthors: 3, centerAuthors: 7, rightAuthors: 2 }
  },
  {
    title: "Wildlife charity faces damages claim over elephant project in Africa linked to 12 deaths",
    description: "Conservation organization faces legal action following fatalities connected to elephant management initiative in Africa.",
    imageUrl: "https://images.unsplash.com/photo-1581852017103-68ac65514cf7?q=80&w=1000",
    category: "World",
    stats: { leftAuthors: 7, centerAuthors: 5, rightAuthors: 3 }
  },
  {
    title: "Japan unveils evacuation plan for Taiwan contingency",
    description: "Japanese authorities reveal strategic evacuation procedures in preparation for potential Taiwan-related crisis scenarios.",
    imageUrl: "https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?q=80&w=1000",
    category: "World",
    stats: { leftAuthors: 4, centerAuthors: 5, rightAuthors: 7 }
  },
  {
    title: "Trump Signs Order to Overhaul Smithsonian's Historical Narratives",
    description: "The directive tasks Vice President JD Vance with reviewing content and restoring monuments, including Confederate statues, while redefining 'accurate' historical depictions of America.",
    imageUrl: "https://images.unsplash.com/photo-1613645695025-20e3f38de4a4?q=80&w=1000",
    category: "Donald Trump",
    stats: { leftAuthors: 9, centerAuthors: 4, rightAuthors: 3 }
  },
  {
    title: "Many Feared Dead After Powerful Earthquake Hits Myanmar and Thailand",
    description: "Major earthquake strikes regions of Myanmar and Thailand with significant casualties reported and extensive infrastructure damage.",
    imageUrl: "https://images.unsplash.com/photo-1505322747495-6afdd3b70760?q=80&w=1000",
    category: "Natural Disasters",
    stats: { leftAuthors: 4, centerAuthors: 20, rightAuthors: 5 }
  },
  {
    title: "King cancels engagements after 'experiencing temporary side effects'",
    description: "Monarch postpones scheduled appearances due to health concerns following recent medical treatment.",
    imageUrl: "https://images.unsplash.com/photo-1518214598173-1666bc921d66?q=80&w=1000",
    category: "World",
    stats: { leftAuthors: 5, centerAuthors: 24, rightAuthors: 5 }
  },
  {
    title: "Trump announces 25% tariffs on all cars 'not made in the United States'",
    description: "Former president declares significant import tariffs on foreign-manufactured vehicles as part of economic policy proposal.",
    imageUrl: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=1000",
    category: "Donald Trump",
    stats: { leftAuthors: 10, centerAuthors: 22, rightAuthors: 8 }
  },
  {
    title: "Brazil's Supreme Court Orders Bolsonaro to Stand Trial for Alleged Coup Plot",
    description: "Judicial ruling requires former Brazilian president to face legal proceedings regarding allegations of coup attempt involvement.",
    imageUrl: "https://images.unsplash.com/photo-1551871812-10ecc21ffa2f?q=80&w=1000",
    category: "World",
    stats: { leftAuthors: 12, centerAuthors: 10, rightAuthors: 5 }
  },
  {
    title: "The Atlantic releases the entire Signal chat showing Shapiro's detailed attack plans",
    description: "Publication discloses complete messaging records revealing comprehensive strategy behind controversial political offensive.",
    imageUrl: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?q=80&w=1000",
    category: "Social Media",
    stats: { leftAuthors: 8, centerAuthors: 3, rightAuthors: 5 }
  }
];

export const blindspotArticles = [
  {
    title: "Trump hosts Iftar dinner at White House, vows support for Muslims",
    imageUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1000",
    stats: { leftAuthors: 1, centerAuthors: 2, rightAuthors: 75 }
  },
  {
    title: "Trump-backed Byron Donalds makes his campaign debut in the 2024 Vice Presidential race",
    imageUrl: "https://images.unsplash.com/photo-1612831455359-970e23a1e4e8?q=80&w=1000",
    stats: { leftAuthors: 2, centerAuthors: 1, rightAuthors: 87 }
  }
]; 