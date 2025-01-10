<script lang="ts">
  type PopularPost = {
    title: string;
    views: string;
  };

  const popularPosts: PopularPost[] = Array(5).fill({
    title: "인기 게시글 제목",
    views: "1.2k"
  });
</script>

<div class="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm dark:ring-1 dark:ring-gray-700">
  <h3 class="text-lg font-semibold mb-4 dark:text-white">인기 게시글</h3>
  <div class="space-y-4">
    {#each popularPosts as post, i}
      <div class="flex items-start gap-3">
        <span class="text-lg font-bold text-gray-400 dark:text-gray-500">{i + 1}</span>
        <div>
          <h4 class="font-medium dark:text-white">{post.title}</h4>
          <span class="text-sm text-gray-500 dark:text-gray-400">조회수 {post.views}</span>
        </div>
      </div>
    {/each}
  </div>
</div> 