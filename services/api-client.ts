import axios, { type AxiosProgressEvent } from "axios";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/** Turns a FastAPI `detail` into readable text. Handles the plain-string form and the
 * 422 validation form (`[{ loc: [...], msg: "..." }, ...]`). */
export function formatErrorDetail(detail: unknown, fallback: string): string {
  if (typeof detail === "string" && detail.trim()) {
    return detail;
  }
  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object" && "msg" in item) {
          const loc = Array.isArray(item.loc)
            ? item.loc.filter((part: unknown) => part !== "body").join(".")
            : "";
          return loc ? `${loc}: ${item.msg}` : String(item.msg);
        }
        return null;
      })
      .filter(Boolean);
    if (messages.length) return messages.join("; ");
  }
  return fallback || "Something went wrong";
}

async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const data = await response.json();
    return formatErrorDetail(data?.detail, response.statusText);
  } catch {
    return response.statusText || "Something went wrong";
  }
}

/** Thin wrapper around the `/api/backend/*` BFF proxy — same-origin, so the
 * session cookie is sent automatically; never talks to FastAPI directly. */
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api/backend/${path}`, {
    ...init,
    headers: {
      ...(init?.body && !(init.body instanceof FormData) ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });

  if (!response.ok) {
    throw new ApiError(response.status, await parseErrorMessage(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

/** Multipart upload through the same `/api/backend/*` proxy, with upload-progress reporting
 * (which `fetch` can't provide). Errors are normalised to `ApiError` exactly like `apiFetch`. */
export async function apiUpload<T>(
  path: string,
  formData: FormData,
  {
    method = "POST",
    onProgress,
  }: { method?: "POST" | "PUT"; onProgress?: (percent: number) => void } = {},
): Promise<T> {
  try {
    const { data } = await axios.request<T>({
      url: `/api/backend/${path}`,
      method,
      data: formData,
      onUploadProgress: (event: AxiosProgressEvent) => {
        if (onProgress && event.total) {
          onProgress(Math.round((event.loaded / event.total) * 100));
        }
      },
    });
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status ?? 0;
      const fallback = status ? error.response?.statusText || error.message : "Network error — upload failed";
      throw new ApiError(status, formatErrorDetail(error.response?.data?.detail, fallback));
    }
    throw error;
  }
}

/** Best-effort readable message for any thrown value. */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return "Something went wrong";
}
