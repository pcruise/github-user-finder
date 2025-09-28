/**
 * @jest-environment jsdom
 */
import {
  finderReducer,
  setFilterOption,
  setSearchString,
  setSortOption,
} from "./finderSlice";

describe("finderSlice", () => {
  const initialState = { searchString: "", sort: "default", filter: "" };

  it("should handle initial state", () => {
    // 아무 액션도 주어지지 않았을 때 초기 상태를 반환하는지 확인합니다.
    expect(finderReducer(undefined, { type: "unknown" })).toEqual(initialState);
  });

  describe("setSearchString reducer", () => {
    it("should handle setSearchString action", () => {
      const actual = finderReducer(initialState, setSearchString("test"));
      expect(actual.searchString).toEqual("test");
    });

    it("should handle empty string payload", () => {
      const stateWithSearch = { ...initialState, searchString: "previous" };
      const actual = finderReducer(stateWithSearch, setSearchString(""));
      expect(actual.searchString).toEqual("");
    });

    it("should handle nullish payload by setting to empty string", () => {
      const stateWithSearch = { ...initialState, searchString: "previous" };
      // @ts-expect-error: 테스트 목적으로 nullish 값을 전달합니다.
      const actual = finderReducer(stateWithSearch, setSearchString(null));
      expect(actual.searchString).toEqual("");
    });
  });

  describe("setSortOption reducer", () => {
    it("should handle setSortOption action", () => {
      const actual = finderReducer(initialState, setSortOption("followers"));
      expect(actual.sort).toEqual("followers");
    });

    it("should handle nullish payload by setting to 'default'", () => {
      const stateWithSort = { ...initialState, sort: "stars" };
      // @ts-expect-error: 테스트 목적으로 nullish 값을 전달합니다.
      const actual = finderReducer(stateWithSort, setSortOption(undefined));
      expect(actual.sort).toEqual("default");
    });
  });

  describe("setFilterOption reducer", () => {
    it("should handle setFilterOption action", () => {
      const actual = finderReducer(initialState, setFilterOption("type:user"));
      expect(actual.filter).toEqual("type:user");
    });

    it("should handle empty string payload", () => {
      const stateWithFilter = { ...initialState, filter: "type:user" };
      const actual = finderReducer(stateWithFilter, setFilterOption(""));
      expect(actual.filter).toEqual("");
    });

    it("should handle nullish payload by setting to empty string", () => {
      const stateWithFilter = { ...initialState, filter: "type:user" };
      // @ts-expect-error: 테스트 목적으로 nullish 값을 전달합니다.
      const actual = finderReducer(stateWithFilter, setFilterOption(null));
      expect(actual.filter).toEqual("");
    });
  });

  it("should not affect other state properties when one is updated", () => {
    const state = {
      searchString: "initialSearch",
      sort: "initialSort",
      filter: "initialFilter",
    };

    // searchString을 변경해도 sort와 filter는 그대로여야 합니다.
    let nextState = finderReducer(state, setSearchString("newSearch"));
    expect(nextState.searchString).toBe("newSearch");
    expect(nextState.sort).toBe("initialSort");
    expect(nextState.filter).toBe("initialFilter");

    // sort를 변경해도 searchString과 filter는 그대로여야 합니다.
    nextState = finderReducer(state, setSortOption("newSort"));
    expect(nextState.searchString).toBe("initialSearch");
    expect(nextState.sort).toBe("newSort");
    expect(nextState.filter).toBe("initialFilter");

    // filter를 변경해도 searchString과 sort는 그대로여야 합니다.
    nextState = finderReducer(state, setFilterOption("newFilter"));
    expect(nextState.searchString).toBe("initialSearch");
    expect(nextState.sort).toBe("initialSort");
    expect(nextState.filter).toBe("newFilter");
  });
});
