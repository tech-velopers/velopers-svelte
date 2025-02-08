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