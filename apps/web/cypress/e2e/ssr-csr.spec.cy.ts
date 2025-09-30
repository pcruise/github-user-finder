describe("Github User Finder E2E Test - SSR/CSR Boundary", () => {
  /**
   * 이 테스트는 초기 페이지 로드 시 서버로부터 완전한 HTML이 렌더링되는지 확인합니다.
   * `cy.request`를 사용하여 브라우저의 JavaScript 실행 없이 순수 HTML 응답을 가져옵니다.
   * 이를 통해 검색 엔진 크롤러나 JS가 비활성화된 사용자에게도 초기 콘텐츠가 보이는지 검증할 수 있습니다.
   */
  it("should receive server-rendered HTML on initial load", () => {
    cy.request("http://localhost:3000").then((response) => {
      // Cypress에 내장된 jQuery를 사용하여 HTML 문자열을 파싱하고 탐색합니다.
      // 이 방식은 Cypress 명령 큐를 사용하지 않고 동기적으로 작동하여 안정적입니다.
      const $html = Cypress.$(response.body);

      // 1. 주요 UI 요소가 HTML에 포함되어 있는지 확인합니다.
      const title = $html.find("div:contains('Github User Finder')");
      expect(title.length).to.be.greaterThan(0, "Title should exist");

      const searchInput = $html.find('input[placeholder="Search…"]');
      expect(searchInput.length).to.be.greaterThan(
        0,
        "Search input should exist"
      );

      // 2. 사용자 목록(ul)이 비어있는지 확인합니다.
      expect($html.find("ul").children().length).to.equal(
        0,
        "User list should be empty"
      );
    });
  });

  /**
   * 이 테스트는 서버에서 렌더링된 페이지가 클라이언트에서 성공적으로 '하이드레이션'되고,
   * 이후의 상호작용(검색)이 클라이언트 사이드 렌더링(CSR)으로 처리되는지 확인합니다.
   * 또한, CSR 중 발생하는 API 요청이 외부가 아닌 내부 BFF API를 호출하는지 검증합니다.
   */
  it("should hydrate on the client and handle interactions via CSR using BFF API", () => {
    // 1. 클라이언트에서 발생할 BFF API 요청을 모킹합니다.
    // 이를 통해 실제 Github API를 호출하지 않고 테스트를 격리합니다.
    cy.intercept("GET", "/api/find?q=nextjs-csr-test*", {
      fixture: "users.json",
    }).as("findUsersViaBff");

    // 2. 외부 Github API가 직접 호출되지 않는 것을 확인하기 위한 인터셉트를 설정합니다.
    // 이 요청이 발생하면 테스트는 실패합니다.
    cy.intercept("GET", "https://api.github.com/*", (req) => {
      // 이 요청이 발생하면 테스트를 실패시킵니다.
      throw new Error("Direct call to GitHub API is not allowed. Use BFF API.");
    }).as("githubApiCall");

    // 3. 페이지를 방문하여 SSR -> Hydration 과정을 트리거합니다.
    cy.visit("http://localhost:3000");

    // 4. 검색창에 텍스트를 입력하여 CSR 상호작용을 시작합니다.
    cy.get('input[placeholder="Search…"]').type("nextjs-csr-test");

    // 5. 로딩 상태(스켈레톤)가 표시되는지 확인하여 CSR이 진행 중임을 검증합니다.
    cy.get('[role="progressbar"]').should("be.visible");

    // 6. 모킹된 BFF API(@findUsersViaBff)가 호출되었는지 확인합니다.
    cy.wait("@findUsersViaBff");

    // 7. API 응답 후, 검색 결과가 페이지에 올바르게 렌더링되었는지 확인합니다.
    // 이는 전체 페이지 리로드 없이 UI가 업데이트되었음을 의미합니다.
    cy.contains("Found").should("be.visible");
    cy.get("ul").find("li").should("have.length.greaterThan", 0);

    // 8. 외부 API가 호출되지 않았음을 최종적으로 확인합니다.
    // `cy.wait(100)`을 통해 혹시 모를 비동기 호출을 기다린 후 검증합니다.
    cy.wait(100).then(() => {
      cy.get("@githubApiCall.all").should("have.length", 0);
    });
  });
});
