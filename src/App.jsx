import { useState, useEffect } from "react";

const DB = {
  async get(key) { try { const r = await window.storage.get(key); return r && r.value ? JSON.parse(r.value) : null; } catch { return null; } },
  async set(key, val) { try { await window.storage.set(key, JSON.stringify(val)); } catch (e) { console.error(e); } },
};
const KEYS = { teams: "bf-teams", matches: "bf-matches", admin: "bf-admin" };

const CLASSES = {
  "ISCOM": ["Bachelor 2 (Temps plein)","BA. 3 Alternance (FA)","MBA 1 FA - spé Créa","MBA 1 FA - spé Marketing Digital","MBA 1 FA - spé Événementiel","MBA 1 FA - spé Stratégie de marque","MBA 2 FA - spé Stratégie de marque","MBA 2 FA - spé Marketing Digital","MBA 2 FA - spé Événementiel"],
  "Studio M": ["BRM 2 - Classe A","BRM 2 - Classe B","BRM 1","BTS 2 (Temps plein)","BTS 1","Technicien Son 2 (Temps plein)","Technicien Son 1","Prépa Art","Design Graphique 3"],
  "Staff": ["Staff ISCOM","Staff Studio M"],
};
const SCHOOL_COLORS = { "ISCOM": "#3A2E83", "Studio M": "#ED7218", "Staff": "#1a8c5e" };
const SCHOOL_EMOJIS = { "ISCOM": "🔵", "Studio M": "🔴", "Staff": "🟢" };
const DAYS = ["Lundi","Mardi","Mercredi","Jeudi","Vendredi"];
const TIMES = ["12h45","13h00"];

const DEFAULT_MATCHES = [
  { id:"m1", date:"07/04", day:"Mardi", time:"12h45", teamA:"🔵 Bachelor 2 (ISCOM)", teamB:"🔴 BRM 2 - Classe A (Studio M)", scoreA:null, scoreB:null, winnerId:null },
  { id:"m2", date:"07/04", day:"Mardi", time:"13h00", teamA:"🔴 BRM 1 (Studio M)", teamB:"🔴 Technicien Son 1 (Studio M)", scoreA:null, scoreB:null, winnerId:null },
  { id:"m3", date:"08/04", day:"Mercredi", time:"12h45", teamA:"🔴 BTS 1 (Studio M)", teamB:"🔴 Prépa Art (Studio M)", scoreA:null, scoreB:null, winnerId:null },
  { id:"m4", date:"08/04", day:"Mercredi", time:"13h00", teamA:"🔵 BA. 3 FA (ISCOM)", teamB:"🔴 Design Graphique 3 (Studio M)", scoreA:null, scoreB:null, winnerId:null },
  { id:"m5", date:"10/04", day:"Vendredi", time:"12h45", teamA:"🔴 BTS 2 (Studio M)", teamB:"🔴 BRM 2 - Classe B (Studio M)", scoreA:null, scoreB:null, winnerId:null },
  { id:"m6", date:"10/04", day:"Vendredi", time:"13h00", teamA:"🔵 MBA 2 FA - Strat (ISCOM)", teamB:"🔵 MBA 2 FA - Market (ISCOM)", scoreA:null, scoreB:null, winnerId:null },
  { id:"m7", date:"13/04", day:"Lundi", time:"12h45", teamA:"🔵 MBA 1 FA - Créa (ISCOM)", teamB:"🔵 MBA 1 FA - Market (ISCOM)", scoreA:null, scoreB:null, winnerId:null },
  { id:"m8", date:"13/04", day:"Lundi", time:"13h00", teamA:"🔵 MBA 1 FA - Event (ISCOM)", teamB:"🔵 MBA 1 FA - Strat (ISCOM)", scoreA:null, scoreB:null, winnerId:null },
  { id:"m9", date:"15/04", day:"Mercredi", time:"12h45", teamA:"🔴 Technicien Son 2 (Studio M)", teamB:"🟢 Staff Studio M", scoreA:null, scoreB:null, winnerId:null },
  { id:"m10", date:"17/04", day:"Vendredi", time:"12h45", teamA:"🔵 MBA 2 FA - Event (ISCOM)", teamB:"🟢 Staff ISCOM", scoreA:null, scoreB:null, winnerId:null },
];

const ADMIN_PASS = "babystudio2026";

function RuleSection({ icon, title, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ background:"rgba(255,255,255,0.05)", borderRadius:10, marginBottom:8, border:"1px solid rgba(255,255,255,0.06)", overflow:"hidden" }}>
      <button onClick={() => setOpen(!open)} style={{ width:"100%", padding:"12px 16px", background:"none", border:"none", color:"#fff", display:"flex", alignItems:"center", gap:10, cursor:"pointer", textAlign:"left" }}>
        <span style={{ fontSize:18 }}>{icon}</span><span style={{ flex:1, fontSize:14, fontWeight:700 }}>{title}</span>
        <span style={{ fontSize:16, opacity:0.4, transition:"transform 0.2s", transform:open?"rotate(180deg)":"rotate(0)" }}>▼</span>
      </button>
      {open && <div style={{ padding:"0 16px 14px", fontSize:13, lineHeight:1.6, color:"rgba(255,255,255,0.8)" }}>{children}</div>}
    </div>
  );
}
function RuleBullet({ children, warn }) { return <div style={{ display:"flex", gap:8, marginBottom:4 }}><span style={{ flexShrink:0, marginTop:2 }}>{warn?"⚠️":"•"}</span><span>{children}</span></div>; }
function RuleInterdit({ name, desc }) { return <div style={{ display:"flex", gap:10, padding:"8px 10px", marginBottom:4, background:"rgba(192,57,43,0.1)", borderRadius:6, border:"1px solid rgba(192,57,43,0.2)" }}><span style={{ color:"#e74c3c", fontWeight:700, fontSize:12, minWidth:80, flexShrink:0 }}>🚫 {name}</span><span style={{ fontSize:12 }}>{desc}</span></div>; }

function App() {
  const [teams, setTeams] = useState([]);
  const [matches, setMatches] = useState(DEFAULT_MATCHES);
  const [isAdmin, setIsAdmin] = useState(false);
  const [titleClicks, setTitleClicks] = useState(0);
  const [showPassModal, setShowPassModal] = useState(false);
  const [passInput, setPassInput] = useState("");
  const [selectedSchool, setSelectedSchool] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [teamName, setTeamName] = useState("");
  const [players, setPlayers] = useState(["","","",""]);
  const [submitted, setSubmitted] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [activeTab, setActiveTab] = useState("calendar");
  const [editingScore, setEditingScore] = useState(null);
  const [scoreInputA, setScoreInputA] = useState("");
  const [scoreInputB, setScoreInputB] = useState("");
  const [editingDate, setEditingDate] = useState(null);
  const [dateInput, setDateInput] = useState("");
  const [dayInput, setDayInput] = useState("");
  const [timeInput, setTimeInput] = useState("");

  useEffect(() => { (async () => {
    const t = await DB.get(KEYS.teams); if (t) setTeams(t);
    const m = await DB.get(KEYS.matches); if (m) setMatches(m);
    const a = await DB.get(KEYS.admin); if (a) setIsAdmin(true);
  })(); }, []);

  const saveTeams = async (t) => { setTeams(t); await DB.set(KEYS.teams, t); };
  const saveMatches = async (m) => { setMatches(m); await DB.set(KEYS.matches, m); };

  const handleTitleClick = () => { const n = titleClicks+1; setTitleClicks(n); if (n>=5) { setShowPassModal(true); setTitleClicks(0); } };
  const handlePassSubmit = async () => { if (passInput===ADMIN_PASS) { setIsAdmin(true); await DB.set(KEYS.admin,true); } setShowPassModal(false); setPassInput(""); };
  const handleLogout = async () => { setIsAdmin(false); await DB.set(KEYS.admin,false); };

  const resetForm = () => { setSelectedSchool(""); setSelectedClass(""); setTeamName(""); setPlayers(["","","",""]); setEditingIndex(null); };
  const handleSubmit = () => {
    if (!selectedClass||!teamName.trim()||players.filter(p=>p.trim()).length<2) return;
    const team = { id:editingIndex!==null?teams[editingIndex].id:Date.now().toString(), school:selectedSchool, className:selectedClass, name:teamName.trim(), players:players.map(p=>p.trim()).filter(Boolean), date:new Date().toLocaleDateString("fr-FR") };
    let nt; if (editingIndex!==null) { nt=[...teams]; nt[editingIndex]=team; } else { nt=[...teams,team]; }
    saveTeams(nt); setSubmitted(true);
    setTimeout(() => { setSubmitted(false); resetForm(); setActiveTab("equipes"); },2000);
  };
  const handleEdit = (idx) => { const t=teams[idx]; setSelectedSchool(t.school); setSelectedClass(t.className); setTeamName(t.name); const p=[...t.players]; while(p.length<4) p.push(""); setPlayers(p); setEditingIndex(idx); setActiveTab("inscription"); };
  const handleDelete = async (idx) => { await saveTeams(teams.filter((_,i)=>i!==idx)); };

  const handleSaveScore = (matchId) => {
    const a=parseInt(scoreInputA); const b=parseInt(scoreInputB);
    if (isNaN(a)||isNaN(b)) return;
    saveMatches(matches.map(m=>m.id===matchId?{...m,scoreA:a,scoreB:b,winnerId:a>b?"A":b>a?"B":null}:m));
    setEditingScore(null); setScoreInputA(""); setScoreInputB("");
  };

  const handleSaveDate = (matchId) => {
    if (!dateInput||!dayInput||!timeInput) return;
    saveMatches(matches.map(m=>m.id===matchId?{...m,date:dateInput,day:dayInput,time:timeInput}:m));
    setEditingDate(null); setDateInput(""); setDayInput(""); setTimeInput("");
  };

  const filledPlayers = players.filter(p=>p.trim()).length;
  const canSubmit = selectedClass&&teamName.trim()&&filledPlayers>=2;
  const teamsPerClass = {}; teams.forEach(t=>{ teamsPerClass[t.className]=(teamsPerClass[t.className]||0)+1; });

  const matchDays = []; let cd=null;
  [...matches].sort((a,b)=>{ const da=a.date.split("/").reverse().join(""); const db=b.date.split("/").reverse().join(""); return da.localeCompare(db)||a.time.localeCompare(b.time); })
    .forEach(m=>{ if(!cd||cd.date!==m.date){ cd={date:m.date,day:m.day,matches:[]}; matchDays.push(cd); } cd.matches.push(m); });

  const exportCSV = () => {
    const rows=[["École","Classe","Nom d'équipe","Joueur 1","Joueur 2","Joueur 3","Joueur 4","Date"]];
    teams.forEach(t=>{ const p=[...t.players]; while(p.length<4)p.push(""); rows.push([t.school,t.className,t.name,p[0],p[1],p[2],p[3],t.date]); });
    const csv=rows.map(r=>r.map(c=>`"${c}"`).join(",")).join("\n");
    const blob=new Blob(["\uFEFF"+csv],{type:"text/csv;charset=utf-8"}); const url=URL.createObjectURL(blob);
    const a=document.createElement("a"); a.href=url; a.download="inscriptions_babyfoot.csv"; a.click(); URL.revokeObjectURL(url);
  };

  const tabs = [{id:"calendar",label:"📅 Matchs"},{id:"arbre",label:"🌳 Arbre"},{id:"inscription",label:"✍️ Inscription"},{id:"equipes",label:`👥 (${teams.length})`},{id:"reglement",label:"📜 Règles"}];
  const inputStyle = { width:"100%", padding:"10px 12px", borderRadius:8, background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.15)", color:"#fff", fontSize:14, marginBottom:8, boxSizing:"border-box" };
  const labelStyle = { fontSize:12, fontWeight:600, opacity:0.6, textTransform:"uppercase", letterSpacing:1, display:"block", marginBottom:6 };
  const smallBtn = (bg,col) => ({ padding:"4px 10px", borderRadius:6, border:"none", background:bg, color:col, fontSize:11, cursor:"pointer", fontWeight:600 });

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#0f0c29 0%,#1a1a2e 50%,#16213e 100%)", fontFamily:"'Segoe UI',system-ui,sans-serif", color:"#fff", padding:0 }}>

      {showPassModal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", zIndex:999, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
          <div style={{ background:"#1a1a2e", borderRadius:14, padding:24, width:"100%", maxWidth:320, border:"1px solid rgba(255,255,255,0.1)" }}>
            <div style={{ fontSize:16, fontWeight:700, marginBottom:16 }}>🔐 Accès Admin</div>
            <input value={passInput} onChange={e=>setPassInput(e.target.value)} type="password" placeholder="Mot de passe" onKeyDown={e=>e.key==="Enter"&&handlePassSubmit()} style={{...inputStyle,marginBottom:12}} autoFocus />
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={()=>{setShowPassModal(false);setPassInput("");}} style={{ flex:1, padding:10, borderRadius:8, border:"1px solid rgba(255,255,255,0.15)", background:"none", color:"rgba(255,255,255,0.6)", cursor:"pointer", fontWeight:600 }}>Annuler</button>
              <button onClick={handlePassSubmit} style={{ flex:1, padding:10, borderRadius:8, border:"none", background:"#ED7218", color:"#fff", cursor:"pointer", fontWeight:700 }}>Valider</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ background:"linear-gradient(90deg,#ED7218 0%,#e85d04 100%)", padding:"28px 24px 22px", textAlign:"center", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, background:"repeating-linear-gradient(45deg,transparent,transparent 20px,rgba(255,255,255,0.03) 20px,rgba(255,255,255,0.03) 40px)" }} />
        <div style={{ position:"relative" }}>
          <div style={{ fontSize:38, marginBottom:4 }}>⚽</div>
          <h1 onClick={handleTitleClick} style={{ margin:0, fontSize:22, fontWeight:800, letterSpacing:2, textTransform:"uppercase", cursor:"default", userSelect:"none" }}>Tournoi Baby-Foot</h1>
          <p style={{ margin:"4px 0 0", fontSize:13, opacity:0.9, fontWeight:500 }}>Studio M & ISCOM — Printemps 2026</p>
          {isAdmin && <div style={{ marginTop:6, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
            <span style={{ fontSize:10, fontWeight:700, color:"rgba(255,255,255,0.7)", background:"rgba(0,0,0,0.2)", padding:"2px 8px", borderRadius:4 }}>🔧 ADMIN</span>
            <button onClick={handleLogout} style={{ fontSize:10, background:"rgba(0,0,0,0.3)", border:"none", color:"rgba(255,255,255,0.5)", padding:"2px 8px", borderRadius:4, cursor:"pointer" }}>Déco</button>
          </div>}
        </div>
      </div>

      <div style={{ maxWidth:540, margin:"0 auto", padding:"0 16px 40px" }}>
        <div style={{ display:"flex", marginTop:16, marginBottom:16, background:"rgba(255,255,255,0.05)", borderRadius:10, padding:3, border:"1px solid rgba(255,255,255,0.08)" }}>
          {tabs.map(tab=>(
            <button key={tab.id} onClick={()=>setActiveTab(tab.id)} style={{ flex:1, padding:"10px 2px", borderRadius:8, border:"none", background:activeTab===tab.id?"rgba(237,114,24,0.9)":"transparent", color:activeTab===tab.id?"#fff":"rgba(255,255,255,0.5)", fontSize:11, fontWeight:600, cursor:"pointer", transition:"all 0.2s" }}>{tab.label}</button>
          ))}
        </div>

        {/* ===== CALENDAR ===== */}
        {activeTab==="calendar" && (
          <div>
            <div style={{ textAlign:"center", marginBottom:16, padding:"10px 16px", background:"rgba(255,255,255,0.04)", borderRadius:10, border:"1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ fontSize:13, opacity:0.6, fontWeight:600, textTransform:"uppercase", letterSpacing:1 }}>Huitièmes de finale</div>
              <div style={{ fontSize:11, opacity:0.4, marginTop:2 }}>2 × 10 points — Les 4 joueurs jouent — Pause déjeuner</div>
            </div>
            {matchDays.map((day,di)=>(
              <div key={di} style={{ marginBottom:16 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
                  <div style={{ background:"rgba(237,114,24,0.15)", border:"1px solid rgba(237,114,24,0.3)", borderRadius:8, padding:"6px 12px", flexShrink:0 }}>
                    <div style={{ fontSize:11, fontWeight:700, color:"#ED7218", textTransform:"uppercase" }}>{day.day}</div>
                    <div style={{ fontSize:16, fontWeight:800 }}>{day.date}</div>
                  </div>
                  <div style={{ flex:1, height:1, background:"rgba(255,255,255,0.08)" }} />
                </div>
                {day.matches.map(m=>{
                  const hasScore=m.scoreA!==null;
                  return (
                    <div key={m.id} style={{ background:"rgba(255,255,255,0.05)", borderRadius:10, padding:"12px 14px", marginBottom:6, border:"1px solid rgba(255,255,255,0.06)" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                        <div style={{ fontSize:14, fontWeight:800, color:"#ED7218", minWidth:48, textAlign:"center", flexShrink:0 }}>{m.time}</div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                              <span style={{ fontSize:13, fontWeight:hasScore&&m.winnerId==="A"?700:500, color:hasScore&&m.winnerId==="A"?"#ED7218":"#fff" }}>{m.teamA}</span>
                              {hasScore&&<span style={{ fontSize:14, fontWeight:800 }}>{m.scoreA}</span>}
                            </div>
                            <div style={{ fontSize:10, fontWeight:800, color:"rgba(255,255,255,0.25)", alignSelf:"center", padding:"1px 8px", background:"rgba(255,255,255,0.05)", borderRadius:4, width:"fit-content" }}>VS</div>
                            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                              <span style={{ fontSize:13, fontWeight:hasScore&&m.winnerId==="B"?700:500, color:hasScore&&m.winnerId==="B"?"#ED7218":"#fff" }}>{m.teamB}</span>
                              {hasScore&&<span style={{ fontSize:14, fontWeight:800 }}>{m.scoreB}</span>}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Admin controls */}
                      {isAdmin && (
                        <div style={{ marginTop:8, borderTop:"1px solid rgba(255,255,255,0.06)", paddingTop:8 }}>
                          {/* Score editing */}
                          {editingScore===m.id ? (
                            <div style={{ display:"flex", gap:6, alignItems:"center", marginBottom:6 }}>
                              <input value={scoreInputA} onChange={e=>setScoreInputA(e.target.value)} placeholder="A" type="number" style={{...inputStyle,width:60,marginBottom:0,textAlign:"center"}} />
                              <span style={{ opacity:0.3, fontWeight:700 }}>—</span>
                              <input value={scoreInputB} onChange={e=>setScoreInputB(e.target.value)} placeholder="B" type="number" style={{...inputStyle,width:60,marginBottom:0,textAlign:"center"}} />
                              <button onClick={()=>handleSaveScore(m.id)} style={smallBtn("#ED7218","#fff")}>OK</button>
                              <button onClick={()=>setEditingScore(null)} style={smallBtn("rgba(255,255,255,0.1)","rgba(255,255,255,0.5)")}>✕</button>
                            </div>
                          ) : null}

                          {/* Date editing */}
                          {editingDate===m.id ? (
                            <div style={{ marginBottom:6 }}>
                              <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                                <input value={dateInput} onChange={e=>setDateInput(e.target.value)} placeholder="JJ/MM" style={{...inputStyle,flex:1,marginBottom:0}} />
                                <select value={dayInput} onChange={e=>setDayInput(e.target.value)} style={{...inputStyle,flex:1,marginBottom:0,appearance:"auto"}}>
                                  <option value="">Jour</option>
                                  {DAYS.map(d=><option key={d} value={d}>{d}</option>)}
                                </select>
                                <select value={timeInput} onChange={e=>setTimeInput(e.target.value)} style={{...inputStyle,flex:1,marginBottom:0,appearance:"auto"}}>
                                  {TIMES.map(t=><option key={t} value={t}>{t}</option>)}
                                </select>
                              </div>
                              <div style={{ display:"flex", gap:6, marginTop:6 }}>
                                <button onClick={()=>handleSaveDate(m.id)} style={smallBtn("#ED7218","#fff")}>Enregistrer</button>
                                <button onClick={()=>setEditingDate(null)} style={smallBtn("rgba(255,255,255,0.1)","rgba(255,255,255,0.5)")}>Annuler</button>
                              </div>
                            </div>
                          ) : null}

                          {/* Action buttons */}
                          {editingScore!==m.id && editingDate!==m.id && (
                            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                              <button onClick={()=>{setEditingScore(m.id);setScoreInputA(m.scoreA!==null?String(m.scoreA):"");setScoreInputB(m.scoreB!==null?String(m.scoreB):"");}} style={smallBtn("rgba(255,255,255,0.08)","rgba(255,255,255,0.5)")}>✏️ Score</button>
                              <button onClick={()=>{setEditingDate(m.id);setDateInput(m.date);setDayInput(m.day);setTimeInput(m.time);}} style={smallBtn("rgba(255,255,255,0.08)","rgba(255,255,255,0.5)")}>📅 Date</button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
            <button onClick={()=>setActiveTab("inscription")} style={{
              width:"100%", padding:14, fontSize:15, fontWeight:700, background:"linear-gradient(90deg,#ED7218,#e85d04)",
              color:"#fff", border:"none", borderRadius:12, cursor:"pointer", letterSpacing:0.5, marginTop:8,
              boxShadow:"0 4px 24px rgba(237,114,24,0.3)", transition:"transform 0.15s,box-shadow 0.15s",
            }}
            onMouseEnter={e=>{e.target.style.transform="translateY(-1px)";e.target.style.boxShadow="0 6px 30px rgba(237,114,24,0.4)";}}
            onMouseLeave={e=>{e.target.style.transform="";e.target.style.boxShadow="0 4px 24px rgba(237,114,24,0.3)";}}
            >Inscrire mon équipe →</button>
          </div>
        )}

        {/* ===== ARBRE ===== */}
        {activeTab==="arbre" && (
          <div>
            <div style={{ textAlign:"center", marginBottom:16, padding:"12px 16px", background:"rgba(255,255,255,0.04)", borderRadius:10, border:"1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ fontSize:15, fontWeight:800, textTransform:"uppercase", letterSpacing:1 }}>Arbre du tournoi</div>
              <div style={{ fontSize:11, opacity:0.4, marginTop:2 }}>Élimination directe — Huitièmes de finale</div>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              {matches.map(m=>{
                const hasScore=m.scoreA!==null;
                return (
                  <div key={m.id} style={{ background:"rgba(255,255,255,0.05)", borderRadius:8, overflow:"hidden", border:`1px solid ${hasScore?"rgba(237,114,24,0.2)":"rgba(255,255,255,0.06)"}` }}>
                    <div style={{ fontSize:9, fontWeight:700, color:"#ED7218", textAlign:"center", padding:"3px 8px", background:"rgba(237,114,24,0.08)", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>{m.date} — {m.day} {m.time}</div>
                    <div style={{ display:"flex", justifyContent:"space-between", padding:"6px 10px", borderBottom:"1px solid rgba(255,255,255,0.04)", background:hasScore&&m.winnerId==="A"?"rgba(237,114,24,0.1)":"transparent" }}>
                      <span style={{ fontSize:12, fontWeight:hasScore&&m.winnerId==="A"?700:500 }}>{m.teamA}</span>
                      {hasScore&&<span style={{ fontSize:13, fontWeight:800 }}>{m.scoreA}</span>}
                    </div>
                    <div style={{ display:"flex", justifyContent:"space-between", padding:"6px 10px", background:hasScore&&m.winnerId==="B"?"rgba(237,114,24,0.1)":"transparent" }}>
                      <span style={{ fontSize:12, fontWeight:hasScore&&m.winnerId==="B"?700:500 }}>{m.teamB}</span>
                      {hasScore&&<span style={{ fontSize:13, fontWeight:800 }}>{m.scoreB}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop:16 }}>
              {[{label:"Quarts de finale",count:5},{label:"Demi-finales",count:2},{label:"🏆 Finale",count:1}].map(phase=>(
                <div key={phase.label} style={{ marginBottom:12 }}>
                  <div style={{ fontSize:12, fontWeight:700, color:"#ED7218", textTransform:"uppercase", letterSpacing:1, marginBottom:6, textAlign:"center" }}>{phase.label}</div>
                  {Array.from({length:phase.count}).map((_,i)=>(
                    <div key={i} style={{ background:"rgba(255,255,255,0.03)", borderRadius:8, overflow:"hidden", border:"1px solid rgba(255,255,255,0.04)", marginBottom:4 }}>
                      <div style={{ fontSize:9, fontWeight:700, color:"rgba(255,255,255,0.2)", textAlign:"center", padding:"3px 8px", background:"rgba(255,255,255,0.02)" }}>À définir</div>
                      <div style={{ padding:"5px 10px", fontSize:11, color:"rgba(255,255,255,0.25)", borderBottom:"1px solid rgba(255,255,255,0.03)" }}>Vainqueur ?</div>
                      <div style={{ padding:"5px 10px", fontSize:11, color:"rgba(255,255,255,0.25)" }}>Vainqueur ?</div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div style={{ display:"flex", gap:16, justifyContent:"center", marginTop:12, flexWrap:"wrap" }}>
              {[{emoji:"🔵",label:"ISCOM"},{emoji:"🔴",label:"Studio M"},{emoji:"🟢",label:"Staff"}].map(l=>(
                <div key={l.label} style={{ display:"flex", alignItems:"center", gap:4, fontSize:11, opacity:0.6 }}><span>{l.emoji}</span> {l.label}</div>
              ))}
            </div>
          </div>
        )}

        {/* ===== INSCRIPTION ===== */}
        {activeTab==="inscription" && (
          <div>
            {submitted ? (
              <div style={{ textAlign:"center", padding:"32px 20px", background:"rgba(26,140,94,0.15)", borderRadius:12, border:"1px solid rgba(26,140,94,0.3)" }}>
                <div style={{ fontSize:40, marginBottom:8 }}>✅</div>
                <div style={{ fontSize:16, fontWeight:700 }}>{editingIndex!==null?"Équipe modifiée !":"Équipe inscrite !"}</div>
              </div>
            ) : (
              <div style={{ background:"rgba(255,255,255,0.06)", borderRadius:14, padding:"20px 18px", border:"1px solid rgba(255,255,255,0.1)" }}>
                <h2 style={{ margin:"0 0 16px", fontSize:16, fontWeight:700 }}>{editingIndex!==null?"✏️ Modifier l'équipe":"✍️ Nouvelle équipe"}</h2>
                <label style={labelStyle}>École</label>
                <div style={{ display:"flex", gap:8, marginBottom:16 }}>
                  {Object.keys(CLASSES).map(school=>(
                    <button key={school} onClick={()=>{setSelectedSchool(school);setSelectedClass("");}} style={{
                      flex:1, padding:"10px 8px", borderRadius:8, border:"2px solid",
                      borderColor:selectedSchool===school?SCHOOL_COLORS[school]:"rgba(255,255,255,0.1)",
                      background:selectedSchool===school?`${SCHOOL_COLORS[school]}22`:"rgba(255,255,255,0.03)",
                      color:selectedSchool===school?"#fff":"rgba(255,255,255,0.5)",
                      cursor:"pointer", fontSize:13, fontWeight:600, transition:"all 0.15s",
                    }}>{SCHOOL_EMOJIS[school]} {school}</button>
                  ))}
                </div>
                {selectedSchool && (
                  <>
                    <label style={labelStyle}>Classe</label>
                    <select value={selectedClass} onChange={e=>setSelectedClass(e.target.value)} style={{...inputStyle,marginBottom:16,appearance:"auto"}}>
                      <option value="" style={{background:"#1a1a2e"}}>Sélectionner une classe...</option>
                      {CLASSES[selectedSchool].map(c=>{
                        const taken=teamsPerClass[c]&&(editingIndex===null||teams[editingIndex]?.className!==c);
                        return <option key={c} value={c} disabled={taken} style={{background:"#1a1a2e",color:taken?"#666":"#fff"}}>{c} {taken?"(déjà inscrite)":""}</option>;
                      })}
                    </select>
                  </>
                )}
                {selectedClass && (
                  <>
                    <label style={labelStyle}>Nom d'équipe</label>
                    <input value={teamName} onChange={e=>setTeamName(e.target.value)} placeholder="Ex: Les Roulettes Interdites" style={{...inputStyle,marginBottom:16}} />
                    <label style={labelStyle}>Joueurs ({filledPlayers}/4) — minimum 2</label>
                    {players.map((p,i)=>(
                      <input key={i} value={p} onChange={e=>{const np=[...players];np[i]=e.target.value;setPlayers(np);}}
                        placeholder={`Joueur ${i+1}${i<2?" * (aller)":" * (retour)"}`} style={inputStyle} />
                    ))}
                    <button onClick={handleSubmit} disabled={!canSubmit} style={{
                      width:"100%", padding:14, fontSize:15, fontWeight:700, marginTop:8,
                      background:canSubmit?"linear-gradient(90deg,#ED7218,#e85d04)":"rgba(255,255,255,0.1)",
                      color:canSubmit?"#fff":"rgba(255,255,255,0.3)", border:"none", borderRadius:10,
                      cursor:canSubmit?"pointer":"not-allowed", transition:"all 0.15s",
                    }}>{editingIndex!==null?"Modifier l'équipe":"Inscrire l'équipe"} →</button>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* ===== EQUIPES ===== */}
        {activeTab==="equipes" && (
          <div>
            <div style={{ display:"flex", justifyContent:"center", gap:20, marginBottom:16, background:"rgba(255,255,255,0.05)", borderRadius:12, padding:"14px 16px", border:"1px solid rgba(255,255,255,0.08)" }}>
              {[{val:teams.length,label:`Équipe${teams.length>1?"s":""}`},{val:teams.reduce((a,t)=>a+t.players.length,0),label:"Joueurs"}].map((s,i)=>(
                <div key={i} style={{ display:"flex", alignItems:"center", gap:i<1?20:0 }}>
                  <div style={{ textAlign:"center" }}><div style={{ fontSize:22, fontWeight:800 }}>{s.val}</div><div style={{ fontSize:11, opacity:0.5, textTransform:"uppercase", letterSpacing:1 }}>{s.label}</div></div>
                  {i<1&&<div style={{ width:1, height:30, background:"rgba(255,255,255,0.1)", marginLeft:20 }} />}
                </div>
              ))}
            </div>
            {isAdmin&&teams.length>0&&(
              <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:10 }}>
                <button onClick={exportCSV} style={{ background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.15)", color:"rgba(255,255,255,0.7)", padding:"6px 12px", borderRadius:8, fontSize:12, cursor:"pointer", fontWeight:600 }}>📥 CSV</button>
              </div>
            )}
            {teams.map((t,idx)=>(
              <div key={t.id} style={{ background:"rgba(255,255,255,0.05)", borderRadius:10, padding:"14px 16px", marginBottom:8, borderLeft:`3px solid ${SCHOOL_COLORS[t.school]||"#666"}`, transition:"background 0.15s" }}
                onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.08)"} onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.05)"}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                  <div>
                    <div style={{ fontSize:15, fontWeight:700, marginBottom:2 }}>{SCHOOL_EMOJIS[t.school]} {t.name}</div>
                    <div style={{ fontSize:12, opacity:0.5, marginBottom:6 }}>{t.className}</div>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>{t.players.map((p,j)=><span key={j} style={{ background:"rgba(255,255,255,0.08)", padding:"3px 10px", borderRadius:20, fontSize:12, fontWeight:500 }}>{p}</span>)}</div>
                  </div>
                  {isAdmin&&(
                    <div style={{ display:"flex", gap:4, flexShrink:0, marginLeft:8 }}>
                      <button onClick={()=>handleEdit(idx)} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.3)", cursor:"pointer", fontSize:16, padding:"2px 4px" }}>✏️</button>
                      <button onClick={()=>handleDelete(idx)} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.3)", cursor:"pointer", fontSize:16, padding:"2px 4px" }}>🗑️</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {teams.length===0&&(
              <div style={{ textAlign:"center", padding:"32px 20px", opacity:0.4 }}>
                <div style={{ fontSize:32, marginBottom:8 }}>🏆</div><p style={{ fontSize:14, margin:0 }}>Aucune équipe inscrite</p>
              </div>
            )}
          </div>
        )}

        {/* ===== REGLEMENT ===== */}
        {activeTab==="reglement" && (
          <div>
            <div style={{ textAlign:"center", marginBottom:16, padding:"12px 16px", background:"rgba(255,255,255,0.04)", borderRadius:10, border:"1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ fontSize:15, fontWeight:800, textTransform:"uppercase", letterSpacing:1 }}>Règlement officiel</div>
              <div style={{ fontSize:11, opacity:0.4, marginTop:2 }}>Tournoi Baby-Foot — Studio M & ISCOM</div>
            </div>
            <RuleSection icon="🤝" title="1. L'esprit du tournoi">
              <p style={{ margin:"0 0 8px" }}>Ce tournoi est un moment de <strong>cohésion</strong>, de <strong>fair-play</strong> et de rencontre entre Studio M et l'ISCOM.</p>
              <p style={{ margin:0, color:"#e74c3c", fontWeight:600 }}>Comportement antisportif ou dégradation = disqualification immédiate.</p>
            </RuleSection>
            <RuleSection icon="👥" title="2. Composition des équipes">
              <RuleBullet><strong>4 joueurs</strong>, <strong>2 sur le terrain</strong> (1 attaque + 1 défense).</RuleBullet>
              <RuleBullet><strong>Mixité :</strong> min. 1 fille et 1 garçon si possible.</RuleBullet>
              <RuleBullet>Pas de remplacement externe sauf blessure validée.</RuleBullet>
            </RuleSection>
            <RuleSection icon="🏆" title="3. Format des matchs">
              <div style={{ padding:"10px 14px", background:"rgba(237,114,24,0.1)", borderRadius:8, border:"1px solid rgba(237,114,24,0.2)", marginBottom:8 }}>
                <div style={{ fontWeight:700, fontSize:14, color:"#ED7218", marginBottom:4 }}>🏓 Aller — 10 points</div>
                <div style={{ fontSize:12 }}>2 premiers joueurs. Mi-temps finie dès <strong>10 buts</strong>.</div>
              </div>
              <div style={{ display:"flex", justifyContent:"center", margin:"4px 0" }}><div style={{ fontSize:11, fontWeight:800, color:"rgba(255,255,255,0.3)", padding:"2px 12px", background:"rgba(255,255,255,0.05)", borderRadius:4 }}>🔄 CHANGEMENT DES 4 JOUEURS</div></div>
              <div style={{ padding:"10px 14px", background:"rgba(237,114,24,0.1)", borderRadius:8, border:"1px solid rgba(237,114,24,0.2)", marginTop:6, marginBottom:8 }}>
                <div style={{ fontWeight:700, fontSize:14, color:"#ED7218", marginBottom:4 }}>🏓 Retour — 10 points</div>
                <div style={{ fontSize:12 }}>2 autres joueurs. Mi-temps finie dès <strong>10 buts</strong>.</div>
              </div>
              <div style={{ padding:"8px 12px", background:"rgba(255,255,255,0.06)", borderRadius:8, marginBottom:8 }}>
                <div style={{ fontWeight:700, fontSize:13, marginBottom:4 }}>📊 Résultat</div>
                <div style={{ fontSize:12 }}>Total sur 20. <strong>Meilleur score</strong> = victoire.</div>
              </div>
              <RuleBullet>Élimination directe (8e → Quarts → Demies → Finale).</RuleBullet>
            </RuleSection>
            <RuleSection icon="⏰" title="4. Ponctualité"><RuleBullet>Matchs sur la pause déjeuner.</RuleBullet><RuleBullet warn><strong>+5 min = forfait.</strong></RuleBullet></RuleSection>
            <RuleSection icon="⚖️" title="5. Arbitrage"><RuleBullet>Auto-arbitrage. Staff = juge de paix. Décision finale.</RuleBullet></RuleSection>
            <RuleSection icon="⚽" title="6. Engagement"><RuleBullet>Pile ou face / chifoumi. Toujours aux demis. "Prêt ?" obligatoire.</RuleBullet><RuleBullet>L'équipe qui encaisse récupère l'engagement.</RuleBullet></RuleSection>
            <RuleSection icon="🥅" title="7. Buts et gamelles"><RuleBullet>Gamelle = 1 pt. Pas de but direct sur engagement sans passe.</RuleBullet></RuleSection>
            <RuleSection icon="🚫" title="8. Interdits absolus">
              <div style={{ marginBottom:4, fontSize:12, opacity:0.6, fontWeight:600 }}>Sanction : balle à l'adversaire</div>
              <RuleInterdit name="Roulette" desc="Rotation 360°+ de la barre." />
              <RuleInterdit name="Bourrinage" desc="Tordre/soulever/secouer la table." />
              <RuleInterdit name="Distraction" desc="Crier ou mains au-dessus du terrain." />
              <RuleInterdit name="Pissettes" desc="Tir ailiers barre de 3 sans passe." />
              <RuleInterdit name="Râteaux" desc="Déviation latérale aux demis." />
            </RuleSection>
            <RuleSection icon="💀" title="9. Balles mortes / sorties"><RuleBullet>Morte entre barres de 5 → demis du dernier engagement.</RuleBullet><RuleBullet>Morte ailleurs → arrières du camp le plus proche.</RuleBullet><RuleBullet>Hors table → arrières de l'autre équipe. Rebond du but → but accordé.</RuleBullet></RuleSection>
            <RuleSection icon="⏸️" title="10. Temps morts"><RuleBullet>1 temps mort (1 min) par mi-temps par équipe, balle contrôlée.</RuleBullet></RuleSection>
            <div style={{ textAlign:"center", marginTop:16, padding:"14px 16px", background:"rgba(237,114,24,0.08)", borderRadius:10, border:"1px solid rgba(237,114,24,0.15)" }}>
              <div style={{ fontSize:14, fontWeight:700 }}>Bon tournoi à toutes et à tous ! 🏆</div>
              <div style={{ fontSize:11, opacity:0.4, marginTop:4, fontStyle:"italic" }}>Le Staff Studio M & ISCOM</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
