import { writable } from 'svelte/store';
import type { Comment, NewComment } from '$lib/types';
import { mockApi } from '$lib/mockApi';

interface CommentsStore {
	comments: Comment[];
	loading: boolean;
	error: string | null;
}

function createCommentsStore() {
	const { subscribe, set, update } = writable<CommentsStore>({
		comments: [],
		loading: false,
		error: null,
	});

	const currentUser = { id: 'user1' }; // Assume a logged-in user

	const findAndUpdateComment = (
		comments: Comment[],
		commentId: string,
		updater: (comment: Comment) => Comment
	): Comment[] => {
		return comments.map((comment) => {
			if (comment.id === commentId) {
				return updater(comment);
			}
			if (comment.replies.length > 0) {
				comment.replies = findAndUpdateComment(comment.replies, commentId, updater);
			}
			return comment;
		});
	};

	return {
		subscribe,
		loadComments: async (postId: string) => {
			update((state) => ({ ...state, loading: true, error: null }));
			try {
				const comments = await mockApi.getComments(postId);
				set({ comments, loading: false, error: null });
			} catch (e) {
				const error = e instanceof Error ? e.message : 'Failed to load comments';
				set({ comments: [], loading: false, error });
			}
		},
		addComment: async (postId: string, content: string, replyTo?: string) => {
			const newCommentData: NewComment = {
				content,
				authorId: currentUser.id,
				replyTo,
			};
			const newComment = await mockApi.addComment(postId, newCommentData);
			update((state) => {
				if (replyTo) {
					return {
						...state,
						comments: findAndUpdateComment(state.comments, replyTo, (parent) => ({
							...parent,
							replies: [...parent.replies, newComment],
						})),
					};
				}
				return { ...state, comments: [...state.comments, newComment] };
			});
		},
		updateComment: async (commentId: string, content: string) => {
			const updatedComment = await mockApi.updateComment(commentId, content);
			update((state) => ({
				...state,
				comments: findAndUpdateComment(state.comments, commentId, () => updatedComment),
			}));
		},
		toggleReaction: async (commentId: string, type: 'like' | 'dislike') => {
			const updatedComment = await mockApi.toggleReaction(commentId, currentUser.id, type);
			update((state) => ({
				...state,
				comments: findAndUpdateComment(state.comments, commentId, () => updatedComment),
			}));
		},
	};
}

export const commentsStore = createCommentsStore();
