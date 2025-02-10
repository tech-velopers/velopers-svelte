<script lang="ts">
  import { onMount } from 'svelte';
  
  export let currentCategory: string;
  export let selectCategory: (category: string) => void;

  interface CategoryCount {
    category: string;
  }

  const defaultCategories = [
    { category: "🌐 All" },
    { category: "🎨 Frontend" },
    { category: "🗄️ Backend" },
    { category: "🤖 AI" },
    { category: "🚀 DevOps" },
    { category: "🔷 Architecture" },
    { category: "💡 Else" }
  ];

  let categories: CategoryCount[] = defaultCategories;
  let loading = false;

  onMount(() => {
    categories = defaultCategories;
  });
</script>

<div class="mb-6">
  <div class="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">
    {#each categories as { category }}
      <button 
        class="w-full px-4 py-2.5 rounded-xl border-2 transition-all duration-200
          text-sm font-medium shadow-sm hover:shadow text-center
          {currentCategory === category 
            ? 'bg-blue-500 text-white border-blue-500 hover:bg-blue-600 hover:border-blue-600' 
            : 'bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700 dark:text-gray-300 hover:border-blue-200 dark:hover:border-blue-800'} 
          hover:-translate-y-0.5"
        on:click={() => selectCategory(category)}
      >
        <span class="flex flex-col items-center gap-1 {category === 'Architecture' ? 'text-[13px]' : ''}">
          <span class="text-xl">{category.split(' ')[0]}</span>
          <span>{category.split(' ').slice(1).join(' ')}</span>
        </span>
      </button>
    {/each}
  </div>
</div> 