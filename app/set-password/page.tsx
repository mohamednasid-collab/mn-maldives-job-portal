"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SetPassword() {
  const [password, setPassword] = useState(""); const [message, setMessage] = useState(""); const router = useRouter();
  async function submit(e: FormEvent) { e.preventDefault(); setMessage(""); const { error } = await createClient().auth.updateUser({ password }); if (error) { setMessage(error.message); return; } router.replace("/"); }
  return <main className="passwordPage"><form className="loginCard" onSubmit={submit}><span className="brandMark">MN</span><span className="eyebrow">ACCOUNT SETUP</span><h2>Create your password</h2><p>Choose a strong password with at least eight characters.</p><label>New password<input type="password" minLength={8} required value={password} onChange={e=>setPassword(e.target.value)}/></label>{message&&<div className="warning">{message}</div>}<button className="primary" type="submit">Activate account</button></form></main>;
}
