<script lang="ts">
  import * as HoverCard from "$lib/components/ui/hover-card";
  import * as Avatar from "$lib/components/ui/avatar";
  import { navigate } from "$lib/stores/router";
  import { selectedBlogs, toggleBlog } from '$lib/stores/search';

  const blogCategories = [
    {
      name: "네이버 • 카카오",
      companies: [
        { name: "네이버 D2", avatar: "naver.ico" },
        { name: "네이버 플레이스", avatar: "naver-place.png" },
        // { name: "네이버 클라우드 플랫폼", avatar: "naver-cloud-platform.ico" },
        { name: "카카오", avatar: "kakao.ico" },
        { name: "카카오뱅크", avatar: "kakaobank.png" },
        { name: "카카오모빌리티", avatar: "kakaomobility.ico" },
        { name: "카카오페이", avatar: "kakaopay.png" },
        { name: "카카오엔터프라이즈", avatar: "kakao-enterprise.png" },
      ]
    },
    {
      name: "라쿠배당토",
      companies: [
        { name: "라인", avatar: "line.ico" },
        { name: "쿠팡", avatar: "coupang.ico" },
        { name: "우아한 형제들", avatar: "woowahan.ico" },
        { name: "당근마켓", avatar: "daangn.ico" },
        { name: "토스", avatar: "toss.ico" },
      ]
    }
  ];
</script>

<div class="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-md dark:ring-1 dark:ring-gray-700">
  <div class="flex justify-between items-center mb-3">
    <h3 class="text-base font-medium dark:text-white">인기 블로그</h3>
    <button 
      on:click={() => navigate('/all-blogs')}
      class="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300">
      전체보기
    </button>
  </div>
  <div class="space-y-6">
    {#each blogCategories as category}
      <div class="space-y-3">
        <h4 class="text-sm font-semibold text-gray-500 dark:text-gray-400">{category.name}</h4>
        <div class="space-y-2">
          {#each category.companies as company}
            <HoverCard.Root openDelay={500}>
              <HoverCard.Trigger>
                <button 
                  on:click={() => toggleBlog(company)}
                  class="w-full flex items-center gap-3 group p-2 rounded-lg transition-colors
                    {$selectedBlogs.some(blog => blog.name === company.name)
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' 
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-white'}"
                >
                  <Avatar.Root class="w-8 h-8">
                    <Avatar.Image 
                      src={`/icons/${company.avatar}` ||  `https://api.dicebear.com/7.x/initials/svg?seed=${company.name}`} 
                      alt={company.name} 
                    />
                  </Avatar.Root>
                  <div class="flex-1 text-left">
                    <div class="font-medium group-hover:text-blue-500 transition-colors">{company.name}</div>
                  </div>
                </button>
              </HoverCard.Trigger>
              <HoverCard.Content class="w-72 p-4">
                <div class="flex flex-col space-y-3">
                  <div class="flex justify-between space-x-3">
                    <Avatar.Root class="h-12 w-12">
                      <Avatar.Image 
                        src={`/icons/${company.avatar}` || `https://api.dicebear.com/7.x/initials/svg?seed=${company.name}`} 
                        alt={company.name} 
                      />
                    </Avatar.Root>
                    <div class="space-y-1 flex-1">
                      <h4 class="text-sm font-semibold dark:text-white">{company.name}</h4>
                      <p class="text-sm text-gray-600 dark:text-gray-300">기술 블로그</p>
                      <div class="flex items-center pt-2">
                        <div class="flex text-xs text-gray-500 dark:text-gray-400">
                          <span class="flex items-center">
                            <span class="font-bold text-gray-900 dark:text-white mr-1">25</span>
                            포스트
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="flex gap-2">
                    <button 
                      class="flex-1 px-3 py-1.5 text-sm rounded-lg transition-colors {$selectedBlogs.some(blog => blog.name === company.name)
                        ? 'bg-red-500 hover:bg-red-600 text-white' 
                        : 'bg-blue-500 hover:bg-blue-600 text-white'}"
                      on:click={() => toggleBlog(company)}
                    >
                      {$selectedBlogs.some(blog => blog.name === company.name) ? '선택 해제' : '선택하기'}
                    </button>
                    <button 
                      class="flex-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-center"
                      on:click={() => navigate('/all-blogs')}
                    >
                      블로그로 이동
                    </button>
                  </div>
                </div>
              </HoverCard.Content>
            </HoverCard.Root>
          {/each}
        </div>
      </div>
    {/each}
  </div>
</div> 