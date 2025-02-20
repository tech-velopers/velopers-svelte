import { writable, get } from 'svelte/store';
import { getApiUrl, API_ENDPOINTS } from '$lib/config';

export interface Tag {
  id: number;
  tagName: string;
  postCnt: number;
}

interface TagsStore {
  subscribe: (run: (value: Tag[]) => void) => () => void;
  fetchTags: () => Promise<void>;
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
      const response = await fetch(getApiUrl(API_ENDPOINTS.tags));
      if (!response.ok) throw new Error('Failed to fetch tags');
      const data = await response.json();
      set(data);
    } catch (error) {
      console.error('Error fetching tags:', error);
    } finally {
      isLoading = false;
    }
  };

  return {
    subscribe,
    fetchTags
  };
}

export const store = createTagsStore(); 