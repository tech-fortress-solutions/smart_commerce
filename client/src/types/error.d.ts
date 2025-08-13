// types/errors.ts

// The shape of the server error response
export interface ServerErrorResponse {
  status: "error" | "success"; // you can add "success" if needed for other responses
  message: string;
}

// Optional: Axios error wrapper type
export interface AxiosErrorType extends Error {
  response?: {
    data: ServerErrorResponse;
    status: number; // HTTP status code
    statusText: string;
  };
}
