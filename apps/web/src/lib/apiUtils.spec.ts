import {
  createGithubApiResponse,
  parseGithubUserSearchError,
} from "./apiUtils";
import { GithubUserSearchError } from "@/types/api";
import { SerializedError } from "@reduxjs/toolkit";

describe("apiUtils", () => {
  describe("createGithubApiResponse", () => {
    it("should handle a successful response correctly", async () => {
      const mockSuccessData = {
        total_count: 1,
        incomplete_results: false,
        items: [{ id: 1, login: "testuser" }],
      };
      const mockResponse = new Response(JSON.stringify(mockSuccessData), {
        status: 200,
        headers: {
          "x-ratelimit-limit": "60",
          "x-ratelimit-remaining": "59",
        },
      });

      const result = await createGithubApiResponse(mockResponse);

      expect(result).toEqual({
        ...mockSuccessData,
        status: 200,
        rate_limit: "60",
        rate_limit_remaining: "59",
      });
    });

    it("should handle a GitHub API error response correctly", async () => {
      const mockErrorData = {
        message: "API rate limit exceeded",
      };
      const mockResponse = new Response(JSON.stringify(mockErrorData), {
        status: 403,
        headers: {
          "x-ratelimit-limit": "60",
          "x-ratelimit-remaining": "0",
        },
      });

      const result = await createGithubApiResponse(mockResponse);

      expect(result).toEqual({
        status: 403,
        message: "API rate limit exceeded",
        rate_limit: "60",
        rate_limit_remaining: "0",
      });
    });

    it("should handle an unexpected server error", async () => {
      // An abnormal response without 'items' or 'message'
      const mockUnexpectedData = { foo: "bar" };
      const mockResponse = new Response(JSON.stringify(mockUnexpectedData), {
        status: 500,
        headers: {
          "x-ratelimit-limit": "60",
          "x-ratelimit-remaining": "30",
        },
      });

      const result = await createGithubApiResponse(mockResponse);

      expect(result).toEqual({
        status: 500,
        message: "An unexpected server error occurred.",
        rate_limit: "60",
        rate_limit_remaining: "30",
      });
    });

    it("should use default values for missing rate limit headers", async () => {
      const mockSuccessData = { items: [] };
      const mockResponse = new Response(JSON.stringify(mockSuccessData), {
        status: 200,
        headers: {}, // No headers
      });

      const result = await createGithubApiResponse(mockResponse);

      expect(result.rate_limit).toBe("-");
      expect(result.rate_limit_remaining).toBe("-");
    });
  });

  describe("parseGithubUserSearchError", () => {
    const DEFAULT_GITHUB_API_ERROR: GithubUserSearchError = {
      status: 500,
      message: "Unknown Error",
      rate_limit: "-",
      rate_limit_remaining: "-",
    };

    it("should return undefined if the error is undefined", () => {
      expect(parseGithubUserSearchError(undefined)).toBeUndefined();
    });

    it("should parse a valid SerializedError into a GithubUserSearchError", () => {
      const mockErrorData = {
        message: "Not Found",
        rate_limit: "60",
        rate_limit_remaining: "58",
      };
      // An error from RTK Query can have properties from both FetchBaseQueryError (`status`, `data`)
      // and SerializedError (`name`, `message`, etc.).
      // We use an intersection type for testing purposes.
      const mockRtkError: SerializedError & { status: number; data: unknown } =
        {
          name: "Error",
          message: "Request failed with status code 404",
          stack: "...",
          code: "404",
          status: 404,
          data: mockErrorData,
        };

      const result = parseGithubUserSearchError(mockRtkError);

      expect(result).toEqual({
        status: 404,
        message: "Not Found",
        rate_limit: "60",
        rate_limit_remaining: "58",
      });
    });

    it("should return the default error object when the 'data' property is missing", () => {
      // Since `status` is not in SerializedError, we extend the type for the test.
      const mockRtkError: Partial<SerializedError> & { status: number } = {
        status: 401,
        message: "Unauthorized",
      };

      const result = parseGithubUserSearchError(
        mockRtkError as SerializedError
      );
      expect(result).toEqual(DEFAULT_GITHUB_API_ERROR);
    });

    it("should return the default error object if the data object is missing required properties", () => {
      // Since `status` and `data` are not in SerializedError, we extend the type for the test.
      const mockRtkError: { status: number; data: unknown } = {
        status: 403,
        data: {
          // Missing message, rate_limit, etc.
          documentation_url: "...",
        },
      };

      const result = parseGithubUserSearchError(
        mockRtkError as SerializedError
      );
      expect(result).toEqual(DEFAULT_GITHUB_API_ERROR);
    });

    it("should replace null/undefined property values in the data object with default values", () => {
      // Define a test-specific type to avoid using 'as any'.
      const mockError: {
        status: number;
        data: { [key: string]: string | null | undefined };
      } = {
        status: 403,
        data: {
          message: undefined,
          rate_limit: null,
          rate_limit_remaining: undefined,
        },
      };

      // Cast to be compatible with the SerializedError type.
      const result = parseGithubUserSearchError(mockError as SerializedError);
      expect(result).toEqual({
        status: 403,
        message: DEFAULT_GITHUB_API_ERROR.message,
        rate_limit: DEFAULT_GITHUB_API_ERROR.rate_limit,
        rate_limit_remaining: DEFAULT_GITHUB_API_ERROR.rate_limit_remaining,
      });
    });
  });
});
