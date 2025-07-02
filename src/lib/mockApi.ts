import type { Comment, User, NewComment, Reaction } from '$lib/types';

const users: User[] = [
	{ id: 'user1', name: 'Alice', avatarUrl: '/icons/default.png' },
	{ id: 'user2', name: 'Bob', avatarUrl: '/icons/default.png' },
];

let comments: Comment[] = [
	{
		id: 'comment1',
		author: users[0],
		content: '이것은 첫 번째 댓글입니다.',
		timestamp: new Date().toISOString(),
		reactions: [{ type: 'like', userId: 'user2' }],
		replies: [
			{
				id: 'reply1',
				author: users[1],
				content: '첫 번째 댓글에 대한 답글입니다.',
				timestamp: new Date().toISOString(),
				reactions: [],
				replies: [],
			},
		],
	},
	{
		id: 'comment2',
		author: users[1],
		content: '두 번째 댓글입니다. 이 댓글은 답글이 없습니다.',
		timestamp: new Date().toISOString(),
		reactions: [],
		replies: [],
	},
];

const findComment = (id: string, commentList: Comment[]): Comment | null => {
	for (const comment of commentList) {
		if (comment.id === id) return comment;
		const foundInReplies = findComment(id, comment.replies);
		if (foundInReplies) return foundInReplies;
	}
	return null;
};

export const mockApi = {
	getComments: (postId: string): Promise<Comment[]> =>
		new Promise((resolve) => {
			console.log(`[Mock API] Fetching comments for post: ${postId}`);
			setTimeout(() => resolve(JSON.parse(JSON.stringify(comments))), 500);
		}),

	addComment: (postId: string, newComment: NewComment): Promise<Comment> =>
		new Promise((resolve) => {
			console.log(`[Mock API] Adding comment to post: ${postId}`, newComment);
			const author = users.find((u) => u.id === newComment.authorId);
			if (!author) throw new Error('User not found');

			const comment: Comment = {
				id: `comment${Date.now()}`,
				author,
				content: newComment.content,
				timestamp: new Date().toISOString(),
				reactions: [],
				replies: [],
			};

			if (newComment.replyTo) {
				const parent = findComment(newComment.replyTo, comments);
				parent?.replies.push(comment);
			} else {
				comments.push(comment);
			}
			setTimeout(() => resolve(comment), 300);
		}),

	updateComment: (commentId: string, content: string): Promise<Comment> =>
		new Promise((resolve, reject) => {
			console.log(`[Mock API] Updating comment: ${commentId}`);
			const comment = findComment(commentId, comments);
			if (comment) {
				comment.content = content;
				setTimeout(() => resolve(comment), 300);
			} else {
				reject(new Error('Comment not found'));
			}
		}),

	toggleReaction: (commentId: string, userId: string, type: 'like' | 'dislike'): Promise<Comment> =>
		new Promise((resolve, reject) => {
			console.log(`[Mock API] Toggling reaction for comment: ${commentId}`);
			const comment = findComment(commentId, comments);
			if (comment) {
				const existingReactionIndex = comment.reactions.findIndex(
					(r) => r.userId === userId && r.type === type
				);

				if (existingReactionIndex > -1) {
					comment.reactions.splice(existingReactionIndex, 1);
				} else {
					// Remove other reaction type from the same user
					const otherReactionIndex = comment.reactions.findIndex((r) => r.userId === userId);
					if (otherReactionIndex > -1) {
						comment.reactions.splice(otherReactionIndex, 1);
					}
					comment.reactions.push({ type, userId });
				}
				setTimeout(() => resolve(comment), 200);
			} else {
				reject(new Error('Comment not found'));
			}
		}),
};
