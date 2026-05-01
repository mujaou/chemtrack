import { useState, useEffect, useMemo } from "react";

const COLORS = {
  red: "#C8102E",
  redDark: "#9B0B1F",
  redLight: "#F5E6E9",
  white: "#FFFFFF",
  gray50: "#FAFAFA",
  gray100: "#F4F4F5",
  gray200: "#E4E4E7",
  gray300: "#D4D4D8",
  gray400: "#A1A1AA",
  gray600: "#52525B",
  gray800: "#27272A",
  gray900: "#18181B",
  green: "#15803D",
  greenLight: "#DCFCE7",
  yellow: "#B45309",
  yellowLight: "#FEF9C3",
  redAlert: "#B91C1C",
  redAlertLight: "#FEE2E2",
};

const initialProducts = [];

const initialInventory = [];

const TABS = ["Dashboard", "Produtos", "Estoque", "Alertas", "Relatórios"];

const icons = {
  dashboard: "◈",
  products: "⬡",
  stock: "⬢",
  alerts: "◉",
  reports: "◫",
  warning: "⚠",
  critical: "✕",
  ok: "✓",
  attention: "◐",
  trend: "↗",
  down: "↘",
  flat: "→",
  add: "+",
  edit: "✎",
  delete: "✕",
};

function StatusBadge({ days }) {
  if (days >= 60) return (
    <span style={{ background: COLORS.greenLight, color: COLORS.green, padding: "2px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700, letterSpacing: 0.5 }}>
      ● ADEQUADO
    </span>
  );
  if (days >= 30) return (
    <span style={{ background: COLORS.yellowLight, color: COLORS.yellow, padding: "2px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700, letterSpacing: 0.5 }}>
      ◐ ATENÇÃO
    </span>
  );
  return (
    <span style={{ background: COLORS.redAlertLight, color: COLORS.redAlert, padding: "2px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700, letterSpacing: 0.5 }}>
      ✕ CRÍTICO
    </span>
  );
}

function CriticalityBadge({ level }) {
  const map = {
    Alta: { bg: COLORS.redAlertLight, color: COLORS.redAlert },
    Média: { bg: COLORS.yellowLight, color: COLORS.yellow },
    Baixa: { bg: COLORS.greenLight, color: COLORS.green },
  };
  const s = map[level] || map["Baixa"];
  return (
    <span style={{ background: s.bg, color: s.color, padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
      {level}
    </span>
  );
}

function MiniBar({ value, max, color }) {
  return (
    <div style={{ background: COLORS.gray200, borderRadius: 4, height: 6, width: "100%", overflow: "hidden" }}>
      <div style={{ background: color, width: `${Math.min(100, (value / max) * 100)}%`, height: "100%", borderRadius: 4, transition: "width 0.5s" }} />
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("Dashboard");
  const [products, setProducts] = useState(initialProducts);
  const [inventory, setInventory] = useState(initialInventory);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showAddStock, setShowAddStock] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: "", codeSAP: "", unit: "L", type: "líquido", supplier: "", leadTime: 10, criticality: "Média" });
  const [newStock, setNewStock] = useState({ productId: "", date: new Date().toISOString().slice(0, 10), sapStock: "", physicalStock: "", notes: "" });
  const [logs, setLogs] = useState([
    { id: 1, user: "admin", action: "Importou dados SAP semana 16", date: "2026-04-21 08:14" },
    { id: 2, user: "operador1", action: "Lançou inventário físico semana 16", date: "2026-04-21 09:30" },
    { id: 3, user: "admin", action: "Cadastrou produto QM-10944", date: "2026-04-15 14:22" },
  ]);

  // Analytics
  const analytics = useMemo(() => {
    return products.map(p => {
      const records = inventory.filter(r => r.productId === p.id).sort((a, b) => b.date.localeCompare(a.date));
      const latest = records[0];
      const prev = records[1];
      const currentStock = latest?.physicalStock ?? 0;
      const prevStock = prev?.physicalStock ?? currentStock;
      const weeklyConsumption = Math.max(0, prevStock - currentStock);
      const dailyAvg = weeklyConsumption / 7;
      const coverageDays = dailyAvg > 0 ? Math.round(currentStock / dailyAvg) : 999;
      const sapVsPhysical = latest ? ((latest.physicalStock - latest.sapStock) / latest.sapStock * 100) : 0;
      const suggestedPurchase = Math.max(0, (dailyAvg * 60) - currentStock + (dailyAvg * p.leadTime));
      const isEntry = prev && latest && latest.sapStock > prev.sapStock;
      return { ...p, currentStock, weeklyConsumption, dailyAvg, coverageDays, sapVsPhysical, suggestedPurchase, isEntry, records, latest, prev };
    });
  }, [products, inventory]);

  const alerts = useMemo(() => {
    const a = [];
    analytics.forEach(p => {
      if (p.coverageDays < 60 && p.coverageDays !== 999) {
        a.push({ type: p.coverageDays < 30 ? "critical" : "warning", product: p.name, msg: `Cobertura de apenas ${p.coverageDays} dias`, time: "Agora" });
      }
      if (Math.abs(p.sapVsPhysical) > 2) {
        a.push({ type: "warning", product: p.name, msg: `Divergência SAP x Físico: ${p.sapVsPhysical.toFixed(1)}%`, time: "Semana 16" });
      }
    });
    return a;
  }, [analytics]);

  function addLog(action) {
    setLogs(l => [{ id: Date.now(), user: "operador1", action, date: new Date().toLocaleString("pt-BR") }, ...l]);
  }

  function handleAddProduct(e) {
    e.preventDefault();
    const p = { ...newProduct, id: Date.now(), leadTime: Number(newProduct.leadTime) };
    setProducts(pr => [...pr, p]);
    addLog(`Cadastrou produto ${p.codeSAP} – ${p.name}`);
    setNewProduct({ name: "", codeSAP: "", unit: "L", type: "líquido", supplier: "", leadTime: 10, criticality: "Média" });
    setShowAddProduct(false);
  }

  function handleAddStock(e) {
    e.preventDefault();
    const s = { ...newStock, id: Date.now(), productId: Number(newStock.productId), sapStock: Number(newStock.sapStock), physicalStock: Number(newStock.physicalStock) };
    setInventory(inv => [...inv, s]);
    const pName = products.find(p => p.id === s.productId)?.name ?? "";
    addLog(`Lançou estoque de ${pName} – SAP: ${s.sapStock} / Físico: ${s.physicalStock}`);
    setNewStock({ productId: "", date: new Date().toISOString().slice(0, 10), sapStock: "", physicalStock: "", notes: "" });
    setShowAddStock(false);
  }

  // KPIs
  const kpis = useMemo(() => {
    const total = analytics.length;
    const critical = analytics.filter(p => p.coverageDays < 30 && p.coverageDays !== 999).length;
    const attention = analytics.filter(p => p.coverageDays >= 30 && p.coverageDays < 60).length;
    const ok = total - critical - attention;
    const avgAccuracy = analytics.reduce((sum, p) => sum + (100 - Math.abs(p.sapVsPhysical)), 0) / total;
    return { total, critical, attention, ok, avgAccuracy };
  }, [analytics]);

  // ABC Curve
  const abcData = useMemo(() => {
    const sorted = [...analytics].sort((a, b) => b.weeklyConsumption * b.currentStock - a.weeklyConsumption * a.currentStock);
    return sorted.map((p, i) => ({
      ...p,
      abc: i < sorted.length * 0.2 ? "A" : i < sorted.length * 0.5 ? "B" : "C",
    }));
  }, [analytics]);

  const inputStyle = {
    border: `1.5px solid ${COLORS.gray200}`,
    borderRadius: 8,
    padding: "8px 12px",
    fontSize: 14,
    color: COLORS.gray900,
    background: COLORS.white,
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    fontFamily: "inherit",
  };

  const btnPrimary = {
    background: COLORS.red,
    color: COLORS.white,
    border: "none",
    borderRadius: 8,
    padding: "9px 20px",
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
    letterSpacing: 0.5,
    fontFamily: "inherit",
  };

  const btnSecondary = {
    background: COLORS.white,
    color: COLORS.gray600,
    border: `1.5px solid ${COLORS.gray200}`,
    borderRadius: 8,
    padding: "9px 20px",
    fontWeight: 600,
    fontSize: 14,
    cursor: "pointer",
    fontFamily: "inherit",
  };

  return (
    <div style={{ minHeight: "100vh", background: COLORS.gray50, fontFamily: "'IBM Plex Sans', 'Helvetica Neue', Arial, sans-serif", color: COLORS.gray900 }}>
      {/* HEADER */}
      <header style={{ background: COLORS.red, color: COLORS.white, padding: "0 32px", display: "flex", alignItems: "center", gap: 20, height: 64, boxShadow: "0 2px 16px rgba(200,16,46,0.18)", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 38, height: 38, background: "rgba(255,255,255,0.15)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 900, letterSpacing: -1 }}>⬡</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, letterSpacing: 0.5 }}>CHEMTRACK</div>
            <div style={{ fontSize: 10, opacity: 0.75, letterSpacing: 1.5, textTransform: "uppercase" }}>Gestão de Produtos Químicos</div>
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", gap: 4 }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              background: tab === t ? "rgba(255,255,255,0.18)" : "transparent",
              color: COLORS.white,
              border: tab === t ? "1.5px solid rgba(255,255,255,0.3)" : "1.5px solid transparent",
              borderRadius: 7,
              padding: "6px 16px",
              fontWeight: tab === t ? 700 : 500,
              fontSize: 13,
              cursor: "pointer",
              letterSpacing: 0.3,
              fontFamily: "inherit",
              transition: "all 0.15s",
            }}>{t}</button>
          ))}
        </div>
        <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 8, padding: "6px 14px", fontSize: 12, letterSpacing: 0.5, marginLeft: 8 }}>
          {alerts.filter(a => a.type === "critical").length > 0 && (
            <span style={{ background: COLORS.white, color: COLORS.red, borderRadius: 20, padding: "2px 8px", fontWeight: 800, marginRight: 6 }}>
              {alerts.filter(a => a.type === "critical").length}
            </span>
          )}
          ADMIN
        </div>
      </header>

      <main style={{ maxWidth: 1320, margin: "0 auto", padding: "28px 24px" }}>
        {/* ==================== DASHBOARD ==================== */}
        {tab === "Dashboard" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800, color: COLORS.gray900 }}>Dashboard Gerencial</div>
                <div style={{ fontSize: 13, color: COLORS.gray400, marginTop: 2 }}>Semana 17 · 01 de maio de 2026</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setTab("Estoque")} style={{ ...btnPrimary, fontSize: 13 }}>+ Lançar Estoque</button>
              </div>
            </div>

            {/* KPI Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
              {[
                { label: "Total Produtos", value: kpis.total, sub: "monitorados", color: COLORS.red, icon: "⬡" },
                { label: "Status Crítico", value: kpis.critical, sub: "< 30 dias cobertura", color: COLORS.redAlert, icon: "✕" },
                { label: "Em Atenção", value: kpis.attention, sub: "30–59 dias cobertura", color: COLORS.yellow, icon: "◐" },
                { label: "Acuracidade SAP", value: `${kpis.avgAccuracy.toFixed(1)}%`, sub: "SAP vs. Físico", color: COLORS.green, icon: "◈" },
              ].map(kpi => (
                <div key={kpi.label} style={{ background: COLORS.white, borderRadius: 12, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", borderTop: `3px solid ${kpi.color}`, display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ fontSize: 12, color: COLORS.gray400, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase" }}>{kpi.label}</div>
                    <div style={{ color: kpi.color, fontSize: 18 }}>{kpi.icon}</div>
                  </div>
                  <div style={{ fontSize: 36, fontWeight: 800, color: kpi.color, lineHeight: 1 }}>{kpi.value}</div>
                  <div style={{ fontSize: 12, color: COLORS.gray400 }}>{kpi.sub}</div>
                </div>
              ))}
            </div>

            {/* Product Status Table */}
            <div style={{ background: COLORS.white, borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden", marginBottom: 24 }}>
              <div style={{ padding: "16px 24px", borderBottom: `1px solid ${COLORS.gray100}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: COLORS.gray900 }}>Status de Estoque</div>
                <div style={{ fontSize: 12, color: COLORS.gray400 }}>Atualizado: 21/04/2026</div>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: COLORS.gray50 }}>
                    {["Produto", "Código SAP", "Estoque Atual", "Consumo/dia", "Cobertura", "Acuracidade", "Status"].map(h => (
                      <th key={h} style={{ textAlign: "left", padding: "10px 16px", fontSize: 11, color: COLORS.gray400, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", borderBottom: `1px solid ${COLORS.gray100}` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {analytics.map((p, i) => (
                    <tr key={p.id} style={{ borderBottom: `1px solid ${COLORS.gray100}`, background: i % 2 === 0 ? COLORS.white : COLORS.gray50 }}>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</div>
                        <div style={{ fontSize: 11, color: COLORS.gray400, marginTop: 2 }}>{p.type} · {p.criticality}</div>
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 13, color: COLORS.gray600, fontFamily: "monospace" }}>{p.codeSAP}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{p.currentStock.toLocaleString("pt-BR")} {p.unit}</div>
                        <MiniBar value={p.currentStock} max={p.currentStock + p.weeklyConsumption * 8} color={p.coverageDays < 30 ? COLORS.red : p.coverageDays < 60 ? COLORS.yellow : COLORS.green} />
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 600, color: COLORS.gray800 }}>{p.dailyAvg.toFixed(1)} {p.unit}/d</td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: p.coverageDays < 30 ? COLORS.red : p.coverageDays < 60 ? COLORS.yellow : COLORS.green }}>
                          {p.coverageDays === 999 ? "∞" : `${p.coverageDays}d`}
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: Math.abs(p.sapVsPhysical) > 2 ? COLORS.red : COLORS.green }}>
                          {(100 - Math.abs(p.sapVsPhysical)).toFixed(1)}%
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px" }}><StatusBadge days={p.coverageDays === 999 ? 99 : p.coverageDays} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Curva ABC + Compras Sugeridas */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div style={{ background: COLORS.white, borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden" }}>
                <div style={{ padding: "16px 24px", borderBottom: `1px solid ${COLORS.gray100}` }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>Curva ABC</div>
                  <div style={{ fontSize: 12, color: COLORS.gray400, marginTop: 2 }}>Por consumo e criticidade</div>
                </div>
                <div style={{ padding: 16 }}>
                  {["A", "B", "C"].map(cls => {
                    const items = abcData.filter(p => p.abc === cls);
                    const colors = { A: COLORS.red, B: COLORS.yellow, C: COLORS.green };
                    return (
                      <div key={cls} style={{ marginBottom: 16 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                          <div style={{ background: colors[cls], color: COLORS.white, width: 24, height: 24, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13 }}>{cls}</div>
                          <span style={{ fontWeight: 600, fontSize: 13, color: COLORS.gray800 }}>Classe {cls}</span>
                          <span style={{ fontSize: 12, color: COLORS.gray400 }}>({items.length} produto{items.length !== 1 ? "s" : ""})</span>
                        </div>
                        {items.map(p => (
                          <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: `1px solid ${COLORS.gray100}` }}>
                            <span style={{ fontSize: 13, color: COLORS.gray700 }}>{p.name}</span>
                            <CriticalityBadge level={p.criticality} />
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ background: COLORS.white, borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden" }}>
                <div style={{ padding: "16px 24px", borderBottom: `1px solid ${COLORS.gray100}` }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>Compras Sugeridas</div>
                  <div style={{ fontSize: 12, color: COLORS.gray400, marginTop: 2 }}>Para cobertura de 60 dias + lead time</div>
                </div>
                <div style={{ padding: 16 }}>
                  {analytics.filter(p => p.suggestedPurchase > 0).length === 0 && (
                    <div style={{ textAlign: "center", color: COLORS.gray400, padding: 24, fontSize: 14 }}>✓ Todos os estoques adequados</div>
                  )}
                  {analytics.filter(p => p.suggestedPurchase > 0).map(p => (
                    <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${COLORS.gray100}` }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13, color: COLORS.gray900 }}>{p.name}</div>
                        <div style={{ fontSize: 11, color: COLORS.gray400 }}>Lead time: {p.leadTime}d · {p.supplier}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontWeight: 800, fontSize: 14, color: COLORS.red }}>{p.suggestedPurchase.toFixed(0)} {p.unit}</div>
                        <div style={{ fontSize: 11, color: COLORS.gray400 }}>quantidade sugerida</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== PRODUTOS ==================== */}
        {tab === "Produtos" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800 }}>Cadastro de Produtos</div>
                <div style={{ fontSize: 13, color: COLORS.gray400, marginTop: 2 }}>{products.length} produtos cadastrados</div>
              </div>
              <button onClick={() => setShowAddProduct(true)} style={btnPrimary}>+ Novo Produto</button>
            </div>

            {showAddProduct && (
              <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ background: COLORS.white, borderRadius: 16, padding: 32, width: 520, boxShadow: "0 8px 40px rgba(0,0,0,0.18)" }}>
                  <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 20 }}>Novo Produto Químico</div>
                  <form onSubmit={handleAddProduct}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      {[
                        { label: "Nome do Produto", field: "name", type: "text", full: true },
                        { label: "Código SAP", field: "codeSAP", type: "text" },
                        { label: "Fornecedor", field: "supplier", type: "text" },
                        { label: "Lead Time (dias)", field: "leadTime", type: "number" },
                      ].map(f => (
                        <div key={f.field} style={{ gridColumn: f.full ? "1/-1" : "auto" }}>
                          <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.gray600, display: "block", marginBottom: 4 }}>{f.label}</label>
                          <input style={inputStyle} type={f.type} value={newProduct[f.field]} required onChange={e => setNewProduct(p => ({ ...p, [f.field]: e.target.value }))} />
                        </div>
                      ))}
                      {[
                        { label: "Unidade", field: "unit", opts: ["kg", "L", "m³", "t"] },
                        { label: "Tipo", field: "type", opts: ["líquido", "sólido", "gasoso"] },
                        { label: "Criticidade", field: "criticality", opts: ["Alta", "Média", "Baixa"] },
                      ].map(f => (
                        <div key={f.field}>
                          <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.gray600, display: "block", marginBottom: 4 }}>{f.label}</label>
                          <select style={inputStyle} value={newProduct[f.field]} onChange={e => setNewProduct(p => ({ ...p, [f.field]: e.target.value }))}>
                            {f.opts.map(o => <option key={o}>{o}</option>)}
                          </select>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: "flex-end" }}>
                      <button type="button" style={btnSecondary} onClick={() => setShowAddProduct(false)}>Cancelar</button>
                      <button type="submit" style={btnPrimary}>Salvar Produto</button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <div style={{ background: COLORS.white, borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: COLORS.gray50 }}>
                    {["Produto", "Código SAP", "Unidade", "Tipo", "Fornecedor", "Lead Time", "Criticidade"].map(h => (
                      <th key={h} style={{ textAlign: "left", padding: "10px 16px", fontSize: 11, color: COLORS.gray400, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", borderBottom: `1px solid ${COLORS.gray100}` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {products.map((p, i) => (
                    <tr key={p.id} style={{ borderBottom: `1px solid ${COLORS.gray100}`, background: i % 2 === 0 ? COLORS.white : COLORS.gray50 }}>
                      <td style={{ padding: "13px 16px", fontWeight: 600, fontSize: 14 }}>{p.name}</td>
                      <td style={{ padding: "13px 16px", fontSize: 13, fontFamily: "monospace", color: COLORS.gray600 }}>{p.codeSAP}</td>
                      <td style={{ padding: "13px 16px", fontSize: 13 }}>{p.unit}</td>
                      <td style={{ padding: "13px 16px", fontSize: 13, textTransform: "capitalize" }}>{p.type}</td>
                      <td style={{ padding: "13px 16px", fontSize: 13 }}>{p.supplier}</td>
                      <td style={{ padding: "13px 16px", fontSize: 13 }}>{p.leadTime}d</td>
                      <td style={{ padding: "13px 16px" }}><CriticalityBadge level={p.criticality} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==================== ESTOQUE ==================== */}
        {tab === "Estoque" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800 }}>Lançamento de Estoque</div>
                <div style={{ fontSize: 13, color: COLORS.gray400, marginTop: 2 }}>SAP e Inventário Físico Semanal</div>
              </div>
              <button onClick={() => setShowAddStock(true)} style={btnPrimary}>+ Lançar Estoque</button>
            </div>

            {showAddStock && (
              <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ background: COLORS.white, borderRadius: 16, padding: 32, width: 480, boxShadow: "0 8px 40px rgba(0,0,0,0.18)" }}>
                  <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 20 }}>Lançar Dados de Estoque</div>
                  <form onSubmit={handleAddStock}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.gray600, display: "block", marginBottom: 4 }}>Produto</label>
                        <select style={inputStyle} value={newStock.productId} required onChange={e => setNewStock(s => ({ ...s, productId: e.target.value }))}>
                          <option value="">Selecione...</option>
                          {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.codeSAP})</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.gray600, display: "block", marginBottom: 4 }}>Data do Inventário</label>
                        <input style={inputStyle} type="date" value={newStock.date} required onChange={e => setNewStock(s => ({ ...s, date: e.target.value }))} />
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <div>
                          <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.gray600, display: "block", marginBottom: 4 }}>Estoque SAP</label>
                          <input style={inputStyle} type="number" placeholder="0" value={newStock.sapStock} required onChange={e => setNewStock(s => ({ ...s, sapStock: e.target.value }))} />
                        </div>
                        <div>
                          <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.gray600, display: "block", marginBottom: 4 }}>Estoque Físico</label>
                          <input style={inputStyle} type="number" placeholder="0" value={newStock.physicalStock} required onChange={e => setNewStock(s => ({ ...s, physicalStock: e.target.value }))} />
                        </div>
                      </div>
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.gray600, display: "block", marginBottom: 4 }}>Observações</label>
                        <input style={inputStyle} type="text" placeholder="Perdas, ajustes, vazamentos..." value={newStock.notes} onChange={e => setNewStock(s => ({ ...s, notes: e.target.value }))} />
                      </div>
                    </div>
                    {newStock.sapStock && newStock.physicalStock && (
                      <div style={{ marginTop: 12, padding: 12, background: Math.abs((newStock.physicalStock - newStock.sapStock) / newStock.sapStock * 100) > 2 ? COLORS.redAlertLight : COLORS.greenLight, borderRadius: 8, fontSize: 13 }}>
                        Divergência: {((newStock.physicalStock - newStock.sapStock) / newStock.sapStock * 100).toFixed(2)}%
                      </div>
                    )}
                    <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: "flex-end" }}>
                      <button type="button" style={btnSecondary} onClick={() => setShowAddStock(false)}>Cancelar</button>
                      <button type="submit" style={btnPrimary}>Salvar</button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* History Table */}
            <div style={{ background: COLORS.white, borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden" }}>
              <div style={{ padding: "16px 24px", borderBottom: `1px solid ${COLORS.gray100}` }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>Histórico de Inventário</div>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: COLORS.gray50 }}>
                    {["Data", "Produto", "Estoque SAP", "Estoque Físico", "Divergência", "Observações"].map(h => (
                      <th key={h} style={{ textAlign: "left", padding: "10px 16px", fontSize: 11, color: COLORS.gray400, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", borderBottom: `1px solid ${COLORS.gray100}` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...inventory].sort((a, b) => b.date.localeCompare(a.date)).map((r, i) => {
                    const prod = products.find(p => p.id === r.productId);
                    const div = ((r.physicalStock - r.sapStock) / r.sapStock * 100);
                    return (
                      <tr key={r.id} style={{ borderBottom: `1px solid ${COLORS.gray100}`, background: i % 2 === 0 ? COLORS.white : COLORS.gray50 }}>
                        <td style={{ padding: "11px 16px", fontSize: 13 }}>{r.date}</td>
                        <td style={{ padding: "11px 16px", fontSize: 13, fontWeight: 600 }}>{prod?.name}</td>
                        <td style={{ padding: "11px 16px", fontSize: 13, fontFamily: "monospace" }}>{r.sapStock.toLocaleString("pt-BR")} {prod?.unit}</td>
                        <td style={{ padding: "11px 16px", fontSize: 13, fontFamily: "monospace" }}>{r.physicalStock.toLocaleString("pt-BR")} {prod?.unit}</td>
                        <td style={{ padding: "11px 16px" }}>
                          <span style={{ color: Math.abs(div) > 2 ? COLORS.red : COLORS.green, fontWeight: 700, fontSize: 13 }}>
                            {div > 0 ? "+" : ""}{div.toFixed(2)}%
                          </span>
                        </td>
                        <td style={{ padding: "11px 16px", fontSize: 12, color: COLORS.gray500 }}>{r.notes || "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==================== ALERTAS ==================== */}
        {tab === "Alertas" && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 22, fontWeight: 800 }}>Central de Alertas</div>
              <div style={{ fontSize: 13, color: COLORS.gray400, marginTop: 2 }}>{alerts.length} alertas ativos</div>
            </div>

            {alerts.length === 0 && (
              <div style={{ background: COLORS.greenLight, borderRadius: 12, padding: 40, textAlign: "center", color: COLORS.green, fontWeight: 700, fontSize: 16 }}>
                ✓ Nenhum alerta ativo. Todos os estoques estão adequados!
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
              {alerts.map((a, i) => (
                <div key={i} style={{
                  background: COLORS.white,
                  borderRadius: 12,
                  padding: "16px 20px",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                  borderLeft: `4px solid ${a.type === "critical" ? COLORS.red : COLORS.yellow}`,
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                }}>
                  <div style={{ color: a.type === "critical" ? COLORS.red : COLORS.yellow, fontSize: 22 }}>
                    {a.type === "critical" ? "✕" : "⚠"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: COLORS.gray900 }}>{a.product}</div>
                    <div style={{ fontSize: 13, color: COLORS.gray600, marginTop: 2 }}>{a.msg}</div>
                  </div>
                  <div style={{ fontSize: 12, color: COLORS.gray400 }}>{a.time}</div>
                  <span style={{
                    background: a.type === "critical" ? COLORS.redAlertLight : COLORS.yellowLight,
                    color: a.type === "critical" ? COLORS.red : COLORS.yellow,
                    padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700
                  }}>
                    {a.type === "critical" ? "CRÍTICO" : "ATENÇÃO"}
                  </span>
                </div>
              ))}
            </div>

            {/* Log de Auditoria */}
            <div style={{ background: COLORS.white, borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden" }}>
              <div style={{ padding: "16px 24px", borderBottom: `1px solid ${COLORS.gray100}` }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>Log de Auditoria</div>
                <div style={{ fontSize: 12, color: COLORS.gray400, marginTop: 2 }}>Todas as alterações do sistema</div>
              </div>
              {logs.map((l, i) => (
                <div key={l.id} style={{ padding: "12px 24px", borderBottom: `1px solid ${COLORS.gray100}`, display: "flex", gap: 16, alignItems: "center", background: i % 2 === 0 ? COLORS.white : COLORS.gray50 }}>
                  <div style={{ width: 32, height: 32, background: COLORS.redLight, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: COLORS.red, fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
                    {l.user[0].toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.gray900 }}>{l.action}</div>
                    <div style={{ fontSize: 11, color: COLORS.gray400, marginTop: 2 }}>por <b>{l.user}</b></div>
                  </div>
                  <div style={{ fontSize: 12, color: COLORS.gray400, flexShrink: 0 }}>{l.date}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== RELATÓRIOS ==================== */}
        {tab === "Relatórios" && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 22, fontWeight: 800 }}>Relatórios e Análises</div>
              <div style={{ fontSize: 13, color: COLORS.gray400, marginTop: 2 }}>Visão consolidada para decisão e auditoria</div>
            </div>

            {/* Consumption by product */}
            <div style={{ background: COLORS.white, borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", padding: 24, marginBottom: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Consumo Semanal por Produto</div>
              {analytics.map(p => (
                <div key={p.id} style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{p.name}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.red }}>{p.weeklyConsumption.toLocaleString("pt-BR")} {p.unit}/sem</span>
                  </div>
                  <MiniBar value={p.weeklyConsumption} max={Math.max(...analytics.map(x => x.weeklyConsumption)) || 1} color={COLORS.red} />
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div style={{ background: COLORS.white, borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden" }}>
                <div style={{ padding: "16px 24px", borderBottom: `1px solid ${COLORS.gray100}` }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>Produtos Críticos</div>
                </div>
                {analytics.filter(p => p.coverageDays < 60 && p.coverageDays !== 999).length === 0 && (
                  <div style={{ padding: 24, color: COLORS.gray400, fontSize: 14, textAlign: "center" }}>Nenhum produto crítico</div>
                )}
                {analytics.filter(p => p.coverageDays < 60 && p.coverageDays !== 999).map(p => (
                  <div key={p.id} style={{ padding: "12px 20px", borderBottom: `1px solid ${COLORS.gray100}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: COLORS.gray400 }}>{p.codeSAP}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <StatusBadge days={p.coverageDays} />
                      <div style={{ fontSize: 11, color: COLORS.gray400, marginTop: 4 }}>{p.coverageDays}d cobertura</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ background: COLORS.white, borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden" }}>
                <div style={{ padding: "16px 24px", borderBottom: `1px solid ${COLORS.gray100}` }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>Acuracidade do Estoque</div>
                </div>
                {analytics.map(p => (
                  <div key={p.id} style={{ padding: "10px 20px", borderBottom: `1px solid ${COLORS.gray100}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{p.name}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <MiniBar value={100 - Math.abs(p.sapVsPhysical)} max={100} color={Math.abs(p.sapVsPhysical) > 2 ? COLORS.red : COLORS.green} />
                      <span style={{ fontSize: 13, fontWeight: 700, color: Math.abs(p.sapVsPhysical) > 2 ? COLORS.red : COLORS.green, width: 48, textAlign: "right" }}>
                        {(100 - Math.abs(p.sapVsPhysical)).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
              <button style={{ ...btnPrimary, fontSize: 13 }} onClick={() => alert("Exportação Excel em desenvolvimento – integre com SheetJS para produção!")}>⬇ Exportar Excel</button>
              <button style={{ ...btnSecondary, fontSize: 13 }} onClick={() => alert("Exportação PDF em desenvolvimento – integre com pdfmake para produção!")}>⬇ Exportar PDF</button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${COLORS.gray200}`, padding: "16px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", background: COLORS.white, marginTop: 32 }}>
        <div style={{ fontSize: 12, color: COLORS.gray400 }}>CHEMTRACK · Gestão de Produtos Químicos Industriais</div>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <div style={{ fontSize: 11, color: COLORS.gray400 }}>Perfil: <b>Administrador</b></div>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: COLORS.green }} />
          <div style={{ fontSize: 11, color: COLORS.green, fontWeight: 600 }}>Sistema Online</div>
        </div>
      </footer>
    </div>
  );
}
