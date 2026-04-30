export interface TopicEvent {
  id: string;
  subject: string;
  text: string;
  createdAt: string;
  updatedAt: string;
  editMode?: boolean;
  origSubject?: string;
  origText?: string;
}
