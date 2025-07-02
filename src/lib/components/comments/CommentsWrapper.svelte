<script lang="ts">
	import { setContext } from 'svelte';
	import { commentsStore } from '$lib/stores/comments';
	import type { Writable } from 'svelte/store';
	import type { Comment } from '$lib/types';

	import CommentForm from './CommentForm.svelte';
	import CommentItem from './CommentItem.svelte';

	export let postId: string;

	const store = commentsStore;
	setContext('commentsStore', store);

	$: ({ comments, loading, error } = $store);

	// Load comments when the component mounts
	import { onMount } from 'svelte';
	onMount(() => {
		store.loadComments(postId);
	});
</script>

<div class="space-y-6">
	<h2 class="text-2xl font-bold">댓글</h2>

	<!-- New Comment Form -->
	<CommentForm {postId} />

	<!-- Comments List -->
	{#if loading}
		<p>댓글을 불러오는 중...</p>
	{:else if error}
		<p class="text-red-500">{error}</p>
	{:else if comments.length === 0}
		<p>아직 댓글이 없습니다. 첫 댓글을 남겨보세요!</p>
	{:else}
		<div class="space-y-4">
			{#each comments as comment (comment.id)}
				<CommentItem {comment} />
			{/each}
		</div>
	{/if}
</div>
