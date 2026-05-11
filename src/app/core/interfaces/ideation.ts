import { Idea } from './idea';

export interface IdeationFolder {
  id: string;
  ideationId: string;
  name: string;
  description?: string | null;
  ideas?: { count: number };
  createdAt?: string;
  updatedAt?: string;
}

export interface IdeaVoter {
  id: string;
  name: string;
  imageUrl?: string | null;
  value: number;
  vote?: string;
}

export interface IdeaComment {
  id: string;
  ideaId: string;
  ideationId: string;
  authorId: string;
  parentId?: string | null;
  subject?: string | null;
  text: string;
  type?: string;
  edits?: Record<string, { subject?: string | null; text?: string | null; createdAt?: string }> | { subject?: string | null; text?: string | null; createdAt?: string }[];
  replies?: { count: number; rows?: IdeaComment[] };
  report?: { id: string | null };
  votes?: { up: { count: number; selected: boolean }; down: { count: number; selected: boolean }; count: number };
  author?: { id: string; name: string; imageUrl?: string | null; email?: string | null };
  creator?: { id: string; name: string; imageUrl?: string | null; email?: string | null };
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  children?: IdeaComment[];
}

export interface IdeaReport {
  id: string;
  type: string | null;
  text: string | null;
  createdAt: string;
  moderatedReasonType?: string | null;
  moderatedReasonText?: string | null;
  idea?: Idea;
  comment?: IdeaComment;
}

export interface Ideation {
  id: string;
  question: string;
  creatorId: string;
  creator?: {
    id: string;
    name: string;
    imageUrl: string;
    email: string;
  };
  folders?: {
    count: number;
  };
  deadline: null | string | Date;
  createdAt: string | Date;
  updatedAt: string | Date;
  ideas?: {
    count: number;
  };
  disableReplies: boolean;
  allowAnonymous: boolean;
  template: string | null;
  demographicsConfig: Record<string, { required: boolean; value?: string }> | null;
}
