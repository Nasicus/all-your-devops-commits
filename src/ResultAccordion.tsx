import { Accordion } from "@mantine/core";
import { FC } from "react";
import { ReposWithCommitsAccordionItem } from "./ReposWithCommitsAccordionItem";
import { ReposWithoutCommitsAccordionItem } from "./ReposWithoutCommitsAccordionItem";
import { RepoResult } from "./models";
import { ReposWithErrorsAccordionItem } from "./ReposWithErrorsAccordionItem";

export const ResultAccordion: FC<{ result: RepoResult[] }> = ({ result }) => {
  if (!result) {
    return null;
  }

  return (
    <Accordion defaultValue="withCommits">
      <ReposWithCommitsAccordionItem result={result} />
      <ReposWithoutCommitsAccordionItem result={result} />
      <ReposWithErrorsAccordionItem result={result} />
    </Accordion>
  );
};
