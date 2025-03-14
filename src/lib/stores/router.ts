import { writable } from 'svelte/store';

export const currentPath = writable(window.location.pathname);
export const currentUrl = writable(window.location.href);

// 방문한 포스트 ID를 저장하는 스토어
// localStorage에서 방문 기록을 불러옴
const storedVisitedPosts = typeof localStorage !== 'undefined' 
  ? JSON.parse(localStorage.getItem('visitedPosts') || '[]') 
  : [];
export const visitedPosts = writable<number[]>(storedVisitedPosts);

// 방문한 포스트 ID를 저장하는 함수
export const markPostAsVisited = (postId: number) => {
  visitedPosts.update(posts => {
    if (!posts.includes(postId)) {
      const updatedPosts = [...posts, postId];
      // localStorage에 방문 기록 저장
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('visitedPosts', JSON.stringify(updatedPosts));
      }
      return updatedPosts;
    }
    return posts;
  });
};

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