<script lang="ts">
  import { onMount } from 'svelte';
  import { Server, Home, Palette, Bot, GitBranch, Network, Wind } from 'lucide-svelte';
  
  export let currentCategory: string;
  export let selectCategory: (category: string) => void;

  interface CategoryItem {
    value: string;
    icon: typeof Home;
    label: string;
  }

  const defaultCategories: CategoryItem[] = [
    { value: "All", icon: Home, label: "All" },
    { value: "Frontend", icon: Palette, label: "Frontend" },
    { value: "Backend", icon: Server, label: "Backend" },
    { value: "AI", icon: Bot, label: "AI" },
    { value: "DevOps", icon: GitBranch, label: "DevOps" },
    { value: "Architecture", icon: Network, label: "Architecture" },
    { value: "Else", icon: Wind, label: "Else" }
  ];

  let categories: CategoryItem[] = defaultCategories;

  onMount(() => {
    categories = defaultCategories;
  });
</script>

<div class="mb-6">
  <div class="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">
    {#each categories as category}
      <button 
        class="w-full px-4 py-2.5 rounded-xl border-2 transition-all duration-200
          text-sm font-medium shadow-sm hover:shadow text-center
          {currentCategory === category.value
            ? 'bg-blue-500 text-white border-blue-500 hover:bg-blue-600 hover:border-blue-600' 
            : 'bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700 dark:text-gray-300 hover:border-blue-200 dark:hover:border-blue-800'} 
          hover:-translate-y-0.5"
        on:click={() => selectCategory(category.value)}
      >
        <span class="flex flex-col items-center gap-1 {category.value === 'Architecture' ? 'text-[13px]' : ''}">
          <svelte:component 
            this={category.icon} 
            class="w-6 h-6" 
            strokeWidth={1.5}
          />
          <span>{category.label}</span>
        </span>
      </button>
    {/each}
  </div>
</div> 