export interface ApiResponse<T = unknown> {
  status: {
    code: number;
    message: string;
  };
  data: T;
}
