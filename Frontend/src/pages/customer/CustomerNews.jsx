import { useState, useEffect } from "react";
import { FiGlobe, FiExternalLink, FiSearch, FiShield } from "react-icons/fi";

export default function CustomerNews() {
  const [news, setNews] = useState([]);
  const [filter, setFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  // Default fallback advisories
  const fallbackNews = [
    {
      id: "ADV-101",
      source: "RBI Advisory",
      title: "RBI cautions public against fake tax refund phishing schemes",
      description: "Scammers are impersonating tax authorities requesting bank verification and card details via fraudulent SMS links.",
      date: "19 Aug 2026",
      category: "Govt Notice",
      link: "https://rbi.org.in",
      severity: "Critical"
    },
    {
      id: "ADV-102",
      source: "CERT-In Alert",
      title: "Surge in malicious APK sideloading targeting Indian mobile banking apps",
      description: "Malware delivered via unsolicited message links extracts device OTPs and steals active session tokens.",
      date: "18 Aug 2026",
      category: "Cyber Alert",
      link: "https://cert-in.org.in",
      severity: "High"
    },
    {
      id: "ADV-103",
      source: "Cyber Crime Cell",
      title: "Beware of 'Digital Arrest' scams impersonating law enforcement officers",
      description: "Fraudsters initiate fake video calls claiming legal violations to extort money into 'safe verification' accounts.",
      date: "17 Aug 2026",
      category: "Scam Alert",
      link: "https://cybercrime.gov.in",
      severity: "Critical"
    }
  ];

  const fetchNews = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/news/advisories");
      if (res.ok) {
        const data = await res.json();
        setNews(data.length > 0 ? data : fallbackNews);
      } else {
        setNews(fallbackNews);
      }
    } catch (err) {
      console.warn("Backend news API unreachable, using fallback data:", err);
      setNews(fallbackNews);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();

    const interval = setInterval(() => {
      fetchNews();
    }, 30000);

    const ws = new WebSocket("ws://localhost:8000/ws/alerts");
    ws.onopen = () => setIsLive(true);
    ws.onmessage = (event) => {
      try {
        const alert = JSON.parse(event.data);
        const liveEvent = {
          id: `LIVE-${Date.now()}`,
          source: "Live Threat Feed",
          title: `ALERT: High volume of ${alert.t || "suspicious activity"} detected`,
          description: `Spike in fraudulent activity observed near ${alert.loc || "network"}. Stay vigilant against unexpected calls or links.`,
          date: alert.time || "Just now",
          category: "Scam Alert",
          link: "https://cybercrime.gov.in",
          severity: alert.level || "Critical"
        };
        setNews((prev) => [liveEvent, ...prev]);
      } catch (e) {
        console.error("Error parsing dynamic threat news event:", e);
      }
    };

    ws.onclose = () => setIsLive(false);

    return () => {
      clearInterval(interval);
      ws.close();
    };
  }, []);

  const categories = ["All", "Govt Notice", "Cyber Alert", "Scam Alert"];

  const filteredNews = news.filter((item) => {
    const matchesCategory = filter === "All" || item.category === filter;
    const matchesSearch =
      (item.title && item.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.source && item.source.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const getSeverityChip = (severity) => {
    if (severity === "Critical") return "chip-red";
    if (severity === "High") return "chip-orange";
    return "chip-blue";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary-dark flex items-center gap-2">
            <FiGlobe className="text-purple-600" /> Live Advisories & Banking News
          </h1>
          <p className="text-slate-500 text-sm">
            Real-time feed of government notices, RBI schemes, and emerging cyber threat warnings.
          </p>
        </div>

        <span
          className={`text-xs font-bold flex items-center gap-1.5 px-3 py-1 rounded-full border ${
            isLive
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-slate-100 text-slate-500 border-slate-200"
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isLive ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
            }`}
          />
          {isLive ? "LIVE FEED" : "SYNCED"}
        </span>
      </div>

      <div className="card !p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === cat
                  ? "bg-purple-700 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <FiSearch className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search live advisories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="card text-center py-8 text-slate-400 text-sm">
            Fetching real-time news feed...
          </div>
        ) : filteredNews.length === 0 ? (
          <div className="card text-center py-8 text-slate-500 text-sm">
            No live advisories match your filter criteria.
          </div>
        ) : (
          filteredNews.map((item) => (
            <div
              key={item.id}
              className="card !p-4 hover:border-purple-200 transition-all space-y-2 border-l-4 border-l-purple-600"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
                    <FiShield className="w-3 h-3" /> {item.source}
                  </span>
                  <span className="text-xs text-slate-400">{item.date}</span>
                </div>
                <span className={`chip ${getSeverityChip(item.severity)}`}>
                  {item.severity || "Notice"}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-primary-dark text-base">{item.title}</h3>
                <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs">
                <span className="text-slate-400 font-medium">Category: {item.category}</span>
                {item.link && (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noreferrer"
                    className="text-purple-700 font-semibold hover:underline flex items-center gap-1"
                  >
                    Read Official Notice <FiExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}