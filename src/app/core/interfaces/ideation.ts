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
