describe("Github User Finder E2E Test - Search Functionality", () => {
  beforeEach(() => {
    // 각 테스트가 실행되기 전에 API 요청을 가로채도록 설정합니다.
    cy.intercept("GET", "/api/find?q=react*", {
      fixture: "users.json",
    }).as("getUsers");

    cy.intercept("GET", "https://avatars.githubusercontent.com/u/*", {
      fixture: "avatar.png",
    }).as("getAvatar");

    // 각 테스트가 실행되기 전에 메인 페이지를 방문합니다.
    cy.visit("http://localhost:3000");
  });

  it("should load the initial page correctly", () => {
    // 초기 페이지의 구성 요소들이 올바르게 표시되는지 확인합니다.
    cy.contains("Github User Finder").should("be.visible");
    cy.get('input[placeholder="Search…"]').should("be.visible");
    // 초기에는 사용자 목록이 비어있어야 합니다.
    cy.get("ul").children().should("have.length", 0);
  });

  it("should display results and count on successful search", () => {
    // 1. 올바른 검색어를 입력합니다.
    cy.get('input[placeholder="Search…"]').type("react");

    // 2. 로딩 스켈레톤이 표시되는지 확인합니다.
    // UserList 컴포넌트는 로딩 중 4개의 스켈레톤 카드를 표시합니다.
    cy.get('ul > li [role="progressbar"]').should("have.length.at.least", 1);

    // 3. API 응답(@getUsers)을 기다린 후, 검색 결과 헤더와 목록이 올바르게 표시되는지 확인합니다.
    cy.wait(["@getUsers", "@getAvatar"]).then((interceptions) => {
      const getUsersInterception = interceptions.find(
        (interception) => interception?.response?.body?.total_count ?? false
      );

      const total_count =
        getUsersInterception?.response?.body.total_count.toLocaleString();
      // fixture의 total_count 값을 사용하여 동적으로 결과 수를 검증합니다.
      cy.contains(`Found ${total_count} users`, { timeout: 0 }).should(
        "be.visible"
      );
    });
    cy.get("ul").find("li").should("have.length.greaterThan", 0);
    // 4. 로딩 스켈레톤이 사라졌는지 확인합니다.
    cy.get('ul > li [role="progressbar"]').should("not.exist");
  });

  it("should display a '0 users found' message for a search with no results", () => {
    // 1. 검색 결과가 없을 만한 특수문자를 포함한 검색어를 입력합니다.
    cy.get('input[placeholder="Search…"]').type("invalidsearch$#@!");

    // 2. 결과가 없는 응답을 모킹합니다.
    cy.intercept("GET", "/api/find?q=invalidsearch*", {
      total_count: 0,
      items: [],
    }).as("getNoResults");

    // 3. API 응답을 기다린 후, 'Found 0 users' 메시지가 표시되는지 확인합니다.
    cy.wait("@getNoResults");
    cy.contains("Found 0 users");
    // 3. 결과 목록이 비어있는지 확인합니다.
    cy.get("ul").children().should("have.length", 0);
  });

  it("should clear the results when the search input is cleared", () => {
    // 먼저 검색을 수행하여 결과가 있는 상태로 만듭니다.
    cy.get('input[placeholder="Search…"]').type("react");
    cy.wait("@getUsers");
    cy.contains("Found").and("be.visible");
    cy.get("ul").find("li").should("have.length.greaterThan", 0);
    // 검색창의 텍스트를 모두 지웁니다.
    cy.get('input[placeholder="Search…"]').clear();

    // 검색 결과가 사라지고 초기 상태로 돌아갔는지 확인합니다.
    cy.get("ul").children().should("have.length", 0);
    cy.contains("Found").should("not.exist");
  });
});
