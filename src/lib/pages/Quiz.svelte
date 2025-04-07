<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { onMount } from "svelte";
  
  // 퀴즈 인터페이스 정의
  interface Quiz {
    id: number;
    question: string;
    answer: string;
    category: string;
  }
  
  // 목업 퀴즈 데이터
  const mockQuizzes: Quiz[] = [
    { 
      id: 1, 
      question: "자바스크립트에서 클로저(Closure)란 무엇인가요?", 
      answer: "클로저는 함수와 그 함수가 선언된 렉시컬 환경의 조합입니다. 내부함수가 외부함수의 변수에 접근할 수 있으며, 외부함수의 실행이 끝난 후에도 내부함수가 외부함수의 변수에 접근할 수 있는 메커니즘입니다.", 
      category: "JavaScript" 
    },
    { 
      id: 2, 
      question: "React에서 Virtual DOM이란 무엇이며, 어떤 장점이 있나요?", 
      answer: "Virtual DOM은 실제 DOM의 가벼운 복사본입니다. React는 상태 변경 시 Virtual DOM을 새로 생성하고 이전 Virtual DOM과 비교하여 실제 DOM에 최소한의 변경만 적용합니다. 이는 성능 최적화에 도움이 되며, UI 업데이트를 효율적으로 처리할 수 있게 합니다.", 
      category: "React" 
    },
    { 
      id: 3, 
      question: "HTTP와 HTTPS의 차이점은 무엇인가요?", 
      answer: "HTTP는 HyperText Transfer Protocol로 웹에서 데이터를 주고받는 프로토콜입니다. HTTPS는 HTTP에 SSL/TLS 암호화가 추가된 프로토콜로 보안이 강화되었습니다. HTTPS는 데이터 전송 시 암호화되어 보안성이 높고, SEO에도 유리합니다.", 
      category: "Network" 
    },
    { 
      id: 4, 
      question: "RESTful API의 주요 원칙은 무엇인가요?", 
      answer: "1. 자원(Resource) 기반 URL 구조\n2. HTTP 메소드(GET, POST, PUT, DELETE 등)를 통한 자원 조작\n3. 상태를 저장하지 않는 무상태(Stateless) 통신\n4. 캐시 가능성(Cacheability)\n5. 계층화된 시스템(Layered System)", 
      category: "API" 
    },
    { 
      id: 5, 
      question: "CSS Box Model에 대해 설명해주세요.", 
      answer: "CSS Box Model은 HTML 요소가 웹 페이지에서 차지하는 공간을 정의하는 모델입니다. 네 가지 영역으로 구성됩니다:\n1. Content: 콘텐츠가 표시되는 영역\n2. Padding: 콘텐츠와 테두리 사이의 여백\n3. Border: 패딩 주변의 테두리\n4. Margin: 테두리 바깥쪽의 여백", 
      category: "CSS" 
    }
  ];
  
  // 상태 변수
  let quizzes: Quiz[] = [];
  let currentIndex = 0;
  let showAnswer = false;
  let isRandomMode = false;
  
  // 현재 퀴즈
  $: currentQuiz = quizzes[currentIndex] || null;
  
  // 퀴즈 데이터 가져오기 (실제로는 API 호출)
  onMount(() => {
    // 실제 구현에서는 fetch('/api/quiz')로 변경
    quizzes = [...mockQuizzes];
  });
  
  // 배열 섞기 함수 (피셔-예이츠 알고리즘)
  function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
  
  // 다음 퀴즈로 이동
  function nextQuiz() {
    if (currentIndex < quizzes.length - 1) {
      currentIndex += 1;
      showAnswer = false;
    }
  }
  
  // 이전 퀴즈로 이동
  function prevQuiz() {
    if (currentIndex > 0) {
      currentIndex -= 1;
      showAnswer = false;
    }
  }
  
  // 답변 표시 토글
  function toggleAnswer() {
    showAnswer = !showAnswer;
  }
  
  // 랜덤 퀴즈 모드 전환
  function randomQuiz() {
    // 전체 퀴즈 배열 섞기
    quizzes = shuffleArray(quizzes);
    currentIndex = 0;
    showAnswer = false;
    isRandomMode = true;
  }
</script>

<div class="container mx-auto px-4 py-6 max-w-3xl pb-24">
  <h1 class="text-2xl font-bold mb-6 text-center dark:text-white">면접 질문 퀴즈</h1>
  
  {#if currentQuiz}
    <div class="mb-4 flex items-center">
      <span class="text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 px-2 py-1 rounded-md">
        {currentQuiz.category}
      </span>
      <span class="ml-auto text-sm text-gray-500 dark:text-gray-400 mr-2">
        {currentIndex + 1} / {quizzes.length}
      </span>
      <Button 
        variant={isRandomMode ? "default" : "secondary"}
        on:click={randomQuiz}
        class="text-xs py-1 px-2 h-auto"
      >
        랜덤
      </Button>
    </div>
    
    <div class="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-md mb-6">
      <div class="question-container min-h-[120px] flex items-center mb-3">
        <h2 class="text-lg font-semibold dark:text-white">
          {currentQuiz.question}
        </h2>
      </div>
      
      <div 
        class="answer-container w-full bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 transition-colors flex items-center"
      >
        <div class="w-full">
          {#if showAnswer}
            <p class="whitespace-pre-line dark:text-white text-sm leading-relaxed">{currentQuiz.answer}</p>
          {:else}
            <p class="text-center text-gray-500 dark:text-gray-400 text-sm">👆 답변을 확인하려면 아래 답변 보기 버튼을 클릭하세요</p>
          {/if}
        </div>
      </div>
    </div>
  {:else}
    <div class="text-center py-10">
      <p class="text-gray-500 dark:text-gray-400">퀴즈를 불러오는 중...</p>
    </div>
  {/if}
  
  <!-- 푸터 대체 고정 버튼 -->
  <div class="fixed bottom-4 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-3 shadow-md z-20">
    <div class="container mx-auto max-w-3xl flex justify-between gap-2">
      <Button 
        variant="outline" 
        on:click={prevQuiz} 
        disabled={currentIndex === 0}
        class="flex-1"
      >
        이전
      </Button>
      
      <Button 
        variant="default" 
        on:click={toggleAnswer}
        class="flex-1 text-white font-medium"
      >
        답변 {showAnswer ? '가리기' : '보기'}
      </Button>
      
      <Button 
        variant="outline" 
        on:click={nextQuiz} 
        disabled={currentIndex === quizzes.length - 1 || !currentQuiz}
        class="flex-1"
      >
        다음
      </Button>
    </div>
  </div>
</div>

<style>
  .answer-container {
    min-height: 250px;
  }
  
  .question-container {
    min-height: 120px;
  }
  
  /* 모바일 최적화 스타일 */
  @media (max-width: 640px) {
    h1 {
      font-size: 1.5rem;
      margin-bottom: 1rem;
    }
    
    h2 {
      font-size: 1.1rem;
    }
    
    .container {
      padding-left: 0.75rem;
      padding-right: 0.75rem;
    }
    
    .question-container {
      min-height: 100px;
    }
    
    .answer-container {
      min-height: 220px;
    }
  }
</style> 