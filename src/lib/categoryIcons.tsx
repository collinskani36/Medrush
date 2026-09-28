import type { LucideIcon } from "lucide-react";
import {
  Pill, Thermometer, Leaf, Bandage, Baby, Sparkles, HeartPulse, FileText,
} from "lucide-react";

// Maps each catalog category to a representative icon component.
// Stored as components (not pre-sized JSX) so callers can size them
// however they need — small for the Home drawers, large for the
// ProductCard/ProductDetail "no image" fallback.
export const CATEGORY_ICON_MAP: Record<string, LucideIcon> = {
  "Pain Relief": Pill,
  "Cold & Flu": Thermometer,
  "Vitamins": Leaf,
  "First Aid": Bandage,
  "Baby Care": Baby,
  "Supplements": Sparkles,
  "Personal Care": HeartPulse,
  "Prescription": FileText,
};

export function getCategoryIcon(category: string): LucideIcon {
  return CATEGORY_ICON_MAP[category] ?? Pill;
}
