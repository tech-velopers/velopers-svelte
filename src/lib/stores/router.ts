import { writable } from 'svelte/store';

export const currentPath = writable(window.location.pathname);
export const currentUrl = writable(window.location.href);

// 방문한 포스트 ID를 저장하는 스토어
// localStorage에서 방문 기록을 불러옴
const storedVisitedPosts = typeof localStorage !== 'undefined' 
  ? JSON.parse(localStorage.getItem('visitedPosts') || '[]') 
  : [];
export const visitedPosts = writable<number[]>(storedVisitedPosts);

// 메타태그 관리를 위한 스토어
type MetaTag = {
  key: string;
  name?: string;
  property?: string;
  content: string;
};

type HeadData = {
  title: string;
  meta: MetaTag[];
  links: { rel: string; href: string }[];
};

// 초기 메타태그 데이터는 index.html에서 가져옴
export const headData = writable<HeadData>({
  title: document.title,
  meta: [],
  links: []
});

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

/**
 * 메타태그를 동적으로 업데이트하는 함수
 */
export const updateMetaTags = (data: Partial<HeadData>) => {
  // 타이틀 업데이트
  if (data.title) {
    document.title = data.title;
  }
  
  // 메타태그 업데이트
  if (data.meta && data.meta.length > 0) {
    // 기존 OG 및 기타 메타태그 제거 (description, keywords, author 등 포함)
    const metaTags = document.querySelectorAll('meta[property^="og:"], meta[name^="twitter:"], meta[name="description"], meta[name="keywords"], meta[name="author"], meta[property="article:"]');
    metaTags.forEach(tag => tag.remove());
    
    // 새 메타태그 추가
    data.meta.forEach(meta => {
      const metaElement = document.createElement('meta');
      
      if (meta.property) {
        metaElement.setAttribute('property', meta.property);
      }
      
      if (meta.name) {
        metaElement.setAttribute('name', meta.name);
      }
      
      metaElement.setAttribute('content', meta.content);
      document.head.appendChild(metaElement);
    });
  }
  
  // 링크 태그 업데이트 (canonical 등)
  if (data.links && data.links.length > 0) {
    // 기존 canonical 링크 제거
    const linkTags = document.querySelectorAll('link[rel="canonical"]');
    linkTags.forEach(tag => tag.remove());
    
    // 새 링크 태그 추가
    data.links.forEach(link => {
      const linkElement = document.createElement('link');
      linkElement.setAttribute('rel', link.rel);
      linkElement.setAttribute('href', link.href);
      document.head.appendChild(linkElement);
    });
  }
  
  // 헤드 데이터 스토어 업데이트
  headData.update(current => ({
    ...current,
    ...(data.title && { title: data.title }),
    ...(data.meta && { meta: [...data.meta] }),
    ...(data.links && { links: [...data.links] })
  }));
};

// 페이지 이동 함수
export const navigate = (path: string) => {
  window.history.pushState({}, '', path);
  currentPath.set(path);
  currentUrl.set(window.location.href);
}; 