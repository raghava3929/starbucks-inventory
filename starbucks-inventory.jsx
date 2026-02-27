import { useState, useEffect, useCallback } from "react";

// ─── MOCK DATA ─────────────────────────────────────────────────────────────────
const MOCK_USERS = [
  { id: "u1", username: "admin@sbux.in", password: "admin123", role: "admin", store_id: "store_1", name: "Priya Sharma" },
  { id: "u2", username: "staff@sbux.in", password: "staff123", role: "staff", store_id: "store_1", name: "Rahul Verma" },
];

const STORES = [
  { id: "store_1", name: "Starbucks – Connaught Place, Delhi" },
  { id: "store_2", name: "Starbucks – Bandra, Mumbai" },
];

const INITIAL_MATERIALS = [
  { id: "m1", name: "Arabica Coffee Beans", category: "Coffee", unit: "kg", threshold: 5, store_id: "store_1" },
  { id: "m2", name: "Whole Milk", category: "Dairy", unit: "liters", threshold: 10, store_id: "store_1" },
  { id: "m3", name: "Oat Milk", category: "Dairy", unit: "liters", threshold: 5, store_id: "store_1" },
  { id: "m4", name: "Vanilla Syrup", category: "Syrups", unit: "liters", threshold: 2, store_id: "store_1" },
  { id: "m5", name: "Hazelnut Syrup", category: "Syrups", unit: "liters", threshold: 2, store_id: "store_1" },
  { id: "m6", name: "Caramel Sauce", category: "Syrups", unit: "liters", threshold: 1.5, store_id: "store_1" },
  { id: "m7", name: "Matcha Powder", category: "Specialty", unit: "kg", threshold: 1, store_id: "store_1" },
  { id: "m8", name: "Whipped Cream", category: "Dairy", unit: "liters", threshold: 3, store_id: "store_1" },
  { id: "m9", name: "Paper Cups (12oz)", category: "Packaging", unit: "pieces", threshold: 100, store_id: "store_1" },
  { id: "m10", name: "Paper Cups (16oz)", category: "Packaging", unit: "pieces", threshold: 100, store_id: "store_1" },
  { id: "m11", name: "Sugar (White)", category: "Sweeteners", unit: "kg", threshold: 3, store_id: "store_1" },
  { id: "m12", name: "Cocoa Powder", category: "Specialty", unit: "kg", threshold: 1, store_id: "store_1" },
];

const TODAY = new Date().toISOString().split("T")[0];

const genStockId = (materialId) => `stock_${materialId}_${TODAY}`;

const INITIAL_STOCK = INITIAL_MATERIALS.map((m) => ({
  id: genStockId(m.id),
  material_id: m.id,
  date: TODAY,
  opening_stock: parseFloat((Math.random() * 15 + 3).toFixed(1)),
  new_stock_added: 0,
  quantity_used: 0,
  wastage: 0,
  store_id: "store_1",
  last_updated_by: null,
  last_updated_at: null,
}));

// ─── STYLES ────────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --green-900: #1a3a2e;
    --green-800: #1e4d3b;
    --green-700: #236040;
    --green-600: #00704A;
    --green-500: #00a862;
    --green-100: #d4edda;
    --cream: #f9f3e8;
    --cream-dark: #ede8dd;
    --gold: #cba135;
    --gold-light: #e8c56d;
    --red: #c0392b;
    --red-light: #fdecea;
    --yellow: #e67e22;
    --yellow-light: #fef3e2;
    --text-dark: #1a1a1a;
    --text-mid: #4a4a4a;
    --text-light: #888;
    --white: #ffffff;
    --shadow-sm: 0 2px 8px rgba(0,0,0,0.08);
    --shadow-md: 0 4px 20px rgba(0,0,0,0.12);
    --shadow-lg: 0 8px 40px rgba(0,0,0,0.16);
    --radius: 16px;
    --radius-sm: 10px;
  }

  body { font-family: 'DM Sans', sans-serif; background: var(--cream); color: var(--text-dark); min-height: 100vh; }

  /* LOGIN */
  .login-wrap {
    min-height: 100vh; display: grid; grid-template-columns: 1fr 1fr;
  }
  .login-left {
    background: linear-gradient(160deg, var(--green-900) 0%, var(--green-700) 60%, var(--green-500) 100%);
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    padding: 60px; position: relative; overflow: hidden;
  }
  .login-left::before {
    content: ''; position: absolute; width: 600px; height: 600px; border-radius: 50%;
    background: rgba(255,255,255,0.03); top: -200px; left: -200px;
  }
  .login-left::after {
    content: ''; position: absolute; width: 400px; height: 400px; border-radius: 50%;
    background: rgba(203,161,53,0.1); bottom: -100px; right: -100px;
  }
  .login-logo { font-family: 'Playfair Display', serif; color: var(--white); font-size: 2.2rem; font-weight: 700; letter-spacing: -0.5px; margin-bottom: 8px; }
  .login-sub { color: rgba(255,255,255,0.6); font-size: 0.95rem; letter-spacing: 2px; text-transform: uppercase; }
  .login-tagline { color: rgba(255,255,255,0.4); font-size: 0.85rem; margin-top: 60px; font-style: italic; }
  .login-right {
    background: var(--cream); display: flex; align-items: center; justify-content: center; padding: 60px;
  }
  .login-form-wrap { width: 100%; max-width: 400px; }
  .login-title { font-family: 'Playfair Display', serif; font-size: 2rem; color: var(--green-900); margin-bottom: 8px; }
  .login-hint { color: var(--text-light); font-size: 0.9rem; margin-bottom: 36px; }
  .form-group { margin-bottom: 20px; }
  .form-label { display: block; font-size: 0.8rem; font-weight: 600; color: var(--text-mid); letter-spacing: 1px; text-transform: uppercase; margin-bottom: 8px; }
  .form-input {
    width: 100%; padding: 14px 18px; border: 2px solid var(--cream-dark); border-radius: var(--radius-sm);
    font-size: 1rem; font-family: 'DM Sans', sans-serif; background: var(--white);
    transition: border-color 0.2s; outline: none;
  }
  .form-input:focus { border-color: var(--green-600); }
  .btn-primary {
    width: 100%; padding: 15px; background: var(--green-600); color: var(--white); border: none;
    border-radius: var(--radius-sm); font-size: 1rem; font-weight: 600; font-family: 'DM Sans', sans-serif;
    cursor: pointer; transition: all 0.2s; letter-spacing: 0.5px;
  }
  .btn-primary:hover { background: var(--green-800); transform: translateY(-1px); box-shadow: var(--shadow-md); }
  .error-msg { background: var(--red-light); color: var(--red); padding: 12px 16px; border-radius: var(--radius-sm); font-size: 0.9rem; margin-bottom: 20px; border-left: 3px solid var(--red); }
  .login-demo { margin-top: 24px; padding: 16px; background: var(--cream-dark); border-radius: var(--radius-sm); }
  .login-demo p { font-size: 0.78rem; color: var(--text-mid); margin-bottom: 4px; }
  .login-demo code { font-size: 0.82rem; background: var(--white); padding: 2px 6px; border-radius: 4px; color: var(--green-700); }

  /* SHELL */
  .shell { display: grid; grid-template-columns: 260px 1fr; min-height: 100vh; }
  .sidebar {
    background: var(--green-900); display: flex; flex-direction: column; padding: 0;
    position: sticky; top: 0; height: 100vh; overflow-y: auto;
  }
  .sidebar-brand {
    padding: 28px 24px 20px; border-bottom: 1px solid rgba(255,255,255,0.08);
  }
  .brand-name { font-family: 'Playfair Display', serif; color: var(--white); font-size: 1.3rem; font-weight: 700; }
  .brand-store { color: rgba(255,255,255,0.45); font-size: 0.72rem; margin-top: 4px; line-height: 1.4; }
  .nav { padding: 16px 12px; flex: 1; }
  .nav-item {
    display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: var(--radius-sm);
    color: rgba(255,255,255,0.6); font-size: 0.9rem; font-weight: 500; cursor: pointer;
    transition: all 0.15s; margin-bottom: 4px;
  }
  .nav-item:hover { background: rgba(255,255,255,0.08); color: var(--white); }
  .nav-item.active { background: var(--green-600); color: var(--white); }
  .nav-icon { font-size: 1.1rem; width: 20px; text-align: center; }
  .sidebar-user {
    padding: 16px 20px; border-top: 1px solid rgba(255,255,255,0.08);
    display: flex; align-items: center; gap: 12px;
  }
  .user-avatar {
    width: 36px; height: 36px; border-radius: 50%; background: var(--gold);
    display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.85rem; color: var(--green-900); flex-shrink: 0;
  }
  .user-info p { color: var(--white); font-size: 0.85rem; font-weight: 500; }
  .user-info span { color: rgba(255,255,255,0.4); font-size: 0.72rem; }
  .logout-btn {
    margin-left: auto; background: none; border: none; color: rgba(255,255,255,0.4);
    cursor: pointer; font-size: 1.1rem; padding: 4px; transition: color 0.15s;
  }
  .logout-btn:hover { color: var(--white); }

  /* MAIN CONTENT */
  .main { background: var(--cream); padding: 32px 36px; overflow-y: auto; }
  .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; }
  .page-title { font-family: 'Playfair Display', serif; font-size: 1.8rem; color: var(--green-900); }
  .page-date { color: var(--text-light); font-size: 0.85rem; margin-top: 4px; }

  /* STAT CARDS */
  .stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 28px; }
  .stat-card {
    background: var(--white); border-radius: var(--radius); padding: 22px 24px;
    box-shadow: var(--shadow-sm); border-top: 3px solid transparent;
  }
  .stat-card.green { border-top-color: var(--green-500); }
  .stat-card.yellow { border-top-color: var(--yellow); }
  .stat-card.red { border-top-color: var(--red); }
  .stat-card.gold { border-top-color: var(--gold); }
  .stat-label { font-size: 0.72rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: var(--text-light); margin-bottom: 8px; }
  .stat-val { font-family: 'Playfair Display', serif; font-size: 2rem; font-weight: 700; color: var(--green-900); }
  .stat-sub { font-size: 0.78rem; color: var(--text-light); margin-top: 4px; }

  /* TABLE CARD */
  .table-card { background: var(--white); border-radius: var(--radius); box-shadow: var(--shadow-sm); overflow: hidden; }
  .table-header { padding: 20px 24px; border-bottom: 1px solid var(--cream-dark); display: flex; align-items: center; justify-content: space-between; gap: 12px; }
  .table-header h3 { font-family: 'Playfair Display', serif; font-size: 1.1rem; color: var(--green-900); }
  .search-input {
    padding: 9px 14px; border: 1.5px solid var(--cream-dark); border-radius: 8px;
    font-size: 0.88rem; font-family: 'DM Sans', sans-serif; outline: none; width: 220px;
  }
  .search-input:focus { border-color: var(--green-600); }

  .inv-table { width: 100%; border-collapse: collapse; }
  .inv-table th {
    background: var(--cream); padding: 12px 16px; text-align: left;
    font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: var(--text-mid);
    border-bottom: 1px solid var(--cream-dark);
  }
  .inv-table td { padding: 14px 16px; border-bottom: 1px solid var(--cream-dark); vertical-align: middle; }
  .inv-table tr:last-child td { border-bottom: none; }
  .inv-table tr:hover td { background: rgba(249,243,232,0.5); }

  .material-name { font-weight: 600; font-size: 0.9rem; color: var(--text-dark); }
  .material-cat { font-size: 0.75rem; color: var(--text-light); margin-top: 2px; }
  .material-unit { font-size: 0.78rem; color: var(--text-mid); margin-top: 2px; }

  .stock-val { font-weight: 600; font-size: 0.95rem; color: var(--text-dark); }
  .closing-val { font-size: 1rem; font-weight: 700; }
  .closing-val.green { color: var(--green-600); }
  .closing-val.yellow { color: var(--yellow); }
  .closing-val.red { color: var(--red); }

  .inline-input {
    width: 80px; padding: 8px 10px; border: 1.5px solid var(--cream-dark); border-radius: 8px;
    font-size: 0.9rem; font-family: 'DM Sans', sans-serif; outline: none; text-align: center; font-weight: 500;
    transition: border-color 0.15s;
  }
  .inline-input:focus { border-color: var(--green-600); background: #f0faf5; }

  .badge {
    display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 20px;
    font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;
  }
  .badge.green { background: var(--green-100); color: var(--green-700); }
  .badge.yellow { background: var(--yellow-light); color: var(--yellow); }
  .badge.red { background: var(--red-light); color: var(--red); }

  .dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
  .dot.green { background: var(--green-500); }
  .dot.yellow { background: var(--yellow); }
  .dot.red { background: var(--red); }

  /* BUTTONS */
  .btn {
    padding: 10px 20px; border-radius: var(--radius-sm); font-size: 0.88rem; font-weight: 600;
    font-family: 'DM Sans', sans-serif; cursor: pointer; border: none; transition: all 0.15s; display: inline-flex; align-items: center; gap: 6px;
  }
  .btn-green { background: var(--green-600); color: var(--white); }
  .btn-green:hover { background: var(--green-800); }
  .btn-outline { background: transparent; color: var(--green-600); border: 2px solid var(--green-600); }
  .btn-outline:hover { background: var(--green-600); color: var(--white); }
  .btn-danger { background: var(--red); color: var(--white); }
  .btn-danger:hover { background: #a93226; }
  .btn-gold { background: var(--gold); color: var(--green-900); }
  .btn-gold:hover { background: var(--gold-light); }
  .btn-sm { padding: 7px 14px; font-size: 0.8rem; }

  /* FILTER TABS */
  .filter-tabs { display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap; }
  .filter-tab {
    padding: 7px 16px; border-radius: 20px; font-size: 0.82rem; font-weight: 600; cursor: pointer;
    border: 1.5px solid var(--cream-dark); background: var(--white); color: var(--text-mid); transition: all 0.15s;
  }
  .filter-tab.active { background: var(--green-900); color: var(--white); border-color: var(--green-900); }
  .filter-tab:hover:not(.active) { border-color: var(--green-600); color: var(--green-600); }

  /* SAVE BAR */
  .save-bar {
    position: fixed; bottom: 0; right: 0; left: 260px; background: var(--white);
    padding: 16px 36px; display: flex; align-items: center; justify-content: space-between;
    box-shadow: 0 -4px 20px rgba(0,0,0,0.08); z-index: 100; border-top: 1px solid var(--cream-dark);
  }
  .save-info { font-size: 0.85rem; color: var(--text-light); }
  .save-info strong { color: var(--text-dark); }

  /* MODAL */
  .modal-backdrop {
    position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 200;
    display: flex; align-items: center; justify-content: center; padding: 24px;
    animation: fadeIn 0.15s ease;
  }
  .modal {
    background: var(--white); border-radius: var(--radius); width: 100%; max-width: 520px;
    padding: 32px; box-shadow: var(--shadow-lg); animation: slideUp 0.2s ease;
  }
  .modal-title { font-family: 'Playfair Display', serif; font-size: 1.4rem; color: var(--green-900); margin-bottom: 20px; }
  .modal-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .modal-footer { display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px; }

  @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
  @keyframes slideUp { from { transform: translateY(20px); opacity:0; } to { transform: translateY(0); opacity:1; } }

  /* EOD */
  .eod-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
  .eod-card { background: var(--white); border-radius: var(--radius); padding: 24px; box-shadow: var(--shadow-sm); }
  .eod-card h3 { font-family: 'Playfair Display', serif; font-size: 1.05rem; color: var(--green-900); margin-bottom: 16px; border-bottom: 1px solid var(--cream-dark); padding-bottom: 12px; }
  .eod-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--cream-dark); }
  .eod-row:last-child { border-bottom: none; }
  .eod-mat-name { font-size: 0.88rem; font-weight: 500; color: var(--text-dark); }
  .eod-mat-val { font-size: 0.9rem; font-weight: 700; color: var(--green-700); }

  /* SCHEMA */
  .schema-card {
    background: var(--green-900); border-radius: var(--radius); padding: 24px; margin-top: 24px;
  }
  .schema-card pre {
    color: #7dd3a8; font-size: 0.72rem; line-height: 1.6; white-space: pre-wrap; overflow-x: auto; font-family: 'DM Mono', monospace;
  }

  /* NOTIFICATIONS */
  .toast {
    position: fixed; top: 20px; right: 20px; background: var(--green-800); color: var(--white);
    padding: 14px 20px; border-radius: var(--radius-sm); box-shadow: var(--shadow-md);
    font-size: 0.88rem; z-index: 300; animation: slideIn 0.25s ease; display: flex; align-items: center; gap: 8px;
  }
  @keyframes slideIn { from { transform: translateX(100px); opacity:0; } to { transform: translateX(0); opacity:1; } }

  /* RESPONSIVE for tablet */
  @media (max-width: 900px) {
    .login-wrap { grid-template-columns: 1fr; }
    .login-left { display: none; }
    .shell { grid-template-columns: 1fr; }
    .sidebar { display: none; }
    .main { padding: 20px; }
    .stats-row { grid-template-columns: 1fr 1fr; }
    .save-bar { left: 0; }
    .eod-grid { grid-template-columns: 1fr; }
  }

  .cat-pill {
    display: inline-block; padding: 3px 8px; border-radius: 6px; font-size: 0.68rem; font-weight: 600;
    background: var(--cream-dark); color: var(--text-mid); text-transform: uppercase; letter-spacing: 0.5px;
  }

  select.form-input { appearance: none; cursor: pointer; }
  .select-wrap { position: relative; }
  .select-wrap::after { content: '▾'; position: absolute; right: 14px; top: 50%; transform: translateY(-50%); pointer-events: none; color: var(--text-mid); }

  .schema-toggle { margin-top: 32px; }
  .schema-toggle summary { cursor: pointer; padding: 14px 20px; background: var(--green-900); color: var(--white); border-radius: var(--radius-sm); font-size: 0.88rem; font-weight: 600; user-select: none; }
  .schema-toggle[open] summary { border-radius: var(--radius-sm) var(--radius-sm) 0 0; }
  .empty-state { text-align: center; padding: 60px 24px; }
  .empty-state p { color: var(--text-light); font-size: 0.95rem; }
  .empty-icon { font-size: 3rem; margin-bottom: 12px; }
`;

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const getStatus = (closing, threshold) => {
  if (closing <= 0) return "red";
  if (closing <= threshold) return "yellow";
  return "green";
};

const statusLabel = { green: "In Stock", yellow: "Low Stock", red: "Out of Stock" };

const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

const formatTime = (d) =>
  new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

const exportCSV = (materials, stock) => {
  const header = ["Material","Category","Unit","Opening Stock","Added","Used","Wastage","Closing Stock","Status"];
  const rows = materials.map((m) => {
    const s = stock.find((x) => x.material_id === m.id);
    if (!s) return null;
    const closing = s.opening_stock + s.new_stock_added - s.quantity_used - s.wastage;
    const status = statusLabel[getStatus(closing, m.threshold)];
    return [m.name, m.category, m.unit, s.opening_stock, s.new_stock_added, s.quantity_used, s.wastage, closing.toFixed(2), status].join(",");
  }).filter(Boolean);
  const csv = [header.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `SBUX_Inventory_${TODAY}.csv`; a.click();
  URL.revokeObjectURL(url);
};

const CATEGORIES = ["All", "Coffee", "Dairy", "Syrups", "Specialty", "Packaging", "Sweeteners"];

const SUPABASE_SCHEMA = `-- ══════════════════════════════════════
-- STARBUCKS INDIA – RAW MATERIAL SCHEMA
-- ══════════════════════════════════════

-- Stores table
CREATE TABLE stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  city TEXT,
  region TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Profiles (links to Supabase Auth users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name TEXT,
  role TEXT CHECK (role IN ('admin','staff')),
  store_id UUID REFERENCES stores(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Materials master catalog
CREATE TABLE materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id),
  name TEXT NOT NULL,
  category TEXT,
  unit TEXT CHECK (unit IN ('kg','liters','pieces')),
  low_stock_threshold NUMERIC DEFAULT 5,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Daily stock snapshots (one row per material per date)
CREATE TABLE daily_stock (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id UUID REFERENCES materials(id),
  store_id UUID REFERENCES stores(id),
  date DATE NOT NULL,
  opening_stock NUMERIC DEFAULT 0,
  new_stock_added NUMERIC DEFAULT 0,
  quantity_used NUMERIC DEFAULT 0,
  wastage NUMERIC DEFAULT 0,
  closing_stock NUMERIC GENERATED ALWAYS AS 
    (opening_stock + new_stock_added - quantity_used - wastage) STORED,
  last_updated_by UUID REFERENCES profiles(id),
  last_updated_at TIMESTAMPTZ,
  UNIQUE(material_id, store_id, date)
);

-- Audit trail: individual stock events
CREATE TABLE stock_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id UUID REFERENCES materials(id),
  store_id UUID REFERENCES stores(id),
  date DATE DEFAULT CURRENT_DATE,
  event_type TEXT CHECK (event_type IN ('receipt','consumption','wastage','adjustment')),
  quantity NUMERIC NOT NULL,
  notes TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ═══ ROW LEVEL SECURITY ═══

ALTER TABLE daily_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_events ENABLE ROW LEVEL SECURITY;

-- Staff can only read/write their store
CREATE POLICY "staff_store_access" ON daily_stock
  USING (store_id = (SELECT store_id FROM profiles WHERE id = auth.uid()))
  WITH CHECK (store_id = (SELECT store_id FROM profiles WHERE id = auth.uid()));

-- Admin can manage all materials
CREATE POLICY "admin_materials" ON materials
  USING (true)
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Staff read materials of their store
CREATE POLICY "staff_materials_read" ON materials
  FOR SELECT USING (store_id = (SELECT store_id FROM profiles WHERE id = auth.uid()));

-- Auto-carry closing→opening via trigger
CREATE OR REPLACE FUNCTION carry_forward_stock()
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO daily_stock (material_id, store_id, date, opening_stock)
  SELECT ds.material_id, ds.store_id, CURRENT_DATE, ds.closing_stock
  FROM daily_stock ds
  WHERE ds.date = CURRENT_DATE - 1
  ON CONFLICT (material_id, store_id, date) DO NOTHING;
END;
$$;`;

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

const Toast = ({ msg, onClose }) => {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return <div className="toast">✓ {msg}</div>;
};

// ─── PAGES ───────────────────────────────────────────────────────────────────

const LoginPage = ({ onLogin }) => {
  const [creds, setCreds] = useState({ username: "", password: "" });
  const [error, setError] = useState("");

  const handle = () => {
    const user = MOCK_USERS.find(u => u.username === creds.username && u.password === creds.password);
    if (user) { setError(""); onLogin(user); }
    else setError("Invalid credentials. Please try again.");
  };

  return (
    <div className="login-wrap">
      <div className="login-left">
        <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
          <div style={{ fontSize: "4rem", marginBottom: "24px" }}>☕</div>
          <div className="login-logo">Starbucks India</div>
          <div className="login-sub">Raw Material Management</div>
          <div style={{ marginTop: "60px", color: "rgba(255,255,255,0.2)", fontSize: "4rem", fontFamily: "'Playfair Display', serif" }}>❝</div>
          <div className="login-tagline">Every great coffee starts with precise ingredients.<br/>Track every gram. Waste nothing.</div>
        </div>
      </div>
      <div className="login-right">
        <div className="login-form-wrap">
          <div style={{ marginBottom: "40px" }}>
            <div className="login-title">Store Login</div>
            <div className="login-hint">Sign in with your Starbucks India staff credentials.</div>
          </div>
          {error && <div className="error-msg">⚠ {error}</div>}
          <div className="form-group">
            <label className="form-label">Username / Email</label>
            <input className="form-input" type="email" placeholder="name@starbucks.in"
              value={creds.username} onChange={e => setCreds(p => ({ ...p, username: e.target.value }))}
              onKeyDown={e => e.key === "Enter" && handle()} />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" placeholder="••••••••"
              value={creds.password} onChange={e => setCreds(p => ({ ...p, password: e.target.value }))}
              onKeyDown={e => e.key === "Enter" && handle()} />
          </div>
          <button className="btn-primary" onClick={handle}>Sign In →</button>
          <div className="login-demo">
            <p><strong>Demo Credentials:</strong></p>
            <p>Admin: <code>admin@sbux.in</code> / <code>admin123</code></p>
            <p>Staff: <code>staff@sbux.in</code> / <code>staff123</code></p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── INVENTORY PAGE ───────────────────────────────────────────────────────────
const InventoryPage = ({ user, materials, stock, setStock, showToast }) => {
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [dirty, setDirty] = useState({});
  const [saved, setSaved] = useState(false);

  const filtered = materials.filter(m => {
    const catOk = category === "All" || m.category === category;
    const searchOk = m.name.toLowerCase().includes(search.toLowerCase()) || m.category.toLowerCase().includes(search.toLowerCase());
    return catOk && searchOk;
  });

  const getStock = (materialId) => stock.find(s => s.material_id === materialId) || {};

  const updateStock = (materialId, field, rawVal) => {
    const val = parseFloat(rawVal) || 0;
    setStock(prev => prev.map(s => s.material_id === materialId ? { ...s, [field]: Math.max(0, val) } : s));
    setDirty(prev => ({ ...prev, [materialId]: true }));
    setSaved(false);
  };

  const closing = (s, m) => {
    const c = (s.opening_stock || 0) + (s.new_stock_added || 0) - (s.quantity_used || 0) - (s.wastage || 0);
    return parseFloat(c.toFixed(2));
  };

  // Stats
  const totalStock = stock.reduce((sum, s) => {
    const m = materials.find(m => m.id === s.material_id);
    return sum + closing(s, m);
  }, 0);
  const totalUsed = stock.reduce((sum, s) => sum + (s.quantity_used || 0), 0);
  const outOfStock = stock.filter(s => {
    const m = materials.find(m => m.id === s.material_id);
    return closing(s, m) <= 0;
  }).length;
  const lowStock = stock.filter(s => {
    const m = materials.find(m => m.id === s.material_id);
    const c = closing(s, m);
    return c > 0 && c <= m.threshold;
  }).length;

  const saveAll = () => {
    const now = new Date().toISOString();
    setStock(prev => prev.map(s => dirty[s.material_id] ? { ...s, last_updated_by: user.name, last_updated_at: now } : s));
    setDirty({});
    setSaved(true);
    showToast("Inventory saved successfully!");
  };

  return (
    <div className="main" style={{ paddingBottom: 90 }}>
      <div className="page-header">
        <div>
          <div className="page-title">Daily Inventory</div>
          <div className="page-date">{formatDate(TODAY)} · {STORES.find(s => s.id === user.store_id)?.name}</div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-outline btn-sm" onClick={() => exportCSV(materials, stock)}>⬇ Export CSV</button>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-card green">
          <div className="stat-label">Total Closing Stock</div>
          <div className="stat-val">{totalStock.toFixed(0)}</div>
          <div className="stat-sub">units across {materials.length} materials</div>
        </div>
        <div className="stat-card gold">
          <div className="stat-label">Total Used Today</div>
          <div className="stat-val">{totalUsed.toFixed(1)}</div>
          <div className="stat-sub">consumption recorded</div>
        </div>
        <div className="stat-card yellow">
          <div className="stat-label">Low Stock Items</div>
          <div className="stat-val">{lowStock}</div>
          <div className="stat-sub">at or below threshold</div>
        </div>
        <div className="stat-card red">
          <div className="stat-label">Out of Stock</div>
          <div className="stat-val">{outOfStock}</div>
          <div className="stat-sub">need immediate restock</div>
        </div>
      </div>

      <div className="filter-tabs">
        {CATEGORIES.map(c => (
          <button key={c} className={`filter-tab${category === c ? " active" : ""}`} onClick={() => setCategory(c)}>{c}</button>
        ))}
      </div>

      <div className="table-card">
        <div className="table-header">
          <h3>Raw Materials ({filtered.length})</h3>
          <input className="search-input" placeholder="🔍 Search materials..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {filtered.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">🔍</div><p>No materials found for this filter.</p></div>
        ) : (
          <table className="inv-table">
            <thead>
              <tr>
                <th>Material</th>
                <th>Opening</th>
                <th>+ Added</th>
                <th>− Used</th>
                <th>≈ Wastage</th>
                <th>Closing Stock</th>
                <th>Status</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(m => {
                const s = getStock(m.id);
                const c = closing(s, m);
                const status = getStatus(c, m.threshold);
                return (
                  <tr key={m.id}>
                    <td>
                      <div className="material-name">{m.name}</div>
                      <span className="cat-pill">{m.category}</span>
                    </td>
                    <td>
                      <span className="stock-val">{(s.opening_stock || 0).toFixed(1)}</span>
                      <div className="material-unit">{m.unit}</div>
                    </td>
                    <td>
                      <input className="inline-input" type="number" min="0" step="0.1"
                        value={s.new_stock_added || 0}
                        onChange={e => updateStock(m.id, "new_stock_added", e.target.value)} />
                    </td>
                    <td>
                      <input className="inline-input" type="number" min="0" step="0.1"
                        value={s.quantity_used || 0}
                        onChange={e => updateStock(m.id, "quantity_used", e.target.value)} />
                    </td>
                    <td>
                      <input className="inline-input" type="number" min="0" step="0.1"
                        value={s.wastage || 0}
                        onChange={e => updateStock(m.id, "wastage", e.target.value)} />
                    </td>
                    <td>
                      <span className={`closing-val ${status}`}>{c.toFixed(2)}</span>
                      <div className="material-unit">{m.unit}</div>
                    </td>
                    <td>
                      <span className={`badge ${status}`}>
                        <span className={`dot ${status}`}></span>
                        {statusLabel[status]}
                      </span>
                    </td>
                    <td>
                      {s.last_updated_by
                        ? <><div style={{ fontSize: "0.75rem", color: "var(--text-mid)", fontWeight: 500 }}>{s.last_updated_by}</div>
                          <div style={{ fontSize: "0.7rem", color: "var(--text-light)" }}>{formatTime(s.last_updated_at)}</div></>
                        : <span style={{ color: "var(--text-light)", fontSize: "0.78rem" }}>—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div className="save-bar">
        <div className="save-info">
          {Object.keys(dirty).length > 0
            ? <><strong>{Object.keys(dirty).length} item(s)</strong> have unsaved changes</>
            : saved ? <span style={{ color: "var(--green-600)" }}>✓ All changes saved</span> : "No pending changes"}
        </div>
        <button className="btn btn-green" onClick={saveAll}>💾 Save All Changes</button>
      </div>
    </div>
  );
};

// ─── MATERIALS ADMIN PAGE ─────────────────────────────────────────────────────
const MaterialsPage = ({ user, materials, setMaterials, showToast }) => {
  const [modal, setModal] = useState(null); // null | 'add' | 'edit'
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState({ name: "", category: "Coffee", unit: "kg", threshold: 5 });
  const [search, setSearch] = useState("");

  if (user.role !== "admin") return (
    <div className="main"><div className="empty-state"><div className="empty-icon">🔒</div><p>Admin access required to manage materials.</p></div></div>
  );

  const openAdd = () => { setForm({ name: "", category: "Coffee", unit: "kg", threshold: 5 }); setEditTarget(null); setModal("add"); };
  const openEdit = (m) => { setForm({ name: m.name, category: m.category, unit: m.unit, threshold: m.threshold }); setEditTarget(m); setModal("edit"); };
  const closeModal = () => setModal(null);

  const save = () => {
    if (!form.name.trim()) return;
    if (modal === "add") {
      const newM = { id: `m${Date.now()}`, store_id: user.store_id, ...form, threshold: parseFloat(form.threshold) };
      setMaterials(prev => [...prev, newM]);
      showToast(`${form.name} added to catalog`);
    } else {
      setMaterials(prev => prev.map(m => m.id === editTarget.id ? { ...m, ...form, threshold: parseFloat(form.threshold) } : m));
      showToast(`${form.name} updated`);
    }
    closeModal();
  };

  const remove = (id) => {
    setMaterials(prev => prev.filter(m => m.id !== id));
    showToast("Material removed");
  };

  const cats = [...new Set(CATEGORIES.filter(c => c !== "All"))];
  const filtered = materials.filter(m => m.name.toLowerCase().includes(search.toLowerCase()) || m.category.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="main">
      <div className="page-header">
        <div>
          <div className="page-title">Material Catalog</div>
          <div className="page-date">Admin · {materials.length} materials across {[...new Set(materials.map(m => m.category))].length} categories</div>
        </div>
        <button className="btn btn-green" onClick={openAdd}>+ Add Material</button>
      </div>

      <div className="table-card">
        <div className="table-header">
          <h3>All Materials</h3>
          <input className="search-input" placeholder="🔍 Search..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <table className="inv-table">
          <thead>
            <tr><th>Name</th><th>Category</th><th>Unit</th><th>Alert Threshold</th><th style={{ textAlign: "right" }}>Actions</th></tr>
          </thead>
          <tbody>
            {filtered.map(m => (
              <tr key={m.id}>
                <td><div className="material-name">{m.name}</div></td>
                <td><span className="cat-pill">{m.category}</span></td>
                <td><span style={{ color: "var(--text-mid)", fontWeight: 500 }}>{m.unit}</span></td>
                <td><span className="badge yellow"><span className="dot yellow"></span> ≤ {m.threshold} {m.unit}</span></td>
                <td style={{ textAlign: "right" }}>
                  <button className="btn btn-outline btn-sm" style={{ marginRight: 8 }} onClick={() => openEdit(m)}>✏ Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => remove(m.id)}>✕ Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Schema */}
      <details className="schema-toggle">
        <summary>🗄 View Supabase Database Schema & RLS Policies</summary>
        <div style={{ background: "var(--green-900)", borderRadius: "0 0 var(--radius-sm) var(--radius-sm)", padding: 24 }}>
          <pre style={{ color: "#7dd3a8", fontSize: "0.72rem", lineHeight: 1.6, whiteSpace: "pre-wrap", overflowX: "auto" }}>{SUPABASE_SCHEMA}</pre>
        </div>
      </details>

      {modal && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">{modal === "add" ? "Add New Material" : "Edit Material"}</div>
            <div className="form-group">
              <label className="form-label">Material Name</label>
              <input className="form-input" placeholder="e.g. Arabica Coffee Beans" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="modal-grid">
              <div className="form-group">
                <label className="form-label">Category</label>
                <div className="select-wrap">
                  <select className="form-input" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                    {cats.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Unit</label>
                <div className="select-wrap">
                  <select className="form-input" value={form.unit} onChange={e => setForm(p => ({ ...p, unit: e.target.value }))}>
                    <option value="kg">kg</option>
                    <option value="liters">liters</option>
                    <option value="pieces">pieces</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Low Stock Alert Threshold</label>
              <input className="form-input" type="number" min="0" step="0.5" value={form.threshold} onChange={e => setForm(p => ({ ...p, threshold: e.target.value }))} />
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={closeModal}>Cancel</button>
              <button className="btn btn-green" onClick={save}>{modal === "add" ? "Add Material" : "Save Changes"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── END OF DAY PAGE ──────────────────────────────────────────────────────────
const EodPage = ({ user, materials, stock, showToast }) => {
  const getClosing = (s, m) => {
    if (!s || !m) return 0;
    return parseFloat(((s.opening_stock || 0) + (s.new_stock_added || 0) - (s.quantity_used || 0) - (s.wastage || 0)).toFixed(2));
  };

  const enriched = materials.map(m => {
    const s = stock.find(x => x.material_id === m.id);
    const c = getClosing(s, m);
    return { ...m, stock: s, closing: c, status: getStatus(c, m.threshold) };
  });

  const outOfStock = enriched.filter(m => m.closing <= 0);
  const lowStockItems = enriched.filter(m => m.closing > 0 && m.closing <= m.threshold);
  const okItems = enriched.filter(m => m.status === "green");

  const totalUsed = stock.reduce((sum, s) => sum + (s.quantity_used || 0), 0);
  const totalWaste = stock.reduce((sum, s) => sum + (s.wastage || 0), 0);
  const totalAdded = stock.reduce((sum, s) => sum + (s.new_stock_added || 0), 0);

  return (
    <div className="main">
      <div className="page-header">
        <div>
          <div className="page-title">End of Day Summary</div>
          <div className="page-date">{formatDate(TODAY)} · Closing report</div>
        </div>
        <button className="btn btn-gold" onClick={() => { exportCSV(materials, stock); showToast("CSV downloaded!"); }}>⬇ Export Report</button>
      </div>

      <div className="stats-row">
        <div className="stat-card gold">
          <div className="stat-label">Total Consumed</div>
          <div className="stat-val">{totalUsed.toFixed(1)}</div>
          <div className="stat-sub">units used today</div>
        </div>
        <div className="stat-card green">
          <div className="stat-label">Total Received</div>
          <div className="stat-val">{totalAdded.toFixed(1)}</div>
          <div className="stat-sub">new stock added</div>
        </div>
        <div className="stat-card yellow">
          <div className="stat-label">Wastage / Spoilage</div>
          <div className="stat-val">{totalWaste.toFixed(1)}</div>
          <div className="stat-sub">units wasted</div>
        </div>
        <div className="stat-card red">
          <div className="stat-label">Out of Stock</div>
          <div className="stat-val">{outOfStock.length}</div>
          <div className="stat-sub">need restock for tomorrow</div>
        </div>
      </div>

      <div className="eod-grid">
        {/* Out of Stock */}
        <div className="eod-card">
          <h3>🔴 Out of Stock ({outOfStock.length})</h3>
          {outOfStock.length === 0
            ? <p style={{ color: "var(--text-light)", fontSize: "0.88rem" }}>All materials have stock remaining. ✓</p>
            : outOfStock.map(m => (
              <div key={m.id} className="eod-row">
                <div>
                  <div className="eod-mat-name">{m.name}</div>
                  <span className="cat-pill">{m.category}</span>
                </div>
                <span className="badge red"><span className="dot red"></span> 0 {m.unit}</span>
              </div>
            ))}
        </div>

        {/* Low Stock */}
        <div className="eod-card">
          <h3>🟡 Low Stock ({lowStockItems.length})</h3>
          {lowStockItems.length === 0
            ? <p style={{ color: "var(--text-light)", fontSize: "0.88rem" }}>No items at low stock levels. ✓</p>
            : lowStockItems.map(m => (
              <div key={m.id} className="eod-row">
                <div>
                  <div className="eod-mat-name">{m.name}</div>
                  <span className="cat-pill">{m.category}</span>
                </div>
                <span className="badge yellow">{m.closing} {m.unit}</span>
              </div>
            ))}
        </div>

        {/* Tomorrow's Opening */}
        <div className="eod-card" style={{ gridColumn: "1 / -1" }}>
          <h3>📦 Tomorrow's Opening Stock ({okItems.length} items ready)</h3>
          <table className="inv-table">
            <thead>
              <tr><th>Material</th><th>Category</th><th>Tomorrow Opening</th><th>Used Today</th><th>Wastage</th><th>Status</th></tr>
            </thead>
            <tbody>
              {enriched.map(m => (
                <tr key={m.id}>
                  <td><div className="material-name">{m.name}</div></td>
                  <td><span className="cat-pill">{m.category}</span></td>
                  <td><span className={`closing-val ${m.status}`}>{m.closing.toFixed(2)}</span> <span style={{ fontSize: "0.75rem", color: "var(--text-light)" }}>{m.unit}</span></td>
                  <td><span style={{ color: "var(--gold)", fontWeight: 600 }}>{(m.stock?.quantity_used || 0).toFixed(1)}</span></td>
                  <td><span style={{ color: "var(--text-mid)", fontWeight: 500 }}>{(m.stock?.wastage || 0).toFixed(1)}</span></td>
                  <td><span className={`badge ${m.status}`}><span className={`dot ${m.status}`}></span>{statusLabel[m.status]}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ─── APP SHELL ────────────────────────────────────────────────────────────────
const navItems = [
  { id: "inventory", icon: "📋", label: "Daily Inventory", roles: ["admin", "staff"] },
  { id: "eod", icon: "📊", label: "End of Day", roles: ["admin", "staff"] },
  { id: "materials", icon: "⚙️", label: "Materials (Admin)", roles: ["admin"] },
];

export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("inventory");
  const [materials, setMaterials] = useState(INITIAL_MATERIALS);
  const [stock, setStock] = useState(INITIAL_STOCK);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((msg) => { setToast(msg); }, []);

  if (!user) return (
    <>
      <style>{styles}</style>
      <LoginPage onLogin={setUser} />
    </>
  );

  const visibleNav = navItems.filter(n => n.roles.includes(user.role));

  return (
    <>
      <style>{styles}</style>
      <div className="shell">
        {/* SIDEBAR */}
        <aside className="sidebar">
          <div className="sidebar-brand">
            <div style={{ fontSize: "1.5rem", marginBottom: 8 }}>☕</div>
            <div className="brand-name">Starbucks India</div>
            <div className="brand-store">{STORES.find(s => s.id === user.store_id)?.name}</div>
          </div>
          <nav className="nav">
            {visibleNav.map(n => (
              <div key={n.id} className={`nav-item${page === n.id ? " active" : ""}`} onClick={() => setPage(n.id)}>
                <span className="nav-icon">{n.icon}</span>
                {n.label}
              </div>
            ))}
          </nav>
          <div className="sidebar-user">
            <div className="user-avatar">{user.name.split(" ").map(w => w[0]).join("")}</div>
            <div className="user-info">
              <p>{user.name}</p>
              <span>{user.role === "admin" ? "Admin" : "Staff"}</span>
            </div>
            <button className="logout-btn" onClick={() => setUser(null)} title="Logout">⟵</button>
          </div>
        </aside>

        {/* PAGE */}
        {page === "inventory" && <InventoryPage user={user} materials={materials} stock={stock} setStock={setStock} showToast={showToast} />}
        {page === "materials" && <MaterialsPage user={user} materials={materials} setMaterials={setMaterials} showToast={showToast} />}
        {page === "eod" && <EodPage user={user} materials={materials} stock={stock} showToast={showToast} />}
      </div>

      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}
    </>
  );
}
