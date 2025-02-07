<script>
  import { onMount } from 'svelte';
</script>

<div class="container mx-auto px-4 py-8 max-w-4xl">
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
    <h1 class="text-4xl font-bold mb-6 text-gray-900 dark:text-white">Velopers 소개</h1>
    
    <section class="mb-8">
      <h2 class="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Velopers란?</h2>
      <p class="text-gray-600 dark:text-gray-300 leading-relaxed">
        Velopers는 국내 IT 기업들의 기술 블로그를 한곳에서 모아볼 수 있는 플랫폼입니다. <br>
        개발자들이 더 쉽게 기술 정보를 찾고 공유할 수 있도록 만들어졌습니다.
      </p>
    </section>

    <section class="mb-8">
      <h2 class="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">주요 기능</h2>
      <ul class="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2">
        <li>다양한 기업의 기술 블로그 포스트를 한 곳에서 확인</li>
        <li>기술 스택별 태그 필터링</li>
        <li>기업별 필터링</li>
        <li>다크 모드 지원</li>
        <li>검색 기능</li>
      </ul>
    </section>

    <section class="mb-8">
      <h2 class="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">기술 스택</h2>
      <div class="flex flex-wrap gap-2">
        <span class="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm text-gray-700 dark:text-gray-300">Svelte</span>
        <span class="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm text-gray-700 dark:text-gray-300">TypeScript</span>
        <span class="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm text-gray-700 dark:text-gray-300">TailwindCSS</span>
      </div>
    </section>

    <section>
      <h2 class="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">연락처</h2>
      <p class="text-gray-600 dark:text-gray-300">
        문의사항이나 제안사항이 있으시다면 아래 이메일로 연락해주세요.<br>
        Email: sm0514sm@gmail.com
      </p>
    </section>
  </div>
</div> 