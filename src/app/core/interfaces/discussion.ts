export interface Discussion {
  id: string;
  question: string;
  deadline: string | Date | null;
  creatorId: string;
  createdAt: string;
  updatedAt: string;
  comments?: {
    count: number;
  };
}

export interface DiscussionData {
  topicId?: string;
  question?: string;
  deadline?: string | Date | null;
}

export interface ArgumentCreator {
  id: string;
  name: string;
  imageUrl?: string | null;
  company?: string | null;
}

export interface ArgumentCount {
  total: number;
  pro: number;
  con: number;
  poi: number;
  reply: number;
}

export interface ArgumentReport {
  id: string | null;
  type?: string | null;
  text?: string | null;
  moderatedReasonType?: string | null;
  moderatedReasonText?: string | null;
  comment?: Argument;
}

export interface Argument {
  id: string;
  topicId?: string;
  discussionId?: string;
  parentId?: string | null;
  type: string;
  subject?: string | null;
  text?: string | null;
  edits?: Record<string, { subject?: string | null; text?: string | null; createdAt?: string }>;
  creator?: ArgumentCreator;
  deletedAt?: string | null;
  deletedBy?: { id: string | null; name: string | null };
  deletedReasonType?: string | null;
  deletedReasonText?: string | null;
  replies?: { count: number; rows: Argument[] };
  votes?: { up: { count: number; selected: boolean }; down: { count: number; selected: boolean }; count: number };
  report?: ArgumentReport;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateTopicDiscussion {
  topicId?: string;
  discussionId?: string;
  deadline?: string | null;
}