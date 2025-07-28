<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { marked } from 'marked';

  interface CitationInfo {
    text: string;
    quote: string;
    fileName: string;
    postId: number;
    startIndex: number;
    endIndex: number;
  }

  interface PostResponse {
    id: number;
    title: string;
    preview: string;
    gptSummary: string;
    twoLineSummary: string;
    imageUrl: string;
    url: string;
    techBlogName: string;
    category: string;
    tags: string[];
    createdAt: number[];
    viewCnt: number;
    score?: number | null;
  }

  export let comprehensiveAnswer: string = '';
  export let citations: CitationInfo[] = [];
  export let relatedPosts: PostResponse[] = [];



  const dispatch = createEventDispatcher<{
    citationClick: { postId: number };
  }>();

  function processCitationText(text: string): string {
    if (!text) return '';
    if (!relatedPosts || !Array.isArray(relatedPosts)) return text;

    // <br> 태그를 개행 문자로 변환하여 마크다운 리스트가 올바르게 파싱되도록 함
    let processedText = text.replace(/<br\s*\/?>/gi, '\n');
    
    // 2. {{POST_ID:숫자}} 패턴을 마크다운 변환 전에 먼저 처리
    const postIdPattern = /\{\{POST_ID:(\d+)\}\}/g;
    
    processedText = processedText.replace(postIdPattern, (match, postId) => {
      const postIdNumber = parseInt(postId);
      
      // 관련 포스트에서 해당 ID를 가진 포스트가 있는지 확인
      const relatedPost = relatedPosts.find(post => post && post.id === postIdNumber);
      
      if (relatedPost) {
        // 마크다운에서 링크로 해석되지 않도록 안전한 형태로 변경
        return `POSTID${postId}BUTTON`;
      }
      
      // 관련 포스트에 없으면 일반 텍스트로 표시
      return `POST #${postId}`;
    });
    
          try {
        // 마크다운 링크 패턴을 일반 텍스트로 변환하여 안전하게 처리
        processedText = processedText.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
        
        // 1. 마크다운을 HTML로 변환
        let markdownHtml = marked(processedText, {
          breaks: true,
          gfm: true,
          silent: true
        }) as string;
        
        // 3. 플레이스홀더를 실제 버튼으로 교체
        const placeholderPattern = /POSTID(\d+)BUTTON/g;
        markdownHtml = markdownHtml.replace(placeholderPattern, (match, postId) => {
          return `<button type="button" class="post-id-citation" data-post-id="${postId}" aria-label="POST_ID ${postId} 참조">POST #${postId}</button>`;
        });
        
        return markdownHtml;
      } catch (error) {
        return processedText;
      }
  }

  // 정규표현식 특수문자 이스케이프 함수
  function escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function handlePostIdClick(postId: number) {
    // 해당 포스트 상세 페이지로 이동
    const relatedPost = relatedPosts?.find(post => post && post.id === postId);
    if (relatedPost) {
      window.open(`/post/${postId}`, '_blank');
      
      // 이벤트 디스패치
      dispatch('citationClick', { postId });
    }
  }


</script>

<div class="comprehensive-answer-container">
  <!-- 종합 답변 섹션 -->
  <div class="answer-section mb-8">
    <div class="flex items-center gap-2 mb-4">
      <div class="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
        <span class="text-white text-sm font-bold">AI</span>
      </div>
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white">종합 답변</h2>
    </div>
    
    <div class="answer-content bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div 
        class="prose prose-gray dark:prose-invert max-w-none"
        role="region"
        aria-label="AI 답변 내용"
        tabindex="-1"
        on:click={(e) => {
          const target = e.target;
          if (target instanceof HTMLButtonElement) {
            e.preventDefault();
            e.stopPropagation();
            
            // POST_ID citation 클릭 처리
            if (target.classList.contains('post-id-citation')) {
              const postId = parseInt(target.dataset.postId || '0');
              if (postId > 0) {
                handlePostIdClick(postId);
              }
            }
            // 기존 citation marker 클릭 처리 (하위 호환성)
            else if (target.classList.contains('citation-marker')) {
              const citationNumber = parseInt(target.dataset.citation || '0');
              if (citationNumber > 0 && citations[citationNumber - 1]) {
                handlePostIdClick(citations[citationNumber - 1].postId);
              }
            }
          }
        }}
        on:keydown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            const target = e.target;
            if (target instanceof HTMLButtonElement) {
              e.preventDefault();
              e.stopPropagation();
              
              // POST_ID citation 클릭 처리
              if (target.classList.contains('post-id-citation')) {
                const postId = parseInt(target.dataset.postId || '0');
                if (postId > 0) {
                  handlePostIdClick(postId);
                }
              }
              // 기존 citation marker 클릭 처리 (하위 호환성)
              else if (target.classList.contains('citation-marker')) {
                const citationNumber = parseInt(target.dataset.citation || '0');
                if (citationNumber > 0 && citations[citationNumber - 1]) {
                  handlePostIdClick(citations[citationNumber - 1].postId);
                }
              }
            }
          }
        }}
      >
        {@html processCitationText(comprehensiveAnswer)}
      </div>
    </div>
  </div>


</div>

<style>
  :global(.citation-marker) {
    background-color: rgb(243 232 255);
    color: rgb(126 34 206);
    padding: 0.125rem 0.25rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    font-weight: 500;
    cursor: pointer;
    border: none;
    outline: none;
    transition: background-color 0.15s ease;
  }
  
  :global(.citation-marker:hover) {
    background-color: rgb(233 213 255);
  }
  
  :global(.citation-marker:focus) {
    box-shadow: 0 0 0 2px rgb(168 85 247), 0 0 0 4px rgb(168 85 247 / 0.2);
  }
  
  :global(.dark .citation-marker) {
    background-color: rgb(88 28 135 / 0.5);
    color: rgb(196 181 253);
  }
  
  :global(.dark .citation-marker:hover) {
    background-color: rgb(88 28 135 / 0.7);
  }

  :global(.post-id-citation) {
    background-color: rgb(219 234 254);
    color: rgb(29 78 216);
    padding: 0.25rem 0.5rem;
    border-radius: 0.375rem;
    font-size: 0.75rem;
    font-weight: 600;
    cursor: pointer;
    border: none;
    outline: none;
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    transition: all 0.2s ease;
  }
  
  :global(.post-id-citation:hover) {
    background-color: rgb(191 219 254);
  }
  
  :global(.post-id-citation:focus) {
    box-shadow: 0 0 0 2px rgb(59 130 246), 0 0 0 4px rgb(59 130 246 / 0.2);
  }
  
  :global(.dark .post-id-citation) {
    background-color: rgb(30 58 138 / 0.5);
    color: rgb(147 197 253);
  }
  
  :global(.dark .post-id-citation:hover) {
    background-color: rgb(30 58 138 / 0.7);
  }


</style>