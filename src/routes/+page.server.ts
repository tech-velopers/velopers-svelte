import { getApiUrl, API_ENDPOINTS } from '$lib/config';
import { error } from '@sveltejs/kit';
import type { ServerLoad } from '@sveltejs/kit';

export const load: ServerLoad = async ({ url }) => {
	// URL 파라미터 파싱
	const page = parseInt(url.searchParams.get('page') || '1');
	const category = url.searchParams.get('category') || 'all';
	const query = url.searchParams.get('query') || '';
	const blogsParam = url.searchParams.get('blogs') || '';
	const tagsParam = url.searchParams.get('tags') || '';
	
	// 블로그와 태그 파라미터 파싱
	const selectedBlogNames = blogsParam ? blogsParam.split(',').map(name => name.trim()).filter(Boolean) : [];
	const selectedTags = tagsParam ? tagsParam.split(',').map(tag => tag.trim()).filter(Boolean) : [];

	try {
		// 병렬로 모든 필요한 데이터 가져오기
		const [postsResponse, techBlogsResponse, tagsResponse] = await Promise.all([
			// Posts 데이터
			fetch(getApiUrl(API_ENDPOINTS.posts), {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					category: category,
					tags: selectedTags,
					blogs: selectedBlogNames,
					query: query,
					size: 10,
					page: page
				})
			}),
			// TechBlogs 데이터
			fetch(getApiUrl(API_ENDPOINTS.techBlogs)),
			// Tags 데이터
			fetch(getApiUrl(API_ENDPOINTS.allTags))
		]);

		// 응답 상태 확인
		if (!postsResponse.ok) {
			throw error(500, '포스트 데이터를 불러오는데 실패했습니다.');
		}
		if (!techBlogsResponse.ok) {
			throw error(500, '기술 블로그 데이터를 불러오는데 실패했습니다.');
		}
		if (!tagsResponse.ok) {
			throw error(500, '태그 데이터를 불러오는데 실패했습니다.');
		}

		// JSON 파싱
		const [postsData, techBlogsData, tagsData] = await Promise.all([
			postsResponse.json(),
			techBlogsResponse.json(),
			tagsResponse.json()
		]);

		return {
			// 포스트 데이터
			posts: postsData.content || [],
			totalPages: postsData.totalPages || 1,
			
			// 기술 블로그 데이터
			techBlogs: techBlogsData || [],
			
			// 태그 데이터
			allTags: tagsData || [],
			
			// URL 파라미터 (클라이언트에서 초기 상태 설정용)
			searchParams: {
				page,
				category,
				query,
				selectedBlogNames,
				selectedTags
			}
		};
	} catch (e) {
		console.error('데이터 로드 오류:', e);
		throw error(500, '데이터를 불러오는데 실패했습니다.');
	}
}; 