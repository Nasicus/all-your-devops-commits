import { Container } from "@mantine/core";
import { FC, useState } from "react";
import { ResultAccordion } from "./ResultAccordion";
import { SearchFormProvider } from "./form/SearchFormProvider";
import { SearchForm } from "./form/SearchForm";
import { RepoResult } from "./models";

export const App: FC = () => {
  const [repoResults, setRepoResults] = useState<RepoResult[]>(null);

  return (
    <Container>
      <h1>Search for all commits of an author</h1>
      <SearchFormProvider>
        <SearchForm onRepoResultUpdate={setRepoResults} />
      </SearchFormProvider>
      <ResultAccordion result={repoResults} />
    </Container>
  );
};
