import type { CreateFairPayload, FairDetail, FairSummary } from "../types";

const API_BASE = "/api";

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

export async function createFair(payload: CreateFairPayload): Promise<FairSummary> {
  const res = await fetch(`${API_BASE}/fairs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error ?? "新建市集失败");
  }
  return res.json();
}
