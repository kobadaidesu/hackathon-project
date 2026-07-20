import type { UserSummary, LearningStage } from "./profile";

export type Recruitment = {
  id: string;
  owner: UserSummary;
  title: string;
  description: string;
  technologies: string[];
  preferredLearningStage: LearningStage | null;
  beginnerFriendly: boolean;
  status: "open" | "closed";
  interestCount: number;
  isInterestedByMe: boolean;
  createdAt: string;
};

export type InterestResponse = { interestCount: number; isInterestedByMe: boolean };