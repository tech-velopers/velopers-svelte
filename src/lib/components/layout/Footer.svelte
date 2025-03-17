<script>
  import { MessageSquare, PlusCircle, Rss } from 'lucide-svelte';
</script>

<footer class="border-t dark:border-gray-800">
  <div class="container mx-auto px-4 py-8">
    <div class="flex flex-col md:flex-row justify-between items-center gap-4">
      <div class="flex items-center space-x-6">
        <!-- <a href="/" class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm">이용약관</a> -->
        <!-- <a href="/" class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm">개인정보처리방침</a> -->
        <!-- <a href="/" class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm">문의하기</a> -->
        <a href="https://www.velopers.kr/rss.xml" target="_blank" rel="noopener noreferrer" class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm flex items-center">
          <Rss class="w-4 h-4 mr-1" />
          RSS
        </a>
        <a href="https://lifaon.notion.site/1a5525f716f680d3b483db1c5dcca337" target="_blank" rel="noopener noreferrer" class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm flex items-center">
          <PlusCircle class="w-4 h-4 mr-1" />
          원하는 블로그가 없어요
        </a>
        <a href="https://lifaon.notion.site/1a5525f716f680b9920ad2adbe3cff3e" target="_blank" rel="noopener noreferrer" class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm flex items-center">
          <MessageSquare class="w-4 h-4 mr-1" />
          피드백
        </a>
      </div>
      <div class="text-gray-500 dark:text-gray-400 text-sm">
        © 2025 Velopers. All rights reserved.
      </div>
    </div>
  </div>
</footer> 