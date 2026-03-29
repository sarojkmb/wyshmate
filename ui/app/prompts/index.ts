import { anniversaryPrompts } from './anniversary';
import { birthdayPrompts } from './birthday';
import { farewellPrompts } from './farewell';

export function getPromptsForOccasion(occasion?: string | null) {
  const normalized = occasion?.trim().toLowerCase();

  if (normalized === 'birthday') {
    return birthdayPrompts;
  }

  if (normalized === 'farewell') {
    return farewellPrompts;
  }

  return anniversaryPrompts;
}
