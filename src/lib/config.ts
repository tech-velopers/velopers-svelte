export const API_BASE_URL = import.meta.env.DEV 
    ? 'http://localhost:8080'
    : 'http://velopers.kr';

// API 엔드포인트 함수들
export const getApiUrl = (endpoint: string) => `${API_BASE_URL}${endpoint}`;

// 자주 사용되는 API 엔드포인트들
export const API_ENDPOINTS = {
    posts: '/api/posts',
    tags: '/api/tags',
    categories: '/api/categories',
    users: '/api/users',
} as const; 