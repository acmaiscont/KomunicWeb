import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ReferenceLine, Line,
  ComposedChart,
} from "recharts";

const ACCENT = "#00e5a0";
const BLUE   = "#3b8df5";
const ORANGE = "#ffb347";
const RED    = "#ff6b6b";
const PURPLE = "#c084fc";

const atendimentos = [
  { mes: "Set",  iniciados: 246, concluidos: 243, desconsiderados: 0  },
  { mes: "Out",  iniciados: 385, concluidos: 385, desconsiderados: 10 },
  { mes: "Nov",  iniciados: 528, concluidos: 530, desconsiderados: 6  },
  { mes: "Dez",  iniciados: 618, concluidos: 607, desconsiderados: 11 },
  { mes: "Jan",  iniciados: 734, concluidos: 744, desconsiderados: 23 },
  { mes: "Fev",  iniciados: 591, concluidos: 586, desconsiderados: 12 },
];

const crescimento = [
  { mes: "Set→Out", pct: 56.5,  pos: true  },
  { mes: "Out→Nov", pct: 37.1,  pos: true  },
  { mes: "Nov→Dez", pct: 17.0,  pos: true  },
  { mes: "Dez→Jan", pct: 18.8,  pos: true  },
  { mes: "Jan→Fev", pct: -19.4, pos: false },
];

const tempoConversa = [
  { mes: "Set", tipico: 0.3, pico: null },
  { mes: "Out", tipico: 0.7, pico: null },
  { mes: "Nov", tipico: 1.2, pico: 3.8  },
  { mes: "Dez", tipico: 1.8, pico: 5.5  },
  { mes: "Jan", tipico: 2.1, pico: 4.2  },
  { mes: "Fev", tipico: 1.5, pico: 3.2  },
];

const densidadeMes = [
  {
    mes: "Set", cor: "#64b5f6",
    destaque: null,
    nota: "Rampa de adoção — volume cresce ao longo do mês conforme implantação avança.",
    semanas: [
      { label: "Dias 1–7",  status: "baixa",   desc: "Início de implantação — volume muito baixo (1–3/dia)" },
      { label: "Dias 8–14", status: "media",   desc: "Começa a crescer a partir do dia 9 (~10–20/dia)" },
      { label: "Dias 15–21",status: "alta",    desc: "Estável em ~10–20 atendimentos/dia" },
      { label: "Dias 22–31",status: "alta",    desc: "Estável em ~10–17 atendimentos/dia" },
    ],
  },
  {
    mes: "Out", cor: ORANGE,
    destaque: "Pico pontual: 23/Out (~31/dia)",
    nota: "Queda na 2ª semana seguida de forte recuperação e pico isolado em 23/Out.",
    semanas: [
      { label: "Dias 1–7",  status: "alta",  desc: "Alta consistente (~15–20/dia)" },
      { label: "Dias 8–14", status: "baixa", desc: "Queda acentuada (~5–10/dia)" },
      { label: "Dias 15–21",status: "alta",  desc: "Recuperação + pico em 23/Out (~31)" },
      { label: "Dias 22–31",status: "alta",  desc: "Estável em ~15–23/dia" },
    ],
  },
  {
    mes: "Nov", cor: PURPLE,
    destaque: "🔥 Pico 19–21/Nov (~50/dia)",
    nota: "3ª semana concentra o maior volume do mês com pico de ~50 atendimentos/dia.",
    semanas: [
      { label: "Dias 1–7",  status: "alta",   desc: "Alta (~20–30/dia)" },
      { label: "Dias 8–14", status: "alta",   desc: "Alta sustentada (~25–35/dia)" },
      { label: "Dias 15–21",status: "pico",   desc: "🔥 PICO — 19–21/Nov (~50/dia)" },
      { label: "Dias 22–30",status: "alta",   desc: "Alta (~25–35/dia)" },
    ],
  },
  {
    mes: "Dez", cor: ACCENT,
    destaque: "🔥 Três picos: dias 3–5, 9 e 23–25",
    nota: "Três janelas de alta densidade — possível relação com fechamentos quinzenais/mensais.",
    semanas: [
      { label: "Dias 1–7",  status: "pico",  desc: "🔥 PICO — 3–5/Dez (~35–45/dia)" },
      { label: "Dias 8–14", status: "pico",  desc: "🔥 PICO — 9/Dez (~45/dia)" },
      { label: "Dias 15–21",status: "media", desc: "Moderada (~25–45/dia com variação)" },
      { label: "Dias 22–31",status: "pico",  desc: "🔥 PICO — 23–25/Dez (~45–48/dia)" },
    ],
  },
  {
    mes: "Jan", cor: RED,
    destaque: "🔥 Pico máximo do período: 3–5/Jan (~55/dia)",
    nota: "Início de mês fortíssimo (possível represa de demanda do fim de ano), depois estabiliza.",
    semanas: [
      { label: "Dias 1–7",  status: "pico",  desc: "🔥 PICO MÁXIMO — 3–5/Jan (~55/dia)" },
      { label: "Dias 8–14", status: "alta",  desc: "Alta (~30–42/dia)" },
      { label: "Dias 15–21",status: "alta",  desc: "Alta (~35–45/dia)" },
      { label: "Dias 22–31",status: "alta",  desc: "Alta (~30–40/dia)" },
    ],
  },
  {
    mes: "Fev", cor: BLUE,
    destaque: "🔥 Pico 11–13/Fev (~55/dia)",
    nota: "2ª semana concentra o maior volume. Queda irregular em 21/Fev (outlier isolado).",
    semanas: [
      { label: "Dias 1–7",  status: "alta",   desc: "Alta (~35–45/dia)" },
      { label: "Dias 8–14", status: "pico",   desc: "🔥 PICO — 11–13/Fev (~55/dia)" },
      { label: "Dias 15–21",status: "media",  desc: "Irregular — queda em 21/Fev (outlier)" },
      { label: "Dias 22–28",status: "alta",   desc: "Alta (~25–40/dia)" },
    ],
  },
];

const statusColor = { pico: ORANGE, alta: ACCENT, media: BLUE, baixa: "#4a5568" };
const statusLabel = { pico: "PICO", alta: "Alta", media: "Moderada", baixa: "Baixa" };

const TT = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:"#0d1120", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"12px 16px", fontSize:12 }}>
      <p style={{ fontWeight:700, color:"#fff", marginBottom:6 }}>{label}</p>
      {payload.map((p,i) => p.value != null && (
        <p key={i} style={{ color:p.color, margin:"3px 0" }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const [tab, setTab] = useState("volume");
  const [di, setDi] = useState(2);
  const dm = densidadeMes[di];

  const TABS = [
    { id:"volume",     label:"📊 Volume" },
    { id:"crescimento",label:"📈 Crescimento" },
    { id:"tempo",      label:"⏱ Tempo de Conversa" },
    { id:"desconsid",  label:"⚠️ Desconsiderados" },
  ];

  return (
    <div style={{ background:"#080c18", minHeight:"100vh", fontFamily:"'DM Sans','Segoe UI',sans-serif", color:"#e8eaf0", padding:"28px 20px 48px" }}>
      <div style={{ maxWidth:1060, margin:"0 auto" }}>

        {/* HEADER */}
        <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:26 }}>
          <div style={{ width:5, height:44, borderRadius:4, background:`linear-gradient(180deg,${ACCENT},${BLUE})`, flexShrink:0 }} />
          <div>
            <div style={{ fontSize:10, letterSpacing:3, textTransform:"uppercase", color:"#3a4560", marginBottom:2 }}>
              Análise de Tendências · Set/2024 – Fev/2025
            </div>
            <h1 style={{ margin:0, fontSize:22, fontWeight:900, color:"#fff", letterSpacing:-0.8 }}>
              Dashboard de Atendimentos
            </h1>
          </div>
        </div>

        {/* KPIs */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:9, marginBottom:22 }}>
          {[
            { label:"Total Iniciados",  value:"3.102",  sub:"6 meses",          color:ACCENT  },
            { label:"Total Concluídos", value:"3.095",  sub:"≥99,8% conclusão", color:BLUE    },
            { label:"Pico Mensal",      value:"734",    sub:"Janeiro",          color:ORANGE  },
            { label:"Cresc. Set→Jan",   value:"+198%",  sub:"acumulado",        color:PURPLE  },
            { label:"Queda Jan→Fev",    value:"−19,4%", sub:"sazonalidade",     color:RED     },
          ].map((k,i) => (
            <div key={i} style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)", borderTop:`2px solid ${k.color}`, borderRadius:11, padding:"12px 13px" }}>
              <div style={{ fontSize:9, color:"#3a4560", textTransform:"uppercase", letterSpacing:1, marginBottom:5 }}>{k.label}</div>
              <div style={{ fontSize:21, fontWeight:900, color:k.color, lineHeight:1 }}>{k.value}</div>
              <div style={{ fontSize:10, color:"#5a6a80", marginTop:4 }}>{k.sub}</div>
            </div>
          ))}
        </div>

        {/* TABS */}
        <div style={{ display:"flex", gap:6, marginBottom:14, flexWrap:"wrap" }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding:"7px 15px", borderRadius:7, border:"none", cursor:"pointer",
              fontSize:12, fontWeight:700, transition:"all 0.15s",
              background: tab===t.id ? `linear-gradient(135deg,${ACCENT},${BLUE})` : "rgba(255,255,255,0.05)",
              color: tab===t.id ? "#000" : "#6b7a90",
            }}>{t.label}</button>
          ))}
        </div>

        {/* CHART AREA */}
        <div style={{ background:"rgba(255,255,255,0.025)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:14, padding:"22px", marginBottom:18 }}>

          {tab === "volume" && <>
            <h2 style={{ margin:"0 0 18px", fontSize:14, fontWeight:800, color:"#fff" }}>Evolução Mensal — Iniciados vs. Concluídos</h2>
            <ResponsiveContainer width="100%" height={270}>
              <ComposedChart data={atendimentos} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="mes" tick={{ fill:"#3a4560", fontSize:12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill:"#3a4560", fontSize:11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<TT />} />
                <Legend wrapperStyle={{ fontSize:12, color:"#6b7a90", paddingTop:10 }} />
                <Bar dataKey="iniciados"  name="Iniciados"  fill={BLUE}  opacity={0.9} radius={[4,4,0,0]} />
                <Bar dataKey="concluidos" name="Concluídos" fill={ACCENT} opacity={0.9} radius={[4,4,0,0]} />
                <Line type="monotone" dataKey="iniciados" stroke={ORANGE} strokeWidth={2} strokeDasharray="5 3" dot={false} name="Tendência" legendType="none" />
              </ComposedChart>
            </ResponsiveContainer>
          </>}

          {tab === "crescimento" && <>
            <h2 style={{ margin:"0 0 18px", fontSize:14, fontWeight:800, color:"#fff" }}>Taxa de Crescimento Mês a Mês (%)</h2>
            <ResponsiveContainer width="100%" height={270}>
              <BarChart data={crescimento}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="mes" tick={{ fill:"#3a4560", fontSize:11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill:"#3a4560", fontSize:11 }} axisLine={false} tickLine={false} unit="%" />
                <Tooltip content={<TT />} />
                <ReferenceLine y={0} stroke="rgba(255,255,255,0.15)" />
                <Bar dataKey="pct" name="Crescimento (%)" radius={[5,5,0,0]}
                  label={{ position:"top", fill:"#d0d8e8", fontSize:12, fontWeight:700, formatter: v => v>0?`+${v}%`:`${v}%` }}
                  fill={ACCENT}>
                  {crescimento.map((e,i) => <rect key={i} fill={e.pos ? ACCENT : RED} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <p style={{ fontSize:11, color:"#3a4560", marginTop:8, textAlign:"center" }}>
              Fevereiro tem ~3 dias úteis a menos que janeiro — parte da queda é estrutural do calendário.
            </p>
          </>}

          {tab === "tempo" && <>
            <h2 style={{ margin:"0 0 10px", fontSize:14, fontWeight:800, color:"#fff" }}>Tempo Médio de Conversa — Típico vs. Pico (horas)</h2>
            <div style={{ background:"rgba(255,183,71,0.07)", border:"1px solid rgba(255,183,71,0.2)", borderRadius:8, padding:"9px 14px", fontSize:11, color:"#b8893a", marginBottom:16, lineHeight:1.7 }}>
              ℹ️ <strong>Outliers de Set e Out descartados</strong> — picos de 8 dias e 2,5 dias eram artefatos de implantação, sem representar comportamento operacional real.
            </div>
            <ResponsiveContainer width="100%" height={230}>
              <ComposedChart data={tempoConversa}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="mes" tick={{ fill:"#3a4560", fontSize:12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill:"#3a4560", fontSize:11 }} axisLine={false} tickLine={false} label={{ value:"horas", angle:-90, position:"insideLeft", fill:"#3a4560", fontSize:10 }} />
                <Tooltip content={<TT />} />
                <Legend wrapperStyle={{ fontSize:12, color:"#6b7a90", paddingTop:10 }} />
                <Bar dataKey="tipico" name="Tempo Típico (h)" fill={BLUE}   opacity={0.85} radius={[4,4,0,0]} />
                <Bar dataKey="pico"   name="Pico do Mês (h)"  fill={PURPLE} opacity={0.75} radius={[4,4,0,0]} />
              </ComposedChart>
            </ResponsiveContainer>
            <div style={{ marginTop:14, display:"flex", flexDirection:"column", gap:5 }}>
              {[
                { mes:"Set", obs:"Outlier descartado (implantação) — tempo típico estimado <30 min" },
                { mes:"Out", obs:"Outlier descartado — tempo típico estimado ~40 min" },
                { mes:"Nov", obs:"Picos ~3h30 concentrados em 09–11 e 23/Nov" },
                { mes:"Dez", obs:"Pico máx ~5h30 em 23–25/Dez — possível acúmulo pré-recesso" },
                { mes:"Jan", obs:"Pico de ~8h em 01/Jan (outlier pontual de virada de ano)" },
                { mes:"Fev", obs:"Outlier isolado ~17h em 21/Fev merece investigação pontual" },
              ].map((r,i) => (
                <div key={i} style={{ display:"flex", gap:10, fontSize:11, color:"#6b7a90" }}>
                  <span style={{ fontWeight:700, color:"#9ab", minWidth:28 }}>{r.mes}</span>
                  <span>{r.obs}</span>
                </div>
              ))}
            </div>
          </>}

          {tab === "desconsid" && <>
            <h2 style={{ margin:"0 0 10px", fontSize:14, fontWeight:800, color:"#fff" }}>Atendimentos Desconsiderados por Mês</h2>
            <div style={{ background:"rgba(0,229,160,0.06)", border:"1px solid rgba(0,229,160,0.18)", borderRadius:8, padding:"9px 14px", fontSize:11, color:"#3aad7e", marginBottom:16, lineHeight:1.7 }}>
              ℹ️ <strong>Setembro zerado na análise</strong> — os 34 desconsiderados do período de implantação foram excluídos por não representar comportamento operacional real.
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <ComposedChart data={atendimentos}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="mes" tick={{ fill:"#3a4560", fontSize:12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill:"#3a4560", fontSize:11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<TT />} />
                <Legend wrapperStyle={{ fontSize:12, color:"#6b7a90", paddingTop:10 }} />
                <Bar dataKey="desconsiderados" name="Desconsiderados" fill={RED} opacity={0.85} radius={[4,4,0,0]}
                  label={{ position:"top", fill:"#d0d8e8", fontSize:12, fontWeight:700 }} />
                <Line type="monotone" dataKey="desconsiderados" stroke={ORANGE} strokeWidth={2} dot={{ fill:ORANGE, r:4 }} legendType="none" />
              </ComposedChart>
            </ResponsiveContainer>
            <p style={{ fontSize:11, color:"#3a4560", marginTop:8, textAlign:"center" }}>
              Janeiro tem o maior volume bruto (23), mas proporcionalmente representa apenas 3,1% dos atendimentos iniciados — dentro da faixa normal.
            </p>
          </>}
        </div>

        {/* ── DENSIDADE INTRA-MÊS ── */}
        <div style={{ background:"rgba(255,255,255,0.025)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:14, padding:"22px", marginBottom:18 }}>
          <h2 style={{ margin:"0 0 12px", fontSize:14, fontWeight:800, color:"#fff" }}>🗓 Padrão de Densidade Intra-Mês</h2>

          {/* Insight consolidado */}
          <div style={{ background:"rgba(192,132,252,0.07)", border:"1px solid rgba(192,132,252,0.2)", borderRadius:10, padding:"13px 16px", marginBottom:18, fontSize:12, lineHeight:1.8 }}>
            <strong style={{ color:PURPLE }}>📌 Padrão recorrente identificado em 4 dos 5 meses operacionais:</strong>
            <br />
            <span style={{ color:"#b0b8cc" }}>
              (1) <strong style={{ color:"#fff" }}>Dias 1–5 (início do mês)</strong> — alta demanda consistente em Dez, Jan e Fev. Em Janeiro apresentou o maior pico do período (~55/dia). <br />
              (2) <strong style={{ color:"#fff" }}>Dias 9–13 (2ª semana)</strong> — pico recorrente em Nov, Dez e Fev (~45–55/dia). <br />
              (3) <strong style={{ color:"#fff" }}>Dias 19–25 (3ª/4ª semana)</strong> — pico secundário em Nov e Dez, sugerindo <strong style={{ color:ACCENT }}>ciclo quinzenal de demanda</strong>, possivelmente relacionado a fechamentos ou vencimentos.
            </span>
          </div>

          {/* Seletor de mês */}
          <div style={{ display:"flex", gap:6, marginBottom:14, flexWrap:"wrap" }}>
            {densidadeMes.map((d,i) => (
              <button key={i} onClick={() => setDi(i)} style={{
                padding:"6px 14px", borderRadius:7, border:"none", cursor:"pointer",
                fontSize:12, fontWeight:700, transition:"all 0.15s",
                background: di===i ? `linear-gradient(135deg,${d.cor},${BLUE})` : "rgba(255,255,255,0.05)",
                color: di===i ? "#fff" : "#6b7a90",
              }}>{d.mes}</button>
            ))}
          </div>

          {/* Detalhe do mês */}
          <div style={{ background:"rgba(255,255,255,0.02)", borderRadius:10, border:"1px solid rgba(255,255,255,0.05)", padding:"16px 18px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:8, marginBottom:14 }}>
              <span style={{ fontSize:18, fontWeight:900, color:"#fff" }}>{dm.mes}</span>
              {dm.destaque && (
                <span style={{ background:"rgba(255,160,60,0.12)", color:ORANGE, border:"1px solid rgba(255,160,60,0.28)", borderRadius:7, padding:"4px 12px", fontSize:11, fontWeight:700 }}>
                  {dm.destaque}
                </span>
              )}
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:12 }}>
              {dm.semanas.map((s,i) => (
                <div key={i} style={{ background:"rgba(255,255,255,0.02)", borderRadius:8, padding:"10px 12px", borderLeft:`2px solid ${statusColor[s.status]}` }}>
                  <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:5 }}>
                    <span style={{ fontSize:9, textTransform:"uppercase", letterSpacing:1, color:"#3a4560" }}>{s.label}</span>
                    <span style={{ background:statusColor[s.status]+"22", color:statusColor[s.status], borderRadius:4, padding:"1px 7px", fontSize:9, fontWeight:800 }}>
                      {statusLabel[s.status]}
                    </span>
                  </div>
                  <div style={{ fontSize:11, color:"#b0bcc8", lineHeight:1.5 }}>{s.desc}</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize:11, color:"#4a5a70", borderTop:"1px solid rgba(255,255,255,0.05)", paddingTop:10, lineHeight:1.6 }}>
              💬 {dm.nota}
            </div>
          </div>
        </div>

        {/* INSIGHTS */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(290px,1fr))", gap:10, marginBottom:16 }}>
          {[
            { icon:"📈", cor:ACCENT,  titulo:"Crescimento Acumulado",       desc:"De Set a Jan: +198% em atendimentos iniciados. O ritmo mais forte foi no bimestre Set–Nov (+56% e +37%)." },
            { icon:"✅", cor:BLUE,    titulo:"Taxa de Conclusão Sólida",     desc:"Acima de 99% em todos os meses (excluindo Set). Operação consistente e sem gargalos críticos." },
            { icon:"🗓", cor:PURPLE,  titulo:"Janelas de Alta Demanda",      desc:"Dias 1–5 e 9–13 são recorrentemente os mais densos. Planejamento nessas janelas pode melhorar o SLA." },
            { icon:"📉", cor:RED,     titulo:"Queda em Fevereiro",           desc:"-19,4% vs. Janeiro. Combinação de mês mais curto + sazonalidade. Sem indício de tendência negativa estrutural." },
            { icon:"⏱", cor:ORANGE,  titulo:"Tempo Crescente (sem outliers)",desc:"Excluindo Set/Out, o tempo típico cresceu de ~40 min (Out) para ~2h (Jan) — atendimentos progressivamente mais complexos." },
            { icon:"🔄", cor:"#80cbc4",titulo:"Queda nos Desconsiderados",  desc:"De 34 em Set (implantação) para 6–12 nos meses seguintes. Melhora real na qualidade dos atendimentos." },
          ].map((ins,i) => (
            <div key={i} style={{ background:"rgba(255,255,255,0.025)", borderLeft:`3px solid ${ins.cor}`, borderRadius:10, padding:"14px 16px", display:"flex", gap:12, alignItems:"flex-start" }}>
              <span style={{ fontSize:18, flexShrink:0 }}>{ins.icon}</span>
              <div>
                <div style={{ fontWeight:800, fontSize:12, color:ins.cor, marginBottom:4 }}>{ins.titulo}</div>
                <div style={{ fontSize:11, color:"#6b7a90", lineHeight:1.65 }}>{ins.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign:"center", fontSize:10, color:"#1e2535", marginTop:8 }}>
          Outliers de Set/Out descartados · Desconsiderados de Set zerados · Set/2024–Fev/2025
        </div>
      </div>
    </div>
  );
}
