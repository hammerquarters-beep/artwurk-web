export type ArtworkRecord = {
  id: string;
  displayId?: string;
  name: string;
  image: string;
  price: string;
  dimensions: string;
  story: string;
  category: string;
  status: "available" | "price-on-request" | "reserved" | "sold";
};

const artworks: ArtworkRecord[] = [
  {
    id: "ART-001-002",
    displayId: "ART-001 / ART-002",
    name: "Static Mind + Fragile King (Pair)",
    image: "/artwork/art-001-002-static-mind-fragile-king-pair.png",
    price: "Price on request",
    dimensions: "24 x 24 in each panel, 48 x 24 in combined",
    story:
      "Original paired presentation of the duo, intended to be viewed as one larger narrative statement.",
    category: "Character / IP",
    status: "price-on-request",
  },
  {
    id: "ART-003",
    name: "The Watcher",
    image: "/artwork/art-003-the-watcher.jpg",
    price: "$1,050",
    dimensions: "24 x 48 in",
    story: "A faceless observer with stillness, mystery, and quiet authority.",
    category: "Character / IP",
    status: "available",
  },
  {
    id: "ART-004",
    name: "Impact",
    image: "/artwork/art-004-impact.jpg",
    price: "$1,920",
    dimensions: "30 x 40 in",
    story: "A raw-energy release piece with force, movement, and emotional collision.",
    category: "Bold / Impact",
    status: "available",
  },
  {
    id: "ART-005",
    name: "Gilded Veil",
    image: "/artwork/art-005-gilded-veil.jpg",
    price: "$2,040",
    dimensions: "30 x 40 in",
    story: "A luxury abstract built on concealment, contrast, and hidden value.",
    category: "Luxury / Metallic",
    status: "available",
  },
  {
    id: "ART-007",
    name: "Aftermath",
    image: "/artwork/art-007-aftermath.jpg",
    price: "$2,880",
    dimensions: "24 x 24 in each panel, 48 x 24 in combined",
    story: "A diptych installation capturing what remains after intensity passes.",
    category: "Fluid Abstract",
    status: "available",
  },
  {
    id: "ART-008",
    name: "Three States",
    image: "/artwork/art-008-three-states.png",
    price: "$1,740",
    dimensions: "24 x 48 in",
    story:
      "A narrative character group built around emotional contrast and merch-ready identity.",
    category: "Character / IP",
    status: "available",
  },
  {
    id: "ART-009",
    name: "Velocity Within",
    image: "/artwork/art-009-velocity-within.jpg",
    price: "$1,920",
    dimensions: "30 x 40 in",
    story: "A controlled-motion abstract with tension, energy, and internal restraint.",
    category: "Bold / Impact",
    status: "available",
  },
  {
    id: "ART-013",
    name: "Confrontation / Reflection",
    image: "/artwork/art-013-confrontation-reflection.jpg",
    price: "$1,320",
    dimensions: "16 x 16 in each panel, 32 x 16 in combined",
    story: "A dual-identity diptych built around self-versus-self tension.",
    category: "Character / IP",
    status: "available",
  },
  {
    id: "ART-014",
    name: "Gold Current",
    image: "/artwork/art-014-gold-current.png",
    price: "$960",
    dimensions: "20 x 20 in",
    story: "A minimal luxury flow piece with vein-like direction and controlled movement.",
    category: "Luxury / Metallic",
    status: "available",
  },
  {
    id: "ART-018",
    name: "Velocity of Chaos",
    image: "/artwork/art-018-velocity-of-chaos.png",
    price: "$2,520",
    dimensions: "24 x 48 in",
    story: "A visually aggressive statement work centered on force, impact, and collision.",
    category: "Bold / Impact",
    status: "available",
  },
  {
    id: "ART-032",
    name: "Structured Force",
    image: "/artwork/art-032-structured-force.jpg",
    price: "$1,140",
    dimensions: "24 x 36 in",
    story: "A geometric and gestural bridge piece balancing structure with expression.",
    category: "Bold / Impact",
    status: "available",
  },
  {
    id: "ART-033",
    name: "Inner Conflict",
    image: "/artwork/art-033-inner-conflict.png",
    price: "$1,440",
    dimensions: "24 x 36 in",
    story: "A psychological abstract with hidden-face energy and dark internal tension.",
    category: "Character / IP",
    status: "available",
  },
  {
    id: "ART-035",
    name: "Whispered Ascent",
    image: "/artwork/art-035-whispered-ascent.png",
    price: "$840",
    dimensions: "16 x 20 in",
    story: "A quiet spiritual collector piece with restrained lift and minimal presence.",
    category: "Fluid Abstract",
    status: "available",
  },
  {
    id: "ART-038",
    name: "Black Gold Current",
    image: "/artwork/art-038-black-gold-current.jpg",
    price: "$960",
    dimensions: "16 x 20 in",
    story: "A flagship commercial-style luxury minimal abstract in the black-gold lane.",
    category: "Luxury / Metallic",
    status: "available",
  },
];

export default artworks;
