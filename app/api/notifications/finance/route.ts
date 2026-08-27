import { NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { job_id } = (await request.json()) as { job_id?: string };
    if (!job_id) {
      return NextResponse.json({ error: "Job is required" }, { status: 400 });
    }

    const [{ data: requester }, { data: job }, { data: finance }, { data: task }] =
      await Promise.all([
        supabase.from("profiles").select("active").eq("id", user.id).single(),
        supabase
          .from("jobs")
          .select("id,job_number,customer_name,description,status")
          .eq("id", job_id)
          .single(),
        supabase
          .from("profiles")
          .select("id,full_name,email")
          .eq("role", "finance")
          .eq("active", true)
          .order("created_at")
          .limit(1)
          .single(),
        supabase
          .from("tasks")
          .select("id,notification_sent_at")
          .eq("job_id", job_id)
          .eq("title", "Create invoice and email customer")
          .single(),
      ]);

    if (!requester?.active || !job || job.status !== "production") {
      return NextResponse.json({ error: "Production job not found" }, { status: 404 });
    }
    if (!finance || !task) {
      return NextResponse.json({ error: "Active Finance user not found" }, { status: 409 });
    }
    if (task.notification_sent_at) {
      return NextResponse.json({ sent: false, duplicate: true });
    }

    const resendKey = process.env.RESEND_API_KEY;
    const from = process.env.FINANCE_NOTIFICATION_FROM;
    if (!resendKey || !from) {
      return NextResponse.json(
        { error: "Finance email notification needs Resend configuration." },
        { status: 503 },
      );
    }

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `finance-invoice-task-${task.id}`,
      },
      body: JSON.stringify({
        from,
        to: [finance.email],
        subject: `Invoice task assigned: ${job.job_number}`,
        text: `Hello ${finance.full_name},\n\n${job.job_number} (${job.customer_name}) has moved to Production. Please create the invoice and email it to the customer.\n\nJob: ${job.description}\n\nMN Maldives Job Portal`,
      }),
    });
    const emailResult = (await emailResponse.json()) as { id?: string; message?: string };
    if (!emailResponse.ok) {
      throw new Error(emailResult.message || "Email provider rejected the notification");
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const secret = process.env.SUPABASE_SECRET_KEY;
    if (!url || !secret) throw new Error("Server authentication is not configured");
    const admin = createAdminClient(url, secret, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { error } = await admin
      .from("tasks")
      .update({ notification_sent_at: new Date().toISOString() })
      .eq("id", task.id);
    if (error) throw error;

    return NextResponse.json({ sent: true, id: emailResult.id });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to send notification" },
      { status: 500 },
    );
  }
}
