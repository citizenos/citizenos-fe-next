export interface Group {
  id: string;
  name: string;
  description: string;
  visibility: string;
  join: { token: string; level: string };
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  sourcePartnerId: string | null;
  sourcePartnerObjectId: string | null;
  permission: { level: string };
  creator: { id: string; name: string; imageUrl?: string | null };
  lastActivity: string | null;
  members: { users: { count: number }; groups: { count: number }; topics?: { count?: { inProgress?: number; ideation?: number; voting?: number; followUp?: number }; latest?: { id: string; title?: string | null } | null } };
  userLevel: string | null;
  imageUrl: string | null;
  language: string | null;
  country: string | null;
  categories: string[] | null;
  rules: string[];
  contact: string | null;
  favourite?: boolean | null;
  inviteMessage: string | null | undefined;
}
