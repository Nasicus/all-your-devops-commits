import { Button, Flex, Loader } from "@mantine/core";
import { FC, useContext } from "react";
import { SearchFormContext } from "./SearchFormProvider";
import { SearchProgress } from "../models";

export const SearchButton: FC<{
  isSearching: boolean;
  searchProgress: SearchProgress;
  onClick: () => unknown;
}> = ({ isSearching, searchProgress, onClick }) => {
  const { isValid } = useContext(SearchFormContext);

  return (
    <Flex mt="xs" gap="xs" align="center">
      <Button disabled={isSearching || !isValid} onClick={onClick}>
        Search
      </Button>
      {isSearching && <Loader />}
      {isSearching && (
        <SearchProgressRenderer searchProgress={searchProgress} />
      )}
    </Flex>
  );
};

const SearchProgressRenderer: FC<{ searchProgress: SearchProgress }> = ({
  searchProgress,
}) => {
  if (!searchProgress) {
    return null;
  }

  return (
    <>
      {searchProgress.projects.total > 1 && (
        <>
          {searchProgress.projects.current + 1}/{searchProgress.projects.total}{" "}
          projects,{" "}
        </>
      )}
      {searchProgress.repos.current}/{searchProgress.repos.total} repos
    </>
  );
};
