import { setFilterOption } from "@/services/finderSlice";
import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Radio,
  RadioGroup,
  Slider,
  Switch,
  TextField,
  Typography,
  styled,
} from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useDebounce } from "use-debounce";

// MUI의 styled 함수를 사용하여 테마 색상을 지원하는 제목 컴포넌트를 생성합니다.
const SectionTitle = styled(FormLabel)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontWeight: theme.typography.fontWeightBold,
  display: "block",
  "&.Mui-focused": {
    color: theme.palette.text.secondary, // 포커스 시 색상 변경 방지
  },
}));

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
  createdDate: Date | null;
  followerCount: number[];
  isSponsorable: boolean;
}

const SearchFilters = () => {
  const [filters, setFilters] = useState<SearchFilterState>({
    accountType: "",
    searchIn: { name: false, login: false, email: false },
    repoCount: [0, 1000],
    location: "",
    language: "",
    createdDate: null,
    followerCount: [0, 10000],
    isSponsorable: false,
  });
  const [debouncedFilters] = useDebounce(filters, 500);

  const handleFilterChange = <K extends keyof SearchFilterState>(
    key: K,
    value: SearchFilterState[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const dispatch = useDispatch();

  useEffect(() => {
    const optionStrings = [];
    const {
      accountType,
      searchIn,
      repoCount,
      location,
      language,
      createdDate,
      followerCount,
      isSponsorable,
    } = debouncedFilters;

    if (accountType) optionStrings.push(`type:${accountType}`);

    if (searchIn?.email) optionStrings.push(`in:email`);
    if (searchIn?.login) optionStrings.push(`in:login`);
    if (searchIn?.name) optionStrings.push(`in:name`);

    if (location) optionStrings.push(`location:${location}`);
    if (language) optionStrings.push(`language:${language}`);
    if (createdDate)
      optionStrings.push(`created:>=${format(createdDate, "yyyy-MM-dd")}`);
    if (isSponsorable) optionStrings.push(`is:sponsorable`);

    if (repoCount) {
      // TODO: repocount 적용
    }
    if (followerCount) {
      // TODO: foloowercount 적용
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
      <FormControl component="fieldset" className="w-full">
        <SectionTitle>Accounts</SectionTitle>
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
      </FormControl>

      {/* 2. 검색 범위 */}
      <FormControl component="fieldset" className="mb-6 w-full">
        <SectionTitle>Search by</SectionTitle>
        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                checked={filters.searchIn.login}
                onChange={(e) =>
                  handleFilterChange("searchIn", {
                    ...filters.searchIn,
                    login: e.target.checked,
                  })
                }
                name="login"
              />
            }
            label="Account name"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={filters.searchIn.name}
                onChange={(e) =>
                  handleFilterChange("searchIn", {
                    ...filters.searchIn,
                    name: e.target.checked,
                  })
                }
                name="name"
              />
            }
            label="User name"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={filters.searchIn.email}
                onChange={(e) =>
                  handleFilterChange("searchIn", {
                    ...filters.searchIn,
                    email: e.target.checked,
                  })
                }
                name="email"
              />
            }
            label="Email"
          />
        </FormGroup>
      </FormControl>

      {/* 3. 위치 */}
      <FormControl component="fieldset" className="mb-6 w-full">
        <SectionTitle className="mb-2">Location</SectionTitle>
        <TextField
          variant="outlined"
          size="small"
          placeholder="ex. Seoul"
          value={filters.location}
          onChange={(e) => handleFilterChange("location", e.target.value)}
          className="w-full"
        />
      </FormControl>

      {/* 4. 사용 언어 */}
      <FormControl component="fieldset" className="mb-6 w-full">
        <SectionTitle className="mb-2">Language</SectionTitle>
        <TextField
          variant="outlined"
          size="small"
          placeholder="ex. TypeScript"
          value={filters.language}
          onChange={(e) => handleFilterChange("language", e.target.value)}
          className="w-full"
        />
      </FormControl>

      {/* 5. 계정 생성일 */}
      <FormControl component="fieldset" className="mb-6 w-full">
        <SectionTitle className="mb-2">Join date</SectionTitle>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
          <DatePicker
            value={filters.createdDate}
            onChange={(newValue) => handleFilterChange("createdDate", newValue)}
            slotProps={{ textField: { size: "small", className: "w-full" } }}
          />
          ~
          <DatePicker
            value={filters.createdDate}
            onChange={(newValue) => handleFilterChange("createdDate", newValue)}
            slotProps={{ textField: { size: "small", className: "w-full" } }}
          />
        </LocalizationProvider>
      </FormControl>

      {/* 6. 리포지토리 수 */}
      <FormControl component="fieldset" className="mb-6 w-full">
        <SectionTitle className="mb-2">
          리포지토리 수: {filters.repoCount[0]} -{" "}
          {filters.repoCount[1] === 1000 ? "1000+" : filters.repoCount[1]}
        </SectionTitle>
        <Slider
          value={filters.repoCount}
          onChange={(_, newValue) =>
            handleFilterChange("repoCount", newValue as number[])
          }
          valueLabelDisplay="auto"
          min={0}
          max={1000}
          step={10}
          aria-labelledby="repository-count-slider"
        />
      </FormControl>

      {/* 7. 팔로워 수 */}
      <FormControl component="fieldset" className="mb-6 w-full">
        <SectionTitle className="mb-2">
          팔로워 수: {filters.followerCount[0]} -{" "}
          {filters.followerCount[1] === 10000
            ? "10k+"
            : filters.followerCount[1]}
        </SectionTitle>
        <Slider
          value={filters.followerCount}
          onChange={(_, newValue) =>
            handleFilterChange("followerCount", newValue as number[])
          }
          valueLabelDisplay="auto"
          min={0}
          max={10000}
          step={100}
          aria-labelledby="follower-count-slider"
        />
      </FormControl>

      {/* 8. 후원 가능 여부 */}
      <FormControl component="fieldset" className="w-full">
        <SectionTitle>Sponsorable</SectionTitle>
        <FormControlLabel
          control={
            <Switch
              checked={filters.isSponsorable}
              onChange={(e) =>
                handleFilterChange("isSponsorable", e.target.checked)
              }
            />
          }
          label="Is Sponsorable"
        />
      </FormControl>
    </Box>
  );
};

export default SearchFilters;
