// src/utils/response.ts
// 统一 API 响应格式

export function jsonOk<T>(data: T, message: string = 'success') {
  return Response.json({
    code: 0,
    message,
    data,
  });
}

export function jsonError(message: string, code: number = 400, status: number = 400) {
  return Response.json(
    {
      code,
      message,
      data: null,
    },
    { status }
  );
}
