export const STATUSES = ["initial", "design", "production", "shipped", "delivered", "unpaid", "completed"] as const;
export const FACTORIES = ["SWIFT", "DAYOUT", "INUK", "CAPTAIN", "INC9000"] as const;
export type JobStatus = typeof STATUSES[number];
export type AppRole = "super_admin" | "admin" | "finance" | "staff";

export interface Profile { id: string; full_name: string; email: string; role: AppRole; active: boolean; }
export interface Job {
  id: string; job_number: string; customer_name: string; customer_phone: string | null;
  description: string; status: JobStatus; assigned_admin_id: string | null; designer_name: string | null;
  factory_id: string | null; next_task: string | null; created_at: string; updated_at: string;
  quotation_number: string | null; invoice_number: string | null; invoice_total: number;
  amount_paid: number; payment_status: "unpaid" | "part_paid" | "paid"; due_date: string | null;
  notes: string | null; assignee?: { full_name: string } | null; factory?: { name: string } | null;
}
