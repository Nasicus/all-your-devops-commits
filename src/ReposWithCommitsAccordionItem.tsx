import { Accordion, TextInput, Tabs } from "@mantine/core";
import { FC, useState } from "react";
import { CommitList } from "./CommitList";
import { CommitsPerMonthChart } from "./CommitsPerMonthChart";
import { JsonCommitResult } from "./JsonCommitResult";
import { Commit, FileChange, RepoResult } from "./models";
import { CommitsPerRepoChart } from "./CommitsPerRepoChart";

export const ReposWithCommitsAccordionItem: FC<{ result: RepoResult[] }> = ({
  result,
}) => {
  const [filter, setFilterValue] = useState("");

  const reposWithCommits = result
    .filter((r) => r.commits.length > 0)
    .map(applyFilter)
    .filter((r) => !!r);

  const allCommits = reposWithCommits.reduce<Commit[]>(
    (commits, r) => [...commits, ...r.commits],
    []
  );

  const allFileChanges = allCommits.reduce<FileChange>(
    (f, c) => {
      f.add += c.fileChange.add;
      f.edit += c.fileChange.edit;
      f.delete += c.fileChange.delete;
      return f;
    },
    { add: 0, edit: 0, delete: 0 }
  );

  return (
    <Accordion.Item value="withCommits">
      <Accordion.Control>
        {reposWithCommits.length} repos with {allCommits.length} commits (files:
        +{allFileChanges.add.toLocaleString()}, ~
        {allFileChanges.edit.toLocaleString()}, -
        {allFileChanges.delete.toLocaleString()})
      </Accordion.Control>
      <Accordion.Panel>
        <TextInput
          label="Filter"
          placeholder="Repo name, commit message or commitId"
          value={filter}
          onChange={(e) => setFilterValue(e.target.value)}
        />
        <br />
        <Tabs defaultValue="HTML">
          <Tabs.List>
            <Tabs.Tab value="HTML">Html</Tabs.Tab>
            <Tabs.Tab value="JSON">Json</Tabs.Tab>
            <Tabs.Tab value="Charts">Charts</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="HTML" pt="xs">
            <CommitList commits={reposWithCommits} />
          </Tabs.Panel>
          <Tabs.Panel value="JSON" pt="xs">
            <JsonCommitResult
              fileChanges={allFileChanges}
              totalCommits={allCommits.length}
              commits={reposWithCommits}
            />
          </Tabs.Panel>
          <Tabs.Panel value="Charts" pt="xs">
            <CommitsPerMonthChart commits={allCommits} />
            <CommitsPerRepoChart commits={reposWithCommits} />
          </Tabs.Panel>
        </Tabs>
      </Accordion.Panel>
    </Accordion.Item>
  );

  function applyFilter(repo: RepoResult): RepoResult {
    if (!filter) {
      return repo;
    }

    const lowerFilter = filter.toLowerCase();

    if (repo.name.toLowerCase().includes(lowerFilter)) {
      return repo;
    }

    const filteredCommits = repo.commits.filter(
      (c) =>
        c.id.includes(lowerFilter) ||
        c.message.toLowerCase().includes(lowerFilter)
    );

    if (!filteredCommits.length) {
      return null;
    }

    return {
      ...repo,
      commits: filteredCommits,
    };
  }
};
