import './app.css'
import App from './App.svelte'

const app = new App({
  target: document.getElementById('app')!
})

// Initialize stagewise toolbar in development mode only
if (import.meta.env.DEV) {
  import('@stagewise/toolbar').then(({ initToolbar }) => {
    const stagewiseConfig = {
      plugins: []
    };
    initToolbar(stagewiseConfig);
  }).catch((error) => {
    console.warn('Failed to initialize stagewise toolbar:', error);
  });
}
if (import.meta.env.QA) {
  import('@stagewise/toolbar').then(({ initToolbar }) => {
    const stagewiseConfig = {
      plugins: []
    };
    initToolbar(stagewiseConfig);
  }).catch((error) => {
    console.warn('Failed to initialize stagewise toolbar:', error);
  });
}


export default app
