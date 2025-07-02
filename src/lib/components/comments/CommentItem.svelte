<script lang="ts">
	import { getContext } from 'svelte';
	import type { Writable } from 'svelte/store';
	import type { Comment } from '$lib/types';
	import { commentsStore } from '$lib/stores/comments';

	import { Card, CardContent } from '$lib/components/ui/card';
	import { Avatar, AvatarImage, AvatarFallback } from '$lib/components/ui/avatar';
	import { Button } from '$lib/components/ui/button';
	import CommentForm from './CommentForm.svelte';
	import ReactionButtons from './ReactionButtons.svelte';
    import { sineIn } from 'svelte/easing';

	export let comment: Comment;

	const store = getContext<typeof commentsStore>('commentsStore');

	let isReplying = false;
	let isEditing = false;

	const timeAgo = (date: string) => {
		// Simple time ago function, you can use a library like date-fns for more accuracy
		const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
		let interval = seconds / 31536000;
		if (interval > 1) return Math.floor(interval) + '년 전';
		interval = seconds / 2592000;
		if (interval > 1) return Math.floor(interval) + '달 전';
		interval = seconds / 86400;
		if (interval > 1) return Math.floor(interval) + '일 전';
		interval = seconds / 3600;
		if (interval > 1) return Math.floor(interval) + '시간 전';
		interval = seconds / 60;
		if (interval > 1) return Math.floor(interval) + '분 전';
		return Math.floor(seconds) + '초 전';
	};
</script>

<Card class="overflow-hidden">
	<CardContent class="p-4">
		<div class="flex space-x-4">
			<Avatar>
				<AvatarImage src={comment.author.avatarUrl} alt={comment.author.name} />
				<AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
			</Avatar>
			<div class="flex-1">
				<div class="flex items-center justify-between">
					<p class="font-semibold">{comment.author.name}</p>
					<span class="text-xs text-muted-foreground">{timeAgo(comment.timestamp)}</span>
				</div>

				{#if isEditing}
					<CommentForm
						commentToEdit={comment}
						onFinish={() => (isEditing = false)}
					/>
				{:else}
					<p class="mt-2 text-sm">{comment.content}</p>
				{/if}

				<div class="mt-2 flex items-center space-x-4">
					<ReactionButtons commentId={comment.id} reactions={comment.reactions} />
					<Button variant="ghost" size="sm" on:click={() => (isReplying = !isReplying)}>답글</Button>
					<!-- Assuming user1 is the author for edit functionality -->
					{#if comment.author.id === 'user1'}
						<Button variant="ghost" size="sm" on:click={() => (isEditing = !isEditing)}>수정</Button>
					{/if}
				</div>
			</div>
		</div>

		<!-- Reply Form and Replies -->
		{#if isReplying}
			<div class="pl-14 mt-4" transition:slide={{duration: 300, easing: sineIn}}>
				<CommentForm
					replyTo={comment.id}
					onFinish={() => (isReplying = false)}
				/>
			</div>
		{/if}

		{#if comment.replies && comment.replies.length > 0}
			<div class="pl-14 mt-4 space-y-4">
				{#each comment.replies as reply (reply.id)}
					<svelte:self comment={reply} />
				{/each}
			</div>
		{/if}
	</CardContent>
</Card>
