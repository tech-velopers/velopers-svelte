<script lang="ts">
  import * as HoverCard from "$lib/components/ui/hover-card";
  import * as Avatar from "$lib/components/ui/avatar";
  import { navigate } from "$lib/stores/router";
  import { selectedBlogs, toggleBlog, addBlogsGroup } from '$lib/stores/search';
  import { store as techBlogsStore, techBlogMap } from '$lib/stores/techBlogs';
  import { onMount } from 'svelte';

  const categoryGroups = {
    "네이버 • 카카오": [
      "네이버 D2",
      "네이버 플레이스",
      "네이버 페이",
      "네이버 DnA",
      "카카오",
      "카카오뱅크",
      "카카오모빌리티",
      "카카오페이",
      "카카오엔터프라이즈",
      "카카오엔터테인먼트FE",
      "카카오헤어샵",
      "카카오스타일"
    ],
    "라쿠배당토": [
      "라인",
      "쿠팡",
      "우아한 형제들",
      "당근마켓",
      "토스"
    ]
  };

  // 네이버, 카카오, 네카라쿠배 그룹 정의
  const naverCompanies = [
    "네이버 D2",
    "네이버 플레이스",
    "네이버 페이",
    "네이버 DnA"
  ];

  const kakaoCompanies = [
    "카카오",
    "카카오뱅크",
    "카카오모빌리티",
    "카카오페이",
    "카카오엔터프라이즈",
    "카카오엔터테인먼트FE",
    "카카오헤어샵",
    "카카오스타일"
  ];

  const nekarakuCompanies = [
    "네이버 D2",
    "네이버 플레이스",
    "네이버 페이",
    "네이버 DnA",
    "카카오",
    "카카오뱅크",
    "카카오모빌리티",
    "카카오페이",
    "카카오엔터프라이즈",
    "카카오엔터테인먼트FE",
    "카카오헤어샵",
    "카카오스타일",
    "라인",
    "쿠팡",
    "우아한 형제들",
    "당근마켓",
    "토스"
  ];

  let blogCategories: Array<{
    name: string;
    companies: Array<{
      name: string;
      avatar: string;
      url: string;
      postCnt: number;
    }>;
  }> = [];

  onMount(async () => {
    await techBlogsStore.fetchTechBlogs();
  });

  // 그룹 추가 함수
  function addGroupBlogs(companyNames: string[]) {
    if (!$techBlogMap) return;
    
    const blogsToAdd = companyNames
      .map(name => {
        const blog = $techBlogMap[name];
        return blog ? { name: blog.techBlogName, avatar: blog.icon } : null;
      })
      .filter((blog): blog is NonNullable<typeof blog> => blog !== null);
    
    addBlogsGroup(blogsToAdd);
  }

  $: {
    if ($techBlogMap) {
      blogCategories = Object.entries(categoryGroups).map(([categoryName, companyNames]) => ({
        name: categoryName,
        companies: companyNames
          .map(name => {
            const blog = $techBlogMap[name];
            return blog ? {
              name: blog.techBlogName,
              avatar: blog.icon,
              url: blog.baseUrl,
              postCnt: blog.postCnt
            } : null;
          })
          .filter((blog): blog is NonNullable<typeof blog> => blog !== null)
      }));
    }
  }
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
  
  <!-- 그룹 추가 버튼 -->
  <div class="flex gap-2 mb-4">
    <button 
      on:click={() => addGroupBlogs(naverCompanies)}
      class="flex-1 px-2 py-1 text-xs bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors">
      네이버 전체
    </button>
    <button 
      on:click={() => addGroupBlogs(kakaoCompanies)}
      class="flex-1 px-2 py-1 text-xs bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors">
      카카오 전체
    </button>
    <button 
      on:click={() => addGroupBlogs(nekarakuCompanies)}
      class="flex-1 px-2 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
      네카라쿠배 전체    
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
                  <button 
                    class="flex justify-between space-x-3 w-full text-left cursor-pointer border-0 bg-transparent group" 
                    on:click={() => {
                      if ($techBlogMap && company.name) {
                        const blog = $techBlogMap[company.name];
                        if (blog && blog.id) {
                          navigate(`/blog/${blog.id}`);
                        }
                      }
                    }}>
                    <Avatar.Root class="h-12 w-12">
                      <Avatar.Image 
                        src={`/icons/${company.avatar}` || `https://api.dicebear.com/7.x/initials/svg?seed=${company.name}`} 
                        alt={company.name} 
                      />
                    </Avatar.Root>
                    <div class="space-y-1 flex-1">
                      <h4 class="text-sm font-semibold dark:text-white group-hover:text-blue-500 transition-colors">{company.name}</h4>
                      <p class="text-sm text-gray-600 dark:text-gray-300 group-hover:text-blue-400 transition-colors">기술 블로그</p>
                      <div class="flex items-center pt-2">
                        <div class="flex text-xs text-gray-500 dark:text-gray-400">
                          <span class="flex items-center">
                            <span class="font-bold text-gray-900 dark:text-white mr-1">{company.postCnt}</span>
                            포스트
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
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
                      on:click|stopPropagation={() => {
                        if (company.url) {
                          window.open(company.url, '_blank', 'noopener,noreferrer');
                        }
                      }}
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