import { writable, get } from 'svelte/store';

interface Blog {
  name: string;
  avatar: string;
}

// localStorage에서 모든 필요한 정보 불러오기
const storedBlogs = typeof localStorage !== 'undefined' 
  ? JSON.parse(localStorage.getItem('selectedBlogs') || '[]') 
  : [];

const storedTags = typeof localStorage !== 'undefined' 
  ? JSON.parse(localStorage.getItem('selectedTags') || '[]') 
  : [];

const storedSearchQuery = typeof localStorage !== 'undefined' 
  ? localStorage.getItem('searchQuery') || '' 
  : '';

const storedCategory = typeof localStorage !== 'undefined' 
  ? localStorage.getItem('selectedCategory') || 'all' 
  : 'all';

const storedPage = typeof localStorage !== 'undefined' 
  ? parseInt(localStorage.getItem('currentPage') || '1') 
  : 1;

export const selectedBlogs = writable<Blog[]>(storedBlogs);
export const selectedTags = writable<string[]>(storedTags);
export const searchQuery = writable<string>(storedSearchQuery);
export const selectedCategory = writable<string>(storedCategory);
export const currentPage = writable<number>(storedPage);

// localStorage에 상태 저장하는 함수
function saveToLocalStorage() {
  if (typeof localStorage !== 'undefined') {
    selectedBlogs.subscribe(blogs => {
      localStorage.setItem('selectedBlogs', JSON.stringify(blogs));
    });
    
    selectedTags.subscribe(tags => {
      localStorage.setItem('selectedTags', JSON.stringify(tags));
    });

    searchQuery.subscribe(query => {
      localStorage.setItem('searchQuery', query);
    });

    selectedCategory.subscribe(category => {
      localStorage.setItem('selectedCategory', category);
    });

    currentPage.subscribe(page => {
      localStorage.setItem('currentPage', page.toString());
    });
  }
}

// 초기 구독 설정
saveToLocalStorage();

export function toggleBlog(blog: Blog) {
  selectedBlogs.update(blogs => {
    const exists = blogs.some(b => b.name === blog.name);
    const updatedBlogs = exists
      ? blogs.filter(b => b.name !== blog.name)
      : [...blogs, blog];
    
    // localStorage에 저장
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('selectedBlogs', JSON.stringify(updatedBlogs));
    }
    
    return updatedBlogs;
  });
}

export function toggleTag(tag: string) {
  selectedTags.update(tags => {
    const updatedTags = tags.includes(tag)
      ? tags.filter(t => t !== tag)
      : [...tags, tag];
    
    // localStorage에 저장
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('selectedTags', JSON.stringify(updatedTags));
    }
    
    return updatedTags;
  });
}

export function setSearchQuery(query: string) {
  searchQuery.set(query);
  
  // localStorage에 저장
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('searchQuery', query);
  }
}

export function setCategory(category: string) {
  selectedCategory.set(category);
  
  // localStorage에 저장
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('selectedCategory', category);
  }
}

export function setPage(page: number) {
  currentPage.set(page);
  
  // localStorage에 저장
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('currentPage', page.toString());
  }
}

export function resetSelected() {
  selectedBlogs.set([]);
  selectedTags.set([]);
  searchQuery.set('');
  selectedCategory.set('all');
  currentPage.set(1);
  
  // localStorage에서도 삭제
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('selectedBlogs', '[]');
    localStorage.setItem('selectedTags', '[]');
    localStorage.setItem('searchQuery', '');
    localStorage.setItem('selectedCategory', 'all');
    localStorage.setItem('currentPage', '1');
  }
}

export function addBlogsGroup(blogs: Blog[]) {
  selectedBlogs.update(currentBlogs => {
    // 이미 선택된 블로그는 제외하고 새로운 블로그만 추가
    const newBlogs = blogs.filter(blog => 
      !currentBlogs.some(b => b.name === blog.name)
    );
    const updatedBlogs = [...currentBlogs, ...newBlogs];
    
    // localStorage에 저장
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('selectedBlogs', JSON.stringify(updatedBlogs));
    }
    
    return updatedBlogs;
  });
}

// URL 파라미터 생성 함수
export function getSearchParamsUrl(basePath: string = '/'): string {
  const blogs = get(selectedBlogs);
  const tags = get(selectedTags);
  const query = get(searchQuery);
  const category = get(selectedCategory);
  const page = get(currentPage);
  
  const url = new URL(basePath, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
  
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
  
  return url.pathname + url.search;
}

// URL에서 검색 상태 업데이트
export function updateSearchStateFromUrl() {
  if (typeof window === 'undefined') return;
  
  const url = new URL(window.location.href);
  const params = url.searchParams;

  // 페이지 파라미터
  const pageParam = params.get('page');
  if (pageParam) {
    const page = parseInt(pageParam);
    if (!isNaN(page) && page > 0) {
      setPage(page);
    }
  } else {
    setPage(1);
  }

  // 카테고리 파라미터
  const categoryParam = params.get('category');
  if (categoryParam) {
    setCategory(categoryParam);
  } else {
    setCategory('all');
  }

  // 검색어 파라미터
  const queryParam = params.get('query');
  if (queryParam) {
    setSearchQuery(queryParam);
  } else {
    setSearchQuery('');
  }

  // 블로그 파라미터
  const blogsParam = params.get('blogs');
  if (blogsParam) {
    const blogNames = blogsParam.split(',');
    const blogs = blogNames.map(name => ({ 
      name: name.trim(), 
      avatar: '' // 아바타는 나중에 techBlogsStore에서 매칭
    }));
    selectedBlogs.set(blogs);
  } else {
    selectedBlogs.set([]);
  }

  // 태그 파라미터
  const tagsParam = params.get('tags');
  if (tagsParam) {
    const tags = tagsParam.split(',').map(tag => tag.trim());
    selectedTags.set(tags);
  } else {
    selectedTags.set([]);
  }
}

// 검색 상태 반환
export function getSearchState() {
  return {
    blogs: get(selectedBlogs),
    tags: get(selectedTags),
    query: get(searchQuery),
    category: get(selectedCategory),
    page: get(currentPage)
  };
}