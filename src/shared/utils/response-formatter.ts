interface APIResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  errors?: unknown;
}

export function formatResponse<T>(
  statusCode: number,
  message: string,
  data?: T,
  errors?: Array<{
    path: string;
    message: string;
  }>
): APIResponse<T> {
  return {
    success: statusCode >= 200 && statusCode < 300,
    statusCode,
    message,
    data,
    errors,
  };
}
