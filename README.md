# AllPays PG Dashboard (Frontend Assignment)

올페이즈 프론트엔드 채용 과제를 위한 **PG 대시보드 웹 애플리케이션**입니다.  
제공된 채용 전용 API를 사용하여 결제/가맹점 관련 데이터를 조회하고, 대시보드 형태로 시각화합니다.

---

## Tech Stack

- **Framework**: Next.js (App Router, React 18)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Data Fetching**: Native `fetch` API (서버 컴포넌트에서 직접 호출)
- **Build Tool**: Next.js 내장 빌드 시스템
- **Package Manager**: npm

---

## 실행 방법

프로젝트 클론 후 아래 명령어를 실행하면 됩니다.

```bash
npm install
npm run dev
```

## 환경 변수

API Base URL은 .env 파일을 통해 설정할 수 있습니다.
프로젝트 루트에 .env 파일을 생성하고 아래 내용을 추가합니다:

```env
NEXT_PUBLIC_API_BASE_URL=https://recruit.paysbypays.com/api/v1
```

---

## 폴더 구조 요약

```
app/
  layout.tsx            # 공통 레이아웃 (사이드바 + 헤더)
  page.tsx              # 루트(/) → /dashboard 리다이렉트
  dashboard/
    page.tsx            # 대시보드 화면
  transactions/
    page.tsx            # 거래 내역 리스트 + 페이지네이션
  merchants/
    page.tsx            # 가맹점 목록 + 페이지네이션
    [mchtCode]/
      page.tsx          # 가맹점 상세 페이지 (동적 라우트)
public/
  ...

```

---

## 디자인 의도

- 운영자(Admin) 환경에서 주로 사용하는 대시보드 특성을 고려해, 데이터 가독성 중심의 다크 테마 레이아웃을 구성했습니다.

- 주요 정보는 카드·테이블 위주로 배치하여 빠르게 스캔 가능한 구조를 만들고, 좌측 고정 네비게이션으로 페이지 간 이동 흐름을 단순화했습니다.

- Tailwind의 그리드와 반응형 브레이크포인트를 활용해 모바일·태블릿에서도 콘텐츠가 자연스럽게 재배치되도록 설계했습니다.
