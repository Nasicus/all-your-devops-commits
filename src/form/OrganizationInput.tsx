import { FC, useContext, useEffect } from "react";
import { SearchFormContext } from "./SearchFormProvider";
import { TextInput } from "@mantine/core";

export const OrganizationInput: FC = () => {
  const { organization, setOrganization } = useContext(SearchFormContext);

  useEffect(() => {
    setOrganization(getOrganizationFromQuery());
  }, [setOrganization]);

  return (
    <TextInput
      placeholder="e.g. DigitecGalaxus"
      label="Organization"
      value={organization}
      required
      onChange={(e) => setOrganization(e.target.value)}
    />
  );

  function getOrganizationFromQuery() {
    const urlSearchParams = Object.fromEntries(
      new URLSearchParams(window.location.search).entries()
    );

    return urlSearchParams["org"] || "";
  }
};
