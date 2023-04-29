import { Button, Flex, Loader } from "@mantine/core";
import { FC, useContext } from "react";
import { SearchFormContext } from "./SearchFormProvider";

export const SearchButton: FC<{
  isSearching: boolean;
  onClick: () => unknown;
}> = ({ isSearching, onClick }) => {
  const { isValid } = useContext(SearchFormContext);

  return (
    <Flex mt="xs" gap="xs">
      <Button disabled={isSearching || !isValid} onClick={onClick}>
        Search
      </Button>
      {isSearching && <Loader />}
    </Flex>
  );
};
