import {
  Accordion,
  Button,
  Checkbox,
  Container,
  Flex,
  Loader,
  PasswordInput,
  Tabs,
  TextInput,
  Textarea,
} from "@mantine/core";
import { FC, Fragment, useState } from "react";
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";

const App: FC = () => {
  const [organization, setOrganization] = useState(() =>
    getOrganizationFromQuery()
  );
  const [projects, setProjects] = useState(() => getProjectsFromQuery());
  const [user, setUser] = useState("Patrick Zenhäusern");
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
        placeholder="e.g. Patrick Zenhäusern"
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

const ResultAccordion: FC<{ result: RepoResult[] }> = ({ result }) => {
  const [filter, setFilterValue] = useState("");

  if (!result) {
    return null;
  }

  const reposWithoutCommits = result.filter(
    (r) => r.commits.values.length <= 0 && r.commits.errors.length <= 0
  );

  const reposWithErrors = result.filter((r) => r.commits.errors.length > 0);

  const reposWithCommits = result
    ?.filter((r) => r.commits.values.length > 0)
    .map(applyFilter)
    .filter((r) => !!r);

  const allCommits = reposWithCommits.reduce<Commit[]>(
    (commits, r) => [...commits, ...r.commits.values],
    []
  );

  return (
    <Accordion defaultValue="withCommits">
      <Accordion.Item value="withCommits">
        <Accordion.Control>
          {reposWithCommits.length} repos with {allCommits.length} commits
        </Accordion.Control>
        <Accordion.Panel>
          <TextInput
            label="Filter"
            placeholder="Repo name, commit message or commitId"
            value={filter}
            onChange={(e) => setFilterValue(e.target.value)}
          />
          <br />
          <BarChart width={730} height={250} data={getCommitsByMonths()}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis dataKey="commits" />
            <Tooltip />
            <Bar dataKey="commits" fill="#8884d8" />
          </BarChart>
          <Tabs defaultValue="HTML">
            <Tabs.List>
              <Tabs.Tab value="HTML">Html</Tabs.Tab>
              <Tabs.Tab value="JSON">Json</Tabs.Tab>
            </Tabs.List>
            <Tabs.Panel value="HTML" pt="xs">
              <ul>
                {reposWithCommits.map((r) => (
                  <li key={r.name}>
                    <RepoLink repo={r} /> ({r.defaultBranch})
                    <ul>
                      {r.commits.values.map((c) => (
                        <li key={c.id}>
                          {c.date.toISOString()}: {c.message} (
                          <a
                            href={`https://dev.azure.com/${r.org}/${r.project}/_git/${r.name}/commit/${c.id}`}
                            target="_blank"
                          >
                            {c.id}
                          </a>
                          )
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </Tabs.Panel>
            <Tabs.Panel value="JSON" pt="xs">
              <Textarea
                minRows={20}
                readOnly={true}
                onClick={(e) => e.currentTarget.select()}
                value={JSON.stringify(
                  {
                    totalCommits: allCommits.length,
                    repos: reposWithCommits,
                  },
                  null,
                  2
                )}
              ></Textarea>
            </Tabs.Panel>
          </Tabs>
        </Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item value="noCommits">
        <Accordion.Control>
          {reposWithoutCommits.length} repos without commits
        </Accordion.Control>
        <Accordion.Panel>
          <ul>
            {reposWithoutCommits.map((r) => (
              <li key={r.name}>
                <RepoLink repo={r} />
              </li>
            ))}
          </ul>
        </Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item value="withErrors">
        <Accordion.Control>
          {reposWithErrors.length} repos with errors
        </Accordion.Control>
        <Accordion.Panel>
          <ul>
            {reposWithErrors.map((r) => (
              <Fragment key={r.name}>
                <li>
                  <RepoLink repo={r} />
                </li>
                <ul>
                  {r.commits.errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </Fragment>
            ))}
          </ul>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );

  function applyFilter(repo: RepoResult): RepoResult {
    if (!filter) {
      return repo;
    }

    const lowerFilter = filter.toLowerCase();

    if (repo.name.toLowerCase().includes(lowerFilter)) {
      return repo;
    }

    const filteredCommits = repo.commits.values.filter(
      (c) =>
        c.id.includes(lowerFilter) ||
        c.message.toLowerCase().includes(lowerFilter)
    );

    if (!filteredCommits.length) {
      return null;
    }

    return {
      ...repo,
      commits: {
        ...repo.commits,
        values: filteredCommits,
      },
    };
  }

  function getCommitsByMonths() {
    return allCommits
      .reduce<{ month: string; commits: number }[]>(
        (monthlyCommitNumbers, commit) => {
          const month = `${commit.date.getUTCFullYear()}-${
            commit.date.getUTCMonth() + 1
          }`;

          let monthlyCommitNumber = monthlyCommitNumbers.find(
            (m) => m.month === month
          );
          if (!monthlyCommitNumber) {
            monthlyCommitNumber = { month, commits: 0 };
            monthlyCommitNumbers.push(monthlyCommitNumber);
          }

          monthlyCommitNumber.commits++;

          return monthlyCommitNumbers;
        },
        []
      )
      .sort(
        (a, b) => new Date(a.month).getTime() - new Date(b.month).getTime()
      );
  }
};

const RepoLink: FC<{ repo: RepoResult }> = ({ repo }) => {
  return (
    <a
      href={`https://dev.azure.com/${repo.org}/${repo.project}/_git/${repo.name}`}
      target="_blank"
    >
      {repo.name}
    </a>
  );
};

interface RepoResult {
  name: string;
  org: string;
  project: string;
  defaultBranch: string;
  commits: CommitsResult;
}

interface CommitsResult {
  errors: string[];
  values: Commit[];
}

interface Commit {
  date: Date;
  message: string;
  id: string;
}
export default App;
