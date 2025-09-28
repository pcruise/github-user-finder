import { setFilterOption } from "@/services/finderSlice";
import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  Radio,
  RadioGroup,
  Slider,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { ReactElement, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useDebounce } from "use-debounce";
/**
 * 검색 필터의 상태를 정의하는 인터페이스입니다.
 */
interface SearchFilterState {
  accountType: string;
  searchIn: {
    name: boolean;
    login: boolean;
    email: boolean;
  };
  repoCount: number[];
  location: string;
  language: string;
  createdDateFrom: Date | null;
  createdDateTo: Date | null;
  followerCount: number[];
  isSponsorable: boolean;
}

/** 리포지토리 수 슬라이더의 기본값 [최소, 최대] */
const REPOS_COUNT_DEFAULT = [0, 1000] as const;
/** 팔로워 수 슬라이더의 기본값 [최소, 최대] */
const FOLLOWER_COUNT_DEFAULT = [0, 1000] as const;

/**
 * GitHub 사용자 검색을 위한 다양한 필터 옵션을 제공하는 폼 컴포넌트입니다.
 *
 * 이 컴포넌트는 다음과 같은 기능을 수행합니다:
 * - 계정 유형, 검색 범위, 위치, 언어, 가입일, 리포지토리/팔로워 수, 후원 가능 여부 등 다양한 필터 옵션을 UI로 제공합니다.
 * - 사용자가 입력한 필터 값들을 내부 상태(`filters`)로 관리합니다.
 * - `useDebounce` 훅을 사용하여 필터 값 변경이 멈춘 후 500ms 뒤에 API 요청을 트리거합니다.
 * - 필터 상태를 기반으로 GitHub API 검색 쿼리 문자열을 생성합니다.
 * - 생성된 쿼리 문자열을 Redux 스토어(`finderSlice`)에 `setFilterOption` 액션을 통해 전달합니다.
 * @returns {React.ReactElement} SearchFilters 폼 컴포넌트
 */
function SearchFilters() {
  const [filters, setFilters] = useState<SearchFilterState>({
    accountType: "",
    searchIn: { name: false, login: false, email: false },
    location: "",
    language: "",
    createdDateFrom: null,
    createdDateTo: null,
    repoCount: [...REPOS_COUNT_DEFAULT],
    followerCount: [...FOLLOWER_COUNT_DEFAULT],
    isSponsorable: false,
  });
  const [debouncedFilters] = useDebounce(filters, 500);
  const isFirst = useRef(true);

  const handleFilterChange = <K extends keyof SearchFilterState>(
    key: K,
    value: SearchFilterState[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleSearchInChange =
    (name: keyof SearchFilterState["searchIn"]) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      handleFilterChange("searchIn", {
        ...filters.searchIn,
        [name]: event.target.checked,
      });
    };
  const dispatch = useDispatch();

  useEffect(() => {
    if (isFirst.current) {
      // 초기 state 설정값은 호출하지 않습니다.
      isFirst.current = false;
      return;
    }

    const optionStrings = [];
    const {
      accountType,
      searchIn,
      repoCount,
      location,
      language,
      createdDateFrom,
      createdDateTo,
      followerCount,
      isSponsorable,
    } = debouncedFilters;

    if (accountType) optionStrings.push(`type:${accountType}`);

    if (searchIn?.email) optionStrings.push(`in:email`);
    if (searchIn?.login) optionStrings.push(`in:login`);
    if (searchIn?.name) optionStrings.push(`in:name`);

    if (location) optionStrings.push(`location:${location}`);
    if (language) optionStrings.push(`language:${language}`);
    if (isSponsorable) optionStrings.push(`is:sponsorable`);

    if (createdDateFrom !== null && createdDateTo !== null)
      optionStrings.push(
        `created:${format(createdDateFrom, "yyyy-MM-dd")}..${format(createdDateTo, "yyyy-MM-dd")}`
      );
    else if (createdDateFrom !== null)
      optionStrings.push(`created:>=${format(createdDateFrom, "yyyy-MM-dd")}`);
    else if (createdDateTo !== null)
      optionStrings.push(`created:<=${format(createdDateTo, "yyyy-MM-dd")}`);

    // repoCount
    if (
      repoCount[0] !== REPOS_COUNT_DEFAULT[0] ||
      repoCount[1] !== REPOS_COUNT_DEFAULT[1]
    ) {
      optionStrings.push(`repos:${repoCount[0]}..${repoCount[1]}`);
    }

    // followerCount
    if (
      followerCount[0] !== FOLLOWER_COUNT_DEFAULT[0] ||
      followerCount[1] !== FOLLOWER_COUNT_DEFAULT[1]
    ) {
      optionStrings.push(`followers:${followerCount[0]}..${followerCount[1]}`);
    }

    const joinedOptionStrings = optionStrings.join(" ");
    dispatch(setFilterOption(joinedOptionStrings));
  }, [debouncedFilters, dispatch]);

  return (
    <Box className="flex flex-col gap-4 p-4 w-full" role="presentation">
      <Typography variant="h6" className="mb-4">
        Search Options
      </Typography>

      {/* 1. 사용자 또는 조직 */}
      <FilterSection title="Accounts">
        <RadioGroup
          row
          aria-label="account-type"
          name="account-type"
          value={filters.accountType}
          onChange={(e) => handleFilterChange("accountType", e.target.value)}
        >
          <FormControlLabel value="" control={<Radio />} label="All" />
          <FormControlLabel value="user" control={<Radio />} label="User" />
          <FormControlLabel
            value="org"
            control={<Radio />}
            label="Organization"
          />
        </RadioGroup>
      </FilterSection>

      {/* 2. 검색 범위 */}
      <FilterSection title="Search by">
        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                checked={filters.searchIn.name}
                onChange={handleSearchInChange("name")}
                name="name"
              />
            }
            label="User name"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={filters.searchIn.login}
                onChange={handleSearchInChange("login")}
                name="login"
              />
            }
            label="Account name"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={filters.searchIn.email}
                onChange={handleSearchInChange("email")}
                name="email"
              />
            }
            label="Email"
          />
        </FormGroup>
      </FilterSection>

      {/* 3. 위치 */}
      <FilterSection title="Location">
        <TextField
          variant="outlined"
          size="small"
          placeholder="ex. Seoul"
          value={filters.location}
          onChange={(e) => handleFilterChange("location", e.target.value)}
          className="w-full mt-2!"
        />
      </FilterSection>

      {/* 4. 사용 언어 */}
      <FilterSection title="Language">
        <TextField
          variant="outlined"
          size="small"
          placeholder="ex. TypeScript"
          value={filters.language}
          onChange={(e) => handleFilterChange("language", e.target.value)}
          className="w-full mt-2!"
        />
      </FilterSection>

      {/* 5. 계정 생성일 */}
      <FilterSection title="Join date">
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
          <DatePicker
            className="mt-2!"
            value={filters.createdDateFrom}
            label="From"
            onChange={(newValue) =>
              handleFilterChange("createdDateFrom", newValue)
            }
            slotProps={{
              textField: { size: "small", className: "w-full" },
              field: {
                clearable: true,
                onClear: () => handleFilterChange("createdDateFrom", null),
              },
            }}
          />
          <DatePicker
            className="mt-2!"
            value={filters.createdDateTo}
            label="To"
            onChange={(newValue) =>
              handleFilterChange("createdDateTo", newValue)
            }
            slotProps={{
              textField: { size: "small", className: "w-full" },
              field: {
                clearable: true,
                onClear: () => handleFilterChange("createdDateTo", null),
              },
            }}
          />
        </LocalizationProvider>
      </FilterSection>

      {/* 6. 리포지토리 수 */}
      <FilterSection
        title={`Repositories: ${filters.repoCount[0].toLocaleString()} - ${
          filters.repoCount[1] === 1000
            ? "1k+"
            : filters.repoCount[1].toLocaleString()
        }`}
      >
        <Slider
          value={filters.repoCount}
          onChange={(_, newValue) =>
            handleFilterChange("repoCount", newValue as number[])
          }
          valueLabelDisplay="auto"
          min={REPOS_COUNT_DEFAULT[0]}
          max={REPOS_COUNT_DEFAULT[1]}
          step={10}
          aria-labelledby="repository-count-slider"
        />
      </FilterSection>

      {/* 7. 팔로워 수 */}
      <FilterSection
        title={`Followers: ${filters.followerCount[0].toLocaleString()} - ${
          filters.followerCount[1] === FOLLOWER_COUNT_DEFAULT[1]
            ? "1k+"
            : filters.followerCount[1].toLocaleString()
        }`}
      >
        <Slider
          value={filters.followerCount}
          onChange={(_, newValue) =>
            handleFilterChange("followerCount", newValue as number[])
          }
          valueLabelDisplay="auto"
          min={FOLLOWER_COUNT_DEFAULT[0]}
          max={FOLLOWER_COUNT_DEFAULT[1]}
          step={50}
          aria-labelledby="follower-count-slider"
        />
      </FilterSection>

      {/* 8. 후원 가능 여부 */}
      <FilterSection title="Sponsorable">
        <FormControlLabel
          control={
            <Switch
              checked={filters.isSponsorable}
              onChange={(e) =>
                handleFilterChange("isSponsorable", e.target.checked)
              }
            />
          }
          label={"Is Sponsorable"}
        />
      </FilterSection>
    </Box>
  );
}

/**
 * 각 필터 섹션의 UI를 일관되게 감싸는 래퍼 컴포넌트입니다.
 * @param {object} props - 컴포넌트 props
 * @param {React.ReactElement} props.children - 필터링 UI 컴포넌트들
 * @param {string} props.title - 섹션의 제목
 */
function FilterSection({
  children,
  title,
}: {
  children: ReactElement;
  title: string;
}) {
  return (
    <FormControl component="fieldset" className="w-full">
      <Typography component="legend" color="textDisabled">
        {title}
      </Typography>
      {children}
    </FormControl>
  );
}

export default SearchFilters;
