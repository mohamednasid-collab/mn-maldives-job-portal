"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  BriefcaseBusiness,
  Check,
  ChevronRight,
  ClipboardCheck,
  CreditCard,
  Download,
  Factory,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Printer,
  Receipt,
  Search,
  Settings,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  AppRole,
  DocumentItem,
  Expense,
  FactoryRecord,
  FinancialDocument,
  Job,
  JobStatus,
  Payment,
  Profile,
  STATUSES,
  Task,
} from "@/lib/types";

const demoJobs: Job[] = [
  {
    id: "1",
    job_number: "MN-2026-0041",
    customer_name: "Ocean Pearl Resort",
    customer_phone: "+960 771 2201",
    description: "Poolside directional signage",
    status: "design",
    assigned_admin_id: "meksie",
    designer_name: "Shifa",
    factory_id: "swift",
    next_task: "Send revised artwork for approval",
    created_at: "2026-08-22T10:00:00Z",
    updated_at: "2026-08-24T10:00:00Z",
    quotation_number: "QT-1041",
    invoice_number: null,
    invoice_total: 12800,
    amount_paid: 0,
    payment_status: "unpaid",
    due_date: null,
    notes: "Use weather-resistant finish.",
    assignee: { full_name: "Meksie" },
    factory: { name: "SWIFT" },
  },
  {
    id: "2",
    job_number: "MN-2026-0040",
    customer_name: "Atoll Market",
    customer_phone: "+960 992 8810",
    description: "Storefront lightbox and vinyl",
    status: "production",
    assigned_admin_id: "nasid",
    designer_name: "Ameen",
    factory_id: "inuk",
    next_task: "Confirm production completion date",
    created_at: "2026-08-20T10:00:00Z",
    updated_at: "2026-08-24T10:00:00Z",
    quotation_number: "QT-1040",
    invoice_number: "INV-1040",
    invoice_total: 18500,
    amount_paid: 9000,
    payment_status: "part_paid",
    due_date: "2026-09-03",
    notes: null,
    assignee: { full_name: "Nasid" },
    factory: { name: "INUK" },
  },
  {
    id: "3",
    job_number: "MN-2026-0039",
    customer_name: "Lagoon Café",
    customer_phone: "+960 778 9922",
    description: "Menu boards and table signs",
    status: "shipped",
    assigned_admin_id: "nasid",
    designer_name: "Maya",
    factory_id: "captain",
    next_task: "Arrange Malé delivery pickup",
    created_at: "2026-08-18T10:00:00Z",
    updated_at: "2026-08-23T10:00:00Z",
    quotation_number: "QT-1039",
    invoice_number: "INV-1039",
    invoice_total: 7200,
    amount_paid: 7200,
    payment_status: "paid",
    due_date: "2026-08-28",
    notes: "Fragile package.",
    assignee: { full_name: "Nasid" },
    factory: { name: "CAPTAIN" },
  },
  {
    id: "4",
    job_number: "MN-2026-0038",
    customer_name: "Coral House",
    customer_phone: "+960 991 2210",
    description: "Reception feature wall lettering",
    status: "unpaid",
    assigned_admin_id: "finance",
    designer_name: "Shifa",
    factory_id: "dayout",
    next_task: "Follow up outstanding balance",
    created_at: "2026-08-16T10:00:00Z",
    updated_at: "2026-08-22T10:00:00Z",
    quotation_number: "QT-1038",
    invoice_number: "INV-1038",
    invoice_total: 9600,
    amount_paid: 0,
    payment_status: "unpaid",
    due_date: "2026-08-23",
    notes: "Delivered 22 Aug.",
    assignee: { full_name: "Finance" },
    factory: { name: "DAYOUT" },
  },
  {
    id: "5",
    job_number: "MN-2026-0037",
    customer_name: "Manta Travel",
    customer_phone: "+960 777 4412",
    description: "Vehicle branding for two vans",
    status: "completed",
    assigned_admin_id: "finance",
    designer_name: "Ameen",
    factory_id: "inc9000",
    next_task: "Archive job documents",
    created_at: "2026-08-14T10:00:00Z",
    updated_at: "2026-08-20T10:00:00Z",
    quotation_number: "QT-1037",
    invoice_number: "INV-1037",
    invoice_total: 21400,
    amount_paid: 21400,
    payment_status: "paid",
    due_date: "2026-08-20",
    notes: null,
    assignee: { full_name: "Finance" },
    factory: { name: "INC9000" },
  },
  {
    id: "6",
    job_number: "MN-2026-0042",
    customer_name: "Island Sports Club",
    customer_phone: "+960 798 5566",
    description: "Event backdrop and sponsor boards",
    status: "initial",
    assigned_admin_id: "meksie",
    designer_name: null,
    factory_id: null,
    next_task: "Confirm measurements and deadline",
    created_at: "2026-08-24T10:00:00Z",
    updated_at: "2026-08-24T10:00:00Z",
    quotation_number: null,
    invoice_number: null,
    invoice_total: 0,
    amount_paid: 0,
    payment_status: "unpaid",
    due_date: null,
    notes: null,
    assignee: { full_name: "Meksie" },
    factory: null,
  },
];
const demoProfiles: Profile[] = [
  {
    id: "nasid",
    full_name: "Nasid",
    email: "nasid@mnmaldives.com",
    role: "super_admin",
    active: true,
  },
  {
    id: "meksie",
    full_name: "Meksie",
    email: "meksie@mnmaldives.com",
    role: "admin",
    active: true,
  },
  {
    id: "finance",
    full_name: "Finance",
    email: "finance@mnmaldives.com",
    role: "finance",
    active: true,
  },
];
const demoFactories: FactoryRecord[] = [
  "SWIFT",
  "DAYOUT",
  "INUK",
  "CAPTAIN",
  "INC9000",
].map((name) => ({ id: name.toLowerCase(), name, active: true }));
const labels: Record<string, string> = {
  initial: "Initial",
  design: "Design",
  production: "Production",
  shipped: "Shipped / RFD",
  delivered: "Delivered",
  unpaid: "Unpaid",
  incomplete: "Incomplete",
  completed: "Completed",
  part_paid: "Part-paid",
  paid: "Paid",
  quotation: "Quotation",
  invoice: "Invoice",
  super_admin: "Super admin",
  admin: "Administrator",
  finance: "Finance",
  staff: "Staff",
  todo: "To do",
  in_progress: "In progress",
  done: "Done",
};
const money = (n: number) =>
  `MVR ${Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const documentTotal = (document: FinancialDocument) => {
  const subtotal = document.items.reduce(
    (total, item) => total + Number(item.quantity) * Number(item.rate),
    0,
  );
  return subtotal * (1 - Number(document.discount_percent) / 100);
};
const initials = (n: string) =>
  n
    .split(/\s+/)
    .map((x) => x[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

type View =
  | "dashboard"
  | "board"
  | "tasks"
  | "quotations"
  | "invoices"
  | "expenses"
  | "users"
  | "factories";
type Notice = { kind: "success" | "error"; text: string } | null;

export default function Portal() {
  const demo =
    process.env.NEXT_PUBLIC_DEMO_MODE === "true" ||
    !process.env.NEXT_PUBLIC_SUPABASE_URL;
  const [profile, setProfile] = useState<Profile | null>(
    demo ? demoProfiles[0] : null,
  );
  const [loading, setLoading] = useState(!demo);
  const [jobs, setJobs] = useState<Job[]>(demo ? demoJobs : []);
  const [profiles, setProfiles] = useState<Profile[]>(demo ? demoProfiles : []);
  const [factories, setFactories] = useState<FactoryRecord[]>(
    demo ? demoFactories : [],
  );
  const [documents, setDocuments] = useState<FinancialDocument[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [view, setView] = useState<View>("dashboard");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [editing, setEditing] = useState<Job | null | undefined>(undefined);
  const [notice, setNotice] = useState<Notice>(null);
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    if (demo) return;
    void initialise();
  }, [demo]);
  async function initialise() {
    try {
      const sb = createClient();
      const {
        data: { user },
      } = await sb.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      const { data: p, error } = await sb
        .from("profiles")
        .select("id,full_name,email,role,active")
        .eq("id", user.id)
        .single();
      if (error || !p?.active) {
        await sb.auth.signOut();
        setLoading(false);
        return;
      }
      setProfile(p as Profile);
      await loadData();
    } catch (e) {
      show("error", e instanceof Error ? e.message : "Unable to load portal");
    } finally {
      setLoading(false);
    }
  }
  async function loadData() {
    if (demo) return;
    const sb = createClient();
    const [
      { data: j, error: je },
      { data: p, error: pe },
      { data: f, error: fe },
      { data: d, error: de },
      { data: x, error: xe },
      { data: y, error: ye },
      { data: t, error: te },
    ] = await Promise.all([
      sb
        .from("jobs")
        .select(
          "*,owner:profiles!jobs_owner_id_fkey(full_name),assignee:profiles!jobs_assigned_admin_id_fkey(full_name),factory:factories(name)",
        )
        .order("created_at", { ascending: false }),
      sb
        .from("profiles")
        .select("id,full_name,email,role,active")
        .eq("active", true)
        .order("full_name"),
      sb.from("factories").select("id,name,active").order("name"),
      sb
        .from("financial_documents")
        .select("*,items:financial_document_items(*)")
        .order("created_at", { ascending: false }),
      sb
        .from("expenses")
        .select("*,job:jobs(job_number)")
        .order("expense_date", { ascending: false }),
      sb
        .from("payments")
        .select(
          "*,invoice:financial_documents!payments_invoice_id_fkey(id,document_number,customer_name,job_id,discount_percent,amount_paid,items:financial_document_items(*))",
        )
        .order("payment_date", { ascending: false }),
      sb
        .from("tasks")
        .select(
          "*,assignee:profiles!tasks_assigned_to_fkey(full_name),job:jobs(job_number,customer_name)",
        )
        .order("created_at", { ascending: false }),
    ]);
    if (je) throw je;
    if (pe) throw pe;
    if (fe) throw fe;
    if (de) throw de;
    if (xe) throw xe;
    if (ye) throw ye;
    if (te) throw te;
    setJobs((j || []) as unknown as Job[]);
    setProfiles((p || []) as Profile[]);
    setFactories((f || []) as FactoryRecord[]);
    setDocuments((d || []) as unknown as FinancialDocument[]);
    setExpenses((x || []) as unknown as Expense[]);
    setPayments((y || []) as unknown as Payment[]);
    setTasks((t || []) as unknown as Task[]);
  }
  function show(
    kind: Notice extends infer _ ? "success" | "error" : "success",
    text: string,
  ) {
    setNotice({ kind, text });
    setTimeout(() => setNotice(null), 3500);
  }
  async function login(email: string, password: string) {
    setLoading(true);
    try {
      const sb = createClient();
      const { error } = await sb.auth.signInWithPassword({ email, password });
      if (error) throw error;
      await initialise();
    } catch (e) {
      show("error", e instanceof Error ? e.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  }
  async function logout() {
    if (!demo) await createClient().auth.signOut();
    setProfile(null);
  }
  const filtered = useMemo(
    () =>
      jobs.filter(
        (j) =>
          (!status || j.status === status) &&
          (!search ||
            [
              j.job_number,
              j.customer_name,
              j.description,
              j.invoice_number,
              j.assignee?.full_name,
            ]
              .join(" ")
              .toLowerCase()
              .includes(search.toLowerCase())),
      ),
    [jobs, search, status],
  );
  async function saveJob(input: Partial<Job>) {
    try {
      if (demo) {
        const assignee = profiles.find((p) => p.id === input.assigned_admin_id);
        const current = input.id ? jobs.find((j) => j.id === input.id) : null;
        const hasInvoice =
          Boolean(input.invoice_number?.trim()) ||
          documents.some(
            (document) =>
              document.document_type === "invoice" &&
              document.job_id === input.id,
          );
        const record = {
          ...(current || demoJobs[0]),
          ...input,
          id: input.id || crypto.randomUUID(),
          job_number:
            input.job_number ||
            `MN-${new Date().getFullYear()}-${String(Math.max(...jobs.map((j) => +j.job_number.slice(-4))) + 1).padStart(4, "0")}`,
          created_at: current?.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
          assignee: assignee ? { full_name: assignee.full_name } : null,
          owner_id: input.owner_id || profile?.id || null,
          owner: profiles.find((p) => p.id === (input.owner_id || profile?.id))
            ? {
                full_name: profiles.find(
                  (p) => p.id === (input.owner_id || profile?.id),
                )!.full_name,
              }
            : null,
          factory: input.factory_id
            ? { name: input.factory_id.toUpperCase() }
            : null,
          status: ["delivered", "completed"].includes(input.status || "")
            ? hasInvoice
              ? "completed"
              : "incomplete"
            : input.status,
        } as Job;
        setJobs(
          current
            ? jobs.map((j) => (j.id === record.id ? record : j))
            : [record, ...jobs],
        );
        setEditing(undefined);
        show("success", "Job saved in preview mode");
        return;
      }
      const sb = createClient();
      const payload = {
        customer_name: input.customer_name,
        customer_phone: input.customer_phone || null,
        description: input.description,
        status: input.status,
        owner_id: input.owner_id || profile?.id,
        assigned_admin_id: input.assigned_admin_id || null,
        designer_name: input.designer_name || null,
        factory_id: input.factory_id || null,
        next_task: input.next_task || null,
        quotation_number: input.quotation_number || null,
        invoice_number: input.invoice_number || null,
        invoice_total: Number(input.invoice_total) || 0,
        amount_paid: Number(input.amount_paid) || 0,
        payment_status: input.payment_status,
        due_date: input.due_date || null,
        notes: input.notes || null,
      };
      const q = input.id
        ? sb.from("jobs").update(payload).eq("id", input.id)
        : sb.from("jobs").insert(payload);
      const { data: saved, error } = await q.select("id").single();
      if (error) throw error;
      setEditing(undefined);
      await loadData();
      if (input.status === "production" && saved?.id) {
        const response = await fetch("/api/notifications/finance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ job_id: saved.id }),
        });
        if (!response.ok) {
          const result = (await response.json().catch(() => ({}))) as {
            error?: string;
          };
          show(
            "error",
            `Job saved and Finance task assigned. ${result.error || "Email notification is not configured."}`,
          );
          return;
        }
      }
      show("success", "Job saved successfully");
    } catch (e) {
      show("error", e instanceof Error ? e.message : "Unable to save job");
    }
  }
  async function removeJob(id: string) {
    if (!confirm("Delete this job permanently?")) return;
    try {
      if (demo) {
        setJobs(jobs.filter((j) => j.id !== id));
      } else {
        const { error } = await createClient()
          .from("jobs")
          .delete()
          .eq("id", id);
        if (error) throw error;
        await loadData();
      }
      setEditing(undefined);
      show("success", "Job deleted");
    } catch (e) {
      show("error", e instanceof Error ? e.message : "Unable to delete job");
    }
  }
  if (loading)
    return (
      <div className="loading">
        <div className="brandMark">MN</div>
        <p>Preparing your workspace…</p>
      </div>
    );
  if (!profile) return <Login onLogin={login} />;
  const operationsNav = [
    { id: "dashboard", label: "Dashboard", Icon: LayoutDashboard },
    { id: "board", label: "Status board", Icon: BarChart3 },
    { id: "tasks", label: "Tasks", Icon: ClipboardCheck },
  ] as const;
  const financeNav = [
    { id: "quotations", label: "Quotations", Icon: FileText },
    { id: "invoices", label: "Invoices", Icon: Receipt },
    { id: "expenses", label: "Expenses", Icon: Receipt },
  ] as const;
  const adminNav = [
    { id: "users", label: "Users", Icon: Users },
    { id: "factories", label: "Factories", Icon: Settings },
  ] as const;
  const nav = [
    ...operationsNav,
    ...financeNav,
    ...(profile.role === "super_admin" ? adminNav : []),
  ];
  const pageMeta: Record<View, [string, string]> = {
    dashboard: [
      "Operations overview",
      "Monitor jobs, payments and delivery progress.",
    ],
    board: ["Workflow board", "See every active job at a glance."],
    tasks: ["Team tasks", "Work assigned across the administrative team."],
    quotations: [
      "Quotations",
      "Create, send, print and convert customer quotations.",
    ],
    invoices: [
      "Invoices",
      "Create, send, edit and print customer invoices.",
    ],
    expenses: [
      "Expense records",
      "Record operational and job-related expenses.",
    ],
    users: ["User management", "Invite staff and control portal access."],
    factories: [
      "Manage factories",
      "Add, rename, activate or deactivate production partners.",
    ],
  };
  const canEdit = profile.role !== "staff",
    canFinance = ["super_admin", "admin", "finance"].includes(profile.role),
    canDelete = profile.role === "super_admin";
  return (
    <div className="shell">
      <aside className={menu ? "sidebar open" : "sidebar"}>
        <div className="brand">
          <span className="brandMark">MN</span>
          <span>MN MALDIVES</span>
          <button className="mobileClose" onClick={() => setMenu(false)}>
            <X />
          </button>
        </div>
        <nav>
          <NavGroup label="Operations" items={operationsNav} view={view} select={setView} close={() => setMenu(false)} />
          <NavGroup label="Finance" items={financeNav} view={view} select={setView} close={() => setMenu(false)} />
          {profile.role === "super_admin" && <NavGroup label="Administration" items={adminNav} view={view} select={setView} close={() => setMenu(false)} />}
        </nav>
        <div className="account">
          <span className="avatar">{initials(profile.full_name)}</span>
          <span>
            <strong>{profile.full_name}</strong>
            <small>{labels[profile.role]}</small>
          </span>
          <button onClick={logout} title="Sign out">
            <LogOut />
          </button>
        </div>
      </aside>
      {menu && (
        <button
          className="scrim"
          onClick={() => setMenu(false)}
          aria-label="Close navigation"
        />
      )}
      <main>
        <header className="top">
          <button className="menuBtn" onClick={() => setMenu(true)}>
            <Menu />
          </button>
          <div>
            <h1>{pageMeta[view][0]}</h1>
            <p>{pageMeta[view][1]}</p>
          </div>
          <div className="topActions">
            <button className="secondary" onClick={() => exportCsv(jobs)}>
              <Download /> <span>Export</span>
            </button>
            {canEdit &&
              !(
                [
                  "users",
                  "factories",
                  "quotations",
                  "invoices",
                  "expenses",
                ] as View[]
              ).includes(view) && (
                <button className="primary" onClick={() => setEditing(null)}>
                  <Plus /> New job
                </button>
              )}
          </div>
        </header>
        {demo && (
          <div className="demoBanner">
            <strong>Preview mode</strong>
            <span>
              Connect Supabase and set NEXT_PUBLIC_DEMO_MODE=false for live
              multi-user data.
            </span>
          </div>
        )}
        {view === "dashboard" && (
          <Dashboard
            jobs={jobs}
            documents={documents}
            filtered={filtered}
            search={search}
            setSearch={setSearch}
            status={status}
            setStatus={setStatus}
            open={setEditing}
          />
        )}
        {view === "board" && (
          <Board
            jobs={filtered}
            search={search}
            setSearch={setSearch}
            open={setEditing}
          />
        )}
        {view === "tasks" && (
          <Tasks tasks={tasks} jobs={filtered} profiles={profiles} open={setEditing} />
        )}
        {view === "quotations" && (
          <Documents
            mode="quotation"
            documents={documents}
            payments={payments}
            jobs={jobs}
            demo={demo}
            reload={loadData}
            show={show}
          />
        )}
        {view === "invoices" && (
          <Documents
            mode="invoice"
            documents={documents}
            payments={payments}
            jobs={jobs}
            demo={demo}
            reload={loadData}
            show={show}
          />
        )}
        {view === "expenses" && (
          <Expenses
            expenses={expenses}
            jobs={jobs}
            demo={demo}
            reload={loadData}
            show={show}
          />
        )}
        {view === "users" && profile.role === "super_admin" && (
          <UserAdmin
            profiles={profiles}
            demo={demo}
            reload={loadData}
            show={show}
          />
        )}
        {view === "factories" && profile.role === "super_admin" && (
          <FactoryAdmin
            factories={factories}
            demo={demo}
            setFactories={setFactories}
            reload={loadData}
            show={show}
          />
        )}
      </main>
      <nav className="mobileNav">
        {nav
          .filter(({ id }) =>
            ["dashboard", "quotations", "invoices", "expenses"].includes(id),
          )
          .map(({ id, label, Icon }) => (
          <button
            key={id}
            className={view === id ? "active" : ""}
            onClick={() => setView(id as View)}
          >
            <Icon />
            <span>{label}</span>
          </button>
          ))}
      </nav>
      {editing !== undefined && (
        <JobDrawer
          job={editing}
          currentUserId={profile.id}
          profiles={profiles}
          factories={factories}
          canFinance={canFinance}
          canDelete={canDelete}
          onClose={() => setEditing(undefined)}
          onSave={saveJob}
          onDelete={removeJob}
        />
      )}
      {notice && (
        <div className={`toast ${notice.kind}`}>
          {notice.kind === "success" ? <Check /> : <X />}
          {notice.text}
        </div>
      )}
    </div>
  );
}

function Login({
  onLogin,
}: {
  onLogin: (e: string, p: string) => Promise<void>;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  return (
    <div className="login">
      <section className="loginHero">
        <div className="brand">
          <span className="brandMark">MN</span>
          <span>MN MALDIVES</span>
        </div>
        <div>
          <h1>
            Every job.
            <br />
            One clear path.
          </h1>
          <p>
            From the first customer conversation to final delivery, keep your
            team, designers and factories aligned.
          </p>
        </div>
        <small>Administrative operations portal · Maldives</small>
      </section>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void onLogin(email, password);
        }}
      >
        <div className="loginCard">
          <span className="eyebrow">SECURE PORTAL</span>
          <h2>Welcome back</h2>
          <p>Sign in with the email address issued by your administrator.</p>
          <label>
            Email address
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@mnmaldives.com"
            />
          </label>
          <label>
            Password
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </label>
          <button className="primary" type="submit">
            Sign in <ChevronRight />
          </button>
          <small>Forgot your password? Contact your super administrator.</small>
        </div>
      </form>
    </div>
  );
}

function Stat({
  label,
  value,
  Icon,
  tone = "blue",
}: {
  label: string;
  value: string | number;
  Icon: typeof BriefcaseBusiness;
  tone?: string;
}) {
  return (
    <article className="stat">
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>Current records</small>
      </div>
      <i className={tone}>
        <Icon />
      </i>
    </article>
  );
}
function StatusPill({ value }: { value: string }) {
  return <span className={`pill ${value}`}>{labels[value] || value}</span>;
}
function DueDate({ date, status }: { date: string | null; status: JobStatus }) {
  if (!date)
    return (
      <span style={{ color: "var(--muted)", whiteSpace: "nowrap" }}>
        Not set
      </span>
    );
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const value = new Date(`${date}T00:00:00`);
  const overdue = value < today && status !== "completed";
  return (
    <span
      style={{
        display: "inline-grid",
        gap: 2,
        whiteSpace: "nowrap",
        fontSize: 12,
        fontWeight: 750,
        color: overdue ? "#bd3f36" : "#405766",
      }}
    >
      {value.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })}
      {overdue && (
        <small
          style={{
            color: "#bd3f36",
            fontSize: 9,
            fontWeight: 850,
            textTransform: "uppercase",
            letterSpacing: ".05em",
          }}
        >
          Overdue
        </small>
      )}
    </span>
  );
}
function Filters({
  search,
  setSearch,
  status,
  setStatus,
}: {
  search: string;
  setSearch: (v: string) => void;
  status?: string;
  setStatus?: (v: string) => void;
}) {
  return (
    <div className="filters">
      <label className="search">
        <Search />
        <input
          aria-label="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search job or customer"
        />
      </label>
      {setStatus && (
        <select
          aria-label="Filter status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {labels[s]}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
function Dashboard({
  jobs,
  documents,
  filtered,
  search,
  setSearch,
  status,
  setStatus,
  open,
}: {
  jobs: Job[];
  documents: FinancialDocument[];
  filtered: Job[];
  search: string;
  setSearch: (s: string) => void;
  status: string;
  setStatus: (s: string) => void;
  open: (j: Job) => void;
}) {
  const invoiceMissing = jobs.filter(
    (job) =>
      !job.invoice_number?.trim() &&
      !documents.some(
        (document) =>
          document.document_type === "invoice" && document.job_id === job.id,
      ),
  ).length;
  return (
    <>
      <div className="stats five">
        <Stat
          label="Active jobs"
          value={jobs.filter((j) => j.status !== "completed").length}
          Icon={BriefcaseBusiness}
        />
        <Stat
          label="In production"
          value={jobs.filter((j) => j.status === "production").length}
          Icon={Factory}
          tone="amber"
        />
        <Stat
          label="Incomplete"
          value={jobs.filter((j) => j.status === "incomplete").length}
          Icon={ClipboardCheck}
          tone="coral"
        />
        <Stat
          label="Invoice missing"
          value={invoiceMissing}
          Icon={Receipt}
          tone="coral"
        />
        <Stat
          label="Completed"
          value={jobs.filter((j) => j.status === "completed").length}
          Icon={Check}
          tone="green"
        />
      </div>
      <section className="sectionHead">
        <h2>Recent jobs</h2>
        <Filters {...{ search, setSearch, status, setStatus }} />
      </section>
      <JobTable jobs={filtered} documents={documents} open={open} />
    </>
  );
}
function JobTable({
  jobs,
  documents,
  open,
}: {
  jobs: Job[];
  documents: FinancialDocument[];
  open: (j: Job) => void;
}) {
  return (
    <div className="tableWrap responsiveTable">
      <table>
        <thead>
          <tr>
            <th>Job</th>
            <th>Customer</th>
            <th>Status</th>
            <th>Due date</th>
            <th>Owner</th>
            <th>Assigned to</th>
            <th>Factory</th>
            <th>Invoice number</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((j) => {
            const invoiceNumber =
              j.invoice_number ||
              documents.find(
                (document) =>
                  document.document_type === "invoice" &&
                  document.job_id === j.id,
              )?.document_number;
            return (
            <tr key={j.id} onClick={() => open(j)}>
              <td data-label="Job">
                <b className="jobNo">{j.job_number}</b>
              </td>
              <td data-label="Customer" className="customerCell">
                <strong>{j.customer_name}</strong>
                <small>{j.description}</small>
              </td>
              <td data-label="Status">
                <StatusPill value={j.status} />
              </td>
              <td data-label="Due date">
                <DueDate date={j.due_date} status={j.status} />
              </td>
              <td data-label="Owner">
                <span className="person">
                  <i>{initials(j.owner?.full_name || "—")}</i>
                  {j.owner?.full_name || "Unassigned"}
                </span>
              </td>
              <td data-label="Assigned to">
                <span className="person">
                  <i>{initials(j.assignee?.full_name || "—")}</i>
                  {j.assignee?.full_name || "Unassigned"}
                </span>
              </td>
              <td data-label="Factory">{j.factory?.name || "—"}</td>
              <td data-label="Invoice number">
                <strong style={{ color: invoiceNumber ? undefined : "#ba4035" }}>
                  {invoiceNumber || "Invoice missing"}
                </strong>
              </td>
            </tr>
            );
          })}
        </tbody>
      </table>
      {!jobs.length && <div className="empty">No matching jobs found.</div>}
    </div>
  );
}
function Board({
  jobs,
  search,
  setSearch,
  open,
}: {
  jobs: Job[];
  search: string;
  setSearch: (s: string) => void;
  open: (j: Job) => void;
}) {
  const stages: JobStatus[] = [...STATUSES];
  return (
    <>
      <section className="sectionHead">
        <h2>Workflow status board</h2>
        <Filters {...{ search, setSearch }} />
      </section>
      <div className="board">
        {stages.map((s) => {
          const list = jobs.filter((j) => j.status === s);
          return (
            <section className="column" key={s}>
              <header>
                <strong>{labels[s]}</strong>
                <span>{list.length}</span>
              </header>
              {list.map((j) => (
                <button className="jobCard" key={j.id} onClick={() => open(j)}>
                  <b>{j.job_number}</b>
                  <strong>{j.customer_name}</strong>
                  <small>{j.description}</small>
                  <footer>
                    <span>
                      Owner: {j.owner?.full_name || "—"} · {j.next_task || "No next task"}
                    </span>
                    <i>{initials(j.assignee?.full_name || "—")}</i>
                  </footer>
                </button>
              ))}
              {!list.length && <div className="empty small">No jobs</div>}
            </section>
          );
        })}
      </div>
    </>
  );
}
function Tasks({
  tasks,
  jobs,
  profiles,
  open,
}: {
  tasks: Task[];
  jobs: Job[];
  profiles: Profile[];
  open: (j: Job) => void;
}) {
  return (
    <>
      <section className="sectionHead">
        <h2>Administrative assignments</h2>
      </section>
      <div className="taskGrid">
        {profiles
          .filter((p) => ["super_admin", "admin", "finance"].includes(p.role))
          .map((p) => {
            const assignedJobs = jobs.filter(
              (j) => j.assigned_admin_id === p.id && j.status !== "completed",
            );
            const assignedTasks = tasks.filter(
              (task) => task.assigned_to === p.id && task.status !== "done",
            );
            return (
              <section className="taskLane" key={p.id}>
                <header>
                  <span className="person">
                    <i>{initials(p.full_name)}</i>
                    <strong>{p.full_name}</strong>
                  </span>
                  <b>{assignedJobs.length + assignedTasks.length}</b>
                </header>
                {assignedTasks.map((task) => {
                  const job = jobs.find((item) => item.id === task.job_id);
                  return (
                    <button
                      className="task"
                      key={task.id}
                      onClick={() => job && open(job)}
                    >
                      <strong>{task.title}</strong>
                      <small>
                        {task.job?.job_number || job?.job_number || "Job"} · {task.job?.customer_name || job?.customer_name || "Customer"}
                      </small>
                      <StatusPill value={task.status} />
                    </button>
                  );
                })}
                {assignedJobs.map((j) => (
                  <button className="task" key={j.id} onClick={() => open(j)}>
                    <strong>{j.next_task || "Review job"}</strong>
                    <small>
                      {j.job_number} · {j.customer_name}
                    </small>
                    <StatusPill value={j.status} />
                  </button>
                ))}
                {!assignedJobs.length && !assignedTasks.length && (
                  <div className="empty small">All clear</div>
                )}
              </section>
            );
          })}
      </div>
    </>
  );
}
function NavGroup({
  label,
  items,
  view,
  select,
  close,
}: {
  label: string;
  items: readonly { id: View; label: string; Icon: typeof LayoutDashboard }[];
  view: View;
  select: (view: View) => void;
  close: () => void;
}) {
  return (
    <div className="navGroup">
      <span className="navGroupLabel">{label}</span>
      {items.map(({ id, label: itemLabel, Icon }) => (
        <button
          key={id}
          className={view === id ? "active" : ""}
          onClick={() => {
            select(id);
            close();
          }}
        >
          <Icon />
          <span>{itemLabel}</span>
        </button>
      ))}
    </div>
  );
}

function Payments({
  payments,
  documents,
  demo,
  reload,
  show,
  search,
  setSearch,
}: {
  payments: Payment[];
  documents: FinancialDocument[];
  demo: boolean;
  reload: () => Promise<void>;
  show: (k: "success" | "error", t: string) => void;
  search: string;
  setSearch: (s: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const invoices = documents.filter((d) => d.document_type === "invoice");
  const invoiced = invoices.reduce((total, invoice) => total + documentTotal(invoice), 0);
  const paid = payments.reduce((total, payment) => total + Number(payment.amount), 0);
  const filteredPayments = payments.filter((payment) => {
    const term = search.toLowerCase();
    return (
      payment.invoice?.document_number.toLowerCase().includes(term) ||
      payment.invoice?.customer_name.toLowerCase().includes(term) ||
      payment.reference?.toLowerCase().includes(term)
    );
  });
  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = Object.fromEntries(new FormData(event.currentTarget));
    try {
      if (demo) {
        setOpen(false);
        show("success", "Payment simulated in preview mode");
        return;
      }
      const { error } = await createClient().from("payments").insert({
        invoice_id: form.invoice_id,
        payment_date: form.payment_date,
        amount: Number(form.amount),
        payment_method: form.payment_method || null,
        reference: form.reference || null,
        notes: form.notes || null,
      });
      if (error) throw error;
      setOpen(false);
      await reload();
      show("success", "Payment recorded against invoice");
    } catch (error) {
      show("error", error instanceof Error ? error.message : "Unable to record payment");
    }
  };
  return (
    <>
      <div className="stats three">
        <Stat
          label="Total invoiced"
          value={money(invoiced)}
          Icon={CreditCard}
        />
        <Stat
          label="Payments received"
          value={money(paid)}
          Icon={Check}
          tone="green"
        />
        <Stat
          label="Outstanding balance"
          value={money(invoiced - paid)}
          Icon={CreditCard}
          tone="coral"
        />
      </div>
      <section className="sectionHead">
        <h2>Invoice payments</h2>
        <div className="docActions">
          <Filters {...{ search, setSearch }} />
          <button className="primary" onClick={() => setOpen(true)}>
            <Plus /> Record payment
          </button>
        </div>
      </section>
      <div className="tableWrap responsiveTable">
        <table>
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Customer</th>
              <th>Payment date</th>
              <th>Method</th>
              <th>Reference</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.map((payment) => (
                <tr key={payment.id}>
                  <td data-label="Invoice">
                    <b className="jobNo">{payment.invoice?.document_number || "—"}</b>
                  </td>
                  <td data-label="Customer">
                    <strong>{payment.invoice?.customer_name || "—"}</strong>
                  </td>
                  <td data-label="Payment date">{formatDate(payment.payment_date)}</td>
                  <td data-label="Method">{payment.payment_method || "—"}</td>
                  <td data-label="Reference">{payment.reference || "—"}</td>
                  <td data-label="Amount"><strong>{money(payment.amount)}</strong></td>
                </tr>
              ))}
          </tbody>
        </table>
        {!filteredPayments.length && <div className="empty">No invoice payments recorded yet.</div>}
      </div>
      {open && (
        <div className="modal">
          <form className="drawer" onSubmit={save}>
            <header>
              <div><span className="eyebrow">FINANCE</span><h2>Record invoice payment</h2></div>
              <button type="button" className="iconBtn" onClick={() => setOpen(false)}><X /></button>
            </header>
            <div className="formGrid">
              <Field label="Invoice" wide>
                <select name="invoice_id" required defaultValue="">
                  <option value="" disabled>Select invoice</option>
                  {invoices.map((invoice) => {
                    const balance = Math.max(0, documentTotal(invoice) - Number(invoice.amount_paid));
                    return <option key={invoice.id} value={invoice.id} disabled={balance <= 0}>{invoice.document_number} · {invoice.customer_name} · Balance {money(balance)}</option>;
                  })}
                </select>
              </Field>
              <Field label="Payment date"><input name="payment_date" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} /></Field>
              <Field label="Amount"><input name="amount" type="number" min="0.01" step="0.01" required /></Field>
              <Field label="Payment method"><select name="payment_method"><option value="Bank transfer">Bank transfer</option><option value="Cash">Cash</option><option value="Cheque">Cheque</option><option value="Card">Card</option><option value="Other">Other</option></select></Field>
              <Field label="Reference"><input name="reference" placeholder="Transfer or receipt reference" /></Field>
              <Field label="Notes" wide><textarea name="notes" rows={3} /></Field>
            </div>
            <footer><button type="button" className="secondary" onClick={() => setOpen(false)}>Cancel</button><button className="primary" type="submit">Record payment</button></footer>
          </form>
        </div>
      )}
    </>
  );
}

function JobDrawer({
  job,
  currentUserId,
  profiles,
  factories,
  canFinance,
  canDelete,
  onClose,
  onSave,
  onDelete,
}: {
  job: Job | null;
  currentUserId: string;
  profiles: Profile[];
  factories: FactoryRecord[];
  canFinance: boolean;
  canDelete: boolean;
  onClose: () => void;
  onSave: (j: Partial<Job>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [form, setForm] = useState<Partial<Job>>(
    job
      ? {
          ...job,
          status: job.status === "unpaid" ? "incomplete" : job.status,
        }
      : {
          status: "initial",
          owner_id: currentUserId,
          payment_status: "unpaid",
          invoice_total: 0,
          amount_paid: 0,
        },
  );
  const set = (k: keyof Job, v: unknown) => setForm((f) => ({ ...f, [k]: v }));
  const available = factories.filter(
    (f) => f.active || f.id === form.factory_id,
  );
  return (
    <div
      className="modal"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <form
        className="drawer"
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          void onSave(form);
        }}
      >
        <header>
          <div>
            <span className="eyebrow">
              {job ? "JOB DETAILS" : "CREATE JOB"}
            </span>
            <h2>{job?.job_number || "New customer job"}</h2>
          </div>
          <button type="button" className="iconBtn" onClick={onClose}>
            <X />
          </button>
        </header>
        <FormSection title="Customer & job">
          <div className="formGrid">
            <Field label="Customer name">
              <input
                required
                value={form.customer_name || ""}
                onChange={(e) => set("customer_name", e.target.value)}
              />
            </Field>
            <Field label="Phone">
              <input
                value={form.customer_phone || ""}
                onChange={(e) => set("customer_phone", e.target.value)}
              />
            </Field>
            <Field label="Job description" wide>
              <textarea
                required
                rows={3}
                value={form.description || ""}
                onChange={(e) => set("description", e.target.value)}
              />
            </Field>
          </div>
        </FormSection>
        <FormSection title="Workflow & assignment">
          <div className="formGrid">
            <Field label="Status">
              <select
                value={form.status}
                onChange={(e) => set("status", e.target.value)}
              >
                {STATUSES.filter((s) => s !== "unpaid").map((s) => (
                  <option key={s} value={s}>
                    {labels[s]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Assign administrator">
              <select
                value={form.assigned_admin_id || ""}
                onChange={(e) => set("assigned_admin_id", e.target.value)}
              >
                <option value="">Unassigned</option>
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.full_name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Job owner">
              <select
                value={form.owner_id || currentUserId}
                onChange={(e) => set("owner_id", e.target.value)}
              >
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.full_name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Designer">
              <input
                value={form.designer_name || ""}
                onChange={(e) => set("designer_name", e.target.value)}
              />
            </Field>
            <Field label="Factory">
              <select
                value={form.factory_id || ""}
                onChange={(e) => set("factory_id", e.target.value)}
              >
                <option value="">Not assigned</option>
                {available.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                    {f.active ? "" : " (Inactive)"}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Assigned task / next action" wide>
              <input
                value={form.next_task || ""}
                onChange={(e) => set("next_task", e.target.value)}
              />
            </Field>
          </div>
        </FormSection>
        <FormSection title="Quotation, invoice & due date">
          <div className="warning">
            Delivered jobs move to Completed only when an invoice number exists.
            Otherwise the database moves them to Incomplete.
          </div>
          <fieldset disabled={!canFinance} className="formGrid">
            <Field label="Quotation number">
              <input
                value={form.quotation_number || ""}
                onChange={(e) => set("quotation_number", e.target.value)}
              />
            </Field>
            <Field label="Invoice number">
              <input
                value={form.invoice_number || ""}
                onChange={(e) => set("invoice_number", e.target.value)}
              />
            </Field>
            <Field label="Due date">
              <input
                type="date"
                value={form.due_date || ""}
                onChange={(e) => set("due_date", e.target.value)}
              />
            </Field>
          </fieldset>
          {!canFinance && (
            <small className="helper">
              Your account has read-only access to quotation, invoice and due
              date fields.
            </small>
          )}
          <Field label="Internal notes" wide>
            <textarea
              rows={3}
              value={form.notes || ""}
              onChange={(e) => set("notes", e.target.value)}
            />
          </Field>
        </FormSection>
        <footer>
          {job && canDelete && (
            <button
              className="danger"
              type="button"
              onClick={() => void onDelete(job.id)}
            >
              Delete
            </button>
          )}
          <span />
          <button className="secondary" type="button" onClick={onClose}>
            Cancel
          </button>
          <button className="primary" type="submit">
            Save job
          </button>
        </footer>
      </form>
    </div>
  );
}
function FormSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="formSection">
      <h3>{title}</h3>
      {children}
    </section>
  );
}
function Field({
  label,
  wide,
  children,
}: {
  label: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className={wide ? "field wide" : "field"}>
      <span>{label}</span>
      {children}
    </label>
  );
}

function Documents({
  mode,
  documents,
  payments,
  jobs,
  demo,
  reload,
  show,
}: {
  mode: "quotation" | "invoice";
  documents: FinancialDocument[];
  payments: Payment[];
  jobs: Job[];
  demo: boolean;
  reload: () => Promise<void>;
  show: (k: "success" | "error", t: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<FinancialDocument | null>(null);
  const [payingInvoice, setPayingInvoice] =
    useState<FinancialDocument | null>(null);
  const kind = mode;
  const visibleDocuments = documents.filter(
    (document) => document.document_type === mode,
  );
  const [items, setItems] = useState<DocumentItem[]>([
    { description: "", detail: null, quantity: 1, rate: 0, position: 1 },
  ]);
  const subtotal = items.reduce(
    (a, i) => a + Number(i.quantity) * Number(i.rate),
    0,
  );
  const totalInvoiced = documents
    .filter((document) => document.document_type === "invoice")
    .reduce((total, invoice) => total + documentTotal(invoice), 0);
  const paymentsReceived = payments.reduce(
    (total, payment) => total + Number(payment.amount),
    0,
  );
  const reset = () => {
    setOpen(false);
    setItems([
      { description: "", detail: null, quantity: 1, rate: 0, position: 1 },
    ]);
  };
  const save = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = Object.fromEntries(new FormData(e.currentTarget));
    try {
      if (demo) {
        show("success", "Document simulated in preview mode");
        reset();
        return;
      }
      const sb = createClient();
      const { data: doc, error } = await sb
        .from("financial_documents")
        .insert({
          document_type: kind,
          document_number: "",
          status: "draft",
          job_id: form.job_id || null,
          customer_name: form.customer_name,
          customer_address: form.customer_address || null,
          subject: form.subject || null,
          issue_date: form.issue_date,
          due_date: form.due_date || null,
          terms: form.terms || "Due on Receipt",
          discount_percent: Number(form.discount_percent) || 0,
          amount_paid: Number(form.amount_paid) || 0,
          notes: form.notes || null,
        })
        .select()
        .single();
      if (error) throw error;
      const { error: itemError } = await sb
        .from("financial_document_items")
        .insert(
          items.map((i, index) => ({
            document_id: doc.id,
            position: index + 1,
            description: i.description,
            detail: i.detail || null,
            quantity: Number(i.quantity),
            rate: Number(i.rate),
          })),
        );
      if (itemError) {
        await sb.from("financial_documents").delete().eq("id", doc.id);
        throw itemError;
      }
      reset();
      await reload();
      show(
        "success",
        `${kind === "quotation" ? "Quotation" : "Invoice"} ${doc.document_number} created`,
      );
    } catch (err) {
      show(
        "error",
        err instanceof Error ? err.message : "Unable to create document",
      );
    }
  };
  const updateStatus = async (
    d: FinancialDocument,
    status: "draft" | "sent",
  ) => {
    try {
      if (!demo) {
        const { error } = await createClient()
          .from("financial_documents")
          .update({ status })
          .eq("id", d.id);
        if (error) throw error;
        await reload();
      }
      show("success", `${d.document_number} marked ${status}`);
    } catch (err) {
      show(
        "error",
        err instanceof Error ? err.message : "Unable to update status",
      );
    }
  };
  const recordPayment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!payingInvoice) return;
    const form = Object.fromEntries(new FormData(event.currentTarget));
    try {
      if (demo) {
        setPayingInvoice(null);
        show("success", "Payment simulated in preview mode");
        return;
      }
      const { error } = await createClient().from("payments").insert({
        invoice_id: payingInvoice.id,
        payment_date: form.payment_date,
        amount: Number(form.amount),
        payment_method: form.payment_method || null,
        reference: form.reference || null,
        notes: form.notes || null,
      });
      if (error) throw error;
      setPayingInvoice(null);
      await reload();
      show("success", `Payment recorded for ${payingInvoice.document_number}`);
    } catch (error) {
      show(
        "error",
        error instanceof Error ? error.message : "Unable to record payment",
      );
    }
  };
  const convert = async (q: FinancialDocument) => {
    if (documents.some((d) => d.source_quotation_id === q.id)) {
      show("error", "This quotation has already been converted");
      return;
    }
    if (!confirm(`Convert ${q.document_number} to an invoice?`)) return;
    try {
      if (demo) {
        show("success", "Quotation conversion simulated");
        return;
      }
      const sb = createClient();
      const today = new Date().toISOString().slice(0, 10);
      const { data: invoice, error } = await sb
        .from("financial_documents")
        .insert({
          document_type: "invoice",
          document_number: "",
          status: "draft",
          source_quotation_id: q.id,
          job_id: q.job_id,
          customer_name: q.customer_name,
          customer_address: q.customer_address,
          subject: q.subject,
          issue_date: today,
          due_date: q.due_date,
          terms: "Due on Receipt",
          discount_percent: q.discount_percent,
          amount_paid: 0,
          notes: q.notes,
        })
        .select()
        .single();
      if (error) throw error;
      const { error: itemError } = await sb
        .from("financial_document_items")
        .insert(
          q.items.map((i, index) => ({
            document_id: invoice.id,
            position: index + 1,
            description: i.description,
            detail: i.detail,
            quantity: Number(i.quantity),
            rate: Number(i.rate),
          })),
        );
      if (itemError) {
        await sb.from("financial_documents").delete().eq("id", invoice.id);
        throw itemError;
      }
      await reload();
      show(
        "success",
        `Invoice ${invoice.document_number} created from ${q.document_number}`,
      );
    } catch (err) {
      show(
        "error",
        err instanceof Error ? err.message : "Unable to convert quotation",
      );
    }
  };
  return (
    <>
      {mode === "invoice" && (
        <div className="stats three">
          <Stat label="Total invoiced" value={money(totalInvoiced)} Icon={CreditCard} />
          <Stat label="Payments received" value={money(paymentsReceived)} Icon={Check} tone="green" />
          <Stat label="Outstanding balance" value={money(Math.max(0, totalInvoiced - paymentsReceived))} Icon={CreditCard} tone="coral" />
        </div>
      )}
      <section className="sectionHead">
        <h2>{mode === "quotation" ? "Customer quotations" : "Customer invoices"}</h2>
        <div className="docActions">
          <button
            className="primary"
            onClick={() => setOpen(true)}
          >
            <Plus /> New {mode}
          </button>
        </div>
      </section>
      <div className="tableWrap responsiveTable">
        <table>
          <thead>
            <tr>
              <th>Number</th>
              <th>Type</th>
              <th>Status</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Total</th>
              <th>Balance</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {visibleDocuments.map((d) => {
              const sub = d.items.reduce(
                  (a, i) => a + Number(i.quantity) * Number(i.rate),
                  0,
                ),
                total = sub * (1 - Number(d.discount_percent) / 100),
                balance = Math.max(0, total - Number(d.amount_paid)),
                converted = documents.some(
                  (x) => x.source_quotation_id === d.id,
                );
              return (
                <tr key={d.id}>
                  <td data-label="Number">
                    <b className="jobNo">{d.document_number}</b>
                  </td>
                  <td data-label="Type">
                    <StatusPill value={d.document_type} />
                  </td>
                  <td data-label="Status">
                    <select
                      className={`statusSelect ${d.status}`}
                      value={d.status}
                      disabled={converted}
                      title={
                        converted
                          ? "Converted quotations are locked"
                          : undefined
                      }
                      onChange={(e) =>
                        void updateStatus(d, e.target.value as "draft" | "sent")
                      }
                    >
                      <option value="draft">Draft</option>
                      <option value="sent">Sent</option>
                    </select>
                  </td>
                  <td data-label="Customer">
                    <strong>{d.customer_name}</strong>
                  </td>
                  <td data-label="Date">{formatDate(d.issue_date)}</td>
                  <td data-label="Total">
                    <strong>{money(total)}</strong>
                  </td>
                  <td data-label="Balance">{money(balance)}</td>
                  <td data-label="Actions">
                    <span className="documentActions">
                      <button
                        className="secondary compact"
                        onClick={() => printDocument(d)}
                      >
                        <Printer /> Print / PDF
                      </button>
                      {!converted && (
                        <button
                          className="secondary compact"
                          onClick={() => setEditingDoc(d)}
                        >
                          Edit
                        </button>
                      )}
                      {d.document_type === "invoice" && (
                        <button
                          className="primary compact"
                          disabled={balance <= 0}
                          onClick={() => setPayingInvoice(d)}
                        >
                          {balance <= 0 ? "Paid" : "Record payment"}
                        </button>
                      )}
                      {d.document_type === "quotation" && (
                        <button
                          className="primary compact"
                          disabled={converted}
                          onClick={() => void convert(d)}
                        >
                          {converted ? "Converted" : "Convert to invoice"}
                        </button>
                      )}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!visibleDocuments.length && (
          <div className="empty">
            No {mode === "quotation" ? "quotations" : "invoices"} yet.
          </div>
        )}
      </div>
      {payingInvoice && (
        <div className="modal">
          <form className="drawer" onSubmit={recordPayment}>
            <header>
              <div>
                <span className="eyebrow">INVOICE PAYMENT</span>
                <h2>{payingInvoice.document_number}</h2>
              </div>
              <button type="button" className="iconBtn" onClick={() => setPayingInvoice(null)}><X /></button>
            </header>
            <div className="formGrid">
              <Field label="Customer" wide><input value={payingInvoice.customer_name} readOnly /></Field>
              <Field label="Outstanding balance" wide><input value={money(Math.max(0, documentTotal(payingInvoice) - Number(payingInvoice.amount_paid)))} readOnly /></Field>
              <Field label="Payment date"><input name="payment_date" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} /></Field>
              <Field label="Amount"><input name="amount" type="number" min="0.01" max={Math.max(0, documentTotal(payingInvoice) - Number(payingInvoice.amount_paid))} step="0.01" required /></Field>
              <Field label="Payment method"><select name="payment_method"><option value="Bank transfer">Bank transfer</option><option value="Cash">Cash</option><option value="Cheque">Cheque</option><option value="Card">Card</option><option value="Other">Other</option></select></Field>
              <Field label="Reference"><input name="reference" placeholder="Transfer or receipt reference" /></Field>
              <Field label="Notes" wide><textarea name="notes" rows={3} /></Field>
            </div>
            <footer><button type="button" className="secondary" onClick={() => setPayingInvoice(null)}>Cancel</button><button className="primary" type="submit">Record payment</button></footer>
          </form>
        </div>
      )}
      {open && (
        <div className="modal">
          <form className="drawer" onSubmit={save}>
            <header>
              <div>
                <span className="eyebrow">NEW {kind.toUpperCase()}</span>
                <h2>Create {kind}</h2>
              </div>
              <button type="button" className="iconBtn" onClick={reset}>
                <X />
              </button>
            </header>
            <FormSection title="Customer">
              <div className="formGrid">
                <Field label="Related job">
                  <select
                    name="job_id"
                    onChange={(e) => {
                      const j = jobs.find((x) => x.id === e.target.value);
                      const form = e.currentTarget.form;
                      if (j && form) {
                        (
                          form.elements.namedItem(
                            "customer_name",
                          ) as HTMLInputElement
                        ).value = j.customer_name;
                        (
                          form.elements.namedItem("subject") as HTMLInputElement
                        ).value = j.description;
                      }
                    }}
                  >
                    <option value="">Not linked</option>
                    {jobs.map((j) => (
                      <option value={j.id} key={j.id}>
                        {j.job_number} · {j.customer_name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Customer name">
                  <input name="customer_name" required />
                </Field>
                <Field label="Customer address" wide>
                  <textarea name="customer_address" rows={2} />
                </Field>
                <Field label="Subject" wide>
                  <input name="subject" />
                </Field>
              </div>
            </FormSection>
            <FormSection title="Dates & terms">
              <div className="formGrid">
                <Field
                  label={kind === "quotation" ? "Quote date" : "Invoice date"}
                >
                  <input
                    name="issue_date"
                    type="date"
                    required
                    defaultValue={new Date().toISOString().slice(0, 10)}
                  />
                </Field>
                <Field label="Due date">
                  <input name="due_date" type="date" />
                </Field>
                <Field label="Terms">
                  <input
                    name="terms"
                    defaultValue={
                      kind === "invoice"
                        ? "Due on Receipt"
                        : "Valid for 30 days"
                    }
                  />
                </Field>
                <Field label="Discount %">
                  <input
                    name="discount_percent"
                    type="number"
                    min="0"
                    max="100"
                    step=".01"
                    defaultValue="0"
                  />
                </Field>
                <Field label="Amount paid">
                  <input
                    name="amount_paid"
                    type="number"
                    min="0"
                    step=".01"
                    defaultValue="0"
                  />
                </Field>
              </div>
            </FormSection>
            <FormSection title="Items">
              <div className="lineItems">
                {items.map((item, index) => (
                  <div className="lineItem" key={index}>
                    <input
                      required
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) =>
                        setItems(
                          items.map((x, i) =>
                            i === index
                              ? { ...x, description: e.target.value }
                              : x,
                          ),
                        )
                      }
                    />
                    <input
                      placeholder="Additional detail"
                      value={item.detail || ""}
                      onChange={(e) =>
                        setItems(
                          items.map((x, i) =>
                            i === index ? { ...x, detail: e.target.value } : x,
                          ),
                        )
                      }
                    />
                    <input
                      aria-label="Quantity"
                      type="number"
                      min=".01"
                      step=".01"
                      value={item.quantity}
                      onChange={(e) =>
                        setItems(
                          items.map((x, i) =>
                            i === index
                              ? { ...x, quantity: +e.target.value }
                              : x,
                          ),
                        )
                      }
                    />
                    <input
                      aria-label="Rate"
                      type="number"
                      min="0"
                      step=".01"
                      value={item.rate}
                      onChange={(e) =>
                        setItems(
                          items.map((x, i) =>
                            i === index ? { ...x, rate: +e.target.value } : x,
                          ),
                        )
                      }
                    />
                    <button
                      type="button"
                      className="iconBtn"
                      disabled={items.length === 1}
                      onClick={() =>
                        setItems(items.filter((_, i) => i !== index))
                      }
                    >
                      <Trash2 />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="secondary"
                onClick={() =>
                  setItems([
                    ...items,
                    {
                      description: "",
                      detail: null,
                      quantity: 1,
                      rate: 0,
                      position: items.length + 1,
                    },
                  ])
                }
              >
                <Plus /> Add item
              </button>
              <div className="documentTotal">
                Subtotal <strong>{money(subtotal)}</strong>
              </div>
            </FormSection>
            <FormSection title="Notes">
              <textarea name="notes" rows={3} />
            </FormSection>
            <footer>
              <span />
              <button type="button" className="secondary" onClick={reset}>
                Cancel
              </button>
              <button className="primary" type="submit">
                Create {kind}
              </button>
            </footer>
          </form>
        </div>
      )}
      {editingDoc && (
        <DocumentEditor
          document={editingDoc}
          jobs={jobs}
          demo={demo}
          onClose={() => setEditingDoc(null)}
          reload={reload}
          show={show}
        />
      )}
    </>
  );
}

function DocumentEditor({
  document,
  jobs,
  demo,
  onClose,
  reload,
  show,
}: {
  document: FinancialDocument;
  jobs: Job[];
  demo: boolean;
  onClose: () => void;
  reload: () => Promise<void>;
  show: (k: "success" | "error", t: string) => void;
}) {
  const [items, setItems] = useState<DocumentItem[]>(
    [...document.items].sort((a, b) => a.position - b.position),
  );
  const subtotal = items.reduce(
    (a, i) => a + Number(i.quantity) * Number(i.rate),
    0,
  );
  const save = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = Object.fromEntries(new FormData(e.currentTarget));
    try {
      if (demo) {
        show("success", "Document edit simulated in preview mode");
        onClose();
        return;
      }
      const sb = createClient();
      const { error } = await sb
        .from("financial_documents")
        .update({
          job_id: form.job_id || null,
          customer_name: form.customer_name,
          customer_address: form.customer_address || null,
          subject: form.subject || null,
          issue_date: form.issue_date,
          due_date: form.due_date || null,
          terms: form.terms || "Due on Receipt",
          discount_percent: Number(form.discount_percent) || 0,
          amount_paid: Number(form.amount_paid) || 0,
          notes: form.notes || null,
        })
        .eq("id", document.id);
      if (error) throw error;
      const { error: deleteError } = await sb
        .from("financial_document_items")
        .delete()
        .eq("document_id", document.id);
      if (deleteError) throw deleteError;
      const { error: itemError } = await sb
        .from("financial_document_items")
        .insert(
          items.map((i, index) => ({
            document_id: document.id,
            position: index + 1,
            description: i.description,
            detail: i.detail || null,
            quantity: Number(i.quantity),
            rate: Number(i.rate),
          })),
        );
      if (itemError) {
        await sb
          .from("financial_document_items")
          .insert(
            document.items.map((i, index) => ({
              document_id: document.id,
              position: index + 1,
              description: i.description,
              detail: i.detail || null,
              quantity: Number(i.quantity),
              rate: Number(i.rate),
            })),
          );
        throw itemError;
      }
      onClose();
      await reload();
      show("success", `${document.document_number} updated`);
    } catch (err) {
      show(
        "error",
        err instanceof Error ? err.message : "Unable to update document",
      );
    }
  };
  return (
    <div className="modal">
      <form className="drawer" onSubmit={save}>
        <header>
          <div>
            <span className="eyebrow">
              EDIT {document.document_type.toUpperCase()}
            </span>
            <h2>{document.document_number}</h2>
          </div>
          <button type="button" className="iconBtn" onClick={onClose}>
            <X />
          </button>
        </header>
        <FormSection title="Customer">
          <div className="formGrid">
            <Field label="Related job">
              <select name="job_id" defaultValue={document.job_id || ""}>
                <option value="">Not linked</option>
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.job_number} · {j.customer_name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Customer name">
              <input
                name="customer_name"
                required
                defaultValue={document.customer_name}
              />
            </Field>
            <Field label="Customer address" wide>
              <textarea
                name="customer_address"
                rows={2}
                defaultValue={document.customer_address || ""}
              />
            </Field>
            <Field label="Subject" wide>
              <input name="subject" defaultValue={document.subject || ""} />
            </Field>
          </div>
        </FormSection>
        <FormSection title="Dates & terms">
          <div className="formGrid">
            <Field
              label={
                document.document_type === "quotation"
                  ? "Quote date"
                  : "Invoice date"
              }
            >
              <input
                name="issue_date"
                type="date"
                required
                defaultValue={document.issue_date}
              />
            </Field>
            <Field label="Due date">
              <input
                name="due_date"
                type="date"
                defaultValue={document.due_date || ""}
              />
            </Field>
            <Field label="Terms">
              <input name="terms" defaultValue={document.terms} />
            </Field>
            <Field label="Discount %">
              <input
                name="discount_percent"
                type="number"
                min="0"
                max="100"
                step=".01"
                defaultValue={document.discount_percent}
              />
            </Field>
            <Field label="Amount paid">
              <input
                name="amount_paid"
                type="number"
                min="0"
                step=".01"
                defaultValue={document.amount_paid}
              />
            </Field>
          </div>
        </FormSection>
        <FormSection title="Items">
          <div className="lineItems">
            {items.map((item, index) => (
              <div className="lineItem" key={index}>
                <input
                  required
                  placeholder="Description"
                  value={item.description}
                  onChange={(e) =>
                    setItems(
                      items.map((x, i) =>
                        i === index ? { ...x, description: e.target.value } : x,
                      ),
                    )
                  }
                />
                <input
                  placeholder="Additional detail"
                  value={item.detail || ""}
                  onChange={(e) =>
                    setItems(
                      items.map((x, i) =>
                        i === index ? { ...x, detail: e.target.value } : x,
                      ),
                    )
                  }
                />
                <input
                  aria-label="Quantity"
                  type="number"
                  min=".01"
                  step=".01"
                  value={item.quantity}
                  onChange={(e) =>
                    setItems(
                      items.map((x, i) =>
                        i === index ? { ...x, quantity: +e.target.value } : x,
                      ),
                    )
                  }
                />
                <input
                  aria-label="Rate"
                  type="number"
                  min="0"
                  step=".01"
                  value={item.rate}
                  onChange={(e) =>
                    setItems(
                      items.map((x, i) =>
                        i === index ? { ...x, rate: +e.target.value } : x,
                      ),
                    )
                  }
                />
                <button
                  type="button"
                  className="iconBtn"
                  disabled={items.length === 1}
                  onClick={() => setItems(items.filter((_, i) => i !== index))}
                >
                  <Trash2 />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="secondary"
            onClick={() =>
              setItems([
                ...items,
                {
                  description: "",
                  detail: null,
                  quantity: 1,
                  rate: 0,
                  position: items.length + 1,
                },
              ])
            }
          >
            <Plus /> Add item
          </button>
          <div className="documentTotal">
            Subtotal <strong>{money(subtotal)}</strong>
          </div>
        </FormSection>
        <FormSection title="Notes">
          <textarea name="notes" rows={3} defaultValue={document.notes || ""} />
        </FormSection>
        <footer>
          <span />
          <button type="button" className="secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="primary" type="submit">
            Save changes
          </button>
        </footer>
      </form>
    </div>
  );
}

function Expenses({
  expenses,
  jobs,
  demo,
  reload,
  show,
}: {
  expenses: Expense[];
  jobs: Job[];
  demo: boolean;
  reload: () => Promise<void>;
  show: (k: "success" | "error", t: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const total = expenses.reduce((a, e) => a + Number(e.amount), 0);
  const save = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = Object.fromEntries(new FormData(e.currentTarget));
    try {
      if (demo) {
        show("success", "Expense simulated in preview mode");
        setOpen(false);
        return;
      }
      const { error } = await createClient()
        .from("expenses")
        .insert({
          expense_number: "",
          expense_date: form.expense_date,
          job_id: form.job_id || null,
          category: form.category,
          vendor: form.vendor || null,
          description: form.description,
          amount: Number(form.amount),
          payment_method: form.payment_method || null,
          reference: form.reference || null,
          notes: form.notes || null,
        });
      if (error) throw error;
      setOpen(false);
      await reload();
      show("success", "Expense recorded");
    } catch (err) {
      show(
        "error",
        err instanceof Error ? err.message : "Unable to record expense",
      );
    }
  };
  return (
    <>
      <div className="stats three">
        <Stat
          label="Recorded expenses"
          value={expenses.length}
          Icon={Receipt}
        />
        <Stat
          label="Total expenses"
          value={money(total)}
          Icon={CreditCard}
          tone="coral"
        />
        <Stat
          label="This month"
          value={money(
            expenses
              .filter(
                (e) =>
                  e.expense_date.slice(0, 7) ===
                  new Date().toISOString().slice(0, 7),
              )
              .reduce((a, e) => a + Number(e.amount), 0),
          )}
          Icon={BarChart3}
          tone="amber"
        />
      </div>
      <section className="sectionHead">
        <h2>Expense ledger</h2>
        <button className="primary" onClick={() => setOpen(true)}>
          <Plus /> Record expense
        </button>
      </section>
      <div className="tableWrap responsiveTable">
        <table>
          <thead>
            <tr>
              <th>Number</th>
              <th>Date</th>
              <th>Category</th>
              <th>Description</th>
              <th>Vendor</th>
              <th>Job</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((e) => (
              <tr key={e.id}>
                <td data-label="Number">
                  <b className="jobNo">{e.expense_number}</b>
                </td>
                <td data-label="Date">{formatDate(e.expense_date)}</td>
                <td data-label="Category">{e.category}</td>
                <td data-label="Description">
                  <strong>{e.description}</strong>
                  <small>{e.reference || ""}</small>
                </td>
                <td data-label="Vendor">{e.vendor || "—"}</td>
                <td data-label="Job">{e.job?.job_number || "—"}</td>
                <td data-label="Amount">
                  <strong>{money(e.amount)}</strong>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!expenses.length && (
          <div className="empty">No expenses recorded yet.</div>
        )}
      </div>
      {open && (
        <div className="modal">
          <form className="smallModal expenseModal" onSubmit={save}>
            <header>
              <div>
                <span className="eyebrow">NEW EXPENSE</span>
                <h2>Record expense</h2>
              </div>
              <button
                type="button"
                className="iconBtn"
                onClick={() => setOpen(false)}
              >
                <X />
              </button>
            </header>
            <div className="formGrid">
              <Field label="Date">
                <input
                  name="expense_date"
                  type="date"
                  required
                  defaultValue={new Date().toISOString().slice(0, 10)}
                />
              </Field>
              <Field label="Amount (MVR)">
                <input
                  name="amount"
                  type="number"
                  min=".01"
                  step=".01"
                  required
                />
              </Field>
              <Field label="Category">
                <select name="category" required>
                  <option value="Production">Production</option>
                  <option value="Transport">Transport</option>
                  <option value="Materials">Materials</option>
                  <option value="Salary">Salary</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Other">Other</option>
                </select>
              </Field>
              <Field label="Vendor">
                <input name="vendor" />
              </Field>
              <Field label="Related job" wide>
                <select name="job_id">
                  <option value="">General expense</option>
                  {jobs.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.job_number} · {j.customer_name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Description" wide>
                <input name="description" required />
              </Field>
              <Field label="Payment method">
                <select name="payment_method">
                  <option value="Cash">Cash</option>
                  <option value="Bank transfer">Bank transfer</option>
                  <option value="Card">Card</option>
                  <option value="Other">Other</option>
                </select>
              </Field>
              <Field label="Reference">
                <input name="reference" />
              </Field>
              <Field label="Notes" wide>
                <textarea name="notes" rows={2} />
              </Field>
            </div>
            <button className="primary" type="submit">
              Save expense
            </button>
          </form>
        </div>
      )}
    </>
  );
}

const formatDate = (date: string) =>
  new Date(`${date}T00:00:00`).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
const escapeHtml = (value: unknown) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[c]!,
  );
function printDocument(d: FinancialDocument) {
  const sub = d.items.reduce(
      (a, i) => a + Number(i.quantity) * Number(i.rate),
      0,
    ),
    discount = (sub * Number(d.discount_percent)) / 100,
    total = sub - discount,
    balance = Math.max(0, total - Number(d.amount_paid));
  const rows = [...d.items]
    .sort((a, b) => a.position - b.position)
    .map(
      (i, n) =>
        `<tr><td>${n + 1}</td><td>${escapeHtml(i.description)}${i.detail ? `<small>${escapeHtml(i.detail)}</small>` : ""}</td><td>${Number(i.quantity).toFixed(2)}</td><td>${Number(i.rate).toFixed(2)}</td><td>${(Number(i.quantity) * Number(i.rate)).toLocaleString("en-US", { minimumFractionDigits: 2 })}</td></tr>`,
    )
    .join("");
  const isInvoice = d.document_type === "invoice";
  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(
    `<!doctype html><html><head><title>${escapeHtml(d.document_number)}</title><style>@page{size:A4;margin:18mm}*{box-sizing:border-box}body{font:12px Arial,sans-serif;color:#222;margin:0}.head{display:flex;justify-content:space-between;min-height:180px}.logo{font-size:36px;font-weight:900;color:#102a43;letter-spacing:-5px}.logo small{display:block;font-size:12px;letter-spacing:2px}.title{text-align:right}.title h1{font-size:34px;font-weight:400;margin:0}.title b{color:#173f5f}.balance{margin-top:25px;color:#173f5f}.balance strong{display:block;font-size:20px}.meta{display:flex;justify-content:space-between;align-items:end;margin:20px 0}.company,.customer{line-height:1.45}.customer{font-weight:bold;margin:28px 0 18px}.dates{display:grid;grid-template-columns:auto auto;gap:12px 28px;text-align:right}.subject{color:#173f5f;margin:12px 0 24px}.subject span{display:block;color:#222;margin-top:8px}table{width:100%;border-collapse:collapse}th{background:#383a38;color:#fff;font-weight:400;text-align:left}th,td{padding:11px 12px;border-bottom:1px solid #bbb}th:nth-child(n+3),td:nth-child(n+3){text-align:right}td small{display:block;color:#777;margin-top:4px}.totals{width:48%;margin:10px 0 28px auto}.totals div{display:flex;justify-content:space-between;padding:9px 12px}.totals .grand{background:#f2f2f2;font-weight:bold}.bank{line-height:1.45;margin-top:30px}.notes{margin-top:45px;white-space:pre-line}.footer{position:fixed;bottom:0;left:0;right:0;text-align:center;color:#64748b;border-top:1px solid #bbb;padding-top:10px}@media print{button{display:none}}</style></head><body><div class="head"><div><div class="logo">MMM<small>MN MALDIVES</small></div></div><div class="title"><h1>${isInvoice ? "Invoice" : "QUOTE"}</h1><b>${isInvoice ? "Invoice#" : "#"} ${escapeHtml(d.document_number)}</b>${isInvoice ? `<div class="balance">Balance Due<strong>MVR${balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}</strong></div>` : ""}</div></div><div class="meta"><div class="company"><b>MN Maldives</b><br>Flat 159-G-01<br>Hulhumale Kaafu 23000<br>Maldives<br>+9607696312</div><div class="dates"><span>${isInvoice ? "Invoice" : "Quote"} Date :</span><b>${formatDate(d.issue_date)}</b>${isInvoice ? `<span>Terms :</span><b>${escapeHtml(d.terms)}</b><span>Due Date :</span><b>${d.due_date ? formatDate(d.due_date) : "—"}</b>` : ""}</div></div><div class="customer">${escapeHtml(d.customer_name)}${d.customer_address ? `<br>${escapeHtml(d.customer_address).replaceAll("\n", "<br>")}` : ""}</div>${d.subject ? `<div class="subject">SUBJECT :<span>${escapeHtml(d.subject)}</span></div>` : ""}<table><thead><tr><th>#</th><th>Description</th><th>Qty</th><th>Rate</th><th>Amount</th></tr></thead><tbody>${rows}</tbody></table><div class="totals"><div><span>Sub Total</span><span>${sub.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span></div>${discount ? `<div><span>Discount (${Number(d.discount_percent).toFixed(2)}%)</span><span>(-) ${discount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span></div>` : ""}<div class="grand"><span>Total</span><span>MVR${total.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span></div>${isInvoice ? `<div class="grand"><span>Balance Due</span><span>MVR${balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span></div>` : ""}</div><div class="bank">Bank of Maldives<br>Account Name: MN MALDIVES<br>MVR 7770000140438 - USD 7770000140439<br>MIB<br>Account Name: MN Ventures<br>MVR 90101440001091000 - USD 90101440001092000</div><div class="notes">${escapeHtml(d.notes || (!isInvoice ? "- This quote is valid for a period of 30 days from the quotation date.\n- Half payment will be collected at the beginning of the work and remaining payment must be cleared within 10 days upon completion of the work.\n- Products will be delivered within 7 to 10 days from the confirmation date." : "")).replaceAll("\n", "<br>")}</div><div class="footer">MN Maldives · Financial document</div><script>window.onload=()=>window.print()<\/script></body></html>`,
  );
  w.document.close();
}

function UserAdmin({
  profiles,
  demo,
  reload,
  show,
}: {
  profiles: Profile[];
  demo: boolean;
  reload: () => Promise<void>;
  show: (k: "success" | "error", t: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const invite = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const body = Object.fromEntries(new FormData(e.currentTarget));
    try {
      if (demo) {
        show("success", "User invite simulated in preview mode");
        setOpen(false);
        return;
      }
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      show("success", "User invited successfully");
      setOpen(false);
      await reload();
    } catch (err) {
      show("error", err instanceof Error ? err.message : "Invite failed");
    }
  };
  const updateDisplayName = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingProfile) return;
    const form = Object.fromEntries(new FormData(e.currentTarget));
    try {
      if (demo) {
        show("success", "Display name simulated in preview mode");
        setEditingProfile(null);
        return;
      }
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          id: editingProfile.id,
          display_name: form.display_name,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setEditingProfile(null);
      await reload();
      show("success", "Display name updated");
    } catch (err) {
      show(
        "error",
        err instanceof Error ? err.message : "Unable to update display name",
      );
    }
  };
  return (
    <>
      <section className="sectionHead">
        <h2>Portal users</h2>
        <button className="primary" onClick={() => setOpen(true)}>
          <Plus /> Invite user
        </button>
      </section>
      <div className="userGrid">
        {profiles.map((p) => (
          <article className="userCard" key={p.id}>
            <span className="avatar large">{initials(p.full_name)}</span>
            <div>
              <strong>{p.full_name}</strong>
              <span>{p.email}</span>
              <StatusPill value={p.role} />
              <button
                type="button"
                className="secondary compact"
                onClick={() => setEditingProfile(p)}
              >
                Edit display name
              </button>
            </div>
            <i className={p.active ? "online" : ""} />
          </article>
        ))}
      </div>
      {open && (
        <div className="modal">
          <form className="smallModal" onSubmit={invite}>
            <header>
              <div>
                <span className="eyebrow">USER ACCESS</span>
                <h2>Invite a team member</h2>
              </div>
              <button
                className="iconBtn"
                type="button"
                onClick={() => setOpen(false)}
              >
                <X />
              </button>
            </header>
            <Field label="Display name">
              <input name="full_name" required />
            </Field>
            <Field label="Email address">
              <input name="email" type="email" required />
            </Field>
            <Field label="Role">
              <select name="role" defaultValue="staff">
                <option value="admin">Administrator</option>
                <option value="finance">Finance</option>
                <option value="staff">Staff</option>
              </select>
            </Field>
            <button className="primary" type="submit">
              Send invitation
            </button>
          </form>
        </div>
      )}
      {editingProfile && (
        <div className="modal">
          <form className="smallModal" onSubmit={updateDisplayName}>
            <header>
              <div>
                <span className="eyebrow">USER PROFILE</span>
                <h2>Edit display name</h2>
              </div>
              <button
                className="iconBtn"
                type="button"
                onClick={() => setEditingProfile(null)}
              >
                <X />
              </button>
            </header>
            <Field label="Display name">
              <input
                name="display_name"
                required
                minLength={2}
                maxLength={100}
                defaultValue={editingProfile.full_name}
              />
            </Field>
            <button className="primary" type="submit">
              Save display name
            </button>
          </form>
        </div>
      )}
    </>
  );
}
function FactoryAdmin({
  factories,
  demo,
  setFactories,
  reload,
  show,
}: {
  factories: FactoryRecord[];
  demo: boolean;
  setFactories: (f: FactoryRecord[]) => void;
  reload: () => Promise<void>;
  show: (k: "success" | "error", t: string) => void;
}) {
  const [name, setName] = useState("");
  const save = async (factory?: FactoryRecord) => {
    const value = (
      factory ? prompt("Factory name", factory.name) : name
    )?.trim();
    if (!value) return;
    const id =
      factory?.id ||
      value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
    if (!id) {
      show("error", "Enter a valid factory name");
      return;
    }
    try {
      if (demo) {
        const next = factory
          ? factories.map((f) => (f.id === id ? { ...f, name: value } : f))
          : [...factories, { id, name: value, active: true }];
        setFactories(next);
        setName("");
        show("success", factory ? "Factory renamed" : "Factory added");
        return;
      }
      const sb = createClient();
      const { error } = factory
        ? await sb.from("factories").update({ name: value }).eq("id", id)
        : await sb.from("factories").insert({ id, name: value, active: true });
      if (error) throw error;
      setName("");
      await reload();
      show("success", factory ? "Factory renamed" : "Factory added");
    } catch (e) {
      show("error", e instanceof Error ? e.message : "Unable to save factory");
    }
  };
  const toggle = async (factory: FactoryRecord) => {
    try {
      if (demo) {
        setFactories(
          factories.map((f) =>
            f.id === factory.id ? { ...f, active: !f.active } : f,
          ),
        );
        show(
          "success",
          factory.active ? "Factory deactivated" : "Factory activated",
        );
        return;
      }
      const { error } = await createClient()
        .from("factories")
        .update({ active: !factory.active })
        .eq("id", factory.id);
      if (error) throw error;
      await reload();
      show(
        "success",
        factory.active ? "Factory deactivated" : "Factory activated",
      );
    } catch (e) {
      show(
        "error",
        e instanceof Error ? e.message : "Unable to update factory",
      );
    }
  };
  return (
    <>
      <section className="sectionHead">
        <h2>Production factories</h2>
      </section>
      <form
        className="factoryAdd"
        onSubmit={(e) => {
          e.preventDefault();
          void save();
        }}
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="New factory name"
        />
        <button className="primary" type="submit">
          <Plus /> Add factory
        </button>
      </form>
      <div className="factoryGrid">
        {factories.map((f) => (
          <article
            className={`factoryCard ${f.active ? "" : "inactive"}`}
            key={f.id}
          >
            <span className="brandMark">
              <Factory />
            </span>
            <div>
              <strong>{f.name}</strong>
              <small>
                {f.active
                  ? "Available for new jobs"
                  : "Inactive · hidden from new jobs"}
              </small>
            </div>
            <button className="secondary" onClick={() => void save(f)}>
              Rename
            </button>
            <button
              className={f.active ? "danger" : "primary"}
              onClick={() => void toggle(f)}
            >
              {f.active ? "Deactivate" : "Activate"}
            </button>
          </article>
        ))}
      </div>
    </>
  );
}
function exportCsv(jobs: Job[]) {
  const rows = [
    [
      "Job",
      "Customer",
      "Status",
      "Administrator",
      "Factory",
      "Invoice",
      "Total",
      "Paid",
    ],
    ...jobs.map((j) => [
      j.job_number,
      j.customer_name,
      j.status,
      j.assignee?.full_name || "",
      j.factory?.name || "",
      j.invoice_number || "",
      j.invoice_total,
      j.amount_paid,
    ]),
  ];
  const csv = rows
    .map((r) => r.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(","))
    .join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = "mn-maldives-jobs.csv";
  a.click();
  URL.revokeObjectURL(url);
}
