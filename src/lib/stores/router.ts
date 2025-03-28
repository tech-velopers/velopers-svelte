import { writable } from 'svelte/store';
import { 
  selectedBlogs, 
  selectedTags, 
  searchQuery, 
  selectedCategory, 
  currentPage,
  updateSearchStateFromUrl,
  getSearchState,
  resetSelected
} from './search';

export const currentPath = writable(typeof window !== 'undefined' ? window.location.pathname : '/');
export const currentUrl = writable(typeof window !== 'undefined' ? window.location.href : '/');

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

// 현재 검색 상태를 URL 파라미터로 변환
function getUrlWithSearchParams(path: string): string {
  const { blogs, tags, query, category, page } = getSearchState();
  const url = new URL(path, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
  
  // 기본값이 아닌 경우에만 URL 파라미터에 추가
  if (page > 1) {
    url.searchParams.set('page', page.toString());
  }
  
  if (category !== 'all') {
    url.searchParams.set('category', category);
  }
  
  if (query) {
    url.searchParams.set('query', query);
  }
  
  if (blogs.length > 0) {
    const blogNames = blogs.map(blog => blog.name.trim());
    url.searchParams.set('blogs', blogNames.join(','));
  }
  
  if (tags.length > 0) {
    url.searchParams.set('tags', tags.join(','));
  }
  
  return url.toString();
}

// 브라우저의 뒤로가기/앞으로가기 이벤트 처리
if (typeof window !== 'undefined') {
  window.addEventListener('popstate', () => {
    currentPath.set(window.location.pathname);
    currentUrl.set(window.location.href);
    // URL이 변경되면 검색 상태 업데이트
    updateSearchStateFromUrl();
  });
}

// 페이지 이동 함수 
// @param path: 이동할 경로
// @param updateSearchState: 현재 검색 상태를 URL에 반영할지 여부 (기본값: true)
// @param resetSearchState: 검색 상태를 초기화할지 여부 (기본값: false)
export const navigate = (
  path: string, 
  updateSearchState = true, 
  resetSearchState = false
) => {
  let fullUrl = path;
  
  // 검색 상태 초기화가 요청된 경우
  if (resetSearchState) {
    // 검색 파라미터 초기화
    resetSelected();
    fullUrl = path;
  }
  // 아니면 경로 이동 시 현재 검색 상태를 URL에 반영
  else if (updateSearchState && path === '/') {
    fullUrl = getUrlWithSearchParams(path);
  }
  
  if (typeof window !== 'undefined') {
    window.history.pushState({}, '', fullUrl);
    currentPath.set(window.location.pathname);
    currentUrl.set(window.location.href);
  }
};

// URL 업데이트 (페이지 이동 없이 URL만 변경)
export const updateUrl = () => {
  if (typeof window !== 'undefined') {
    const fullUrl = getUrlWithSearchParams(window.location.pathname);
    window.history.pushState({}, '', fullUrl);
    currentUrl.set(fullUrl);
  }
};

// 초기화 함수 (SSR 환경에서 사용)
export const initRouter = () => {
  if (typeof window !== 'undefined') {
    currentPath.set(window.location.pathname);
    currentUrl.set(window.location.href);
    updateSearchStateFromUrl();
  }
}; 