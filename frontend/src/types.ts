/** 字段级校验错误映射。 */
export interface FieldErrors {
  name?: string;
  date?: string;
  city?: string;
}

/** 新建市集的请求体。 */
export interface CreateFairPayload {
  name: string;
  date: string;
  city: string;
}

/** 市集摘要（列表项）。 */
export interface FairSummary {
  id: number;
  name: string;
  date: string;
  city: string;
}

/** 摊位信息。 */
export interface Booth {
  id: number;
  fair_id: number;
  booth_number: string;
  work_name: string;
  sales_notes: string;
}

/** 市集详情（含摊位）。 */
export interface FairDetail extends FairSummary {
  booths: Booth[];
}
