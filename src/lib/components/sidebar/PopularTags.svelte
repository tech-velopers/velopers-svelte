<script lang="ts">
  export let allTags: Array<{ id: number; tagName: string }>;
  export let selectedTags: string[];
  export let toggleTag: (tag: string) => void;
  export let loading = false;
</script>

<div class="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm dark:ring-1 dark:ring-gray-700">
  <div class="flex justify-between items-center mb-3">
    <h3 class="text-base font-medium dark:text-white">인기 태그</h3>
    <button class="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300">
      전체보기
    </button>
  </div>
  <div class="flex flex-wrap gap-2">
    {#if loading}
      {#each Array(50) as _, i}
        <div class="px-2 py-1 rounded-md animate-pulse bg-gray-200 dark:bg-gray-700">
          <div class="h-4 {i % 3 === 0 ? 'w-24' : i % 3 === 1 ? 'w-16' : 'w-20'} bg-gray-300 dark:bg-gray-600 rounded"></div>
        </div>
      {/each}
    {:else}
      {#each allTags as tag}
        <button
          on:click={() => toggleTag(tag.tagName)}
          class="px-2 py-1 rounded-md text-sm transition-all duration-200
            {selectedTags.includes(tag.tagName) 
              ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800' 
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:-translate-y-0.5'}"
        >
          {tag.tagName}
        </button>
      {/each}
    {/if}
  </div>
</div> 