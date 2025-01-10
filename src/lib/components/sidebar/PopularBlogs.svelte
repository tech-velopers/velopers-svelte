<script lang="ts">
  import * as HoverCard from "$lib/components/ui/hover-card";
  import * as Avatar from "$lib/components/ui/avatar";

  export let selectedBlogs: string[];
  export let toggleBlog: (blog: string) => void;

  const popularBlogs = ["네이버", "카카오", "토스", "쿠팡", "라인"];
</script>

<div class="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm dark:ring-1 dark:ring-gray-700">
  <h3 class="text-base font-medium mb-3 dark:text-white">인기 블로그</h3>
  <div class="space-y-3">
    {#each popularBlogs as blog, i}
      <HoverCard.Root openDelay={500}>
        <HoverCard.Trigger>
          <button 
            on:click={() => toggleBlog(blog)}
            class="w-full flex items-center gap-3 group p-2 rounded-lg transition-colors
              {selectedBlogs.includes(blog) 
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' 
                : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-white'}"
          >
            <span class="text-lg font-bold text-gray-400 dark:text-gray-500">{i + 1}</span>
            <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${blog}`} alt={blog} class="w-8 h-8 rounded-full" />
            <div class="flex-1 text-left">
              <div class="font-medium group-hover:text-blue-500 transition-colors">{blog}</div>
              <div class="text-sm text-gray-500 dark:text-gray-400">구독자 {Math.floor(Math.random() * 900 + 100)}명</div>
            </div>
          </button>
        </HoverCard.Trigger>
        <HoverCard.Content class="w-72 p-4">
          <div class="flex flex-col space-y-3">
            <div class="flex justify-between space-x-3">
              <Avatar.Root class="h-12 w-12">
                <Avatar.Image src={`https://api.dicebear.com/7.x/initials/svg?seed=${blog}`} alt={blog} />
                <Avatar.Fallback>{blog.slice(0, 2).toUpperCase()}</Avatar.Fallback>
              </Avatar.Root>
              <div class="space-y-1 flex-1">
                <h4 class="text-sm font-semibold dark:text-white">{blog}</h4>
                <p class="text-sm text-gray-600 dark:text-gray-300">기술 블로그</p>
                <div class="flex items-center pt-2">
                  <div class="flex text-xs text-gray-500 dark:text-gray-400">
                    <span class="flex items-center">
                      <span class="font-bold text-gray-900 dark:text-white mr-1">25</span>
                      포스트
                    </span>
                    <span class="mx-2">•</span>
                    <span class="flex items-center">
                      <span class="font-bold text-gray-900 dark:text-white mr-1">1.2k</span>
                      구독자
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div class="flex gap-2">
              <button 
                class="flex-1 px-3 py-1.5 text-sm rounded-lg transition-colors {selectedBlogs.includes(blog) 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : 'bg-blue-500 hover:bg-blue-600 text-white'}"
                on:click={() => toggleBlog(blog)}
              >
                {selectedBlogs.includes(blog) ? '선택 해제' : '선택하기'}
              </button>
              <a 
                href="#" 
                target="_blank" 
                rel="noopener noreferrer" 
                class="flex-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-center"
              >
                블로그로 이동
              </a>
            </div>
          </div>
        </HoverCard.Content>
      </HoverCard.Root>
    {/each}
  </div>
</div> 