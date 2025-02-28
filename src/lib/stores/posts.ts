import { writable, get } from 'svelte/store';
import { getApiUrl, API_ENDPOINTS } from '$lib/config';
import { selectedBlogs, selectedTags } from './search';

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
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  currentCategory: string;
  searchQuery: string;
}

function createPostsStore() {
  const initialState: PostsState = {
    posts: [],
    currentPage: 0,
    totalPages: 1,
    isLoading: false,
    error: null,
    currentCategory: 'All',
    searchQuery: ''
  };

  const { subscribe, update } = writable<PostsState>(initialState);

  async function fetchPosts() {
    update(state => ({ ...state, isLoading: true, error: null }));

    try {
      const currentState = get({ subscribe });
      const response = await fetch(getApiUrl(API_ENDPOINTS.posts), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category: currentState.currentCategory,
          tags: get(selectedTags),
          blogs: get(selectedBlogs).map(blog => blog.name),
          query: currentState.searchQuery,
          size: 10,
          page: currentState.currentPage
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

  function setCategory(category: string, resetPage: boolean = true) {
    update(state => ({ 
      ...state, 
      currentCategory: category, 
      currentPage: resetPage ? 1 : state.currentPage,
      searchQuery: '' 
    }));
  }

  function setPage(page: number) {
    update(state => ({ ...state, currentPage: page }));
  }

  function setSearchQuery(query: string) {
    update(state => ({ ...state, searchQuery: query, currentPage: 1 }));
  }

  function reset() {
    update(state => ({
      ...state,
      currentCategory: 'All',
      currentPage: 1,
      searchQuery: ''
    }));
  }

  return {
    subscribe,
    fetchPosts,
    setCategory,
    setPage,
    setSearchQuery,
    reset
  };
}

export const store = createPostsStore(); 