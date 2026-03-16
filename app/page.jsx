"use client";

import React, { useState, useRef, useEffect } from "react";
import { Link2, DownloadCloud, Search, Loader2, AlertTriangle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function TeraGet() {
  const [videoId, setVideoId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const extractId = (input) => {
    if (!input) return "";
    try {
      const trimmed = input.trim();
      const urlMatch = trimmed.match(
        /(?:https?:\/\/(?:www\.)?(?:terabox|terasharelink|terashare|1024tera|teraboxcdn)(?:\.(?:com|net|org|app|cn)))\/s\/([^/?#]+)/i
      );
      if (urlMatch && urlMatch[1]) return urlMatch[1];
      const genericMatch = trimmed.match(/\/s\/([^/?#]+)/i);
      if (genericMatch && genericMatch[1]) return genericMatch[1];
      return trimmed.replace(/\/+$/, "");
    } catch (e) {
      return input.trim();
    }
  };

  const fetchMeta = async () => {
    setError("");
    setData(null);

    const trimmed = videoId.trim();
    if (!trimmed) {
      setError("Please enter a link.");
      return;
    }

    const id = extractId(trimmed);
    if (!id) {
      setError("Invalid link format.");
      return;
    }

    const apiUrl = `/api/inspect?url=https://terabox.com/s/${encodeURIComponent(id)}`;

    try {
      setLoading(true);
      const res = await fetch(apiUrl);
      if (!res.ok) throw new Error("Connection error.");
      const json = await res.json();

      if (json.status !== "success" || !json.files?.[0]) throw new Error("Link not found.");

      setData({
        name: json.files[0].filename,
        link: json.files[0].download_link
      });
    } catch (err) {
      setError(err.message || "Failed to process link.");
    } finally {
      setLoading(false);
    }
  };

  if (!isClient) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-fuchsia-500/30 flex flex-col items-center justify-center p-6 sm:p-12 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-fuchsia-600/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-pink-600/20 blur-[120px] rounded-full" />

      <motion.div 
        className="w-full max-w-2xl z-10 space-y-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <header className="text-center space-y-4">
          <motion.h1 
            className="text-6xl sm:text-7xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-500 via-pink-500 to-rose-500"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
          >
            TeraGet
          </motion.h1>
          <p className="text-neutral-400 text-lg font-medium tracking-wide">
            Instant Terabox Downloads
          </p>
        </header>

        <section className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-fuchsia-600 to-pink-600 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
          <div className="relative bg-neutral-900/50 backdrop-blur-xl border border-white/5 rounded-3xl p-2 flex flex-col sm:flex-row gap-2 shadow-2xl">
            <div className="relative flex-1">
              <input
                ref={inputRef}
                value={videoId}
                onChange={(e) => setVideoId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchMeta()}
                placeholder="Paste your link here..."
                className="w-full bg-transparent border-none px-6 py-5 text-lg outline-none placeholder:text-neutral-600 font-medium"
              />
              {videoId && (
                <button onClick={() => setVideoId("")} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-neutral-500 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              )}
            </div>
            <button
              onClick={fetchMeta}
              disabled={loading}
              className="bg-white text-black hover:bg-fuchsia-500 hover:text-white px-8 py-5 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-black"
            >
              {loading ? <Loader2 className="animate-spin" size={24} /> : <DownloadCloud size={24} />}
              {loading ? "Processing..." : "Get Video"}
            </button>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute top-full left-0 right-0 mt-4 flex items-center justify-center gap-2 text-rose-400 font-bold text-sm bg-rose-500/10 py-3 rounded-2xl border border-rose-500/20"
              >
                <AlertTriangle size={16} /> {error}
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        <AnimatePresence>
          {data && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-neutral-900/50 backdrop-blur-xl border border-white/5 rounded-3xl p-8 text-center space-y-6 shadow-2xl"
            >
              <div className="space-y-2">
                <h2 className="text-xl font-bold line-clamp-1 text-neutral-200 px-4">
                  {data.name}
                </h2>
                <div className="h-1 w-24 bg-gradient-to-r from-fuchsia-600 to-pink-600 mx-auto rounded-full" />
              </div>

              <a
                href={data.link}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-3 px-10 py-6 bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white rounded-2xl font-black text-xl hover:shadow-[0_0_40px_rgba(217,70,239,0.3)] hover:scale-[1.02] transition-all duration-300 w-full"
              >
                <DownloadCloud size={28} />
                Download Video Now
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <footer className="mt-auto pt-16 text-neutral-600 text-sm font-medium tracking-widest uppercase">
        © 2026 TeraGet Premium
      </footer>
    </div>
  );
}
