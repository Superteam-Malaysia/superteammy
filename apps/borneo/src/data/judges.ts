import { withBasePath } from "@/lib/base-path";

export type Judge = {
  id: string;
  name: string;
  role: string;
  photo?: string;
};

/** Demo Day judges — Summit-style speaker cards. */
export const DEMO_DAY_JUDGES: Judge[] = [
  { id: "sam", name: "Sam", role: "SOCOE", photo: withBasePath("/judges/sam.jpg") },
  {
    id: "chaerin",
    name: "Chaerin",
    role: "Solana Foundation",
    photo: withBasePath("/judges/chaerin.jpg"),
  },
  {
    id: "jacob",
    name: "Jacob",
    role: "Superscrypt",
    photo: withBasePath("/speakers/jacob-ko.jpg"),
  },
  {
    id: "anatoly",
    name: "Anatoly",
    role: "No Limit Holdings",
    photo: withBasePath("/judges/anatoly.jpg"),
  },
];
