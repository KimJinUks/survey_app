"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { DEMO_SURVEY } from "@/lib/survey-data";

type ViewState = "selection" | "preview" | "qr";

export default function Home() {
  const [viewState, setViewState] = useState<ViewState>("selection");
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [smsQrValue, setSmsQrValue] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  // 전화번호 입력 팝업 관련 상태
  const [showPhonePopup, setShowPhonePopup] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const LONG_PRESS_DURATION = 800; // 0.8초

  // 브라우저 뒤로가기 방지 (preview와 qr 화면에서)
  useEffect(() => {
    // SSR 환경에서는 window가 없으므로 체크
    if (typeof window === "undefined") return;

    if (viewState === "preview" || viewState === "qr") {
      try {
        window.history.replaceState({ view: viewState, protected: true }, "");

        // iOS Safari 호환성을 위해 횟수 줄임
        for (let i = 0; i < 10; i++) {
          window.history.pushState({ view: viewState, index: i }, "");
        }

        const handlePopState = () => {
          try {
            window.history.pushState({ view: viewState, recovered: true }, "");
          } catch {
            // iOS에서 history 조작 실패 시 무시
          }
        };

        window.addEventListener("popstate", handlePopState);

        return () => {
          window.removeEventListener("popstate", handlePopState);
        };
      } catch (e) {
        // history API 사용 불가 시 무시
        console.warn("History API not available:", e);
      }
    }
  }, [viewState]);

  // 길게 터치 시작
  const handleLongPressStart = useCallback(() => {
    longPressTimer.current = setTimeout(() => {
      setShowPhonePopup(true);
    }, LONG_PRESS_DURATION);
  }, []);

  // 길게 터치 종료
  const handleLongPressEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  // 전화번호 저장
  const handleSavePhone = useCallback(() => {
    const cleanedNumber = phoneNumber.replace(/[^0-9]/g, "");
    if (cleanedNumber.length < 10) {
      alert("올바른 전화번호를 입력해주세요.");
      return;
    }
    setPhoneNumber(cleanedNumber);
    setShowPhonePopup(false);
  }, [phoneNumber]);

  // 이미지 선택 → 미리보기 화면으로
  const handleChoiceSelect = useCallback((choiceId: number) => {
    if (!phoneNumber) {
      alert("먼저 빈 공간을 길게 눌러 전화번호를 설정해주세요.");
      return;
    }
    setSelectedChoice(choiceId);
    setViewState("preview");
  }, [phoneNumber]);

  // 추첨하기 버튼 클릭 → QR 코드 생성
  const handleDrawLottery = useCallback(async () => {
    if (!selectedChoice) return;

    setIsLoading(true);

    try {
      const response = await fetch("/api/qr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          surveyId: "demo",
          choiceId: selectedChoice,
        }),
      });

      if (!response.ok) {
        throw new Error("QR 생성 실패");
      }

      const data = await response.json();

      const fullUrl = [
        "출판사 초점 입니다.",
        "투표가 정상적으로 기록 되었습니다.\n",
        "[투표 정보]",
        "• 투표번호 :",
        "• 이름 :",
        "• 나이 :"
      ].join('\n'); // 줄바꿈 포함, 배열로 관리하면 가독성이 좋아집니다.

      // iOS와 Android 모두 호환되는 SMS URL 형식
      // iOS: sms:번호&body=메시지
      // Android: sms:번호?body=메시지
      // 범용: sms:번호?&body=메시지
      const smsValue = `sms:${phoneNumber}?&body=${encodeURIComponent(fullUrl)}`;
      setSmsQrValue(smsValue);

      setViewState("qr");
    } catch (error) {
      console.error("오류:", error);
      alert("QR 코드 생성 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedChoice, phoneNumber]);

  // 뒤로가기 (preview → selection)
  const handleBackToSelection = useCallback(() => {
    setViewState("selection");
    setSelectedChoice(null);
  }, []);

  // 리셋 (qr → selection)
  const handleReset = useCallback(() => {
    setViewState("selection");
    setSelectedChoice(null);
    setSmsQrValue("");
  }, []);

  const selectedChoiceData = DEMO_SURVEY.choices.find(
    (c) => c.id === selectedChoice
  );

  const getSubtitle = () => {
    switch (viewState) {
      case "selection":
        return "마음에 드는 이미지를 선택하세요";
      case "preview":
        return "선택한 이미지를 확인하세요";
      case "qr":
        return "QR 코드를 스캔하세요";
    }
  };

  return (
    <main
      className="min-h-screen overflow-auto select-none bg-cover bg-center bg-no-repeat bg-fixed"
      style={{ backgroundImage: "url('/images/back.png')" }}
      onMouseDown={handleLongPressStart}
      onMouseUp={handleLongPressEnd}
      onMouseLeave={handleLongPressEnd}
      onTouchStart={handleLongPressStart}
      onTouchEnd={handleLongPressEnd}
    >

      {/* 전화번호 입력 팝업 */}
      {showPhonePopup && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowPhonePopup(false);
          }}
        >
          <div
            className="bg-white rounded-3xl p-6 max-w-sm w-full border border-gray-200 shadow-2xl"
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">전화번호 설정</h2>
                <p className="text-gray-500 text-sm">SMS 발송용 번호를 입력하세요</p>
              </div>
            </div>

            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="010-1234-5678"
              className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 text-lg placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-4 text-center tracking-wider"
              autoFocus
            />

            <div className="flex gap-3">
              <button
                onClick={() => setShowPhonePopup(false)}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-xl text-gray-600 font-medium transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSavePhone}
                className="flex-1 px-4 py-3 bg-purple-500 hover:bg-purple-600 rounded-xl text-white font-medium transition-colors"
              >
                저장
              </button>
            </div>

            {phoneNumber && (
              <p className="mt-4 text-center text-gray-400 text-xs">
                현재 설정: {phoneNumber}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="relative z-10 container mx-auto px-4 py-4 h-full flex flex-col">
        {/* Header */}
        <header className="text-center mb-4">
          <h1 className="text-4xl md:text-5xl font-black mb-3 tracking-tight" style={{ color: "#e65c00" }}>{DEMO_SURVEY.firstTitle}</h1>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-3 tracking-tight">
            {DEMO_SURVEY.title}
          </h1>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center">
          {viewState === "selection" && (
            /* Selection Grid */
            <div
              className="
                grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 max-w-2xl w-full place-items-center
              "
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
            >
              {DEMO_SURVEY.choices.map((choice, index) => {
                // 마지막 이미지라면 중앙정렬을 위한 조건
                const isLast =
                  index === DEMO_SURVEY.choices.length - 1 &&
                  DEMO_SURVEY.choices.length % 2 === 1;
                return (
                  <button
                    key={choice.id}
                    onClick={() => handleChoiceSelect(choice.id)}
                    disabled={isLoading}
                    className={
                      "group relative aspect-square rounded-2xl overflow-hidden transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-gray-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-purple-300 shadow-lg w-full" +
                      (isLast ? " sm:col-span-2 sm:justify-self-center" : "")
                    }
                    style={{
                      animationDelay: `${index * 100}ms`,
                      maxWidth: "320px",
                    }}
                  >
                    {/* Background Image */}
                    <img
                      src={choice.image}
                      alt={choice.label}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />

                    {/* Fallback gradient */}
                    <div
                      className="absolute inset-0 transition-opacity duration-300 -z-10"
                      style={{
                        background: "linear-gradient(135deg, #222 0%, #222 100%)",
                      }}
                    />

                    {/* Label */}
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/50 to-transparent p-4">
                      <span className="text-white text-xl md:text-2xl font-bold tracking-wide drop-shadow-lg">
                        {choice.label}
                      </span>
                    </div>

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300" />
                  </button>
                );
              })}
            </div>
          )}

          {viewState === "preview" && selectedChoiceData && (
            /* Preview Screen */
            <div
              className="max-w-lg w-full"
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
            >
              {/* Selected Image */}
              <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl mb-8">
                <img
                  src={selectedChoiceData.image}
                  alt={selectedChoiceData.label}
                  className="w-full h-full object-cover"
                />

                {/* Fallback gradient */}
                <div
                  className="absolute inset-0 -z-10"
                  style={{
                    background: `linear-gradient(135deg, ${selectedChoiceData.color} 0%, ${selectedChoiceData.color}99 100%)`,
                  }}
                />

                {/* Label overlay */}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-6">
                  <span className="text-white text-3xl md:text-4xl font-bold tracking-wide drop-shadow-lg">
                    {selectedChoiceData.label}
                  </span>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={handleBackToSelection}
                  className="flex-1 py-4 px-6 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-2xl text-gray-700 font-semibold text-lg transition-colors"
                >
                  다시 선택
                </button>
                <button
                  onClick={handleDrawLottery}
                  disabled={isLoading}
                  className="flex-1 py-4 px-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-2xl text-white font-semibold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      생성 중...
                    </span>
                  ) : (
                    "투표하기"
                  )}
                </button>
              </div>
            </div>
          )}

          {viewState === "qr" && (
            /* QR Code Display */
            <div
              className="bg-white rounded-3xl p-8 max-w-md w-full border border-gray-200 shadow-xl"
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
            >
              {/* Selected choice badge */}
              <div
                className="inline-flex items-center gap-3 px-4 py-2 rounded-full mb-6"
                style={{ backgroundColor: `${selectedChoiceData?.color}30` }}
              >
                <img
                  src={selectedChoiceData?.image}
                  alt={selectedChoiceData?.label}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <span className="text-gray-700 font-semibold">
                  {selectedChoiceData?.label}
                </span>
              </div>

              {/* QR Code */}
              <div
                ref={qrRef}
                className="bg-gray-50 rounded-2xl p-6 mb-6 flex items-center justify-center border border-gray-100"
              >
                <QRCodeCanvas
                  value={smsQrValue}
                  size={320}
                  level="H"
                  marginSize={2}
                  bgColor="#FAFAFA"
                  fgColor="#1f2937"
                />
              </div>

              {/* Reset button */}
              <div className="flex justify-center">
                <button
                  onClick={handleReset}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all duration-200 group"
                >
                  <svg
                    className="w-6 h-6 text-rose-600 group-hover:scale-110 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  <span className="text-rose-600 text-xs font-medium">
                    처음으로
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="text-center py-2">
          <div className="flex justify-center">
            <img
              src="/images/font.png"
              alt="Font Logo"
              className="h-12 max-w-xs object-contain"
              style={{ display: "block" }}
            />
          </div>
          <p className="text-gray-400 text-sm mt-2">
            © Focus Art Book And All Types Of Texts  •
          </p>
        </footer>
      </div>
    </main>
  );
}
