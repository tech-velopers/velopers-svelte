<script lang="ts">
	import { getContext } from 'svelte';
	import type { commentsStore } from '$lib/stores/comments';
	import type { Comment } from '$lib/types';

	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';

	export let postId: string | undefined = undefined;
	export let replyTo: string | undefined = undefined;
	export let commentToEdit: Comment | undefined = undefined;
	export let onFinish: () => void = () => {};

	const store = getContext<typeof commentsStore>('commentsStore');

	let content = commentToEdit ? commentToEdit.content : '';
	let isLoading = false;

	const handleSubmit = async () => {
		if (!content.trim()) return;
		isLoading = true;

		try {
			if (commentToEdit) {
				await store.updateComment(commentToEdit.id, content);
			} else {
				await store.addComment(postId!, content, replyTo);
			}
			content = '';
			onFinish();
		} catch (error) {
			console.error('Failed to submit comment:', error);
			// You might want to show an error message to the user
		} finally {
			isLoading = false;
		}
	};
</script>

<form on:submit|preventDefault={handleSubmit} class="flex items-start space-x-2">
	<Input
		type="text"
		bind:value={content}
		placeholder={replyTo ? '답글을 입력하세요...' : '댓글을 입력하세요...'}
		disabled={isLoading}
		class="flex-1"
	/>
	<Button type="submit" disabled={isLoading}>
		{isLoading ? '등록 중...' : commentToEdit ? '수정' : '등록'}
	</Button>
</form>
