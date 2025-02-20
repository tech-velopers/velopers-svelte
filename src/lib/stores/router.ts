import { writable } from 'svelte/store';

export const currentPath = writable(window.location.pathname);
export const currentUrl = writable(window.location.href);

// 브라우저의 뒤로가기/앞으로가기 이벤트 처리
window.addEventListener('popstate', () => {
  currentPath.set(window.location.pathname);
  currentUrl.set(window.location.href);
});

// 페이지 이동 함수
export const navigate = (path: string) => {
  window.history.pushState({}, '', path);
  currentPath.set(path);
  currentUrl.set(window.location.href);
}; 