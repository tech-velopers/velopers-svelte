export interface User {
  id: string;
  name: string;
  avatarUrl: string;
}

export interface Reaction {
  type: 'like' | 'dislike';
  userId: string;
}

export interface Comment {
  id: string;

  author: User;
  content: string;
  timestamp: string;
  reactions: Reaction[];
  replies: Comment[];
}

export interface NewComment {
  content: string;
  authorId: string;
  replyTo?: string;
}
