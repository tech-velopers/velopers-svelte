<script lang="ts">
  import BlogHoverCard from "$lib/components/sidebar/BlogHoverCard.svelte";
  import { navigate } from "$lib/stores/router";
  import { addBlogsGroup } from '$lib/stores/search';
  import { store as techBlogsStore, techBlogMap } from '$lib/stores/techBlogs';
  import { Button } from "$lib/components/ui/button";
  import { onMount } from 'svelte';
  import { formatDateString } from '$lib/utils/dateUtils';

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
      totalPostViewCnt: number;
      lastCreatedAt?: number[];
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
        return blog ? { name: blog.techBlogName, avatar: blog.icon, totalPostViewCnt: blog.totalPostViewCnt, lastCreatedAt: blog.lastCreatedAt } : null;
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
              postCnt: blog.postCnt,
              totalPostViewCnt: blog.totalPostViewCnt,
              lastCreatedAt: blog.lastCreatedAt
            } : null;
          })
          .filter((blog): blog is NonNullable<typeof blog> => blog !== null)
      }));
    }
  }
</script>

<div class="bg-card text-card-foreground p-4 rounded-lg border shadow-sm">
  <div class="flex justify-between items-center mb-3">
    <h3 class="text-base font-medium">인기 블로그</h3>
    <Button 
      variant="ghost"
      size="sm"
      class="h-auto p-0 text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-transparent"
      on:click={() => navigate('/all-blogs')}
    >
      전체보기
    </Button>
  </div>
  
  <!-- 그룹 추가 버튼 -->
  <div class="flex gap-1 mb-4">
    <Button 
      variant="outline" 
      size="sm"
      class="flex-1 h-8 text-sm bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:text-green-800 dark:bg-green-950/30 dark:border-green-900 dark:text-green-400 dark:hover:bg-green-950/50"
      on:click={() => addGroupBlogs(naverCompanies)}
    >
      네이버 전체
    </Button>
    <Button 
      variant="outline" 
      size="sm"
      class="flex-1 h-8 text-sm bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100 hover:text-amber-800 dark:bg-amber-950/30 dark:border-amber-900 dark:text-amber-400 dark:hover:bg-amber-950/50"
      on:click={() => addGroupBlogs(kakaoCompanies)}
    >
      카카오 전체
    </Button>
    <Button 
      variant="outline" 
      size="sm"
      class="flex-1 h-8 text-sm bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 hover:text-blue-800 dark:bg-blue-950/30 dark:border-blue-900 dark:text-blue-400 dark:hover:bg-blue-950/50"
      on:click={() => addGroupBlogs(nekarakuCompanies)}
    >
      네카라쿠배당토
    </Button>
  </div>
  
  <div class="space-y-4">
    {#each blogCategories as category}
      <div>
        <h4 class="text-sm font-medium text-muted-foreground mb-2">{category.name}</h4>
        <div class="space-y-1">
          {#each category.companies as company}
            <BlogHoverCard {company} variant="sidebar" />
          {/each}
        </div>
      </div>
    {/each}
  </div>
</div> 