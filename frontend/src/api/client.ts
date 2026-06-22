import type { CreateFairPayload, Booth, FairDetail, FairSummary, FieldErrors, UpdateBoothPayload } from "../types";

const API_BASE = "/api";

/**
 * 接口校验错误，包含字段级错误详情。
 */
export class ValidationError extends Error {
  readonly details: FieldErrors;

  constructor(message: string, details: FieldErrors) {
    super(message);
    this.name = "ValidationError";
    this.details = details;
  }
}

/**
 * 获取全部市集列表。
 */
export async function fetchFairs(): Promise<FairSummary[]> {
  const res = await fetch(`${API_BASE}/fairs`);
  if (!res.ok) {
    throw new Error("加载市集列表失败");
  }
  return res.json();
}

/**
 * 获取单届市集详情。
 * @param id - 市集 ID
 */
export async function fetchFair(id: number): Promise<FairDetail> {
  const res = await fetch(`${API_BASE}/fairs/${id}`);
  if (!res.ok) {
    throw new Error("加载市集详情失败");
  }
  return res.json();
}

/**
 * 新建市集。
 * @param payload - 市集信息（名称、日期、城市）
 * @throws {ValidationError} 字段校验失败时抛出，包含字段级错误详情
 * @throws {Error} 其他网络或服务端错误
 */
export async function createFair(payload: CreateFairPayload): Promise<FairSummary> {
  const res = await fetch(`${API_BASE}/fairs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    if (data?.details && typeof data.details === "object") {
      throw new ValidationError(data.error ?? "参数校验失败", data.details as FieldErrors);
    }
    throw new Error(data?.error ?? "新建市集失败");
  }
  return res.json();
}

/**
 * 更新摊位信息。
 * @param fairId - 市集 ID
 * @param oldBoothNumber - 原摊位号
 * @param payload - 摊位信息（新摊位号、作品名、销量备注）
 * @throws {ValidationError} 字段校验失败时抛出，包含字段级错误详情
 * @throws {Error} 其他网络或服务端错误
 */
export async function updateBooth(
  fairId: number,
  oldBoothNumber: string,
  payload: UpdateBoothPayload,
): Promise<Booth> {
  const encodedNumber = encodeURIComponent(oldBoothNumber);
  const res = await fetch(`${API_BASE}/fairs/${fairId}/booths/${encodedNumber}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    if (data?.details && typeof data.details === "object") {
      throw new ValidationError(data.error ?? "参数校验失败", data.details as FieldErrors);
    }
    throw new Error(data?.error ?? "更新摊位失败");
  }
  return res.json();
}
