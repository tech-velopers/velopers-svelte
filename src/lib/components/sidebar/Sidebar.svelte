<script lang="ts">
  import SearchBox from './SearchBox.svelte';
  import SelectedItems from './SelectedItems.svelte';
  import PopularBlogs from './PopularBlogs.svelte';
  import PopularTags from './PopularTags.svelte';
  import PopularPosts from './PopularPosts.svelte';

  export let allTags: { id: number; tagName: string; }[];
  export let selectedTags: string[];
  export let selectedBlogs: string[];
  export let toggleTag: (tag: string) => void;
  export let toggleBlog: (blog: string) => void;
  export let searchWithSelected: () => void;
  export let resetSelected: () => void;
</script>

<aside class="w-full lg:w-80 space-y-6">
  <SearchBox />
  
  <SelectedItems
    {selectedTags}
    {selectedBlogs}
    {toggleTag}
    {toggleBlog}
    {searchWithSelected}
    {resetSelected}
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

  <PopularPosts />
</aside> 