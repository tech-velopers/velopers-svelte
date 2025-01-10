<script lang="ts">
  export let currentPage: number;
  export let totalPages: number;
  export let goToPage: (page: number) => void;

  $: pages = Array.from(
    { length: totalPages }, 
    (_, i) => i + 1
  ).slice(
    Math.max(0, currentPage - 3), 
    Math.min(totalPages, currentPage + 2)
  );
</script>

<div class="flex justify-center mt-6">
  <div class="flex items-center space-x-1 md:space-x-2">
    <button 
      class="px-2 py-1 rounded border dark:border-gray-700 {currentPage === 1 ? 'bg-gray-100 dark:bg-gray-800' : 'hover:bg-gray-50 dark:hover:bg-gray-800'} dark:text-gray-300"
      disabled={currentPage === 1}
      on:click={() => goToPage(currentPage - 1)}
    >
      &lt;
    </button>
    {#each pages as page}
      <button 
        class="px-2 py-1 rounded border dark:border-gray-700 {currentPage === page ? 'bg-blue-500 text-white' : 'hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-gray-300'}"
        on:click={() => goToPage(page)}
      >
        {page}
      </button>
    {/each}
    <button 
      class="px-2 py-1 rounded border dark:border-gray-700 {currentPage === totalPages ? 'bg-gray-100 dark:bg-gray-800' : 'hover:bg-gray-50 dark:hover:bg-gray-800'} dark:text-gray-300"
      disabled={currentPage === totalPages}
      on:click={() => goToPage(currentPage + 1)}
    >
      &gt;
    </button>
  </div>
</div> 