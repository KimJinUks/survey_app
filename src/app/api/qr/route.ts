import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { surveyId, choiceId } = body;

    // 유효성 검사
    if (!surveyId || !choiceId) {
      return NextResponse.json(
        { error: "surveyId와 choiceId가 필요합니다." },
        { status: 400 }
      );
    }

    // 토큰 생성 (DB 없이 단순 UUID)
    const token = uuidv4();

    return NextResponse.json({
      url: `/s/${token}`,
    });
  } catch (error) {
    console.error("QR 토큰 생성 오류:", error);
    return NextResponse.json(
      { error: "토큰 생성 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
