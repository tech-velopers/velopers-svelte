<script lang="ts">
  import { onMount } from 'svelte';
  
  export let currentCategory: string;
  export let selectCategory: (category: string) => void;

  interface CategoryCount {
    category: string;
    totalCount: number;
  }

  const defaultCategories = [
    { category: "All", totalCount: 1000 },
    { category: "Frontend", totalCount: 100 },
    { category: "Backend", totalCount: 100 },
    { category: "AI", totalCount: 100 },
    { category: "DevOps", totalCount: 100 },
    { category: "Architecture", totalCount: 100 },
    { category: "else", totalCount: 100 }
  ];

  let categories: CategoryCount[] = defaultCategories;
  let loading = true;

  onMount(async () => {
    try {
      const response = await fetch('http://localhost:8080/api/categories', {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: CategoryCount[] = await response.json();
      
      // 카테고리 순서 정렬
      categories = defaultCategories.map(defaultCat => {
        const found = data.find((item: CategoryCount) => item.category === defaultCat.category);
        return found || defaultCat;
      });
    } catch (error) {
      console.error('카테고리 데이터를 불러오는데 실패했습니다:', error);
    } finally {
      loading = false;
    }
  });
</script>

<div class="mb-6">
  <div class="grid grid-cols-3 gap-2 md:flex md:flex-wrap md:gap-2">
    {#each categories as { category, totalCount }}
      <button 
        class="px-2.5 py-1.5 md:px-3 md:py-1.5 rounded-full border-2 transition-all duration-200
          whitespace-nowrap text-sm font-medium shadow-sm hover:shadow
          {currentCategory === category 
            ? 'bg-blue-500 text-white border-blue-500 hover:bg-blue-600 hover:border-blue-600' 
            : 'bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700 dark:text-gray-300 hover:border-blue-200 dark:hover:border-blue-800'} 
          hover:-translate-y-0.5"
        on:click={() => selectCategory(category)}
      >
        <span class="{category === 'Architecture' ? 'text-[11px] md:text-sm' : ''}">{category}</span>
        {#if loading}
          <span class="ml-1 {currentCategory === category ? 'text-blue-100' : 'text-gray-400 dark:text-gray-500'} text-xs font-normal">
            (<div class="inline-block animate-pulse w-5 h-3 bg-gray-300 dark:bg-gray-600 rounded"></div>)
          </span>
        {:else}
          <span class="ml-1 {currentCategory === category ? 'text-blue-100' : 'text-gray-400 dark:text-gray-500'} text-xs font-normal">
            ({totalCount})
          </span>
        {/if}
      </button>
    {/each}
  </div>
</div> 