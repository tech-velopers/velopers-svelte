<script lang="ts">
  import * as Alert from "$lib/components/ui/alert";
  import { cn } from "$lib/utils";
  import { format } from 'date-fns'; // Import date-fns for formatting

  const today = format(new Date(), 'yyyy-MM-dd'); // Get today's date
</script>

<div class="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
  <h1 class="text-2xl sm:text-3xl font-bold mb-4 sm:mb-8 text-gray-900 dark:text-white">변경사항</h1>
  
  <div class="space-y-3 sm:space-y-5">

    <!-- Add today's changelog entry -->
    <div class="flex gap-1.5 sm:gap-3">
      <div class="w-14 sm:w-20 flex-shrink-0 pt-0.5">
        <p class="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">{today}</p>
      </div>
      <Alert.Root class="flex-1">
        <Alert.Title class="text-base sm:text-lg font-semibold">기능 추가 & UI 개선 📢</Alert.Title>
        <Alert.Description class="text-gray-600 dark:text-gray-300">
          <p class="mt-1 sm:mt-2 text-sm sm:text-base">
            - RSS 피드 안내 페이지(/rss-info)를 추가하고 푸터에 링크를 연결했어요. 요약 RSS 피드를 구독하고 싶으신 경우 클릭해보세요!
          </p>
        </Alert.Description>
      </Alert.Root>
    </div>

    <div class="flex gap-1.5 sm:gap-3">
      <div class="w-14 sm:w-20 flex-shrink-0 pt-0.5">
        <p class="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">2025-04-08</p>
      </div>
      <Alert.Root class="flex-1">
        <Alert.Title class="text-base sm:text-lg font-semibold">기능 업데이트 🎉</Alert.Title>
        <Alert.Description class="text-gray-600 dark:text-gray-300">
          <p class="mt-1 sm:mt-2 text-sm sm:text-base">
            - 혹시 게시글의 태그와 요약 정보가 조금 더 정확해지신 걸 느끼셨나요?
          </p>
          <p class="mt-1 sm:mt-2 text-sm sm:text-base">
            - 이제 firecrawl 데이터를 활용해 게시글의 태그와 요약 정보를 조금 더 정확하게 표시해줘요.
          </p>
        </Alert.Description>

        <Alert.Title class="text-base sm:text-lg font-semibold">기능 업데이트 🎉</Alert.Title>
        <Alert.Description class="text-gray-600 dark:text-gray-300">
          <p class="mt-1 sm:mt-2 text-sm sm:text-base">
            - 블로그별 총 게시글 조회수 표시 기능을 추가했어요. (전체 블로그, 상세 페이지, 호버 카드)
          </p>
          <p class="mt-1 sm:mt-2 text-sm sm:text-base">
            - 전체 블로그 페이지에 조회수 순 정렬 기능을 추가했어요.
          </p>
        </Alert.Description>
        <br>
        <Alert.Title class="text-base sm:text-lg font-semibold">UI 개선 🎨</Alert.Title>
        <Alert.Description class="text-gray-600 dark:text-gray-300">
          <p class="mt-1 sm:mt-2 text-sm sm:text-base">
            - 블로그 카드 및 상세 페이지의 통계 정보(게시글 수, 조회수, 업데이트)를 아이콘과 함께 세로로 표시하도록 개선했어요.
          </p>
        </Alert.Description>
      </Alert.Root>
    </div>

    <div class="flex gap-1.5 sm:gap-3">
      <div class="w-14 sm:w-20 flex-shrink-0 pt-0.5">
        <p class="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">2025-04-07</p>
      </div>
      <Alert.Root class="flex-1">
        <Alert.Title class="text-base sm:text-lg font-semibold">기능 추가 🎉</Alert.Title>
        <Alert.Description class="text-gray-600 dark:text-gray-300">
          <p class="mt-1 sm:mt-2 text-sm sm:text-base">
            검색시 블로그명을 자동완성해줘요!
          </p>
        </Alert.Description>
      </Alert.Root>
    </div>

    <div class="flex gap-1.5 sm:gap-3">
      <div class="w-14 sm:w-20 flex-shrink-0 pt-0.5">
        <p class="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">2025-03-31</p>
      </div>
      <Alert.Root class="flex-1">
        <Alert.Title class="text-base sm:text-lg font-semibold">블로그 추가 🚀</Alert.Title>
        <Alert.Description class="text-gray-600 dark:text-gray-300">
          <p class="mt-1 sm:mt-2 text-sm sm:text-base">
            아래 블로그들을 추가했어요! <br><br>
            카테노이드, 크리에이트립, 토니모리, 직행, QueryPie 추가
          </p>
        </Alert.Description>
      </Alert.Root>
    </div>

    <div class="flex gap-1.5 sm:gap-3">
      <div class="w-14 sm:w-20 flex-shrink-0 pt-0.5">
        <p class="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">2025-03-28</p>
      </div>
      <Alert.Root class="flex-1">
        <Alert.Title class="text-base sm:text-lg font-semibold">버그 수정 🐛</Alert.Title>
        <Alert.Description class="text-gray-600 dark:text-gray-300">
          <p class="mt-1 sm:mt-2 text-sm sm:text-base">
            검색 후 포스트를 봤다가 뒤로가기 누르면 검색 파라미터가 초기화되는 버그를 수정했어요! (드디어!) <br>
          </p>
          <br>
        </Alert.Description>
        <Alert.Title class="text-base sm:text-lg font-semibold">블로그 추가 🚀</Alert.Title>
        <Alert.Description class="text-gray-600 dark:text-gray-300">
          <p class="mt-1 sm:mt-2 text-sm sm:text-base">
            아래 블로그들을 추가했어요! <br><br>
            교보DTS
          </p>
        </Alert.Description>
      </Alert.Root>
    </div>

    <div class="flex gap-1.5 sm:gap-3">
      <div class="w-14 sm:w-20 flex-shrink-0 pt-0.5">
        <p class="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">2025-03-19</p>
      </div>
      <Alert.Root class="flex-1">
        <Alert.Title class="text-base sm:text-lg font-semibold">기능 업데이트 🎉</Alert.Title>
        <Alert.Description class="text-gray-600 dark:text-gray-300">
          <p class="mt-1 sm:mt-2 text-sm sm:text-base">
            카테고리별 인기 게시글을 추가했어요! <br>
          </p>
          <br>
        </Alert.Description>
      </Alert.Root>
    </div>

    <div class="flex gap-1.5 sm:gap-3">
      <div class="w-14 sm:w-20 flex-shrink-0 pt-0.5">
        <p class="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">2025-03-17</p>
      </div>
      <Alert.Root class="flex-1">
        <Alert.Title class="text-base sm:text-lg font-semibold">기능 업데이트 🎉</Alert.Title>
        <Alert.Description class="text-gray-600 dark:text-gray-300">
          <p class="mt-1 sm:mt-2 text-sm sm:text-base">
            각 게시물의 조회수를 추가했어요. <br>
          </p>
          <br>
        </Alert.Description>
        <Alert.Title class="text-base sm:text-lg font-semibold">기능 업데이트 🎉</Alert.Title>
        <Alert.Description class="text-gray-600 dark:text-gray-300">
          <p class="mt-1 sm:mt-2 text-sm sm:text-base">
            주간 인기 게시글을 추가했어요! <br>
          </p>
        </Alert.Description>
      </Alert.Root>
    </div>

    <div class="flex gap-1.5 sm:gap-3">
      <div class="w-14 sm:w-20 flex-shrink-0 pt-0.5">
        <p class="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">2025-03-10</p>
      </div>
      <Alert.Root class="flex-1">
        <Alert.Title class="text-base sm:text-lg font-semibold">기능 업데이트 🎉</Alert.Title>
        <Alert.Description class="text-gray-600 dark:text-gray-300">
          <p class="mt-1 sm:mt-2 text-sm sm:text-base">
            블로그 상세 페이지를 추가했어요! 블로그를 클릭해보세요! <br>
          </p>
          <br>
        </Alert.Description>
        <Alert.Title class="text-base sm:text-lg font-semibold">디자인 개선 🎨</Alert.Title>
        <Alert.Description class="text-gray-600 dark:text-gray-300">
          <p class="mt-1 sm:mt-2 text-sm sm:text-base">
            모바일 환경에서 보기 좋게 디자인을 변경했어요! <br>
          </p>
        </Alert.Description>
      </Alert.Root>
    </div>

    <div class="flex gap-1.5 sm:gap-3">
      <div class="w-14 sm:w-20 flex-shrink-0 pt-0.5">
        <p class="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">2025-03-09</p>
      </div>
      <Alert.Root class="flex-1">
          <Alert.Title class="text-base sm:text-lg font-semibold">블로그 추가 🚀</Alert.Title>
        <Alert.Description class="text-gray-600 dark:text-gray-300">
          <p class="mt-1 sm:mt-2 text-sm sm:text-base">
            아래 블로그들을 추가했어요! <br><br>
            ZUM, VCNC, SK C&C, PRND, NTS, IMQA, CJ온스타일, AWS, AITRICS, AB180, 휴몬랩, 화해, 그린데이터, 핏펫, 핀다, 플라네타리움, 티몬, 티맵모빌리티, 트렌비, 테이블링, 클래스101, 클라우드메이트, 크몽, 코인플러그, 코인원, 카카오헬어샵, 카카오엔터테인먼트FE, 카카오스타일, 일루넥스, 이스트소프트, 유비케어, 원티드, 오토피디아, 오일나우, 엘리시아, NC소프트 DANBI, 엔라이즈, 야놀자클라우드, 아이디어스, 씨앤텍시스템즈, 스타일쉐어, 스퀘어랩, 스캐터랩 핑퐁, 스마일게이트AI, 숨고, 센드버드, 사람인, 빅웨이브에이아이, 블로코, 브랜디, 뷰노, 부스터스, 버즈빌, 무스마, 모히톡, 메가존클라우드, 매스프레소, 매드업, 마키나락스, 뤼이드, 루닛, 로플랫, 레모네이드, 똑똑한개발자, 리멤버, 덴티움, 데이블, 더블유클럽, 꿈많은청년들, 글루시스, 그린랩스, 8퍼센트<br>  
          </p>
          <br>
        </Alert.Description>
        <Alert.Title class="text-base sm:text-lg font-semibold">디자인 개선 🎨</Alert.Title>
        <Alert.Description class="text-gray-600 dark:text-gray-300">
          <p class="mt-1 sm:mt-2 text-sm sm:text-base">
            "모든 블로그" 페이지에서 더욱 보기 좋게 디자인을 변경했어요! <br>
          </p>
        </Alert.Description>
      </Alert.Root>
    </div>

    <div class="flex gap-1.5 sm:gap-3">
      <div class="w-14 sm:w-20 flex-shrink-0 pt-0.5">
        <p class="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">2025-03-03</p>
      </div>
      <Alert.Root class="flex-1">
        <Alert.Title class="text-base sm:text-lg font-semibold">블로그 추가 🚀</Alert.Title>
        <Alert.Description class="text-gray-600 dark:text-gray-300">
          <p class="mt-1 sm:mt-2 text-sm sm:text-base">
            아래 블로그들을 추가했어요! <br><br>
            비브로스, 베스핀글로벌, 컴투스, 롯데온, 모두사인, NHN, 농심DNS, 펫프렌즈, 포스타입, 삼성, SK플래닛, sqoqa, 요기요
          </p>
        </Alert.Description>
      </Alert.Root>
    </div>

    <div class="flex gap-1.5 sm:gap-3">
      <div class="w-14 sm:w-20 flex-shrink-0 pt-0.5">
        <p class="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">2025-02-28</p>
      </div>
      <Alert.Root class="flex-1">
        <Alert.Title class="text-base sm:text-lg font-semibold">블로그 추가 🚀</Alert.Title>
        <Alert.Description class="text-gray-600 dark:text-gray-300">
          <p class="mt-1 sm:mt-2 text-sm sm:text-base">
            아래 블로그들을 추가했어요! <br><br>
            한글과컴퓨터, 딜라이트룸<br>
            제보해주신 thisis****님 감사해요!
          </p>
        </Alert.Description>
      </Alert.Root>
    </div>    
  </div>
</div> 