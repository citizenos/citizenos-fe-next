export interface VoteOption {
  id?: string;
  voteId?: string;
  value: string;
  voteCount?: number;
}

export interface Vote {
  id: string;
  topicId?: string;
  question: string; // Map to "description" in API
  description?: string | null; // API property name for question
  type: 'regular' | 'multiple';
  authType: 'soft' | 'hard';
  options: VoteOption[];
  delegationIsAllowed: boolean;
  maxChoices: number;
  minChoices: number;
  reminderTime?: string | null;
  autoClose: {
    value: string;
    enabled: boolean;
  }[];
  endsAt: string | null;
  votersCount?: number;
  createdAt?: string;
  updatedAt?: string;
}
