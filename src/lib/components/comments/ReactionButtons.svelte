<script lang="ts">
	import { getContext } from 'svelte';
	import type { commentsStore } from '$lib/stores/comments';
	import type { Reaction } from '$lib/types';
	import { Button } from '$lib/components/ui/button';
	import { ThumbsUp, ThumbsDown } from 'lucide-svelte';

	export let commentId: string;
	export let reactions: Reaction[];

	const store = getContext<typeof commentsStore>('commentsStore');
	const currentUserId = 'user1'; // Assume a logged-in user

	$: likes = reactions.filter((r) => r.type === 'like').length;
	$: dislikes = reactions.filter((r) => r.type === 'dislike').length;

	$: userHasLiked = reactions.some((r) => r.userId === currentUserId && r.type === 'like');
	$: userHasDisliked = reactions.some((r) => r.userId === currentUserId && r.type === 'dislike');

	const handleReaction = (type: 'like' | 'dislike') => {
		store.toggleReaction(commentId, type);
	};
</script>

<div class="flex items-center space-x-2">
	<Button variant="ghost" size="sm" on:click={() => handleReaction('like')}>
		<ThumbsUp class="h-4 w-4 mr-1" fill={userHasLiked ? 'currentColor' : 'none'} />
		{likes}
	</Button>
	<Button variant="ghost" size="sm" on:click={() => handleReaction('dislike')}>
		<ThumbsDown class="h-4 w-4 mr-1" fill={userHasDisliked ? 'currentColor' : 'none'} />
		{dislikes}
	</Button>
</div>
