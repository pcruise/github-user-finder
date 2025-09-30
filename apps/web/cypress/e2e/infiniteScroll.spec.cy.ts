describe("Github User Finder E2E Test - Infinite Scroll Functionality", () => {
  beforeEach(() => {
    // 아바타 이미지를 모킹합니다.
    cy.intercept("GET", "https://avatars.githubusercontent.com/u/*", {
      fixture: "avatar.png",
    }).as("getAvatar");

    // 각 테스트 실행 전 http://localhost:3000 페이지를 방문합니다.
    cy.visit("http://localhost:3000");
  });

  it("should load next page on scroll to bottom", () => {
    // 1. 첫 페이지와 두 번째 페이지 API를 모킹합니다.
    // users.json의 total_count는 15000 이상이므로 다음 페이지가 존재합니다.
    cy.intercept("GET", "/api/find?q=react&sort=default&page=1", {
      fixture: "users.json",
    }).as("getUsersPage1");

    cy.intercept("GET", "/api/find?q=react&sort=default&page=2", {
      body: {
        total_count: 15000,
        items: [
          {
            login: "next-page-user",
            id: 999,
            avatar_url: "https://avatars.githubusercontent.com/u/999",
            html_url: "https://github.com/next-page-user",
            type: "User",
          },
        ],
      },
    }).as("getUsersPage2");

    // 2. 'react'를 검색하고 초기 결과가 표시될 때까지 기다립니다.
    cy.get('input[placeholder="Search…"]').type("react");
    cy.wait("@getUsersPage1");
    cy.get("ul").find("li").should("have.length.at.least", 1);

    // 3. 페이지를 최하단으로 스크롤합니다.
    cy.scrollTo("bottom");

    // 4. 로딩 스켈레톤이 나타나는지 확인합니다.
    cy.get('ul > li [role="progressbar"]').should("be.visible");

    // 5. 두 번째 페이지 API 응답을 기다립니다.
    cy.wait("@getUsersPage2");

    // 6. 다음 페이지의 사용자 목록이 기존 목록 아래에 추가되었는지 확인합니다.
    cy.contains("next-page-user").should("be.visible");
    cy.get("ul").find("li").should("have.length.greaterThan", 1);
    cy.get('ul > li [role="progressbar"]').should("not.exist");
  });

  it("should show 'END OF LIST' on the last page and not fetch more", () => {
    // 1. total_count를 31로 설정하여 두 번째 페이지가 마지막이 되도록 API를 모킹합니다.
    cy.intercept("GET", "/api/find?q=react&sort=default&page=1", {
      // total_count를 수정하여 마지막 페이지를 시뮬레이션
      body: { ...require("../fixtures/users.json"), total_count: 101 },
    }).as("getUsersPage1");

    cy.intercept("GET", "/api/find?q=react&sort=default&page=2", {
      body: {
        total_count: 101,
        items: [
          {
            login: "last-page-user",
            id: 998,
            avatar_url: "https://avatars.githubusercontent.com/u/998",
            html_url: "https://github.com/last-page-user",
            type: "User",
          },
        ],
      },
    }).as("getUsersPage2");

    // 2. 'react'를 검색하고 초기 결과가 표시될 때까지 기다립니다.
    cy.get('input[placeholder="Search…"]').type("react");
    cy.wait("@getUsersPage1");

    // 3. 페이지를 최하단으로 스크롤하여 마지막 페이지를 로드합니다.
    cy.scrollTo("bottom");
    cy.wait("@getUsersPage2");

    // 4. 마지막 페이지에 도달하면 'END OF LIST'가 표시되는지 확인합니다.
    cy.contains("END OF LIST").should("be.visible");

    // 5. 더 이상 스크롤해도 추가 로딩이 발생하지 않는지 확인합니다.
    // 추가 API 호출을 감시하기 위해 별칭을 재설정합니다.
    cy.intercept("GET", "/api/find?q=react&sort=default&page=3", {
      statusCode: 500,
    }).as("getUsersPage3");
    cy.scrollTo("bottom");
    cy.wait(500); // 잠재적인 네트워크 요청을 기다립니다.
    cy.get("@getUsersPage3.all").should("have.length", 0);
  });

  it("should show 'END OF LIST' if the first page is the last page", () => {
    // 1. total_count를 10으로 설정하여 첫 페이지가 마지막이 되도록 API를 모킹합니다.
    cy.intercept("GET", "/api/find?q=react&sort=default&page=1", {
      body: { ...require("../fixtures/users.json"), total_count: 10 },
    }).as("getSinglePage");

    // 2. 'react'를 검색하고 결과가 표시될 때까지 기다립니다.
    cy.get('input[placeholder="Search…"]').type("react");
    cy.wait("@getSinglePage");

    // 3. 'END OF LIST'가 즉시 표시되는지 확인합니다.
    cy.contains("END OF LIST").should("be.visible");
  });

  it("should not show 'END OF LIST' if there are no results", () => {
    // 1. 검색 결과가 0개인 API를 모킹합니다.
    cy.intercept("GET", "/api/find?q=no-results&sort=default&page=1", {
      body: {
        total_count: 0,
        items: [],
      },
    }).as("getNoResults");

    // 2. 검색을 수행합니다.
    cy.get('input[placeholder="Search…"]').type("no-results");
    cy.wait("@getNoResults");

    // 3. 'Found 0 users' 메시지는 표시되지만, 'END OF LIST'는 표시되지 않는지 확인합니다.
    cy.contains("Found 0 users").should("be.visible");
    cy.contains("END OF LIST").should("not.exist");
  });
});
