import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 max-w-md w-full text-center border border-white/20">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-purple-500/20 flex items-center justify-center">
          <span className="text-5xl">🔍</span>
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-3">
          페이지를 찾을 수 없습니다
        </h1>
        
        <p className="text-purple-300/70 mb-8">
          요청하신 페이지가 존재하지 않거나 삭제되었습니다.
        </p>
        
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-xl transition-colors duration-200"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}

