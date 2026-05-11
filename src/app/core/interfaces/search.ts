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
        rows: any[];
        count: number;
      };
      groups?: {
        rows: any[];
        count: number;
      };
    };
    my?: {
      groups?: {
        rows: any[];
        count: number;
      };
      topics?: {
        rows: any[];
        count: number;
      };
    };
  };
  rows?: SearchResultUser[];
}
