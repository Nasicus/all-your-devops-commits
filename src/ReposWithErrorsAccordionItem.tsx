import { Accordion } from "@mantine/core";
import { FC, Fragment } from "react";
import { RepoLink } from "./RepoLink";
import { RepoResult } from "./models";

export const ReposWithErrorsAccordionItem: FC<{ result: RepoResult[] }> = ({
  result,
}) => {
  const reposWithErrors = result.filter((r) => r.commits.errors.length > 0);

  return (
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
  );
};
