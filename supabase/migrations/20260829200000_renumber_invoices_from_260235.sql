-- Renumber all existing invoices chronologically from MNINV-260235 and keep
-- the invoice sequence and linked job references in sync.
alter table public.financial_documents disable trigger protect_paid_invoice;

with numbered as (
  select id,
         'MNINV-26' || lpad((234 + row_number() over (
           order by issue_date, created_at, id
         ))::text, 4, '0') as new_number
  from public.financial_documents
  where document_type = 'invoice'
)
update public.financial_documents document
set document_number = numbered.new_number
from numbered
where document.id = numbered.id;

update public.jobs job
set invoice_number = document.document_number
from public.financial_documents document
where document.document_type = 'invoice'
  and document.job_id = job.id
  and job.invoice_number is distinct from document.document_number;

select setval(
  'public.invoice_number_seq',
  greatest(
    234,
    (select 234 + count(*) from public.financial_documents where document_type = 'invoice')
  ),
  true
);

alter table public.financial_documents enable trigger protect_paid_invoice;
