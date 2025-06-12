"use client";

import { useState } from "react";

export default function Home() {
  const [myBirth, setMyBirth] = useState("");
  const [myTime, setMyTime] = useState("");
  const [otherBirth, setOtherBirth] = useState("");
  const [otherTime, setOtherTime] = useState("");
  const [result, setResult] = useState<{ probability: number; comment: string; raw: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ myBirth, myTime, otherBirth, otherTime }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setResult(data);
      }
    } catch {
      setError("서버 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#e0e7ef] via-[#cfd9df] to-[#a1c4fd] text-[#23272f] p-4">
      <h1 className="text-4xl font-extrabold mb-10 tracking-tight drop-shadow-lg text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-500 to-pink-400 flex items-center gap-3 justify-center select-none">
        <span>💑</span>
        재회 성사 가능성
        <span className="inline-block w-2 h-2 rounded-full bg-pink-400 animate-pulse ml-2"></span>
      </h1>
      <form
        onSubmit={handleSubmit}
        className="bg-white/90 rounded-2xl p-8 flex flex-col gap-5 w-full max-w-md shadow-2xl border border-[#bfc9d1]/60"
        style={{ backdropFilter: 'blur(2px)' }}
      >
        <div className="flex flex-col gap-1">
          <label className="font-semibold mb-1 text-[#23272f]">본인 생년월일</label>
          <input
            type="date"
            value={myBirth}
            onChange={e => setMyBirth(e.target.value)}
            required
            className="rounded-lg px-3 py-2 bg-[#f4f7fa] text-[#23272f] font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400 transition border border-[#d1d5db]"
            placeholder="YYYY-MM-DD"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="font-semibold mb-1 text-[#23272f]">본인 태어난 시간</label>
          <input
            type="time"
            value={myTime}
            onChange={e => setMyTime(e.target.value)}
            required
            className="rounded-lg px-3 py-2 bg-[#f4f7fa] text-[#23272f] font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400 transition border border-[#d1d5db]"
            placeholder="HH:MM"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="font-semibold mb-1 text-[#23272f]">상대방 생년월일</label>
          <input
            type="date"
            value={otherBirth}
            onChange={e => setOtherBirth(e.target.value)}
            required
            className="rounded-lg px-3 py-2 bg-[#f4f7fa] text-[#23272f] font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400 transition border border-[#d1d5db]"
            placeholder="YYYY-MM-DD"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="font-semibold mb-1 text-[#23272f]">상대방 태어난 시간</label>
          <input
            type="time"
            value={otherTime}
            onChange={e => setOtherTime(e.target.value)}
            required
            className="rounded-lg px-3 py-2 bg-[#f4f7fa] text-[#23272f] font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400 transition border border-[#d1d5db]"
            placeholder="HH:MM"
          />
        </div>
        <button
          type="submit"
          className="mt-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 rounded-lg py-2 font-bold shadow-md transition-all duration-150 active:scale-95 disabled:opacity-60 text-white"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
              분석 중...
            </span>
          ) : "결과 보기"}
        </button>
      </form>
      {error && <div className="mt-6 text-red-500 font-semibold">{error}</div>}
      {result && result.probability !== undefined && result.comment && (
        <div className="mt-10 bg-white/90 rounded-2xl p-8 flex flex-col items-center gap-6 shadow-2xl border border-[#bfc9d1]/60 w-full max-w-md animate-fade-in">
          <div className="flex flex-col items-center gap-2">
            <span className="text-4xl">💌</span>
            <div className="text-xl font-bold mb-1 tracking-tight text-[#23272f]">재회 성사 가능성 결과</div>
          </div>
          <div className="text-lg text-center text-[#23272f] leading-relaxed" id="result-text">
            <span className="font-extrabold text-blue-500 text-2xl align-middle">{result.probability}%</span> &nbsp;{result.comment}
          </div>
          <button
            className="px-5 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 rounded-lg text-white font-bold text-base shadow-md transition-all duration-150 active:scale-95"
            onClick={() => {
              const text = `${result.probability}% ${result.comment}`;
              navigator.clipboard.writeText(text);
            }}
          >복사하기</button>
        </div>
      )}
    </div>
  );
}
