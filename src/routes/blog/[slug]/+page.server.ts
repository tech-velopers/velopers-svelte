import { getApiUrl } from '$lib/config';
import { error } from '@sveltejs/kit';
import type { ServerLoad } from '@sveltejs/kit';

export const load: ServerLoad = async ({ params }) => {
	const blogId = params.slug;
	
	try {
		// 블로그 ID 유효성 검사
		const id = parseInt(blogId);
		if (isNaN(id)) {
			throw error(400, '잘못된 블로그 ID입니다.');
		}
		
		// 모든 블로그 데이터 가져오기
		const response = await fetch(getApiUrl('/api/tech-blogs'));
		
		if (!response.ok) {
			throw error(500, '블로그 데이터를 불러오는데 실패했습니다.');
		}
		
		const blogs = await response.json();
		const blog = blogs.find((b: any) => b.id === id);
		
		if (!blog) {
			throw error(404, '블로그를 찾을 수 없습니다.');
		}
		
		return {
			blog
		};
	} catch (e) {
		console.error('블로그 로드 오류:', e);
		if (e instanceof Error && 'status' in e) {
			throw e; // SvelteKit error는 그대로 전달
		}
		throw error(500, '블로그를 불러오는데 실패했습니다.');
	}
}; 