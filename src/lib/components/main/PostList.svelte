<script lang="ts">
  import PostCard from './PostCard.svelte';
  import Pagination from './Pagination.svelte';
  import Skeleton from "$lib/components/ui/skeleton/skeleton.svelte";

  export let posts: any[];
  export let currentPage: number;
  export let totalPages: number;
  export let goToPage: (page: number) => void;
  export let toggleTag: (tag: string) => void;
  export let toggleBlog: (blog: { name: string; avatar: string; }) => void;
  export let loadedImages: Set<string>;
  export let loading = false;
</script>

<div class="space-y-4">
  {#if loading}
    {#each Array(5) as _}
      <div class="bg-white dark:bg-gray-900 p-3 md:p-4 rounded-lg shadow-sm flex gap-4 md:gap-6 dark:ring-1 dark:ring-gray-800">
        <div class="flex-1 flex flex-col gap-2">
          <Skeleton class="h-6 w-3/4" />
          <Skeleton class="h-4 w-full" />
          <div class="flex flex-wrap gap-1.5 mt-2">
            {#each Array(3) as _}
              <Skeleton class="h-6 w-16" />
            {/each}
          </div>
          <div class="mt-auto pt-2">
            <div class="flex items-center gap-2">
              <Skeleton class="h-5 w-5 rounded-full" />
              <Skeleton class="h-4 w-24" />
            </div>
          </div>
        </div>
        <Skeleton class="w-20 h-20 md:w-36 md:h-36 flex-shrink-0" />
      </div>
    {/each}
  {:else}
    {#each posts as post}
      <PostCard 
        {post}
        {toggleTag}
        {toggleBlog}
        {loadedImages}
      />
    {/each}
  {/if}
</div>

<Pagination 
  {currentPage}
  {totalPages}
  {goToPage}
/> 