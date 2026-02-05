--
-- PostgreSQL database dump
--

\restrict lMwRUQm1UyZW1C9wlaJYuahmYOnWvoyEq94YhnLNXkk2bN3SVbvQy2697gQ8S45

-- Dumped from database version 16.11 (Ubuntu 16.11-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.11 (Ubuntu 16.11-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: assets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.assets (
    id integer NOT NULL,
    asset_name text NOT NULL,
    value numeric NOT NULL,
    purchase_date date NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.assets OWNER TO postgres;

--
-- Name: assets_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.assets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.assets_id_seq OWNER TO postgres;

--
-- Name: assets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.assets_id_seq OWNED BY public.assets.id;


--
-- Name: bank_transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bank_transactions (
    id integer NOT NULL,
    bank_account_id integer NOT NULL,
    transaction_type character varying(10),
    amount numeric(15,2) NOT NULL,
    description text,
    transaction_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT bank_transactions_amount_check CHECK ((amount > (0)::numeric)),
    CONSTRAINT bank_transactions_transaction_type_check CHECK (((transaction_type)::text = ANY ((ARRAY['DEBIT'::character varying, 'CREDIT'::character varying])::text[])))
);


ALTER TABLE public.bank_transactions OWNER TO postgres;

--
-- Name: bank_transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.bank_transactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.bank_transactions_id_seq OWNER TO postgres;

--
-- Name: bank_transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.bank_transactions_id_seq OWNED BY public.bank_transactions.id;


--
-- Name: banks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.banks (
    id integer NOT NULL,
    bank_name character varying(100) NOT NULL,
    branch character varying(100),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.banks OWNER TO postgres;

--
-- Name: banks_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.banks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.banks_id_seq OWNER TO postgres;

--
-- Name: banks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.banks_id_seq OWNED BY public.banks.id;


--
-- Name: company_bank_accounts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.company_bank_accounts (
    id integer NOT NULL,
    bank_id integer NOT NULL,
    account_number character varying(50) NOT NULL,
    account_name character varying(100),
    opening_balance numeric(15,2) NOT NULL,
    current_balance numeric(15,2) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.company_bank_accounts OWNER TO postgres;

--
-- Name: company_bank_accounts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.company_bank_accounts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.company_bank_accounts_id_seq OWNER TO postgres;

--
-- Name: company_bank_accounts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.company_bank_accounts_id_seq OWNED BY public.company_bank_accounts.id;


--
-- Name: employees; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employees (
    id integer NOT NULL,
    name character varying(150) NOT NULL,
    email character varying(100),
    phone character varying(30),
    role character varying(100),
    department character varying(100),
    hire_date date,
    salary numeric(12,2),
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.employees OWNER TO postgres;

--
-- Name: employees_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.employees_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.employees_id_seq OWNER TO postgres;

--
-- Name: employees_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.employees_id_seq OWNED BY public.employees.id;


--
-- Name: note_shares; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.note_shares (
    id integer NOT NULL,
    note_id integer NOT NULL,
    shared_with_user_id integer NOT NULL,
    permission character varying(10) DEFAULT 'read'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT note_shares_permission_check CHECK (((permission)::text = ANY ((ARRAY['read'::character varying, 'write'::character varying])::text[])))
);


ALTER TABLE public.note_shares OWNER TO postgres;

--
-- Name: note_shares_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.note_shares_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.note_shares_id_seq OWNER TO postgres;

--
-- Name: note_shares_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.note_shares_id_seq OWNED BY public.note_shares.id;


--
-- Name: notes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notes (
    id integer NOT NULL,
    user_id integer NOT NULL,
    title character varying(200) NOT NULL,
    content text,
    color character varying(20) DEFAULT '#ffffff'::character varying,
    is_pinned boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.notes OWNER TO postgres;

--
-- Name: notes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notes_id_seq OWNER TO postgres;

--
-- Name: notes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notes_id_seq OWNED BY public.notes.id;


--
-- Name: password_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.password_history (
    id integer NOT NULL,
    user_id integer NOT NULL,
    password_hash text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.password_history OWNER TO postgres;

--
-- Name: password_history_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.password_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.password_history_id_seq OWNER TO postgres;

--
-- Name: password_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.password_history_id_seq OWNED BY public.password_history.id;


--
-- Name: payables; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payables (
    payable_id integer NOT NULL,
    vendor_id integer NOT NULL,
    payable_name character varying(150) NOT NULL,
    description text,
    payable_type character varying(20),
    amount numeric(12,2) NOT NULL,
    frequency character varying(20),
    start_date date,
    end_date date,
    project_id integer,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT payables_frequency_check CHECK (((frequency)::text = ANY ((ARRAY['WEEKLY'::character varying, 'MONTHLY'::character varying, 'YEARLY'::character varying])::text[]))),
    CONSTRAINT payables_payable_type_check CHECK (((payable_type)::text = ANY ((ARRAY['ONE_TIME'::character varying, 'RECURRING'::character varying])::text[])))
);


ALTER TABLE public.payables OWNER TO postgres;

--
-- Name: payables_payable_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.payables_payable_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.payables_payable_id_seq OWNER TO postgres;

--
-- Name: payables_payable_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.payables_payable_id_seq OWNED BY public.payables.payable_id;


--
-- Name: permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.permissions (
    id integer NOT NULL,
    resource character varying(50) NOT NULL,
    action character varying(20) NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.permissions OWNER TO postgres;

--
-- Name: permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.permissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.permissions_id_seq OWNER TO postgres;

--
-- Name: permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.permissions_id_seq OWNED BY public.permissions.id;


--
-- Name: petty_cash_account; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.petty_cash_account (
    id integer NOT NULL,
    account_name character varying(100) DEFAULT 'Petty Cash'::character varying,
    current_balance numeric(15,2) DEFAULT 0.00,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.petty_cash_account OWNER TO postgres;

--
-- Name: petty_cash_account_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.petty_cash_account_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.petty_cash_account_id_seq OWNER TO postgres;

--
-- Name: petty_cash_account_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.petty_cash_account_id_seq OWNED BY public.petty_cash_account.id;


--
-- Name: petty_cash_transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.petty_cash_transactions (
    id integer NOT NULL,
    transaction_type character varying(10),
    amount numeric(12,2) NOT NULL,
    description text,
    category character varying(100),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT petty_cash_transactions_transaction_type_check CHECK (((transaction_type)::text = ANY ((ARRAY['ADD'::character varying, 'SPEND'::character varying])::text[])))
);


ALTER TABLE public.petty_cash_transactions OWNER TO postgres;

--
-- Name: petty_cash_transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.petty_cash_transactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.petty_cash_transactions_id_seq OWNER TO postgres;

--
-- Name: petty_cash_transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.petty_cash_transactions_id_seq OWNED BY public.petty_cash_transactions.id;


--
-- Name: project_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.project_items (
    project_id integer NOT NULL,
    requirements text NOT NULL,
    service_category text NOT NULL,
    unit_cost numeric NOT NULL,
    requirement_type text NOT NULL
);


ALTER TABLE public.project_items OWNER TO postgres;

--
-- Name: projects; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.projects (
    project_id integer NOT NULL,
    projects_name character varying(200),
    customer_name character varying(200),
    description text,
    initial_cost_budget numeric(12,2),
    extra_budget_allocation numeric(12,2),
    payment_type character varying(50),
    status character varying(50)
);


ALTER TABLE public.projects OWNER TO postgres;

--
-- Name: projects_project_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.projects_project_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.projects_project_id_seq OWNER TO postgres;

--
-- Name: projects_project_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.projects_project_id_seq OWNED BY public.projects.project_id;


--
-- Name: rbac_audit_log; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rbac_audit_log (
    id integer NOT NULL,
    user_id integer,
    action character varying(100) NOT NULL,
    details jsonb,
    ip_address character varying(50),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.rbac_audit_log OWNER TO postgres;

--
-- Name: rbac_audit_log_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.rbac_audit_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.rbac_audit_log_id_seq OWNER TO postgres;

--
-- Name: rbac_audit_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.rbac_audit_log_id_seq OWNED BY public.rbac_audit_log.id;


--
-- Name: receivables; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.receivables (
    receivable_id integer NOT NULL,
    payer_name character varying(150) NOT NULL,
    receivable_name character varying(150) NOT NULL,
    description text,
    receivable_type character varying(50),
    amount numeric(12,2) NOT NULL,
    frequency character varying(50),
    start_date date,
    end_date date,
    project_id integer,
    is_active boolean DEFAULT true,
    bank_account_id integer,
    payment_method character varying(50),
    reference_number character varying(100),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.receivables OWNER TO postgres;

--
-- Name: receivables_receivable_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.receivables_receivable_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.receivables_receivable_id_seq OWNER TO postgres;

--
-- Name: receivables_receivable_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.receivables_receivable_id_seq OWNED BY public.receivables.receivable_id;


--
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.role_permissions (
    role_id integer NOT NULL,
    permission_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.role_permissions OWNER TO postgres;

--
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    description text,
    is_system_role boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roles_id_seq OWNER TO postgres;

--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: todo_shares; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.todo_shares (
    id integer NOT NULL,
    todo_id integer NOT NULL,
    shared_with_user_id integer NOT NULL,
    permission character varying(10) DEFAULT 'read'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT todo_shares_permission_check CHECK (((permission)::text = ANY ((ARRAY['read'::character varying, 'write'::character varying])::text[])))
);


ALTER TABLE public.todo_shares OWNER TO postgres;

--
-- Name: todo_shares_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.todo_shares_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.todo_shares_id_seq OWNER TO postgres;

--
-- Name: todo_shares_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.todo_shares_id_seq OWNED BY public.todo_shares.id;


--
-- Name: todos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.todos (
    id integer NOT NULL,
    user_id integer NOT NULL,
    title character varying(200) NOT NULL,
    description text,
    status character varying(20) DEFAULT 'pending'::character varying,
    priority character varying(10) DEFAULT 'medium'::character varying,
    due_date date,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT todos_priority_check CHECK (((priority)::text = ANY ((ARRAY['low'::character varying, 'medium'::character varying, 'high'::character varying])::text[]))),
    CONSTRAINT todos_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'in_progress'::character varying, 'completed'::character varying])::text[])))
);


ALTER TABLE public.todos OWNER TO postgres;

--
-- Name: todos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.todos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.todos_id_seq OWNER TO postgres;

--
-- Name: todos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.todos_id_seq OWNED BY public.todos.id;


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_roles (
    user_id integer NOT NULL,
    role_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.user_roles OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    password_hash text NOT NULL,
    role text DEFAULT 'user'::text,
    created_at timestamp without time zone DEFAULT now(),
    password_must_change boolean DEFAULT false
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: COLUMN users.password_must_change; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.password_must_change IS 'Flag to force password change on next login';


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: vendors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vendors (
    vendor_id integer NOT NULL,
    vendor_name character varying(150) NOT NULL,
    contact_email character varying(100),
    contact_phone character varying(30),
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.vendors OWNER TO postgres;

--
-- Name: vendors_vendor_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.vendors_vendor_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.vendors_vendor_id_seq OWNER TO postgres;

--
-- Name: vendors_vendor_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.vendors_vendor_id_seq OWNED BY public.vendors.vendor_id;


--
-- Name: assets id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assets ALTER COLUMN id SET DEFAULT nextval('public.assets_id_seq'::regclass);


--
-- Name: bank_transactions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_transactions ALTER COLUMN id SET DEFAULT nextval('public.bank_transactions_id_seq'::regclass);


--
-- Name: banks id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.banks ALTER COLUMN id SET DEFAULT nextval('public.banks_id_seq'::regclass);


--
-- Name: company_bank_accounts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company_bank_accounts ALTER COLUMN id SET DEFAULT nextval('public.company_bank_accounts_id_seq'::regclass);


--
-- Name: employees id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees ALTER COLUMN id SET DEFAULT nextval('public.employees_id_seq'::regclass);


--
-- Name: note_shares id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.note_shares ALTER COLUMN id SET DEFAULT nextval('public.note_shares_id_seq'::regclass);


--
-- Name: notes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notes ALTER COLUMN id SET DEFAULT nextval('public.notes_id_seq'::regclass);


--
-- Name: password_history id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_history ALTER COLUMN id SET DEFAULT nextval('public.password_history_id_seq'::regclass);


--
-- Name: payables payable_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payables ALTER COLUMN payable_id SET DEFAULT nextval('public.payables_payable_id_seq'::regclass);


--
-- Name: permissions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions ALTER COLUMN id SET DEFAULT nextval('public.permissions_id_seq'::regclass);


--
-- Name: petty_cash_account id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.petty_cash_account ALTER COLUMN id SET DEFAULT nextval('public.petty_cash_account_id_seq'::regclass);


--
-- Name: petty_cash_transactions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.petty_cash_transactions ALTER COLUMN id SET DEFAULT nextval('public.petty_cash_transactions_id_seq'::regclass);


--
-- Name: projects project_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects ALTER COLUMN project_id SET DEFAULT nextval('public.projects_project_id_seq'::regclass);


--
-- Name: rbac_audit_log id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rbac_audit_log ALTER COLUMN id SET DEFAULT nextval('public.rbac_audit_log_id_seq'::regclass);


--
-- Name: receivables receivable_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.receivables ALTER COLUMN receivable_id SET DEFAULT nextval('public.receivables_receivable_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Name: todo_shares id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.todo_shares ALTER COLUMN id SET DEFAULT nextval('public.todo_shares_id_seq'::regclass);


--
-- Name: todos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.todos ALTER COLUMN id SET DEFAULT nextval('public.todos_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: vendors vendor_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendors ALTER COLUMN vendor_id SET DEFAULT nextval('public.vendors_vendor_id_seq'::regclass);


--
-- Data for Name: assets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.assets (id, asset_name, value, purchase_date, created_at) FROM stdin;
\.


--
-- Data for Name: bank_transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bank_transactions (id, bank_account_id, transaction_type, amount, description, transaction_date) FROM stdin;
\.


--
-- Data for Name: banks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.banks (id, bank_name, branch, created_at) FROM stdin;
\.


--
-- Data for Name: company_bank_accounts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.company_bank_accounts (id, bank_id, account_number, account_name, opening_balance, current_balance, created_at) FROM stdin;
\.


--
-- Data for Name: employees; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.employees (id, name, email, phone, role, department, hire_date, salary, is_active, created_at) FROM stdin;
\.


--
-- Data for Name: note_shares; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.note_shares (id, note_id, shared_with_user_id, permission, created_at) FROM stdin;
\.


--
-- Data for Name: notes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notes (id, user_id, title, content, color, is_pinned, created_at, updated_at) FROM stdin;
1	1	Task 1	needs to be finished today	#ff8a80	f	2026-02-03 20:46:19.600709	2026-02-03 20:46:19.600709
\.


--
-- Data for Name: password_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.password_history (id, user_id, password_hash, created_at) FROM stdin;
1	3	$2b$10$rxFU3nwSm2sgjRkh.0gVdu129IoTpD8VtWD5TGRDvQGZCZDbbW9v2	2026-02-03 23:43:44.987003
2	2	$2b$10$lp5m5lPyqFDHeLgXSVXBJeh7yrSqXw37DKCkhksHm8NDDUiuJyu9S	2026-02-03 23:43:53.761945
\.


--
-- Data for Name: payables; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payables (payable_id, vendor_id, payable_name, description, payable_type, amount, frequency, start_date, end_date, project_id, is_active, created_at) FROM stdin;
\.


--
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.permissions (id, resource, action, description, created_at) FROM stdin;
1	employees	create	Create new employees	2026-02-03 03:17:48.796305
2	employees	read	View employee information	2026-02-03 03:17:48.801714
3	employees	update	Update employee details	2026-02-03 03:17:48.803376
4	employees	delete	Delete employees	2026-02-03 03:17:48.804639
5	projects	create	Create new projects	2026-02-03 03:17:48.805977
6	projects	read	View project information	2026-02-03 03:17:48.807131
7	projects	update	Update project details	2026-02-03 03:17:48.808396
8	projects	delete	Delete projects	2026-02-03 03:17:48.809657
9	accounts	create	Create bank accounts	2026-02-03 03:17:48.811061
10	accounts	read	View account information	2026-02-03 03:17:48.81244
11	accounts	update	Update account details	2026-02-03 03:17:48.813695
12	accounts	delete	Delete accounts	2026-02-03 03:17:48.814766
13	payables	create	Create payable bills	2026-02-03 03:17:48.816059
14	payables	read	View payable information	2026-02-03 03:17:48.817133
15	payables	update	Update payable details	2026-02-03 03:17:48.818206
16	payables	delete	Delete payables	2026-02-03 03:17:48.819168
17	receivables	create	Create receivable bills	2026-02-03 03:17:48.820246
18	receivables	read	View receivable information	2026-02-03 03:17:48.821359
19	receivables	update	Update receivable details	2026-02-03 03:17:48.822485
20	receivables	delete	Delete receivables	2026-02-03 03:17:48.823571
21	assets	create	Create assets	2026-02-03 03:17:48.824726
22	assets	read	View asset information	2026-02-03 03:17:48.825813
23	assets	update	Update asset details	2026-02-03 03:17:48.826879
24	assets	delete	Delete assets	2026-02-03 03:17:48.827866
25	vendors	create	Create vendors	2026-02-03 03:17:48.828876
26	vendors	read	View vendor information	2026-02-03 03:17:48.830022
27	vendors	update	Update vendor details	2026-02-03 03:17:48.831099
28	vendors	delete	Delete vendors	2026-02-03 03:17:48.832153
29	analytics	read	View analytics and reports	2026-02-03 03:17:48.833203
30	settings	read	View settings	2026-02-03 03:17:48.834264
31	settings	manage	Manage roles and permissions	2026-02-03 03:17:48.835285
\.


--
-- Data for Name: petty_cash_account; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.petty_cash_account (id, account_name, current_balance, updated_at) FROM stdin;
1	Petty Cash	0.00	2026-02-04 00:22:28.34565
\.


--
-- Data for Name: petty_cash_transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.petty_cash_transactions (id, transaction_type, amount, description, category, created_at) FROM stdin;
\.


--
-- Data for Name: project_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.project_items (project_id, requirements, service_category, unit_cost, requirement_type) FROM stdin;
1	computer	Hardware	30000	Initial Requirement
\.


--
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.projects (project_id, projects_name, customer_name, description, initial_cost_budget, extra_budget_allocation, payment_type, status) FROM stdin;
1	werasingha hardware	werasinha 	pos	98000.00	0.00	Pending	ongoing
\.


--
-- Data for Name: rbac_audit_log; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.rbac_audit_log (id, user_id, action, details, ip_address, created_at) FROM stdin;
1	1	DELETE_ROLE	{"roleId": "4", "roleName": "Project Manager"}	\N	2026-02-03 04:59:55.658503
2	1	DELETE_ROLE	{"roleId": "5", "roleName": "Viewer"}	\N	2026-02-03 04:59:59.164987
3	1	CREATE_ROLE	{"roleId": 6, "roleName": "senior admin"}	\N	2026-02-03 05:57:08.802957
4	1	CREATE_USER	{"roleIds": [1], "emailSent": false, "newUserId": 2, "newUserEmail": "dilantha@bloomtech.lk"}	\N	2026-02-03 22:52:45.301595
5	2	CREATE_USER	{"roleIds": [3], "emailSent": false, "newUserId": 3, "newUserEmail": "hiru@bloomtech.lk"}	\N	2026-02-03 22:53:32.960574
6	1	RESET_USER_PASSWORD	{"emailSent": true, "targetUserId": 3, "targetUserEmail": "hiru@bloomtech.lk"}	\N	2026-02-03 23:43:45.824262
7	1	RESET_USER_PASSWORD	{"emailSent": true, "targetUserId": 2, "targetUserEmail": "dilantha@bloomtech.lk"}	\N	2026-02-03 23:43:54.113542
\.


--
-- Data for Name: receivables; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.receivables (receivable_id, payer_name, receivable_name, description, receivable_type, amount, frequency, start_date, end_date, project_id, is_active, bank_account_id, payment_method, reference_number, created_at) FROM stdin;
\.


--
-- Data for Name: role_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.role_permissions (role_id, permission_id, created_at) FROM stdin;
1	1	2026-02-03 03:17:48.844305
1	2	2026-02-03 03:17:48.846002
1	3	2026-02-03 03:17:48.847268
1	4	2026-02-03 03:17:48.84857
1	5	2026-02-03 03:17:48.849672
1	6	2026-02-03 03:17:48.850787
1	7	2026-02-03 03:17:48.852049
1	8	2026-02-03 03:17:48.853279
1	9	2026-02-03 03:17:48.8544
1	10	2026-02-03 03:17:48.855545
1	11	2026-02-03 03:17:48.85667
1	12	2026-02-03 03:17:48.857571
1	13	2026-02-03 03:17:48.858614
1	14	2026-02-03 03:17:48.859626
1	15	2026-02-03 03:17:48.860656
1	16	2026-02-03 03:17:48.861609
1	17	2026-02-03 03:17:48.862706
1	18	2026-02-03 03:17:48.863733
1	19	2026-02-03 03:17:48.864825
1	20	2026-02-03 03:17:48.865925
1	21	2026-02-03 03:17:48.867194
1	22	2026-02-03 03:17:48.868275
1	23	2026-02-03 03:17:48.869422
1	24	2026-02-03 03:17:48.870534
1	25	2026-02-03 03:17:48.87163
1	26	2026-02-03 03:17:48.872631
1	27	2026-02-03 03:17:48.873721
1	28	2026-02-03 03:17:48.874854
1	29	2026-02-03 03:17:48.876013
1	30	2026-02-03 03:17:48.877167
1	31	2026-02-03 03:17:48.878268
2	1	2026-02-03 03:17:48.879604
2	2	2026-02-03 03:17:48.880782
2	3	2026-02-03 03:17:48.881996
2	4	2026-02-03 03:17:48.883198
2	5	2026-02-03 03:17:48.884286
2	6	2026-02-03 03:17:48.88539
2	7	2026-02-03 03:17:48.886461
2	8	2026-02-03 03:17:48.887688
2	25	2026-02-03 03:17:48.888798
2	26	2026-02-03 03:17:48.889955
2	27	2026-02-03 03:17:48.890994
2	28	2026-02-03 03:17:48.892063
2	9	2026-02-03 03:17:48.893015
2	10	2026-02-03 03:17:48.894037
2	11	2026-02-03 03:17:48.894989
2	12	2026-02-03 03:17:48.895992
2	13	2026-02-03 03:17:48.897044
2	14	2026-02-03 03:17:48.898095
2	15	2026-02-03 03:17:48.899148
2	16	2026-02-03 03:17:48.900156
2	17	2026-02-03 03:17:48.901068
2	18	2026-02-03 03:17:48.902233
2	19	2026-02-03 03:17:48.903345
2	20	2026-02-03 03:17:48.904418
2	21	2026-02-03 03:17:48.905468
2	22	2026-02-03 03:17:48.906561
2	23	2026-02-03 03:17:48.907502
2	24	2026-02-03 03:17:48.908507
2	29	2026-02-03 03:17:48.9095
2	30	2026-02-03 03:17:48.910593
3	9	2026-02-03 03:17:48.911618
3	10	2026-02-03 03:17:48.912709
3	11	2026-02-03 03:17:48.913675
3	12	2026-02-03 03:17:48.914645
3	13	2026-02-03 03:17:48.915547
3	14	2026-02-03 03:17:48.916552
3	15	2026-02-03 03:17:48.918394
3	16	2026-02-03 03:17:48.919339
3	17	2026-02-03 03:17:48.920271
3	18	2026-02-03 03:17:48.924165
3	19	2026-02-03 03:17:48.925196
3	20	2026-02-03 03:17:48.926139
3	21	2026-02-03 03:17:48.927085
3	22	2026-02-03 03:17:48.927995
3	23	2026-02-03 03:17:48.929007
3	24	2026-02-03 03:17:48.930138
3	26	2026-02-03 03:17:48.931245
3	2	2026-02-03 03:17:48.932354
3	6	2026-02-03 03:17:48.9336
3	29	2026-02-03 03:17:48.934857
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (id, name, description, is_system_role, created_at, updated_at) FROM stdin;
1	Super Admin	Full system access with all permissions	t	2026-02-03 03:17:48.836699	2026-02-03 03:17:48.836699
2	Admin	Administrative access to most resources	f	2026-02-03 03:17:48.838474	2026-02-03 03:17:48.838474
3	Accountant	Full access to accounting modules	f	2026-02-03 03:17:48.839657	2026-02-03 03:17:48.839657
6	senior admin	\N	f	2026-02-03 05:57:08.798465	2026-02-03 05:57:08.798465
\.


--
-- Data for Name: todo_shares; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.todo_shares (id, todo_id, shared_with_user_id, permission, created_at) FROM stdin;
\.


--
-- Data for Name: todos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.todos (id, user_id, title, description, status, priority, due_date, created_at, updated_at) FROM stdin;
1	1	quartly report	have gaurawee run the report	pending	medium	2026-02-06	2026-02-03 20:47:03.09798	2026-02-03 20:47:08.785455
\.


--
-- Data for Name: user_roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_roles (user_id, role_id, created_at) FROM stdin;
1	1	2026-02-03 05:38:09.508775
2	1	2026-02-03 22:52:45.299758
3	3	2026-02-03 22:53:32.958813
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, email, password_hash, role, created_at, password_must_change) FROM stdin;
1	admin	admin@example.com	$2b$10$brPOk7656qJFF3GCWJMofeoHSVa4rmc5WwpFdabVWMvBW6IS6rGR2	admin	2026-02-03 03:01:01.276958	f
3	hiru@bloomtech.lk	hiru@bloomtech.lk	$2b$10$rxFU3nwSm2sgjRkh.0gVdu129IoTpD8VtWD5TGRDvQGZCZDbbW9v2	user	2026-02-03 22:53:32.954627	t
2	dilantha@bloomtech.lk	dilantha@bloomtech.lk	$2b$10$lp5m5lPyqFDHeLgXSVXBJeh7yrSqXw37DKCkhksHm8NDDUiuJyu9S	user	2026-02-03 22:52:45.295517	t
\.


--
-- Data for Name: vendors; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vendors (vendor_id, vendor_name, contact_email, contact_phone, is_active, created_at) FROM stdin;
\.


--
-- Name: assets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.assets_id_seq', 1, false);


--
-- Name: bank_transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.bank_transactions_id_seq', 1, false);


--
-- Name: banks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.banks_id_seq', 1, false);


--
-- Name: company_bank_accounts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.company_bank_accounts_id_seq', 1, false);


--
-- Name: employees_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.employees_id_seq', 1, false);


--
-- Name: note_shares_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.note_shares_id_seq', 1, false);


--
-- Name: notes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notes_id_seq', 1, true);


--
-- Name: password_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.password_history_id_seq', 2, true);


--
-- Name: payables_payable_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.payables_payable_id_seq', 1, false);


--
-- Name: permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.permissions_id_seq', 31, true);


--
-- Name: petty_cash_account_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.petty_cash_account_id_seq', 1, true);


--
-- Name: petty_cash_transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.petty_cash_transactions_id_seq', 1, false);


--
-- Name: projects_project_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.projects_project_id_seq', 1, true);


--
-- Name: rbac_audit_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.rbac_audit_log_id_seq', 7, true);


--
-- Name: receivables_receivable_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.receivables_receivable_id_seq', 1, false);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_id_seq', 6, true);


--
-- Name: todo_shares_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.todo_shares_id_seq', 1, false);


--
-- Name: todos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.todos_id_seq', 1, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 3, true);


--
-- Name: vendors_vendor_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.vendors_vendor_id_seq', 1, false);


--
-- Name: assets assets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT assets_pkey PRIMARY KEY (id);


--
-- Name: bank_transactions bank_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_transactions
    ADD CONSTRAINT bank_transactions_pkey PRIMARY KEY (id);


--
-- Name: banks banks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.banks
    ADD CONSTRAINT banks_pkey PRIMARY KEY (id);


--
-- Name: company_bank_accounts company_bank_accounts_account_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company_bank_accounts
    ADD CONSTRAINT company_bank_accounts_account_number_key UNIQUE (account_number);


--
-- Name: company_bank_accounts company_bank_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company_bank_accounts
    ADD CONSTRAINT company_bank_accounts_pkey PRIMARY KEY (id);


--
-- Name: employees employees_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (id);


--
-- Name: note_shares note_shares_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.note_shares
    ADD CONSTRAINT note_shares_pkey PRIMARY KEY (id);


--
-- Name: notes notes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notes
    ADD CONSTRAINT notes_pkey PRIMARY KEY (id);


--
-- Name: password_history password_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_history
    ADD CONSTRAINT password_history_pkey PRIMARY KEY (id);


--
-- Name: payables payables_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payables
    ADD CONSTRAINT payables_pkey PRIMARY KEY (payable_id);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- Name: permissions permissions_resource_action_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_resource_action_key UNIQUE (resource, action);


--
-- Name: petty_cash_account petty_cash_account_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.petty_cash_account
    ADD CONSTRAINT petty_cash_account_pkey PRIMARY KEY (id);


--
-- Name: petty_cash_transactions petty_cash_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.petty_cash_transactions
    ADD CONSTRAINT petty_cash_transactions_pkey PRIMARY KEY (id);


--
-- Name: project_items project_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_items
    ADD CONSTRAINT project_items_pkey PRIMARY KEY (project_id, requirements);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (project_id);


--
-- Name: rbac_audit_log rbac_audit_log_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rbac_audit_log
    ADD CONSTRAINT rbac_audit_log_pkey PRIMARY KEY (id);


--
-- Name: receivables receivables_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.receivables
    ADD CONSTRAINT receivables_pkey PRIMARY KEY (receivable_id);


--
-- Name: role_permissions role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY (role_id, permission_id);


--
-- Name: roles roles_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_name_key UNIQUE (name);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: todo_shares todo_shares_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.todo_shares
    ADD CONSTRAINT todo_shares_pkey PRIMARY KEY (id);


--
-- Name: todos todos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.todos
    ADD CONSTRAINT todos_pkey PRIMARY KEY (id);


--
-- Name: note_shares unique_note_share; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.note_shares
    ADD CONSTRAINT unique_note_share UNIQUE (note_id, shared_with_user_id);


--
-- Name: todo_shares unique_todo_share; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.todo_shares
    ADD CONSTRAINT unique_todo_share UNIQUE (todo_id, shared_with_user_id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (user_id, role_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: vendors vendors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT vendors_pkey PRIMARY KEY (vendor_id);


--
-- Name: idx_password_history_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_password_history_created_at ON public.password_history USING btree (created_at DESC);


--
-- Name: idx_password_history_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_password_history_user_id ON public.password_history USING btree (user_id);


--
-- Name: rbac_audit_log fk_audit_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rbac_audit_log
    ADD CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: company_bank_accounts fk_bank_account_bank; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company_bank_accounts
    ADD CONSTRAINT fk_bank_account_bank FOREIGN KEY (bank_id) REFERENCES public.banks(id);


--
-- Name: bank_transactions fk_bank_transaction_account; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_transactions
    ADD CONSTRAINT fk_bank_transaction_account FOREIGN KEY (bank_account_id) REFERENCES public.company_bank_accounts(id);


--
-- Name: note_shares fk_note_share_note; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.note_shares
    ADD CONSTRAINT fk_note_share_note FOREIGN KEY (note_id) REFERENCES public.notes(id) ON DELETE CASCADE;


--
-- Name: note_shares fk_note_share_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.note_shares
    ADD CONSTRAINT fk_note_share_user FOREIGN KEY (shared_with_user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: notes fk_note_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notes
    ADD CONSTRAINT fk_note_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: password_history fk_password_history_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_history
    ADD CONSTRAINT fk_password_history_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: payables fk_payables_project; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payables
    ADD CONSTRAINT fk_payables_project FOREIGN KEY (project_id) REFERENCES public.projects(project_id);


--
-- Name: payables fk_payables_vendor; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payables
    ADD CONSTRAINT fk_payables_vendor FOREIGN KEY (vendor_id) REFERENCES public.vendors(vendor_id);


--
-- Name: role_permissions fk_permission; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT fk_permission FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON DELETE CASCADE;


--
-- Name: receivables fk_receivables_project; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.receivables
    ADD CONSTRAINT fk_receivables_project FOREIGN KEY (project_id) REFERENCES public.projects(project_id);


--
-- Name: role_permissions fk_role; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT fk_role FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- Name: todo_shares fk_todo_share_todo; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.todo_shares
    ADD CONSTRAINT fk_todo_share_todo FOREIGN KEY (todo_id) REFERENCES public.todos(id) ON DELETE CASCADE;


--
-- Name: todo_shares fk_todo_share_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.todo_shares
    ADD CONSTRAINT fk_todo_share_user FOREIGN KEY (shared_with_user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: todos fk_todo_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.todos
    ADD CONSTRAINT fk_todo_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_roles fk_user_roles_role; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- Name: user_roles fk_user_roles_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: project_items project_items_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_items
    ADD CONSTRAINT project_items_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(project_id) ON DELETE CASCADE;


--
-- Name: receivables receivables_bank_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.receivables
    ADD CONSTRAINT receivables_bank_account_id_fkey FOREIGN KEY (bank_account_id) REFERENCES public.company_bank_accounts(id);


--
-- PostgreSQL database dump complete
--

\unrestrict lMwRUQm1UyZW1C9wlaJYuahmYOnWvoyEq94YhnLNXkk2bN3SVbvQy2697gQ8S45

