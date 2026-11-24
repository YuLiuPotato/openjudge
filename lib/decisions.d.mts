export type Choice = 'a' | 'b' | 'unsure';
export type Decision = {
  id: string; title: string; context: string; optionA: string; optionB: string; optionADescription?: string; optionBDescription?: string;
  category: string; goal: string; risk: string; createdAt: number; reviewCount: number;
  isOwner: boolean; hasReviewed: boolean; canSeeResults?: boolean; myChoice?: Choice | null;
  counts?: Record<Choice, number>;
  reviews?: { id: string; choice: Choice; reason: string; createdAt: number; isMine: boolean }[];
};
export type DecisionInput = { title: string; context: string; optionA: string; optionB: string; optionADescription?: string; optionBDescription?: string; category: string; goal: string; risk: string; privacyConfirmed: boolean };
export type ReviewInput = { choice: Choice; reason: string };
export class DecisionError extends Error { status: number; constructor(message: string, status?: number); }
export function createDecision(db: D1Database, userId: string | null, input: unknown): Promise<Decision>;
export function listDecisions(db: D1Database, userId: string | null): Promise<Decision[]>;
export function getDecision(db: D1Database, id: string, userId: string | null): Promise<Decision | null>;
export function submitReview(db: D1Database, id: string, userId: string | null, input: unknown): Promise<Decision>;
export function deleteDecision(db: D1Database, id: string, userId: string | null): Promise<boolean>;
