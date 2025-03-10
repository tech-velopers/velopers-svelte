import { writable } from 'svelte/store';

interface Blog {
  name: string;
  avatar: string;
}

// localStorage에서 선택된 블로그와 태그 정보 불러오기
const storedBlogs = typeof localStorage !== 'undefined' 
  ? JSON.parse(localStorage.getItem('selectedBlogs') || '[]') 
  : [];

const storedTags = typeof localStorage !== 'undefined' 
  ? JSON.parse(localStorage.getItem('selectedTags') || '[]') 
  : [];

export const selectedBlogs = writable<Blog[]>(storedBlogs);
export const selectedTags = writable<string[]>(storedTags);

// localStorage에 상태 저장하는 함수
function saveToLocalStorage() {
  if (typeof localStorage !== 'undefined') {
    selectedBlogs.subscribe(blogs => {
      localStorage.setItem('selectedBlogs', JSON.stringify(blogs));
    });
    
    selectedTags.subscribe(tags => {
      localStorage.setItem('selectedTags', JSON.stringify(tags));
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

export function resetSelected() {
  selectedBlogs.set([]);
  selectedTags.set([]);
  
  // localStorage에서도 삭제
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('selectedBlogs', '[]');
    localStorage.setItem('selectedTags', '[]');
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