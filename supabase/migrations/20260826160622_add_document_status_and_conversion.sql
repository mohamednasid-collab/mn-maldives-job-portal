alter table public.financial_documents
  add column status text not null default 'draft'
    check (status in ('draft', 'sent')),
  add column source_quotation_id uuid unique
    references public.financial_documents(id) on delete set null;

create index financial_documents_source_quotation_idx
  on public.financial_documents(source_quotation_id);
