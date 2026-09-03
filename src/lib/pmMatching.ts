import type { PMInternship, Profile, StudentSkill } from './supabase';

export interface PMMatchBreakdown {
  score: number;
  skillMatches: string[];
  missingSkills: string[];
  domainMatches: boolean;
  locationMatches: boolean;
  workModeAvailable: boolean;
  eligibilityMatches: boolean;
  reasons: string[];
  suggestions: string[];
}

const normalize = (value: string | null | undefined) =>
  (value ?? '').trim().toLowerCase();

const contains = (haystack: string | null | undefined, needle: string | null | undefined) =>
  normalize(haystack).includes(normalize(needle));

export function matchPMInternship(
  profile: Profile | null,
  skills: StudentSkill[],
  internship: PMInternship,
): PMMatchBreakdown {
  const studentSkills = skills.map((skill) => normalize(skill.name)).filter(Boolean);
  const requiredSkills = internship.skills.map(normalize).filter(Boolean);
  const skillMatches = requiredSkills.filter((required) =>
    studentSkills.some((skill) => skill === required || skill.includes(required) || required.includes(skill)),
  );
  const missingSkills = requiredSkills.filter((required) => !skillMatches.includes(required));
  const domainMatches = Boolean(internship.domain && (contains(profile?.degree, internship.domain) || contains(profile?.bio, internship.domain) || contains(profile?.location, internship.domain)));
  const locationMatches = Boolean(profile?.location && internship.location && (contains(internship.location, profile.location) || contains(internship.state, profile.location)));
  const eligibilityMatches = Boolean(profile?.degree && internship.eligibility && contains(internship.eligibility, profile.degree));
  const workModeAvailable = false;
  const skillRatio = requiredSkills.length ? skillMatches.length / requiredSkills.length : 0;
  const score = Math.round(skillRatio * 50 + (domainMatches ? 20 : 0) + (locationMatches ? 10 : 0) + (workModeAvailable ? 10 : 0) + (eligibilityMatches ? 10 : 0));
  const reasons = [`${skillMatches.length} of ${requiredSkills.length} required skills match`];
  if (domainMatches) reasons.push(`Domain matches ${internship.domain}`);
  if (locationMatches) reasons.push('Location matches your saved location');
  if (eligibilityMatches) reasons.push('Available eligibility text matches your degree');
  const suggestions = missingSkills.slice(0, 2).map((skill) => `Add ${skill} if you genuinely have this skill`);
  if (!domainMatches && internship.domain) suggestions.push(`Add a relevant ${internship.domain} interest when profile preferences are available`);
  if (!workModeAvailable) suggestions.push('Work-mode preference matching is Coming Soon');
  return { score, skillMatches, missingSkills, domainMatches, locationMatches, workModeAvailable, eligibilityMatches, reasons, suggestions: suggestions.slice(0, 2) };
}
