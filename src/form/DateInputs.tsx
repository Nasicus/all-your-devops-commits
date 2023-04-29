import { Flex } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { FC, useContext } from "react";
import { SearchFormContext } from "./SearchFormProvider";

export const DateInputs: FC = () => {
  const { from, setFrom, to, setTo } = useContext(SearchFormContext);

  return (
    <Flex gap="xs" align="stretch" mt="xs">
      <DateInput
        value={from}
        onChange={setFrom}
        label="From"
        allowDeselect
        placeholder="Will be from the start of the day (00:00)"
        w="100%"
      />
      <DateInput
        value={to}
        onChange={setTo}
        label="To"
        allowDeselect
        placeholder="Will be to the end of the day (23:59)"
        w="100%"
      />
    </Flex>
  );
};
