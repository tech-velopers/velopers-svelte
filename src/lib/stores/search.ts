import { writable } from 'svelte/store';

interface Blog {
  name: string;
  avatar: string;
}

export const selectedBlogs = writable<Blog[]>([]);
export const selectedTags = writable<string[]>([]);

export function toggleBlog(blog: Blog) {
  selectedBlogs.update(blogs => {
    const exists = blogs.some(b => b.name === blog.name);
    if (exists) {
      return blogs.filter(b => b.name !== blog.name);
    }
    return [...blogs, blog];
  });
}

export function toggleTag(tag: string) {
  selectedTags.update(tags => {
    if (tags.includes(tag)) {
      return tags.filter(t => t !== tag);
    }
    return [...tags, tag];
  });
}

export function resetSelected() {
  selectedBlogs.set([]);
  selectedTags.set([]);
}

export function addBlogsGroup(blogs: Blog[]) {
  selectedBlogs.update(currentBlogs => {
    // 이미 선택된 블로그는 제외하고 새로운 블로그만 추가
    const newBlogs = blogs.filter(blog => 
      !currentBlogs.some(b => b.name === blog.name)
    );
    return [...currentBlogs, ...newBlogs];
  });
} 