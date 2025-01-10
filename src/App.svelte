<script lang="ts">
  import "./app.css";
  import { onMount } from 'svelte';
  import Header from "$lib/components/layout/Header.svelte";
  import Footer from "$lib/components/layout/Footer.svelte";
  import CategoryList from "$lib/components/main/CategoryList.svelte";
  import PostList from "$lib/components/main/PostList.svelte";
  import Sidebar from "$lib/components/sidebar/Sidebar.svelte";

  // 태그 타입 정의
  interface Tag {
    id: number;
    tagName: string;
  }

  interface Post {
    id: number;
    title: string;
    preview: string;
    imageUrl: string;
    company: {
      name: string;
      avatar: string;
    };
    tags: string[];
    createdAt: any;
  }

  // 상태 관리
  let allTags: Tag[] = [];
  let posts: Post[] = [];
  let currentPage = 1;
  let totalPages = 1;
  let isLoading = false;
  let currentCategory = "All";
  let selectedTags: string[] = [];
  let selectedBlogs: string[] = [];
  let loadedImages = new Set<string>();

  // API에서 태그 목록 가져오기
  async function fetchTags() {
    try {
      const response = await fetch('http://144.24.81.210:8080/api/tags');
      const data = await response.json();
      allTags = data.sort((a: Tag, b: Tag) => a.tagName.localeCompare(b.tagName));
    } catch (error) {
      console.error('태그 목록을 가져오는데 실패했습니다:', error);
    }
  }

  // API에서 포스트 데이터 가져오기
  async function fetchPosts() {
    isLoading = true;
    try {
      const response = await fetch('http://localhost:8080/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category: currentCategory,
          tags: selectedTags,
          blogs: selectedBlogs,
          size: 10,
          page: currentPage
        })
      });
      const data = await response.json();
      posts = data.content;
      totalPages = data.totalPages;
      currentPage = data.number + 1;
    } catch (error) {
      console.error('포스트를 가져오는데 실패했습니다:', error);
    } finally {
      isLoading = false;
    }
  }

  // 다크모드 상태 관리
  let isDarkMode = false;
  
  onMount(() => {
    fetchTags();
    fetchPosts();
    // 시스템 다크모드 설정 확인
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    // 저장된 다크모드 설정 확인
    const savedTheme = localStorage.getItem('theme');
    
    isDarkMode = savedTheme === 'dark' || (!savedTheme && prefersDark);
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    }
  });

  const toggleDarkMode = () => {
    isDarkMode = !isDarkMode;
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // 카테고리 변경 시 데이터 가져오기
  const selectCategory = (category: string) => {
    currentCategory = category;
    currentPage = 1;
    fetchPosts();
  };

  // 태그 토글
  const toggleTag = (tagName: string) => {
    if (selectedTags.includes(tagName)) {
      selectedTags = selectedTags.filter(t => t !== tagName);
    } else {
      selectedTags = [...selectedTags, tagName];
    }
  };

  // 블로그 토글
  const toggleBlog = (blogName: string) => {
    if (selectedBlogs.includes(blogName)) {
      selectedBlogs = selectedBlogs.filter(b => b !== blogName);
    } else {
      selectedBlogs = [...selectedBlogs, blogName];
    }
  };

  // 검색 및 초기화 함수
  const searchWithSelected = () => {
    currentPage = 1;
    fetchPosts();
  };

  const resetSelected = () => {
    selectedTags = [];
    selectedBlogs = [];
    currentPage = 1;
    fetchPosts();
  };

  // 페이지 변경 시 데이터 가져오기
  function goToPage(page: number) {
    currentPage = page;
    fetchPosts();
  }
</script>

<div class="min-h-screen bg-gray-50 dark:bg-black transition-colors">
  <Header {isDarkMode} {toggleDarkMode} />

  <main class="container mx-auto px-4 py-8 max-w-7xl">
    <!-- 로고 이미지 -->
    <div class="mb-8">
      <div class="bg-black rounded-2xl overflow-hidden dark:ring-1 dark:ring-gray-700">
        <img src="/velopers.png" alt="Velopers 로고" class="w-full h-36 md:h-40 object-contain scale-[1.75] md:scale-100"/>
      </div>
    </div>

    <div class="flex flex-col lg:flex-row gap-8">
      <!-- 메인 컨텐츠 영역 -->
      <div class="flex-1">
        <CategoryList {currentCategory} {selectCategory} />
        <PostList
          {posts}
          {currentPage}
          {totalPages}
          {goToPage}
          {toggleTag}
          {toggleBlog}
          {selectedTags}
          {selectedBlogs}
          {loadedImages}
          loading={isLoading}
        />
      </div>

      <!-- 우측 사이드바 -->
      <Sidebar
        {allTags}
        {selectedTags}
        {selectedBlogs}
        {toggleTag}
        {toggleBlog}
        {searchWithSelected}
        {resetSelected}
      />
    </div>
  </main>

  <Footer />
</div>