import { setSortOption } from "@/services/finderSlice";
import {
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Skeleton,
  Typography,
} from "@mui/material";
import { ReactNode, startTransition, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useDebounce } from "use-debounce";

/**
 * 사용자 목록의 헤더를 렌더링하는 컴포넌트입니다.
 * 검색 결과 수와 정렬 옵션 드롭다운을 표시합니다.
 * @param {object} props - 컴포넌트 props
 * @param {boolean} props.isEmpty - 검색 결과가 비어있는지 여부
 * @param {boolean} props.isFetching - 데이터를 가져오는 중인지 여부
 * @param {number} props.count - 검색된 총 사용자 수
 */
export function UserListHeader({
  isEmpty,
  isFetching,
  count,
}: {
  isEmpty: boolean;
  isFetching: boolean;
  count: number;
}): ReactNode {
  const [formSortOption, setFormSortOption] = useState("default");
  const [debouncedSortOption] = useDebounce(formSortOption, 150);
  const dispatch = useDispatch();
  const isFirst = useRef(true);

  useEffect(() => {
    if (isFirst.current) {
      // 초기 state 설정값은 호출하지 않습니다.
      isFirst.current = false;
      return;
    }
    startTransition(() => {
      dispatch(setSortOption(debouncedSortOption));
    });
  }, [debouncedSortOption, dispatch]);

  return (
    <div className="col-span-full">
      <div className="flex flex-row-reverse mb-2 justify-between">
        <FormControl size="small">
          <InputLabel id="find-sort-option-label">Sort by</InputLabel>
          <Select
            labelId="find-sort-option-label"
            value={formSortOption}
            id="find-sort-option"
            label="Sort by"
            onChange={(e) => {
              setFormSortOption(e.target.value);
            }}
          >
            <MenuItem value={"default"}>Default</MenuItem>
            <MenuItem value={"followers"}>Followers</MenuItem>
            <MenuItem value={"repositories"}>Repositories</MenuItem>
            <MenuItem value={"joined"}>Joined</MenuItem>
          </Select>
        </FormControl>

        {!isEmpty && (
          <Typography fontWeight={"semibold"} className="flex items-end">
            Found {count.toLocaleString()} user{count !== 1 ? "s" : ""}
          </Typography>
        )}
        {isFetching && !count && (
          <Typography fontWeight={"semibold"} className="flex items-end">
            <Skeleton role="progressbar" className="min-w-30" />
          </Typography>
        )}
      </div>
      <Divider />
    </div>
  );
}
