import { writable, derived, get } from 'svelte/store';
import { getApiUrl, API_ENDPOINTS } from '$lib/config';

export interface TechBlog {
  id: number;
  techBlogName: string;
  icon: string;
  baseUrl: string;
  postCnt: number;
  totalPostViewCnt: number;
  lastCreatedAt?: number[]; // 마지막 게시글 작성 일자 [년, 월, 일, 시, 분, 초] 형식
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
  let isLoading = false;
  
  // 블로그 맵 store 생성
  const blogStore = { subscribe };
  const techBlogMap = derived<typeof blogStore, TechBlogMap>(blogStore, ($blogs) => {
    return $blogs.reduce((acc: TechBlogMap, blog: TechBlog) => {
      acc[blog.techBlogName] = blog;
      return acc;
    }, {});
  });

  const fetchTechBlogs = async () => {
    // 이미 데이터가 있거나 로딩 중이면 리턴
    const currentValue = get(blogStore);
    if (currentValue.length > 0 || isLoading) {
      return;
    }

    try {
      isLoading = true;
      const response = await fetch(getApiUrl(API_ENDPOINTS.techBlogs));
      if (!response.ok) throw new Error('Failed to fetch tech blogs');
      const data = await response.json();
      set(data);
    } catch (error) {
      console.error('Error fetching tech blogs:', error);
    } finally {
      isLoading = false;
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