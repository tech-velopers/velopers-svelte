<script lang="ts">
  import { onMount } from 'svelte';
  import { Server, Home, Palette, Bot, GitBranch, Network, Wind } from 'lucide-svelte';
  import { Button } from "$lib/components/ui/button";
  import { cn } from "$lib/utils";
  
  export let currentCategory: string;
  export let selectCategory: (category: string) => void;

  interface CategoryItem {
    value: string;
    icon: typeof Home;
    label: string;
  }

  const defaultCategories: CategoryItem[] = [
    { value: "all", icon: Home, label: "All" },
    { value: "frontend", icon: Palette, label: "Frontend" },
    { value: "backend", icon: Server, label: "Backend" },
    { value: "ai", icon: Bot, label: "AI" },
    { value: "devops", icon: GitBranch, label: "DevOps" },
    { value: "architecture", icon: Network, label: "Architecture" },
    { value: "else", icon: Wind, label: "Else" }
  ];

  let categories: CategoryItem[] = defaultCategories;

  onMount(() => {
    categories = defaultCategories;
    if (!currentCategory || currentCategory === '') {
      currentCategory = 'all';
    }
  });
</script>

<div class="space-y-2 mb-2">
  <div class="flex overflow-x-auto pb-2 scrollbar-hide md:grid md:grid-cols-7 md:gap-2">
    {#each categories as category}
      <Button
        variant="outline"
        size="sm"
        class={cn(
          "flex flex-col items-center justify-center gap-1.5 px-3 py-2 h-auto min-w-[80px] transition-all duration-200 rounded-lg whitespace-nowrap mx-0.5 first:ml-0 last:mr-0 md:mx-0 md:w-full",
          currentCategory === category.value 
            ? "bg-blue-500 text-white border-blue-500 shadow-sm hover:bg-blue-600 hover:border-blue-500 hover:text-white" 
            : "hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 hover:text-blue-700 dark:hover:text-blue-400"
        )}
        on:click={() => selectCategory(category.value)}
      >
        <svelte:component 
          this={category.icon} 
          class={cn(
            "w-3.5 h-3.5 transition-colors",
            currentCategory === category.value 
              ? "text-white" 
              : "text-muted-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400"
          )}
          strokeWidth={1.5}
        />
        <span class="text-sm font-medium">{category.label}</span>
      </Button>
    {/each}
  </div>
</div> 