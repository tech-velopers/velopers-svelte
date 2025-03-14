<script lang="ts">
  import { onMount } from 'svelte';
  import logger from '$lib/utils/ActivityLogger';

  onMount(() => {
    // About 페이지 조회 로깅
    logger.logPageView('ABOUT', undefined);
  });
</script>

<div class="container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-4xl">
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-8">
    <h1 class="text-2xl sm:text-4xl font-bold mb-4 sm:mb-6 text-gray-900 dark:text-white">Velopers 소개</h1>
    
    <section class="mb-4 sm:mb-8">
      <h2 class="text-xl sm:text-2xl font-semibold mb-2 sm:mb-4 text-gray-800 dark:text-gray-200">Velopers란?</h2>
      <p class="text-gray-600 dark:text-gray-300 leading-relaxed text-sm sm:text-base">
        Velopers는 국내 IT 기업들의 기술 블로그를 한곳에서 모아볼 수 있는 플랫폼입니다. <br>
        개발자들이 더 쉽게 기술 정보를 찾고 공유할 수 있도록 만들어졌습니다.
      </p>
    </section>

    <section class="mb-4 sm:mb-8">
      <h2 class="text-xl sm:text-2xl font-semibold mb-2 sm:mb-4 text-gray-800 dark:text-gray-200">주요 기능</h2>
      <ul class="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1 sm:space-y-2 text-sm sm:text-base">
        <li>다양한 기업의 기술 블로그 포스트를 한 곳에서 확인</li>
        <li>기술 스택별 태그 필터링</li>
        <li>기업별 필터링</li>
        <li>다크 모드 지원</li>
        <li>검색 기능</li>
      </ul>
    </section>

    <section class="mb-4 sm:mb-8">
      <h2 class="text-xl sm:text-2xl font-semibold mb-2 sm:mb-4 text-gray-800 dark:text-gray-200">기술 스택</h2>
      <div class="flex flex-wrap gap-1 sm:gap-2">
        <span class="px-2 sm:px-3 py-0.5 sm:py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs sm:text-sm text-gray-700 dark:text-gray-300">Spring Boot</span>
        <span class="px-2 sm:px-3 py-0.5 sm:py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs sm:text-sm text-gray-700 dark:text-gray-300">Nginx</span>
        <span class="px-2 sm:px-3 py-0.5 sm:py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs sm:text-sm text-gray-700 dark:text-gray-300">Oracle Cloud</span>
        <span class="px-2 sm:px-3 py-0.5 sm:py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs sm:text-sm text-gray-700 dark:text-gray-300">MariaDB</span>
        <span class="px-2 sm:px-3 py-0.5 sm:py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs sm:text-sm text-gray-700 dark:text-gray-300">MongoDB Atlas</span>
        <span class="px-2 sm:px-3 py-0.5 sm:py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs sm:text-sm text-gray-700 dark:text-gray-300">Svelte</span>
        <span class="px-2 sm:px-3 py-0.5 sm:py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs sm:text-sm text-gray-700 dark:text-gray-300">Vercel</span>
        <span class="px-2 sm:px-3 py-0.5 sm:py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs sm:text-sm text-gray-700 dark:text-gray-300">TailwindCSS</span>
      </div>
    </section>

    <section class="mb-4 sm:mb-8">
      <h2 class="text-xl sm:text-2xl font-semibold mb-2 sm:mb-4 text-gray-800 dark:text-gray-200">개발 TODO List</h2>
      <div class="space-y-1 sm:space-y-2">
        <div class="flex items-center gap-1 sm:gap-2">
          <input type="checkbox" disabled class="w-3 h-3 sm:w-4 sm:h-4 cursor-not-allowed" />
          <span class="text-gray-600 dark:text-gray-300 text-sm sm:text-base">원하는 블로그 & 태그 이메일 구독 서비스</span>
        </div>
        <div class="flex items-center gap-1 sm:gap-2">
          <input type="checkbox" disabled class="w-3 h-3 sm:w-4 sm:h-4 cursor-not-allowed" />
          <span class="text-gray-600 dark:text-gray-300 text-sm sm:text-base">게시글에 대한 vector 검색</span>
        </div>
        <div class="flex items-center gap-1 sm:gap-2">
          <input type="checkbox" disabled class="w-3 h-3 sm:w-4 sm:h-4 cursor-not-allowed" />
          <span class="text-gray-600 dark:text-gray-300 text-sm sm:text-base">주간, 월간 인기 게시글 기능</span>
        </div>
        <div class="flex items-center gap-1 sm:gap-2">
          <input type="checkbox" disabled class="w-3 h-3 sm:w-4 sm:h-4 cursor-not-allowed" />
          <span class="text-gray-600 dark:text-gray-300 text-sm sm:text-base">회원가입, 로그인 기반 소셜 기능</span>
        </div>
      </div>
    </section>

    <section>
      <h2 class="text-xl sm:text-2xl font-semibold mb-2 sm:mb-4 text-gray-800 dark:text-gray-200">연락처</h2>
      <p class="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
        문의사항이나 제안사항이 있으시다면 아래 이메일로 연락해주세요.<br>
        Email: <a 
          href="mailto:sm0514sm@gmail.com" 
          class="text-blue-600 dark:text-blue-400 hover:underline"
          on:click={() => logger.logClick('EMAIL_LINK', undefined, { type: 'contact' })}
        >
          sm0514sm@gmail.com
        </a>
      </p>
    </section>
  </div>
</div> 