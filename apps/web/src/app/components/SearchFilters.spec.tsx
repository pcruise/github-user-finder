/**
 * @jest-environment jsdom
 */
import { setFilterOption } from "@/services/finderSlice";
import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { format } from "date-fns";
import { useDispatch } from "react-redux";
import SearchFilters from "./SearchFilters";

// Mock useDispatch
jest.mock("react-redux", () => ({
  // useDispatch 훅을 모킹합니다.
  ...jest.requireActual("react-redux"),
  useDispatch: jest.fn(),
}));

const mockDatePickerOnChange = jest.fn();
const mockSliderOnChange = jest.fn();

// 테스트 편의를 위해 DatePicker 상호작용을 단순화하여 모킹합니다.
jest.mock("@mui/x-date-pickers/DatePicker", () => ({
  DatePicker: jest.fn((props) => {
    const { value, label, onChange, slotProps, ...rest } = props; // slotProps를 props에서 추출하여 ...rest에 포함되지 않도록 합니다. (테스트에서 미사용)
    mockDatePickerOnChange(onChange); // onChange 함수를 외부 모의 함수에 등록
    return (
      <input
        data-testid={`date-picker-${label?.toLowerCase().replace(/\s/g, "-")}`}
        aria-label={label}
        value={value ? format(value, "yyyy-MM-dd") : ""}
        // 실제 input의 onChange는 테스트에서 직접 onChange prop을 호출하므로 사용되지 않습니다.
        // 하지만 완전성을 위해, 그리고 직접 input과 상호작용하는 테스트를 위해 남겨둡니다.
        onChange={(e) => {
          const date = e.target.value ? new Date(e.target.value) : null;
          onChange(date);
        }}
        {...rest}
      />
    );
  }),
}));

// 테스트 편의를 위해 Slider 상호작용을 단순화하여 모킹합니다.
jest.mock("@mui/material", () => ({
  ...jest.requireActual("@mui/material"),
  Slider: jest.fn((props) => {
    const { value, onChange, ...rest } = props;
    mockSliderOnChange(onChange); // onChange 함수를 외부 모의 함수에 등록
    return (
      <div
        data-testid={`mock-slider-${rest["aria-labelledby"] || rest["aria-label"]}`}
        role="slider"
        aria-label={rest["aria-label"]}
        aria-labelledby={rest["aria-labelledby"]}
        aria-valuenow={Array.isArray(value) ? value[0] : value}
        aria-valuetext={
          Array.isArray(value) ? `${value[0]} - ${value[1]}` : `${value}`
        }
        data-value={JSON.stringify(value)} // 단언(assertion)을 위해 현재 값을 저장합니다.
        // 테스트에서는 onChange prop을 직접 사용하지만, 상호작용 시뮬레이션을 위한 간단한 input입니다.
      >
        <input
          type="range"
          min={rest.min}
          max={rest.max}
          value={Array.isArray(value) ? value[0] : value}
          onChange={() => {
            // 이 onChange는 모의 input을 위한 것이며, 실제 Slider의 prop이 아닙니다.
            // 테스트에서는 prop으로 전달된 onChange를 직접 사용합니다.
          }}
          style={{ display: "none" }} // Hide this input as we're using data-onchange
        />
        {Array.isArray(value) ? `${value[0]} - ${value[1]}` : `${value}`}
      </div>
    );
  }),
}));

const mockUseDispatch = useDispatch as unknown as jest.Mock;
const mockDispatch = jest.fn();

describe("SearchFilters", () => {
  beforeEach(() => {
    mockUseDispatch.mockReturnValue(mockDispatch);
    jest.useFakeTimers(); // 디바운싱 테스트를 위해 가짜 타이머를 활성화합니다.
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers(); // 실제 타이머로 복원합니다.
  });

  it("should render correctly with default values and not dispatch on initial render", async () => {
    render(<SearchFilters />);

    expect(screen.getByText("Search Options")).toBeInTheDocument();

    // 기본 계정 유형: All
    expect(screen.getByLabelText("All")).toBeChecked();
    expect(screen.getByLabelText("User")).not.toBeChecked();
    expect(screen.getByLabelText("Organization")).not.toBeChecked();

    // 기본 검색 대상: 모두 선택 해제
    expect(screen.getByLabelText("User name")).not.toBeChecked();
    expect(screen.getByLabelText("Account name")).not.toBeChecked();
    expect(screen.getByLabelText("Email")).not.toBeChecked();

    // 기본 텍스트 필드: 비어있음
    expect(screen.getByPlaceholderText("ex. Seoul")).toHaveValue("");
    expect(screen.getByPlaceholderText("ex. TypeScript")).toHaveValue("");

    // 기본 날짜 선택기: 비어있음
    expect(screen.getByLabelText("From")).toHaveValue("");
    expect(screen.getByLabelText("To")).toHaveValue("");

    // 기본 슬라이더: 0 - 1000
    const repoSlider = screen.getByTestId(
      /mock-slider-repository-count-slider/i
    );
    expect(repoSlider).toHaveAttribute("data-value", "[0,1000]");
    const followerSlider = screen.getByTestId(
      /mock-slider-follower-count-slider/i
    );
    expect(followerSlider).toHaveAttribute("data-value", "[0,1000]");

    // 기본 후원 가능 여부: 꺼짐
    expect(screen.getByLabelText("Is Sponsorable")).not.toBeChecked();

    // Ensure no dispatch on initial render
    expect(mockDispatch).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(500); // 디바운스 시간만큼 타이머를 진행시킵니다.
    });
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it("should dispatch correct filter for Account Type after debounce", async () => {
    render(<SearchFilters />);

    fireEvent.click(screen.getByLabelText("User"));

    expect(mockDispatch).not.toHaveBeenCalled(); // 아직 디바운스되지 않았습니다.

    act(() => {
      jest.advanceTimersByTime(500); // 디바운스 시간만큼 타이머를 진행시킵니다.
    });

    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(mockDispatch).toHaveBeenCalledWith(setFilterOption("type:user"));
  });

  it("should dispatch correct filter for Search By (checkboxes) after debounce", async () => {
    render(<SearchFilters />);

    fireEvent.click(screen.getByLabelText("User name"));
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(mockDispatch).toHaveBeenCalledWith(setFilterOption("in:name"));
    mockDispatch.mockClear();

    fireEvent.click(screen.getByLabelText("Account name"));
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(mockDispatch).toHaveBeenCalledWith(
      setFilterOption("in:login in:name")
    );
    mockDispatch.mockClear();

    fireEvent.click(screen.getByLabelText("Email"));
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(mockDispatch).toHaveBeenCalledWith(
      setFilterOption("in:email in:login in:name")
    );
    mockDispatch.mockClear();

    // 하나를 선택 해제합니다.
    fireEvent.click(screen.getByLabelText("Account name"));
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(mockDispatch).toHaveBeenCalledWith(
      setFilterOption("in:email in:name")
    );
  });

  it("should dispatch correct filter for Location after debounce", async () => {
    render(<SearchFilters />);
    const locationInput = screen.getByPlaceholderText("ex. Seoul");

    await userEvent.type(locationInput, "Seoul", { delay: null });
    expect(mockDispatch).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(mockDispatch).toHaveBeenCalledWith(
      setFilterOption("location:Seoul")
    );
  });

  it("should dispatch correct filter for Language after debounce", async () => {
    render(<SearchFilters />);
    const languageInput = screen.getByPlaceholderText("ex. TypeScript");

    await userEvent.type(languageInput, "JavaScript", { delay: null });
    expect(mockDispatch).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(mockDispatch).toHaveBeenCalledWith(
      setFilterOption("language:JavaScript")
    );
  });

  it("should dispatch correct filter for Join date (From) after debounce", async () => {
    render(<SearchFilters />);
    // 렌더링 후 모의 함수 호출 기록에서 onChange 함수를 가져옵니다.
    const onChangeFrom = mockDatePickerOnChange.mock.calls[0][0];

    const testDate = new Date("2023-01-01T00:00:00.000Z");
    act(() => {
      onChangeFrom(testDate);
    });

    expect(mockDispatch).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(mockDispatch).toHaveBeenCalledWith(
      setFilterOption("created:>=2023-01-01")
    );
  });

  it("should dispatch correct filter for Join date (To) after debounce", async () => {
    render(<SearchFilters />);
    // 렌더링 후 모의 함수 호출 기록에서 onChange 함수를 가져옵니다.
    const onChangeTo = mockDatePickerOnChange.mock.calls[1][0];

    const testDate = new Date("2023-12-31T00:00:00.000Z");
    act(() => {
      onChangeTo(testDate);
    });

    expect(mockDispatch).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(mockDispatch).toHaveBeenCalledWith(
      setFilterOption("created:<=2023-12-31")
    );
  });

  it("should dispatch correct filter for Join date (From and To) after debounce", async () => {
    render(<SearchFilters />);
    // DatePicker들의 onChange 함수를 모의 함수 호출 기록에서 가져옵니다.
    const onChangeFrom = mockDatePickerOnChange.mock.calls[0][0];
    const onChangeTo = mockDatePickerOnChange.mock.calls[1][0];

    const fromDate = new Date("2023-01-01T00:00:00.000Z");
    const toDate = new Date("2023-12-31T00:00:00.000Z");

    act(() => {
      onChangeFrom(fromDate);
      onChangeTo(toDate);
    });

    expect(mockDispatch).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(mockDispatch).toHaveBeenCalledWith(
      setFilterOption("created:2023-01-01..2023-12-31")
    );
  });

  it("should dispatch correct filter for Repo Count slider after debounce", async () => {
    render(<SearchFilters />);
    // Repositories Slider의 onChange 함수를 모의 함수 호출 기록에서 가져옵니다.
    const onChange = mockSliderOnChange.mock.calls[0][0];

    act(() => {
      onChange(null, [10, 500]); // 슬라이더 값 변경을 시뮬레이션합니다.
    });

    expect(mockDispatch).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(mockDispatch).toHaveBeenCalledWith(setFilterOption("repos:10..500"));
  });

  it("should dispatch correct filter for Follower Count slider after debounce", async () => {
    render(<SearchFilters />);
    // Followers Slider의 onChange 함수를 모의 함수 호출 기록에서 가져옵니다. (Repo Slider 다음이므로 index 1)
    const onChange = mockSliderOnChange.mock.calls[1][0];

    act(() => {
      onChange(null, [100, 700]); // 슬라이더 값 변경을 시뮬레이션합니다.
    });

    expect(mockDispatch).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(mockDispatch).toHaveBeenCalledWith(
      setFilterOption("followers:100..700")
    );
  });

  it("should dispatch correct filter for Sponsorable switch after debounce", async () => {
    render(<SearchFilters />);
    const sponsorableSwitch = screen.getByLabelText("Is Sponsorable");

    fireEvent.click(sponsorableSwitch);
    expect(mockDispatch).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(mockDispatch).toHaveBeenCalledWith(
      setFilterOption("is:sponsorable")
    );
  });

  it("should combine multiple filters correctly", async () => {
    render(<SearchFilters />);

    // 계정 유형
    fireEvent.click(screen.getByLabelText("User"));
    // 검색 대상
    fireEvent.click(screen.getByLabelText("User name"));
    // 위치
    await userEvent.type(screen.getByPlaceholderText("ex. Seoul"), "Busan", {
      delay: null,
    });
    // 후원 가능 여부
    fireEvent.click(screen.getByLabelText("Is Sponsorable"));

    // 모든 변경사항에 대해 타이머를 한 번만 진행시킵니다.
    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(mockDispatch).toHaveBeenCalledTimes(1); // 디바운스된 모든 변경 후 dispatch는 한 번만 호출되어야 합니다.

    // 문자열 순서에 상관없이 테스트하기 위해, dispatch된 payload를 가져와 정렬 후 비교합니다.
    const expectedParts = "type:user in:name location:Busan is:sponsorable"
      .split(" ")
      .sort();
    const actualPayload = mockDispatch.mock.calls[0][0].payload as string;
    const actualParts = actualPayload.split(" ").sort();
    expect(actualParts).toEqual(expectedParts);
  });

  it("should not dispatch if filter values are default and not changed", async () => {
    render(<SearchFilters />);

    // 상호작용 없이 타이머만 진행시킵니다.
    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(mockDispatch).not.toHaveBeenCalled(); // 여전히 dispatch가 호출되지 않아야 합니다.
  });

  it("should clear date filters correctly", async () => {
    render(<SearchFilters />);
    // 렌더링 후 모의 함수 호출 기록에서 onChange 함수를 가져옵니다.
    const onChangeFrom = mockDatePickerOnChange.mock.calls[0][0];

    const testDate = new Date("2023-01-01T00:00:00.000Z");
    act(() => {
      onChangeFrom(testDate);
    });
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(mockDispatch).toHaveBeenCalledWith(
      setFilterOption("created:>=2023-01-01")
    );
    mockDispatch.mockClear();

    // 날짜를 초기화합니다.
    act(() => {
      onChangeFrom(null);
    });
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(mockDispatch).toHaveBeenCalledWith(setFilterOption("")); // 이 필터만 활성화된 상태였다면 빈 문자열이 전달되어야 합니다.
  });
});
