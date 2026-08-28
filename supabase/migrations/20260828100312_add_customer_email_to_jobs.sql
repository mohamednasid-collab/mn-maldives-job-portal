alter table public.jobs
add column customer_email text
check (
  customer_email is null or (
    char_length(customer_email) <= 254 and
    customer_email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
  )
);
