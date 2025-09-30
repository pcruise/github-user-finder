describe("Github User Finder E2E Test - Filter Functionality", () => {
  beforeEach(() => {
    // 각 테스트 실행 전 http://localhost:3000 페이지를 방문합니다.
    cy.visit("http://localhost:3000");

    // 초기 검색 API를 모킹합니다.
    cy.intercept("GET", "/api/find?q=react&sort=default&page=1", {
      fixture: "users.json",
    }).as("getUsersDefault");

    // 아바타 이미지를 모킹합니다.
    cy.intercept("GET", "https://avatars.githubusercontent.com/u/*", {
      fixture: "avatar.png",
    }).as("getAvatar");

    // 'react'를 검색하고 초기 결과가 표시될 때까지 기다립니다.
    cy.get('input[placeholder="Search…"]').type("react");
    cy.wait("@getUsersDefault");
    cy.contains("Found").should("be.visible");

    // 검색 옵션(필터) 패널을 엽니다.
    cy.get('button[aria-label="open filter drawer"]').click();
    cy.wait(200); // 애니메이션 대기
  });

  it("should apply a single filter and update results", () => {
    // 1. 'Organization' 필터 적용에 대한 API 요청을 모킹합니다.
    cy.intercept("GET", "/api/find?q=react+type%3Aorg&sort=default&page=1", {
      body: {
        total_count: 1,
        items: [
          {
            login: "react-org",
            id: 99,
            avatar_url: "https://avatars.githubusercontent.com/u/99",
            html_url: "https://github.com/react-org",
            type: "Organization",
          },
        ],
      },
    }).as("getOrgs");

    // 2. 계정 유형을 'Organization'으로 선택합니다.
    cy.get('input[value="org"]').click();

    // 3. 로딩 상태가 표시되고, 필터가 적용된 API를 호출하는지 확인합니다.
    cy.get('ul > li [role="progressbar"]').should("have.length.at.least", 1);
    cy.wait("@getOrgs");

    // 4. 'Organization' 유형의 사용자만 결과 목록에 표시되는지 확인합니다.
    cy.contains("react-org").should("be.visible");
    cy.contains("reactjs").should("not.exist"); // 초기 검색 결과(users.json)에 있던 사용자
  });

  it("should apply multiple filters and update results", () => {
    // 1. 다중 필터 적용에 대한 API 요청을 모킹합니다.
    cy.intercept(
      "GET",
      "/api/find?q=react+location%3ASeoul+language%3ATypeScript&sort=default&page=1",
      {
        body: {
          total_count: 1,
          items: [
            {
              login: "seoul-ts-dev",
              id: 100,
              avatar_url: "https://avatars.githubusercontent.com/u/100",
              html_url: "https://github.com/seoul-ts-dev",
              type: "User",
            },
          ],
        },
      }
    ).as("getMultiFilter");

    // 2. 위치에 'Seoul', 사용 언어에 'TypeScript'를 입력합니다.
    cy.get('input[placeholder="ex. Seoul"]').type("Seoul");
    cy.get('input[placeholder="ex. TypeScript"]').type("TypeScript");

    // 3. 로딩 상태가 표시되고, 필터가 적용된 API를 호출하는지 확인합니다.
    cy.get('ul > li [role="progressbar"]').should("have.length.at.least", 1);
    cy.wait("@getMultiFilter");

    // 4. 적용된 모든 필터 조건에 맞는 결과 목록이 나타나는지 확인합니다.
    cy.contains("seoul-ts-dev").should("be.visible");
  });

  it("should correctly reset filters and update results", () => {
    // 1. 필터 적용 및 해제에 따른 API 요청들을 모킹합니다.
    cy.intercept(
      "GET",
      "/api/find?q=react+type%3Auser+location%3ABusan&sort=default&page=1",
      {
        body: {
          total_count: 1,
          items: [
            {
              login: "busan-user",
              id: 101,
              avatar_url: "https://avatars.githubusercontent.com/u/99",
              html_url: "https://github.com/react-org",
              type: "User",
            },
          ],
        },
      }
    ).as("getFiltered");

    cy.intercept(
      "GET",
      "/api/find?q=react+location%3ABusan&sort=default&page=1",
      {
        body: {
          total_count: 1,
          items: [
            {
              login: "any-busan",
              id: 102,
              avatar_url: "https://avatars.githubusercontent.com/u/99",
              html_url: "https://github.com/react-org",
              type: "User",
            },
          ],
        },
      }
    ).as("getLocationOnly");

    // 2. 여러 필터를 적용합니다: 계정 유형 'User', 위치 'Busan'
    cy.get('input[value="user"]').click();
    cy.get('input[name="location"]').type("Busan");
    cy.wait("@getFiltered");
    cy.contains("busan-user").should("be.visible");

    // 3. 계정 유형 필터를 초기화('All' 선택)하고 결과가 갱신되는지 확인합니다.
    cy.get('input[value=""][type="radio"]').click();
    cy.wait("@getLocationOnly");
    cy.contains("any-busan").should("be.visible");
    cy.contains("busan-user").should("not.exist");

    // 4. 위치 필터를 초기화(텍스트 삭제)하고 결과가 갱신되는지 확인합니다.
    // 모든 필터가 해제되었으므로 초기 검색과 동일한 API(@getUsersDefault)가 호출됩니다.
    cy.get('input[name="location"]').clear();
    // 이미 검색한 페이지는 캐시 내용을 사용합니다.
    cy.wait(600); // 디바운스 및 API 갱신 대기
    cy.contains("reactjs").should("be.visible"); // 초기 검색 결과
    cy.contains("any-busan").should("not.exist");
  });
});
