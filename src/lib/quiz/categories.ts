/**
 * The catalogue the picker renders. `topics` are handed to the model so each
 * batch is anchored to different ground, which is what stops ten parallel calls
 * from returning the same question five times.
 */
export type Category = {
  id: string;
  label: string;
  blurb: string;
  topics: string[];
};

export const CATEGORIES: Category[] = [
  {
    id: "agriculture",
    label: "Agriculture",
    blurb: "Crops, soil, livestock, and farm machinery.",
    topics: [
      "soil science and fertility",
      "crop production and rotation",
      "irrigation and water management",
      "plant pests and disease control",
      "livestock and poultry husbandry",
      "farm machinery and mechanisation",
      "post-harvest handling and storage",
      "agricultural economics and marketing",
    ],
  },
  {
    id: "business-management",
    label: "Business and Management",
    blurb: "Management theory, planning, and organisation.",
    topics: [
      "management functions and planning",
      "organisational structure and delegation",
      "leadership and motivation",
      "human resource management",
      "business ethics and corporate governance",
      "project and operations management",
      "change management",
      "business communication",
    ],
  },
  {
    id: "computer-studies",
    label: "Computer Studies (IT/CS)",
    blurb: "Programming, networks, data, and systems.",
    topics: [
      "programming fundamentals and control flow",
      "data structures and algorithms",
      "object-oriented programming",
      "databases and SQL",
      "computer networks and the internet",
      "operating systems",
      "cybersecurity fundamentals",
      "systems analysis and design",
    ],
  },
  {
    id: "education",
    label: "Education (Math, English, and related courses)",
    blurb: "Mathematics, English, and education theory.",
    topics: [
      "algebra and equations",
      "geometry and measurement",
      "probability and statistics",
      "calculus foundations",
      "English grammar and syntax",
      "reading comprehension and literature",
      "technical and vocational education",
      "assessment and curriculum design",
    ],
  },
  {
    id: "engineering",
    label: "Engineering",
    blurb: "Mechanical, electrical, civil, and chemical principles.",
    topics: [
      "engineering mathematics and units",
      "thermodynamics and heat transfer",
      "fluid mechanics",
      "electrical circuits and Ohm's law",
      "strength of materials and statics",
      "engineering drawing and tolerances",
      "control systems",
      "safety standards and quality control",
    ],
  },
  {
    id: "architecture-drafting",
    label: "Architecture and Drafting",
    blurb: "Building drawing, design, and construction docs.",
    topics: [
      "architectural lettering and line types",
      "scale, projection, and orthographic drawing",
      "plan reading and floor plans",
      "building codes and zoning",
      "materials and finishes",
      "structural and building systems",
      "site planning and landscape",
      "technical specification writing",
    ],
  },
  {
    id: "environmental-sciences",
    label: "Environmental Sciences",
    blurb: "Ecology, climate, pollution, and sustainability.",
    topics: [
      "ecosystems and food chains",
      "biodiversity and conservation",
      "climate change and the carbon cycle",
      "air and water pollution",
      "solid waste management",
      "renewable energy and sustainability",
      "soil conservation and land degradation",
      "environmental policy and impact assessment",
    ],
  },
  {
    id: "finance-accounting",
    label: "Finance and Accounting",
    blurb: "Bookkeeping, reporting, and financial decisions.",
    topics: [
      "double-entry bookkeeping and the trial balance",
      "general ledger and chart of accounts",
      "financial statements and the accounting equation",
      "accrual versus cash basis",
      "payroll and taxation basics",
      "budgeting and variance analysis",
      "working capital and ratio analysis",
      "internal controls and auditing",
    ],
  },
  {
    id: "food-technology",
    label: "Food Technology",
    blurb: "Processing, safety, and quality of food products.",
    topics: [
      "food composition and nutrition",
      "microbiology of food and fermentation",
      "food preservation and packaging",
      "thermal processing and pasteurisation",
      "food safety and HACCP",
      "baking and cereal technology",
      "dairy and meat processing",
      "food quality and sensory evaluation",
    ],
  },
  {
    id: "automotive-technology",
    label: "Automotive Technology",
    blurb: "Engine, electrical, and workshop systems.",
    topics: [
      "internal combustion engine principles",
      "lubrication and cooling systems",
      "fuel and ignition systems",
      "transmission and drivetrain",
      "automotive electrical and battery systems",
      "suspension, steering, and brakes",
      "vehicle diagnostics and OBD",
      "occupational safety in the workshop",
    ],
  },
  {
    id: "hospitality-management",
    label: "Hospitality Management",
    blurb: "Hotel, restaurant, and events operations.",
    topics: [
      "hospitality products and departments",
      "front office and reservation handling",
      "food and beverage service standards",
      "housekeeping operations",
      "revenue and yield management",
      "events and banqueting",
      "customer service and complaint handling",
      "food safety and hygiene in catering",
    ],
  },
  {
    id: "general",
    label: "General Knowledge",
    blurb: "Mixed numeracy, literacy, and reasoning.",
    topics: [
      "general numeracy",
      "percentages, ratio, and proportion",
      "reading comprehension",
      "vocabulary in context",
      "logic and reasoning",
      "everyday science",
      "geography and history",
      "current general knowledge",
    ],
  },
];

export function findCategory(id: string): Category | undefined {
  return CATEGORIES.find((category) => category.id === id);
}
