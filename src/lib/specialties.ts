// Single source of truth for doctor categories.
// Used by the public Consultation filter and the admin "Add doctor" form.
export const DOCTOR_CATEGORIES = [
  "General Practioner",
  "Women's Health",
  "Child Health",
  "Heart & Chest",
  "Skin & Hair",
  "Mental Wellness",
] as const;

export const SPECIALTIES = ["All", ...DOCTOR_CATEGORIES] as const;

export type Specialty = (typeof SPECIALTIES)[number];
