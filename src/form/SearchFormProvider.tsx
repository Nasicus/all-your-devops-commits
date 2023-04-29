import { FC, PropsWithChildren, createContext, useState } from "react";

export interface SearchSearchFormContextType {
  organization: string;
  setOrganization: (organization: string) => unknown;
  projects: string[];
  setProjects: (projects: string[]) => unknown;
  pat: string;
  setPat: (pat: string) => unknown;
  storePat: boolean;
  setStorePat: (storePat: boolean) => unknown;
  user: string;
  setUser: (user: string) => unknown;
  from: Date;
  setFrom: (from: Date) => unknown;
  to: Date;
  setTo: (to: Date) => unknown;
  isValid: boolean;
}

export const SearchFormContext =
  createContext<SearchSearchFormContextType>(null);

export const SearchFormProvider: FC<PropsWithChildren> = ({ children }) => {
  const [organization, setOrganization] = useState("");
  const [projects, setProjects] = useState<string[]>([]);
  const [pat, setPat] = useState("");
  const [storePat, setStorePat] = useState(false);
  const [user, setUser] = useState("");
  const [from, setFrom] = useState<Date>();
  const [to, setTo] = useState<Date>();

  return (
    <SearchFormContext.Provider
      value={{
        organization,
        setOrganization,
        projects,
        setProjects,
        user,
        setUser,
        from,
        setFrom,
        to,
        setTo,
        pat,
        setPat,
        storePat,
        setStorePat,
        isValid: !!pat && !!user && !!organization && projects.length > 0,
      }}
    >
      {children}
    </SearchFormContext.Provider>
  );
};
