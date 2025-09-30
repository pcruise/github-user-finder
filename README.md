# GitHub User Finder

GitHub 사용자를 검색하고 탐색할 수 있는 웹 애플리케이션입니다. Next.js, TypeScript, Turborepo를 기반으로 구축되었으며, GitHub API를 활용하여 사용자 검색, 필터링, 정렬 등 다양한 기능을 제공합니다.

## 주요 기능

- **사용자 검색**: 키워드를 통해 GitHub 사용자를 검색합니다.
- **상세 필터링**: 사용자 유형(User/Organization), 위치, 사용 언어 등 다양한 조건으로 검색 결과를 필터링할 수 있습니다.
- **결과 정렬**: 팔로워 수, 레포지토리 수, 가입 날짜를 기준으로 검색 결과를 정렬합니다.
- **무한 스크롤**: 스크롤을 내리면 다음 페이지의 검색 결과를 동적으로 로드하여 보여줍니다.
- **최적화된 이미지 처리**: Rust와 WebAssembly를 사용하여 사용자 아바타 이미지를 클라이언트 측에서 리사이징하고 원형으로 마스킹하여 렌더링 성능을 최적화했습니다.
- **BFF (Backend For Frontend)**: Next.js API Route를 BFF 패턴으로 활용하여 GitHub API와의 통신을 중계하고, API 토큰을 안전하게 관리합니다.
- **에러 핸들링**: GitHub API의 Rate Limit과 같은 예외 상황 발생 시 사용자에게 명확한 에러 메시지와 재시도 옵션을 제공합니다.
- **반응형 UI**: Material-UI(MUI)와 Tailwind CSS를 사용하여 다양한 화면 크기에 대응하는 반응형 인터페이스를 제공합니다.

## 기술 스택

- **프레임워크**: Next.js, React
- **언어**: TypeScript
- **상태 관리**: Redux Toolkit
- **UI**: Material-UI (MUI), Tailwind CSS
- **WebAssembly**: Rust, wasm-pack
- **테스팅**: Jest, React Testing Library, Cypress
- **모노레포**: Turborepo
- **패키지 매니저**: pnpm

## 주의점

- MUI와 Tailwind CSS를 혼용하고 있으므로, 각 라이브러리가다.- MUI와 Tailwind CSS를 함께 사용하므로, 각 라이브러리의 스타일링 역할을 구분하여 사용하는 것이 좋습니다.
  이 애플리케이션에서는 MUI가 주로 색상과 테마를, Tailwind CSS는 레이아웃, 크기, 여백 등을 담당합니다.

## 실행 및 테스트 방법

### 1. 사전 준비

- [Node.js](https://nodejs.org/en/) (v18.18.0 이상)
- [pnpm](https://pnpm.io/installation)
- [Rust 및 wasm-pack](https://rustwasm.github.io/wasm-pack/installer/) (optional)

### 2. 프로젝트 클론 및 의존성 설치

```bash
# 프로젝트 클론
git clone https://github.com/pcruise/github-user-finder.git
cd github-user-finder

# pnpm을 사용하여 의존성 설치
pnpm install
```

### 3. 환경 변수 설정

apps/web/ 디렉토리에 `.env` 파일을 생성하고 GitHub API 사용을 위한 Personal Access Token을 추가합니다. 이 토큰은 BFF에서 GitHub API 요청 시 인증에 사용됩니다.
토큰이 제공되지 않으면 적은 Rate-Limit이 적용됩니다.

```.env
GITHUB_TOKEN=your_github_personal_access_token
```

### 4. WebAssembly 모듈 빌드 (optional)

Rust로 작성된 이미지 처리 모듈을 WebAssembly로 빌드합니다.

```bash
# apps/web/wasm 디렉토리로 이동
cd apps/web/wasm

# wasm-pack을 사용하여 빌드
wasm-pack build --target web
```

### 5. 개발 서버 실행

프로젝트 루트 디렉토리에서 다음 명령어를 실행하여 개발 서버를 시작합니다.

```bash
pnpm dev
```

이제 브라우저에서 `http://localhost:3000`으로 접속하여 애플리케이션을 확인할 수 있습니다.

### 6. 운영 서버 실행

프로젝트 루트 디렉토리에서 다음 명령어를 실행하여 어플리케이션을 빌드합니다

```bash
pnpm build
```

이후, 프로젝트 루트 디렉토리에서 다음 명령어를 실행하여 어플리케이션을 실행합니다

```bash
pnpm start
```

이제 브라우저에서 `http://localhost:3000`으로 접속하여 애플리케이션을 확인할 수 있습니다.

## 테스트

### 유닛/통합 테스트 (Jest)

```bash
pnpm test
```

### E2E 테스트 (Cypress)

```bash
pnpm test:e2e
```
