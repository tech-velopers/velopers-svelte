import { getApiUrl, API_ENDPOINTS } from '$lib/config';
import { error } from '@sveltejs/kit';
import type { ServerLoad } from '@sveltejs/kit';

export const load: ServerLoad = async ({ params, url }) => {
	const blogId = params.slug;
	const page = parseInt(url.searchParams.get('page') || '1');
	
	try {
		// 블로그 ID 유효성 검사
		const id = parseInt(blogId);
		if (isNaN(id)) {
			throw error(400, '잘못된 블로그 ID입니다.');
		}

		// 페이지 유효성 검사
		if (isNaN(page) || page < 1) {
			throw error(400, '잘못된 페이지 번호입니다.');
		}
		
		// 모든 블로그 데이터 가져오기
		const blogsResponse = await fetch(getApiUrl(API_ENDPOINTS.techBlogs));
		
		if (!blogsResponse.ok) {
			throw error(500, '블로그 데이터를 불러오는데 실패했습니다.');
		}
		
		const blogs = await blogsResponse.json();
		const blog = blogs.find((b: any) => b.id === id);
		
		if (!blog) {
			throw error(404, '블로그를 찾을 수 없습니다.');
		}

		// 해당 블로그의 게시글 가져오기
		const postsResponse = await fetch(getApiUrl(API_ENDPOINTS.posts), {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				page: page,
				size: 10,
				blogs: [blog.techBlogName],
				tags: [],
				category: 'all',
				query: ''
			})
		});

		if (!postsResponse.ok) {
			throw error(500, '게시글 데이터를 불러오는데 실패했습니다.');
		}

		const postsData = await postsResponse.json();
		
		return {
			blog,
			posts: postsData.content || [],
			totalPages: postsData.totalPages || 1,
			currentPage: page
		};
	} catch (e) {
		console.error('블로그 로드 오류:', e);
		if (e instanceof Error && 'status' in e) {
			throw e; // SvelteKit error는 그대로 전달
		}
		throw error(500, '블로그를 불러오는데 실패했습니다.');
	}
}; 