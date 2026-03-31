import { useState, useRef } from "react";

const SAMPLE_LISTINGS = [
  {
    id: "l1", title: "Rolling Timber Tract – Cleburne County", price: 485000, acres: 142,
    pricePerAcre: 3415, location: "Cleburne County, AL", distance: "1h 45m from Birmingham",
    type: "Hunting / Timber", source: "Land.com", sourceColor: "#2d7a4f",
    tags: ["Road Frontage", "Creek", "Timber", "Deer Stand"],
    description: "Prime hunting tract with mature hardwood timber, seasonal creek, established food plots, and county road frontage. Power available at road.",
    score: 94, scoreReason: "Matches acreage range, $185/acre under your max, road frontage confirmed, within 2hr radius.",
    img: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600&q=80",
    lat: 33.68, lng: -85.52,
  },
  {
    id: "l2", title: "Subdividable Pasture & Timber – Tallapoosa Co.", price: 612000, acres: 198,
    pricePerAcre: 3090, location: "Tallapoosa County, AL", distance: "1h 20m from Birmingham",
    type: "Recreational / Subdividable", source: "Zillow", sourceColor: "#0066cc",
    tags: ["Subdividable", "Road Frontage", "Utilities", "Open Pasture"],
    description: "Large subdividable parcel with highway frontage, water & power at road. Mix of open pasture and pine timber. Survey stakes in place.",
    score: 91, scoreReason: "In your target county, road frontage & utilities, well under $4k/acre, prime for subdivision.",
    img: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&q=80",
    lat: 32.87, lng: -85.77,
  },
  {
    id: "l3", title: "Remote Hunting Land – Randolph County", price: 310000, acres: 89,
    pricePerAcre: 3483, location: "Randolph County, AL", distance: "2h from Birmingham",
    type: "Hunting", source: "Crexi", sourceColor: "#d97706",
    tags: ["Hunting", "Creek", "Remote", "Cabin Site"],
    description: "Secluded hunting parcel with multiple ridge lines, creek bottom, natural springs, and an established cabin site. No road frontage.",
    score: 71, scoreReason: "Strong price per acre, great hunting features — but no road frontage and slightly under your 100-acre minimum.",
    img: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&q=80",
    lat: 33.42, lng: -85.25,
  },
  {
    id: "l4", title: "Commercial Woodland – Coosa County", price: 720000, acres: 210,
    pricePerAcre: 3428, location: "Coosa County, AL", distance: "1h 10m from Birmingham",
    type: "Timber / Investment", source: "LoopNet", sourceColor: "#6b46c1",
    tags: ["Timber", "Road Frontage", "Investment", "Merchantable Pine"],
    description: "Recently thinned pine plantation with merchantable timber value estimated at $1,800/acre. Two road access points, utilities nearby.",
    score: 86, scoreReason: "Within budget per acre, significant timber value offsets purchase price, excellent road access.",
    img: "https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=600&q=80",
    lat: 32.95, lng: -86.27,
  },
  {
    id: "l5", title: "Creek Bottom Hunting Tract – St. Clair Co.", price: 525000, acres: 155,
    pricePerAcre: 3387, location: "St. Clair County, AL", distance: "55m from Birmingham",
    type: "Hunting / Recreational", source: "Land.com", sourceColor: "#2d7a4f",
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
  const color = score >= 90 ? "#2d7a4f" : score >= 75 ? "#d97706" : "#dc2626";
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)", flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#374151" strokeWidth={4} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={4}
        strokeDasharray={`${fill} ${circ}`} strokeLinecap="round" style={{ transition: "stroke-dasharray 1s ease" }} />
      <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="central"
        fill={color} fontSize={size * 0.28} fontWeight="700" style={{ transform: "rotate(90deg)", transformOrigin: `${size/2}px ${size/2}px` }}>
        {score}
      </text>
    </svg>
  );
}

export default function App() {
  const [view, setView] = useState("home");
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

  const handleSearch = async (searchQuery) => {
    const searchQ = typeof searchQuery === 'string' ? searchQuery : query;
    if (!searchQ.trim()) return;
    setActiveQuery(searchQ);
    setLoading(true);
    setView("results");
    setStructuredFilters(null);
    setAiMessage("");
    setAiChat([]);

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

    await new Promise(r => setTimeout(r, 800));
    const mockResponses = [
      "The St. Clair County property offers the best value at $3,387/acre with excellent access. The creek bottom provides year-round water and attracts wildlife, making it ideal for hunting.",
      "I'd recommend the Cleburne County tract for timber value. The mature hardwoods provide immediate merchantable timber income while you hold the land for appreciation.",
      "For subdivision potential, the Tallapoosa property is your best bet. Highway frontage and existing utilities make it easy to develop 5-10 acre parcels."
    ];
    setAiChat(prev => [...prev, { role: "assistant", text: mockResponses[Math.floor(Math.random() * mockResponses.length)] }]);
    setAiLoading(false);
  };

  const getAiPropertySummary = async (listing) => {
    setSelectedListing({ ...listing, aiSummary: null, loadingSummary: true });
    await new Promise(r => setTimeout(r, 1200));
    const summary = `This ${listing.acres}-acre property represents strong value at $${listing.pricePerAcre.toLocaleString()}/acre. ${listing.tags.includes("Road Frontage") ? "Direct road access significantly enhances utility and resale value." : "Limited access may reduce liquidity but offers more privacy."} The ${listing.distance} makes this a practical distance for regular visits and management.`;
    setSelectedListing(prev => prev ? { ...prev, aiSummary: summary, loadingSummary: false } : null);
  };

  const sortedListings = [...listings]
    .filter(l => filterType === "All" || l.type.includes(filterType))
    .sort((a, b) => sortBy === "score" ? b.score - a.score : sortBy === "price" ? a.price - b.price : sortBy === "pricePerAcre" ? a.pricePerAcre - b.pricePerAcre : b.acres - a.acres);

  const favListings = SAMPLE_LISTINGS.filter(l => favorites.has(l.id));
  const types = ["All", ...new Set(SAMPLE_LISTINGS.map(l => l.type.split(" / ")[0]))];

  const s = {
    app: { fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", background: "#f8f7f4", minHeight: "100vh", color: "#1f2937" },
    nav: { background: "#ffffff", borderBottom: "1px solid #e5e7eb", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64, position: "sticky", top: 0, zIndex: 100, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" },
    logo: { fontFamily: "'Poppins', sans-serif", fontSize: 22, fontWeight: 700, color: "#1f2937", letterSpacing: "-0.5px", cursor: "pointer" },
    logoAccent: { color: "#2d7a4f" },
    navLinks: { display: "flex", gap: 8, alignItems: "center" },
    navBtn: (active) => ({ background: active ? "#f3f4f6" : "transparent", border: "none", color: active ? "#2d7a4f" : "#6b7280", padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 600, transition: "all 0.2s" }),
    hero: { minHeight: "calc(100vh - 64px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 24px", textAlign: "center", position: "relative", overflow: "hidden", background: "linear-gradient(to bottom, #ffffff 0%, #f8f7f4 100%)" },
    heroBg: { position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(45,122,79,0.08) 0%, transparent 60%)", pointerEvents: "none" },
    heroEyebrow: { fontSize: 13, fontWeight: 600, letterSpacing: 1.5, color: "#2d7a4f", textTransform: "uppercase", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 },
    heroTitle: { fontFamily: "'Poppins', sans-serif", fontSize: "clamp(42px,6vw,68px)", fontWeight: 700, lineHeight: 1.1, color: "#111827", marginBottom: 20, maxWidth: 720, letterSpacing: "-1.5px" },
    heroSub: { fontSize: 18, color: "#6b7280", marginBottom: 48, maxWidth: 560, lineHeight: 1.7, fontWeight: 400 },
    searchWrap: { width: "100%", maxWidth: 780, position: "relative", marginBottom: 20 },
    searchBox: { width: "100%", background: "#ffffff", border: "2px solid #e5e7eb", borderRadius: 14, padding: "18px 130px 18px 20px", fontSize: 16, color: "#1f2937", outline: "none", boxSizing: "border-box", transition: "all 0.2s", lineHeight: 1.5, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" },
    searchBtn: { position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "#2d7a4f", border: "none", borderRadius: 10, padding: "11px 24px", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 15, whiteSpace: "nowrap", transition: "all 0.2s" },
    examplePills: { display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", maxWidth: 780 },
    pill: { background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: 20, padding: "8px 16px", fontSize: 13, color: "#6b7280", cursor: "pointer", transition: "all 0.2s", fontWeight: 500 },
    resultLayout: { display: "grid", gridTemplateColumns: "280px 1fr", minHeight: "calc(100vh - 64px)", gap: 0 },
    sidebar: { background: "#ffffff", borderRight: "1px solid #e5e7eb", padding: 20, overflowY: "auto" },
    sidebarTitle: { fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: "#9ca3af", textTransform: "uppercase", marginBottom: 12 },
    filterBlock: { marginBottom: 24 },
    filterChip: (active) => ({ display: "inline-block", background: active ? "#ecf5f0" : "#f9fafb", border: `1px solid ${active ? "#2d7a4f" : "#e5e7eb"}`, color: active ? "#2d7a4f" : "#6b7280", borderRadius: 6, padding: "6px 12px", fontSize: 12, cursor: "pointer", margin: "2px 3px", transition: "all 0.2s", fontWeight: 500 }),
    mainArea: { padding: "28px 32px", overflowY: "auto", background: "#f8f7f4" },
    aiBar: { background: "linear-gradient(135deg, #ecf5f0, #f0fdf4)", border: "1px solid #d1e7dd", borderRadius: 12, padding: "16px 20px", marginBottom: 20, display: "flex", gap: 12, alignItems: "flex-start" },
    aiAvatar: { width: 36, height: 36, borderRadius: "50%", background: "#2d7a4f", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0, color: "#fff" },
    resultsHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
    sortSelect: { background: "#ffffff", border: "1px solid #e5e7eb", color: "#6b7280", borderRadius: 8, padding: "8px 14px", fontSize: 13, cursor: "pointer", fontWeight: 500 },
    card: { background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: 14, overflow: "hidden", marginBottom: 16, display: "grid", gridTemplateColumns: "220px 1fr", transition: "all 0.2s", cursor: "pointer", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" },
    cardImg: { width: "100%", height: "100%", objectFit: "cover", display: "block" },
    cardBody: { padding: 20 },
    cardMeta: { display: "flex", alignItems: "center", gap: 8, marginBottom: 8 },
    cardSource: (color) => ({ fontSize: 11, fontWeight: 700, color, background: color + "15", borderRadius: 6, padding: "3px 8px", letterSpacing: 0.3 }),
    cardTitle: { fontSize: 17, fontWeight: 600, color: "#111827", marginBottom: 6, lineHeight: 1.3 },
    cardLocation: { fontSize: 13, color: "#6b7280", marginBottom: 12, fontWeight: 500 },
    cardStats: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 14 },
    statBox: { background: "#f9fafb", borderRadius: 8, padding: "10px 12px", border: "1px solid #f3f4f6" },
    statVal: { fontSize: 16, fontWeight: 700, color: "#111827" },
    statLabel: { fontSize: 11, color: "#9ca3af", fontWeight: 500, marginTop: 2 },
    tagRow: { display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 },
    tag: { background: "#f3f4f6", borderRadius: 6, padding: "4px 10px", fontSize: 11, color: "#6b7280", fontWeight: 500 },
    cardFooter: { display: "flex", alignItems: "center", justifyContent: "space-between" },
    scoreWrap: { display: "flex", alignItems: "center", gap: 10 },
    scoreLabel: { fontSize: 12, color: "#6b7280" },
    favBtn: (active) => ({ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: active ? "#dc2626" : "#d1d5db", transition: "color 0.2s" }),
    viewBtn: { background: "#2d7a4f", border: "none", color: "#fff", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" },
    chatPanel: { background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: 12, marginTop: 20, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" },
    chatHeader: { padding: "14px 18px", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", gap: 10, background: "#fafafa" },
    chatMsgs: { padding: 18, maxHeight: 280, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12, background: "#fafafa" },
    chatMsg: (role) => ({ alignSelf: role === "user" ? "flex-end" : "flex-start", background: role === "user" ? "#ecf5f0" : "#ffffff", border: `1px solid ${role === "user" ? "#d1e7dd" : "#e5e7eb"}`, borderRadius: 12, padding: "12px 16px", maxWidth: "80%", fontSize: 14, color: "#1f2937", lineHeight: 1.6 }),
    chatInputRow: { padding: "12px 16px", borderTop: "1px solid #e5e7eb", display: "flex", gap: 10, background: "#ffffff" },
    chatInput: { flex: 1, background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: "10px 14px", fontSize: 14, color: "#1f2937", outline: "none" },
    sendBtn: { background: "#2d7a4f", border: "none", borderRadius: 8, padding: "10px 18px", color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 14, transition: "all 0.2s" },
    dashboard: { padding: 40, maxWidth: 1100, margin: "0 auto" },
    pageTitle: { fontFamily: "'Poppins', sans-serif", fontSize: 34, fontWeight: 700, color: "#111827", marginBottom: 6 },
    pageSub: { color: "#6b7280", fontSize: 16, marginBottom: 36 },
    statsRow: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 18, marginBottom: 36 },
    statCard: { background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: 14, padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" },
    statCardVal: { fontSize: 32, fontWeight: 700, color: "#111827", marginBottom: 6 },
    statCardLabel: { fontSize: 13, color: "#6b7280", fontWeight: 500 },
    section: { marginBottom: 36 },
    sectionHead: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 },
    sectionTitle: { fontSize: 18, fontWeight: 600, color: "#111827" },
    savedCard: { background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 20, marginBottom: 12, display: "flex", alignItems: "center", gap: 18, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" },
    savedDot: (active) => ({ width: 10, height: 10, borderRadius: "50%", background: active ? "#2d7a4f" : "#9ca3af", flexShrink: 0 }),
    savedName: { fontWeight: 600, color: "#111827", fontSize: 15 },
    savedQuery: { fontSize: 13, color: "#6b7280", marginTop: 3, fontStyle: "italic" },
    savedStats: { marginLeft: "auto", textAlign: "right", flexShrink: 0 },
    badge: { background: "#ecf5f0", color: "#2d7a4f", borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 600 },
    detailWrap: { maxWidth: 920, margin: "0 auto", padding: 36, background: "#f8f7f4" },
    detailImg: { width: "100%", height: 360, objectFit: "cover", borderRadius: 14, marginBottom: 28, border: "1px solid #e5e7eb", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" },
    detailTitle: { fontFamily: "'Poppins', sans-serif", fontSize: 30, fontWeight: 700, color: "#111827", marginBottom: 10 },
    detailMeta: { display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 28 },
    metaItem: { background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "12px 16px", fontSize: 14 },
    metaLabel: { color: "#9ca3af", fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" },
    metaVal: { color: "#111827", fontWeight: 700, fontSize: 18, marginTop: 4 },
    aiSummaryBox: { background: "linear-gradient(135deg, #ecf5f0, #f0fdf4)", border: "1px solid #d1e7dd", borderRadius: 12, padding: 24, marginBottom: 28 },
    backBtn: { background: "#ffffff", border: "1px solid #e5e7eb", color: "#6b7280", borderRadius: 8, padding: "10px 18px", cursor: "pointer", fontSize: 14, marginBottom: 24, fontWeight: 500 },
    sourceLink: { display: "inline-flex", alignItems: "center", gap: 8, background: "#2d7a4f", border: "none", borderRadius: 10, color: "#ffffff", padding: "12px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer", textDecoration: "none", transition: "all 0.2s" },
  };

  const HomeView = () => (
    <div style={s.hero}>
      <div style={s.heroBg} />
      <div style={{ ...s.heroEyebrow, position: "relative" }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#2d7a4f", display: "inline-block" }} />
        AI-POWERED LAND SEARCH
      </div>
      <h1 style={{ ...s.heroTitle, position: "relative" }}>
        Find Your Perfect Property<br />in <span style={{ color: "#2d7a4f" }}>Plain English</span>
      </h1>
      <p style={{ ...s.heroSub, position: "relative" }}>
        Describe exactly what you want. Our AI searches Zillow, Land.com, Crexi, LoopNet and more — then ranks every result by how well it matches you.
      </p>
      <div style={{ ...s.searchWrap, position: "relative" }}>
        <textarea
          ref={searchRef}
          style={{ ...s.searchBox, resize: "none", height: 90 }}
          placeholder="e.g. 'Find 50–200 acre hunting land within 2 hours of Birmingham under $4,000/acre'"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSearch(query); } }}
        />
        <button
          style={s.searchBtn}
          onClick={() => handleSearch(query)}
          onMouseEnter={e => e.target.style.background = "#256640"}
          onMouseLeave={e => e.target.style.background = "#2d7a4f"}
        >
          Search
        </button>
      </div>
      <div style={{ ...s.examplePills, position: "relative" }}>
        {EXAMPLE_QUERIES.map((q, i) => (
          <button
            key={i}
            style={s.pill}
            onClick={() => { setQuery(q); handleSearch(q); }}
            onMouseEnter={e => { e.target.style.borderColor = "#2d7a4f"; e.target.style.color = "#2d7a4f"; e.target.style.background = "#f9fafb"; }}
            onMouseLeave={e => { e.target.style.borderColor = "#e5e7eb"; e.target.style.color = "#6b7280"; e.target.style.background = "#ffffff"; }}
          >
            {q.length > 55 ? q.slice(0, 55) + "…" : q}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 48, marginTop: 64, position: "relative" }}>
        {[["5+", "Data Sources"], ["AI", "Match Score"], ["Real-Time", "Alerts"]].map(([val, lbl]) => (
          <div key={lbl} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: "#2d7a4f" }}>{val}</div>
            <div style={{ fontSize: 13, color: "#9ca3af", fontWeight: 500, marginTop: 4 }}>{lbl}</div>
          </div>
        ))}
      </div>
    </div>
  );

  const ResultsView = () => (
    <div style={s.resultLayout}>
      <div style={s.sidebar}>
        <div style={s.filterBlock}>
          <div style={s.sidebarTitle}>Search</div>
          <textarea
            style={{ ...s.searchBox, width: "100%", boxSizing: "border-box", resize: "none", height: 90, fontSize: 13, padding: "12px 14px" }}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSearch(query); } }}
          />
          <button
            style={{ ...s.searchBtn, position: "static", transform: "none", marginTop: 10, width: "100%", padding: "10px" }}
            onClick={() => handleSearch(query)}
          >
            Re-Search
          </button>
        </div>

        {structuredFilters && (
          <div style={s.filterBlock}>
            <div style={s.sidebarTitle}>Parsed Filters</div>
            {Object.entries(structuredFilters).map(([k, v]) => (
              <div key={k} style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 10, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 1, fontWeight: 600 }}>{k}</div>
                {Array.isArray(v)
                  ? <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 4 }}>{v.map(t => <span key={t} style={{ ...s.tag, background: "#ecf5f0", color: "#2d7a4f", border: "1px solid #d1e7dd" }}>{t}</span>)}</div>
                  : <div style={{ fontSize: 13, color: "#111827", marginTop: 3, fontWeight: 500 }}>{v}</div>}
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
            <div key={src} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#2d7a4f" }} />
              <span style={{ fontSize: 13, color: "#6b7280", fontWeight: 500 }}>{src}</span>
            </div>
          ))}
        </div>

        <button
          style={{ width: "100%", background: "#ecf5f0", border: "1px solid #d1e7dd", color: "#2d7a4f", borderRadius: 8, padding: "12px", cursor: "pointer", fontWeight: 600, fontSize: 14 }}
          onClick={() => setShowSaveModal(true)}
        >
          + Save This Search
        </button>
      </div>

      <div style={s.mainArea}>
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 400, gap: 18 }}>
            <div style={{ width: 52, height: 52, border: "4px solid #e5e7eb", borderTopColor: "#2d7a4f", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            <div style={{ color: "#6b7280", fontWeight: 500 }}>Searching 5 platforms with AI…</div>
          </div>
        ) : (
          <>
            {aiMessage && (
              <div style={s.aiBar}>
                <div style={s.aiAvatar}>AI</div>
                <div style={{ fontSize: 14, color: "#374151", lineHeight: 1.7 }}>{aiMessage}{aiTyping && <span style={{ opacity: 0.5 }}>|</span>}</div>
              </div>
            )}

            <div style={s.resultsHeader}>
              <div style={{ fontSize: 16, color: "#6b7280", fontWeight: 500 }}><span style={{ color: "#111827", fontWeight: 700 }}>{sortedListings.length}</span> properties found</div>
              <select style={s.sortSelect} value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="score">Sort: Best Match</option>
                <option value="price">Sort: Price Low to High</option>
                <option value="pricePerAcre">Sort: $/Acre Low to High</option>
                <option value="acres">Sort: Acreage High to Low</option>
              </select>
            </div>

            {sortedListings.map(l => (
              <div
                key={l.id}
                style={s.card}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)"; e.currentTarget.style.transform = "none"; }}
              >
                <img src={l.img} alt={l.title} style={s.cardImg} />
                <div style={s.cardBody}>
                  <div style={s.cardMeta}>
                    <span style={s.cardSource(l.sourceColor)}>{l.source}</span>
                    <span style={{ fontSize: 12, color: "#9ca3af", fontWeight: 500 }}>{l.type}</span>
                  </div>
                  <div style={s.cardTitle}>{l.title}</div>
                  <div style={s.cardLocation}>{l.location} • {l.distance}</div>
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
                        <div style={{ fontSize: 12, color: "#6b7280", fontWeight: 600 }}>AI Match</div>
                        <div style={{ fontSize: 11, color: "#9ca3af", maxWidth: 200, marginTop: 2 }}>{l.scoreReason.slice(0, 50)}…</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <button style={s.favBtn(favorites.has(l.id))} onClick={e => { e.stopPropagation(); toggleFavorite(l.id); }}>
                        {favorites.has(l.id) ? "♥" : "♡"}
                      </button>
                      <button
                        style={s.viewBtn}
                        onClick={() => getAiPropertySummary(l)}
                        onMouseEnter={e => e.target.style.background = "#256640"}
                        onMouseLeave={e => e.target.style.background = "#2d7a4f"}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div style={s.chatPanel}>
              <div style={s.chatHeader}>
                <div style={{ ...s.aiAvatar, width: 32, height: 32, fontSize: 14 }}>AI</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>Ask your AI assistant</div>
                <div style={{ fontSize: 12, color: "#9ca3af", marginLeft: "auto" }}>About these results</div>
              </div>
              <div style={s.chatMsgs}>
                {aiChat.length === 0 && <div style={{ fontSize: 13, color: "#9ca3af", textAlign: "center", padding: 20 }}>Ask anything about these properties — comparisons, negotiations, due diligence, investment analysis…</div>}
                {aiChat.map((m, i) => <div key={i} style={s.chatMsg(m.role)}>{m.text}</div>)}
                {aiLoading && <div style={s.chatMsg("assistant")}><em style={{ color: "#9ca3af" }}>Thinking…</em></div>}
              </div>
              <div style={s.chatInputRow}>
                <input
                  style={s.chatInput}
                  placeholder="Which property has the best ROI potential?"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && sendAiChat()}
                />
                <button
                  style={s.sendBtn}
                  onClick={sendAiChat}
                  onMouseEnter={e => e.target.style.background = "#256640"}
                  onMouseLeave={e => e.target.style.background = "#2d7a4f"}
                >
                  Send
                </button>
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
          <button style={{ background: "#ecf5f0", border: "1px solid #d1e7dd", color: "#2d7a4f", borderRadius: 8, padding: "8px 16px", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>+ New Search</button>
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
              <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 6 }}>Last: {ss.lastMatch}</div>
            </div>
            <button
              style={{ background: "#f3f4f6", border: "1px solid #e5e7eb", color: "#6b7280", borderRadius: 8, padding: "8px 14px", fontSize: 13, cursor: "pointer", marginLeft: 10, fontWeight: 600 }}
              onClick={() => { setQuery(ss.query); handleSearch(ss.query); }}
            >
              Run
            </button>
          </div>
        ))}
      </div>

      <div style={s.section}>
        <div style={s.sectionHead}><div style={s.sectionTitle}>Favorited Properties</div></div>
        {favListings.length === 0 && <div style={{ color: "#9ca3af", fontSize: 14 }}>No favorites yet. Click the heart on a listing to save it here.</div>}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {favListings.map(l => (
            <div
              key={l.id}
              style={{ background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden", cursor: "pointer", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
              onClick={() => getAiPropertySummary(l)}
            >
              <img src={l.img} alt={l.title} style={{ width: "100%", height: 150, objectFit: "cover" }} />
              <div style={{ padding: 16 }}>
                <div style={{ fontWeight: 600, color: "#111827", fontSize: 14, marginBottom: 6 }}>{l.title}</div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>{l.acres} ac • ${l.pricePerAcre.toLocaleString()}/ac</div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12 }}>
                  <ScoreRing score={l.score} size={38} />
                  <span style={{ fontSize: 12, color: "#6b7280", fontWeight: 500 }}>AI Match</span>
                  <button style={{ ...s.favBtn(true), marginLeft: "auto" }} onClick={e => { e.stopPropagation(); toggleFavorite(l.id); }}>♥</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={s.section}>
        <div style={s.sectionHead}><div style={s.sectionTitle}>Alert Settings</div></div>
        <div style={{ background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 24, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          {[["Email Alerts", "alerts@youremail.com", true], ["SMS Alerts", "+1 (205) 555-0147", false]].map(([label, val, active]) => (
            <div key={label}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#111827", marginBottom: 8 }}>{label}</div>
              <input style={{ ...s.chatInput, width: "100%", boxSizing: "border-box" }} defaultValue={val} />
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10 }}>
                <div style={{ width: 40, height: 22, borderRadius: 11, background: active ? "#2d7a4f" : "#e5e7eb", position: "relative", cursor: "pointer" }}>
                  <div style={{ width: 18, height: 18, background: "#fff", borderRadius: "50%", position: "absolute", top: 2, left: active ? 20 : 2, transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                </div>
                <span style={{ fontSize: 12, color: "#6b7280", fontWeight: 500 }}>{active ? "Enabled" : "Disabled"}</span>
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
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 20 }}>
          <div>
            <span style={s.cardSource(l.sourceColor)}>{l.source}</span>
            <h1 style={{ ...s.detailTitle, marginTop: 10 }}>{l.title}</h1>
            <div style={{ fontSize: 14, color: "#6b7280", fontWeight: 500 }}>{l.location} • {l.distance}</div>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <ScoreRing score={l.score} size={64} />
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
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <div style={s.aiAvatar}>AI</div>
            <div style={{ fontWeight: 600, fontSize: 15, color: "#111827" }}>AI Property Analysis</div>
          </div>
          {l.loadingSummary ? (
            <div style={{ color: "#6b7280", fontSize: 14 }}>Generating analysis…</div>
          ) : (
            <div style={{ fontSize: 14, color: "#374151", lineHeight: 1.7 }}>{l.aiSummary || l.scoreReason}</div>
          )}
        </div>

        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, color: "#9ca3af", marginBottom: 10, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>Description</div>
          <div style={{ fontSize: 15, color: "#374151", lineHeight: 1.7 }}>{l.description}</div>
        </div>

        <div style={s.tagRow}>{l.tags.map(t => <span key={t} style={s.tag}>{t}</span>)}</div>

        <div style={{ display: "flex", gap: 12, marginTop: 28 }}>
          <a
            href="#"
            style={s.sourceLink}
            onMouseEnter={e => e.target.style.background = "#256640"}
            onMouseLeave={e => e.target.style.background = "#2d7a4f"}
          >
            View on {l.source} →
          </a>
          <button
            style={{ ...s.viewBtn, padding: "12px 20px" }}
            onClick={() => toggleFavorite(l.id)}
            onMouseEnter={e => e.target.style.background = "#256640"}
            onMouseLeave={e => e.target.style.background = "#2d7a4f"}
          >
            {favorites.has(l.id) ? "♥ Saved" : "♡ Save"}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div style={s.app}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@600;700&family=Inter:wght@400;500;600;700&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 8px; } ::-webkit-scrollbar-track { background: #f3f4f6; } ::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
        textarea:focus, input:focus { border-color: #2d7a4f !important; box-shadow: 0 0 0 3px rgba(45,122,79,0.1); }
      `}</style>

      <nav style={s.nav}>
        <div style={s.logo} onClick={() => setView("home")}>
          RE<span style={s.logoAccent}>Finder</span>
        </div>
        <div style={s.navLinks}>
          <button style={s.navBtn(view === "home")} onClick={() => setView("home")}>Search</button>
          {listings.length > 0 && <button style={s.navBtn(view === "results")} onClick={() => setView("results")}>Results <span style={{ background: "#ecf5f0", color: "#2d7a4f", borderRadius: 12, padding: "2px 8px", fontSize: 11, marginLeft: 6, fontWeight: 700 }}>{listings.length}</span></button>}
          <button style={s.navBtn(view === "dashboard")} onClick={() => setView("dashboard")}>Dashboard</button>
        </div>
      </nav>

      {selectedListing ? <DetailView /> : view === "home" ? <HomeView /> : view === "results" ? <ResultsView /> : <DashboardView />}

      {showSaveModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
          <div style={{ background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: 16, padding: 32, width: 440, boxShadow: "0 20px 50px rgba(0,0,0,0.2)" }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#111827", marginBottom: 8 }}>Save This Search</div>
            <div style={{ fontSize: 14, color: "#6b7280", marginBottom: 20 }}>"{activeQuery.slice(0, 60)}…"</div>
            <input
              style={{ ...s.chatInput, width: "100%", marginBottom: 14, padding: "12px 16px", fontSize: 15 }}
              placeholder='Name this buy box e.g. "Hunting Land Deals"'
              value={saveName}
              onChange={e => setSaveName(e.target.value)}
              autoFocus
            />
            <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 20 }}>You'll receive email alerts when new matching properties are listed.</div>
            <div style={{ display: "flex", gap: 12 }}>
              <button
                style={{ flex: 1, background: "#2d7a4f", border: "none", borderRadius: 10, padding: "12px", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 15 }}
                onClick={handleSaveSearch}
              >
                Save Search
              </button>
              <button
                style={{ background: "#f3f4f6", border: "1px solid #e5e7eb", color: "#6b7280", borderRadius: 10, padding: "12px 20px", cursor: "pointer", fontWeight: 600 }}
                onClick={() => setShowSaveModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
