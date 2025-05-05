<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Textarea } from "$lib/components/ui/textarea";
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
  let isAuthenticated = false;
  let passwordInput = '';
  const correctPassword = '4120';
  let isEditing = false;
  let editedQuestion = '';
  let editedAnswer = '';
  let isCreating = false;
  let newQuestion = '';
  let newAnswer = '';
  let newCategory = '';
  let newWho = '';
  
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
    
    // 현재 인덱스보다 뒤 위치 중 랜덤한 위치 선택 (최소 5문제 이후)
    const minPosition = Math.min(currentIndex + 5, quizzes.length);
    const maxPosition = quizzes.length;
    
    // 랜덤한 위치 계산 (현재 위치에서 최소 5문제 이후 ~ 마지막 사이)
    const randomPosition = Math.floor(Math.random() * (maxPosition - minPosition + 1)) + minPosition;
    
    // 새 배열 생성하고 선택된 위치에 현재 퀴즈 삽입
    const newQuizzes = [...quizzes];
    newQuizzes.splice(randomPosition, 0, quizToRepeat);
    
    // 퀴즈 배열 업데이트
    quizzes = newQuizzes;
    
    // 다음 퀴즈로 이동
    nextQuiz();
  }

  // 비밀번호 확인 함수
  function checkPassword() {
    if (passwordInput === correctPassword) {
      isAuthenticated = true;
    } else {
      alert('비밀번호가 틀렸습니다.');
      passwordInput = '';
    }
  }

  // Enter 키로 비밀번호 확인
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      checkPassword();
    }
  }

  // 수정 모드 진입
  function startEditing() {
    if (!currentQuiz) return;
    isEditing = true;
    editedQuestion = currentQuiz.question;
    editedAnswer = currentQuiz.answer || '';
    showAnswer = true;
  }

  // 수정 취소
  function cancelEditing() {
    isEditing = false;
  }

  // 퀴즈 수정 API 호출
  async function saveChanges() {
    if (!currentQuiz) return;

    const updatedQuizData = {
      ...currentQuiz,
      question: editedQuestion,
      answer: editedAnswer,
    };

    try {
      const apiUrl = getApiUrl(`/api/quiz/${currentQuiz.id}`);
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedQuizData),
      });

      if (!response.ok) {
        throw new Error('퀴즈 수정에 실패했습니다.');
      }

      const savedQuiz = await response.json();

      // 로컬 데이터 업데이트
      quizzes = quizzes.map(quiz => 
        quiz.id === savedQuiz.id ? savedQuiz : quiz
      );
      isEditing = false;
      quizzes = [...quizzes];

      alert('퀴즈가 성공적으로 수정되었습니다.');

    } catch (error) {
      console.error('퀴즈 수정 중 오류 발생:', error);
      alert('퀴즈 수정 중 오류가 발생했습니다.');
    }
  }

  // 새 퀴즈 생성 모드 진입
  function startCreating() {
    isCreating = true;
    newQuestion = '';
    newAnswer = '';
    newCategory = '';
    newWho = '';
  }

  // 생성 취소
  function cancelCreating() {
    isCreating = false;
  }

  // 새 퀴즈 저장 API 호출
  async function saveNewQuiz() {
    if (!newQuestion || !newCategory) {
      alert('질문과 카테고리는 필수 입력 사항입니다.');
      return;
    }

    const newQuizData = {
      question: newQuestion,
      answer: newAnswer || null,
      category: newCategory,
      who: newWho || null
    };

    try {
      const apiUrl = getApiUrl('/api/quiz');
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newQuizData),
      });

      if (!response.ok) {
        throw new Error('퀴즈 생성에 실패했습니다.');
      }

      const createdQuiz = await response.json();

      // 새 퀴즈를 배열에 추가
      quizzes = [...quizzes, createdQuiz];
      
      // 새로 생성된 퀴즈로 이동
      currentIndex = quizzes.length - 1;
      isCreating = false;
      
      alert('새 퀴즈가 성공적으로 생성되었습니다.');

    } catch (error) {
      console.error('퀴즈 생성 중 오류 발생:', error);
      alert('퀴즈 생성 중 오류가 발생했습니다.');
    }
  }
</script>

<div class="container mx-auto px-4 py-6 max-w-3xl pb-24">
  
  {#if !isAuthenticated}
    <div class="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
      <h2 class="text-xl font-semibold mb-4 dark:text-white">비밀번호 입력</h2>
      <div class="flex gap-2">
        <Input 
          type="password" 
          bind:value={passwordInput} 
          on:keydown={handleKeydown}
          placeholder="비밀번호"
          class="w-40 dark:bg-gray-700 dark:text-white"
        />
        <Button on:click={checkPassword}>확인</Button>
      </div>
    </div>
  {:else}
    {#if isCreating}
      <!-- 퀴즈 생성 폼 -->
      <div class="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-md mb-6">
        <h2 class="text-xl font-semibold mb-4 dark:text-white">새 퀴즈 만들기</h2>
        
        <div class="space-y-4">
          <div>
            <label for="new-category" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">카테고리 *</label>
            <Input 
              id="new-category"
              type="text" 
              bind:value={newCategory} 
              placeholder="카테고리 (필수)"
              class="w-full dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <div>
            <label for="new-who" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">작성자</label>
            <Input 
              id="new-who"
              type="text" 
              bind:value={newWho} 
              placeholder="작성자 (선택)"
              class="w-full dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <div>
            <label for="new-question" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">질문 *</label>
            <Input
              id="new-question"
              type="text"
              bind:value={newQuestion}
              placeholder="질문 (필수)"
              class="w-full dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <div>
            <label for="new-answer" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">답변</label>
            <Input
              id="new-answer"
              type="text"
              bind:value={newAnswer}
              placeholder="답변 (선택)"
              class="w-full dark:bg-gray-700 dark:text-white min-h-[100px]"
            />
          </div>
          
          <div class="flex space-x-2 pt-2">
            <Button 
              variant="destructive" 
              on:click={cancelCreating} 
              class="flex-1"
            >
              취소
            </Button>
            <Button 
              variant="default" 
              on:click={saveNewQuiz} 
              class="flex-1"
            >
              저장
            </Button>
          </div>
        </div>
      </div>
    {:else if isLoading}
      <div class="text-center py-10">
        <p class="text-gray-500 dark:text-gray-400">퀴즈를 불러오는 중...</p>
      </div>
    {:else if quizzes.length === 0}
      <div class="text-center py-10">
        <p class="text-gray-500 dark:text-gray-400">퀴즈 데이터가 없습니다.</p>
      </div>
    {:else if currentQuiz}
      <div class="mb-2 flex items-center">
        <span class="text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 px-2 py-1 rounded-md">
          {currentQuiz.category}
        </span>
        {#if currentQuiz.who}
          <span class="text-sm bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 px-2 py-1 rounded-md ml-2">
            {currentQuiz.who}
          </span>
        {/if}
      </div>
      
      <!-- 퀴즈 컨트롤 -->
      <div class="mb-4 flex items-center justify-end">

        <Button 
          variant="outline"
          on:click={startCreating}
          class="text-xs py-1 px-2 h-auto mr-1"
        >
          새 퀴즈
        </Button>
        <Button 
          variant={isRandomMode ? "default" : "secondary"}
          on:click={randomQuiz}
          class="text-xs py-1 px-2 h-auto"
          disabled={isEditing}
        >
          랜덤
        </Button>
        {#if !isEditing}  
        <Button 
          variant="secondary" 
          on:click={startEditing} 
          disabled={quizzes.length === 0}
          class="text-xs py-1 px-2 h-auto ml-1"
        >
          수정
        </Button>
        <span class="ml-auto text-sm text-gray-500 dark:text-gray-400 mr-2">
          {currentIndex + 1} / {quizzes.length}
        </span>
        {/if}
      </div>
      
      <!-- 구분선 -->
      <div class="border-t border-gray-200 dark:border-gray-700 mb-3"></div>

      <div class="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 md:p-5 shadow-sm hover:shadow-md mb-4 sm:mb-6">
        <div class="question-container min-h-[120px] flex items-center mb-3">
          {#if isEditing}
            <Textarea 
              bind:value={editedQuestion} 
              class="w-full dark:bg-gray-700 dark:text-white text-lg font-semibold resize-none focus:ring-blue-500 focus:border-blue-500" 
              rows={3}
            />
          {:else}
            <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-100">
              {currentQuiz.question}
            </h2>
          {/if}
        </div>
        
        <div 
          class="answer-container w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4 flex items-center"
        >
          <div class="w-full">
            {#if showAnswer || isEditing}
              {#if isEditing}
                <Textarea 
                  bind:value={editedAnswer} 
                  class="w-full dark:bg-gray-700 dark:text-white text-sm leading-relaxed resize-none focus:ring-blue-500 focus:border-blue-500"
                  rows={10}
                />
              {:else if currentQuiz.answer}
                <p class="whitespace-pre-line text-gray-600 dark:text-gray-300 text-xs leading-relaxed">{currentQuiz.answer}</p>
              {:else}
                <p class="text-center text-gray-500 dark:text-gray-400 text-xs">답변이 제공되지 않은 질문입니다.</p>
              {/if}
            {:else}
              <p class="text-center text-gray-500 dark:text-gray-400 text-xs">👆 답변을 확인하려면 아래 답변 보기 버튼을 클릭하세요</p>
            {/if}
          </div>
        </div>
      </div>
    {/if}
    
    <!-- 푸터 대체 고정 버튼 -->
    <div class="fixed bottom-4 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-3 shadow-md z-20">
      <div class="container mx-auto max-w-3xl flex justify-between gap-2 flex-wrap">
        {#if isEditing}
          <Button 
            variant="destructive" 
            on:click={cancelEditing} 
            class="flex-1"
          >
            취소
          </Button>
          <Button 
            variant="default" 
            on:click={saveChanges} 
            class="flex-1"
          >
            저장
          </Button>
        {:else}
          <Button 
            variant="default" 
            on:click={toggleAnswer}
            disabled={quizzes.length === 0}
            class="flex-grow text-white font-medium"
          >
            답변 {showAnswer ? '가리기' : '보기'}
          </Button>
          
          <Button 
            variant="outline" 
            on:click={nextQuiz} 
            disabled={currentIndex === quizzes.length - 1 || quizzes.length === 0}
            class="flex-grow"
          >
            넘어가기
          </Button>
          
          <Button 
            variant="secondary" 
            on:click={repeatQuiz} 
            disabled={quizzes.length === 0}
            class="flex-grow"
          >
            다시하기
          </Button>
        {/if}
      </div>
    </div>
  {/if}
</div>

<style>
  .answer-container {
    min-height: 220px;
  }
  
  .question-container {
    min-height: 100px;
  }
  
  /* 모바일 최적화 스타일 */
  @media (max-width: 640px) {
    h2 {
      font-size: 1.1rem;
    }
    
    .container {
      padding-left: 0.75rem;
      padding-right: 0.75rem;
    }
    
    .question-container {
      min-height: 80px;
      margin-bottom: 0.5rem;
    }
    
    .answer-container {
      min-height: 200px;
      padding: 0.75rem;
    }

    .fixed.bottom-4 {
      bottom: 0.5rem;
    }
  }

  /* 모바일에서 더블클릭 시 확대 방지 */
  :global(html) {
    touch-action: manipulation;
    -webkit-touch-callout: none;
    -webkit-tap-highlight-color: transparent;
  }
  
  :global(*) {
    -webkit-user-select: none;
    user-select: none;
  }
  
  :global(input), :global(textarea) {
    -webkit-user-select: auto;
    user-select: auto;
  }
</style> 