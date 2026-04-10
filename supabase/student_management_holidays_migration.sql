-- Run once on an existing project that already has the base schema.
-- Adds student_management_holidays + trigger + indexes.

create table if not exists public.student_management_holidays (
    id uuid primary key default gen_random_uuid(),
    name varchar(200) not null,
    start_date date not null,
    end_date date not null,
    description text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint student_management_holidays_dates_valid check (end_date >= start_date)
);

drop trigger if exists trg_student_management_holidays_updated_at on public.student_management_holidays;
create trigger trg_student_management_holidays_updated_at
before update on public.student_management_holidays
for each row execute function public.student_management_set_updated_at();

create index if not exists idx_student_management_holidays_start
on public.student_management_holidays(start_date);

create index if not exists idx_student_management_holidays_end
on public.student_management_holidays(end_date);

create index if not exists idx_student_management_holidays_range
on public.student_management_holidays(start_date, end_date);
