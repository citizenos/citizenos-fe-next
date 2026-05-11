import { Topic } from './topic';
import { Group } from './group';

export interface SearchResultUser {
  id?: string;
  userId?: string;
  name: string;
  email?: string;
  imageUrl?: string;
}

export interface SearchResults {
  results: {
    public?: {
      users?: {
        rows: SearchResultUser[];
        count: number;
      };
      topics?: {
        rows: Topic[];
        count: number;
      };
      groups?: {
        rows: Group[];
        count: number;
      };
    };
    my?: {
      groups?: {
        rows: Group[];
        count: number;
      };
      topics?: {
        rows: Topic[];
        count: number;
      };
    };
  };
  rows?: SearchResultUser[];
}
