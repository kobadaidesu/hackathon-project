export type LearningStage =
  | "want_to_start" | "learning_basics" | "building_small_app"
  | "personal_development" | "want_team_development" | "professional";

/** 経験値100ごとに1段階。順序はこの並びどおりで、rooster が最終段階 */
export const CHARACTER_STAGES = [
  "egg", "hatching", "chick",
  "brown", "green", "blue", "gold", "pink", "rooster",
] as const;

export type CharacterStage = (typeof CHARACTER_STAGES)[number];

/**
 * レベルは段階の添字そのもの(egg=0 … rooster=8)。
 * バックエンドの 経験値 // EVOLUTION_THRESHOLD と同じ値になるので、
 * 閾値(100)をフロントに持たずに済み、画像とレベルがずれることもない。
 */
export function characterLevel(stage: CharacterStage): number {
  return CHARACTER_STAGES.indexOf(stage);
}

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