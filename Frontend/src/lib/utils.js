import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const API_BASE = "https://upworkproposalmaker-azbuf5gqbdanfbhh.centralindia-01.azurewebsites.net";
