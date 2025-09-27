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
import { ReactNode, startTransition, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useDebounce } from "use-debounce";

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

  useEffect(() => {
    startTransition(() => {
      dispatch(setSortOption(debouncedSortOption));
    });
  }, [debouncedSortOption, dispatch]);

  return (
    <div className="col-span-full">
      <div className="flex flex-row-reverse mb-2 justify-between">
        <FormControl size="small">
          <InputLabel>Sort by</InputLabel>
          <Select
            labelId="find-sort-option"
            value={formSortOption}
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
            Found {count.toLocaleString()} user{count > 1 ? "s" : ""}
          </Typography>
        )}
        {isFetching && !count && (
          <Typography fontWeight={"semibold"} className="flex items-end">
            <Skeleton className="min-w-30" />
          </Typography>
        )}
      </div>
      <Divider />
    </div>
  );
}
