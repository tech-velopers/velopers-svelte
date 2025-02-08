import { writable } from 'svelte/store';

export const isSidebarOpen = writable(false);

export const toggleSidebar = () => {
  isSidebarOpen.update(value => !value);
};

export const closeSidebar = () => {
  isSidebarOpen.set(false);
}; 