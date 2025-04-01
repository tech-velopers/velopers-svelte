/**
 * 날짜 배열을 포맷팅된 문자열로 변환하는 함수
 * 
 * @param dateArray [year, month, day, hour, minute, second?] 형식의 날짜 배열
 * @returns 포맷팅된 날짜 문자열 (예: 2023년 3월 15일)
 */
export function formatDate(dateArray: number[]): string {
  // 필요한 값 추출, second가 없는 경우 0으로 설정
  const [year, month, day, hour, minute, second = 0] = dateArray;
  
  // Date 객체 생성
  const date = new Date(year, month - 1, day, hour, minute, second);
  
  // 한국어 로케일로 날짜 포맷팅
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * 문자열 형식의 날짜를 포맷팅된 문자열로 변환하는 함수
 * 
 * @param dateString ISO 형식 날짜 문자열 또는 Date 객체로 변환 가능한 날짜 문자열
 * @returns 포맷팅된 날짜 문자열 (예: 2023년 3월 15일)
 */
export function formatDateString(dateString?: string): string {
  if (!dateString) return '정보 없음';
  
  const date = new Date(dateString);
  
  // 유효한 날짜인지 확인
  if (isNaN(date.getTime())) return '유효하지 않은 날짜';
  
  // 한국어 로케일로 날짜 포맷팅
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * 날짜 배열을 상대적 시간 문자열로 변환하는 함수
 * 
 * @param dateArray [year, month, day, hour, minute, second?] 형식의 날짜 배열
 * @returns 상대적 시간 문자열 (예: 오늘, 어제, n일 전, n주 전)
 */
export function formatRelativeDate(dateArray?: number[]): string {
  if (!dateArray) return '정보 없음';
  
  const [year, month, day, hour = 0, minute = 0, second = 0] = dateArray;
  const date = new Date(year, month - 1, day, hour, minute, second);
  const now = new Date();
  
  // 오늘 날짜인 경우
  if (date.toDateString() === now.toDateString()) {
    return '오늘';
  }
  
  // 어제 날짜인 경우
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return '어제';
  }
  
  // 일주일 이내인 경우
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(now.getDate() - 7);
  if (date > oneWeekAgo) {
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    // 음수 일수가 나오는 경우 '오늘'로 표시
    return diffDays < 0 ? '오늘' : `${diffDays}일 전`;
  }
  
  // 한달 이내인 경우
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(now.getMonth() - 1);
  if (date > oneMonthAgo) {
    const diffWeeks = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24 * 7));
    // 음수 주수가 나오는 경우 '오늘'로 표시
    return diffWeeks < 0 ? '오늘' : `${diffWeeks}주 전`;
  }
  
  // 그 외의 경우
  return formatDate(dateArray);
}

/**
 * 날짜가 최근 업데이트되었는지 확인하는 함수
 * 
 * @param dateArray [year, month, day, hour, minute, second?] 형식의 날짜 배열
 * @param days 최근으로 간주할 일수 (기본값: 2)
 * @returns 최근 업데이트 여부
 */
export function isRecentlyUpdated(dateArray?: number[], days: number = 2): boolean {
  if (!dateArray) return false;
  
  const [year, month, day, hour = 0, minute = 0, second = 0] = dateArray;
  const date = new Date(year, month - 1, day, hour, minute, second);
  const now = new Date();
  
  const daysAgo = new Date();
  daysAgo.setDate(now.getDate() - days);
  return date > daysAgo;
}

/**
 * 날짜 배열을 ISO 문자열로 변환하는 함수
 * 
 * @param dateArray [year, month, day, hour, minute, second?] 형식의 날짜 배열
 * @returns ISO 형식의 날짜 문자열
 */
export function dateArrayToISOString(dateArray: number[]): string {
  const [year, month, day, hour = 0, minute = 0, second = 0] = dateArray;
  const date = new Date(year, month - 1, day, hour, minute, second);
  return date.toISOString();
} 