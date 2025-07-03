import { writable, get } from 'svelte/store';
import { getApiUrl, API_ENDPOINTS } from '$lib/config';
import { 
  selectedBlogs, 
  selectedTags, 
  searchQuery as searchQueryStore, 
  selectedCategory, 
  currentPage as currentPageStore,
  setPage,
  setCategory as setSearchCategory,
  setSearchQuery
} from './search';

export interface Post {
  id: number;
  title: string;
  preview: string;
  imageUrl: string;
  techBlogName: string;
  tags: string[];
  createdAt: any;
}

interface PostsState {
  posts: Post[];
  totalPages: number;
  isLoading: boolean;
  error: string | null;
}

function createPostsStore() {
  const initialState: PostsState = {
    posts: [],
    totalPages: 1,
    isLoading: false,
    error: null
  };

  const { subscribe, update } = writable<PostsState>(initialState);

  async function fetchPosts() {
    update(state => ({ ...state, isLoading: true, error: null }));

    try {
      const response = await fetch(getApiUrl(API_ENDPOINTS.posts), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category: get(selectedCategory),
          tags: get(selectedTags),
          blogs: get(selectedBlogs).map(blog => blog.name),
          query: get(searchQueryStore),
          size: 10,
          page: get(currentPageStore)
        })
      });

      const data = await response.json();
      
      update(state => ({
        ...state,
        posts: data.content,
        totalPages: data.totalPages,
        isLoading: false
      }));
    } catch (error) {
      update(state => ({
        ...state,
        error: '포스트를 가져오는데 실패했습니다.',
        isLoading: false
      }));
      console.error('포스트를 가져오는데 실패했습니다:', error);
    }
  }

  function setPostsCategory(category: string, resetPage: boolean = true) {
    setSearchCategory(category);
    
    if (resetPage) {
      setPage(1);
    }
  }

  function setPostsPage(page: number) {
    setPage(page);
  }

  function setPostsSearchQuery(query: string) {
    setSearchQuery(query);
    setPage(1);
  }

  function reset() {
    setSearchCategory('all');
    setPage(1);
    setSearchQuery('');
  }

  return {
    subscribe,
    fetchPosts,
    setCategory: setPostsCategory,
    setPage: setPostsPage,
    setSearchQuery: setPostsSearchQuery,
    reset,
    // SSR 데이터로 초기화하는 메서드 추가
    setData: (posts: Post[], totalPages: number) => {
      update(state => ({
        ...state,
        posts,
        totalPages,
        isLoading: false,
        error: null
      }));
    },
    // 현재 페이지, 검색어, 카테고리 등의 상태는 search 스토어에서 직접 구독해야 함
    get currentPage() { return get(currentPageStore); },
    get currentCategory() { return get(selectedCategory); },
    get searchQuery() { return get(searchQueryStore); }
  };
}

export const store = createPostsStore(); 