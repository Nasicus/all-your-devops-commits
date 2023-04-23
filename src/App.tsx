import {
  Button,
  Checkbox,
  Container,
  Flex,
  Loader,
  PasswordInput,
  TextInput,
  Textarea,
} from "@mantine/core";
import { FC, useState } from "react";
import { ResultAccordion } from "./ResultAccordion";
import { Commit, RepoResult } from "./models";

const App: FC = () => {
  const [organization, setOrganization] = useState(() =>
    getOrganizationFromQuery()
  );
  const [projects, setProjects] = useState(() => getProjectsFromQuery());
  const [user, setUser] = useState("");
  const [pat, setPat] = useState(() => localStorage.getItem("pat") || "");
  const [storePat, setStorePat] = useState(!!pat);
  const [isSearching, setIsSearching] = useState(false);
  const [repoResults, setRepoResults] = useState<RepoResult[]>(null);

  return (
    <Container>
      <h1>Search for all commits of an author</h1>
      <TextInput
        placeholder="e.g. DigitecGalaxus"
        label="Organization"
        value={organization}
        onChange={(e) => setOrganization(e.target.value)}
      />
      <Textarea
        placeholder="one line per project"
        label="Projects"
        value={projects.join("\n")}
        onChange={(e) => setProjects(e.target.value.split("\n"))}
      />
      <PasswordInput
        placeholder="Required permissions: Code - Read"
        label="PAT"
        value={pat}
        onChange={(e) => setPat(e.target.value)}
      />
      <Checkbox
        checked={storePat}
        onChange={(e) => setStorePat(e.target.checked)}
        label="Store PAT in local storage"
      />
      <TextInput
        placeholder="e.g. Josef Müller"
        label="User to search for"
        value={user}
        onChange={(e) => setUser(e.target.value)}
      />
      <Flex mt="xs" gap="xs">
        <Button disabled={isSearching || !pat || !user} onClick={getCommits}>
          Search
        </Button>
        {isSearching && <Loader />}
      </Flex>
      <ResultAccordion result={repoResults} />
    </Container>
  );

  function getOrganizationFromQuery() {
    const urlSearchParams = Object.fromEntries(
      new URLSearchParams(window.location.search).entries()
    );

    return urlSearchParams["org"] || "";
  }

  function getProjectsFromQuery() {
    const urlSearchParams = Array.from(
      new URLSearchParams(window.location.search).entries()
    );

    return urlSearchParams.filter((e) => e[0] === "project").map((e) => e[1]);
  }

  async function getCommits() {
    setIsSearching(true);

    if (storePat) {
      localStorage.setItem("pat", pat);
    }

    const result: RepoResult[] = [];

    for (const project of projects) {
      const reposResponse = await makeDevOpsRequest(
        project,
        "/git/repositories?api-version=7.0"
      );

      for (const repo of reposResponse.value) {
        const defaultBranchPaths = repo.defaultBranch?.split("/");
        if (!defaultBranchPaths) {
          console.warn(
            `${repo.name} doesn't have a default branch, will skip.`
          );
          continue;
        }

        const defaultBranch = defaultBranchPaths[defaultBranchPaths.length - 1];

        const repoResult: RepoResult = {
          name: repo.name,
          org: organization,
          project,
          defaultBranch,
          commits: { errors: [], values: [] },
        };

        result.push(repoResult);

        const pageSize = 1000;
        let skip = 0;
        let commitPage: Commit[] = [];
        while (skip === 0 || commitPage.length >= pageSize) {
          try {
            const commitsResponse = await makeDevOpsRequest(
              project,
              `/git/repositories/${repo.name}/commits?searchCriteria.author=${user}&searchCriteria.$top=${pageSize}&searchCriteria.$skip=${skip}&searchCriteria.itemVersion.version=${defaultBranch}&api-version=7.0`
            );

            commitPage = commitsResponse.value.map((c: any) => ({
              id: c.commitId,
              message: c.comment,
              date: new Date(c.author.date),
            }));

            repoResult.commits.values = [
              ...repoResult.commits.values,
              ...commitPage,
            ];
            skip += pageSize;
            setRepoResults([...result]);
          } catch (err) {
            const r: any = err;
            repoResult.commits.errors.push(
              `${r.status}: ${(await r.json())?.message}`
            );
            setRepoResults([...result]);
            break;
          }
        }
      }
    }

    setIsSearching(false);
    setRepoResults([...result]);
  }

  function makeDevOpsRequest(project: string, path: string) {
    return fetch(
      `https://dev.azure.com/${organization}/${project}/_apis${path}`,
      {
        headers: { Authorization: `Basic ${btoa(`:${pat}`)}` },
      }
    ).then((r) => {
      if (r.ok) {
        return r.json();
      }

      return Promise.reject(r);
    });
  }
};

export default App;
