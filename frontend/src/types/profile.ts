export type LearningStage =
  | "want_to_start" | "learning_basics" | "building_small_app"
  | "personal_development" | "want_team_development" | "professional";

export type CharacterStage = "egg" | "chick";

export type UserSummary = {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  learningStage: LearningStage | null;
};

export type UserProfile = {
  id: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  learningStage: LearningStage | null;
  technologies: string[];
  githubUrl: string | null;
  contactUrl: string | null;
  experiencePoints: number;
  characterStage: CharacterStage;
  nextEvolution: { required: number; progressPercent: number } | null;
  profileCompleted?: boolean;
};