describe("Github User Finder E2E Test - Sort Functionality", () => {
  beforeEach(() => {
    // 각 테스트 실행 전 http://localhost:3000 페이지를 방문합니다.
    cy.visit("http://localhost:3000");
  });

  it("should not call API when changing sort option on initial screen", () => {
    // API 호출을 감시하기 위해 intercept를 설정하지만, 호출되지 않을 것을 예상합니다.
    cy.intercept("GET", "/api/find*").as("getUsers");

    // 정렬 드롭다운을 클릭하고 'Followers'를 선택합니다.
    cy.get("#find-sort-option").click();
    cy.get('li[data-value="followers"]').click();

    // API가 호출되지 않았는지 확인합니다.
    // UserListHeader 컴포넌트는 디바운싱(150ms)과 startTransition을 사용하므로
    // 약간의 대기 시간을 주어 의도치 않은 호출이 없는지 확실히 확인합니다.
    cy.wait(500); // 디바운스 및 상태 업데이트 시간보다 길게 대기
    cy.get("@getUsers.all").should("have.length", 0);
  });

  it("should re-fetch and display sorted results when sort option is changed after a search", () => {
    // 1. 초기 검색 및 정렬 옵션에 대한 API 요청을 모킹합니다.
    cy.intercept("GET", "/api/find?q=react*&sort=default*", {
      fixture: "users.json",
    }).as("getUsersDefault");

    cy.intercept("GET", "/api/find?q=react*&sort=followers*", {
      body: {
        total_count: 1,
        items: [
          {
            login: "follower-king",
            id: 1,
            avatar_url: "https://avatars.githubusercontent.com/u/1",
            html_url: "https://github.com/follower-king",
            type: "User",
          },
        ],
      },
    }).as("getUsersByFollowers");

    cy.intercept("GET", "/api/find?q=react*&sort=repositories*", {
      body: {
        total_count: 1,
        items: [
          {
            login: "repo-master",
            id: 2,
            avatar_url: "https://avatars.githubusercontent.com/u/2",
            html_url: "https://github.com/repo-master",
            type: "User",
          },
        ],
      },
    }).as("getUsersByRepos");

    // 아바타 이미지를 모킹합니다.
    cy.intercept("GET", "https://avatars.githubusercontent.com/u/*", {
      fixture: "avatar.png",
    }).as("getAvatar");

    // 2. 'react'를 검색하고 초기 결과가 표시될 때까지 기다립니다.
    cy.get('input[placeholder="Search…"]').type("react");
    cy.wait("@getUsersDefault");
    cy.contains("Found").should("be.visible");

    // 3. 정렬 기준을 'Followers'로 변경합니다.
    cy.get("#find-sort-option").click();
    cy.get('li[data-value="followers"]').click();

    // 4. 로딩 상태(스켈레톤)가 표시되고, 팔로워 순 정렬 API를 호출하는지 확인합니다.
    cy.get('ul > li [role="progressbar"]').should("have.length.at.least", 1);
    cy.wait("@getUsersByFollowers");

    // 5. 팔로워 순으로 정렬된 새로운 결과 목록이 나타나는지 확인합니다.
    cy.contains("follower-king").should("be.visible");
    cy.contains("repo-master").should("not.exist");

    // 6. 정렬 기준을 'Repositories'로 변경합니다.
    cy.get("#find-sort-option").click();
    cy.get('li[data-value="repositories"]').click();

    // 7. 로딩 상태가 표시되고, 레포지토리 순 정렬 API를 호출하는지 확인합니다.
    cy.get('ul > li [role="progressbar"]').should("have.length.at.least", 1);
    cy.wait("@getUsersByRepos");

    // 8. 레포지토리 순으로 정렬된 새로운 결과 목록이 나타나는지 확인합니다.
    cy.contains("repo-master").should("be.visible");
    cy.contains("follower-king").should("not.exist");
  });
});
