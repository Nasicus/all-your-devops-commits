import { FC } from "react";
import { Commit } from "./models";
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";

export const CommitsPerMonthChart: FC<{ commits: Commit[] }> = ({
  commits,
}) => {
  <h2>Commits by months</h2>;
  return (
    <BarChart width={730} height={250} data={getCommitsByMonths()}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="month" />
      <YAxis dataKey="commits" />
      <Tooltip />
      <Bar dataKey="commits" fill="#8884d8" />
    </BarChart>
  );

  function getCommitsByMonths() {
    return commits
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
