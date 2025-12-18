interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function ResponsePage({ params }: PageProps) {
  const { token } = await params;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 flex items-center justify-center p-4">
      <div className="bg-white/20 backdrop-blur-lg rounded-3xl p-8 max-w-md w-full text-center border border-white/30 shadow-2xl">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-white/30 flex items-center justify-center animate-bounce">
          <svg className="w-12 h-12 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-3">응답 완료!</h1>
        
        <div className="bg-white/40 rounded-2xl p-6 mb-6">
          <p className="text-gray-700 text-lg font-semibold">
            설문에 참여해 주셔서 감사합니다!
          </p>
        </div>
        
        <p className="text-white/80 text-sm">
          참여가 정상적으로 기록되었습니다.
        </p>
        
        <div className="mt-8 pt-6 border-t border-white/30">
          <p className="text-xs text-white/60">
            토큰: {token.substring(0, 8)}...
          </p>
        </div>
      </div>
    </div>
  );
}
