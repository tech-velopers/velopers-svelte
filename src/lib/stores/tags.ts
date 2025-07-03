import { writable, get } from 'svelte/store';
import { getApiUrl, API_ENDPOINTS } from '$lib/config';

export interface Tag {
  id: number;
  tagName: string;
  count: number;
}

interface TagsStore {
  subscribe: (run: (value: Tag[]) => void) => () => void;
  fetchTags: () => Promise<void>;
  setData: (data: Tag[]) => void;
}

function createTagsStore(): TagsStore {
  const { subscribe, set } = writable<Tag[]>([]);
  let isLoading = false;
  
  const tagStore = { subscribe };

  const fetchTags = async () => {
    // 이미 데이터가 있거나 로딩 중이면 리턴
    const currentValue = get(tagStore);
    if (currentValue.length > 0 || isLoading) {
      return;
    }

    try {
      isLoading = true;
      const response = await fetch(getApiUrl(API_ENDPOINTS.allTags));
      if (!response.ok) throw new Error('Failed to fetch all tags');
      const data: Tag[] = await response.json();
      
      set(data); // API에서 받은 모든 태그 저장
    } catch (error) {
      console.error('Error fetching all tags:', error);
    } finally {
      isLoading = false;
    }
  };

  return {
    subscribe,
    fetchTags,
    setData: (data: Tag[]) => {
      set(data);
    }
  };
}

export const store = createTagsStore(); 