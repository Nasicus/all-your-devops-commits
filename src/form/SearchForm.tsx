import { FC, useContext, useState } from "react";
import { Commit, RepoResult, SearchProgress } from "../models";
import { AuthorInput } from "./AuthorInput";
import { DateInputs } from "./DateInputs";
import { OrganizationInput } from "./OrganizationInput";
import { PersonalAccessTokenInput } from "./PersonalAccessTokenInput";
import { ProjectsInput } from "./ProjectsInput";
import { SearchButton } from "./SearchButton";
import { SearchFormContext } from "./SearchFormProvider";

export const SearchForm: FC<{
  onRepoResultUpdate: (repoResult: RepoResult[]) => unknown;
}> = ({ onRepoResultUpdate }) => {
  const { organization, projects, pat, storePat, user, from, to } =
    useContext(SearchFormContext);

  const [isSearching, setIsSearching] = useState(false);
  const [searchProgress, setSearchProgress] = useState<SearchProgress>(null);

  return (
    <>
      <OrganizationInput />
      <ProjectsInput />
      <PersonalAccessTokenInput />
      <AuthorInput />
      <DateInputs />
      <SearchButton
        isSearching={isSearching}
        onClick={getCommits}
        searchProgress={searchProgress}
      />
    </>
  );

  async function getCommits() {
    setIsSearching(true);

    if (storePat) {
      localStorage.setItem("pat", pat);
    } else {
      localStorage.removeItem("pat");
    }

    const result: RepoResult[] = [];
    const progress: SearchProgress = {
      projects: { total: projects.length, current: 0 },
      repos: { total: 0, current: 0 },
    };

    for (const project of projects) {
      try {
        const reposResponse = await makeDevOpsRequest(
          project,
          "/git/repositories?api-version=7.0"
        );

        progress.repos.total += reposResponse.value.length;
        setSearchProgress(progress);

        for (const repo of reposResponse.value) {
          const repoResult: RepoResult = {
            name: repo.name,
            org: organization,
            project,
            errors: [],
            commits: [],
          };
          result.push(repoResult);

          repoResult.defaultBranch = getDefaultBranch(repo);

          if (!repoResult.defaultBranch) {
            repoResult.errors.push("No default branch found");
            continue;
          }

          const pageSize = 1000;
          let skip = 0;
          let commitPage: Commit[] = [];
          while (skip === 0 || commitPage.length >= pageSize) {
            try {
              const commitsResponse = await makeDevOpsRequest(
                project,
                getCommitUrl(pageSize, skip, repoResult)
              );

              commitPage = commitsResponse.value.map((c: any) => ({
                id: c.commitId,
                message: c.comment,
                date: new Date(c.author.date),
                fileChange: {
                  add: c.changeCounts.Add || 0,
                  edit: c.changeCounts.Edit || 0,
                  delete: c.changeCounts.Delete || 0,
                },
              }));

              repoResult.commits = [...repoResult.commits, ...commitPage];
              skip += pageSize;
              progress.repos.current += 1;
              setSearchProgress(progress);
              onRepoResultUpdate([...result]);
            } catch (err) {
              const r: any = err;
              repoResult.errors.push(
                `${r.status}: ${(await r.json())?.message}`
              );
              progress.repos.current += 1;
              setSearchProgress(progress);
              onRepoResultUpdate([...result]);
              break;
            }
          }
        }
      } catch (error) {
        const r: any = error;
        result.push({
          commits: [],
          errors: [`${r.status}: ${(await r.json())?.message}`],
          defaultBranch: "unknown",
          name: "Unknown",
          org: organization,
          project,
        });
        onRepoResultUpdate([...result]);
      }
      progress.projects.current += 1;
      setSearchProgress(progress);
    }

    setIsSearching(false);
    onRepoResultUpdate([...result]);
  }

  function getDefaultBranch(repo: any) {
    const defaultBranchPaths = repo.defaultBranch?.split("/");
    if (!defaultBranchPaths) {
      return null;
    }

    // remove refs/heads
    return defaultBranchPaths.slice(2).join("/");
  }

  function getCommitUrl(pageSize: number, skip: number, repo: RepoResult) {
    let commitUrl = `/git/repositories/${
      repo.name
    }/commits?searchCriteria.author=${user}&searchCriteria.$top=${pageSize}&searchCriteria.$skip=${skip}&searchCriteria.itemVersion.version=${encodeURIComponent(
      repo.defaultBranch
    )}&api-version=7.0`;

    if (from) {
      commitUrl += `&searchCriteria.fromDate=${toUtcDate(from).toISOString()}`;
    }

    if (to) {
      const utcTo = toUtcDate(to);
      utcTo.setUTCHours(23, 59, 59, 999);
      commitUrl += `&searchCriteria.toDate=${utcTo.toISOString()}`;
    }

    return commitUrl;
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

function toUtcDate(date: Date) {
  if (!date) {
    return date;
  }

  return new Date(date.getTime() - date.getTimezoneOffset() * 60000);
}
