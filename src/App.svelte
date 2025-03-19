<script lang="ts">
  import "./app.css";
  import { onMount } from "svelte";
  import { currentPath } from "$lib/stores/router";
  import Header from "$lib/components/layout/Header.svelte";
  import Footer from "$lib/components/layout/Footer.svelte";
  import Home from "$lib/pages/Home.svelte";
  import About from "$lib/pages/About.svelte";
  import AllBlogs from "$lib/pages/AllBlogs.svelte";
  import PopularPosts from "$lib/pages/PopularPosts.svelte";
  import Post from "$lib/pages/Post.svelte";
  import BlogDetail from "$lib/pages/BlogDetail.svelte";
  import Changelog from "$lib/pages/Changelog.svelte";
  import { Toaster } from "$lib/components/ui/sonner";

  // 다크모드 상태 관리
  let isDarkMode = false;
  
  // 초기 테마 로드
  onMount(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      isDarkMode = true;
      document.documentElement.classList.add('dark');
    } else {
      isDarkMode = false;
      document.documentElement.classList.remove('dark');
    }
  });
  
  // 테마 설정 함수
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
</script>

<div class="min-h-screen bg-gray-50 dark:bg-black transition-colors">
  <Header {isDarkMode} {toggleDarkMode} />

  <main>
    {#if $currentPath === '/'}
      <Home />
    {:else if $currentPath === '/about'}
      <About />
    {:else if $currentPath === '/all-blogs'}
      <AllBlogs />
    {:else if $currentPath === '/popular-posts'}
      <PopularPosts />
    {:else if $currentPath === '/changelog'}
      <Changelog />
    {:else if $currentPath.startsWith('/post/')}
      <Post />
    {:else if $currentPath.startsWith('/blog/')}
      <BlogDetail />
    {:else}
      <Home />
    {/if}
  </main>

  <Footer />
  <Toaster />
</div>