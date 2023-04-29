import { TextInput } from "@mantine/core";
import { FC, useContext } from "react";
import { SearchFormContext } from "./SearchFormProvider";

export const AuthorInput: FC = () => {
  const { user, setUser } = useContext(SearchFormContext);

  return (
    <TextInput
      placeholder="e.g. Josef Müller"
      label="User to search for"
      value={user}
      required
      onChange={(e) => setUser(e.target.value)}
    />
  );
};
