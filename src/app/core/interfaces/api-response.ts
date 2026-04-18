export interface ApiResponse<T = any> {
  status: {
    code: number;
    message: string;
  };
  data: T;
}
