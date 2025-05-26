<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Textarea } from "$lib/components/ui/textarea";
  import * as Dialog from "$lib/components/ui/dialog";
  import { toast } from "svelte-sonner";
  import { onMount } from "svelte";
  import { getApiUrl } from '$lib/config';
  import { fade } from 'svelte/transition';
  
  const QUIZ_PROGRESS_KEY = 'velopersQuizProgress';

  interface SavedProgress {
    currentIndex: number;
    selectedCategories: string[];
    isRandomMode: boolean;
    isAuthenticated: boolean;
    quizOrder?: string[]; // 퀴즈 ID 순서 저장
    sortOrder?: 'asc' | 'desc'; // 정렬 순서 추가
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
  let correctPassword = '4120';
  let isEditDialogOpen = false; // Dialog 상태로 변경
  let editedQuestion = '';
  let editedAnswer = '';
  let editedWho = '';
  let editedCategory = '';
  let isCreating = false;
  let isCreateDialogOpen = false; // 새 퀴즈 생성 Dialog 상태 변수 추가
  let newQuestion = '';
  let newAnswer = '';
  let newCategory = '';
  let newWho = '';

  let sortOrder: 'asc' | 'desc' = 'desc'; // 'desc'가 최신순 (id 내림차순)
  let isQuizListOpen = false; // 퀴즈 목록 표시 여부

  // 카테고리 필터 상태
  let selectedCategories: string[] = [];
  let allUniqueCategories: string[] = [];
  let isCategoryFilterOpen = false; // 카테고리 필터 접힘/펼침 상태
  let isFilterSectionVisible = false; // 필터링 섹션 전체 표시 여부 (기본값: 숨김)

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
  
  // 다시하기 퀴즈 개수 계산
  $: repeatQuizCount = quizzes.filter(quiz => quiz.id.includes('_repeat_')).length;
  
  // 퀴즈 데이터 가져오기 및 상태 복원
  onMount(async () => {
    let loadedAuth = false;
    let progressToRestore: SavedProgress | null = null;

    if (typeof window !== 'undefined' && window.localStorage) {
      // 먼저 잘못된 데이터 정리
      clearInvalidLocalStorage();
      
      const savedProgressString = localStorage.getItem(QUIZ_PROGRESS_KEY);
      
              if (savedProgressString) {
        try {
          const parsed = JSON.parse(savedProgressString) as SavedProgress;
          
          if (parsed.isAuthenticated) {
            isAuthenticated = true;
            loadedAuth = true;
            progressToRestore = parsed;
            if (parsed.sortOrder) { // 저장된 정렬 순서 복원
              sortOrder = parsed.sortOrder;
            }
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
        if (progressToRestore.sortOrder) { // 복원된 정렬 순서가 있으면 사용
          sortOrder = progressToRestore.sortOrder;
        }
        
        // 랜덤 모드였고, 저장된 퀴즈 순서가 있다면 quizzes 배열을 재정렬합니다.
        if (progressToRestore.isRandomMode && progressToRestore.quizOrder && progressToRestore.quizOrder.length > 0) {
          const orderedQuizIdsFromStorage = progressToRestore.quizOrder;
          const availableQuizzes = [...quizzes]; // API에서 가져온 원본 퀴즈들
          const reorderedQuizzes: Quiz[] = [];
          
          // 1. 저장된 순서에 따라 퀴즈를 배치합니다.
          for (const savedId of orderedQuizIdsFromStorage) {
            // repeat 퀴즈인지 확인 (ID에 '_repeat_'가 포함된 경우)
            if (savedId.includes('_repeat_')) {
              // repeat 퀴즈는 원본 ID를 찾아서 복사해서 추가
              const originalId = savedId.split('_repeat_')[0];
              const originalQuiz = availableQuizzes.find(q => q.id === originalId);
              if (originalQuiz) {
                reorderedQuizzes.push({
                  ...originalQuiz,
                  id: savedId // 저장된 고유 ID 유지
                });
              }
            } else {
              // 일반 퀴즈는 API 결과에서 찾아서 추가
              const foundQuiz = availableQuizzes.find(q => q.id === savedId);
              if (foundQuiz) {
                reorderedQuizzes.push(foundQuiz);
              }
            }
          }
          
          // 2. 저장된 순서에는 없지만 현재 API 결과에는 있는 새로운 퀴즈들을 뒤에 추가합니다.
          const restoredOriginalIds = new Set(
            orderedQuizIdsFromStorage
              .filter(id => !id.includes('_repeat_'))
              .concat(
                orderedQuizIdsFromStorage
                  .filter(id => id.includes('_repeat_'))
                  .map(id => id.split('_repeat_')[0])
              )
          );
          const newQuizzes = availableQuizzes.filter(q => !restoredOriginalIds.has(q.id));
          
          quizzes = [...reorderedQuizzes, ...newQuizzes];
          isRandomMode = true; // 랜덤 모드 상태 유지
        } else {
          // 랜덤 모드가 아니거나 저장된 순서가 없으면 현재 sortOrder에 따라 정렬
          performSort(sortOrder);
          isRandomMode = false;
        }
        
        selectedCategories = progressToRestore.selectedCategories || [];
        
        // 필터링된 퀴즈 목록이 계산될 때까지 대기
        await new Promise(resolve => setTimeout(resolve, 100)); 

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
        performSort(sortOrder); // 기본 정렬 적용
      }
      
      // 퀴즈 데이터 로드 완료 후 저장 (인증된 사용자인 경우)
      if (isAuthenticated && quizzes.length > 0) {
        saveProgressToLocalStorage();
      }
    } catch (error) {
      console.error('퀴즈 데이터를 불러오는데 실패했습니다:', error);
      toast.error('퀴즈 데이터를 불러오는데 실패했습니다.');
    } finally {
      isLoading = false;
    }
  });
  
  // 진행 상황 저장 (즉시 실행)
  const saveProgressToLocalStorage = () => {
    if (isAuthenticated && !isLoading && quizzes.length > 0 && typeof window !== 'undefined' && window.localStorage) {
      const progress: SavedProgress = {
        currentIndex,
        selectedCategories,
        isRandomMode,
        isAuthenticated,
        quizOrder: quizzes.map(q => q.id), // 현재 quizzes 배열의 순서를 저장
        sortOrder: sortOrder // 정렬 순서 저장
      };
      try {
        localStorage.setItem(QUIZ_PROGRESS_KEY, JSON.stringify(progress));
      } catch (e) {
        console.error('localStorage 저장 중 오류 발생:', e);
      }
    }
  };

  // 상태 변경 시 자동 저장 (즉시 실행)
  $: {
    if (typeof window !== 'undefined' && isAuthenticated && !isLoading && quizzes.length > 0) {
      saveProgressToLocalStorage();
    }
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
  
  // 퀴즈 정렬 함수
  function performSort(order: 'asc' | 'desc') {
    quizzes.sort((a, b) => {
      if (order === 'asc') { // 오래된 순 (id 오름차순)
        return a.id.localeCompare(b.id);
      } else { // 최신 순 (id 내림차순)
        return b.id.localeCompare(a.id);
      }
    });
    quizzes = [...quizzes]; // Svelte 반응성 업데이트
  }
  
  // 다음 퀴즈로 이동 (필터링된 목록 기준)
  function nextQuiz() {
    if (currentIndex < filteredQuizzes.length - 1) {
      currentIndex += 1;
      showAnswer = false;
      saveProgressToLocalStorage(); // 직접 호출 추가
    } else {
      toast.info('마지막 퀴즈입니다!');
    }
  }
  
  // 이전 퀴즈로 이동
  function prevQuiz() {
    if (currentIndex > 0) {
      currentIndex -= 1;
      showAnswer = false;
      saveProgressToLocalStorage(); // 직접 호출 추가
    } else {
      toast.info('첫 번째 퀴즈입니다!');
    }
  }
  
  // 답변 표시 토글
  function toggleAnswer() {
    showAnswer = !showAnswer;
  }
  
  // 랜덤 퀴즈 모드 전환
  function randomQuiz() {
    quizzes = shuffleArray(quizzes); // 전체 퀴즈 배열 섞기
    quizzes = [...quizzes]; // Svelte 반응성 업데이트
    isRandomMode = true; 
    currentIndex = 0; 
    showAnswer = false;
    toast.success('퀴즈 순서가 무작위로 섞였습니다.');
  }
  
  // 정렬 순서 토글 함수
  function toggleSortOrder() {
    sortOrder = sortOrder === 'desc' ? 'asc' : 'desc';
    isRandomMode = false; // 순서 정렬 시 랜덤 모드 해제
    performSort(sortOrder);
    currentIndex = 0;
    showAnswer = false;
    const message = sortOrder === 'desc' ? '최신 순으로 정렬되었습니다.' : '오래된 순으로 정렬되었습니다.';
    toast.info(message);
  }
  
  // 다시하기 - 현재 질문을 랜덤한 위치에 다시 추가
  function repeatQuiz() {
    if (!currentQuiz) return;
    
    // 중복 퀴즈에 고유한 ID 생성 (원본 ID + timestamp + random)
    const timestamp = Date.now();
    const randomSuffix = Math.floor(Math.random() * 10000);
    const uniqueId = `${currentQuiz.id}_repeat_${timestamp}_${randomSuffix}`;
    
    const quizToRepeat = { 
      ...currentQuiz, 
      id: uniqueId // 고유한 ID 할당
    };
    
    // filteredQuizzes 기준으로 위치 계산
    const currentFilteredIndex = filteredQuizzes.findIndex(q => q.id === currentQuiz.id);
    const remainingFilteredQuizzes = filteredQuizzes.length - currentFilteredIndex - 1;
    
    if (remainingFilteredQuizzes <= 0) {
      // 현재가 마지막 퀴즈라면 전체 quizzes 배열 끝에 추가
      quizzes = [...quizzes, quizToRepeat];
    } else {
      // 현재 위치에서 5개 후부터 필터링된 퀴즈 끝까지의 범위에서 랜덤 선택
      const minFilteredPosition = Math.min(currentFilteredIndex + 5, filteredQuizzes.length);
      const maxFilteredPosition = filteredQuizzes.length;
      
      if (minFilteredPosition >= maxFilteredPosition) {
        // 범위가 없으면 끝에 추가
        quizzes = [...quizzes, quizToRepeat];
      } else {
        // 랜덤 위치 선택 (필터링된 목록 기준)
        const randomFilteredIndex = Math.floor(Math.random() * (maxFilteredPosition - minFilteredPosition)) + minFilteredPosition;
        const targetQuiz = filteredQuizzes[randomFilteredIndex];
        
        // 전체 quizzes 배열에서 해당 퀴즈의 실제 위치 찾기
        const actualIndex = quizzes.findIndex(q => q.id === targetQuiz.id);
        
        if (actualIndex !== -1) {
          const newQuizzes = [...quizzes];
          newQuizzes.splice(actualIndex, 0, quizToRepeat);
          quizzes = newQuizzes;
        } else {
          // 찾지 못하면 끝에 추가
          quizzes = [...quizzes, quizToRepeat];
        }
      }
    }
    
    nextQuiz();
    toast.info('이 문제가 나중에 다시 나타납니다.');
  }

  // 비밀번호 확인 함수
  function checkPassword() {
    if (passwordInput === correctPassword) {
      isAuthenticated = true;
      toast.success('로그인 성공! 퀴즈를 시작합니다.');
    } else {
      toast.error('비밀번호가 틀렸습니다.');
      passwordInput = '';
    }
  }

  // Enter 키로 비밀번호 확인
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      checkPassword();
    }
  }

  // 수정 버튼 클릭 핸들러
  function handleEditClick() {
    startEditing();
  }

  // 수정 모드 진입
  function startEditing() {
    if (!currentQuiz) {
      return;
    }
    
    isEditDialogOpen = true;
    editedQuestion = currentQuiz.question;
    editedAnswer = currentQuiz.answer || '';
    editedWho = currentQuiz.who || '';
    editedCategory = currentQuiz.category || '';
    showAnswer = true; // 수정 시 답변 보이도록
  }

  // 수정 취소
  function cancelEditing() {
    isEditDialogOpen = false;
    toast.info('수정이 취소되었습니다.');
  }

  // 퀴즈 수정 API 호출
  async function saveChanges() {
    if (!currentQuiz) {
      return;
    }
    
    if (!editedQuestion.trim()) {
      toast.error('질문은 필수 입력 사항입니다.');
      return;
    }

    if (!editedCategory.trim()) {
      toast.error('카테고리는 필수 입력 사항입니다.');
      return;
    }

    // repeat 퀴즈인지 확인하고 원본 ID 추출
    const isRepeatQuiz = currentQuiz.id.includes('_repeat_');
    const originalId = isRepeatQuiz ? currentQuiz.id.split('_repeat_')[0] : currentQuiz.id;

    const updatedQuizData = {
      ...currentQuiz,
      id: originalId, // 원본 ID 사용
      question: editedQuestion,
      answer: editedAnswer,
      category: editedCategory,
      who: editedWho,
    };

    try {
      const apiUrl = getApiUrl(`/api/quiz/${originalId}`); // 원본 ID로 API 호출
      
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedQuizData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error('퀴즈 수정에 실패했습니다.');
      }

      const savedQuiz = await response.json();
      const savedQuizId = savedQuiz.id;

      // 수정 완료 후 현재 퀴즈 유지를 위해 ID 저장
      const currentQuizId = currentQuiz.id;

      // 로컬 데이터 업데이트 (순서 유지)
      // repeat 퀴즈였다면 현재 퀴즈를 업데이트하고, 원본 퀴즈도 업데이트
      quizzes = quizzes.map(quiz => {
        if (quiz.id === currentQuiz.id) {
          // 현재 repeat 퀴즈 업데이트
          return { ...savedQuiz, id: currentQuiz.id }; // repeat ID 유지
        } else if (quiz.id === originalId) {
          // 원본 퀴즈 업데이트
          return savedQuiz;
        }
        return quiz;
      });
      
      // 순서를 유지하기 위해 performSort 호출하지 않음
      isEditDialogOpen = false;
      
      if (isRepeatQuiz) {
        toast.success('다시하기 퀴즈가 성공적으로 수정되었습니다. (원본도 함께 업데이트됨)');
      } else {
        toast.success('퀴즈가 성공적으로 수정되었습니다.');
      }

      // 수정된 퀴즈를 찾아서 currentIndex 설정 (순서 유지됨)
      const updatedQuizIndex = filteredQuizzes.findIndex(q => q.id === currentQuizId);
      
      if (updatedQuizIndex !== -1) {
        currentIndex = updatedQuizIndex;
      } else {
        // 찾지 못한 경우 (필터링으로 인해 보이지 않을 수 있음)
        if (filteredQuizzes.length > 0) {
          currentIndex = Math.min(currentIndex, filteredQuizzes.length - 1);
          if (currentIndex < 0) currentIndex = 0;
        } else {
          currentIndex = 0;
        }
      }
    } catch (error) {
      console.error('퀴즈 수정 중 오류 발생:', error);
      toast.error('퀴즈 수정 중 오류가 발생했습니다.');
    }
  }

  // 새 퀴즈 생성 모드 진입
  function startCreating() {
    isCreateDialogOpen = true; // isCreating 대신 isCreateDialogOpen 사용
    newQuestion = '';
    newAnswer = '';
    newCategory = '';
    newWho = '';
  }

  // 생성 취소
  function cancelCreating() {
    isCreateDialogOpen = false; // isCreating 대신 isCreateDialogOpen 사용
    toast.info('새 퀴즈 생성이 취소되었습니다.');
  }

  // 새 퀴즈 저장 API 호출
  async function saveNewQuiz() {
    if (!newQuestion || !newCategory) {
      toast.error('질문과 카테고리는 필수 입력 사항입니다.');
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
      performSort(sortOrder); // 정렬 유지
      isCreateDialogOpen = false; // isCreating 대신 isCreateDialogOpen 사용
      toast.success('새 퀴즈가 성공적으로 생성되었습니다.');
      
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
      toast.error('퀴즈 생성 중 오류가 발생했습니다.');
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
    toast.info(`카테고리: ${selectedCategories.length === 0 ? '모든 카테고리' : selectedCategories.join(', ')}`);
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
    toast.info('모든 카테고리가 선택 해제되었습니다.');
  }

  // 퀴즈 목록 토글 함수
  function toggleQuizList() {
    isQuizListOpen = !isQuizListOpen;
  }

  // 필터링 섹션 토글 함수
  function toggleFilterSection() {
    isFilterSectionVisible = !isFilterSectionVisible;
    if (!isFilterSectionVisible) {
      // 필터링 섹션을 숨길 때 퀴즈 목록과 카테고리 필터도 닫기
      isQuizListOpen = false;
      isCategoryFilterOpen = false;
    }
  }

  // 특정 퀴즈로 이동 함수
  function goToQuiz(index: number) {
    if (index >= 0 && index < filteredQuizzes.length) {
      currentIndex = index;
      showAnswer = false;
      isQuizListOpen = false; // 퀴즈 선택 후 목록 닫기
    }
  }

  // "다시하기" 퀴즈들 초기화 함수
  function resetRepeatQuizzes() {
    const originalQuizzesCount = quizzes.length;
    const repeatQuizzesCount = quizzes.filter(quiz => quiz.id.includes('_repeat_')).length;
    
    if (repeatQuizzesCount === 0) {
      toast.info('초기화할 다시하기 퀴즈가 없습니다.');
      return;
    }
    
    // repeat 퀴즈들을 제거
    quizzes = quizzes.filter(quiz => !quiz.id.includes('_repeat_'));
    
    // 현재 인덱스를 맨 처음으로 이동
    currentIndex = 0;
    
    showAnswer = false;
    
    // 로컬 스토리지 즉시 업데이트 (repeat 퀴즈 제거된 상태로)
    saveProgressToLocalStorage();
    
    toast.success(`${repeatQuizzesCount}개의 다시하기 퀴즈가 초기화되었습니다.`);
  }

  // 로컬 스토리지 상태 확인 함수 (디버깅용)
  function checkLocalStorageStatus() {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = localStorage.getItem(QUIZ_PROGRESS_KEY);
      console.log('[Quiz] 현재 로컬 스토리지 상태:', {
        exists: !!saved,
        data: saved ? JSON.parse(saved) : null,
        currentState: {
          currentIndex,
          selectedCategories,
          isRandomMode,
          isAuthenticated,
          sortOrder,
          quizzesLength: quizzes.length
        }
      });
    }
  }

  // 잘못된 로컬 스토리지 데이터 정리 함수
  function clearInvalidLocalStorage() {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = localStorage.getItem(QUIZ_PROGRESS_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // quizOrder가 빈 배열이거나 없으면 삭제
          if (!parsed.quizOrder || parsed.quizOrder.length === 0) {
            localStorage.removeItem(QUIZ_PROGRESS_KEY);
            return true;
          }
        } catch (e) {
          localStorage.removeItem(QUIZ_PROGRESS_KEY);
          return true;
        }
      }
    }
    return false;
  }

  // 개발자 도구에서 접근 가능하도록 전역 함수로 노출
  if (typeof window !== 'undefined') {
    (window as any).checkQuizStorage = checkLocalStorageStatus;
    (window as any).clearQuizStorage = clearInvalidLocalStorage;
  }

  // 키보드 이벤트 핸들러
  function handleGlobalKeydown(event: KeyboardEvent) {
    if (!isAuthenticated || isEditDialogOpen || isCreating || isCreateDialogOpen) return; // isCreateDialogOpen 조건 추가

    // 퀴즈 목록이 열려있을 때는 Enter, Space, Arrow 키들의 기본 동작만 허용 (목록 내 탐색 등)
    if (isQuizListOpen) {
      if (event.key === 'Escape') {
        isQuizListOpen = false;
      }
      // 여기서는 목록 자체의 키보드 네비게이션을 방해하지 않도록 return;
      // (예: 목록 아이템에 포커스가 갔을 때 Enter로 선택 등)
      // 현재는 목록 아이템에 직접적인 키보드 포커스 및 선택 기능은 없으므로, Esc만 처리.
      return; 
    }

    // 현재 포커스된 요소가 input 또는 textarea인지 확인
    const activeElement = document.activeElement;
    if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
      // 비밀번호 입력 필드는 예외적으로 Enter 키만 허용 (이미 handleKeydown에서 처리)
      if (activeElement.getAttribute('type') === 'password' && event.key === 'Enter') {
        // checkPassword(); // 이미 Input 컴포넌트의 on:keydown에서 처리됨
      } else if (activeElement.getAttribute('type') === 'password') {
        return;
      } else if (event.key.startsWith("Arrow") || event.key === ' ') {
        // input/textarea 포커스 시 화살표, 스페이스바로 인한 페이지 이동/답변보기 방지 (텍스트 조작용으로 남겨둠)
        // 단, 여기서는 일반적인 input/textarea의 동작을 막지 않도록 수정이 필요할 수 있음.
        // 현재 로직은 ArrowLeft/Right, Space 키에 대한 전역 핸들러의 동작을 막는 것.
        // 사용자가 의도한 것은 퀴즈 이동/답변 토글이므로, input/textarea에 포커스 시에는 이 기능들이 동작하지 않도록 하는 것이 맞음.
        return;
      }
    }

    switch (event.key) {
      case 'ArrowLeft':
        if (!isEditDialogOpen && !isCreating && !isCreateDialogOpen && quizzes.length > 0 && filteredQuizzes.length > 0) { // isCreateDialogOpen 조건 추가
          prevQuiz();
        }
        break;
      case 'ArrowRight':
        if (!isEditDialogOpen && !isCreating && !isCreateDialogOpen && quizzes.length > 0 && filteredQuizzes.length > 0) { // isCreateDialogOpen 조건 추가
          nextQuiz();
        }
        break;
      case ' ': // Space bar
        event.preventDefault(); // 스페이스바의 기본 동작(페이지 스크롤 등) 방지
        if (!isEditDialogOpen && !isCreating && !isCreateDialogOpen && currentQuiz) { // isCreateDialogOpen 조건 추가
          // Input 또는 Textarea가 포커스되어 있지 않을 때만 답변 토글
          if (!activeElement || (activeElement.tagName !== 'INPUT' && activeElement.tagName !== 'TEXTAREA')) {
            toggleAnswer();
          }
        }
        break;
      case '?':
        if (event.shiftKey && !isEditDialogOpen && !isCreating && !isCreateDialogOpen && currentQuiz) { // isCreateDialogOpen 조건 추가
          repeatQuiz();
        }
        break;
    }
  }
</script>

<svelte:window on:keydown={handleGlobalKeydown} />

<div class="container mx-auto px-4 py-6 max-w-3xl pb-24">
  
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
    {#if isLoading}
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
        <!-- 퀴즈 목록 토글 버튼 및 목록 -->
        {#if isFilterSectionVisible}
        <div class="mb-3">
          <Button
            variant="outline"
            on:click={toggleQuizList}
            class="w-full text-sm py-2 justify-between border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300"
            disabled={isEditDialogOpen || isCreating || quizzes.length === 0}
          >
            <span class="font-medium">{isQuizListOpen ? '퀴즈 목록 숨기기' : '퀴즈 목록 보기'} ({filteredQuizzes.length}개)</span>
            <span class="transition-transform duration-300" style={isQuizListOpen ? "transform: rotate(180deg)" : ""}>▼</span>
          </Button>
          {#if isQuizListOpen && filteredQuizzes.length > 0}
            <div class="mt-2 p-3 bg-gray-50 dark:bg-gray-700/60 rounded-md shadow max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-600 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800">
              <div class="space-y-1">
                {#each filteredQuizzes as quiz, i}
                  <button 
                    class="w-full text-left p-2 text-sm rounded-md cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors duration-150 {currentIndex === i ? 'bg-blue-100 dark:bg-blue-900/70 font-semibold text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'}"
                    on:click={() => goToQuiz(i)}
                  >
                    <span>{i + 1}. </span>
                    <span>{quiz.question.substring(0, 50)}{quiz.question.length > 50 ? '...' : ''}</span>
                  </button>
                {/each}
              </div>
            </div>
          {/if}
        </div>

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
        {/if}

        <!-- 퀴즈 컨트롤 영역 -->
        <div class="flex items-center flex-wrap gap-2 w-full justify-between">
          <div class="flex w-full items-center gap-1 sm:gap-2">
            <Button 
              variant="outline"
              on:click={startCreating}
              class="flex-1 text-xs py-1 px-2 h-auto hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 sm:mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              <span class="hidden sm:inline">새 퀴즈</span>
            </Button>
            {#if !isEditDialogOpen && currentQuiz}  
              <Button 
                variant="secondary" 
                on:click={handleEditClick} 
                class="flex-1 text-xs py-1 px-2 h-auto bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-all duration-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 sm:mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span class="hidden sm:inline">수정</span>
              </Button>
            {/if}
            <Button 
              variant="secondary"
              on:click={toggleSortOrder}
              class="flex-1 text-xs py-1 px-2 h-auto transition-all duration-300 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
              disabled={isEditDialogOpen || quizzes.length === 0}
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 sm:mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
              </svg>
              <span class="hidden md:inline">{sortOrder === 'desc' ? '최신 순' : '오래된 순'}</span>
            </Button>
            {#if !isEditDialogOpen && currentQuiz}  
              <Button 
                variant="secondary" 
                on:click={resetRepeatQuizzes} 
                class="flex-1 text-xs py-1 px-2 h-auto bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-all duration-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 sm:mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span class="hidden md:inline">초기화</span>
              </Button>
            {/if}
            <Button 
              variant={isRandomMode ? "default" : "secondary"}
              on:click={randomQuiz}
              class="flex-1 text-xs py-1 px-2 h-auto transition-all duration-300 {
                isRandomMode 
                  ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600'
              }"
              disabled={isEditDialogOpen || quizzes.length === 0}
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 sm:mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span class="hidden sm:inline">랜덤</span>
            </Button>
            {#if !isEditDialogOpen && currentQuiz}  
              <Button 
                variant={isFilterSectionVisible ? "default" : "secondary"}
                on:click={toggleFilterSection} 
                class="flex-1 text-xs py-1 px-2 h-auto transition-all duration-300 {
                  isFilterSectionVisible 
                    ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600'
                }"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 sm:mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <span class="hidden md:inline">필터링</span>
              </Button>
            {/if}
          </div>
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
          <div class="p-4 bg-white dark:bg-gray-750 border-b border-gray-200 dark:border-gray-700 flex flex-wrap gap-2 items-center">
            <div class="flex flex-wrap gap-2">
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
            {#if !isEditDialogOpen && filteredQuizzes.length > 0}
              <div class="bg-gray-100 dark:bg-gray-700 rounded-full px-2 sm:px-3 py-1 text-xs sm:text-sm text-gray-600 dark:text-gray-300 flex items-center shrink-0 ml-auto">
                <span class="font-medium">
                  {currentIndex + 1}/{filteredQuizzes.length}
                  {#if repeatQuizCount > 0}
                    <span class="text-orange-500 dark:text-orange-400">(+{repeatQuizCount})</span>
                  {/if}
                  <span class="text-blue-500 dark:text-blue-400 ml-1">[{Math.round((currentIndex + 1) / filteredQuizzes.length * 100)}%]</span>
                </span>
              </div>
            {/if}
          </div>
          
          <!-- 질문 영역 -->
          <div class="p-4 sm:p-5">
            <div class="question-container min-h-[120px] flex items-center mb-5">
              <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-100" transition:fade={{ duration: 200 }}>
                {currentQuiz.question}
              </h2>
            </div>
            
            <!-- 답변 영역 -->
            <div 
              class="answer-container w-full bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4 sm:p-5"
            >
              <div class="w-full">
                {#if showAnswer}
                  {#if currentQuiz.answer}
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
        {#if currentQuiz}
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

<!-- 퀴즈 수정 Dialog -->
<Dialog.Root bind:open={isEditDialogOpen}>
  <Dialog.Content class="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
    <Dialog.Header>
      <Dialog.Title>퀴즈 수정</Dialog.Title>
      <Dialog.Description>
        퀴즈의 내용을 수정할 수 있습니다. 변경사항을 저장하려면 저장 버튼을 클릭하세요.
      </Dialog.Description>
    </Dialog.Header>
    
    <div class="grid gap-4 py-4">
      <div>
        <label for="edit-category" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">카테고리 *</label>
        <Input 
          id="edit-category"
          type="text" 
          bind:value={editedCategory} 
          placeholder="카테고리 (필수, 쉼표로 여러개 가능)"
          class="w-full"
        />
      </div>
      
      <div>
        <label for="edit-who" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">작성자</label>
        <Input 
          id="edit-who"
          type="text" 
          bind:value={editedWho} 
          placeholder="작성자 (선택)"
          class="w-full"
        />
      </div>
      
      <div>
        <label for="edit-question" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">질문 *</label>
        <Textarea 
          id="edit-question"
          bind:value={editedQuestion} 
          placeholder="질문 (필수)"
          class="w-full min-h-[100px]"
          rows={4}
        />
      </div>
      
      <div>
        <label for="edit-answer" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">답변</label>
        <Textarea
          id="edit-answer"
          bind:value={editedAnswer}
          placeholder="답변 (선택)"
          class="w-full min-h-[200px]"
          rows={8}
        />
      </div>
    </div>
    
    <Dialog.Footer>
      <Button variant="outline" on:click={cancelEditing}>
        취소
      </Button>
      <Button on:click={saveChanges}>
        저장
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>

<!-- 새 퀴즈 추가 Dialog -->
<Dialog.Root bind:open={isCreateDialogOpen}>
  <Dialog.Content class="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
    <Dialog.Header>
      <Dialog.Title>새 퀴즈 만들기</Dialog.Title>
      <Dialog.Description>
        새로운 퀴즈 정보를 입력하고 저장 버튼을 클릭하세요.
      </Dialog.Description>
    </Dialog.Header>
    
    <div class="grid gap-4 py-4">
      <div>
        <label for="new-category-dialog" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">카테고리 *</label>
        <Input 
          id="new-category-dialog"
          type="text" 
          bind:value={newCategory} 
          placeholder="카테고리 (필수, 쉼표로 여러개 가능)"
          class="w-full"
        />
      </div>
      
      <div>
        <label for="new-who-dialog" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">작성자</label>
        <Input 
          id="new-who-dialog"
          type="text" 
          bind:value={newWho} 
          placeholder="작성자 (선택)"
          class="w-full"
        />
      </div>
      
      <div>
        <label for="new-question-dialog" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">질문 *</label>
        <Textarea 
          id="new-question-dialog"
          bind:value={newQuestion} 
          placeholder="질문 (필수)"
          class="w-full min-h-[100px]"
          rows={4}
        />
      </div>
      
      <div>
        <label for="new-answer-dialog" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">답변</label>
        <Textarea
          id="new-answer-dialog"
          bind:value={newAnswer}
          placeholder="답변 (선택)"
          class="w-full min-h-[150px]"
          rows={6}
        />
      </div>
    </div>
    
    <Dialog.Footer>
      <Button variant="outline" on:click={cancelCreating}>
        취소
      </Button>
      <Button on:click={saveNewQuiz}>
        저장
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>

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