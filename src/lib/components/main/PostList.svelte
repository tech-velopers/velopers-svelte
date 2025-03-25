<script lang="ts">
  import PostCard from './PostCard.svelte';
  import Pagination from './Pagination.svelte';
  import Skeleton from "$lib/components/ui/skeleton/skeleton.svelte";
  import logger from '$lib/utils/ActivityLogger';
  import { onMount } from 'svelte';

  export let posts: any[];
  export let currentPage: number;
  export let totalPages: number;
  export let goToPage: (page: number) => void;
  export let toggleTag: (tag: string) => void;
  export let toggleBlog: (blog: { name: string; avatar: string; }) => void;
  export let loadedImages: Set<string>;
  export let loading = false;
  
  // 광고를 표시할 인덱스를 저장할 변수들
  let firstAdIndex: number;
  let secondAdIndex: number;
  
  // 광고 타이틀 목록
  const adTitles = [
    "개발자가 관심있어하는 상품은 뭘까?",
    "개발자를 위한 최고의 업무 환경 구축하기",
    "코딩에 집중하기 위한 필수 아이템 모음",
    "프로그래머가 애용하는 인기 제품이 뭐야?",
    "개발자의 생산성을 높여주는 추천 아이템"
  ];
  
  // 랜덤 광고 타이틀을 가져오는 함수
  function getRandomAdTitle() {
    const randomIndex = Math.floor(Math.random() * adTitles.length);
    return adTitles[randomIndex];
  }
  
  // 컴포넌트가 마운트될 때 랜덤 인덱스 설정
  onMount(() => {
    // 첫 번째 광고는 1~3 인덱스 중 랜덤
    firstAdIndex = Math.floor(Math.random() * 3) + 1;
    // 두 번째 광고는 6~8 인덱스 중 랜덤
    secondAdIndex = Math.floor(Math.random() * 3) + 6;
  });

  function handleAdClick(position: number) {
    logger.logClick('POST_AD', undefined, 'POST_AD', {
      from: 'post_list',
      position: position,
      campaign: 'coupang_partners',
      url: 'https://link.coupang.com/a/cj6d0H'
    });
  }
</script>

<div class="space-y-4">
  {#if loading}
    {#each Array(5) as _}
      <div class="bg-white dark:bg-gray-900 p-3 md:p-4 rounded-lg shadow-sm flex gap-4 md:gap-6 dark:ring-1 dark:ring-gray-800">
        <div class="flex-1 flex flex-col gap-2">
          <Skeleton class="h-6 w-3/4" />
          <Skeleton class="h-4 w-full" />
          <div class="flex flex-wrap gap-1.5 mt-2">
            {#each Array(3) as _}
              <Skeleton class="h-6 w-16" />
            {/each}
          </div>
          <div class="mt-auto pt-2">
            <div class="flex items-center gap-2">
              <Skeleton class="h-5 w-5 rounded-full" />
              <Skeleton class="h-4 w-24" />
            </div>
          </div>
        </div>
        <Skeleton class="w-20 h-20 md:w-36 md:h-36 flex-shrink-0" />
      </div>
    {/each}
  {:else}
    {#each posts as post, index}
      <PostCard 
        {post}
        {toggleTag}
        {toggleBlog}
        {loadedImages}
      />
      
      {#if index + 1 === firstAdIndex || index + 1 === secondAdIndex}
        <a 
          href="https://link.coupang.com/a/cj6d0H" 
          target="_blank" 
          referrerpolicy="unsafe-url"
          class="block w-full cursor-pointer"
          on:click={() => handleAdClick(index + 1)}
        >
          <div 
            class="bg-white dark:bg-gray-900 p-3 sm:p-4 md:p-5 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 flex flex-row gap-4 md:gap-4 lg:gap-6 dark:ring-1 dark:ring-gray-800 group"
          >
            <div class="flex-1 flex flex-col">
              <div class="flex-grow">
                <h2 class="text-sm sm:text-base md:text-lg font-semibold mb-2 text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors duration-300">
                  {getRandomAdTitle()}
                </h2>
                <p class="text-gray-600 dark:text-gray-300 mb-3 text-xs sm:text-sm">
                  이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.
                </p>
              </div>
              
              <div class="mt-auto space-y-3">
                <div class="flex flex-wrap gap-1 sm:gap-1.5">
                  {#each ["AD", "개발자", "노트북", "컴퓨터", "쿠팡"] as tag}
                    <span class="px-1.5 sm:px-2 py-0.5 rounded-md text-xs md:text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                      {tag}
                    </span>
                  {/each}
                </div>

                <div class="flex items-center text-xs md:text-sm text-gray-500 dark:text-gray-400">
                  <div class="flex items-center">
                    <img 
                      src="https://api.dicebear.com/7.x/initials/svg?seed=AD" 
                      alt="광고" 
                      class="w-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6 rounded-full"
                    />
                    <span class="font-medium ml-1.5 sm:ml-2 text-xs sm:text-sm">velopers 광고</span>
                  </div>
                  <span class="mx-1.5 sm:mx-2">•</span>
                  <span>{new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              </div>
            </div>
            <div class="w-16 sm:w-24 md:w-28 lg:w-36 h-16 sm:h-24 md:h-28 lg:h-36 flex-shrink-0 rounded-lg overflow-hidden relative">
              <img 
                src="https://ads-partners.coupang.com/banners/849057?subId=&traceId=V0-301-5f9bd61900e673c0-I849057&w=300&h=250" 
                alt="광고 상품" 
                class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>
          </div>
        </a>
      {/if}
    {/each}
  {/if}
</div>

<Pagination 
  {currentPage}
  {totalPages}
  {goToPage}
/> 