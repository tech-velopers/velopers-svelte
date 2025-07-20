import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type ViewMode = 'detailed' | 'summary';

function createViewModeStore() {
  const defaultMode: ViewMode = 'detailed';
  
  // 브라우저 환경에서만 localStorage 접근
  const stored = browser ? localStorage.getItem('postViewMode') : null;
  const initialValue: ViewMode = stored === 'summary' ? 'summary' : defaultMode;
  
  const { subscribe, set } = writable<ViewMode>(initialValue);
  
  return {
    subscribe,
    setMode: (mode: ViewMode) => {
      set(mode);
      if (browser) {
        localStorage.setItem('postViewMode', mode);
      }
    },
    toggleMode: () => {
      let currentMode: ViewMode;
      subscribe(mode => currentMode = mode)();
      const newMode: ViewMode = currentMode === 'detailed' ? 'summary' : 'detailed';
      set(newMode);
      if (browser) {
        localStorage.setItem('postViewMode', newMode);
      }
    }
  };
}

export const viewMode = createViewModeStore();