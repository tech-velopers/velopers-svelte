<script lang="ts">
  import { selectedTags, toggleTag } from '$lib/stores/search';
  import { navigate } from "$lib/stores/router";
  import { Button } from "$lib/components/ui/button";
  import { Badge } from "$lib/components/ui/badge";
  import { cn } from "$lib/utils.js";
  import { Tag as TagIcon, ChevronRight } from 'lucide-svelte';
  import { Skeleton } from "$lib/components/ui/skeleton";
  import logger from '$lib/utils/ActivityLogger';

  export let allTags: Array<{ id: number; tagName: string; }>;
  export let loading = false;

  // 태그 토글 함수
  function handleTagToggle(tagName: string) {
    // 태그 토글 상태 확인
    const isSelected = $selectedTags.includes(tagName);
    
    // 태그 토글 로깅
    logger.logClick(isSelected ? 'TAG_UNSELECT' : 'TAG_SELECT', undefined, tagName, {
      totalSelected: isSelected ? $selectedTags.length - 1 : $selectedTags.length + 1,
      from: 'sidebar_popular_tags'
    });
    
    // 태그 토글 실행
    toggleTag(tagName);
  }
</script>

<div class="bg-card text-card-foreground p-4 rounded-lg border shadow-sm">
  <div class="flex justify-between items-center mb-4">
    <h3 class="text-base font-medium flex items-center gap-1.5">
      <TagIcon class="text-blue-500 dark:text-blue-400" size={18} />
      <span>인기 태그</span>
    </h3>
    <Button 
      variant="ghost"
      size="sm"
      class="h-auto p-0 text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-transparent"
      on:click={() => navigate('/all-tags')}
    >
      전체보기
    </Button>
  </div>
  <div class="flex flex-wrap gap-1.5">
    {#if loading}
      <div class="grid grid-cols-3 gap-1.5 w-full">
        {#each Array(15) as _, i}
          <Skeleton class="h-8 w-full rounded-md" />
        {/each}
      </div>
    {:else}
      {#each allTags as tag}
        <Button 
          variant={$selectedTags.includes(tag.tagName) ? "default" : "outline"}
          size="sm"
          class={cn(
            "px-3 py-[0.3rem] h-auto font-normal text-sm transition-colors border min-w-max",
            $selectedTags.includes(tag.tagName) 
              ? "bg-blue-500 hover:bg-blue-600 text-white border-blue-500"
              : "hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 dark:hover:border-blue-800"
          )}
          on:click={() => handleTagToggle(tag.tagName)}
        >
          {tag.tagName}
        </Button>
      {/each}
    {/if}
  </div>
</div> 