# 사용한 AI Assistant - Google GEMINI code assist

# 프롬프트 입력 내용

- 이 함수에 jsdoc 스타일로 함수 주석을 작성해줘 (src/lib/createGithubApiResponse.ts 첨부)
- 이 Drawer에 넣을 검색 옵션 기능을 MUI 컴포넌트들을 사용해서 만들어 줘. 사이즈에 관한 스타일 태그는 tailwindcss를 이용한 버전으로, 색깔에 관한 스타일은 mui theme를 지원할 수 있는 styled 함수로 작성해줘
- 이 부분 Box의 tailwindcss로 입력한 색상을 mui palette에 연동될 수 있는 색상으로 바꿔줘 (page.tsx 첨부)
- 이 파일을 확인하고 jsdoc 스타일로 주석 작성해줘 (src/app/api/find/route.ts 첨부)
- 이 파일의 각 컴포넌트를 확인하고 주석이나 설명이 더 필요한 부분을 찾아서 jsdoc 스타일로 주석을 작성해줘 (src/app/components 폴더)
- 사용자 아바타 이미지 처리: HTML5 Canvas + WebAssembly 를 통해 랜더링 하라는 요구사항을 충족하기 위해 Rust로 wasm을 빌드해서 사용하고싶어. next.js 앱에서 이미지 url을 받은 상태에서, 해당 이미지를 40x40px 사이즈로 리사이즈하고, 원형으로 마스킹 해서 사용하려고 해. 필요한 rust 파일을 작성해주고 next.js앱에서 사용할 캔버스 컴포넌트까지 연결되게 작성해줘.
- 이 next.js 앱 API route 파일을 확인하고 jest를 사용한 테스트 코드를 \*.spec.ts 파일로 작성해줘.
- 여기 작성된 next.js 앱 API에 사용할 유틸리티 함수 파일을 확인하고 jest를 사용한 테스트 코드를 \*.spec.ts 파일로 작성해줘
- 이 react 컴포넌트 폴더를 확인하고 jest를 사용한 각 테스트 코드를 \*.spec.tsx 파일로 작성해줘. 최상단에 @jest-environment jsdom 주석으로 환경 설정해주고, 기본적으로 컴포넌트 렌더링 테스트를 포함해줘. (src/app/components 폴더)
- 여기 작성된 react-toolkit 테스트 파일을 확인하고 jsdoc 스타일로 주석 작성해줘 (githubUserFindApi.spec.tsx 첨부)
- 다음 cypress e2e 테스트를 search.spec.cy.ts 파일에 작성해줘
  \*. 검색결과는 users.json, 아바타 이미지는 avatar.png fixture를 사용하여 모킹한다.

1. 올바른 검색어를 입력한 후 / 로딩 스켈레톤 (role=progressbar) 출력 후 로딩이 완료되면 검색 결과 (UserCard들) 가 표시된다. 결과 헤더에는 알맞은 검색 결과 수가 표시된다 (Found ...)
2. 검색 결과가 없는 경우 - 검색결과가 없을 유효하지 않은 특수문자 (!,@, $) 를 문자열에 포함하여 입력 후 로딩 후 Found 0 user 메세지가 표시되고, 결과 목록이 비어있는지 확인한다.
3. 검색어를 확인 후 검색창의 텍스트를 모두 지운다. 검색창이 초기 상태로 돌아갔는지 확인한다.

- 다음 cypress e2e 테스트를 sort.spec.cy.ts 파일에 작성해줘

1. 초기 화면에서 정렬 기준을 변경해도 API를 호출하지 않는다.
2. 'react' 검색 후, 정렬 기준을 'Followers'로 변경한다. / 로딩 상태가 표시된 후, 팔로워 순으로 정렬된 새로운 결과 목록이 나타난다. 이후 정렬 기준을 'Repositories'로 변경한다. / 로딩 상태가 표시된 후, 레포지토리 개수 순으로 정렬된 새로운 결과 목록이 나타난다. (Follower와는 다른 검색 결과를 확인한다.)

- 다음 cypress e2e 테스트를 filter.spec.cy.ts 파일에 작성해줘
  \*. 초기 검색결과는 users.json, 아바타 이미지는 avatar.png fixture를 사용하여 모킹한다.

1. 'react' 검색 후, 검색 옵션에서 계정 유형을 'Organization'으로 선택한다. 로딩 후, 'Organization' 유형의 사용자만 결과 목록에 표시된다.
2. 'react' 검색 후, 위치에 'Seoul', 사용 언어에 'TypeScript'를 입력한다. 로딩 후, 적용된 모든 필터 조건에 맞는 결과 목록이 나타난다.
3. 여러 필터를 적용하여 검색한 후, 초기화 가능한 필터들을 모두 기본값으로 되돌린다. 필터가 해제될 때마다 결과 목록이 올바르게 갱신된다. 모든 필터가 해제되면 어떤 필터값도 없는 요청을 실행하는것을 확인한다.

- 다음 cypress e2e 테스트를 infiniteScroll.spec.cy.ts 파일에 작성해줘
  \*. 초기 검색결과는 users.json, 아바타 이미지는 avatar.png fixture를 사용하여 모킹한다.

1. 모킹된 검색 목록을 불러온 후, 페이지를 최하단으로 스크롤한다. / 페이지 하단에 도달하면 로딩 스켈레톤이 나타난다. 로딩 완료 후, 다음 페이지의 사용자 목록이 기존 목록 아래에 추가된다.
2. 모킹된 검색 목록을 불러온 후, 페이지를 최하단으로 스크롤한다. / 마지막 페이지에 도달하면 'END OF LIST'와 같은 표시가 나타난다. / 더 이상 스크롤해도 추가 로딩이 발생하지 않는다.
3. 검색 목록을 불러온 후, 첫 페이지가 마지막 페이지라면 'END OF LIST'와 같은 표시가 나타난다.
4. 검색 목록을 불러온 후, 0개의 유저를 검색했다면 'END OF LIST'와 같은 표시가 나타나지 않는다.

- 다음 cypress e2e 테스트를 alerts.spec.cy.ts 파일에 작성해줘
  \*. 초기 검색결과는 users.json, 아바타 이미지는 avatar.png fixture를 사용하여 모킹한다.

1. API 요청을 가로채 403 Forbidden 에러 응답을 시뮬레이션한다. / 에러 메시지, 에러 코드(403), rate-limit, 재시도(Retry) 버튼이 포함된 에러 알림창이 표시된다. 재시도 버튼을 클릭하면 API 요청이 다시 발생한다.
2. 첫 번째 요청은 정상적인 검색 결과를 출력하고, 최하단으로 스크롤 한 후 다음 페이지의 요청을 가로채 403 Forbidden 에러 응답을 시뮬레이션한다. / 에러 메시지, 에러 코드(403), rate-limit, 재시도(Retry) 버튼이 포함된 에러 알림창이 표시된다. 재시도 버튼을 클릭하면 API 요청이 다시 발생한다.

- 다음 cypress e2e 테스트를 ssr-csr.spec.cy.ts 파일에 작성해줘. SSR/CSR 경계 테스트를 할 수 있게 초기 서버 렌더링 결과물을 확인하고 클라이언트에서 hydration 테스트, 상호작용이 CSR에서 이루어지는지 (API 호출, UI 등), CSR에서 요청한 API 내용이 직접 Github API를 호출하지 않고 bff api를 거치는지 등을 확인할 수 있는 테스트를 작성해줘
- 이 프로젝트에 맞게 readme.md 파일 초안 작성해줘
