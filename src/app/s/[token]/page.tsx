import { prisma } from "@/lib/prisma";
import { DEMO_SURVEY } from "@/lib/survey-data";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function ResponsePage({ params }: PageProps) {
  const { token } = await params;

  // 토큰 조회
  const qrToken = await prisma.qRToken.findUnique({
    where: { token },
    include: { response: true },
  });

  // 토큰이 없는 경우
  if (!qrToken) {
    notFound();
  }

  // 이미 사용된 토큰인 경우
  if (qrToken.used || qrToken.response) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-900 via-red-900 to-rose-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 max-w-md w-full text-center border border-white/20">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-amber-500/20 flex items-center justify-center">
            <svg className="w-10 h-10 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">이미 응답한 설문입니다</h1>
          <p className="text-white/70">이 QR 코드는 이미 사용되었습니다.</p>
        </div>
      </div>
    );
  }

  // 만료된 토큰인 경우
  if (new Date() > qrToken.expiresAt) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-zinc-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 max-w-md w-full text-center border border-white/20">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-500/20 flex items-center justify-center">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">만료된 설문입니다</h1>
          <p className="text-white/70">이 QR 코드의 유효 기간이 지났습니다.</p>
        </div>
      </div>
    );
  }

  // 응답 기록 및 토큰 사용 처리
  await prisma.$transaction([
    prisma.response.create({
      data: {
        tokenId: qrToken.id,
      },
    }),
    prisma.qRToken.update({
      where: { id: qrToken.id },
      data: { used: true },
    }),
  ]);

  // 선택한 항목 정보 가져오기
  const choice = DEMO_SURVEY.choices.find((c) => c.id === qrToken.choiceId);

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: `linear-gradient(135deg, ${choice?.color}40 0%, ${choice?.color}80 50%, ${choice?.color}40 100%)`,
      }}
    >
      <div className="bg-white/20 backdrop-blur-lg rounded-3xl p-8 max-w-md w-full text-center border border-white/30 shadow-2xl">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-white/30 flex items-center justify-center animate-bounce">
          <svg className="w-12 h-12 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-800 mb-3">응답 완료!</h1>
        
        <div className="bg-white/40 rounded-2xl p-6 mb-6">
          <p className="text-gray-600 text-sm mb-2">선택하신 항목</p>
          <p className="text-2xl font-bold" style={{ color: choice?.color }}>
            🌸 {choice?.label}
          </p>
        </div>
        
        <p className="text-gray-700">
          설문에 참여해 주셔서 감사합니다!
        </p>
        
        <div className="mt-8 pt-6 border-t border-white/30">
          <p className="text-xs text-gray-600">
            응답 시간: {new Date().toLocaleString("ko-KR")}
          </p>
        </div>
      </div>
    </div>
  );
}

