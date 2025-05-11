<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Textarea } from "$lib/components/ui/textarea";
  import { onMount } from "svelte";
  import { getApiUrl } from '$lib/config';
  
  const QUIZ_PROGRESS_KEY = 'velopersQuizProgress';

  interface SavedProgress {
    currentIndex: number;
    selectedCategories: string[];
    isRandomMode: boolean;
    isAuthenticated: boolean;
  }

  // Debounce utility function
  function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    const debounced = (...args: Parameters<F>) => {
      if (timeout !== null) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(() => {
        func(...args);
      }, waitFor);
    };
    return debounced as (...args: Parameters<F>) => ReturnType<F>;
  }
  
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

  // 카테고리 필터 상태
  let selectedCategories: string[] = [];
  let allUniqueCategories: string[] = [];
  let isCategoryFilterOpen = false; // 카테고리 필터 접힘/펼침 상태

  // 필터링된 퀴즈 목록
  $: filteredQuizzes = selectedCategories.length === 0
    ? quizzes
    : quizzes.filter(quiz => {
        if (!quiz.category) return false;
        const quizCatsLower = quiz.category.split(',').map(c => c.trim().toLowerCase()).filter(c => c);
        const selectedCatsLower = selectedCategories.map(sc => sc.trim().toLowerCase());
        return quizCatsLower.some(qcl => selectedCatsLower.includes(qcl));
      });
  
  // 현재 퀴즈 (필터링된 목록 기준)
  $: currentQuiz = filteredQuizzes[currentIndex] || null;

  // 고유 카테고리 목록 생성
  $: {
    const categorySet = new Set<string>();
    quizzes.forEach(quiz => {
      if (quiz.category) {
        quiz.category.split(',').forEach(cat => {
          const trimmedCat = cat.trim();
          if (trimmedCat) {
            categorySet.add(trimmedCat);
          }
        });
      }
    });
    allUniqueCategories = Array.from(categorySet).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
  }
  
  // 퀴즈 데이터 가져오기 및 상태 복원
  onMount(async () => {
    let loadedAuth = false;
    let progressToRestore: SavedProgress | null = null;

    if (typeof window !== 'undefined' && window.localStorage) {
      const savedProgressString = localStorage.getItem(QUIZ_PROGRESS_KEY);
      if (savedProgressString) {
        try {
          const parsed = JSON.parse(savedProgressString) as SavedProgress;
          if (parsed.isAuthenticated) {
            isAuthenticated = true;
            loadedAuth = true;
            progressToRestore = parsed;
          } else {
          }
        } catch (e) {
          localStorage.removeItem(QUIZ_PROGRESS_KEY);
        }
      }
    }

    isLoading = true;
    try {
      const apiUrl = getApiUrl('/api/quiz');
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error('퀴즈 데이터를 가져오는데 실패했습니다.');
      }
      quizzes = await response.json();

      if (loadedAuth && progressToRestore) {
        selectedCategories = progressToRestore.selectedCategories || [];
        isRandomMode = progressToRestore.isRandomMode || false;
        
        await new Promise(resolve => setTimeout(resolve, 0)); 

        const targetIndex = progressToRestore.currentIndex || 0;
        if (targetIndex >= 0 && targetIndex < filteredQuizzes.length) {
          currentIndex = targetIndex;
        } else if (filteredQuizzes.length > 0) {
          currentIndex = 0; 
        } else {
          currentIndex = 0; 
        }
        showAnswer = false;
      } else {
        console.log('[Quiz] onMount: No progress to restore or not authenticated from storage.');
      }
    } catch (error) {
      console.error('[Quiz] onMount: Error fetching quiz data:', error);
    } finally {
      isLoading = false;
      console.log('[Quiz] onMount: isLoading set to false.');
    }
  });
  
  // 진행 상황 저장 (즉시 실행)
  const saveProgressToLocalStorage = () => {
    console.log(`[Quiz] saveProgress: Attempting to save. isAuthenticated: ${isAuthenticated}, isLoading: ${isLoading}`);
    if (isAuthenticated && !isLoading && typeof window !== 'undefined' && window.localStorage) {
      const progress: SavedProgress = {
        currentIndex,
        selectedCategories,
        isRandomMode,
        isAuthenticated,
      };
      try {
        localStorage.setItem(QUIZ_PROGRESS_KEY, JSON.stringify(progress));
        console.log('[Quiz] saveProgress: Successfully saved to localStorage:', progress);
      } catch (e) {
        console.error('[Quiz] saveProgress: Error saving to localStorage:', e);
      }
    } else {
      console.log('[Quiz] saveProgress: Conditions not met for saving (or window/localStorage not available).');
    }
  };

  $: if (typeof window !== 'undefined') {
    // 이 로그는 반응형 블록이 실행될 때마다 기록됩니다.
    console.log(`[Quiz] Reactive save trigger block. isAuthenticated: ${isAuthenticated}, currentIndex: ${currentIndex}, isLoading: ${isLoading}`);
    saveProgressToLocalStorage();
  }
  
  // 배열 섞기 함수 (피셔-예이츠 알고리즘)
  function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
  
  // 다음 퀴즈로 이동 (필터링된 목록 기준)
  function nextQuiz() {
    if (currentIndex < filteredQuizzes.length - 1) {
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
    quizzes = shuffleArray(quizzes); // 전체 퀴즈 배열 섞기
    currentIndex = 0; // 필터링된 목록의 처음으로
    showAnswer = false;
    isRandomMode = true;
  }
  
  // 다시하기 - 현재 질문을 랜덤한 위치에 다시 추가
  function repeatQuiz() {
    if (!currentQuiz) return;
    
    const quizToRepeat = { ...currentQuiz };
    
    const minPosition = Math.min(currentIndex + 5, quizzes.length);
    const maxPosition = quizzes.length;
    const randomPosition = Math.floor(Math.random() * (maxPosition - minPosition + 1)) + minPosition;
    
    const newQuizzes = [...quizzes];
    newQuizzes.splice(randomPosition, 0, quizToRepeat);
    
    quizzes = newQuizzes;
    // nextQuiz() 호출 시 filteredQuizzes 기준으로 동작
    nextQuiz();
  }

  // 비밀번호 확인 함수
  function checkPassword() {
    if (passwordInput === correctPassword) {
      isAuthenticated = true;
      console.log('[Quiz] checkPassword: Password correct, isAuthenticated set to true.');
    } else {
      alert('비밀번호가 틀렸습니다.');
      passwordInput = '';
      console.log('[Quiz] checkPassword: Password incorrect.');
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
    showAnswer = true; // 수정 시 답변 보이도록
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
      const savedQuizId = savedQuiz.id;

      // 로컬 데이터 업데이트
      quizzes = quizzes.map(quiz => 
        quiz.id === savedQuizId ? savedQuiz : quiz
      );
      isEditing = false;

      // Adjust currentIndex after quiz data changes
      const editedQuizIdxInFiltered = filteredQuizzes.findIndex(q => q.id === savedQuizId);
      if (editedQuizIdxInFiltered !== -1) {
        currentIndex = editedQuizIdxInFiltered;
      } else {
        if (filteredQuizzes.length === 0) {
          currentIndex = 0;
        } else {
          currentIndex = Math.min(currentIndex, filteredQuizzes.length - 1);
          if (currentIndex < 0) currentIndex = 0;
        }
      }
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
      
      quizzes = [...quizzes, createdQuiz];
      isCreating = false;
      
      const newQuizId = createdQuiz.id;
      const idxInFiltered = filteredQuizzes.findIndex(q => q.id === newQuizId);

      if (idxInFiltered !== -1) {
        currentIndex = idxInFiltered;
        showAnswer = false;
      } else {
        if (filteredQuizzes.length === 0) {
          currentIndex = 0;
        } else if (currentIndex >= filteredQuizzes.length) {
          currentIndex = filteredQuizzes.length - 1;
        }
      }
    } catch (error) {
      console.error('퀴즈 생성 중 오류 발생:', error);
      alert('퀴즈 생성 중 오류가 발생했습니다.');
    }
  }

  // 카테고리 선택/해제 함수
  function toggleCategory(categoryToToggle: string) {
    const index = selectedCategories.indexOf(categoryToToggle);
    if (index > -1) {
      selectedCategories = selectedCategories.filter(c => c !== categoryToToggle);
    } else {
      selectedCategories = [...selectedCategories, categoryToToggle];
    }
    currentIndex = 0; // 필터 변경 시 첫 번째 퀴즈로
    showAnswer = false;
  }

  // 카테고리 필터 토글 함수
  function toggleCategoryFilter() {
    isCategoryFilterOpen = !isCategoryFilterOpen;
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
              placeholder="카테고리 (필수, 쉼표로 여러개 가능)"
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
            <Textarea
              id="new-answer"
              bind:value={newAnswer}
              placeholder="답변 (선택)"
              class="w-full dark:bg-gray-700 dark:text-white min-h-[100px]"
              rows={3}
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
        <p class="text-gray-500 dark:text-gray-400">퀴즈 데이터가 없습니다. 새 퀴즈를 만들어보세요!</p>
      </div>
    {:else}
      <!-- 카테고리 필터 토글 버튼 -->
      <div class="mb-2">
        <Button 
          variant="outline"
          on:click={toggleCategoryFilter} 
          class="w-full text-sm py-2"
        >
          {isCategoryFilterOpen ? '카테고리 필터 닫기' : '카테고리 필터 열기'}
          <span class="ml-2">{isCategoryFilterOpen ? '▲' : '▼'}</span>
        </Button>
      </div>

      <!-- 카테고리 필터 UI (접힘/펼침 가능) -->
      {#if isCategoryFilterOpen}
        <div class="mb-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-md shadow">
          <h3 class="text-md font-semibold mb-2 dark:text-gray-200">카테고리 필터</h3>
          {#if allUniqueCategories.length > 0}
            <div class="flex flex-wrap gap-2">
              {#each allUniqueCategories as category}
                <Button
                  variant={selectedCategories.includes(category) ? 'default' : 'outline'}
                  on:click={() => toggleCategory(category)}
                  class="text-xs py-1 px-2 h-auto"
                >
                  {category}
                </Button>
              {/each}
            </div>
          {:else}
            <p class="text-sm text-gray-500 dark:text-gray-400">사용 가능한 카테고리가 없습니다.</p>
          {/if}
        </div>
      {/if}

      {#if filteredQuizzes.length === 0 && selectedCategories.length > 0}
        <div class="text-center py-10">
          <p class="text-gray-500 dark:text-gray-400">선택된 카테고리에 해당하는 퀴즈가 없습니다.</p>
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
            disabled={isEditing || quizzes.length === 0}
          >
            랜덤
          </Button>
          {#if !isEditing}  
          <Button 
            variant="secondary" 
            on:click={startEditing} 
            disabled={!currentQuiz}
            class="text-xs py-1 px-2 h-auto ml-1"
          >
            수정
          </Button>
          <span class="ml-auto text-sm text-gray-500 dark:text-gray-400 mr-2">
            {filteredQuizzes.length > 0 ? currentIndex + 1 : 0} / {filteredQuizzes.length}
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
      {:else if quizzes.length > 0 && filteredQuizzes.length === 0 && selectedCategories.length === 0}
        <!-- 이 경우는 quizzes는 있으나 filteredQuizzes가 0인 초기 상태 (모두 필터링된 것과 다름) -->
        <!-- 혹은 로직상 currentQuiz가 null이지만 filteredQuizzes가 0이 아닌 경우도 있을 수 있으므로 -->
        <!-- currentQuiz가 없을 때의 fallback으로 두는 것이 안전할 수 있습니다. -->
        <!-- 하지만 위의 filteredQuizzes.length === 0 && selectedCategories.length > 0 조건에서 이미 처리됨 -->
        <!-- 만약 quizzes는 있는데 filteredQuizzes가 0이고, selectedCategories도 0이면 뭔가 이상한 상태 -->
        <!-- 일단 주석 처리 -->
        <!-- <div class="text-center py-10"><p class="text-gray-500 dark:text-gray-400">퀴즈를 표시할 수 없습니다.</p></div> -->
      {/if} <!-- currentQuiz 종료 -->
    {/if} <!-- isLoading 또는 quizzes.length === 0 종료 -->
    
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
            disabled={!currentQuiz}
            class="flex-grow text-white font-medium"
          >
            답변 {showAnswer ? '가리기' : '보기'}
          </Button>
          
          <Button 
            variant="outline" 
            on:click={nextQuiz} 
            disabled={!currentQuiz || currentIndex === filteredQuizzes.length - 1}
            class="flex-grow"
          >
            넘어가기
          </Button>
          
          <Button 
            variant="secondary" 
            on:click={repeatQuiz} 
            disabled={!currentQuiz}
            class="flex-grow"
          >
            다시하기
          </Button>
        {/if}
      </div>
    </div>
  {/if} <!-- !isAuthenticated 종료 -->
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

  /* 질문과 답변 텍스트 선택 가능하도록 수정 */
  .question-container h2,
  .answer-container p {
    -webkit-user-select: text;
    user-select: text;
  }
</style> 