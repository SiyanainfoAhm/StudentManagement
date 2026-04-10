-- =========================================================
-- STUDENT MANAGEMENT SYSTEM - DATABASE SETUP
-- Prefix: student_management_
-- Demo-only friendly structure
-- No Supabase Auth
-- No RLS
-- =========================================================

create extension if not exists pgcrypto;

-- =========================
-- 1. CLASSES
-- =========================
create table if not exists public.student_management_classes (
    id uuid primary key default gen_random_uuid(),
    class_name varchar(50) not null,
    section varchar(10) not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint student_management_classes_unique unique (class_name, section)
);

-- =========================
-- 2. USERS
-- =========================
create table if not exists public.student_management_users (
    id uuid primary key default gen_random_uuid(),
    name varchar(150) not null,
    first_name varchar(80) not null,
    last_name varchar(80) not null,
    email varchar(150) not null unique,
    mobile varchar(20),
    role varchar(20) not null check (role in ('admin', 'teacher')),
    password_hash text not null,
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- =========================
-- 3. STUDENTS
-- =========================
create table if not exists public.student_management_students (
    id uuid primary key default gen_random_uuid(),
    admission_no varchar(50) unique,
    first_name varchar(80) not null,
    last_name varchar(80) not null,
    dob date,
    gender varchar(20) check (gender in ('male', 'female', 'other')),
    mobile varchar(20),
    email varchar(150),
    address text,
    admission_date date not null default current_date,
    class_id uuid references public.student_management_classes(id) on delete set null,
    guardian_name varchar(150),
    guardian_mobile varchar(20),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- =========================
-- 4. ATTENDANCE
-- =========================
create table if not exists public.student_management_attendance (
    id uuid primary key default gen_random_uuid(),
    student_id uuid not null references public.student_management_students(id) on delete cascade,
    attendance_date date not null,
    status varchar(20) not null check (status in ('present', 'absent')),
    marked_by uuid references public.student_management_users(id) on delete set null,
    remarks text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint student_management_attendance_unique unique (student_id, attendance_date)
);

-- =========================
-- 5. FEES
-- =========================
create table if not exists public.student_management_fees (
    id uuid primary key default gen_random_uuid(),
    student_id uuid not null references public.student_management_students(id) on delete cascade,
    fee_month int check (fee_month between 1 and 12),
    fee_year int check (fee_year >= 2020),
    amount numeric(10,2) not null check (amount >= 0),
    payment_date date,
    payment_mode varchar(30) check (payment_mode in ('cash', 'upi', 'card', 'bank_transfer')),
    status varchar(20) not null check (status in ('paid', 'pending')),
    remarks text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- =========================
-- 5b. HOLIDAYS (multi-day: one row = start_date .. end_date inclusive)
-- =========================
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

-- =========================
-- 6. UPDATED_AT TRIGGER
-- =========================
create or replace function public.student_management_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_student_management_classes_updated_at on public.student_management_classes;
create trigger trg_student_management_classes_updated_at
before update on public.student_management_classes
for each row execute function public.student_management_set_updated_at();

drop trigger if exists trg_student_management_users_updated_at on public.student_management_users;
create trigger trg_student_management_users_updated_at
before update on public.student_management_users
for each row execute function public.student_management_set_updated_at();

drop trigger if exists trg_student_management_students_updated_at on public.student_management_students;
create trigger trg_student_management_students_updated_at
before update on public.student_management_students
for each row execute function public.student_management_set_updated_at();

drop trigger if exists trg_student_management_attendance_updated_at on public.student_management_attendance;
create trigger trg_student_management_attendance_updated_at
before update on public.student_management_attendance
for each row execute function public.student_management_set_updated_at();

drop trigger if exists trg_student_management_fees_updated_at on public.student_management_fees;
create trigger trg_student_management_fees_updated_at
before update on public.student_management_fees
for each row execute function public.student_management_set_updated_at();

drop trigger if exists trg_student_management_holidays_updated_at on public.student_management_holidays;
create trigger trg_student_management_holidays_updated_at
before update on public.student_management_holidays
for each row execute function public.student_management_set_updated_at();

-- =========================
-- 7. INDEXES
-- =========================
create index if not exists idx_student_management_students_name
on public.student_management_students(first_name, last_name);

create index if not exists idx_student_management_students_mobile
on public.student_management_students(mobile);

create index if not exists idx_student_management_students_email
on public.student_management_students(email);

create index if not exists idx_student_management_students_class_id
on public.student_management_students(class_id);

create index if not exists idx_student_management_attendance_student_date
on public.student_management_attendance(student_id, attendance_date);

create index if not exists idx_student_management_fees_student_id
on public.student_management_fees(student_id);

create index if not exists idx_student_management_fees_status
on public.student_management_fees(status);

create index if not exists idx_student_management_users_email
on public.student_management_users(email);

create index if not exists idx_student_management_holidays_start
on public.student_management_holidays(start_date);

create index if not exists idx_student_management_holidays_end
on public.student_management_holidays(end_date);

create index if not exists idx_student_management_holidays_range
on public.student_management_holidays(start_date, end_date);

-- =========================
-- 8. SEED CLASSES
-- =========================
insert into public.student_management_classes (class_name, section)
values
('1st', 'A'),
('1st', 'B'),
('2nd', 'A'),
('2nd', 'B'),
('3rd', 'A'),
('4th', 'A'),
('5th', 'A'),
('6th', 'A'),
('7th', 'A'),
('8th', 'A')
on conflict (class_name, section) do nothing;

-- =========================
-- 9. SEED USERS
-- Password pattern: Fname.Lastname@123
-- Stored as bcrypt hash using crypt()
-- =========================
insert into public.student_management_users
(name, first_name, last_name, email, mobile, role, password_hash, is_active)
values
('Aarav Mehta', 'Aarav', 'Mehta', 'aarav.mehta@schooldemo.com', '9876500001', 'admin', crypt('Aarav.Mehta@123', gen_salt('bf')), true),
('Priya Shah', 'Priya', 'Shah', 'priya.shah@schooldemo.com', '9876500002', 'admin', crypt('Priya.Shah@123', gen_salt('bf')), true),
('Rohan Patel', 'Rohan', 'Patel', 'rohan.patel@schooldemo.com', '9876500003', 'teacher', crypt('Rohan.Patel@123', gen_salt('bf')), true),
('Neha Joshi', 'Neha', 'Joshi', 'neha.joshi@schooldemo.com', '9876500004', 'teacher', crypt('Neha.Joshi@123', gen_salt('bf')), true),
('Kunal Desai', 'Kunal', 'Desai', 'kunal.desai@schooldemo.com', '9876500005', 'teacher', crypt('Kunal.Desai@123', gen_salt('bf')), true),
('Isha Trivedi', 'Isha', 'Trivedi', 'isha.trivedi@schooldemo.com', '9876500006', 'teacher', crypt('Isha.Trivedi@123', gen_salt('bf')), true)
on conflict (email) do nothing;

-- =========================
-- 10. SEED STUDENTS (20 baseline)
-- =========================
with cls as (
  select id, class_name, section,
         row_number() over(order by class_name, section) as rn
  from public.student_management_classes
)
insert into public.student_management_students
(admission_no, first_name, last_name, dob, gender, mobile, email, address, admission_date, class_id, guardian_name, guardian_mobile)
values
('ADM001','Rahul','Sharma','2015-04-12','male','9898000001','rahul.sharma@studentdemo.com','Navrangpura, Ahmedabad','2025-06-10',(select id from cls where rn=1),'Mahesh Sharma','9898100001'),
('ADM002','Anaya','Patel','2015-07-22','female','9898000002','anaya.patel@studentdemo.com','Satellite, Ahmedabad','2025-06-10',(select id from cls where rn=1),'Ritesh Patel','9898100002'),
('ADM003','Vivaan','Joshi','2014-08-02','male','9898000003','vivaan.joshi@studentdemo.com','Bopal, Ahmedabad','2025-06-10',(select id from cls where rn=2),'Nilesh Joshi','9898100003'),
('ADM004','Diya','Shah','2014-11-18','female','9898000004','diya.shah@studentdemo.com','Vastrapur, Ahmedabad','2025-06-10',(select id from cls where rn=2),'Amit Shah','9898100004'),
('ADM005','Arjun','Trivedi','2014-01-30','male','9898000005','arjun.trivedi@studentdemo.com','Gota, Ahmedabad','2025-06-10',(select id from cls where rn=3),'Jignesh Trivedi','9898100005'),
('ADM006','Kiara','Desai','2013-12-05','female','9898000006','kiara.desai@studentdemo.com','Paldi, Ahmedabad','2025-06-10',(select id from cls where rn=3),'Mehul Desai','9898100006'),
('ADM007','Ishaan','Mehta','2013-03-11','male','9898000007','ishaan.mehta@studentdemo.com','Thaltej, Ahmedabad','2025-06-10',(select id from cls where rn=4),'Aarav Mehta','9898100007'),
('ADM008','Myra','Panchal','2013-05-25','female','9898000008','myra.panchal@studentdemo.com','Maninagar, Ahmedabad','2025-06-10',(select id from cls where rn=4),'Ketan Panchal','9898100008'),
('ADM009','Aditya','Modi','2012-02-15','male','9898000009','aditya.modi@studentdemo.com','Naranpura, Ahmedabad','2025-06-10',(select id from cls where rn=5),'Sanjay Modi','9898100009'),
('ADM010','Riya','Bhatt','2012-10-17','female','9898000010','riya.bhatt@studentdemo.com','Chandkheda, Ahmedabad','2025-06-10',(select id from cls where rn=5),'Bhavesh Bhatt','9898100010'),
('ADM011','Yash','Dave','2011-06-19','male','9898000011','yash.dave@studentdemo.com','Sabarmati, Ahmedabad','2025-06-10',(select id from cls where rn=6),'Mitesh Dave','98981000011'),
('ADM012','Saanvi','Parikh','2011-09-08','female','9898000012','saanvi.parikh@studentdemo.com','Bodakdev, Ahmedabad','2025-06-10',(select id from cls where rn=6),'Hiren Parikh','98981000012'),
('ADM013','Krish','Raval','2010-01-14','male','9898000013','krish.raval@studentdemo.com','Isanpur, Ahmedabad','2025-06-10',(select id from cls where rn=7),'Paresh Raval','98981000013'),
('ADM014','Aadhya','Soni','2010-04-20','female','9898000014','aadhya.soni@studentdemo.com','Nikol, Ahmedabad','2025-06-10',(select id from cls where rn=7),'Dharmesh Soni','98981000014'),
('ADM015','Kabir','Chauhan','2009-07-03','male','9898000015','kabir.chauhan@studentdemo.com','SG Highway, Ahmedabad','2025-06-10',(select id from cls where rn=8),'Vikram Chauhan','98981000015'),
('ADM016','Meera','Kapoor','2009-11-29','female','9898000016','meera.kapoor@studentdemo.com','Memnagar, Ahmedabad','2025-06-10',(select id from cls where rn=8),'Raj Kapoor','98981000016'),
('ADM017','Dev','Pandya','2008-08-13','male','9898000017','dev.pandya@studentdemo.com','Ranip, Ahmedabad','2025-06-10',(select id from cls where rn=9),'Pankaj Pandya','98981000017'),
('ADM018','Nitya','Gandhi','2008-12-09','female','9898000018','nitya.gandhi@studentdemo.com','Gurukul, Ahmedabad','2025-06-10',(select id from cls where rn=9),'Karan Gandhi','98981000018'),
('ADM019','Harsh','Thakkar','2008-03-27','male','9898000019','harsh.thakkar@studentdemo.com','Prahladnagar, Ahmedabad','2025-06-10',(select id from cls where rn=10),'Rohit Thakkar','98981000019'),
('ADM020','Tanya','Vyas','2008-06-21','female','9898000020','tanya.vyas@studentdemo.com','South Bopal, Ahmedabad','2025-06-10',(select id from cls where rn=10),'Alpesh Vyas','98981000020')
on conflict (admission_no) do nothing;

-- =========================
-- 11. SEED ATTENDANCE (last 5 days)
-- =========================
insert into public.student_management_attendance (student_id, attendance_date, status, marked_by, remarks)
select
  s.id,
  d::date as attendance_date,
  case when random() > 0.15 then 'present' else 'absent' end as status,
  (select id from public.student_management_users where role = 'teacher' order by created_at limit 1),
  null
from public.student_management_students s
cross join generate_series(current_date - interval '4 day', current_date, interval '1 day') d
on conflict (student_id, attendance_date) do nothing;

-- =========================
-- 12. SEED FEES (mix paid/pending)
-- =========================
insert into public.student_management_fees
(student_id, fee_month, fee_year, amount, payment_date, payment_mode, status, remarks)
select
  s.id,
  extract(month from current_date)::int,
  extract(year from current_date)::int,
  (2000 + floor(random() * 3000))::numeric(10,2),
  case when random() > 0.35 then current_date - ((random() * 10)::int) else null end,
  case
    when random() > 0.70 then 'cash'
    when random() > 0.40 then 'upi'
    when random() > 0.20 then 'card'
    else 'bank_transfer'
  end,
  case when random() > 0.35 then 'paid' else 'pending' end,
  'Monthly tuition fee'
from public.student_management_students s;

-- =========================
-- 12b. SEED HOLIDAYS (examples: single day + multi-day)
-- =========================
insert into public.student_management_holidays (name, start_date, end_date, description)
values
('Republic Day', (current_date + 30), (current_date + 30), 'National holiday'),
('Diwali break', (current_date + 60), (current_date + 65), 'School closed — 6 calendar days'),
('Holi', (current_date + 120), (current_date + 120), 'Festival holiday');

-- =========================
-- 13. HELPER VIEW - DASHBOARD SUMMARY
-- =========================
create or replace view public.student_management_dashboard_summary as
select
  (select count(*) from public.student_management_students) as total_students,
  (select count(*) from public.student_management_classes) as total_classes,
  (select count(*) from public.student_management_attendance where attendance_date = current_date and status = 'present') as today_present,
  (select count(*) from public.student_management_fees where status = 'pending') as pending_fees_count,
  (
    select coalesce(sum(amount), 0)
    from public.student_management_fees
    where status = 'paid'
      and fee_month = extract(month from current_date)::int
      and fee_year = extract(year from current_date)::int
  ) as fees_collected_this_month;

