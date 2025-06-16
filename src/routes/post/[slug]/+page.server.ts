import type { PageServerLoad } from './$types';
import { getApiUrl } from '$lib/config';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
	const postId = params.slug;
	
	try {
		const response = await fetch(getApiUrl(`/api/post/${postId}`));
		
		if (!response.ok) {
			throw error(404, '포스트를 찾을 수 없습니다.');
		}
		
		const post = await response.json();
		
		return {
			post
		};
	} catch (e) {
		console.error('포스트 로드 오류:', e);
		throw error(500, '포스트를 불러오는데 실패했습니다.');
	}
};