export interface VoteOption {
  id?: string;
  voteId?: string;
  value: string;
  voteCount?: number;
  ideaId?: string;
}

export interface Vote {
  id: string;
  topicId?: string;
  question: string; // Map to "description" in API
  description?: string | null; // API property name for question
  type: 'regular' | 'multiple' | 'ideation' | string;
  authType: 'soft' | 'hard';
  options: VoteOption[];
  delegationIsAllowed: boolean;
  maxChoices: number;
  minChoices: number;
  reminderTime?: string | Date | null;
  reminderSent?: string | Date | null;
  autoClose: {
    value: string;
    enabled: boolean;
  }[];
  endsAt: string | Date | null;
  votersCount?: number;
  createdAt?: string;
  updatedAt?: string;
  downloads?: { bdocFinal?: string; zipFinal?: string; csvVote?: string; bdocVote?: string; [k: string]: unknown };
}
export interface VoteWithOptions extends Omit<Vote, 'options'> {
  options: { rows: VoteOption[]; count?: number } | VoteOption[];
  votersCount?: number;
}
