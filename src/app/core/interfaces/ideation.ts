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
}

export interface IdeaComment {
  id: string;
  ideaId: string;
  ideationId: string;
  authorId: string;
  parentId?: string | null;
  subject?: string | null;
  text?: string | null;
  edits?: Record<string, { subject?: string | null; text?: string | null; createdAt?: string }>;
  replies?: { count: number };
  report?: { id: string | null };
  votes?: { up: { count: number; selected: boolean }; down: { count: number; selected: boolean }; count: number };
  author?: { id: string; name: string; imageUrl?: string | null; email?: string | null };
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface IdeaReport {
  id: string;
  type: string | null;
  text: string | null;
  createdAt: string;
  moderatedReasonType?: string | null;
  moderatedReasonText?: string | null;
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
