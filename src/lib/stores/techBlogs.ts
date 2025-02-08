import { writable, derived, get } from 'svelte/store';
import { getApiUrl, API_ENDPOINTS } from '$lib/config';

export interface TechBlog {
  id: number;
  techBlogName: string;
  icon: string;
  baseUrl: string;
  postCnt: number;
}

interface TechBlogMap {
  [key: string]: TechBlog;
}

interface TechBlogsStore {
  subscribe: (run: (value: TechBlog[]) => void) => () => void;
  fetchTechBlogs: () => Promise<void>;
  techBlogMap: {
    subscribe: (run: (value: TechBlogMap) => void) => () => void;
  };
}

function createTechBlogsStore(): TechBlogsStore {
  const { subscribe, set, update } = writable<TechBlog[]>([]);
  
  // 블로그 맵 store 생성
  const blogStore = { subscribe };
  const techBlogMap = derived<typeof blogStore, TechBlogMap>(blogStore, ($blogs) => {
    return $blogs.reduce((acc: TechBlogMap, blog: TechBlog) => {
      acc[blog.techBlogName] = blog;
      return acc;
    }, {});
  });

  const fetchTechBlogs = async () => {
    // 이미 데이터가 있는지 확인
    const currentValue = get(blogStore);
    if (currentValue.length > 0) {
      return; // 이미 데이터가 있으면 API 호출하지 않음
    }

    try {
      const response = await fetch(getApiUrl(API_ENDPOINTS.techBlogs));
      if (!response.ok) throw new Error('Failed to fetch tech blogs');
      const data = await response.json();
      set(data);
    } catch (error) {
      console.error('Error fetching tech blogs:', error);
    }
  };

  return {
    subscribe,
    fetchTechBlogs,
    techBlogMap
  };
}

export const store = createTechBlogsStore();
export const techBlogMap = store.techBlogMap; 