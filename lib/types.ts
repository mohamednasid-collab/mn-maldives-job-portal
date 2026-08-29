export const STATUSES = ["initial", "design", "production", "shipped", "delivered", "unpaid", "incomplete", "cancelled", "completed"] as const;
export type JobStatus = typeof STATUSES[number];
export type AppRole = "super_admin" | "admin" | "finance" | "staff";

export interface Profile { id: string; full_name: string; email: string; role: AppRole; active: boolean; }
export interface FactoryRecord { id: string; name: string; active: boolean; }
export interface Item { id: string; code: string; name: string; rate: number; description: string | null; created_at: string; }
export interface JobProductionItem { quantity: number; item: Pick<Item, "id" | "code" | "name" | "rate" | "description"> | null; }
export interface DocumentItem { id?: string; description: string; detail: string | null; quantity: number; rate: number; position: number; }
export interface FinancialDocument { id: string; document_type: "quotation" | "invoice"; document_number: string; status: "draft" | "sent"; source_quotation_id: string | null; job_id: string | null; customer_name: string; customer_address: string | null; subject: string | null; issue_date: string; due_date: string | null; terms: string; discount_percent: number; amount_paid: number; notes: string | null; created_at: string; items: DocumentItem[]; }
export interface Payment { id: string; invoice_id: string; payment_date: string; amount: number; payment_method: string | null; reference: string | null; notes: string | null; created_at: string; invoice?: Pick<FinancialDocument, "id" | "document_number" | "customer_name" | "job_id" | "discount_percent" | "amount_paid" | "items"> | null; }
export interface Expense { id: string; expense_number: string; expense_date: string; job_id: string | null; category: string; vendor: string | null; description: string; amount: number; payment_method: string | null; reference: string | null; notes: string | null; created_at: string; job?: { job_number: string } | null; }
export interface Task { id: string; job_id: string; title: string; assigned_to: string | null; status: "todo" | "in_progress" | "done"; due_date: string | null; notification_sent_at: string | null; created_at: string; assignee?: { full_name: string } | null; job?: { job_number: string; customer_name: string } | null; }
export interface Job {
  id: string; job_number: string; customer_name: string; customer_phone: string | null; customer_email?: string | null; contact_person?: string | null;
  description: string; status: JobStatus; owner_id?: string | null; assigned_admin_id: string | null; designer_name: string | null;
  factory_id: string | null; next_task: string | null; created_at: string; updated_at: string;
  quotation_number: string | null; invoice_number: string | null; invoice_total: number;
  amount_paid: number; payment_status: "unpaid" | "part_paid" | "paid"; due_date: string | null;
  notes: string | null; cancellation_reason?: string | null; owner?: { full_name: string } | null; assignee?: { full_name: string } | null; factory?: { name: string } | null;
  production_items?: JobProductionItem[];
}
