import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return `৳${price.toLocaleString("en-BD")}`;
}

export function calculateDiscount(original: number, sale: number): number {
  if (!original || original <= 0 || !sale || sale >= original) return 0;
  return Math.round(((original - sale) / original) * 100);
}

export function generateOrderNumber(): string {
  const timestamp = Date.now().toString().slice(-4);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `JBD-${timestamp}${random}`;
}

export const BANGLADESH_DISTRICTS = [
  "Dhaka", "Chattogram", "Gazipur", "Narayanganj", "Cumilla", "Sylhet", "Rajshahi", "Bogura",
  "Khulna", "Barishal", "Mymensingh", "Rangpur", "Jessore", "Dinajpur", "Narsingdi", "Tangail",
  "Brahmanbaria", "Cox's Bazar", "Noakhali", "Feni", "Pabna", "Kushtia", "Faridpur", "Sirajganj",
  "Jamalpur", "Netrokona", "Kishoreganj", "Manikganj", "Munshiganj", "Gopalganj", "Madaripur",
  "Shariatpur", "Rajbari", "Sunamganj", "Habiganj", "Moulvibazar", "Chandpur", "Lakshmipur",
  "Khagrachhari", "Rangamati", "Bandarban", "Naogaon", "Natore", "Chapai Nawabganj", "Joypurhat",
  "Gaibandha", "Kurigram", "Lalmonirhat", "Nilphamari", "Panchagarh", "Thakurgaon", "Bagerhat",
  "Chuadanga", "Jhenaidah", "Magura", "Meherpur", "Narail", "Satkhira", "Barguna", "Bhola",
  "Jhalokati", "Patuakhali", "Pirojpur"
];
