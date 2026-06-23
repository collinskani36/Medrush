export const formatKES = (n: number) =>
  `KES ${Math.round(n).toLocaleString("en-KE")}`;

export const formatPhoneForWa = (phone: string) =>
  phone.replace(/\D/g, "").replace(/^0/, "254");
