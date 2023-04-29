import { Textarea } from "@mantine/core";
import { FC, useContext, useEffect } from "react";
import { SearchFormContext } from "./SearchFormProvider";

export const ProjectsInput: FC = () => {
  const { projects, setProjects } = useContext(SearchFormContext);

  useEffect(() => {
    setProjects(getProjectsFromQuery());
  }, [setProjects]);

  return (
    <Textarea
      placeholder="one line per project"
      label="Projects"
      value={projects.join("\n")}
      required
      onChange={(e) => setProjects(e.target.value.split("\n"))}
    />
  );

  function getProjectsFromQuery() {
    const urlSearchParams = Array.from(
      new URLSearchParams(window.location.search).entries()
    );

    return urlSearchParams.filter((e) => e[0] === "project").map((e) => e[1]);
  }
};
