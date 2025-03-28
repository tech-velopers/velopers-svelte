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

// 전체 검색 상태 가져오기
export function getSearchState() {
  return {
    blogs: get(selectedBlogs),
    tags: get(selectedTags),
    query: get(searchQuery),
    category: get(selectedCategory),
    page: get(currentPage)
  };
}

// URL에서 파라미터를 파싱하여 검색 상태 업데이트
export function updateSearchStateFromUrl() {
  if (typeof window === 'undefined') return;

  const urlParams = new URLSearchParams(window.location.search);
  const page = parseInt(urlParams.get('page') || '1');
  const category = urlParams.get('category') || 'all';
  const query = urlParams.get('query') || '';
  
  // 블로그와 태그 정보 파싱
  const blogsParam = urlParams.get('blogs');
  const tagsParam = urlParams.get('tags');
  
  // 기존 선택된 블로그 정보 가져오기 (아바타 정보 유지를 위해)
  const currentBlogs = get(selectedBlogs);
  
  if (blogsParam) {
    const blogNames = blogsParam.split(',').map(blog => blog.trim());
    
    // 기존 블로그 중에서 URL에 포함된 블로그만 선택
    const filteredBlogs = currentBlogs.filter(blog => 
      blogNames.some(name => name.toLowerCase() === blog.name.toLowerCase())
    );
    
    // URL에는 있지만 현재 선택에 없는 블로그는 기본 아바타로 추가
    const newBlogs = blogNames
      .filter(name => !filteredBlogs.some(blog => blog.name.toLowerCase() === name.toLowerCase()))
      .map(name => ({ name, avatar: `${name.toLowerCase().replace(/\s+/g, '')}.png` }));
    
    selectedBlogs.set([...filteredBlogs, ...newBlogs]);
  } else {
    selectedBlogs.set([]);
  }
  
  if (tagsParam) {
    const tagNames = tagsParam.split(',').map(tag => tag.trim());
    selectedTags.set(tagNames);
  } else {
    selectedTags.set([]);
  }
  
  setSearchQuery(query);
  setCategory(category);
  setPage(page);
} 