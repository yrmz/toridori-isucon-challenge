import { Comment, Post, User } from "@prisma/client";

export interface ReqSession {
  csrfToken?: string;
  userId?: number;
}

export interface SessionUser extends User {
  csrfToken: string;
}

export interface CommentExt extends Comment {
  user: User;
}

export interface PostExt extends Post {
  user: User;
  commentCount: number;
  comments: CommentExt[];
}
