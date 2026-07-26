import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Kleiner Helfer, um bedingte Tailwind-Klassen sauber zusammenzuführen.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
