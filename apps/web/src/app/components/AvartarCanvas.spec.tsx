/**
 * @jest-environment jsdom
 */
import { act, render, screen, waitFor } from "@testing-library/react";
import AvatarCanvas from "./AvartarCanvas";

// jsdom 환경에는 ImageData가 정의되어 있지 않으므로, 테스트를 위해 모의(mock) 객체를 생성합니다.
if (typeof ImageData === "undefined") {
  global.ImageData = class ImageData {
    data: Uint8ClampedArray;
    width: number;
    height: number;

    constructor(data: Uint8ClampedArray, width: number, height: number) {
      this.data = data;
      this.width = width;
      this.height = height;
    }
  } as unknown as typeof ImageData;
}

// WASM 모듈 모킹
const mockResizeAndMaskRgba = jest.fn();
jest.mock("@/pkg/thumbwasm.js", () => ({
  __esModule: true, // ES 모듈 모킹을 위해 필요
  resize_and_mask_rgba: (input: Uint8Array) => mockResizeAndMaskRgba(input),
}));

// Canvas API 모킹
const mockPutImageData = jest.fn();
const mockClearRect = jest.fn();
const mockSetTransform = jest.fn();

HTMLCanvasElement.prototype.getContext = jest.fn((contextId: string) => {
  if (contextId === "2d") {
    const mockContext = {
      putImageData: mockPutImageData,
      clearRect: mockClearRect,
      setTransform: mockSetTransform,
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return mockContext as any;
  }
  return null;
});

// fetch 모킹
global.fetch = jest.fn();
const mockFetch = fetch as jest.Mock;

describe("AvatarCanvas", () => {
  const imageUrl = "http://example.com/avatar.png";
  const mockImageData = new Uint8Array([1, 2, 3, 4]);

  beforeEach(() => {
    // 각 테스트 전에 모든 모의 함수를 초기화합니다.
    jest.clearAllMocks();

    // 성공적인 fetch 응답을 기본값으로 설정합니다.
    mockFetch.mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
    });

    // 성공적인 WASM 처리를 기본값으로 설정합니다.
    mockResizeAndMaskRgba.mockReturnValue(mockImageData);
  });

  it("should render a skeleton while loading", async () => {
    // render와 초기 비동기 작업(useEffect)을 act로 감쌉니다.
    await act(async () => {
      render(<AvatarCanvas imageUrl={imageUrl} />);
    });
    // 초기 렌더링 상태를 확인합니다.
    expect(screen.getByRole("img")).toBeInTheDocument();

    // 모든 비동기 작업이 완료될 때까지 기다려 act 경고를 방지합니다.
    await waitFor(() =>
      expect(screen.queryByRole("progressbar")).not.toBeInTheDocument()
    );
  });

  it("should apply the correct size from props", async () => {
    const testSize = 60;
    render(<AvatarCanvas imageUrl={imageUrl} size={testSize} />);

    const canvas = screen.getByRole("img");
    expect(canvas).toHaveStyle(`width: ${testSize}px`);
    expect(canvas).toHaveStyle(`height: ${testSize}px`);

    const skeleton = screen.getByRole("progressbar");
    // MUI Skeleton은 style prop을 직접 사용하지 않고, width/height prop을 통해 스타일을 적용합니다.
    // 여기서는 style을 직접 검사하기보다, 올바른 prop이 전달되었는지 확인하는 것이 더 정확할 수 있습니다.
    // 하지만 최종적으로 렌더링된 스타일을 확인하는 것도 유효합니다.
    expect(skeleton).toHaveStyle(`width: ${testSize}px`);
    expect(skeleton).toHaveStyle(`height: ${testSize}px`);

    // 모든 비동기 작업이 완료될 때까지 기다려 act 경고를 방지합니다.
    await waitFor(() =>
      expect(screen.queryByRole("progressbar")).not.toBeInTheDocument()
    );
  });

  it("should process and display the image on success", async () => {
    render(<AvatarCanvas imageUrl={imageUrl} />);

    // 비동기 작업(fetch, wasm)이 완료될 때까지 기다립니다.
    await waitFor(() => {
      // 로딩이 끝나면 스켈레톤이 사라지는지 확인합니다.
      expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    });

    // 1. fetch가 올바른 URL로 호출되었는지 확인합니다.
    expect(mockFetch).toHaveBeenCalledWith(imageUrl, { cache: "no-store" });

    // 2. WASM 함수가 호출되었는지 확인합니다.
    expect(mockResizeAndMaskRgba).toHaveBeenCalled();

    // 3. Canvas에 이미지가 그려졌는지 확인합니다.
    expect(mockSetTransform).toHaveBeenCalledWith(
      expect.any(Number),
      0,
      0,
      expect.any(Number),
      0,
      0
    );
    expect(mockClearRect).toHaveBeenCalledWith(0, 0, 40, 40);
    expect(mockPutImageData).toHaveBeenCalledWith(expect.any(ImageData), 0, 0);
  });

  it("should remain in loading state on fetch failure", async () => {
    // fetch가 실패하도록 모킹합니다.
    mockFetch.mockRejectedValue(new Error("Network error"));

    render(<AvatarCanvas imageUrl={imageUrl} />);

    // 비동기 작업이 실패로 끝날 때까지 기다립니다.
    await waitFor(() => {
      // fetch가 호출되었는지 확인합니다.
      expect(mockFetch).toHaveBeenCalled();
    });

    // WASM 함수는 호출되지 않아야 합니다.
    expect(mockResizeAndMaskRgba).not.toHaveBeenCalled();
    // Canvas에 그리기 함수도 호출되지 않아야 합니다.
    expect(mockPutImageData).not.toHaveBeenCalled();
    // 실패 후에도 로딩 스켈레톤이 계속 표시되는지 확인합니다.
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("should not cause memory leaks when unmounted during processing", async () => {
    // fetch가 즉시 resolve되지 않도록 Promise를 만듭니다.
    let resolveFetch: (value: Response | PromiseLike<Response>) => void;
    const fetchPromise = new Promise((resolve) => {
      resolveFetch = resolve;
    });
    mockFetch.mockReturnValue(fetchPromise);

    const { unmount } = render(<AvatarCanvas imageUrl={imageUrl} />);

    // 컴포넌트가 언마운트됩니다.
    unmount();

    // 언마운트된 후 fetch가 완료됩니다.
    await act(async () => {
      resolveFetch!({
        ok: true,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
      } as Response);
      // Promise가 resolve될 시간을 줍니다.
      await new Promise((r) => setTimeout(r, 0));
    });

    // 언마운트 후에는 WASM 함수나 Canvas API가 호출되지 않아야 합니다.
    expect(mockResizeAndMaskRgba).not.toHaveBeenCalled();
    expect(mockPutImageData).not.toHaveBeenCalled();
  });

  it("should handle imageUrl change during processing", async () => {
    const firstImageUrl = "http://example.com/first.png";
    const secondImageUrl = "http://example.com/second.png";

    // 첫 번째 fetch는 느리게, 두 번째는 빠르게 응답하도록 설정합니다.
    let resolveFirstFetch: (value: Response | PromiseLike<Response>) => void;
    const firstFetchPromise = new Promise<Response>((resolve) => {
      resolveFirstFetch = resolve;
    });

    mockFetch
      .mockImplementationOnce(() => firstFetchPromise)
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          arrayBuffer: () => Promise.resolve(new ArrayBuffer(16)), // 두 번째 이미지 데이터
        })
      );

    // 비동기 처리가 시작되기 전에 미리 모의 함수의 구현을 변경하여,
    // 두 번째 fetch의 결과(16바이트 버퍼)가 올바르게 putImageData로
    // 전달될 수 있도록 설정합니다.
    mockResizeAndMaskRgba.mockImplementation((input) => input);

    const { rerender } = render(<AvatarCanvas imageUrl={firstImageUrl} />);

    // 첫 번째 fetch가 호출되었는지 확인합니다.
    await waitFor(() =>
      expect(mockFetch).toHaveBeenCalledWith(firstImageUrl, expect.any(Object))
    );

    // 첫 번째 fetch가 완료되기 전에 imageUrl prop을 변경하여 리렌더링합니다.
    rerender(<AvatarCanvas imageUrl={secondImageUrl} />);

    // 두 번째 fetch가 호출되었는지 확인합니다.
    await waitFor(() =>
      expect(mockFetch).toHaveBeenCalledWith(secondImageUrl, expect.any(Object))
    );

    // 이제 느렸던 첫 번째 fetch를 완료시킵니다.
    await act(async () => {
      resolveFirstFetch!({
        ok: true,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)), // 첫 번째 이미지 데이터
      } as Response);
      await new Promise((r) => setTimeout(r, 0));
    });

    await waitFor(() => {
      // 최종적으로 Canvas에 그려진 이미지는 두 번째 이미지의 데이터여야 합니다.
      // WASM 함수가 두 번 호출될 수 있지만(하나는 abort됨), putImageData는 마지막 성공한 호출만 실행되어야 합니다.
      expect(mockPutImageData).toHaveBeenCalledTimes(1);
      const imageDataArg = mockPutImageData.mock.calls[0][0] as ImageData;
      // 두 번째 이미지 데이터(16바이트)로 생성된 ArrayBuffer를 사용했는지 확인합니다.
      // `new ImageData`는 `Uint8ClampedArray`를 받으므로, 그 내부 버퍼의 길이를 확인합니다.
      expect(imageDataArg.data.byteLength).toBe(16);
    });
  });
});
