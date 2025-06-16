<script lang="ts">
  import "../app.css";
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import Header from "$lib/components/layout/Header.svelte";
  import Footer from "$lib/components/layout/Footer.svelte";
  import { Toaster } from "$lib/components/ui/sonner";

  // 다크모드 상태 관리
  let isDarkMode = false;
  
  // 초기 테마 로드
  onMount(() => {
    // 테마 설정
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

  // 현재 경로가 퀴즈 페이지인지 확인
  $: isQuizPage = $page.route.id === '/quiz';
</script>

<div class="min-h-screen bg-gray-50 dark:bg-black transition-colors overflow-x-hidden">
  {#if !isQuizPage}
    <Header {isDarkMode} {toggleDarkMode} />
  {/if}

  <main>
    <slot />
  </main>

  {#if !isQuizPage}
    <Footer />
  {/if}
  <Toaster position="top-center" duration={800} />
</div>