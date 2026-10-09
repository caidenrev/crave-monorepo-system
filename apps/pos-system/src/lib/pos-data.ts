export type Product = {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  minStock: number;
  supplier_id?: string | null;
};

export type CartLine = { product: Product; qty: number };

export const products: Product[] = [
  {
    id: "p1",
    name: "Es Kopi Susu",
    sku: "8991001",
    category: "Minuman",
    price: 18000,
    stock: 42,
    minStock: 10,
  },
  {
    id: "p2",
    name: "Americano",
    sku: "8991002",
    category: "Minuman",
    price: 16000,
    stock: 35,
    minStock: 10,
  },
  {
    id: "p3",
    name: "Cappuccino",
    sku: "8991003",
    category: "Minuman",
    price: 22000,
    stock: 8,
    minStock: 10,
  },
  {
    id: "p4",
    name: "Teh Melati",
    sku: "8991004",
    category: "Minuman",
    price: 12000,
    stock: 60,
    minStock: 10,
  },
  {
    id: "p5",
    name: "Croissant Butter",
    sku: "8991005",
    category: "Makanan",
    price: 25000,
    stock: 14,
    minStock: 6,
  },
  {
    id: "p6",
    name: "Nasi Ayam Geprek",
    sku: "8991006",
    category: "Makanan",
    price: 28000,
    stock: 20,
    minStock: 8,
  },
  {
    id: "p7",
    name: "Roti Bakar Keju",
    sku: "8991007",
    category: "Makanan",
    price: 20000,
    stock: 4,
    minStock: 8,
  },
  {
    id: "p8",
    name: "Kentang Goreng",
    sku: "8991008",
    category: "Snack",
    price: 15000,
    stock: 30,
    minStock: 10,
  },
  {
    id: "p9",
    name: "Pisang Goreng",
    sku: "8991009",
    category: "Snack",
    price: 13000,
    stock: 25,
    minStock: 10,
  },
  {
    id: "p10",
    name: "Air Mineral 600ml",
    sku: "8991010",
    category: "Lainnya",
    price: 6000,
    stock: 120,
    minStock: 24,
  },
  {
    id: "p11",
    name: "Donat Gula",
    sku: "8991011",
    category: "Snack",
    price: 9000,
    stock: 2,
    minStock: 12,
  },
  {
    id: "p12",
    name: "Matcha Latte",
    sku: "8991012",
    category: "Minuman",
    price: 24000,
    stock: 18,
    minStock: 10,
  },
];

export const categories = ["Semua"] as const;

export type Role = "Owner" | "Manajer" | "Kasir" | "Gudang";

export type Employee = {
  id: string;
  name: string;
  email: string;
  role: Role;
  active: boolean;
  lastActive: string;
};

export const employees: Employee[] = [
  {
    id: "e1",
    name: "Samantha W",
    email: "samantha@umkm.id",
    role: "Owner",
    active: true,
    lastActive: "Baru saja",
  },
  {
    id: "e2",
    name: "Adam Saputra",
    email: "adam@umkm.id",
    role: "Manajer",
    active: true,
    lastActive: "12 menit lalu",
  },
  {
    id: "e3",
    name: "Dewi Lestari",
    email: "dewi@umkm.id",
    role: "Kasir",
    active: true,
    lastActive: "1 jam lalu",
  },
  {
    id: "e4",
    name: "Rizky Pratama",
    email: "rizky@umkm.id",
    role: "Gudang",
    active: false,
    lastActive: "3 hari lalu",
  },
];

export const rolePermissions: { permission: string; roles: Role[] }[] = [
  { permission: "Transaksi kasir", roles: ["Owner", "Manajer", "Kasir"] },
  { permission: "Lihat laporan penjualan", roles: ["Owner", "Manajer"] },
  { permission: "Kelola stok & harga", roles: ["Owner", "Manajer", "Gudang"] },
  { permission: "Kelola karyawan & peran", roles: ["Owner"] },
  { permission: "Ekspor data", roles: ["Owner", "Manajer"] },
];

export const salesByHour = [
  { label: "08", penjualan: 120000, transaksi: 4 },
  { label: "10", penjualan: 480000, transaksi: 14 },
  { label: "12", penjualan: 920000, transaksi: 26 },
  { label: "14", penjualan: 610000, transaksi: 18 },
  { label: "16", penjualan: 780000, transaksi: 22 },
  { label: "18", penjualan: 1150000, transaksi: 31 },
  { label: "20", penjualan: 700000, transaksi: 19 },
];

export const weeklySales = [
  {
    label: "Sen",
    Minuman: 1600000,
    Makanan: 900000,
    Snack: 500000,
    Lainnya: 200000,
    penjualan: 3200000,
  },
  {
    label: "Sel",
    Minuman: 1400000,
    Makanan: 800000,
    Snack: 500000,
    Lainnya: 150000,
    penjualan: 2850000,
  },
  {
    label: "Rab",
    Minuman: 2000000,
    Makanan: 1200000,
    Snack: 600000,
    Lainnya: 300000,
    penjualan: 4100000,
  },
  {
    label: "Kam",
    Minuman: 1800000,
    Makanan: 1100000,
    Snack: 600000,
    Lainnya: 260000,
    penjualan: 3760000,
  },
  {
    label: "Jum",
    Minuman: 2600000,
    Makanan: 1500000,
    Snack: 800000,
    Lainnya: 300000,
    penjualan: 5200000,
  },
  {
    label: "Sab",
    Minuman: 3000000,
    Makanan: 1800000,
    Snack: 900000,
    Lainnya: 400000,
    penjualan: 6100000,
  },
  {
    label: "Min",
    Minuman: 2400000,
    Makanan: 1400000,
    Snack: 700000,
    Lainnya: 300000,
    penjualan: 4800000,
  },
];

export const categoryShare = [
  { name: "Minuman", value: 52 },
  { name: "Makanan", value: 28 },
  { name: "Snack", value: 14 },
  { name: "Lainnya", value: 6 },
];

export type Transaction = {
  id: string;
  time: string;
  cashier: string;
  method: "QRIS" | "Kartu" | "Tunai";
  items: number;
  total: number;
};

export const transactions: Transaction[] = [
  { id: "#27362", time: "20:14", cashier: "Dewi Lestari", method: "QRIS", items: 3, total: 58000 },
  { id: "#27361", time: "19:58", cashier: "Dewi Lestari", method: "Tunai", items: 2, total: 34000 },
  {
    id: "#27360",
    time: "19:41",
    cashier: "Adam Saputra",
    method: "Kartu",
    items: 5,
    total: 112000,
  },
  { id: "#27359", time: "19:20", cashier: "Dewi Lestari", method: "Tunai", items: 4, total: 96000 },
  { id: "#27358", time: "18:52", cashier: "Adam Saputra", method: "QRIS", items: 1, total: 18000 },
  { id: "#27357", time: "18:30", cashier: "Dewi Lestari", method: "QRIS", items: 6, total: 143000 },
];

export const rupiah = (n: number) => "Rp" + n.toLocaleString("id-ID", { maximumFractionDigits: 0 });

// === Business Planner Mock Data ===

export type RawMaterial = {
  id: string;
  name: string;
  unit: string;
  pricePerUnit: number;
};

export const mockRawMaterials: RawMaterial[] = [
  { id: "rm1", name: "Biji Kopi House Blend", unit: "gram", pricePerUnit: 150 }, // 150.000 / 1000g
  { id: "rm2", name: "Susu Segar", unit: "ml", pricePerUnit: 20 }, // 20.000 / 1000ml
  { id: "rm3", name: "Sirup Gula Aren", unit: "ml", pricePerUnit: 30 },
  { id: "rm4", name: "Cup Plastik 16oz + Tutup", unit: "pcs", pricePerUnit: 1200 },
  { id: "rm5", name: "Sedotan", unit: "pcs", pricePerUnit: 100 },
  { id: "rm6", name: "Sirup Vanilla", unit: "ml", pricePerUnit: 40 },
];

export type RecipeIngredient = {
  rawMaterialId: string;
  amount: number;
};

export type Recipe = {
  id: string;
  name: string;
  ingredients: RecipeIngredient[];
};

export const mockRecipes: Recipe[] = [
  {
    id: "r1",
    name: "Kopi Susu Gula Aren",
    ingredients: [
      { rawMaterialId: "rm1", amount: 18 },
      { rawMaterialId: "rm2", amount: 120 },
      { rawMaterialId: "rm3", amount: 20 },
      { rawMaterialId: "rm4", amount: 1 },
      { rawMaterialId: "rm5", amount: 1 },
    ],
  },
];
