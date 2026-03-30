// @ts-nocheck
import { useState, useRef } from "react";

// ─── Data & Helpers ──────────────────────────────────────────────────────────

const SAMPLE_LISTINGS = [
  {
    id: "l1", title: "Rolling Timber Tract – Cleburne County", price: 485000, acres: 142,
    pricePerAcre: 3415, location: "Cleburne County, AL", distance: "1h 45m from Birmingham",
    type: "Hunting / Timber", source: "Land.com", sourceColor: "#16a34a",
    tags: ["Road Frontage", "Creek", "Timber", "Deer Stand"],
    description: "Prime hunting tract with mature hardwood timber, seasonal creek, established food plots, and county road frontage. Power available at road.",
    score: 94, scoreReason: "Matches acreage range, $185/acre under your max, road frontage confirmed, within 2hr radius.",
    img: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600&q=80",
    lat: 33.68, lng: -85.52,
  },
  {
    id: "l2", title: "Subdividable Pasture & Timber – Tallapoosa Co.", price: 612000, acres: 198,
    pricePerAcre: 3090, location: "Tallapoosa County, AL", distance: "1h 20m from Birmingham",
    type: "Recreational / Subdividable", source: "Zillow", sourceColor: "#0061ff",
    tags: ["Subdividable", "Road Frontage", "Utilities", "Open Pasture"],
    description: "Large subdividable parcel with highway frontage, water & power at road. Mix of open pasture and pine timber. Survey stakes in place.",
    score: 91, scoreReason: "In your target county, road frontage & utilities, well under $4k/acre, prime for subdivision.",
    img: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&q=80",
    lat: 32.87, lng: -85.77,
  },
  {
    id: "l3", title: "Remote Hunting Land – Randolph County", price: 310000, acres: 89,
    pricePerAcre: 3483, location: "Randolph County, AL", distance: "2h from Birmingham",
    type: "Hunting", source: "Crexi", sourceColor: "#f97316",
    tags: ["Hunting", "Creek", "Remote", "Cabin Site"],
    description: "Secluded hunting parcel with multiple ridge lines, creek bottom, natural springs, and an established cabin site. No road frontage.",
    score: 71, scoreReason: "Strong price per acre, great hunting features — but no road frontage and slightly under your 100-acre minimum.",
    img: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&q=80",
    lat: 33.42, lng: -85.25,
  },
  {
    id: "l4", title: "Commercial Woodland – Coosa County", price: 720000, acres: 210,
    pricePerAcre: 3428, location: "Coosa County, AL", distance: "1h 10m from Birmingham",
    type: "Timber / Investment", source: "LoopNet", sourceColor: "#7c3aed",
    tags: ["Timber", "Road Frontage", "Investment", "Merchantable Pine"],
    description: "Recently thinned pine plantation with merchantable timber value estimated at $1,800/acre. Two road access points, utilities nearby.",
    score: 86, scoreReason: "Within budget per acre, significant timber value offsets purchase price, excellent road access.",
    img: "https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=600&q=80",
    lat: 32.95, lng: -86.27,
  },
  {
    id: "l5", title: "Creek Bottom Hunting Tract – St. Clair Co.", price: 525000, acres: 155,
    pricePerAcre: 3387, location: "St. Clair County, AL", distance: "55m from Birmingham",
    type: "Hunting / Recreational", source: "Land.com", sourceColor: "#16a34a",
    tags: ["Creek Bottom", "Road Frontage", "Close to Birmingham", "Food Plots"],
    description: "Exceptional creek bottom hunting land just 55 minutes from Birmingham. Multiple creek crossings, established food plots, 4WD trails throughout.",
    score: 97, scoreReason: "Top match: under 1hr from Birmingham, confirmed road frontage, creek bottom, within price range.",
    img: "https://images.unsplash.com/photo-1490718167797-28090a9da3a4?w=600&q=80",
    lat: 33.75, lng: -86.25,
  },
];

const SAVED_SEARCHES = [
  { id: "s1", name: "Hunting Land Deals", query: "Find 50–200 acre hunting land within 2 hours of Birmingham under $4,000/acre", matches: 5, lastMatch: "2h ago", active: true },
  { id: "s2", name: "Tallapoosa Subdividable", query: "Subdividable land with road frontage in Tallapoosa County", matches: 2, lastMatch: "1d ago", active: true },
  { id: "s3", name: "Timber Investment", query: "Timber land with merchantable pine under $3,500/acre within 1.5hr of Birmingham", matches: 1, lastMatch: "3d ago", active: false },
];

const EXAMPLE_QUERIES = [
  "Find 50–200 acre hunting land within 2 hours of Birmingham under $4,000/acre",
  "Subdividable land with road frontage in Tallapoosa County",
  "Timber investment property under $3,500/acre near I-20 corridor",
  "Recreational land with creek access under 100 acres in St. Clair County",
];

function ScoreRing({ score, size = 52 }) {
  const r = (size / 2) - 5;
  const circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  const color = score >= 90 ? "#22c55e" : score >= 75 ? "#f59e0b" : "#ef4444";
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)", flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1e293b" strokeWidth={4} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={4}
        strokeDasharray={`${fill} ${circ}`} strokeLinecap="round" style={{ transition: "stroke-dasharray 1s ease" }} />
      <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="central"
        fill={color} fontSize={size * 0.28} fontWeight="700" style={{ transform: "rotate(90deg)", transformOrigin: `${size/2}px ${size/2}px` }}>
        {score}
      </text>
    </svg>
  );
}

// ─── App ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [view, setView] = useState("home"); // home | results | dashboard | detail
  const [query, setQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [aiMessage, setAiMessage] = useState("");
  const [aiTyping, setAiTyping] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [favorites, setFavorites] = useState(new Set(["l5"]));
  const [savedSearches, setSavedSearches] = useState(SAVED_SEARCHES);
  const [sortBy, setSortBy] = useState("score");
  const [filterType, setFilterType] = useState("All");
  const [saveName, setSaveName] = useState("");
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [aiChat, setAiChat] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [structuredFilters, setStructuredFilters] = useState(null);
  const searchRef = useRef(null);

  const typeMessage = (msg, cb) => {
    setAiTyping(true); setAiMessage("");
    let i = 0;
    const iv = setInterval(() => {
      setAiMessage(msg.slice(0, i + 1)); i++;
      if (i >= msg.length) { clearInterval(iv); setAiTyping(false); if (cb) cb(); }
    }, 18);
  };

  const handleSearch = async (q) => {
    const searchQ = q || query;
    if (!searchQ.trim()) return;
    setActiveQuery(searchQ); setLoading(true); setView("results");
    setStructuredFilters(null); setAiMessage(""); setAiChat([]);

    // Simulate AI parsing + fetching
    await new Promise(r => setTimeout(r, 1400));
    setStructuredFilters({
      location: "Within 2hr of Birmingham, AL",
      pricePerAcre: "≤ $4,000/acre",
      acreage: "50–200 acres",
      type: "Hunting / Recreational",
      keywords: ["road frontage", "creek", "timber"],
    });
    const sorted = [...SAMPLE_LISTINGS].sort((a, b) => b.score - a.score);
    setListings(sorted);
    setLoading(false);
    typeMessage(`Found ${sorted.length} properties matching your criteria. Top result scores 97% — a creek-bottom hunting tract just 55 minutes from Birmingham, under your $4,000/acre target with confirmed road frontage.`);
  };

  const toggleFavorite = (id) => {
    setFavorites(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const handleSaveSearch = () => {
    if (!saveName.trim()) return;
    setSavedSearches(prev => [...prev, { id: `s${Date.now()}`, name: saveName, query: activeQuery, matches: listings.length, lastMatch: "Just now", active: true }]);
    setShowSaveModal(false); setSaveName("");
  };

  const sendAiChat = async () => {
    if (!chatInput.trim() || aiLoading) return;
    const userMsg = chatInput; setChatInput(""); setAiLoading(true);
    setAiChat(prev => [...prev, { role: "user", text: userMsg }]);

    try {
      const systemPrompt = `You are a knowledgeable real estate assistant specializing in rural land, hunting property, and recreational real estate in Alabama and the Southeast. 
The user searched for: "${activeQuery}"
Current listings shown: ${listings.map(l => `${l.title} (${l.acres}ac, $${l.pricePerAcre}/ac, ${l.location}, score: ${l.score}%)`).join("; ")}
Answer concisely and helpfully in 2-4 sentences. Focus on actionable advice, property comparisons, or clarifying questions. Be conversational but expert.`;

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: systemPrompt,
          messages: [
            ...aiChat.map(m => ({ role: m.role === "user" ? "user" : "assistant", content: m.text })),
            { role: "user", content: userMsg }
          ]
        })
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text || "I couldn't process that. Try again.";
      setAiChat(prev => [...prev, { role: "assistant", text: reply }]);
    } catch {
      setAiChat(prev => [...prev, { role: "assistant", text: "Connection error. Please try again." }]);
    }
    setAiLoading(false);
  };

  const getAiPropertySummary = async (listing) => {
    setSelectedListing({ ...listing, aiSummary: null, loadingSummary: true });
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `Write a 3-sentence AI property analysis for a real estate investor. Property: "${listing.title}" — ${listing.acres} acres, $${listing.pricePerAcre}/acre, ${listing.location}, ${listing.distance}. Tags: ${listing.tags.join(", ")}. Description: ${listing.description}. Original search: "${activeQuery}". Focus on investment merit, match quality, and any considerations. Be direct and insightful.`
          }]
        })
      });
      const data = await res.json();
      const summary = data.content?.[0]?.text || "Unable to generate summary.";
      setSelectedListing(prev => prev ? { ...prev, aiSummary: summary, loadingSummary: false } : null);
    } catch {
      setSelectedListing(prev => prev ? { ...prev, aiSummary: "Could not load AI summary.", loadingSummary: false } : null);
    }
  };

  const sortedListings = [...listings]
    .filter(l => filterType === "All" || l.type.includes(filterType))
    .sort((a, b) => sortBy === "score" ? b.score - a.score : sortBy === "price" ? a.price - b.price : sortBy === "pricePerAcre" ? a.pricePerAcre - b.pricePerAcre : b.acres - a.acres);

  const favListings = SAMPLE_LISTINGS.filter(l => favorites.has(l.id));
  const types = ["All", ...new Set(SAMPLE_LISTINGS.map(l => l.type.split(" / ")[0]))];

  // ─── Styles ───────────────────────────────────────────────────────────────
  const s = {
    app: { fontFamily: "'DM Sans', sans-serif", background: "#060d1a", minHeight: "100vh", color: "#e2e8f0" },
    nav: { background: "rgba(6,13,26,0.92)", backdropFilter: "blur(16px)", borderBottom: "1px solid #1e293b", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60, position: "sticky", top: 0, zIndex: 100 },
    logo: { fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: "#fff", letterSpacing: "-0.5px", cursor: "pointer" },
    logoAccent: { color: "#34d399" },
    navLinks: { display: "flex", gap: 8, alignItems: "center" },
    navBtn: (active) => ({ background: active ? "#1e293b" : "transparent", border: "none", color: active ? "#34d399" : "#94a3b8", padding: "6px 14px", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 500, transition: "all 0.2s" }),
    // Home
    hero: { minHeight: "calc(100vh - 60px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", textAlign: "center", position: "relative", overflow: "hidden" },
    heroBg: { position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 60% at 50% -20%, rgba(52,211,153,0.12) 0%, transparent 70%), radial-gradient(ellipse 60% 40% at 80% 80%, rgba(99,102,241,0.08) 0%, transparent 60%)", pointerEvents: "none" },
    heroEyebrow: { fontSize: 12, fontWeight: 600, letterSpacing: 3, color: "#34d399", textTransform: "uppercase", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 },
    heroTitle: { fontFamily: "'Playfair Display', serif", fontSize: "clamp(40px,6vw,72px)", fontWeight: 700, lineHeight: 1.08, color: "#f1f5f9", marginBottom: 20, maxWidth: 720, letterSpacing: "-1px" },
    heroSub: { fontSize: 18, color: "#64748b", marginBottom: 48, maxWidth: 520, lineHeight: 1.6 },
    searchWrap: { width: "100%", maxWidth: 780, position: "relative", marginBottom: 20 },
    searchBox: { width: "100%", background: "#0f1929", border: "1.5px solid #1e293b", borderRadius: 16, padding: "18px 130px 18px 20px", fontSize: 16, color: "#e2e8f0", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s", lineHeight: 1.5 },
    searchBtn: { position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "linear-gradient(135deg, #34d399, #059669)", border: "none", borderRadius: 10, padding: "10px 22px", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 15, whiteSpace: "nowrap" },
    examplePills: { display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", maxWidth: 780 },
    pill: { background: "#0f1929", border: "1px solid #1e293b", borderRadius: 20, padding: "6px 14px", fontSize: 13, color: "#64748b", cursor: "pointer", transition: "all 0.2s" },
    // Results layout
    resultLayout: { display: "grid", gridTemplateColumns: "280px 1fr", minHeight: "calc(100vh - 60px)", gap: 0 },
    sidebar: { background: "#08101e", borderRight: "1px solid #1e293b", padding: 20, overflowY: "auto" },
    sidebarTitle: { fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "#475569", textTransform: "uppercase", marginBottom: 12 },
    filterBlock: { marginBottom: 24 },
    filterChip: (active) => ({ display: "inline-block", background: active ? "rgba(52,211,153,0.15)" : "#0f1929", border: `1px solid ${active ? "#34d399" : "#1e293b"}`, color: active ? "#34d399" : "#64748b", borderRadius: 6, padding: "5px 10px", fontSize: 12, cursor: "pointer", margin: "2px 3px", transition: "all 0.2s" }),
    mainArea: { padding: "24px 28px", overflowY: "auto" },
    // AI bar
    aiBar: { background: "linear-gradient(135deg, rgba(52,211,153,0.08), rgba(99,102,241,0.06))", border: "1px solid rgba(52,211,153,0.2)", borderRadius: 12, padding: "14px 18px", marginBottom: 20, display: "flex", gap: 12, alignItems: "flex-start" },
    aiAvatar: { width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#34d399,#059669)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 },
    // Results header
    resultsHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
    sortSelect: { background: "#0f1929", border: "1px solid #1e293b", color: "#94a3b8", borderRadius: 8, padding: "7px 12px", fontSize: 13, cursor: "pointer" },
    // Card
    card: { background: "#0c1525", border: "1px solid #1e293b", borderRadius: 14, overflow: "hidden", marginBottom: 16, display: "grid", gridTemplateColumns: "200px 1fr", transition: "border-color 0.2s, transform 0.2s", cursor: "pointer" },
    cardImg: { width: "100%", height: "100%", objectFit: "cover", display: "block" },
    cardBody: { padding: 18 },
    cardMeta: { display: "flex", alignItems: "center", gap: 8, marginBottom: 8 },
    cardSource: (color) => ({ fontSize: 11, fontWeight: 700, color, background: color + "20", borderRadius: 4, padding: "2px 7px", letterSpacing: 0.5 }),
    cardTitle: { fontSize: 16, fontWeight: 600, color: "#f1f5f9", marginBottom: 4, lineHeight: 1.3 },
    cardLocation: { fontSize: 13, color: "#64748b", marginBottom: 10 },
    cardStats: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 12 },
    statBox: { background: "#08101e", borderRadius: 8, padding: "8px 10px" },
    statVal: { fontSize: 15, fontWeight: 700, color: "#f1f5f9" },
    statLabel: { fontSize: 11, color: "#475569" },
    tagRow: { display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12 },
    tag: { background: "#1e293b", borderRadius: 4, padding: "3px 8px", fontSize: 11, color: "#94a3b8" },
    cardFooter: { display: "flex", alignItems: "center", justifyContent: "space-between" },
    scoreWrap: { display: "flex", alignItems: "center", gap: 8 },
    scoreLabel: { fontSize: 12, color: "#64748b" },
    favBtn: (active) => ({ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: active ? "#f43f5e" : "#334155", transition: "color 0.2s" }),
    viewBtn: { background: "transparent", border: "1px solid #1e293b", color: "#34d399", borderRadius: 7, padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" },
    // Chat panel
    chatPanel: { background: "#08101e", border: "1px solid #1e293b", borderRadius: 12, marginTop: 20, overflow: "hidden" },
    chatHeader: { padding: "12px 16px", borderBottom: "1px solid #1e293b", display: "flex", alignItems: "center", gap: 10 },
    chatMsgs: { padding: 16, maxHeight: 260, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10 },
    chatMsg: (role) => ({ alignSelf: role === "user" ? "flex-end" : "flex-start", background: role === "user" ? "rgba(52,211,153,0.12)" : "#0c1525", border: `1px solid ${role === "user" ? "rgba(52,211,153,0.2)" : "#1e293b"}`, borderRadius: 10, padding: "10px 14px", maxWidth: "80%", fontSize: 14, color: "#e2e8f0", lineHeight: 1.5 }),
    chatInputRow: { padding: "10px 14px", borderTop: "1px solid #1e293b", display: "flex", gap: 8 },
    chatInput: { flex: 1, background: "#0c1525", border: "1px solid #1e293b", borderRadius: 8, padding: "9px 12px", fontSize: 14, color: "#e2e8f0", outline: "none" },
    sendBtn: { background: "linear-gradient(135deg,#34d399,#059669)", border: "none", borderRadius: 8, padding: "8px 16px", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 14 },
    // Dashboard
    dashboard: { padding: 32, maxWidth: 1100, margin: "0 auto" },
    pageTitle: { fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700, color: "#f1f5f9", marginBottom: 4 },
    pageSub: { color: "#64748b", fontSize: 15, marginBottom: 32 },
    statsRow: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 },
    statCard: { background: "#0c1525", border: "1px solid #1e293b", borderRadius: 12, padding: 20 },
    statCardVal: { fontSize: 28, fontWeight: 700, color: "#f1f5f9", marginBottom: 4 },
    statCardLabel: { fontSize: 13, color: "#64748b" },
    section: { marginBottom: 32 },
    sectionHead: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
    sectionTitle: { fontSize: 16, fontWeight: 600, color: "#f1f5f9" },
    savedCard: { background: "#0c1525", border: "1px solid #1e293b", borderRadius: 12, padding: 18, marginBottom: 10, display: "flex", alignItems: "center", gap: 16 },
    savedDot: (active) => ({ width: 8, height: 8, borderRadius: "50%", background: active ? "#34d399" : "#475569", flexShrink: 0 }),
    savedName: { fontWeight: 600, color: "#f1f5f9", fontSize: 15 },
    savedQuery: { fontSize: 13, color: "#64748b", marginTop: 2, fontStyle: "italic" },
    savedStats: { marginLeft: "auto", textAlign: "right", flexShrink: 0 },
    badge: { background: "rgba(52,211,153,0.15)", color: "#34d399", borderRadius: 20, padding: "2px 10px", fontSize: 12, fontWeight: 600 },
    // Detail
    detailWrap: { maxWidth: 900, margin: "0 auto", padding: 32 },
    detailImg: { width: "100%", height: 340, objectFit: "cover", borderRadius: 14, marginBottom: 24, border: "1px solid #1e293b" },
    detailTitle: { fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: "#f1f5f9", marginBottom: 8 },
    detailMeta: { display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 24 },
    metaItem: { background: "#0c1525", border: "1px solid #1e293b", borderRadius: 8, padding: "8px 14px", fontSize: 14 },
    metaLabel: { color: "#475569", fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" },
    metaVal: { color: "#f1f5f9", fontWeight: 700, fontSize: 17, marginTop: 2 },
    aiSummaryBox: { background: "linear-gradient(135deg, rgba(52,211,153,0.07), rgba(99,102,241,0.05))", border: "1px solid rgba(52,211,153,0.2)", borderRadius: 12, padding: 20, marginBottom: 24 },
    backBtn: { background: "transparent", border: "1px solid #1e293b", color: "#94a3b8", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: 14, marginBottom: 20 },
    sourceLink: { display: "inline-flex", alignItems: "center", gap: 6, background: "transparent", border: "1px solid #1e293b", borderRadius: 8, color: "#34d399", padding: "10px 18px", fontSize: 14, fontWeight: 600, cursor: "pointer", textDecoration: "none" },
  };

  // ─── Views ────────────────────────────────────────────────────────────────

  const HomeView = () => (
    <div style={s.hero}>
      <div style={s.heroBg} />
      <div style={{ ...s.heroEyebrow, position: "relative" }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#34d399", display: "inline-block" }} />
        AI-Powered Land Search
      </div>
      <h1 style={{ ...s.heroTitle, position: "relative" }}>
        Find Your Perfect<br /><em style={{ fontStyle: "italic", color: "#34d399" }}>Property</em> in Plain English
      </h1>
      <p style={{ ...s.heroSub, position: "relative" }}>Describe exactly what you want. Our AI searches Zillow, Land.com, Crexi, LoopNet and more — then ranks every result by how well it matches <em>you</em>.</p>
      <div style={{ ...s.searchWrap, position: "relative" }}>
        <textarea
          ref={searchRef}
          style={{ ...s.searchBox, resize: "none", height: 80 }}
          placeholder="e.g. 'Find 50–200 acre hunting land within 2 hours of Birmingham under $4,000/acre'"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSearch(); } }}
        />
        <button style={s.searchBtn} onClick={() => handleSearch()}>Search →</button>
      </div>
      <div style={{ ...s.examplePills, position: "relative" }}>
        {EXAMPLE_QUERIES.map((q, i) => (
          <button key={i} style={s.pill} onClick={() => { setQuery(q); handleSearch(q); }}
            onMouseEnter={e => { e.target.style.borderColor = "#34d399"; e.target.style.color = "#34d399"; }}
            onMouseLeave={e => { e.target.style.borderColor = "#1e293b"; e.target.style.color = "#64748b"; }}>
            {q.length > 55 ? q.slice(0, 55) + "…" : q}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 32, marginTop: 56, position: "relative" }}>
        {[["5+", "Data Sources"], ["AI", "Match Score"], ["Real-Time", "Alerts"]].map(([val, lbl]) => (
          <div key={lbl} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#34d399" }}>{val}</div>
            <div style={{ fontSize: 12, color: "#475569" }}>{lbl}</div>
          </div>
        ))}
      </div>
    </div>
  );

  const ResultsView = () => (
    <div style={s.resultLayout}>
      {/* Sidebar */}
      <div style={s.sidebar}>
        <div style={s.filterBlock}>
          <div style={s.sidebarTitle}>Search</div>
          <textarea style={{ ...s.searchBox, width: "100%", boxSizing: "border-box", resize: "none", height: 80, fontSize: 13, padding: "10px 14px" }}
            value={query} onChange={e => setQuery(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSearch(); } }}
          />
          <button style={{ ...s.searchBtn, position: "static", transform: "none", marginTop: 8, width: "100%" }} onClick={() => handleSearch()}>Re-Search</button>
        </div>

        {structuredFilters && (
          <div style={s.filterBlock}>
            <div style={s.sidebarTitle}>Parsed Filters</div>
            {Object.entries(structuredFilters).map(([k, v]) => (
              <div key={k} style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 10, color: "#475569", textTransform: "uppercase", letterSpacing: 1 }}>{k}</div>
                {Array.isArray(v)
                  ? <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 3 }}>{v.map(t => <span key={t} style={{ ...s.tag, background: "rgba(52,211,153,0.08)", color: "#34d399", border: "1px solid rgba(52,211,153,0.15)" }}>{t}</span>)}</div>
                  : <div style={{ fontSize: 13, color: "#f1f5f9", marginTop: 2 }}>{v}</div>}
              </div>
            ))}
          </div>
        )}

        <div style={s.filterBlock}>
          <div style={s.sidebarTitle}>Property Type</div>
          <div>{types.map(t => <span key={t} style={s.filterChip(filterType === t)} onClick={() => setFilterType(t)}>{t}</span>)}</div>
        </div>

        <div style={s.filterBlock}>
          <div style={s.sidebarTitle}>Sources</div>
          {["Land.com", "Zillow", "Crexi", "LoopNet"].map(src => (
            <div key={src} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#34d399" }} />
              <span style={{ fontSize: 13, color: "#94a3b8" }}>{src}</span>
            </div>
          ))}
        </div>

        <button style={{ width: "100%", background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.25)", color: "#34d399", borderRadius: 8, padding: "10px", cursor: "pointer", fontWeight: 600, fontSize: 14 }}
          onClick={() => setShowSaveModal(true)}>
          ＋ Save This Search
        </button>
      </div>

      {/* Main */}
      <div style={s.mainArea}>
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 400, gap: 16 }}>
            <div style={{ width: 48, height: 48, border: "3px solid #1e293b", borderTopColor: "#34d399", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            <div style={{ color: "#64748b" }}>Searching 5 platforms with AI…</div>
          </div>
        ) : (
          <>
            {aiMessage && (
              <div style={s.aiBar}>
                <div style={s.aiAvatar}>✦</div>
                <div style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.6 }}>{aiMessage}{aiTyping && <span style={{ opacity: 0.5 }}>▍</span>}</div>
              </div>
            )}

            <div style={s.resultsHeader}>
              <div style={{ fontSize: 15, color: "#64748b" }}><span style={{ color: "#f1f5f9", fontWeight: 600 }}>{sortedListings.length}</span> properties found</div>
              <select style={s.sortSelect} value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="score">Sort: Best Match</option>
                <option value="price">Sort: Price Low→High</option>
                <option value="pricePerAcre">Sort: $/Acre Low→High</option>
                <option value="acres">Sort: Acreage High→Low</option>
              </select>
            </div>

            {sortedListings.map(l => (
              <div key={l.id} style={s.card}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#334155"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#1e293b"; e.currentTarget.style.transform = "none"; }}>
                <img src={l.img} alt={l.title} style={s.cardImg} />
                <div style={s.cardBody}>
                  <div style={s.cardMeta}>
                    <span style={s.cardSource(l.sourceColor)}>{l.source}</span>
                    <span style={{ fontSize: 12, color: "#64748b" }}>{l.type}</span>
                  </div>
                  <div style={s.cardTitle}>{l.title}</div>
                  <div style={s.cardLocation}>📍 {l.location} · {l.distance}</div>
                  <div style={s.cardStats}>
                    <div style={s.statBox}><div style={s.statVal}>${(l.price / 1000).toFixed(0)}K</div><div style={s.statLabel}>Total Price</div></div>
                    <div style={s.statBox}><div style={s.statVal}>{l.acres} ac</div><div style={s.statLabel}>Acreage</div></div>
                    <div style={s.statBox}><div style={s.statVal}>${l.pricePerAcre.toLocaleString()}</div><div style={s.statLabel}>Per Acre</div></div>
                  </div>
                  <div style={s.tagRow}>{l.tags.map(t => <span key={t} style={s.tag}>{t}</span>)}</div>
                  <div style={s.cardFooter}>
                    <div style={s.scoreWrap}>
                      <ScoreRing score={l.score} />
                      <div>
                        <div style={{ fontSize: 12, color: "#64748b" }}>AI Match</div>
                        <div style={{ fontSize: 11, color: "#475569", maxWidth: 220 }}>{l.scoreReason.slice(0, 60)}…</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <button style={s.favBtn(favorites.has(l.id))} onClick={e => { e.stopPropagation(); toggleFavorite(l.id); }}>
                        {favorites.has(l.id) ? "♥" : "♡"}
                      </button>
                      <button style={s.viewBtn} onClick={() => getAiPropertySummary(l)}>View Details</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* AI Chat */}
            <div style={s.chatPanel}>
              <div style={s.chatHeader}>
                <div style={{ ...s.aiAvatar, width: 28, height: 28, fontSize: 12 }}>✦</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9" }}>Ask your AI assistant</div>
                <div style={{ fontSize: 12, color: "#475569", marginLeft: "auto" }}>About these results</div>
              </div>
              <div style={s.chatMsgs}>
                {aiChat.length === 0 && <div style={{ fontSize: 13, color: "#475569", textAlign: "center", padding: 16 }}>Ask anything about these properties — comparisons, negotiations, due diligence, investment analysis…</div>}
                {aiChat.map((m, i) => <div key={i} style={s.chatMsg(m.role)}>{m.text}</div>)}
                {aiLoading && <div style={s.chatMsg("assistant")}><em style={{ color: "#475569" }}>Thinking…</em></div>}
              </div>
              <div style={s.chatInputRow}>
                <input style={s.chatInput} placeholder="Which property has the best ROI potential?" value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && sendAiChat()} />
                <button style={s.sendBtn} onClick={sendAiChat}>Send</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );

  const DashboardView = () => (
    <div style={s.dashboard}>
      <div style={s.pageTitle}>Your Dashboard</div>
      <div style={s.pageSub}>Saved searches, favorites & recent matches</div>

      <div style={s.statsRow}>
        {[["3", "Saved Searches"], [favorites.size.toString(), "Favorites"], ["8", "New Matches"], ["24h", "Last Alert"]].map(([v, l]) => (
          <div key={l} style={s.statCard}>
            <div style={s.statCardVal}>{v}</div>
            <div style={s.statCardLabel}>{l}</div>
          </div>
        ))}
      </div>

      <div style={s.section}>
        <div style={s.sectionHead}>
          <div style={s.sectionTitle}>Saved Searches (Buy Boxes)</div>
          <button style={{ background: "none", border: "1px solid #1e293b", color: "#34d399", borderRadius: 7, padding: "6px 14px", fontSize: 13, cursor: "pointer" }}>+ New Search</button>
        </div>
        {savedSearches.map(ss => (
          <div key={ss.id} style={s.savedCard}>
            <div style={s.savedDot(ss.active)} />
            <div style={{ flex: 1 }}>
              <div style={s.savedName}>{ss.name}</div>
              <div style={s.savedQuery}>"{ss.query}"</div>
            </div>
            <div style={s.savedStats}>
              <span style={s.badge}>{ss.matches} matches</span>
              <div style={{ fontSize: 11, color: "#475569", marginTop: 4 }}>Last: {ss.lastMatch}</div>
            </div>
            <button style={{ background: "none", border: "1px solid #1e293b", color: "#94a3b8", borderRadius: 7, padding: "6px 12px", fontSize: 12, cursor: "pointer", marginLeft: 8 }}
              onClick={() => { setQuery(ss.query); handleSearch(ss.query); }}>
              Run →
            </button>
          </div>
        ))}
      </div>

      <div style={s.section}>
        <div style={s.sectionHead}><div style={s.sectionTitle}>Favorited Properties</div></div>
        {favListings.length === 0 && <div style={{ color: "#475569", fontSize: 14 }}>No favorites yet. ♡ a listing to save it here.</div>}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
          {favListings.map(l => (
            <div key={l.id} style={{ background: "#0c1525", border: "1px solid #1e293b", borderRadius: 12, overflow: "hidden", cursor: "pointer" }}
              onClick={() => getAiPropertySummary(l)}>
              <img src={l.img} alt={l.title} style={{ width: "100%", height: 140, objectFit: "cover" }} />
              <div style={{ padding: 14 }}>
                <div style={{ fontWeight: 600, color: "#f1f5f9", fontSize: 14, marginBottom: 4 }}>{l.title}</div>
                <div style={{ fontSize: 12, color: "#64748b" }}>{l.acres} ac · ${l.pricePerAcre.toLocaleString()}/ac</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
                  <ScoreRing score={l.score} size={36} />
                  <span style={{ fontSize: 12, color: "#64748b" }}>AI Match</span>
                  <button style={{ ...s.favBtn(true), marginLeft: "auto" }} onClick={e => { e.stopPropagation(); toggleFavorite(l.id); }}>♥</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={s.section}>
        <div style={s.sectionHead}><div style={s.sectionTitle}>Alert Settings</div></div>
        <div style={{ background: "#0c1525", border: "1px solid #1e293b", borderRadius: 12, padding: 20, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {[["📧 Email Alerts", "alerts@youremail.com", true], ["📱 SMS Alerts", "+1 (205) 555-0147", false]].map(([label, val, active]) => (
            <div key={label}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9", marginBottom: 6 }}>{label}</div>
              <input style={{ ...s.chatInput, width: "100%", boxSizing: "border-box" }} defaultValue={val} />
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                <div style={{ width: 36, height: 20, borderRadius: 10, background: active ? "#34d399" : "#1e293b", position: "relative", cursor: "pointer" }}>
                  <div style={{ width: 16, height: 16, background: "#fff", borderRadius: "50%", position: "absolute", top: 2, left: active ? 18 : 2, transition: "left 0.2s" }} />
                </div>
                <span style={{ fontSize: 12, color: "#64748b" }}>{active ? "Enabled" : "Disabled"}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const DetailView = () => {
    const l = selectedListing;
    if (!l) return null;
    return (
      <div style={s.detailWrap}>
        <button style={s.backBtn} onClick={() => setSelectedListing(null)}>← Back to Results</button>
        <img src={l.img} alt={l.title} style={s.detailImg} />
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 16 }}>
          <div>
            <span style={s.cardSource(l.sourceColor)}>{l.source}</span>
            <h1 style={{ ...s.detailTitle, marginTop: 8 }}>{l.title}</h1>
            <div style={{ fontSize: 14, color: "#64748b" }}>📍 {l.location} · {l.distance}</div>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <ScoreRing score={l.score} size={60} />
            <button style={s.favBtn(favorites.has(l.id))} onClick={() => toggleFavorite(l.id)}>{favorites.has(l.id) ? "♥" : "♡"}</button>
          </div>
        </div>

        <div style={s.detailMeta}>
          {[["Price", `$${(l.price / 1000).toFixed(0)}K`], ["Acreage", `${l.acres} ac`], ["Per Acre", `$${l.pricePerAcre.toLocaleString()}`], ["Type", l.type]].map(([lbl, val]) => (
            <div key={lbl} style={s.metaItem}>
              <div style={s.metaLabel}>{lbl}</div>
              <div style={s.metaVal}>{val}</div>
            </div>
          ))}
        </div>

        <div style={s.aiSummaryBox}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div style={s.aiAvatar}>✦</div>
            <div style={{ fontWeight: 600, fontSize: 14, color: "#f1f5f9" }}>AI Property Analysis</div>
          </div>
          {l.loadingSummary ? (
            <div style={{ color: "#64748b", fontSize: 14 }}>Generating analysis<span style={{ animation: "pulse 1s infinite" }}>…</span></div>
          ) : (
            <div style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.7 }}>{l.aiSummary || l.scoreReason}</div>
          )}
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, color: "#64748b", marginBottom: 8, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>Description</div>
          <div style={{ fontSize: 15, color: "#94a3b8", lineHeight: 1.7 }}>{l.description}</div>
        </div>

        <div style={s.tagRow}>{l.tags.map(t => <span key={t} style={s.tag}>{t}</span>)}</div>

        <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
          <a href="#" style={s.sourceLink}>View on {l.source} ↗</a>
          <button style={{ ...s.viewBtn, padding: "10px 18px" }} onClick={() => toggleFavorite(l.id)}>
            {favorites.has(l.id) ? "♥ Saved" : "♡ Save"}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div style={s.app}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,700&family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: #08101e; } ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 3px; }
        textarea:focus, input:focus { border-color: rgba(52,211,153,0.4) !important; box-shadow: 0 0 0 3px rgba(52,211,153,0.06); }
      `}</style>

      <nav style={s.nav}>
        <div style={s.logo} onClick={() => setView("home")}>
          Property<span style={s.logoAccent}>Finder</span> <span style={{ fontSize: 12, color: "#475569", fontFamily: "DM Sans" }}>AI</span>
        </div>
        <div style={s.navLinks}>
          <button style={s.navBtn(view === "home")} onClick={() => setView("home")}>Search</button>
          {listings.length > 0 && <button style={s.navBtn(view === "results")} onClick={() => setView("results")}>Results <span style={{ background: "rgba(52,211,153,0.15)", color: "#34d399", borderRadius: 10, padding: "1px 7px", fontSize: 11, marginLeft: 4 }}>{listings.length}</span></button>}
          <button style={s.navBtn(view === "dashboard")} onClick={() => setView("dashboard")}>Dashboard</button>
        </div>
      </nav>

      {selectedListing ? <DetailView /> : view === "home" ? <HomeView /> : view === "results" ? <ResultsView /> : <DashboardView />}

      {showSaveModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
          <div style={{ background: "#0c1525", border: "1px solid #1e293b", borderRadius: 16, padding: 28, width: 420 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#f1f5f9", marginBottom: 6 }}>Save This Search</div>
            <div style={{ fontSize: 13, color: "#64748b", marginBottom: 16 }}>"{activeQuery.slice(0, 60)}…"</div>
            <input style={{ ...s.chatInput, width: "100%", marginBottom: 12 }} placeholder='Name this buy box e.g. "Hunting Land Deals"'
              value={saveName} onChange={e => setSaveName(e.target.value)} autoFocus />
            <div style={{ fontSize: 12, color: "#475569", marginBottom: 16 }}>You'll receive email alerts when new matching properties are listed.</div>
            <div style={{ display: "flex", gap: 10 }}>
              <button style={{ flex: 1, background: "linear-gradient(135deg,#34d399,#059669)", border: "none", borderRadius: 9, padding: "11px", color: "#fff", fontWeight: 700, cursor: "pointer" }} onClick={handleSaveSearch}>Save Search</button>
              <button style={{ background: "transparent", border: "1px solid #1e293b", color: "#94a3b8", borderRadius: 9, padding: "11px 18px", cursor: "pointer" }} onClick={() => setShowSaveModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}