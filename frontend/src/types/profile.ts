export type LearningStage =
  | "want_to_start" | "learning_basics" | "building_small_app"
  | "personal_development" | "want_team_development" | "professional";

/** 経験値100ごとに1段階。chick が最終段階 */
export type CharacterStage = "egg" | "hatching" | "chick";

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

export const LEARNING_STAGE_LABELS: Record<LearningStage, string> = {
  want_to_start: "これから始めたい",
  learning_basics: "基礎を勉強中",
  building_small_app: "小さなアプリを制作中",
  personal_development: "個人開発に挑戦中",
  want_team_development: "チーム開発に挑戦したい",
  professional: "実務経験あり",
};