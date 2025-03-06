<script lang="ts">
  import * as Alert from "$lib/components/ui/alert";
  import { cn } from "$lib/utils";
</script>

<div class="container mx-auto px-4 py-8">
  <h1 class="text-3xl font-bold mb-8 text-gray-900 dark:text-white">변경사항</h1>
  
  <div class="space-y-6">

    <div class="flex gap-4">
      <div class="w-24 flex-shrink-0 pt-1">
        <p class="text-sm font-medium text-gray-500 dark:text-gray-400">2025-03-03</p>
      </div>
      <Alert.Root class="flex-1">
        <Alert.Title class="text-lg font-semibold">블로그 추가 🚀</Alert.Title>
        <Alert.Description>
          <p class="mt-2">
            아래 블로그들을 추가했어요! <br>
            비브로스, 베스핀글로벌, 컴투스, 롯데온, 모두사인, NHN, 농심DNS, 펫프렌즈, 포스타입, 삼성, SK플래닛, sqoqa, 요기요
          </p>
        </Alert.Description>
      </Alert.Root>
    </div>

    <div class="flex gap-4">
        <div class="w-24 flex-shrink-0 pt-1">
          <p class="text-sm font-medium text-gray-500 dark:text-gray-400">2025-02-28</p>
        </div>
        <Alert.Root class="flex-1">
          <Alert.Title class="text-lg font-semibold">블로그 추가 🚀</Alert.Title>
          <Alert.Description>
            <p class="mt-2">
              아래 블로그들을 추가했어요! <br>
              한글과컴퓨터, 딜라이트룸<br>
              제보해주신 thisis****님 감사해요!
            </p>
          </Alert.Description>
        </Alert.Root>
      </div>

  </div>
</div> 