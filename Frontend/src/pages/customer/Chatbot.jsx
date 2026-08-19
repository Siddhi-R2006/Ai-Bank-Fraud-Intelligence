import { useState, useRef, useEffect } from "react";
import { FiSend, FiCpu } from "react-icons/fi";

const QUICK = [
  "How do I report a fraud?",
  "What is UPI collect scam?",
  "How to block my debit card?",
  "Is this SMS a phishing attempt?",
];

export default function Chatbot() {
  const [msgs, setMsgs] = useState([
    {
      role: "bot",
      text: "Hi! I'm your AI banking assistant. Ask me anything about fraud or safe banking.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, loading]);

  async function send(text) {
    if (!text.trim() || loading) return;

    const query = text.trim();
    setMsgs((prev) => [...prev, { role: "user", text: query }]);
    setInput("");
    setLoading(true);

    try {
      const token = localStorage.getItem("authToken") || localStorage.getItem("token");

      const response = await fetch("http://localhost:8000/api/chatbot/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ message: query }),
      });

      if (!response.ok) {
        throw new Error(`Server status ${response.status}`);
      }

      const data = await response.json();
      setMsgs((prev) => [...prev, { role: "bot", text: data.response }]);
    } catch (error) {
      console.error("Chatbot Fetch Error:", error);
      setMsgs((prev) => [
        ...prev,
        {
          role: "bot",
          text: "Unable to reach backend server. Make sure main.py is running on port 8000.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-primary-dark">AI Banking Chatbot</h1>
        <p className="text-slate-500">
          Powered by intelligent banking risk intelligence and safe-banking guidelines.
        </p>
      </div>

      <div className="card !p-0 flex flex-col h-[65vh]">
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {msgs.map((m, i) => (
            <div
              key={i}
              className={`flex ${
                m.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                  m.role === "user"
                    ? "bg-primary text-white rounded-br-sm"
                    : "bg-slate-100 text-slate-800 rounded-bl-sm"
                }`}
              >
                {m.role === "bot" && (
                  <div className="text-[10px] uppercase text-primary flex items-center gap-1 mb-0.5">
                    <FiCpu /> ABFIS AI
                  </div>
                )}
                {m.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-100 text-slate-500 max-w-[80%] rounded-2xl px-4 py-2 text-xs flex items-center gap-2">
                <FiCpu className="animate-spin text-primary" /> Analyzing question...
              </div>
            </div>
          )}

          <div ref={endRef} />
        </div>

        <div className="border-t border-slate-100 p-3">
          <div className="flex gap-2 mb-2 flex-wrap">
            {QUICK.map((q) => (
              <button
                key={q}
                onClick={() => send(q)}
                disabled={loading}
                className="text-xs px-3 py-1 rounded-full bg-primary-light text-primary hover:bg-primary hover:text-white transition disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex gap-2"
          >
            <input
              className="input flex-1"
              placeholder="Ask a question…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <button className="btn-primary" type="submit" disabled={loading}>
              <FiSend />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}