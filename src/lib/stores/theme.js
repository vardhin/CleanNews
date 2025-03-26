import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// Initialize from localStorage if in browser, otherwise default to 'light'
const storedTheme = browser ? localStorage.getItem('theme') || 'light' : 'light';

// Create the theme store
export const theme = writable(storedTheme);

// Set theme function that updates DOM and localStorage
export function setTheme(newTheme) {
  if (browser) {
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  }
  
  theme.set(newTheme);
}

// Toggle theme function
export function toggleTheme() {
  theme.update(currentTheme => {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    if (browser) {
      localStorage.setItem('theme', newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
    }
    return newTheme;
  });
}