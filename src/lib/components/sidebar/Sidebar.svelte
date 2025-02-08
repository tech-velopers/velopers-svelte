<script lang="ts">
  import SearchBox from './SearchBox.svelte';
  import PopularBlogs from './PopularBlogs.svelte';
  import PopularTags from './PopularTags.svelte';
  import { selectedBlogs, selectedTags } from '$lib/stores/search';

  export let allTags: { id: number; tagName: string; }[];
  export let searchWithSelected: (data: any) => void;
  export let onSearch: (event: CustomEvent<{query: string}>) => void;
  export let onReset: () => void;
</script>

<aside class="w-full lg:w-80 space-y-6">
  <SearchBox 
    {searchWithSelected}
    on:search={onSearch}
    {onReset}
  />

  <PopularBlogs />

  <PopularTags
    {allTags}
  />
</aside> 