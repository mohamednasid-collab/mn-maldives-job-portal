-- Number new invoices by their creation month in Maldives local time.
-- Format: MNINV-YYMM001, with the three-digit sequence restarting each month.
create or replace function private.assign_financial_number()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  invoice_period text;
  invoice_sequence integer;
begin
  if new.document_number is null or new.document_number = '' then
    if new.document_type = 'quotation'::public.document_type then
      new.document_number := 'MNQ-' ||
        pg_catalog.to_char(new.issue_date, 'YY') ||
        pg_catalog.lpad(
          pg_catalog.nextval('public.quotation_number_seq')::text,
          4,
          '0'
        );
    else
      invoice_period := pg_catalog.to_char(
        new.created_at at time zone 'Indian/Maldives',
        'YYMM'
      );

      -- Serialize number allocation for this month so simultaneous invoice
      -- creation cannot produce duplicate document numbers.
      perform pg_catalog.pg_advisory_xact_lock(
        pg_catalog.hashtextextended('mninv-' || invoice_period, 0)
      );

      select coalesce(
        pg_catalog.max(
          pg_catalog.substr(document.document_number, 11, 3)::integer
        ),
        0
      ) + 1
      into invoice_sequence
      from public.financial_documents document
      where document.document_type = 'invoice'::public.document_type
        and document.document_number ~ (
          '^MNINV-' || invoice_period || '[0-9]{3}$'
        );

      if invoice_sequence > 999 then
        raise exception 'The monthly invoice number limit of 999 has been reached for %',
          invoice_period;
      end if;

      new.document_number := 'MNINV-' ||
        invoice_period ||
        pg_catalog.lpad(invoice_sequence::text, 3, '0');
    end if;
  end if;

  return new;
end;
$$;
