<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Textarea } from "$lib/components/ui/textarea";
  import { onMount, onDestroy } from "svelte";
  import { getApiUrl } from '$lib/config';
  import { fade, slide } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  
  const QUIZ_PROGRESS_KEY = 'velopersQuizProgress';

  interface SavedProgress {
    currentIndex: number;
    selectedCategories: string[];
    isRandomMode: boolean;
    isAuthenticated: boolean;
    quizOrder?: string[]; // 퀴즈 ID 순서 저장
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

  // UI 개선을 위한 추가 상태 변수
  let showNotification = false;
  let notificationMessage = '';
  let notificationType: 'success' | 'error' | 'info' = 'info';

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

  // 진행률 계산
  $: progressPercentage = filteredQuizzes.length > 0 
    ? Math.round((currentIndex + 1) / filteredQuizzes.length * 100) 
    : 0;

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
  
  // 알림 표시 함수
  function showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
    notificationMessage = message;
    notificationType = type;
    showNotification = true;
    
    setTimeout(() => {
      showNotification = false;
    }, 3000);
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
        // 랜덤 모드였고, 저장된 퀴즈 순서가 있다면 quizzes 배열을 재정렬합니다.
        if (progressToRestore.isRandomMode && progressToRestore.quizOrder && progressToRestore.quizOrder.length > 0) {
          const orderedQuizIdsFromStorage = progressToRestore.quizOrder;
          const currentQuizMap = new Map(quizzes.map(q => [q.id, q]));
          const reorderedQuizzes: Quiz[] = [];
          
          // 1. 저장된 순서에 따라 퀴즈를 배치합니다.
          for (const quizId of orderedQuizIdsFromStorage) {
            if (currentQuizMap.has(quizId)) {
              reorderedQuizzes.push(currentQuizMap.get(quizId)!);
              currentQuizMap.delete(quizId); // 처리된 퀴즈는 맵에서 제거
            }
          }
          // 2. 저장된 순서에는 없지만 현재 API 결과에는 있는 나머지 퀴즈들을 뒤에 추가합니다.
          // (예: 퀴즈가 새로 추가된 경우)
          quizzes = [...reorderedQuizzes, ...Array.from(currentQuizMap.values())];
          console.log('[Quiz] onMount: Quizzes reordered based on saved quizOrder.');
        }
        
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
      showToast('퀴즈 데이터를 불러오는데 실패했습니다.', 'error');
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
        quizOrder: quizzes.map(q => q.id) // 현재 quizzes 배열의 순서를 저장
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
    } else {
      showToast('마지막 퀴즈입니다!', 'info');
    }
  }
  
  // 이전 퀴즈로 이동
  function prevQuiz() {
    if (currentIndex > 0) {
      currentIndex -= 1;
      showAnswer = false;
    } else {
      showToast('첫 번째 퀴즈입니다!', 'info');
    }
  }
  
  // 답변 표시 토글
  function toggleAnswer() {
    showAnswer = !showAnswer;
  }
  
  // 랜덤 퀴즈 모드 전환
  function randomQuiz() {
    quizzes = shuffleArray(quizzes); // 전체 퀴즈 배열 섞기
    isRandomMode = true; // isRandomMode를 먼저 true로 설정해야 saveProgressToLocalStorage에서 올바르게 quizOrder를 저장함
    currentIndex = 0; // 필터링된 목록의 처음으로
    showAnswer = false;
    // isRandomMode = true; // 위치 변경: saveProgressToLocalStorage가 반응형으로 호출될 때 isRandomMode가 true여야 함
    showToast('퀴즈 순서가 무작위로 섞였습니다.', 'success');
    // saveProgressToLocalStorage(); // isRandomMode, quizzes 변경으로 인해 반응형으로 호출됨
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
    showToast('이 문제가 나중에 다시 나타납니다.', 'info');
  }

  // 비밀번호 확인 함수
  function checkPassword() {
    if (passwordInput === correctPassword) {
      isAuthenticated = true;
      console.log('[Quiz] checkPassword: Password correct, isAuthenticated set to true.');
      showToast('로그인 성공! 퀴즈를 시작합니다.', 'success');
    } else {
      showToast('비밀번호가 틀렸습니다.', 'error');
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
    showToast('수정이 취소되었습니다.', 'info');
  }

  // 퀴즈 수정 API 호출
  async function saveChanges() {
    if (!currentQuiz) return;
    
    if (!editedQuestion.trim()) {
      showToast('질문은 필수 입력 사항입니다.', 'error');
      return;
    }

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
      showToast('퀴즈가 성공적으로 수정되었습니다.', 'success');

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
      showToast('퀴즈 수정 중 오류가 발생했습니다.', 'error');
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
    showToast('새 퀴즈 생성이 취소되었습니다.', 'info');
  }

  // 새 퀴즈 저장 API 호출
  async function saveNewQuiz() {
    if (!newQuestion || !newCategory) {
      showToast('질문과 카테고리는 필수 입력 사항입니다.', 'error');
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
      showToast('새 퀴즈가 성공적으로 생성되었습니다.', 'success');
      
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
      showToast('퀴즈 생성 중 오류가 발생했습니다.', 'error');
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
    showToast(`카테고리: ${selectedCategories.length === 0 ? '모든 카테고리' : selectedCategories.join(', ')}`, 'info');
  }

  // 카테고리 필터 토글 함수
  function toggleCategoryFilter() {
    isCategoryFilterOpen = !isCategoryFilterOpen;
  }
  
  // 모든 카테고리 선택 해제
  function clearAllCategories() {
    selectedCategories = [];
    currentIndex = 0;
    showAnswer = false;
    showToast('모든 카테고리가 선택 해제되었습니다.', 'info');
  }

  // 키보드 이벤트 핸들러
  function handleGlobalKeydown(event: KeyboardEvent) {
    if (!isAuthenticated || isEditing || isCreating) return;

    // 현재 포커스된 요소가 input 또는 textarea인지 확인
    const activeElement = document.activeElement;
    if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
      // 비밀번호 입력 필드는 예외적으로 Enter 키만 허용 (이미 handleKeydown에서 처리)
      if (activeElement.getAttribute('type') === 'password' && event.key === 'Enter') {
        // checkPassword(); // 이미 Input 컴포넌트의 on:keydown에서 처리됨
      } else if (activeElement.getAttribute('type') === 'password') {
        return;
      }
      // 그 외 input/textarea 포커스 시에는 대부분의 단축키 비활성화
      // (예: 질문/답변 수정 중에는 화살표 키 등이 텍스트 이동에 사용되어야 함)
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight' || event.key === ' ') {
        return;
      }
    }

    switch (event.key) {
      case 'ArrowLeft':
        if (!isEditing && !isCreating && quizzes.length > 0 && filteredQuizzes.length > 0) {
          prevQuiz();
        }
        break;
      case 'ArrowRight':
        if (!isEditing && !isCreating && quizzes.length > 0 && filteredQuizzes.length > 0) {
          nextQuiz();
        }
        break;
      case ' ': // Space bar
        event.preventDefault(); // 스페이스바의 기본 동작(페이지 스크롤 등) 방지
        if (!isEditing && !isCreating && currentQuiz) {
          toggleAnswer();
        }
        break;
      case '?':
        if (event.shiftKey && !isEditing && !isCreating && currentQuiz) {
          repeatQuiz();
        }
        break;
    }
  }
</script>

<svelte:window on:keydown={handleGlobalKeydown} />

<div class="container mx-auto px-4 py-6 max-w-3xl pb-24">
  
  <!-- 알림 표시 영역 -->
  {#if showNotification}
    <div 
      transition:fade={{ duration: 300 }}
      class="quiz-toast-notification fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-4 py-3 rounded-lg shadow-lg max-w-md {
        notificationType === 'success' ? 'bg-green-500 text-white' : 
        notificationType === 'error' ? 'bg-red-500 text-white' : 
        'bg-blue-500 text-white'
      }"
    >
      <div class="flex items-center">
        {#if notificationType === 'success'}
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        {:else if notificationType === 'error'}
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        {:else}
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        {/if}
        <span>{notificationMessage}</span>
      </div>
    </div>
  {/if}
  
  {#if !isAuthenticated}
    <div class="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 w-full max-w-md transition-all duration-300">
        <h2 class="text-xl font-semibold mb-6 text-gray-800 dark:text-gray-100 text-center">퀴즈 접근</h2>
        <div class="flex flex-col gap-3">
          <Input 
            type="password" 
            bind:value={passwordInput} 
            on:keydown={handleKeydown}
            placeholder="비밀번호를 입력하세요"
            class="w-full dark:bg-gray-700 dark:text-white transition-all duration-300 focus:ring-2 focus:ring-blue-500"
          />
          <Button 
            on:click={checkPassword}
            class="w-full bg-blue-500 hover:bg-blue-600 text-white transition-all duration-300"
          >
            접속하기
          </Button>
        </div>
      </div>
    </div>
  {:else}
    {#if isCreating}
      <!-- 퀴즈 생성 폼 -->
      <div class="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-md mb-6 transition-all duration-300 dark:ring-1 dark:ring-gray-700">
        <h2 class="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">새 퀴즈 만들기</h2>
        
        <div class="space-y-4">
          <div>
            <label for="new-category" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">카테고리 *</label>
            <Input 
              id="new-category"
              type="text" 
              bind:value={newCategory} 
              placeholder="카테고리 (필수, 쉼표로 여러개 가능)"
              class="w-full dark:bg-gray-700 dark:text-white transition-all duration-300 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label for="new-who" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">작성자</label>
            <Input 
              id="new-who"
              type="text" 
              bind:value={newWho} 
              placeholder="작성자 (선택)"
              class="w-full dark:bg-gray-700 dark:text-white transition-all duration-300 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label for="new-question" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">질문 *</label>
            <Input
              id="new-question"
              type="text"
              bind:value={newQuestion}
              placeholder="질문 (필수)"
              class="w-full dark:bg-gray-700 dark:text-white transition-all duration-300 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label for="new-answer" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">답변</label>
            <Textarea
              id="new-answer"
              bind:value={newAnswer}
              placeholder="답변 (선택)"
              class="w-full dark:bg-gray-700 dark:text-white min-h-[100px] transition-all duration-300 focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>
          
          <div class="flex space-x-3 pt-4">
            <Button 
              variant="outline" 
              on:click={cancelCreating} 
              class="flex-1 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300"
            >
              취소
            </Button>
            <Button 
              variant="default" 
              on:click={saveNewQuiz} 
              class="flex-1 bg-blue-500 hover:bg-blue-600 text-white transition-all duration-300"
            >
              저장
            </Button>
          </div>
        </div>
      </div>
    {:else if isLoading}
      <div class="flex items-center justify-center py-20">
        <div class="animate-pulse flex flex-col items-center">
          <div class="h-12 w-12 rounded-full bg-blue-500 opacity-75 animate-bounce mb-4"></div>
          <p class="text-gray-500 dark:text-gray-400">퀴즈를 불러오는 중...</p>
        </div>
      </div>
    {:else if quizzes.length === 0}
      <div class="flex flex-col items-center justify-center py-16 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 transition-all duration-300">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-400 dark:text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        <p class="text-gray-600 dark:text-gray-300 mb-4">퀴즈 데이터가 없습니다.</p>
        <Button 
          on:click={startCreating}
          class="bg-blue-500 hover:bg-blue-600 text-white transition-all duration-300"
        >
          첫 퀴즈 만들기
        </Button>
      </div>
    {:else}
      <!-- 퀴즈 카테고리 및 컨트롤 영역 -->
      <div class="mb-5 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 transition-all duration-300 dark:ring-1 dark:ring-gray-700">
        <!-- 카테고리 필터 토글 버튼 -->
        <Button 
          variant="outline"
          on:click={toggleCategoryFilter} 
          class="w-full text-sm py-2 mb-3 justify-between border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300"
        >
          <span class="font-medium">{isCategoryFilterOpen ? '카테고리 필터 닫기' : '카테고리 필터 열기'}</span>
          <span class="transition-transform duration-300" style={isCategoryFilterOpen ? "transform: rotate(180deg)" : ""}>▼</span>
        </Button>

        <!-- 카테고리 필터 UI (접힘/펼침 가능) -->
        {#if isCategoryFilterOpen}
          <div class="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-md transition-all duration-300">
            <h3 class="text-md font-semibold mb-3 text-gray-700 dark:text-gray-200">카테고리 선택</h3>
            {#if allUniqueCategories.length > 0}
              <div class="flex flex-wrap gap-2">
                {#each allUniqueCategories as category}
                  <Button
                    variant={selectedCategories.includes(category) ? 'default' : 'outline'}
                    on:click={() => toggleCategory(category)}
                    class="text-xs py-1 px-3 h-auto rounded-full transition-all duration-300 {
                      selectedCategories.includes(category) 
                        ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                        : 'hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 dark:hover:border-blue-800'
                    }"
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

        <!-- 퀴즈 컨트롤 영역 -->
        <div class="flex items-center justify-between flex-wrap gap-2">
          <div class="flex items-center gap-2">
            <Button 
              variant="outline"
              on:click={startCreating}
              class="text-xs py-1 px-2 h-auto hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              새 퀴즈
            </Button>
            <Button 
              variant={isRandomMode ? "default" : "secondary"}
              on:click={randomQuiz}
              class="text-xs py-1 px-2 h-auto transition-all duration-300 {
                isRandomMode 
                  ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600'
              }"
              disabled={isEditing || quizzes.length === 0}
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              랜덤
            </Button>
            {#if !isEditing && currentQuiz}  
              <Button 
                variant="secondary" 
                on:click={startEditing} 
                class="text-xs py-1 px-2 h-auto bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-all duration-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                수정
              </Button>
            {/if}
          </div>
          
          {#if !isEditing && filteredQuizzes.length > 0}
            <div class="bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1 text-sm text-gray-600 dark:text-gray-300 flex items-center">
              <span>{currentIndex + 1} / {filteredQuizzes.length}</span>
              {#if filteredQuizzes.length > 0}
                <span class="ml-1 text-blue-500 dark:text-blue-400 font-medium">({Math.round((currentIndex + 1) / filteredQuizzes.length * 100)}%)</span>
              {/if}
            </div>
          {/if}
        </div>
      </div>

      {#if filteredQuizzes.length === 0 && selectedCategories.length > 0}
        <div class="flex flex-col items-center justify-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 transition-all duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-400 dark:text-gray-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 11l5-5m0 0l5 5m-5-5v12" />
          </svg>
          <p class="text-gray-600 dark:text-gray-300 mb-3">선택된 카테고리에 해당하는 퀴즈가 없습니다.</p>
          <Button 
            variant="outline"
            on:click={() => clearAllCategories()}
            class="text-sm border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300"
          >
            모든 카테고리 보기
          </Button>
        </div>
      {:else if currentQuiz}
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden dark:ring-1 dark:ring-gray-700">
          <!-- 카테고리 및 작성자 정보 -->
          <div class="p-4 bg-white dark:bg-gray-750 border-b border-gray-200 dark:border-gray-700 flex flex-wrap gap-2">
            {#if currentQuiz.category}
              <span class="text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 px-2.5 py-1 rounded-full font-medium">
                {currentQuiz.category}
              </span>
            {/if}
            {#if currentQuiz.who}
              <span class="text-xs bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 px-2.5 py-1 rounded-full font-medium">
                {currentQuiz.who}
              </span>
            {/if}
          </div>
          
          <!-- 질문 영역 -->
          <div class="p-4 sm:p-5">
            <div class="question-container min-h-[120px] flex items-center mb-5">
              {#if isEditing}
                <Textarea 
                  bind:value={editedQuestion} 
                  class="w-full dark:bg-gray-700 dark:text-white text-lg font-semibold resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300" 
                  rows={3}
                />
              {:else}
                <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-100" transition:fade={{ duration: 200 }}>
                  {currentQuiz.question}
                </h2>
              {/if}
            </div>
            
            <!-- 답변 영역 -->
            <div 
              class="answer-container w-full bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4 sm:p-5"
            >
              <div class="w-full">
                {#if showAnswer || isEditing}
                  {#if isEditing}
                    <Textarea 
                      bind:value={editedAnswer} 
                      class="w-full dark:bg-gray-700 dark:text-white text-sm leading-relaxed resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      rows={10}
                    />
                  {:else if currentQuiz.answer}
                    <p class="whitespace-pre-line text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{currentQuiz.answer}</p>
                  {:else}
                    <p class="text-center text-gray-500 dark:text-gray-400 text-sm py-10">답변이 제공되지 않은 질문입니다.</p>
                  {/if}
                {:else}
                  <div class="h-[180px] flex flex-col items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-400 dark:text-gray-500 mb-3 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
                    </svg>
                    <p class="text-center text-gray-500 dark:text-gray-400 text-sm">답변을 확인하려면 아래 <strong>답변 보기</strong> 버튼을 클릭하세요</p>
                  </div>
                {/if}
              </div>
            </div>
          </div>
        </div>
      {/if}
    {/if}
    
    <!-- 푸터 대체 고정 버튼 -->
    <div class="quiz-fixed-footer fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-3 px-4 shadow-lg z-20 transition-all duration-300">
      <div class="container mx-auto max-w-3xl flex justify-between gap-3">
        {#if isEditing}
          <Button 
            variant="outline" 
            on:click={cancelEditing} 
            class="flex-1 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
          >
            취소
          </Button>
          <Button 
            variant="default" 
            on:click={saveChanges} 
            class="flex-1 bg-blue-500 hover:bg-blue-600 text-white transition-all duration-300"
          >
            저장
          </Button>
        {:else if currentQuiz}
          <div class="grid grid-cols-3 gap-3 w-full">
            <Button 
              variant={showAnswer ? "default" : "outline"} 
              on:click={toggleAnswer}
              class="flex items-center justify-center transition-all duration-300 {
                showAnswer 
                  ? 'bg-blue-500 hover:bg-blue-600 text-white font-medium' 
                  : 'border-blue-300 text-blue-600 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/30'
              }"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 sm:mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {#if showAnswer}
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                {:else}
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                {/if}
              </svg>
              <span class="hidden sm:inline">{showAnswer ? '가리기' : '보기'}</span>
            </Button>
            
            <div class="flex gap-2">
              <Button 
                variant="secondary" 
                on:click={prevQuiz} 
                disabled={currentIndex === 0}
                class="flex-1 flex items-center justify-center transition-all duration-300 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 {
                  currentIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''
                }"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
              </Button>
              
              <Button 
                variant="secondary" 
                on:click={nextQuiz} 
                disabled={currentIndex === filteredQuizzes.length - 1}
                class="flex-1 flex items-center justify-center transition-all duration-300 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 {
                  currentIndex === filteredQuizzes.length - 1 ? 'opacity-50 cursor-not-allowed' : ''
                }"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            </div>
            
            <Button 
              variant="outline" 
              on:click={repeatQuiz} 
              class="flex items-center justify-center transition-all duration-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 sm:mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span class="hidden sm:inline">다시</span>
            </Button>
          </div>
        {/if}
      </div>
    </div>
  {/if}
</div>

<style>
  .answer-container {
    min-height: 220px;
    transition: all 0.3s ease;
  }
  
  .question-container {
    min-height: 100px;
    transition: all 0.3s ease;
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

    .quiz-fixed-footer {
      /* 기본 1rem 패딩 + 안전 영역 (iPhone X 등 노치 디자인 대응) */
      padding-bottom: calc(1rem + env(safe-area-inset-bottom, 0px));
    }

    .quiz-toast-notification {
      max-width: calc(100vw - 32px); /* 16px (1rem) margin on each side */
      padding: 0.5rem 0.75rem; /* py-2 px-3 */
      font-size: 0.875rem; /* text-sm */
    }

    .quiz-toast-notification svg {
      width: 1rem; /* w-4 */
      height: 1rem; /* h-4 */
      /* margin-right: 0.5rem; /* mr-2, already applied by class, usually fine */
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

  /* 다크 모드에서 더 진한 배경색을 위한 커스텀 클래스 */
  :global(.dark\:bg-gray-750) {
    background-color: #1a1e2b;
  }

  /* 애니메이션 효과 */
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .answer-container p {
    animation: fadeIn 0.3s ease-out;
  }
</style> 