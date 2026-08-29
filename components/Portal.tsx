"use client";

import { FormEvent, useEffect, useId, useMemo, useState } from "react";
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
  Package,
  Pencil,
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
  Customer,
  DocumentItem,
  Expense,
  FactoryRecord,
  FinancialDocument,
  Job,
  JobStatus,
  Item,
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
const demoCustomers: Customer[] = Array.from(
  new Map(
    demoJobs.map((job) => [
      job.customer_name.toLocaleLowerCase(),
      {
        id: `demo-${job.id}`,
        name: job.customer_name,
        phone: job.customer_phone,
        email: job.customer_email || null,
        contact_person: job.contact_person || null,
        created_at: job.created_at,
      },
    ]),
  ).values(),
);
const labels: Record<string, string> = {
  initial: "Initial",
  design: "Design",
  production: "Production",
  shipped: "Shipped / RFD",
  delivered: "Delivered",
  unpaid: "Unpaid",
  incomplete: "Incomplete",
  cancelled: "Cancelled",
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
  | "items"
  | "customers"
  | "quotations"
  | "invoices"
  | "expenses"
  | "users"
  | "factories";
type ProductionItemInput = { item_id: string; quantity: number };
type JobSaveInput = Omit<Partial<Job>, "production_items"> & {
  production_items?: ProductionItemInput[];
};
type ProductionItemRow = { selection: string; quantity: number };
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
  const [items, setItems] = useState<Item[]>([]);
  const [customers, setCustomers] = useState<Customer[]>(
    demo ? demoCustomers : [],
  );
  const [documents, setDocuments] = useState<FinancialDocument[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [view, setView] = useState<View>("dashboard");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [editing, setEditing] = useState<Job | null | undefined>(undefined);
  const [viewingDocument, setViewingDocument] =
    useState<FinancialDocument | null>(null);
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
      { data: i, error: ie },
      { data: c, error: ce },
    ] = await Promise.all([
      sb
        .from("jobs")
        .select(
          "*,owner:profiles!jobs_owner_id_fkey(full_name),assignee:profiles!jobs_assigned_admin_id_fkey(full_name),factory:factories(name),production_items:job_items(quantity,item:items(id,code,name,rate,description))",
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
      sb.from("items").select("id,code,name,rate,description,created_at").order("name"),
      sb
        .from("customers")
        .select("id,name,phone,email,contact_person,created_at")
        .order("name"),
    ]);
    if (je) throw je;
    if (pe) throw pe;
    if (fe) throw fe;
    if (de) throw de;
    if (xe) throw xe;
    if (ye) throw ye;
    if (te) throw te;
    if (ie) throw ie;
    if (ce) throw ce;
    setJobs((j || []) as unknown as Job[]);
    setProfiles((p || []) as Profile[]);
    setFactories((f || []) as FactoryRecord[]);
    setDocuments((d || []) as unknown as FinancialDocument[]);
    setExpenses((x || []) as unknown as Expense[]);
    setPayments((y || []) as unknown as Payment[]);
    setTasks((t || []) as unknown as Task[]);
    setItems((i || []) as unknown as Item[]);
    setCustomers((c || []) as Customer[]);
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
              j.customer_email,
              j.contact_person,
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
  async function createCustomer(input: {
    name: string;
    phone: string;
    email: string;
    contact_person: string;
  }) {
    const normalized = input.name.trim().toLocaleLowerCase();
    const existing = customers.find(
      (customer) => customer.name.trim().toLocaleLowerCase() === normalized,
    );
    if (existing) throw new Error("This customer already exists. Select them from the list.");
    const payload = {
      name: input.name.trim(),
      phone: input.phone.trim() || null,
      email: input.email.trim() || null,
      contact_person: input.contact_person.trim() || null,
    };
    if (demo) {
      const customer: Customer = {
        id: crypto.randomUUID(),
        ...payload,
        created_at: new Date().toISOString(),
      };
      setCustomers((current) =>
        [...current, customer].sort((a, b) => a.name.localeCompare(b.name)),
      );
      return customer;
    }
    const { data, error } = await createClient()
      .from("customers")
      .insert(payload)
      .select("id,name,phone,email,contact_person,created_at")
      .single();
    if (error) {
      if (error.code === "23505") {
        throw new Error("This customer already exists. Select them from the list.");
      }
      throw error;
    }
    const customer = data as Customer;
    setCustomers((current) =>
      [...current, customer].sort((a, b) => a.name.localeCompare(b.name)),
    );
    return customer;
  }
  async function saveJob(input: JobSaveInput) {
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
      const previousJob = input.id
        ? jobs.find((job) => job.id === input.id)
        : undefined;
      const enteredProduction =
        input.status === "production" && previousJob?.status !== "production";
      const payload = {
        customer_id: input.customer_id,
        customer_name: input.customer_name,
        customer_phone: input.customer_phone || null,
        customer_email: input.customer_email?.trim() || null,
        contact_person: input.contact_person?.trim() || null,
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
        cancellation_reason: input.cancellation_reason?.trim() || null,
      };
      const q = input.id
        ? sb.from("jobs").update(payload).eq("id", input.id)
        : sb.from("jobs").insert(payload);
      const { data: saved, error } = await q.select("id").single();
      if (error) throw error;
      if (input.production_items?.length && saved?.id) {
        const { error: itemError } = await sb.from("job_items").upsert(
          input.production_items.map((item) => ({
            job_id: saved.id,
            item_id: item.item_id,
            quantity: item.quantity,
          })),
          { onConflict: "job_id,item_id" },
        );
        if (itemError) throw itemError;
      }
      let automaticInvoiceNumber: string | undefined;
      if (enteredProduction && saved?.id) {
        const { data: invoice, error: invoiceError } = await sb.rpc(
          "create_production_invoice",
          { target_job_id: saved.id },
        );
        if (invoiceError) throw invoiceError;
        automaticInvoiceNumber = invoice?.[0]?.invoice_number;
      }
      setEditing(undefined);
      await loadData();
      if (enteredProduction && saved?.id) {
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
      show(
        "success",
        automaticInvoiceNumber
          ? `Job saved and invoice ${automaticInvoiceNumber} is ready`
          : "Job saved successfully",
      );
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
    { id: "items", label: "Items", Icon: Package },
    { id: "customers", label: "Customers", Icon: Users },
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
    items: ["Items", "Create and view standard items and rates."],
    customers: [
      "Customers",
      "View customer jobs and outstanding invoice balances.",
    ],
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
                  "items",
                  "customers",
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
            openInvoice={setViewingDocument}
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
        {view === "items" && (
          <Items
            items={items}
            canCreate={["super_admin", "admin"].includes(profile.role)}
            demo={demo}
            setItems={setItems}
            reload={loadData}
            show={show}
          />
        )}
        {view === "customers" && (
          <Customers
            customers={customers}
            jobs={jobs}
            documents={documents}
            open={setEditing}
          />
        )}
        {view === "quotations" && (
          <Documents
            mode="quotation"
            documents={documents}
            payments={payments}
            jobs={jobs}
            catalogItems={items}
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
            catalogItems={items}
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
          items={items}
          customers={customers}
          canFinance={canFinance}
          canDelete={canDelete}
          onClose={() => setEditing(undefined)}
          onSave={saveJob}
          onCreateCustomer={createCustomer}
          onDelete={removeJob}
        />
      )}
      {viewingDocument && (
        <DocumentViewer
          document={viewingDocument}
          onClose={() => setViewingDocument(null)}
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
  openInvoice,
}: {
  jobs: Job[];
  documents: FinancialDocument[];
  filtered: Job[];
  search: string;
  setSearch: (s: string) => void;
  status: string;
  setStatus: (s: string) => void;
  open: (j: Job) => void;
  openInvoice: (document: FinancialDocument) => void;
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
          value={
            jobs.filter(
              (job) => !["completed", "cancelled"].includes(job.status),
            ).length
          }
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
      <JobTable
        jobs={filtered.filter(
          (job) => !["completed", "cancelled"].includes(job.status),
        )}
        documents={documents}
        open={open}
        openInvoice={openInvoice}
      />
    </>
  );
}
function Customers({
  customers,
  jobs,
  documents,
  open,
}: {
  customers: Customer[];
  jobs: Job[];
  documents: FinancialDocument[];
  open: (job: Job) => void;
}) {
  const [search, setSearch] = useState("");
  const customerRows = useMemo(() => {
    const normalizeName = (value: string) =>
      value.trim().toLocaleLowerCase().replace(/\s+/g, " ");
    return customers
      .map((customer) => {
        const customerJobs = jobs.filter(
          (job) =>
            job.customer_id === customer.id ||
            (!job.customer_id &&
              normalizeName(job.customer_name) === normalizeName(customer.name)),
        );
        const jobIds = new Set(customerJobs.map((job) => job.id));
        const activeJobs = customerJobs.filter(
          (job) =>
            !["delivered", "completed", "cancelled"].includes(job.status),
        );
        const invoices = documents.filter(
          (document) =>
            document.document_type === "invoice" &&
            ((document.job_id && jobIds.has(document.job_id)) ||
              (!document.job_id &&
                normalizeName(document.customer_name) ===
                  normalizeName(customer.name))),
        );
        return {
          ...customer,
          key: customer.id,
          jobs: customerJobs,
          activeJobs,
          totalDue: invoices.reduce(
            (total, invoice) =>
              total +
              Math.max(0, documentTotal(invoice) - Number(invoice.amount_paid)),
            0,
          ),
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [customers, documents, jobs]);
  const query = search.trim().toLocaleLowerCase();
  const visible = customerRows.filter((customer) =>
    !query ||
    [
      customer.name,
      customer.email,
      customer.phone,
      ...customer.jobs.map((job) => job.job_number),
    ]
      .join(" ")
      .toLocaleLowerCase()
      .includes(query),
  );
  return (
    <>
      <section className="sectionHead">
        <h2>Customer list</h2>
        <Filters search={search} setSearch={setSearch} />
      </section>
      <div className="tableWrap responsiveTable">
        <table>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Contact</th>
              <th>Active jobs</th>
              <th>Total due</th>
              <th>Total jobs</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((customer) => (
              <tr key={customer.key}>
                <td data-label="Customer" className="customerCell">
                  <strong>{customer.name}</strong>
                </td>
                <td data-label="Contact">
                  <span className="customerContact">
                    {customer.email && <span>{customer.email}</span>}
                    {customer.phone && <span>{customer.phone}</span>}
                    {!customer.email && !customer.phone && "—"}
                  </span>
                </td>
                <td data-label="Active jobs">
                  <span className="customerJobs">
                    {customer.activeJobs.map((job) => (
                      <button key={job.id} type="button" onClick={() => open(job)}>
                        {job.job_number} · {labels[job.status]}
                      </button>
                    ))}
                    {!customer.activeJobs.length && "—"}
                  </span>
                </td>
                <td data-label="Total due">
                  <strong>{money(customer.totalDue)}</strong>
                </td>
                <td data-label="Total jobs">{customer.jobs.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!visible.length && <div className="empty">No customers found.</div>}
      </div>
    </>
  );
}
function JobTable({
  jobs,
  documents,
  open,
  openInvoice,
}: {
  jobs: Job[];
  documents: FinancialDocument[];
  open: (j: Job) => void;
  openInvoice?: (document: FinancialDocument) => void;
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
            const invoice = documents.find(
              (document) =>
                document.document_type === "invoice" &&
                document.job_id === j.id,
            );
            const invoiceNumber = j.invoice_number || invoice?.document_number;
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
                {invoice && openInvoice ? (
                  <button
                    type="button"
                    className="invoiceNumberLink"
                    onClick={(event) => {
                      event.stopPropagation();
                      openInvoice(invoice);
                    }}
                  >
                    {invoice.document_number}
                  </button>
                ) : (
                  <strong
                    style={{ color: invoiceNumber ? undefined : "#ba4035" }}
                  >
                    {invoiceNumber || "Invoice missing"}
                  </strong>
                )}
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
  const stages: JobStatus[] = STATUSES.filter(
    (status) =>
      status !== "delivered" &&
      status !== "unpaid" &&
      status !== "cancelled" &&
      status !== "completed",
  );
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
  items,
  customers,
  canFinance,
  canDelete,
  onClose,
  onSave,
  onCreateCustomer,
  onDelete,
}: {
  job: Job | null;
  currentUserId: string;
  profiles: Profile[];
  factories: FactoryRecord[];
  items: Item[];
  customers: Customer[];
  canFinance: boolean;
  canDelete: boolean;
  onClose: () => void;
  onSave: (j: JobSaveInput) => Promise<void>;
  onCreateCustomer: (customer: {
    name: string;
    phone: string;
    email: string;
    contact_person: string;
  }) => Promise<Customer>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [form, setForm] = useState<Partial<Job>>(
    job
      ? {
          ...job,
          customer_id:
            job.customer_id ||
            customers.find(
              (customer) =>
                customer.name.trim().toLocaleLowerCase() ===
                job.customer_name.trim().toLocaleLowerCase(),
            )?.id ||
            null,
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
  const [productionOpen, setProductionOpen] = useState(false);
  const [productionRows, setProductionRows] = useState<ProductionItemRow[]>([
    { selection: "", quantity: 1 },
  ]);
  const [productionItems, setProductionItems] = useState<ProductionItemInput[]>(
    [],
  );
  const [productionError, setProductionError] = useState("");
  const customerListId = useId();
  const [customerOpen, setCustomerOpen] = useState(false);
  const [customerError, setCustomerError] = useState("");
  const [creatingCustomer, setCreatingCustomer] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancellationReason, setCancellationReason] = useState(
    job?.cancellation_reason || "",
  );
  const [cancellationError, setCancellationError] = useState("");
  const set = (k: keyof Job, v: unknown) => setForm((f) => ({ ...f, [k]: v }));
  const selectCustomer = (customer: Customer) => {
    setForm((current) => ({
      ...current,
      customer_id: customer.id,
      customer_name: customer.name,
      customer_phone: customer.phone,
      customer_email: customer.email,
      contact_person: customer.contact_person,
    }));
    setCustomerError("");
  };
  const available = factories.filter(
    (f) => f.active || f.id === form.factory_id,
  );
  const visibleProductionItems = productionItems.length
    ? productionItems.map((line) => ({
        quantity: line.quantity,
        item: items.find((item) => item.id === line.item_id) || null,
      }))
    : job?.production_items || [];
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
          if (!form.customer_id) {
            setCustomerError(
              "Select an existing customer or create a new customer first.",
            );
            return;
          }
          void onSave({ ...form, production_items: productionItems });
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
            <Field label="Customer name" wide>
              <div className="customerPicker">
                <input
                  required
                  list={customerListId}
                  placeholder="Search customer name"
                  value={form.customer_name || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    const match = customers.find(
                      (customer) =>
                        customer.name.toLocaleLowerCase() ===
                        value.trim().toLocaleLowerCase(),
                    );
                    if (match) selectCustomer(match);
                    else {
                      setForm((current) => ({
                        ...current,
                        customer_id: null,
                        customer_name: value,
                      }));
                      setCustomerError("");
                    }
                  }}
                />
                <datalist id={customerListId}>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.name}>
                      {[customer.contact_person, customer.phone]
                        .filter(Boolean)
                        .join(" · ")}
                    </option>
                  ))}
                </datalist>
                <button
                  type="button"
                  className="secondary"
                  onClick={() => {
                    setCustomerError("");
                    setCustomerOpen(true);
                  }}
                >
                  <Plus /> New customer
                </button>
              </div>
              {customerError && <small className="fieldError">{customerError}</small>}
            </Field>
            <Field label="Phone">
              <input
                value={form.customer_phone || ""}
                onChange={(e) => set("customer_phone", e.target.value)}
              />
            </Field>
            <Field label="Email address (optional)">
              <input
                type="email"
                value={form.customer_email || ""}
                onChange={(e) => set("customer_email", e.target.value)}
              />
            </Field>
            <Field label="Contact person">
              <input
                value={form.contact_person || ""}
                onChange={(e) => set("contact_person", e.target.value)}
              />
            </Field>
            <Field label="Due date">
              <input
                type="date"
                value={form.due_date || ""}
                onChange={(e) => set("due_date", e.target.value)}
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
            <Field label="Internal notes" wide>
              <textarea
                rows={3}
                value={form.notes || ""}
                onChange={(e) => set("notes", e.target.value)}
              />
            </Field>
          </div>
        </FormSection>
        <FormSection title="Workflow & assignment">
          <div className="formGrid">
            <Field label="Status">
              <select
                value={form.status}
                onChange={(e) => {
                  const next = e.target.value as JobStatus;
                  if (next === "production" && form.status !== "production") {
                    setProductionRows([{ selection: "", quantity: 1 }]);
                    setProductionError("");
                    setProductionOpen(true);
                    return;
                  }
                  set("status", next);
                }}
              >
                {STATUSES.filter(
                  (s) => s !== "unpaid" && s !== "cancelled",
                ).map((s) => (
                  <option key={s} value={s}>
                    {labels[s]}
                  </option>
                ))}
                {form.status === "cancelled" && (
                  <option value="cancelled">Cancelled</option>
                )}
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
        {(form.status === "production" || visibleProductionItems.length > 0) && (
          <FormSection title="Items">
            {visibleProductionItems.length ? (
              <div className="jobItemsList">
                {visibleProductionItems.map((line, index) => (
                  <article
                    className="jobItemRow"
                    key={`${line.item?.id || "item"}-${index}`}
                  >
                    <div>
                      <strong>
                        {line.item?.code || "—"} ·{" "}
                        {line.item?.name || "Unknown item"}
                      </strong>
                    </div>
                    <span>Qty {Number(line.quantity).toLocaleString()}</span>
                  </article>
                ))}
              </div>
            ) : (
              <div className="warning">No production items selected.</div>
            )}
          </FormSection>
        )}
        <FormSection title="Quotation & invoice">
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
          </fieldset>
          {!canFinance && (
            <small className="helper">
              Your account has read-only access to quotation and invoice
              fields.
            </small>
          )}
          {form.status === "cancelled" && (
            <div className="cancelledReason">
              <strong>Cancellation reason</strong>
              <span>{form.cancellation_reason}</span>
            </div>
          )}
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
          {job && !["completed", "cancelled"].includes(job.status) && (
            <button
              className="danger"
              type="button"
              onClick={() => {
                setCancellationReason("");
                setCancellationError("");
                setCancelOpen(true);
              }}
            >
              Cancel job
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
      {customerOpen && (
        <div className="productionOverlay">
          <form
            className="smallModal"
            onSubmit={async (event) => {
              event.preventDefault();
              setCreatingCustomer(true);
              setCustomerError("");
              try {
                const data = new FormData(event.currentTarget);
                const customer = await onCreateCustomer({
                  name: String(data.get("name") || ""),
                  phone: String(data.get("phone") || ""),
                  email: String(data.get("email") || ""),
                  contact_person: String(data.get("contact_person") || ""),
                });
                selectCustomer(customer);
                setCustomerOpen(false);
              } catch (error) {
                setCustomerError(
                  error instanceof Error
                    ? error.message
                    : "Unable to create customer.",
                );
              } finally {
                setCreatingCustomer(false);
              }
            }}
          >
            <header>
              <div>
                <span className="eyebrow">NEW CUSTOMER</span>
                <h2>Add customer to the directory</h2>
              </div>
              <button
                type="button"
                className="iconBtn"
                onClick={() => setCustomerOpen(false)}
              >
                <X />
              </button>
            </header>
            <Field label="Customer name">
              <input name="name" required autoFocus />
            </Field>
            <Field label="Contact person">
              <input name="contact_person" />
            </Field>
            <Field label="Phone">
              <input name="phone" />
            </Field>
            <Field label="Email address (optional)">
              <input name="email" type="email" />
            </Field>
            {customerError && <div className="warning">{customerError}</div>}
            <button className="primary customerCreate" type="submit" disabled={creatingCustomer}>
              {creatingCustomer ? "Creating…" : "Create and select customer"}
            </button>
          </form>
        </div>
      )}
      {cancelOpen && (
        <div className="productionOverlay">
          <form
            className="smallModal"
            onSubmit={(event) => {
              event.preventDefault();
              const reason = cancellationReason.trim();
              if (!reason) {
                setCancellationError("Enter a reason for cancelling this job.");
                return;
              }
              setCancelOpen(false);
              void onSave({
                ...form,
                status: "cancelled",
                cancellation_reason: reason,
                production_items: productionItems,
              });
            }}
          >
            <header>
              <div>
                <span className="eyebrow">CANCEL JOB</span>
                <h2>Why is this job being cancelled?</h2>
              </div>
              <button
                type="button"
                className="iconBtn"
                onClick={() => setCancelOpen(false)}
              >
                <X />
              </button>
            </header>
            <Field label="Cancellation reason">
              <textarea
                autoFocus
                required
                rows={4}
                value={cancellationReason}
                onChange={(event) => {
                  setCancellationReason(event.target.value);
                  setCancellationError("");
                }}
              />
            </Field>
            {cancellationError && (
              <div className="warning">{cancellationError}</div>
            )}
            <button className="danger cancelConfirm" type="submit">
              Confirm cancellation
            </button>
          </form>
        </div>
      )}
      {productionOpen && (
        <div className="productionOverlay">
          <form
            className="smallModal productionModal"
            onSubmit={(event) => {
              event.preventDefault();
              const selected = productionRows.map((row) => ({
                item: items.find((item) => {
                  const option = `${item.code} — ${item.name}`;
                  const value = row.selection.trim().toLocaleLowerCase();
                  return (
                    option.toLocaleLowerCase() === value ||
                    item.code.toLocaleLowerCase() === value ||
                    item.name.toLocaleLowerCase() === value
                  );
                }),
                quantity: Number(row.quantity),
              }));
              if (selected.some(({ item }) => !item)) {
                setProductionError("Select a valid item from the item list.");
                return;
              }
              if (
                selected.some(
                  ({ quantity }) => !Number.isFinite(quantity) || quantity <= 0,
                )
              ) {
                setProductionError("Enter a quantity greater than zero.");
                return;
              }
              const ids = selected.map(({ item }) => item!.id);
              if (new Set(ids).size !== ids.length) {
                setProductionError("The same item cannot be added twice.");
                return;
              }
              setProductionItems(
                selected.map(({ item, quantity }) => ({
                  item_id: item!.id,
                  quantity,
                })),
              );
              set("status", "production");
              setProductionOpen(false);
            }}
          >
            <header>
              <div>
                <span className="eyebrow">PRODUCTION ITEMS</span>
                <h2>Select items and quantities</h2>
              </div>
              <button
                type="button"
                className="iconBtn"
                onClick={() => setProductionOpen(false)}
              >
                <X />
              </button>
            </header>
            <datalist id="production-item-options">
              {items.map((item) => (
                <option key={item.id} value={`${item.code} — ${item.name}`}>
                  {money(item.rate)}
                </option>
              ))}
            </datalist>
            <div className="productionLines">
              {productionRows.map((row, index) => (
                <div className="productionLine" key={index}>
                  <Field label="Item name">
                    <input
                      list="production-item-options"
                      required
                      placeholder="Search item code or name"
                      value={row.selection}
                      onChange={(e) =>
                        setProductionRows((rows) =>
                          rows.map((current, rowIndex) =>
                            rowIndex === index
                              ? { ...current, selection: e.target.value }
                              : current,
                          ),
                        )
                      }
                    />
                  </Field>
                  <Field label="Quantity">
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      required
                      value={row.quantity}
                      onChange={(e) =>
                        setProductionRows((rows) =>
                          rows.map((current, rowIndex) =>
                            rowIndex === index
                              ? { ...current, quantity: Number(e.target.value) }
                              : current,
                          ),
                        )
                      }
                    />
                  </Field>
                  {productionRows.length > 1 && (
                    <button
                      type="button"
                      className="iconBtn"
                      aria-label="Remove item"
                      onClick={() =>
                        setProductionRows((rows) =>
                          rows.filter((_, rowIndex) => rowIndex !== index),
                        )
                      }
                    >
                      <Trash2 />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {!items.length && (
              <div className="warning">Create an item in Operations → Items first.</div>
            )}
            {productionError && <div className="warning">{productionError}</div>}
            <button
              className="secondary addProductionItem"
              type="button"
              onClick={() =>
                setProductionRows((rows) => [
                  ...rows,
                  { selection: "", quantity: 1 },
                ])
              }
            >
              <Plus /> Add item
            </button>
            <footer>
              <button
                type="button"
                className="secondary"
                onClick={() => setProductionOpen(false)}
              >
                Cancel
              </button>
              <button className="primary" type="submit" disabled={!items.length}>
                Confirm production items
              </button>
            </footer>
          </form>
        </div>
      )}
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

function CatalogItemInput({
  itemId,
  fallbackLabel,
  catalogItems,
  onSelect,
}: {
  itemId?: string | null;
  fallbackLabel?: string;
  catalogItems: Item[];
  onSelect: (item: Item) => void;
}) {
  const listId = useId();
  const selected = catalogItems.find((item) => item.id === itemId);
  const [query, setQuery] = useState(fallbackLabel || "");
  const choose = (value: string) => {
    const normalized = value.trim().toLocaleLowerCase();
    const match = catalogItems.find(
      (item) =>
        `${item.code} — ${item.name}`.toLocaleLowerCase() === normalized ||
        item.code.toLocaleLowerCase() === normalized ||
        item.name.toLocaleLowerCase() === normalized,
    );
    if (match) onSelect(match);
  };
  if (selected) {
    return (
      <input
        className="catalogItemLocked"
        value={`${selected.code} — ${selected.name}`}
        aria-label="Item"
        readOnly
        title="Remove this row to select a different item"
      />
    );
  }
  return (
    <>
      <input
        list={listId}
        required
        value={query}
        aria-label="Item"
        placeholder="Search item code or name"
        onChange={(event) => {
          setQuery(event.target.value);
          choose(event.target.value);
        }}
        onBlur={(event) => choose(event.target.value)}
      />
      <datalist id={listId}>
        {catalogItems.map((item) => (
          <option key={item.id} value={`${item.code} — ${item.name}`} />
        ))}
      </datalist>
    </>
  );
}

function Documents({
  mode,
  documents,
  payments,
  jobs,
  catalogItems,
  demo,
  reload,
  show,
}: {
  mode: "quotation" | "invoice";
  documents: FinancialDocument[];
  payments: Payment[];
  jobs: Job[];
  catalogItems: Item[];
  demo: boolean;
  reload: () => Promise<void>;
  show: (k: "success" | "error", t: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<FinancialDocument | null>(null);
  const [viewingDoc, setViewingDoc] = useState<FinancialDocument | null>(null);
  const [payingInvoice, setPayingInvoice] =
    useState<FinancialDocument | null>(null);
  const kind = mode;
  const visibleDocuments = documents.filter(
    (document) => document.document_type === mode,
  );
  const [items, setItems] = useState<DocumentItem[]>([
    { item_id: null, description: "", detail: null, quantity: 1, rate: 0, position: 1 },
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
      { item_id: null, description: "", detail: null, quantity: 1, rate: 0, position: 1 },
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
      if (!items.length || items.some((item) => !item.item_id)) {
        show("error", "Select every invoice item from the Items database");
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
          amount_paid: 0,
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
            item_id: i.item_id,
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
                ),
                paymentLocked =
                  d.document_type === "invoice" &&
                  payments.some((payment) => payment.invoice_id === d.id);
              return (
                <tr key={d.id}>
                  <td data-label="Number">
                    <button
                      type="button"
                      className="invoiceNumberLink"
                      onClick={() => setViewingDoc(d)}
                    >
                      {d.document_number}
                    </button>
                  </td>
                  <td data-label="Type">
                    <StatusPill value={d.document_type} />
                  </td>
                  <td data-label="Status">
                    <select
                      className={`statusSelect ${d.status}`}
                      value={d.status}
                      disabled={converted || paymentLocked}
                      title={
                        converted
                          ? "Converted quotations are locked"
                          : paymentLocked
                            ? "Invoices with recorded payments are locked"
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
                      {!converted && !paymentLocked && (
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
      {viewingDoc && (
        <DocumentViewer
          document={viewingDoc}
          onClose={() => setViewingDoc(null)}
        />
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
              </div>
            </FormSection>
            <FormSection title="Items">
              <div className="lineItems">
                <div className="lineItemHeaders" aria-hidden="true">
                  <span>Item</span>
                  <span>Description</span>
                  <span>Qty</span>
                  <span>Rate</span>
                  <span />
                </div>
                {items.map((item, index) => (
                  <div className="lineItem" key={index}>
                    <CatalogItemInput
                      itemId={item.item_id}
                      fallbackLabel={item.description}
                      catalogItems={catalogItems}
                      onSelect={(selected) =>
                        setItems(
                          items.map((current, itemIndex) =>
                            itemIndex === index
                              ? {
                                  ...current,
                                  item_id: selected.id,
                                  description: `${selected.code} - ${selected.name}`,
                                  detail: current.detail || selected.description,
                                  rate: Number(selected.rate),
                                }
                              : current,
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
                      item_id: null,
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
          catalogItems={catalogItems}
          demo={demo}
          onClose={() => setEditingDoc(null)}
          reload={reload}
          show={show}
        />
      )}
    </>
  );
}

function DocumentViewer({
  document,
  onClose,
}: {
  document: FinancialDocument;
  onClose: () => void;
}) {
  const total = documentTotal(document);
  const balance = Math.max(0, total - Number(document.amount_paid));
  return (
    <div
      className="modal"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section className="drawer documentViewer">
        <header>
          <div>
            <span className="eyebrow">VIEW {document.document_type}</span>
            <h2>{document.document_number}</h2>
          </div>
          <button type="button" className="iconBtn" onClick={onClose}>
            <X />
          </button>
        </header>
        <FormSection title="Customer">
          <div className="documentViewGrid">
            <span>Customer</span>
            <strong>{document.customer_name}</strong>
            <span>Subject</span>
            <strong>{document.subject || "—"}</strong>
            <span>Issue date</span>
            <strong>{formatDate(document.issue_date)}</strong>
            <span>Due date</span>
            <strong>
              {document.due_date ? formatDate(document.due_date) : "—"}
            </strong>
            <span>Status</span>
            <strong>{labels[document.status] || document.status}</strong>
          </div>
        </FormSection>
        <FormSection title="Items">
          <div className="documentViewItems">
            {[...document.items]
              .sort((a, b) => a.position - b.position)
              .map((item) => (
                <article key={item.id || item.position}>
                  <div>
                    <strong>{item.description}</strong>
                    {item.detail && <small>{item.detail}</small>}
                  </div>
                  <span>Qty {Number(item.quantity).toLocaleString()}</span>
                  <span>{money(Number(item.rate))}</span>
                  <strong>
                    {money(Number(item.quantity) * Number(item.rate))}
                  </strong>
                </article>
              ))}
          </div>
          <div className="documentViewTotals">
            <span>Total</span>
            <strong>{money(total)}</strong>
            {document.document_type === "invoice" && (
              <>
                <span>Paid</span>
                <strong>{money(Number(document.amount_paid))}</strong>
                <span>Balance</span>
                <strong>{money(balance)}</strong>
              </>
            )}
          </div>
        </FormSection>
        {document.notes && (
          <FormSection title="Notes">
            <p className="documentViewNotes">{document.notes}</p>
          </FormSection>
        )}
        <footer>
          <span />
          <button className="secondary" type="button" onClick={onClose}>
            Close
          </button>
          <button
            className="primary"
            type="button"
            onClick={() => printDocument(document)}
          >
            <Printer /> Print / PDF
          </button>
        </footer>
      </section>
    </div>
  );
}

function DocumentEditor({
  document,
  jobs,
  catalogItems,
  demo,
  onClose,
  reload,
  show,
}: {
  document: FinancialDocument;
  jobs: Job[];
  catalogItems: Item[];
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
      if (!items.length || items.some((item) => !item.item_id)) {
        show("error", "Select every invoice item from the Items database");
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
            item_id: i.item_id,
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
              item_id: i.item_id,
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
          </div>
        </FormSection>
        <FormSection title="Items">
          <div className="lineItems">
            <div className="lineItemHeaders" aria-hidden="true">
              <span>Item</span>
              <span>Description</span>
              <span>Qty</span>
              <span>Rate</span>
              <span />
            </div>
            {items.map((item, index) => (
              <div className="lineItem" key={index}>
                <CatalogItemInput
                  itemId={item.item_id}
                  fallbackLabel={item.description}
                  catalogItems={catalogItems}
                  onSelect={(selected) =>
                    setItems(
                      items.map((current, itemIndex) =>
                        itemIndex === index
                          ? {
                              ...current,
                              item_id: selected.id,
                              description: `${selected.code} - ${selected.name}`,
                              detail: current.detail || selected.description,
                              rate: Number(selected.rate),
                            }
                          : current,
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
                  item_id: null,
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
        `<tr><td>${n + 1}</td><td>${escapeHtml(i.description)}${i.detail ? `<small>${escapeHtml(i.detail)}</small>` : ""}</td><td>${Number(i.rate).toLocaleString("en-US", { minimumFractionDigits: 2 })}</td><td>${Number(i.quantity).toLocaleString("en-US", { maximumFractionDigits: 2 })}</td><td>${(Number(i.quantity) * Number(i.rate)).toLocaleString("en-US", { minimumFractionDigits: 2 })}</td></tr>`,
    )
    .join("");
  const isInvoice = d.document_type === "invoice";
  const logoUrl = new URL("/mn-logo.png", window.location.origin).href;
  const moneyValue = (value: number) =>
    value.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(
    `<!doctype html><html><head><title>${escapeHtml(d.document_number)}</title><style>
      @page{size:A4;margin:0}*{box-sizing:border-box}html,body{margin:0;width:210mm;min-height:297mm}body{color:#1d304d;font:12px Georgia,"Times New Roman",serif}.page{width:210mm;min-height:297mm;padding:18mm 20mm 16mm;display:flex;flex-direction:column}.head{display:flex;justify-content:space-between;gap:40px}.brand img{display:block;width:118px;height:auto}.company{margin-top:20px;line-height:1.42}.title{text-align:right;color:#1d304d}.title h1{font-size:34px;line-height:1;margin:0 0 7px;font-weight:500;color:#111}.title .number{display:block;font-weight:700}.balance{margin-top:20px}.balance span{display:block;margin-bottom:4px}.balance strong{font-size:17px}.dates{margin:82px 0 0 auto;display:grid;grid-template-columns:auto auto;gap:5px 8px;text-align:right}.customer{font-weight:700;margin:8px 0 48px;color:#222;line-height:1.45}.subject{margin:0 0 18px}.subject b{display:block;font-weight:400}.subject span{display:block;margin-top:2px;color:#222}table{width:100%;border-collapse:collapse;color:#1d304d}th,td{border:1px solid #444;padding:6px 9px}th{font-weight:400;text-align:center}th:nth-child(1),td:nth-child(1){width:5%;text-align:center}th:nth-child(2),td:nth-child(2){width:53%}th:nth-child(n+3),td:nth-child(n+3){width:14%;text-align:center}td small{display:block;color:#666;margin-top:3px}.totals{width:38%;margin:12px 2% 24px auto;color:#111;border-top:1px solid #bbb}.totals>div{display:grid;grid-template-columns:1fr auto;align-items:baseline;gap:20px;padding:5px 2px;font-size:12px;line-height:1.35}.totals .grand{font-size:12px;font-weight:700;border-top:1px solid #ddd}.totals .grand span{font-weight:700;text-align:right}.bank{margin-top:auto;color:#333;line-height:1.38}.bank b{text-decoration:underline}.notes{margin-top:30px;white-space:pre-line;color:#333}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
    </style></head><body><main class="page"><div class="head"><div class="brand"><img src="${escapeHtml(logoUrl)}" alt="MN Maldives"><div class="company">Flat 159-G-01<br>Hulhumale Kaafu 23000<br>Maldives<br>+960 769 6312</div></div><div class="title"><h1>${isInvoice ? "Invoice" : "Quotation"}</h1><span class="number"># ${escapeHtml(d.document_number)}</span>${isInvoice ? `<div class="balance"><span>Balance Due</span><strong>MVR${moneyValue(balance)}</strong></div>` : ""}<div class="dates"><span>${isInvoice ? "Invoice" : "Quote"} Date :</span><b>${formatDate(d.issue_date)}</b><span>Terms :</span><b>${escapeHtml(d.terms)}</b>${isInvoice ? `<span>Due Date :</span><b>${d.due_date ? formatDate(d.due_date) : "—"}</b>` : ""}</div></div></div><div class="customer">${escapeHtml(d.customer_name)}${d.customer_address ? `<br>${escapeHtml(d.customer_address).replaceAll("\n", "<br>")}` : ""}</div>${d.subject ? `<div class="subject"><b>SUBJECT :</b><span>${escapeHtml(d.subject)}</span></div>` : ""}<table><thead><tr><th>#</th><th>Item / Description</th><th>Rate</th><th>QTY</th><th>Amount</th></tr></thead><tbody>${rows}</tbody></table><div class="totals"><div><span>Sub Total</span><span>${moneyValue(sub)}</span></div><div><span>Discount (${Number(d.discount_percent).toFixed(2)}%)</span><span>(-) ${moneyValue(discount)}</span></div><div class="grand">TOTAL<span>MVR${moneyValue(total)}</span></div>${isInvoice ? `<div class="grand">Balance Due<span>MVR${moneyValue(balance)}</span></div>` : ""}</div><div class="bank"><b>Bank of Maldives</b><br>Account Name: MN MALDIVES<br>MVR 7770000140438 - USD 7770000140439<br><b>MIB</b><br>Account Name: MN Ventures<br>MVR 90101440001091000 - USD 90101440001092000</div>${!isInvoice ? `<div class="notes">${escapeHtml(d.notes || "- This quote is valid for a period of 30 days from the quotation date.\n- Half payment will be collected at the beginning of the work and remaining payment must be cleared within 10 days upon completion of the work.\n- Products will be delivered within 7 to 10 days from the confirmation date.").replaceAll("\n", "<br>")}</div>` : ""}</main><script>window.onload=()=>{const logo=document.querySelector("img");if(logo&&!logo.complete){logo.onload=()=>window.print()}else{window.print()}}<\/script></body></html>`,
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
function Items({
  items,
  canCreate,
  demo,
  setItems,
  reload,
  show,
}: {
  items: Item[];
  canCreate: boolean;
  demo: boolean;
  setItems: (items: Item[]) => void;
  reload: () => Promise<void>;
  show: (kind: "success" | "error", text: string) => void;
}) {
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const code = String(data.get("code") || "").trim();
    const name = String(data.get("name") || "").trim();
    const rate = Number(data.get("rate"));
    const description = String(data.get("description") || "").trim();
    if (!code) {
      show("error", "Enter an item code");
      return;
    }
    if (!name) {
      show("error", "Enter an item name");
      return;
    }
    if (!Number.isFinite(rate) || rate < 0) {
      show("error", "Enter a valid item rate");
      return;
    }
    const duplicateCode = items.some(
      (item) => item.code.trim().toLocaleLowerCase() === code.toLocaleLowerCase(),
    );
    if (duplicateCode) {
      show("error", "This item code already exists");
      return;
    }
    const duplicateName = items.some(
      (item) => item.name.trim().toLocaleLowerCase() === name.toLocaleLowerCase(),
    );
    if (duplicateName) {
      show("error", "This item name already exists");
      return;
    }
    try {
      if (demo) {
        setItems([
          ...items,
          {
            id: crypto.randomUUID(),
            code,
            name,
            rate,
            description: description || null,
            created_at: new Date().toISOString(),
          },
        ].sort((a, b) => a.name.localeCompare(b.name)));
      } else {
        const { error } = await createClient().from("items").insert({
          code,
          name,
          rate,
          description: description || null,
        });
        if (error) throw error;
        await reload();
      }
      form.reset();
      show("success", "Item created");
    } catch (error) {
      const duplicateError =
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "23505";
      show(
        "error",
        duplicateError
          ? "This item already exists"
          : error instanceof Error
            ? error.message
            : "Unable to create item",
      );
    }
  };
  const updateItem = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingItem) return;
    const data = new FormData(event.currentTarget);
    const code = String(data.get("code") || "").trim();
    const name = String(data.get("name") || "").trim();
    const rate = Number(data.get("rate"));
    const description = String(data.get("description") || "").trim();
    if (!code || !name || !Number.isFinite(rate) || rate < 0) {
      show("error", "Enter a valid item code, name and rate");
      return;
    }
    if (
      items.some(
        (item) =>
          item.id !== editingItem.id &&
          item.code.trim().toLocaleLowerCase() === code.toLocaleLowerCase(),
      )
    ) {
      show("error", "This item code already exists");
      return;
    }
    if (
      items.some(
        (item) =>
          item.id !== editingItem.id &&
          item.name.trim().toLocaleLowerCase() === name.toLocaleLowerCase(),
      )
    ) {
      show("error", "This item name already exists");
      return;
    }
    try {
      if (demo) {
        setItems(
          items
            .map((item) =>
              item.id === editingItem.id
                ? { ...item, code, name, rate, description: description || null }
                : item,
            )
            .sort((a, b) => a.name.localeCompare(b.name)),
        );
      } else {
        const { error } = await createClient()
          .from("items")
          .update({ code, name, rate, description: description || null })
          .eq("id", editingItem.id);
        if (error) throw error;
        await reload();
      }
      setEditingItem(null);
      show("success", "Item updated");
    } catch (error) {
      const duplicateError =
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "23505";
      show(
        "error",
        duplicateError
          ? "This item code or name already exists"
          : error instanceof Error
            ? error.message
            : "Unable to update item",
      );
    }
  };
  return (
    <>
      {canCreate && (
        <form className="itemAdd formGrid" onSubmit={save}>
          <Field label="Item code">
            <input name="code" required maxLength={50} />
          </Field>
          <Field label="Item name">
            <input name="name" required maxLength={160} />
          </Field>
          <Field label="Rate (MVR)">
            <input name="rate" type="number" min="0" step="0.01" required />
          </Field>
          <Field label="Item description (optional)" wide>
            <textarea name="description" rows={3} maxLength={2000} />
          </Field>
          <button className="primary" type="submit">
            <Plus /> Create item
          </button>
        </form>
      )}
      {!canCreate && (
        <div className="warning">Only administrators can create items.</div>
      )}
      <section className="sectionHead">
        <h2>Item list</h2>
        <span className="helper">{items.length} current items</span>
      </section>
      <div className="tableWrap responsiveTable">
        <table>
          <thead>
            <tr>
              <th>Item code</th>
              <th>Item name</th>
              <th>Rate</th>
              <th>Description</th>
              {canCreate && <th>Action</th>}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td data-label="Item code"><strong className="jobNo">{item.code}</strong></td>
                <td data-label="Item name"><strong>{item.name}</strong></td>
                <td data-label="Rate">{money(item.rate)}</td>
                <td data-label="Description">{item.description || "—"}</td>
                {canCreate && (
                  <td data-label="Action">
                    <button
                      type="button"
                      className="secondary compact"
                      onClick={() => setEditingItem(item)}
                    >
                      <Pencil /> Edit
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {!items.length && <div className="empty">No items created yet.</div>}
      </div>
      {editingItem && (
        <div className="modal">
          <form className="smallModal" onSubmit={updateItem}>
            <header>
              <div>
                <span className="eyebrow">EDIT ITEM</span>
                <h2>{editingItem.code} · {editingItem.name}</h2>
              </div>
              <button
                type="button"
                className="iconBtn"
                onClick={() => setEditingItem(null)}
              >
                <X />
              </button>
            </header>
            <Field label="Item code">
              <input name="code" required maxLength={50} defaultValue={editingItem.code} />
            </Field>
            <Field label="Item name">
              <input name="name" required maxLength={160} defaultValue={editingItem.name} />
            </Field>
            <Field label="Rate (MVR)">
              <input name="rate" type="number" min="0" step="0.01" required defaultValue={editingItem.rate} />
            </Field>
            <Field label="Item description (optional)">
              <textarea name="description" rows={3} maxLength={2000} defaultValue={editingItem.description || ""} />
            </Field>
            <button className="primary customerCreate" type="submit">
              Save item changes
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
