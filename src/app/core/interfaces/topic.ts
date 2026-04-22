export interface TopicReport {
  id: string;
  type: string | null;
  text: string | null;
  moderatedReasonType: string | null;
  moderatedReasonText: string | null;
}

export interface TopicVote {
  id: string;
  votersCount: number;
  type: string;
  [key: string]: unknown;
}

export interface Topic {
  id: string;
  title: string | null;
  intro: string | null;
  description: string;
  status: string;
  visibility: string;
  hashtag: string | null;
  join: { token: string; level: string };
  categories: string[];
  endsAt: string | null;
  createdAt: string;
  updatedAt: string;
  sourcePartnerId: string | null;
  sourcePartnerObjectId: string | null;
  permission: { level: string; levelGroup?: string };
  creator: any;
  lastActivity: string | null;
  country: string | null;
  language: string | null;
  members: { users: { count: number }; groups: { count: number } };
  voteId: string | null;
  vote?: TopicVote;
  ideationId?: string | null;
  discussionId: string | null;
  comments: { count: number } | null;
  padUrl: any;
  favourite?: boolean | null;
  imageUrl: string | null;
  authors: any[];
  report?: TopicReport;
}
