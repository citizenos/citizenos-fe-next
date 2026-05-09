export interface TopicCreator {
  id: string;
  name: string;
  imageUrl?: string | null;
  email?: string | null;
  company?: string | null;
}

export interface TopicVoteCast {
  options: { id: string; optionId?: string; selected?: boolean }[];
}

export interface TopicReport {
  id: string;
  type: string | null;
  text: string | null;
  moderatedReasonType: string | null;
  moderatedReasonText: string | null;
}

export interface TopicVote {
  id: string;
  votersCount?: number;
  type?: string;
  endsAt?: string | Date | null;
  reminderTime?: string | Date | null;
  reminderSent?: string | Date | null;
  options?: { rows: { id: string; value: string; voteCount?: number; selected?: boolean; optionId?: string; ideaId?: string; winner?: boolean }[]; count?: number };
  delegation?: { userId: string; toUserId: string; voteId: string; byProxy?: boolean } | null;
  maxChoices?: number;
  minChoices?: number;
  authType?: string;
  downloads?: { bdocFinal?: string; zipFinal?: string; [k: string]: unknown };
  description?: string | null;
  question?: string | null;
  delegationIsAllowed?: boolean;
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
  creator: TopicCreator;
  lastActivity: string | null;
  country: string | null;
  language: string | null;
  contact?: string | null;
  members: { users: { count: number }; groups: { count: number } };
  voteId: string | null;
  vote?: TopicVote;
  ideationId?: string | null;
  discussionId: string | null;
  comments: { count: number } | null;
  padUrl: string | null;
  favourite?: boolean | null;
  imageUrl: string | null;
  authors: TopicCreator[];
  report?: TopicReport;
}
