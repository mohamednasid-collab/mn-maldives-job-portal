import { NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { AppRole } from "@/lib/types";

const allowedRoles: AppRole[] = ["admin", "finance", "staff"];

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    const { data: requester } = await supabase.from("profiles").select("role,active").eq("id", user.id).single();
    if (!requester?.active || requester.role !== "super_admin") return NextResponse.json({ error: "Super administrator access required" }, { status: 403 });

    const { email, full_name, role } = await request.json() as { email?: string; full_name?: string; role?: AppRole };
    if (!email || !full_name || !role || !allowedRoles.includes(role)) return NextResponse.json({ error: "Valid name, email, and role are required" }, { status: 400 });
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const secret = process.env.SUPABASE_SECRET_KEY;
    if (!url || !secret) return NextResponse.json({ error: "Server authentication is not configured" }, { status: 500 });

    const admin = createAdminClient(url, secret, { auth: { autoRefreshToken: false, persistSession: false } });
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
    const { data, error } = await admin.auth.admin.inviteUserByEmail(email.trim().toLowerCase(), {
      data: { full_name: full_name.trim() },
      redirectTo: `${siteUrl}/auth/callback?next=/set-password`,
    });
    if (error) throw error;
    if (!data.user) throw new Error("Invitation did not create a user");
    const [{ error: profileError }, { error: authError }] = await Promise.all([
      admin.from("profiles").update({ full_name: full_name.trim(), email: email.trim().toLowerCase(), role, active: true }).eq("id", data.user.id),
      admin.auth.admin.updateUserById(data.user.id, { app_metadata: { role } }),
    ]);
    if (profileError) throw profileError;
    if (authError) throw authError;
    return NextResponse.json({ id: data.user.id });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to invite user" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    const { data: requester } = await supabase
      .from("profiles")
      .select("role,active")
      .eq("id", user.id)
      .single();
    if (!requester?.active || requester.role !== "super_admin") {
      return NextResponse.json(
        { error: "Super administrator access required" },
        { status: 403 },
      );
    }

    const { id, display_name } = (await request.json()) as {
      id?: string;
      display_name?: string;
    };
    const name = display_name?.trim();
    if (!id || !name || name.length < 2 || name.length > 100) {
      return NextResponse.json(
        { error: "Display name must contain 2 to 100 characters" },
        { status: 400 },
      );
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const secret = process.env.SUPABASE_SECRET_KEY;
    if (!url || !secret) {
      return NextResponse.json(
        { error: "Server authentication is not configured" },
        { status: 500 },
      );
    }
    const admin = createAdminClient(url, secret, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const [{ error: profileError }, { error: authError }] = await Promise.all([
      admin.from("profiles").update({ full_name: name }).eq("id", id),
      admin.auth.admin.updateUserById(id, {
        user_metadata: { full_name: name },
      }),
    ]);
    if (profileError) throw profileError;
    if (authError) throw authError;
    return NextResponse.json({ id, display_name: name });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to update display name",
      },
      { status: 500 },
    );
  }
}
