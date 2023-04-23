import {
  Accordion,
  Button,
  Checkbox,
  Container,
  Flex,
  Loader,
  PasswordInput,
  TextInput,
} from "@mantine/core";
import { FC, Fragment, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const App: FC = () => {
  const [user, setUser] = useState("Patrick Zenhäusern");
  const [pat, setPat] = useState(() => localStorage.getItem("pat") || "");
  const [storePat, setStorePat] = useState(!!pat);
  const [isSearching, setIsSearching] = useState(false);
  const [repoResults, setRepoResults] = useState<RepoResult[]>([]);

  const reposWithoutCommits = repoResults.filter(
    (r) => r.commmits.values.length <= 0 && r.commmits.errors.length <= 0
  );
  const reposWithCommits = repoResults.filter(
    (r) => r.commmits.values.length > 0
  );

  const reposWithErrors = repoResults.filter(
    (r) => r.commmits.errors.length > 0
  );

  const allCommits = reposWithCommits.reduce<Commit[]>(
    (commits, r) => [...commits, ...r.commmits.values],
    []
  );

  return (
    <Container>
      <h1>Search for all commits of an author across DG</h1>
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
      <Accordion defaultValue="withCommits">
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
        <Accordion.Item value="withCommits">
          <Accordion.Control>
            {reposWithCommits.length} repos with {allCommits.length} commits
          </Accordion.Control>
          <Accordion.Panel>
            <BarChart width={730} height={250} data={getCommitsByMonths()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis dataKey="commits" />
              <Tooltip />
              <Legend />
              <Bar dataKey="commits" fill="#8884d8" />
            </BarChart>
            <ul>
              {reposWithCommits.map((r) => (
                <li key={r.name}>
                  <RepoLink repo={r} /> ({r.defaultBranch})
                  <ul>
                    {r.commmits.values.map((c) => (
                      <li key={c.id}>
                        {c.date.toISOString()}: {c.message} (
                        <a
                          href={`https://dev.azure.com/DigitecGalaxus/devinite/_git/${r.name}/commit/${c.id}`}
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
                    {r.commmits.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </Fragment>
              ))}
            </ul>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </Container>
  );

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

  async function getCommits() {
    setIsSearching(true);

    if (storePat) {
      localStorage.setItem("pat", pat);
    }

    const reposResponse = await makeDevOpsRequest(
      "/git/repositories?api-version=7.0"
    );

    const result: RepoResult[] = [];

    for (const repo of reposResponse.value) {
      const defaultBranchPaths = repo.defaultBranch.split("/");
      const defaultBranch = defaultBranchPaths[defaultBranchPaths.length - 1];

      const repoResult: RepoResult = {
        name: repo.name,
        defaultBranch,
        commmits: { errors: [], values: [] },
      };

      result.push(repoResult);

      const pageSize = 1000;
      let skip = 0;
      let commitPage: Commit[] = [];
      while (skip === 0 || commitPage.length >= pageSize) {
        try {
          const commitsResponse = await makeDevOpsRequest(
            `/git/repositories/${repo.name}/commits?searchCriteria.author=${user}&searchCriteria.$top=${pageSize}&searchCriteria.$skip=${skip}&searchCriteria.itemVersion.version=${defaultBranch}&api-version=7.0`
          );

          commitPage = commitsResponse.value.map((c: any) => ({
            id: c.commitId,
            message: c.comment,
            date: new Date(c.author.date),
          }));

          repoResult.commmits.values = [
            ...repoResult.commmits.values,
            ...commitPage,
          ];
          skip += pageSize;
          setRepoResults([...result]);
        } catch (err) {
          const r: any = err;
          repoResult.commmits.errors.push(
            `${r.status}: ${(await r.json())?.message}`
          );
          setRepoResults([...result]);
          break;
        }
      }
    }

    setIsSearching(false);
    setRepoResults([...result]);
  }

  function makeDevOpsRequest(path: string) {
    return fetch(`https://dev.azure.com/DigitecGalaxus/devinite/_apis${path}`, {
      headers: { Authorization: `Basic ${btoa(`:${pat}`)}` },
    }).then((r) => {
      if (r.ok) {
        return r.json();
      }

      return Promise.reject(r);
    });
  }
};

const RepoLink: FC<{ repo: RepoResult }> = ({ repo }) => {
  return (
    <a
      href={`https://dev.azure.com/DigitecGalaxus/devinite/_git/${repo.name}`}
      target="_blank"
    >
      {repo.name}
    </a>
  );
};

interface RepoResult {
  name: string;
  defaultBranch: string;
  commmits: CommitsResult;
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
