<script lang="ts">
  import SearchBox from './SearchBox.svelte';
  import PopularBlogs from './PopularBlogs.svelte';
  import PopularTags from './PopularTags.svelte';

  export let allTags: { id: number; tagName: string; }[];
  export let selectedTags: string[];
  export let selectedBlogs: Array<{ name: string; avatar: string; }>;
  export let toggleTag: (tag: string) => void;
  export let toggleBlog: (blog: { name: string; avatar: string; }) => void;
  export let searchWithSelected: (data: any) => void;
  export let resetSelected: () => void;
  export let onSearch: (event: CustomEvent<{query: string}>) => void;
</script>

<aside class="w-full lg:w-80 space-y-6">
  <SearchBox 
    {selectedTags}
    {selectedBlogs}
    {toggleTag}
    {toggleBlog}
    {searchWithSelected}
    {resetSelected}
    on:search={onSearch}
  />

  <PopularBlogs
    {selectedBlogs}
    {toggleBlog}
  />

  <PopularTags
    {allTags}
    {selectedTags}
    {toggleTag}
  />
</aside> 