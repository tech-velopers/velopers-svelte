<script lang="ts">
  import { onMount } from 'svelte';

  export let selectedCategory: string = 'All';
  export let onCategorySelect: (category: string) => void;

  interface CategoryCount {
    category: string;
    totalCount: number;
  }

  let categories: CategoryCount[] = [];

  onMount(async () => {
    try {
      const response = await fetch('/api/categories');
      categories = await response.json();
    } catch (error) {
      console.error('카테고리 데이터를 불러오는데 실패했습니다:', error);
    }
  });
</script>

<div class="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm dark:ring-1 dark:ring-gray-700">
  <h3 class="text-base font-medium mb-3 dark:text-white">카테고리</h3>
  <div class="space-y-2">
    {#each categories as { category, totalCount }}
      <button
        class="w-full flex items-center justify-between p-2 rounded-lg transition-colors
          {selectedCategory === category
            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
            : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-white'}"
        on:click={() => onCategorySelect(category)}
      >
        <span class="font-medium">{category}</span>
        <span class="text-sm text-gray-500 dark:text-gray-400">{totalCount}</span>
      </button>
    {/each}
  </div>
</div> 