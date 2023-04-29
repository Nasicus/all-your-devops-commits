import { Checkbox, PasswordInput } from "@mantine/core";
import { FC, useContext, useEffect } from "react";
import { SearchFormContext } from "./SearchFormProvider";

export const PersonalAccessTokenInput: FC = () => {
  const { pat, setPat, storePat, setStorePat } = useContext(SearchFormContext);

  useEffect(() => {
    const patFromLocalStorage = localStorage.getItem("pat");

    if (!patFromLocalStorage) {
      return;
    }

    setPat(patFromLocalStorage);
    setStorePat(true);
  }, [setPat, setStorePat]);

  return (
    <>
      <PasswordInput
        placeholder="required permissions: Code - Read"
        label="PAT"
        value={pat}
        required
        onChange={(e) => setPat(e.target.value)}
      />
      <Checkbox
        checked={storePat}
        onChange={(e) => setStorePat(e.target.checked)}
        label="Store PAT in local storage"
        mt="xs"
      />
    </>
  );
};
