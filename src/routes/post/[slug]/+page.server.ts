import { getApiUrl } from '$lib/config';
import { error } from '@sveltejs/kit';
import type { ServerLoad } from '@sveltejs/kit';

export const load: ServerLoad = async ({ params }) => {
	const postId = params.slug;

	try {
		const postResPromise = fetch(getApiUrl(`/api/post/${postId}`));
		const relatedPostsResPromise = fetch(getApiUrl(`/api/post/${postId}/related`));

		const [postResponse, relatedPostsResponse] = await Promise.all([
			postResPromise,
			relatedPostsResPromise
		]);

		if (!postResponse.ok) {
			throw error(404, '포스트를 찾을 수 없습니다.');
		}

		const post = await postResponse.json();
		let relatedPosts = [];
		if (relatedPostsResponse.ok) {
			relatedPosts = await relatedPostsResponse.json();
		}

		return {
			post,
			relatedPosts
		};
	} catch (e) {
		console.error('포스트 로드 오류:', e);
		throw error(500, '포스트를 불러오는데 실패했습니다.');
	}
};