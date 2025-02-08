<script lang="ts">
  import Sidebar from "$lib/components/sidebar/Sidebar.svelte";

  // Props
  export let allTags: Array<{ id: number; tagName: string }> = [];
  export let selectedTags: string[] = [];
  export let selectedBlogs: Array<{ name: string; avatar: string }> = [];
  export let showLogo = true;

  // Events
  export let onSearch: (event: CustomEvent<{query: string}>) => void;
  export let toggleTag: (tag: string) => void;
  export let toggleBlog: (blog: { name: string; avatar: string }) => void;
  export let searchWithSelected: (data: any) => void;
  export let resetSelected: () => void;
</script>

<div class="container mx-auto px-4 py-8 max-w-7xl">
  {#if showLogo}
    <!-- 로고 이미지 -->
    <div class="mb-8">
      <div class="bg-black rounded-2xl overflow-hidden dark:ring-1 dark:ring-gray-700">
        <img src="/velopers.png" alt="Velopers 로고" class="w-full h-36 md:h-40 object-contain scale-[1.75] md:scale-100"/>
      </div>
    </div>
  {/if}

  <div class="flex flex-col lg:flex-row gap-8">
    <!-- 메인 컨텐츠 영역 -->
    <div class="flex-1">
      <slot />
    </div>

    <!-- 우측 사이드바 -->
    <Sidebar
      {allTags}
      {selectedTags}
      {selectedBlogs}
      {toggleTag}
      {toggleBlog}
      {searchWithSelected}
      {resetSelected}
      onSearch={onSearch}
    />
  </div>
</div> 