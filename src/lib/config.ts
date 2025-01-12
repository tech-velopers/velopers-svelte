// 개발 환경에서는 localhost:8080을, 프로덕션에서는 상대 경로를 사용
export const API_BASE_URL = import.meta.env.DEV 
    ? 'http://localhost:8080'
    : '';

// API 엔드포인트 함수들
export const getApiUrl = (endpoint: string) => `${API_BASE_URL}${endpoint}`;

// 자주 사용되는 API 엔드포인트들
export const API_ENDPOINTS = {
    posts: '/api/posts',
    tags: '/api/tags',
    categories: '/api/categories',
    users: '/api/users',
} as const; 