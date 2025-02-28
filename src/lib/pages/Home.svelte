<script lang="ts">
  import CategoryList from "$lib/components/main/CategoryList.svelte";
  import PostList from "$lib/components/main/PostList.svelte";
  import MainLayout from "$lib/components/layout/MainLayout.svelte";
  import { onMount } from 'svelte';
  import { toggleBlog, toggleTag, resetSelected, selectedBlogs, selectedTags } from '$lib/stores/search';
  import { store as techBlogsStore } from '$lib/stores/techBlogs';
  import { store as postsStore } from '$lib/stores/posts';
  import { store as tagsStore } from '$lib/stores/tags';
  import type { Tag } from '$lib/stores/tags';
  import { currentUrl } from '$lib/stores/router';
  import { get } from 'svelte/store';

  // 상태 관리
  let allTags: Tag[] = [];
  let loadedImages = new Set<string>();
  let prevUrl = '';
  let initialLoadComplete = false; // 초기 로드 완료 플래그

  // URL에서 파라미터 가져오기
  function getParamsFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const page = parseInt(urlParams.get('page') || '1');
    const category = urlParams.get('category') || 'all'; // 기본값을 'all'로 변경
    
    // 블로그와 태그 정보 파싱
    const blogsParam = urlParams.get('blogs');
    const tagsParam = urlParams.get('tags');
    
    // URLSearchParams.get()은 이미 디코딩된 값을 반환하므로 추가 디코딩 필요 없음
    const blogs = blogsParam ? blogsParam.split(',').map(blog => blog.trim()) : [];
    const tags = tagsParam ? tagsParam.split(',').map(tag => tag.trim()) : [];
    
    return {
      page: isNaN(page) ? 1 : page,
      category,
      blogs,
      tags
    };
  }

  // URL 업데이트
  function updateUrl(page: number, category: string) {
    const url = new URL(window.location.href);
    url.searchParams.set('page', page.toString());
    url.searchParams.set('category', category);
    
    // 선택된 블로그와 태그 정보 추가
    const blogs = get(selectedBlogs);
    const tags = get(selectedTags);
    
    if (blogs.length > 0) {
      const blogNames = blogs.map(blog => blog.name.trim());
      url.searchParams.set('blogs', blogNames.join(','));
    } else {
      url.searchParams.delete('blogs');
    }
    
    if (tags.length > 0) {
      url.searchParams.set('tags', tags.join(','));
    } else {
      url.searchParams.delete('tags');
    }
    
    window.history.pushState({}, '', url.toString());
  }

  onMount(() => {
    const unsubscribe = tagsStore.subscribe((tags) => {
      allTags = tags.sort((a: Tag, b: Tag) => a.tagName.localeCompare(b.tagName));
    });
    
    // 초기 URL 상태 반영
    prevUrl = window.location.href;
    
    // 먼저 필요한 데이터를 가져옵니다
    Promise.all([
      tagsStore.fetchTags(),
      techBlogsStore.fetchTechBlogs()
    ]).then(() => {
      // 데이터가 로드된 후 URL에서 파라미터 가져와서 적용
      const { page, category, blogs, tags } = getParamsFromUrl();
      
      // 블로그 정보 적용
      if (blogs.length > 0) {
        const techBlogsValue = get(techBlogsStore);
        blogs.forEach(blogName => {
          const blog = techBlogsValue.find(b => 
            b.techBlogName.toLowerCase() === blogName.toLowerCase() ||
            b.techBlogName.trim().toLowerCase() === blogName.trim().toLowerCase()
          );
          if (blog) {
            toggleBlog({ name: blog.techBlogName, avatar: blog.icon });
          }
        });
      }
      
      // 태그 정보 적용
      if (tags.length > 0) {
        const allTagsValue = get(tagsStore);
        tags.forEach(tagName => {
          // 실제 존재하는 태그인지 확인
          const tagExists = allTagsValue.some(tag => 
            tag.tagName.toLowerCase() === tagName.toLowerCase() ||
            tag.tagName.trim().toLowerCase() === tagName.trim().toLowerCase()
          );
          if (tagExists) {
            const matchedTag = allTagsValue.find(tag => 
              tag.tagName.toLowerCase() === tagName.toLowerCase() ||
              tag.tagName.trim().toLowerCase() === tagName.trim().toLowerCase()
            );
            if (matchedTag) {
              toggleTag(matchedTag.tagName);
            }
          }
        });
      }
      
      // 카테고리 설정 (페이지를 초기화하지 않음)
      postsStore.setCategory(category.toLowerCase(), false);
      
      // 페이지 설정
      postsStore.setPage(page);
      
      // 모든 상태 설정 후 한 번만 포스트 가져오기
      postsStore.fetchPosts();
      console.log('onMount fetchPosts');
      
      // 초기 로드 완료 표시
      initialLoadComplete = true;
      
      // URL 설정 (이제 반응형 블록이 실행될 수 있음)
      currentUrl.set(window.location.href);
    });

    return () => {
      unsubscribe();
    };
  });

  $: {
    // 초기 로드가 완료된 후에만 URL 변경 감지 로직 실행
    if (initialLoadComplete && prevUrl !== $currentUrl) {
      console.log('URL changed:', prevUrl, '->', $currentUrl);
      
      const { page, category, blogs, tags } = getParamsFromUrl();
      
      // 페이지나 카테고리가 변경되었을 때 업데이트
      let needsFetch = false;
      
      if (category.toLowerCase() !== $postsStore.currentCategory.toLowerCase()) {
        // 카테고리가 변경되었을 때 (페이지 초기화 없이)
        postsStore.setCategory(category.toLowerCase(), false);
        needsFetch = true; // 상태가 변경되었으므로 fetch 필요
      }
      
      if (page !== $postsStore.currentPage) {
        // 페이지가 변경되었을 때
        postsStore.setPage(page);
        needsFetch = true; // 상태가 변경되었으므로 fetch 필요
      }
      
      // 블로그나 태그 정보가 변경되었을 때 업데이트
      const currentBlogs = get(selectedBlogs).map(blog => blog.name);
      const currentTags = get(selectedTags);
      
      // 대소문자 구분 없이 비교하기 위해 소문자로 변환
      const normalizedBlogs = blogs.map(b => b.toLowerCase());
      const normalizedCurrentBlogs = currentBlogs.map(b => b.toLowerCase());
      const normalizedTags = tags.map(t => t.toLowerCase());
      const normalizedCurrentTags = currentTags.map(t => t.toLowerCase());
      
      const blogsChanged = 
        normalizedBlogs.length !== normalizedCurrentBlogs.length || 
        normalizedBlogs.some(blog => !normalizedCurrentBlogs.includes(blog)) ||
        normalizedCurrentBlogs.some(blog => !normalizedBlogs.includes(blog));
        
      const tagsChanged = 
        normalizedTags.length !== normalizedCurrentTags.length || 
        normalizedTags.some(tag => !normalizedCurrentTags.includes(tag)) ||
        normalizedCurrentTags.some(tag => !normalizedTags.includes(tag));
      
      if (blogsChanged || tagsChanged) {
        // 블로그나 태그 정보가 변경되었을 때 상태 초기화 후 다시 설정
        resetSelected();
        
        // 블로그 정보 적용
        if (blogs.length > 0) {
          const techBlogsValue = get(techBlogsStore);
          blogs.forEach(blogName => {
            // 대소문자 구분 없이 블로그 찾기
            const blog = techBlogsValue.find(b => 
              b.techBlogName.toLowerCase() === blogName.toLowerCase() ||
              b.techBlogName.trim().toLowerCase() === blogName.trim().toLowerCase()
            );
            if (blog) {
              toggleBlog({ name: blog.techBlogName, avatar: blog.icon });
            }
          });
        }
        
        // 태그 정보 적용
        if (tags.length > 0) {
          const allTagsValue = get(tagsStore);
          tags.forEach(tagName => {
            // 대소문자 구분 없이 태그 찾기
            const tagExists = allTagsValue.some(tag => 
              tag.tagName.toLowerCase() === tagName.toLowerCase() ||
              tag.tagName.trim().toLowerCase() === tagName.trim().toLowerCase()
            );
            if (tagExists) {
              const matchedTag = allTagsValue.find(tag => 
                tag.tagName.toLowerCase() === tagName.toLowerCase() ||
                tag.tagName.trim().toLowerCase() === tagName.trim().toLowerCase()
              );
              if (matchedTag) {
                toggleTag(matchedTag.tagName);
              }
            }
          });
        }
        
        needsFetch = true;
      }
      
      // 상태가 변경되었고 아직 fetch가 필요한 경우에만 포스트 다시 가져오기
      if (needsFetch) {
        postsStore.fetchPosts();
        console.log('needsFetch fetchPosts');
      }
      
      prevUrl = $currentUrl;
    }
  }

  // 카테고리 변경 시 데이터 가져오기
  const selectCategory = (category: string) => {
    // 현재 선택된 카테고리와 같고, 현재 페이지가 1이면 아무 작업도 하지 않음
    if (category === $postsStore.currentCategory && $postsStore.currentPage === 1) {
      console.log('같은 카테고리 선택 & 1페이지 - 요청 무시');
      return;
    }
    
    updateUrl(1, category);
    postsStore.setCategory(category, true);
    postsStore.fetchPosts();
  };

  // 페이지 변경 시 데이터 가져오기
  function goToPage(page: number) {
    updateUrl(page, $postsStore.currentCategory);
    postsStore.setPage(page);
    postsStore.fetchPosts();
    
    // 모바일에서는 즉시 스크롤, 데스크톱에서는 부드럽게 스크롤
    const isMobile = window.innerWidth < 1024; // lg 브레이크포인트
    window.scrollTo({
      top: 0,
      behavior: isMobile ? 'auto' : 'smooth'
    });
  }

  // 태그 토글
  const handleToggleTag = (tagName: string) => {
    toggleTag(tagName);
    updateUrl($postsStore.currentPage, $postsStore.currentCategory);
    postsStore.fetchPosts();
  };

  // 블로그 토글
  const handleToggleBlog = (blog: { name: string; avatar: string }) => {
    toggleBlog(blog);
  };

  // 검색 및 초기화 함수
  const handleSearch = (event: CustomEvent<{query: string}>) => {
    postsStore.setSearchQuery(event.detail.query);
    postsStore.fetchPosts();
  };

  const searchWithSelected = () => {
    updateUrl($postsStore.currentPage, $postsStore.currentCategory);
    postsStore.fetchPosts();
  };

  const handleResetSelected = () => {
    resetSelected();
    updateUrl($postsStore.currentPage, $postsStore.currentCategory);
    postsStore.reset();
    postsStore.fetchPosts();
  };
</script>

<MainLayout
  {allTags}
  {searchWithSelected}
  onSearch={handleSearch}
  onReset={handleResetSelected}
>
  <CategoryList currentCategory={$postsStore.currentCategory} {selectCategory} />
  <PostList
    posts={$postsStore.posts}
    currentPage={$postsStore.currentPage}
    totalPages={$postsStore.totalPages}
    {goToPage}
    toggleTag={handleToggleTag}
    toggleBlog={handleToggleBlog}
    {loadedImages}
    loading={$postsStore.isLoading}
  />
</MainLayout> 