// 하드코딩된 설문 데이터 (추후 관리자 기능으로 확장 가능)
export const DEMO_SURVEY = {
  id: "demo",
  firstTitle: "가장 끌리는",
  title: " 사진을 골라 주세요.",
  choices: [
    {
      id: 1,
      label: "사진1",
      image: "/images/photoOne.png",
    },
    {
      id: 2,
      label: "사진2",
      image: "/images/photoTwo.png",
    },
    {
      id: 3,
      label: "사진3",
      image: "/images/photoThree.png",
    },
  ],
};

// 토큰 만료 시간 (24시간)
export const TOKEN_EXPIRY_HOURS = 24;
