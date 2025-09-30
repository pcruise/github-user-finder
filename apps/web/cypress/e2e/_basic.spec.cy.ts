describe("Github User Finder E2E Test - basic", () => {
  beforeEach(() => {
    // 각 테스트가 실행되기 전에 메인 페이지를 방문합니다.
    cy.visit("http://localhost:3000");
  });

  // 초기 페이지
  it("should load the initial page correctly", () => {
    cy.contains("Github User Finder").should("be.visible");
    cy.get('input[placeholder="Search…"]').should("be.visible");
    cy.get("ul").children().should("have.length", 0);
  });

  // 검색어 입력 후 페이지, 모킹하지 않고 실제 API와 통신이 잘 작동하는지 확인합니다.
  it("should search for users and display results", () => {
    cy.get('input[placeholder="Search…"]').type("react");
    cy.get('[role="progressbar"]').should("be.visible");
    cy.contains("Found", { timeout: 3000 }).should("be.visible"); // API 응답 대기
    cy.get("ul").find("li").should("have.length.greaterThan", 0);
  });
});
