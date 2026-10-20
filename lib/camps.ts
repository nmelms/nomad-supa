export type CampFilter = "all" | "easy-access" | "tent" | "pets" | "water";

export type Camp = {
  id: string;
  name: string;
  region: string;
  state: string;
  coordinates: [number, number];
  shortDescription: string;
  description: string;
  features: string[];
  filters: Exclude<CampFilter, "all">[];
  access: string;
  cell: string;
  bestFor: string;
};

// Illustrative listings for the frontend preview. Replace with verified records
// from Supabase before publishing these places to travelers.
export const camps: Camp[] = [
  { id: "juniper-ridge", name: "Juniper Ridge", region: "San Juan area", state: "Colorado", coordinates: [-107.877, 37.506], shortDescription: "Open skies and high desert views.", description: "A quiet pull-off among juniper and sandstone, with wide views across the San Juan country. Arrive with everything you need and leave no trace.", features: ["Big views", "Pets welcome", "4x4 suggested"], filters: ["pets"], access: "Rough dirt", cell: "Limited", bestFor: "Vans & rigs" },
  { id: "coyote-wash", name: "Coyote Wash", region: "Moab area", state: "Utah", coordinates: [-109.368, 38.52], shortDescription: "Wide open red rock country.", description: "A spacious desert setting with long sunsets and dramatic rock formations. Stay on established routes and check current land management rules.", features: ["Sunset views", "Easy access", "Pets welcome"], filters: ["easy-access", "pets"], access: "Graded dirt", cell: "Variable", bestFor: "Vans & tents" },
  { id: "pine-creek", name: "Pine Creek Overlook", region: "Rio Grande area", state: "Colorado", coordinates: [-106.52, 37.71], shortDescription: "Ponderosa shade near a mountain creek.", description: "A forested mountain setting with cool evenings and water nearby. Bring layers, and confirm seasonal road conditions before heading out.", features: ["Near water", "Tent friendly", "Shaded"], filters: ["water", "tent"], access: "Forest road", cell: "None", bestFor: "Tents" },
  { id: "mesa-light", name: "Mesa Light", region: "Grand Mesa area", state: "Colorado", coordinates: [-108.18, 39.02], shortDescription: "A peaceful high-country horizon.", description: "An open mesa landscape with room to breathe and a broad view of the western slope. Weather can change quickly at elevation.", features: ["Easy access", "Big views", "Tent friendly"], filters: ["easy-access", "tent"], access: "Maintained dirt", cell: "Variable", bestFor: "Tents & vans" },
  { id: "aspen-bend", name: "Aspen Bend", region: "Uncompahgre area", state: "Colorado", coordinates: [-107.53, 38.31], shortDescription: "Aspen groves and cool mountain air.", description: "A tucked-away mountain stop where aspens give way to open sky. Keep a respectful distance from wildlife and existing camps.", features: ["Tent friendly", "Pets welcome", "Shaded"], filters: ["tent", "pets"], access: "Dirt road", cell: "Limited", bestFor: "Tents" },
];
