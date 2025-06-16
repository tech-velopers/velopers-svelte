import { getApiUrl } from '$lib/config';

/**
 * 사용자 활동 로깅을 위한 유틸리티 클래스
 * Svelte 프로젝트에서 사용할 수 있습니다.
 */
export class ActivityLogger {
  private endpoint: string;
  private sessionId: string;
  private isDevelopment: boolean;

  constructor() {
    this.endpoint = getApiUrl('/api/activity/log');
    this.sessionId = this.getOrCreateSessionId();
    
    // 개발 환경 여부 확인 (Vite는 import.meta.env 사용)
    this.isDevelopment = import.meta.env.MODE === 'dev' ||
                         import.meta.env.MODE === 'development' ||
                         import.meta.env.MODE === 'qa' ||
                         (typeof window !== 'undefined' && 
                          (window.location.hostname === 'localhost' ||
                           window.location.hostname === '127.0.0.1'));
                         
    if (this.isDevelopment) {
      console.log('[ActivityLogger] 개발 환경 감지: 로그는 로컬스토리지에만 저장되고 서버로 전송되지 않습니다.');
    }
  }

  /**
   * 세션 ID를 가져오거나 생성합니다.
   */
  private getOrCreateSessionId(): string {
    if (typeof localStorage === 'undefined') {
      return this.generateUUID(); // SSR에서는 임시 ID 사용
    }
    
    let sessionId = localStorage.getItem('session_id');
    if (!sessionId) {
      sessionId = this.generateUUID();
      localStorage.setItem('session_id', sessionId);
    }
    return sessionId;
  }

  /**
   * UUID를 생성합니다.
   */
  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * 사용자 활동을 로깅합니다.
   */
  async logActivity(activityData: {
    activityType: string;
    targetType: string;
    targetId?: number;
    targetUrl?: string;
    targetName?: string;
    searchQuery?: string;
    extraData?: Record<string, any>;
  }): Promise<void> {
    try {
      const userId = this.getCurrentUserId();
      const referrerUrl = document.referrer || null;
      
      const payload = {
        userId: userId,
        sessionId: this.sessionId,
        activityType: activityData.activityType,
        targetType: activityData.targetType,
        targetId: activityData.targetId || undefined,
        targetName: activityData.targetName || null,
        targetUrl: activityData.targetUrl || window.location.href,
        searchQuery: activityData.searchQuery || null,
        referrerUrl: referrerUrl,
        extraData: activityData.extraData ? JSON.stringify(activityData.extraData) : null
      };

      // 로컬스토리지에 저장 (모든 환경에서)
      this.saveToLocalStorage(payload);
      
      // 콘솔에 로깅 (모든 환경에서)
      console.log('[ActivityLogger] 활동 로그:', payload);
      
      // 개발 환경에서는 API 전송 생략
      if (this.isDevelopment) {
        console.log('[ActivityLogger] 개발 환경: API 서버로 로그 전송 생략');
        return;
      }
      
      // API URL 확인 로깅
      console.log('[ActivityLogger] API URL:', this.endpoint);
      
      // API 서버에 로그 전송 (개발 환경이 아닌 경우에만)
      try {
        const response = await fetch(this.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload),
          credentials: 'include' // 쿠키를 포함하여 요청
        });

        if (!response.ok) {
          console.error('[ActivityLogger] 로깅 실패:', response.status, response.statusText);
          try {
            const errorText = await response.text();
            console.error('[ActivityLogger] 에러 상세:', errorText);
          } catch (textError) {
            console.error('[ActivityLogger] 응답 에러 정보를 읽을 수 없음');
          }
        } else {
          console.log('[ActivityLogger] 로깅 성공');
        }
      } catch (fetchError) {
        console.error('[ActivityLogger] 네트워크 요청 오류:', fetchError);
        console.log('[ActivityLogger] 서버가 실행 중인지 확인하세요');
      }
    } catch (error) {
      console.error('[ActivityLogger] 활동 로깅 중 오류 발생:', error);
    }
  }

  /**
   * 로컬스토리지에 활동 로그 저장 (임시 방편)
   */
  private saveToLocalStorage(payload: any): void {
    try {
      // 기존 로그 가져오기
      const logsStr = localStorage.getItem('activity_logs');
      const logs = logsStr ? JSON.parse(logsStr) : [];
      
      // 최대 100개까지만 저장 (오래된 로그 제거)
      if (logs.length >= 100) {
        logs.shift();
      }
      
      // 새 로그 추가
      logs.push({
        ...payload,
        timestamp: new Date().toISOString()
      });
      
      // 로컬스토리지에 저장
      localStorage.setItem('activity_logs', JSON.stringify(logs));
    } catch (error) {
      console.error('[ActivityLogger] 로컬스토리지 저장 실패:', error);
    }
  }

  /**
   * 현재 로그인한 사용자의 ID를 가져옵니다.
   */
  private getCurrentUserId(): string | null {
    const userInfo = localStorage.getItem('user_info');
    if (userInfo) {
      try {
        const user = JSON.parse(userInfo);
        return user.id || null;
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  /**
   * 페이지 조회 활동을 로깅합니다.
   * @param targetType 페이지 유형 (예: 'POST', 'TAG', 'PROFILE')
   * @param targetId 페이지 ID
   */
  logPageView(targetType: string, targetId?: number): void {
    this.logActivity({
      activityType: 'VIEW',
      targetType: targetType,
      targetId: targetId,
      targetUrl: window.location.href
    });
  }

  /**
   * 클릭 활동을 로깅합니다.
   * @param targetType 클릭한 요소 유형
   * @param targetId 클릭한 요소 ID
   * @param targetName 클릭한 요소 이름
   * @param extraData 추가 정보
   */
  logClick(targetType: string, targetId?: number, targetName?: string, extraData?: Record<string, any>): void {
    this.logActivity({
      activityType: 'CLICK',
      targetType: targetType,
      targetId: targetId,
      targetName: targetName,
      extraData: extraData
    });
  }

  /**
   * 검색 활동을 로깅합니다.
   * @param searchQuery 검색어
   * @param targetType 검색 유형
   */
  logSearch(searchQuery: string, targetType: string = 'SEARCH'): void {
    this.logActivity({
      activityType: 'SEARCH',
      targetType: targetType,
      searchQuery: searchQuery
    });
  }
}

// 싱글톤 인스턴스 생성
const logger = new ActivityLogger();
export default logger; 