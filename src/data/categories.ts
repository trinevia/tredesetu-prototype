import { img } from "@/lib/images"
import type { Category } from "@/types"

export const categories: Category[] = [
  {
    id: "electronics",
    name: "Electronics & Electrical",
    icon: "Zap",
    image: img("charger", 600, 400),
    tagline: "Mobile accessories, audio, wearables & security",
    attributes: ["Brand", "Model", "Input Voltage", "Output", "Warranty", "Certification"],
    units: ["Piece", "Box", "Carton"],
    subs: [
      {
        id: "mobile-accessories",
        name: "Mobile Accessories",
        children: [
          { id: "chargers", name: "Chargers" },
          { id: "power-banks", name: "Power Banks" },
          { id: "cables", name: "Data Cables" },
        ],
      },
      {
        id: "audio",
        name: "Audio Devices",
        children: [
          { id: "headphones", name: "Headphones" },
          { id: "speakers", name: "Bluetooth Speakers" },
        ],
      },
      { id: "wearables", name: "Wearables", children: [{ id: "smartwatches", name: "Smartwatches" }] },
      { id: "security", name: "Security & Smart Home", children: [{ id: "smart-locks", name: "Smart Locks" }] },
    ],
  },
  {
    id: "machinery",
    name: "Industrial Machinery",
    icon: "Factory",
    image: img("welding", 600, 400),
    tagline: "CNC, welding, power tools & automation",
    attributes: ["Power", "Capacity", "Automation Grade", "Voltage", "Weight"],
    units: ["Unit", "Set", "Piece"],
    subs: [
      { id: "machine-tools", name: "CNC & Machine Tools", children: [{ id: "cnc-lathe", name: "CNC Lathes" }] },
      { id: "welding", name: "Welding Equipment", children: [{ id: "arc-welders", name: "Arc Welders" }] },
      { id: "power-tools", name: "Power & Hand Tools", children: [{ id: "grinders", name: "Angle Grinders" }] },
      { id: "automation", name: "Industrial Automation", children: [{ id: "plc", name: "PLC & Controls" }] },
    ],
  },
  {
    id: "agriculture",
    name: "Agriculture & Food",
    icon: "Wheat",
    image: img("rice", 600, 400),
    tagline: "Rice, grains, spices & agri inputs",
    attributes: ["Variety", "Grade", "Moisture", "Shelf Life", "Origin"],
    units: ["Kg", "Quintal", "Metric Ton", "Bag"],
    subs: [
      {
        id: "rice-grains",
        name: "Rice & Grains",
        children: [
          { id: "basmati", name: "Basmati Rice" },
          { id: "wheat", name: "Wheat" },
        ],
      },
      { id: "spices", name: "Spices & Masala", children: [{ id: "whole-spices", name: "Whole Spices" }] },
      { id: "seeds", name: "Seeds & Saplings", children: [{ id: "veg-seeds", name: "Vegetable Seeds" }] },
    ],
  },
  {
    id: "textiles",
    name: "Textiles & Apparel",
    icon: "Shirt",
    image: img("apparel", 600, 400),
    tagline: "Fabrics, garments, hosiery & footwear",
    attributes: ["Fabric", "GSM", "Size", "Fit", "Colour"],
    units: ["Piece", "Meter", "Kg", "Dozen"],
    subs: [
      { id: "fabrics", name: "Fabrics", children: [{ id: "cotton-fabric", name: "Cotton Fabric" }] },
      { id: "mens-wear", name: "Men's Wear", children: [{ id: "shirts", name: "Shirts" }] },
      { id: "footwear", name: "Footwear", children: [{ id: "sports-shoes", name: "Sports Shoes" }] },
    ],
  },
  {
    id: "packaging",
    name: "Packaging Material",
    icon: "Package",
    image: img("kraftBox", 600, 400),
    tagline: "Corrugated boxes, paper bags & cartons",
    attributes: ["Ply", "Material", "Size", "Printing", "Bursting Strength"],
    units: ["Piece", "Bundle", "Kg"],
    subs: [
      { id: "boxes", name: "Corrugated Boxes", children: [{ id: "3-ply", name: "3 Ply Boxes" }] },
      { id: "bags", name: "Paper Bags", children: [{ id: "kraft-bags", name: "Kraft Paper Bags" }] },
    ],
  },
  {
    id: "solar",
    name: "Solar & Renewable Energy",
    icon: "Sun",
    image: img("solarField", 600, 400),
    tagline: "Solar panels, inverters & EPC services",
    attributes: ["Wattage", "Cell Type", "Efficiency", "Warranty"],
    units: ["Panel", "Watt", "Unit"],
    subs: [
      { id: "solar-panels", name: "Solar Panels", children: [{ id: "mono-perc", name: "Mono PERC Panels" }] },
      { id: "solar-epc", name: "Solar EPC", children: [{ id: "rooftop", name: "Rooftop Systems" }] },
    ],
  },
  {
    id: "pharma",
    name: "Pharma & Healthcare",
    icon: "Pill",
    image: img("pills", 600, 400),
    tagline: "Generic medicines, APIs & lab equipment",
    attributes: ["Composition", "Pack Size", "Form", "Certification"],
    units: ["Strip", "Box", "Unit"],
    subs: [
      { id: "generics", name: "Generic Medicines", children: [{ id: "tablets", name: "Tablets" }] },
      { id: "lab", name: "Lab Equipment", children: [{ id: "pipettes", name: "Pipettes & Consumables" }] },
    ],
  },
  {
    id: "furniture",
    name: "Furniture & Home Decor",
    icon: "Sofa",
    image: img("sofa", 600, 400),
    tagline: "Sofas, chairs, ceramics & drinkware",
    attributes: ["Material", "Finish", "Dimensions", "Colour"],
    units: ["Piece", "Set"],
    subs: [
      { id: "sofas", name: "Sofas & Seating", children: [{ id: "3-seater", name: "3 Seater Sofas" }] },
      { id: "decor", name: "Home Decor", children: [{ id: "ceramic", name: "Ceramic Ware" }] },
      { id: "drinkware", name: "Drinkware", children: [{ id: "bottles", name: "Steel Bottles" }] },
    ],
  },
  {
    id: "beauty",
    name: "Beauty & Personal Care",
    icon: "Sparkles",
    image: img("cosmetics", 600, 400),
    tagline: "Skincare, cosmetics & private label",
    attributes: ["Skin Type", "Volume", "Ingredients", "Shelf Life"],
    units: ["Piece", "Box", "Litre"],
    subs: [
      { id: "skincare", name: "Skincare", children: [{ id: "serums", name: "Face Serums" }] },
      { id: "private-label", name: "Private Label / Third-Party Mfg.", children: [] },
    ],
  },
  {
    id: "construction",
    name: "Construction & Electricals",
    icon: "HardHat",
    image: img("constructionSite", 600, 400),
    tagline: "Wires, switchgear & building materials",
    attributes: ["Size", "Material", "Standard", "Rating"],
    units: ["Meter", "Coil", "Piece", "Ton"],
    subs: [
      { id: "wires", name: "Wires & Cables", children: [{ id: "house-wire", name: "House Wires" }] },
      { id: "switchgear", name: "Switchgear", children: [{ id: "mcb", name: "MCBs" }] },
    ],
  },
]

export const categoryById = (id: string) => categories.find((c) => c.id === id)

export function subName(categoryId: string, subId: string) {
  return categoryById(categoryId)?.subs.find((s) => s.id === subId)?.name ?? ""
}

export const cities = [
  "Delhi",
  "Mumbai",
  "Ahmedabad",
  "Surat",
  "Pune",
  "Rajkot",
  "Ludhiana",
  "Hyderabad",
  "Chennai",
  "Kochi",
  "Jodhpur",
  "Karnal",
  "Moradabad",
  "Bengaluru",
]
