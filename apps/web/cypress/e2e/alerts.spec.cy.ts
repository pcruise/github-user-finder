describe("Github User Finder E2E Test - Alert Functionality", () => {
  beforeEach(() => {
    // 아바타 이미지를 모킹합니다.
    cy.intercept("GET", "https://avatars.githubusercontent.com/u/*", {
      fixture: "avatar.png",
    }).as("getAvatar");

    // 각 테스트 실행 전 http://localhost:3000 페이지를 방문합니다.
    cy.visit("http://localhost:3000");
  });

  it("should display an error alert on API failure and allow retry", () => {
    // 1. API 요청을 가로채 403 Forbidden 에러 응답을 시뮬레이션합니다.
    cy.intercept("GET", "/api/find?q=error-test&sort=default&page=1", {
      statusCode: 403,
      body: {
        status: 403,
        message: "API rate limit exceeded",
        rate_limit: "60",
        rate_limit_remaining: "0",
      },
    }).as("getUsersError");

    // 2. 검색을 수행합니다.
    cy.get('input[placeholder="Search…"]').type("error-test");
    cy.wait("@getUsersError");

    // 3. 에러 알림창이 올바른 내용과 함께 표시되는지 확인합니다.
    cy.get('[role="alert"]').should("be.visible");
    cy.contains("Error (403)").should("be.visible");
    cy.contains("API rate limit exceeded").should("be.visible");
    cy.contains("RateLimit 0/60").should("be.visible");
    cy.get('button:contains("Retry")').should("be.visible");

    // 4. 재시도 버튼을 클릭하면 API 요청이 다시 발생하는지 확인합니다.
    cy.get('button:contains("Retry")').click();
    cy.wait("@getUsersError");
    cy.get("@getUsersError.all").should("have.length", 2);
  });

  it("should display an error alert on infinite scroll failure and allow retry", () => {
    // 1. 첫 페이지는 정상 응답, 두 번째 페이지는 403 에러를 반환하도록 모킹합니다.
    cy.intercept("GET", "/api/find?q=scroll-error&sort=default&page=1", {
      fixture: "users.json", // total_count가 100 이상이라 다음 페이지가 존재
    }).as("getUsersPage1");

    cy.intercept("GET", "/api/find?q=scroll-error&sort=default&page=2", {
      statusCode: 403,
      body: {
        status: 403,
        message: "Failed to fetch next page",
        rate_limit: "60",
        rate_limit_remaining: "0",
      },
    }).as("getUsersPage2Error");

    // 2. 검색을 수행하고 첫 페이지가 로드될 때까지 기다립니다.
    cy.get('input[placeholder="Search…"]').type("scroll-error");
    cy.wait("@getUsersPage1");
    cy.get("ul").find("li").should("have.length.at.least", 1);

    // 3. 페이지를 최하단으로 스크롤하여 다음 페이지 로드를 트리거합니다.
    cy.scrollTo("bottom");
    cy.wait("@getUsersPage2Error");

    // 4. 에러 알림창이 표시되는지 확인합니다.
    cy.get('[role="alert"]').should("be.visible");
    cy.contains("Error (403)").should("be.visible");
    cy.contains("Failed to fetch next page").should("be.visible");
    cy.contains("RateLimit 0/60").should("be.visible");
    cy.get('button:contains("Retry")').should("be.visible");

    // 5. 재시도 버튼을 클릭하면 두 번째 페이지 API 요청이 다시 발생하는지 확인합니다.
    cy.get('button:contains("Retry")').click();
    cy.wait("@getUsersPage2Error");
    cy.get("@getUsersPage2Error.all").should("have.length", 2);
  });
});
