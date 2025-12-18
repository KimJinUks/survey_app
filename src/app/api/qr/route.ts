import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";
import { DEMO_SURVEY, TOKEN_EXPIRY_HOURS } from "@/lib/survey-data";

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

    if (choiceId < 1 || choiceId > 4) {
      return NextResponse.json(
        { error: "choiceId는 1~4 사이여야 합니다." },
        { status: 400 }
      );
    }

    // 설문이 존재하는지 확인 (demo 설문은 자동 생성)
    let survey = await prisma.survey.findUnique({
      where: { id: surveyId },
    });

    if (!survey && surveyId === "demo") {
      survey = await prisma.survey.create({
        data: {
          id: "demo",
          title: DEMO_SURVEY.title,
        },
      });
    }

    if (!survey) {
      return NextResponse.json(
        { error: "설문을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 토큰 생성
    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + TOKEN_EXPIRY_HOURS);

    await prisma.qRToken.create({
      data: {
        token,
        surveyId,
        choiceId,
        expiresAt,
      },
    });

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

