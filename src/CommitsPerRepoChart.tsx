import { FC } from "react";
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";
import { RepoResult } from "./models";

export const CommitsPerRepoChart: FC<{ commits: RepoResult[] }> = ({
  commits,
}) => {
  return (
    <>
      <h2>Top 10 Repos</h2>
      <BarChart width={730} height={250} data={getCommitsByRepo()}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis dataKey="commits" />
        <Tooltip />
        <Bar dataKey="commits" fill="#8884d8" />
      </BarChart>
    </>
  );

  function getCommitsByRepo() {
    return commits
      .map((r) => ({
        name: r.name,
        commits: r.commits.length,
      }))
      .sort((a, b) => b.commits - a.commits)
      .slice(0, 10);
  }
};
