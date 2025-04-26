<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { onMount } from "svelte";
  import { getApiUrl } from '$lib/config';
  
  // 퀴즈 인터페이스 정의
  interface Quiz {
    id: string;
    question: string;
    answer: string | null;
    category: string;
    who: string | null;
  }
  
  // 상태 변수
  let quizzes: Quiz[] = [];
  let currentIndex = 0;
  let showAnswer = false;
  let isRandomMode = false;
  let isLoading = true;
  
  // 현재 퀴즈
  $: currentQuiz = quizzes[currentIndex] || null;
  
  // 퀴즈 데이터 가져오기
  onMount(async () => {
    try {
      const apiUrl = getApiUrl('/api/quiz');
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error('퀴즈 데이터를 가져오는데 실패했습니다.');
      }
      
      quizzes = await response.json();
      isLoading = false;
    } catch (error) {
      console.error('퀴즈 데이터를 가져오는 중 오류 발생:', error);
      isLoading = false;
    }
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
  
  // 다시하기 - 현재 질문을 랜덤한 위치에 다시 추가
  function repeatQuiz() {
    if (!currentQuiz) return;
    
    // 현재 퀴즈 복사
    const quizToRepeat = { ...currentQuiz };
    
    // 현재 인덱스보다 뒤 위치 중 랜덤한 위치 선택 (최소 2문제 이후)
    const minPosition = Math.min(currentIndex + 2, quizzes.length);
    const maxPosition = quizzes.length;
    
    // 랜덤한 위치 계산 (현재 위치에서 최소 2문제 이후 ~ 마지막 사이)
    const randomPosition = Math.floor(Math.random() * (maxPosition - minPosition + 1)) + minPosition;
    
    // 새 배열 생성하고 선택된 위치에 현재 퀴즈 삽입
    const newQuizzes = [...quizzes];
    newQuizzes.splice(randomPosition, 0, quizToRepeat);
    
    // 퀴즈 배열 업데이트
    quizzes = newQuizzes;
    
    // 다음 퀴즈로 이동
    nextQuiz();
  }
</script>

<div class="container mx-auto px-4 py-6 max-w-3xl pb-24">
  <h1 class="text-2xl font-bold mb-6 text-center dark:text-white">면접 질문 퀴즈</h1>
  
  {#if isLoading}
    <div class="text-center py-10">
      <p class="text-gray-500 dark:text-gray-400">퀴즈를 불러오는 중...</p>
    </div>
  {:else if quizzes.length === 0}
    <div class="text-center py-10">
      <p class="text-gray-500 dark:text-gray-400">퀴즈 데이터가 없습니다.</p>
    </div>
  {:else if currentQuiz}
    <div class="mb-4 flex items-center">
      <span class="text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 px-2 py-1 rounded-md">
        {currentQuiz.category}
      </span>
      {#if currentQuiz.who}
        <span class="text-sm bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 px-2 py-1 rounded-md ml-2">
          {currentQuiz.who}
        </span>
      {/if}
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
            {#if currentQuiz.answer}
              <p class="whitespace-pre-line dark:text-white text-sm leading-relaxed">{currentQuiz.answer}</p>
            {:else}
              <p class="text-center text-gray-500 dark:text-gray-400 text-sm">답변이 제공되지 않은 질문입니다.</p>
            {/if}
          {:else}
            <p class="text-center text-gray-500 dark:text-gray-400 text-sm">👆 답변을 확인하려면 아래 답변 보기 버튼을 클릭하세요</p>
          {/if}
        </div>
      </div>
    </div>
  {/if}
  
  <!-- 푸터 대체 고정 버튼 -->
  <div class="fixed bottom-4 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-3 shadow-md z-20">
    <div class="container mx-auto max-w-3xl flex justify-between gap-2">
      <Button 
        variant="default" 
        on:click={toggleAnswer}
        disabled={quizzes.length === 0}
        class="flex-1 text-white font-medium"
      >
        답변 {showAnswer ? '가리기' : '보기'}
      </Button>
      
      <Button 
        variant="outline" 
        on:click={nextQuiz} 
        disabled={currentIndex === quizzes.length - 1 || quizzes.length === 0}
        class="flex-1"
      >
        넘어가기
      </Button>
      
      <Button 
        variant="secondary" 
        on:click={repeatQuiz} 
        disabled={quizzes.length === 0}
        class="flex-1"
      >
        다시하기
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