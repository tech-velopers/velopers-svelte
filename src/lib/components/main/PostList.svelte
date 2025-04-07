<script lang="ts">
  import PostCard from './PostCard.svelte';
  import Pagination from './Pagination.svelte';
  import Skeleton from "$lib/components/ui/skeleton/skeleton.svelte";
  import logger from '$lib/utils/ActivityLogger';
  import { onMount } from 'svelte';
  import { Button } from "$lib/components/ui/button";
  import { cn } from "$lib/utils";

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
    "LLM 사용비라도 모으고 싶어요 😭",
    "개발자를 위한 최고의 업무 환경 구축하기",
    "서버 비용이라도 모으고 싶어요 😭",
    "프로그래머가 애용하는 인기 제품이 뭐야?",
    "개발자의 생산성을 높여주는 추천 아이템"
  ];
  
  // 쿠팡 파트너스 광고 ID 목록
  const adId = "849051"
  
  // 랜덤 광고 타이틀을 가져오는 함수
  function getRandomAdTitle() {
    const randomIndex = Math.floor(Math.random() * adTitles.length);
    return adTitles[randomIndex];
  }
  
  // 컴포넌트가 마운트될 때 랜덤 인덱스 설정
  onMount(() => {
    // 현재 시간을 기준으로 5분 간격으로 일정한 랜덤값 생성
    const timeBasedRandom = () => {
      const now = new Date();
      // 현재 시간을 5분 단위로 나누어 시드값 생성 (300000ms = 5분)
      const timeSlot = Math.floor(now.getTime() / 600000);
      
      // 시드값을 기반으로 0과 1 사이의 결정적인 난수 생성
      const seededRandom = (seed: number) => {
        // 간단한 시드 기반 난수 생성기
        const x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
      };
      
      // 시드값으로 첫 번째와 두 번째 광고 위치 결정
      firstAdIndex = Math.floor(seededRandom(timeSlot) * 3) + 1;
      secondAdIndex = Math.floor(seededRandom(timeSlot + 1) * 3) + 6;
    };
    
    // 초기 위치 설정
    timeBasedRandom();
    
    // 매 분마다 체크하여 5분이 지났는지 확인
    const intervalId = setInterval(() => {
      const now = new Date();
      // 현재 분이 5로 나누어 떨어지면 광고 위치 업데이트
      if (now.getMinutes() % 5 === 0 && now.getSeconds() === 0) {
        timeBasedRandom();
      }
    }, 1000);
    
    // 컴포넌트 언마운트 시 인터벌 정리
    return () => clearInterval(intervalId);
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
          <article 
            class="bg-white dark:bg-gray-900 p-3 sm:p-4 md:p-5 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 flex flex-row flex-wrap sm:flex-nowrap gap-4 md:gap-4 lg:gap-6 dark:ring-1 dark:ring-gray-800 group"
          >
            <div class="flex-1 flex flex-col">
              <div class="flex-grow">
                <h2 class="text-sm sm:text-base md:text-lg font-semibold mb-2 text-gray-900 dark:text-white group-hover:text-blue-500 transition-colors duration-300">
                  {getRandomAdTitle()}
                </h2>
                <p class="text-gray-600 dark:text-gray-300 mb-0 sm:mb-3 text-xs sm:text-sm">
                  이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.
                </p>
              </div>
              
              <div class="mt-auto space-y-3 hidden sm:block">
                <div class="flex flex-wrap gap-1 sm:gap-1.5">
                  {#each ["AD", "개발자", "노트북", "컴퓨터", "쿠팡"] as tag}
                    <Button 
                      variant="outline"
                      size="sm"
                      class={cn(
                        "px-3 py-[0.3rem] h-auto font-normal text-sm transition-all",
                        "hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 dark:hover:border-blue-800"
                      )}
                    >
                      {tag}
                    </Button>
                  {/each}
                </div>

                <div class="flex items-center text-xs md:text-sm text-gray-500 dark:text-gray-400">
                  <div class="flex items-center hover:text-blue-500 transition-colors">
                    <img 
                      src="https://api.dicebear.com/7.x/initials/svg?seed=AD" 
                      alt="광고" 
                      class="w-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6 rounded-full"
                    />
                    <span class="font-medium ml-1.5 sm:ml-2 text-xs sm:text-sm">velopers</span>
                  </div>
                  <span class="mx-1.5 sm:mx-2">•</span>
                  <span>{new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              </div>
            </div>
            <div class="w-16 sm:w-24 md:w-28 lg:w-36 h-16 sm:h-24 md:h-28 lg:h-36 flex-shrink-0 rounded-lg overflow-hidden relative group">
              <iframe 
                src={`https://ads-partners.coupang.com/widgets.html?id=${adId}&template=carousel&trackingCode=AF6109504&subId=&width=300&height=300&tsource=`}
                width="100%" 
                height="100%" 
                frameborder="0" 
                scrolling="no" 
                referrerpolicy="unsafe-url"
                title="쿠팡 파트너스 광고"
              ></iframe>
              <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300"></div>
            </div>
            
            <!-- 모바일에서만 보이는 태그와 메타 정보 영역 -->
            <div class="w-full order-2 -mt-0.5 hidden max-sm:block">
              <div class="flex flex-wrap gap-1 mb-2">
                {#each ["AD", "개발자", "노트북", "컴퓨터", "쿠팡"] as tag}
                  <Button 
                    variant="outline"
                    size="sm"
                    class={cn(
                      "px-3 py-[0.3rem] h-auto font-normal text-xs transition-all",
                      "hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 dark:hover:border-blue-800"
                    )}
                  >
                    {tag}
                  </Button>
                {/each}
              </div>

              <div class="flex items-center text-xs text-gray-500 dark:text-gray-400">
                <div class="flex items-center hover:text-blue-500 transition-colors">
                  <img 
                    src="https://api.dicebear.com/7.x/initials/svg?seed=AD" 
                    alt="광고" 
                    class="w-4 h-4 rounded-full"
                  />
                  <span class="font-medium ml-1.5 text-xs">velopers 광고</span>
                </div>
                <span class="mx-1.5">•</span>
                <span>{new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            </div>
          </article>
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