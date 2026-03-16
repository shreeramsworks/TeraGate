"use client";

import React, { useState, useRef, useEffect } from "react";
import { Link2, DownloadCloud, Search, Loader2, AlertTriangle, X, FileText, HardDrive } from "lucide-react";
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

  const humanFileSize = (bytes) => {
    if (!bytes) return "Unknown Size";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    return (bytes / Math.pow(1024, i)).toFixed(2) + " " + sizes[i];
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
      const json = await res.json();

      if (res.status === 429) throw new Error("Slow down! Too many requests.");
      if (json.status !== "success" || !json.files?.[0]) throw new Error("Link not found.");

      const file = json.files[0];
      setData({
        name: file.filename,
        link: file.download_link,
        size: file.size || humanFileSize(file.size_bytes),
        thumb: file.thumbnails?.['850x580'] || file.thumbnails?.['360x270'] || Object.values(file.thumbnails || {})[0]
      });
    } catch (err) {
      setError(err.message || "Failed to process link.");
    } finally {
      setLoading(false);
    }
  };

  if (!isClient) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-fuchsia-500/30 flex flex-col items-center justify-center p-4 sm:p-8 md:p-12 relative overflow-hidden font-sans">
      {/* Dynamic SEO Structured Data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "TeraGet",
        "operatingSystem": "Web",
        "applicationCategory": "DownloadManager",
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
      })}} />

      {/* Background Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-fuchsia-600/10 blur-[150px] rounded-full" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-pink-600/10 blur-[150px] rounded-full" />

      <motion.div 
        className="w-full max-w-4xl z-10 space-y-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <header className="text-center space-y-6 flex flex-col items-center">
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
            className="w-24 h-24 md:w-32 md:h-32 mb-2 relative group"
          >
            <div className="absolute inset-0 bg-fuchsia-500 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
            <img 
              src="/logo.png" 
              alt="TeraGet Logo" 
              className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_15px_rgba(217,70,239,0.5)]" 
            />
          </motion.div>
          
          <div className="space-y-4">
            <motion.h1 
              className="text-5xl sm:text-7xl md:text-9xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-500 via-pink-500 to-rose-500"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              TeraGet
            </motion.h1>
            <p className="text-neutral-500 text-lg sm:text-xl font-medium tracking-[0.2em] uppercase">
              Instant Terabox Downloads
            </p>
          </div>
        </header>

        <section className="relative group w-full">
          <div className="absolute -inset-1 bg-gradient-to-r from-fuchsia-600/20 to-pink-600/20 rounded-[1.5rem] sm:rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition duration-1000" />
          <div className="relative bg-neutral-900/40 backdrop-blur-3xl border border-white/5 rounded-[1.5rem] sm:rounded-[2.5rem] p-2 sm:p-3 flex flex-col md:flex-row gap-2 sm:gap-3 shadow-2xl overflow-hidden">
            <div className="relative flex-1 flex items-center px-2 sm:px-4">
              <Link2 size={24} className="text-neutral-600 shrink-0 ml-1 sm:ml-2" />
              <input
                ref={inputRef}
                value={videoId}
                onChange={(e) => setVideoId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchMeta()}
                placeholder="Paste link here..."
                className="w-full bg-transparent border-none px-2 sm:px-4 py-4 sm:py-6 text-lg sm:text-xl outline-none placeholder:text-neutral-700 font-medium text-neutral-200"
              />
              {videoId && (
                <button onClick={() => setVideoId("")} className="p-2 text-neutral-600 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              )}
            </div>
            <button
              onClick={fetchMeta}
              disabled={loading}
              className="bg-white text-black hover:bg-fuchsia-500 hover:text-white px-8 sm:px-12 py-4 sm:py-6 rounded-[1rem] sm:rounded-[1.8rem] font-black text-lg sm:text-xl transition-all duration-500 flex items-center justify-center gap-3 whitespace-nowrap disabled:opacity-50 active:scale-95 shadow-xl"
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
                className="absolute top-full left-0 right-0 mt-6 flex items-center justify-center gap-3 text-rose-400 font-bold text-base bg-rose-500/5 py-4 rounded-[1.5rem] border border-rose-500/10 backdrop-blur-md"
              >
                <AlertTriangle size={20} /> {error}
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        <AnimatePresence>
          {data && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch"
            >
              {/* Thumbnail Container */}
              <div className="md:col-span-4 relative group">
                <div className="absolute -inset-1 bg-gradient-to-br from-fuchsia-600 to-pink-600 rounded-3xl blur opacity-20 group-hover:opacity-40 transition" />
                <div className="relative h-full aspect-video md:aspect-auto bg-neutral-900 rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
                   {data.thumb ? (
                     <img src={data.thumb} alt={data.name} className="w-full h-full object-cover" />
                   ) : (
                     <div className="w-full h-full flex flex-col items-center justify-center text-neutral-700 bg-neutral-900/50">
                       <FileText size={64} className="mb-4 opacity-20" />
                       <span className="font-bold text-sm tracking-widest uppercase opacity-40">No Preview</span>
                     </div>
                   )}
                </div>
              </div>

              {/* Info Container */}
              <div className="md:col-span-8 flex flex-col bg-neutral-900/40 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] p-8 md:p-10 shadow-2xl justify-between space-y-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                     <span className="text-[10px] font-black tracking-[0.3em] text-fuchsia-500 uppercase">File Name</span>
                     <h2 className="text-xl font-bold leading-relaxed text-neutral-200 break-words line-clamp-3">
                       {data.name}
                     </h2>
                  </div>

                  <div className="flex flex-wrap gap-4">
                    <div className="bg-white/5 px-6 py-4 rounded-2xl border border-white/5 flex items-center gap-4">
                      <HardDrive size={24} className="text-pink-500" />
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-neutral-500 tracking-wider uppercase">File Size</span>
                        <span className="text-xl font-black text-neutral-200 tracking-tight">{data.size}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <a
                    href={`/api/download?url=${encodeURIComponent(data.link)}&name=${encodeURIComponent(data.name)}`}
                    className="group relative inline-flex items-center justify-center gap-4 px-10 py-6 bg-white text-black rounded-[2rem] font-black text-2xl transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] overflow-hidden w-full shadow-2xl"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <DownloadCloud size={28} className="relative z-10 transition-transform group-hover:-translate-y-1" />
                    <span className="relative z-10 group-hover:text-white transition-colors duration-300">Download Video Now</span>
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <footer className="mt-24 text-neutral-700 text-[10px] font-black tracking-[0.4em] uppercase">
        © 2026 TeraGet Premium 
      </footer>
    </div>
  );
}
