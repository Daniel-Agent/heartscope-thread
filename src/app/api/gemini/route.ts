import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { myBirth, myTime, otherBirth, otherTime } = await req.json();
  const apiKey = process.env.GEMINI_API_KEY;

  // 환경변수 로그
  if (apiKey) {
    console.log('[Gemini] API Key 일부:', apiKey.slice(0, 4) + '...' + apiKey.slice(-4));
  } else {
    console.log('[Gemini] API Key가 설정되어 있지 않습니다.');
  }

  if (!apiKey) {
    console.log('[Gemini] 500: API Key 없음');
    return NextResponse.json({ error: 'Gemini API Key가 설정되어 있지 않습니다.' }, { status: 500 });
  }

  // Gemini 프롬프트 생성 (말투 예시 참고)
  const prompt = `나의 생년월일: ${myBirth}, 태어난 시간: ${myTime}\n상대방 생년월일: ${otherBirth}, 태어난 시간: ${otherTime}\n이 두 사람이 재회할 가능성을 0~100% 확률로 수치화해서 한글로 알려줘. 그리고 현실적이고 따뜻한 조언, 친근한 말투로 두 문장 이내의 짧은 코멘트도 함께 제공해줘.\n아래는 말투 참고용 예시일 뿐이니, 참고만 하고 그대로 복사하지 마.\n- 운의 흐름은 있지만, 타이밍과 접근 방식이 중요할 것 같아!\n- 재회 가능성이 크진 않아. 먼저 연락을 하더라도 상대방 쪽에서 거절할 확률이 더 커보이네\n- 이번 달 내로 연락해보면 좋은 기회가 있어 보이는데? 대신 너무 성급하면 안돼!\n- 서로 얼굴 붉히지 않고 헤어졌다면 추억 회상 겸 연락해보는 것도 좋을 것 같아!\n- 상대방 쪽도 지금 고민하고 있어보여. 대신 너무 감정적으로 접근하면 실패할 가능성이 있어보이니 신중한 고민 끝에 연락해봐! 타이밍이 중요해!\n아래 형식의 JSON만 반환해. 설명이나 다른 문장은 절대 추가하지 마.\n{\"probability\": 숫자, \"comment\": \"코멘트\"}`;

  try {
    console.log('[Gemini] fetch 시작');
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro-preview-06-05:generateContent?key=' + apiKey, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gemini-2.5-pro-preview-06-05',
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });
    console.log('[Gemini] fetch 완료, status:', response.status);
    const data = await response.json();
    console.log('[Gemini] 전체 응답:', JSON.stringify(data, null, 2));
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    console.log('[Gemini] 원본 응답:', text);
    // 마크다운 코드블록에서 JSON 추출
    const codeBlockMatch = text.match(/```json\s*([\s\S]*?)\s*```/i);
    let jsonText = text;
    if (codeBlockMatch) {
      jsonText = codeBlockMatch[1];
    }
    try {
      const parsed = JSON.parse(jsonText);
      if (typeof parsed.probability !== 'undefined' && typeof parsed.comment === 'string') {
        console.log('[Gemini] JSON 파싱 성공:', parsed.probability, parsed.comment);
        return NextResponse.json({ probability: parsed.probability, comment: parsed.comment, raw: text });
      }
    } catch (err) {
      // 파싱 실패 시 아래로 진행
    }
    console.log('[Gemini] 파싱 실패, 원본만 반환');
    return NextResponse.json({ raw: text });
  } catch (err) {
    console.log('[Gemini] API 호출 실패', err);
    return NextResponse.json({ error: 'Gemini API 호출 실패', detail: String(err) }, { status: 500 });
  }
} 