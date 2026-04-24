export interface Discussion {
  id: string;
  question: string;
  deadline: string | null;
  creatorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface DiscussionData {
  question: string;
  deadline: string | null;
}
