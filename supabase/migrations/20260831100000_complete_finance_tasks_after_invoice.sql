create or replace function private.complete_finance_invoice_task()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.document_type = 'invoice'::public.document_type
     and new.job_id is not null then
    update public.tasks
       set status = 'done'::public.task_status
     where job_id = new.job_id
       and title = 'Create invoice and email customer'
       and status <> 'done'::public.task_status;
  end if;
  return new;
end
$$;

drop trigger if exists complete_finance_invoice_task on public.financial_documents;
create trigger complete_finance_invoice_task
after insert or update of document_type, job_id on public.financial_documents
for each row execute function private.complete_finance_invoice_task();

update public.tasks task
   set status = 'done'::public.task_status
 where task.title = 'Create invoice and email customer'
   and task.status <> 'done'::public.task_status
   and exists (
     select 1
       from public.financial_documents document
      where document.job_id = task.job_id
        and document.document_type = 'invoice'::public.document_type
   );
