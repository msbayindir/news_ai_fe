// Standart kategori listesi
export const STANDARD_CATEGORIES = [
  "Gündem",
  "Ekonomi",
  "Spor",
  "Asayiş",
  "Diğer",
  "Teknoloji",
  "Sağlık",
  "Eğitim",
  "Siyaset",
  "Kültür-Sanat",
  "Yaşam",
] as const;

// Ana sayfada gösterilecek varsayılan kategoriler
export const DEFAULT_CATEGORIES = ["Yerel"];

// Kategori renkleri
export const CATEGORY_COLORS: Record<string, string> = {
  Spor: "bg-green-100 text-green-700",
  Ekonomi: "bg-blue-100 text-blue-700",
  Siyaset: "bg-purple-100 text-purple-700",
  Teknoloji: "bg-indigo-100 text-indigo-700",
  Sağlık: "bg-red-100 text-red-700",
  Eğitim: "bg-yellow-100 text-yellow-700",
  "Kültür-Sanat": "bg-pink-100 text-pink-700",
  Yaşam: "bg-orange-100 text-orange-700",
  Gündem: "bg-gray-100 text-gray-700",
  Dünya: "bg-teal-100 text-teal-700",
  Magazin: "bg-rose-100 text-rose-700",
  Bilim: "bg-cyan-100 text-cyan-700",
  Otomobil: "bg-slate-100 text-slate-700",
  Yerel: "bg-amber-100 text-amber-700",
  Asayiş: "bg-stone-100 text-stone-700",
  Çevre: "bg-emerald-100 text-emerald-700",
  Turizm: "bg-sky-100 text-sky-700",
  Gıda: "bg-lime-100 text-lime-700",
  Emlak: "bg-violet-100 text-violet-700",
  Hukuk: "bg-zinc-100 text-zinc-700",
  Diğer: "bg-neutral-100 text-neutral-700",
};
