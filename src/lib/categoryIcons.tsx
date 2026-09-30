import type { LucideIcon } from "lucide-react";
import {
  Pill, Thermometer, Leaf, Bandage, Baby, Sparkles, HeartPulse, FileText,
  LucideHandPlatter,
  LucideGeorgianLari,
  SyringeIcon,
  LucideBalloon,
  LucideFlaskConical,
  LucideStethoscope,
  CookingPotIcon,
  LucideRose,
  LucideThermometer,
  LucideEvCharger,
  LucideScanHeart,
  LucideRibbon,
} from "lucide-react";

// Maps each catalog category to a representative icon component.
// Stored as components (not pre-sized JSX) so callers can size them
// however they need — small for the Home drawers, large for the
// ProductCard/ProductDetail "no image" fallback.
export const CATEGORY_ICON_MAP: Record<string, LucideIcon> = {
  "Pain and Fever": Pill,
  "Cold, Flu and Allergy": LucideThermometer,
  "Vitamins and Supplements": Leaf,
  "First Aid": Bandage,
  "Baby and Mum": Baby,
  "Antibiotics": SyringeIcon,
  "Skin": Sparkles,
  "Diabetes and High Blood Pressure": LucideStethoscope,
  "Stomach and Digestion": CookingPotIcon,
  "Sexual Wellness": LucideRibbon  ,
  "Personal Care": HeartPulse,
  "Women's Health": LucideRose,
  "Prescription": FileText,
  "Medical Devices": LucideScanHeart
};

export function getCategoryIcon(category: string): LucideIcon {
  return CATEGORY_ICON_MAP[category] ?? Pill;
}
