<script lang="ts">
  import Sidebar from "$lib/components/sidebar/Sidebar.svelte";

  export let allTags: Array<{ id: number; tagName: string; }>;
  export let searchWithSelected: (data: any) => void;
  export let onSearch: (event: CustomEvent<{query: string}>) => void;
  export let onReset: () => void;
  export let showLogo = true;
</script>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
  <div class="container mx-auto px-4 py-8 max-w-7xl">
    {#if showLogo}
      <div class="mb-8">
        <div class="bg-black rounded-2xl overflow-hidden dark:ring-1 dark:ring-gray-700">
          <img src="/velopers.png" alt="Velopers 로고" class="w-full h-36 md:h-40 object-contain scale-[1.75] md:scale-100"/>
        </div>
      </div>
    {/if}

    <div class="flex flex-col lg:flex-row gap-8">
      <main class="flex-1">
        <slot />
      </main>
      <Sidebar
        {allTags}
        {searchWithSelected}
        {onSearch}
        {onReset}
      />
    </div>
  </div>
</div>