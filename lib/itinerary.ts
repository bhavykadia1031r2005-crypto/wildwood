import {
  activities,
  interests as interestOptions,
  tripLengths,
  type Activity,
  type Budget,
  type Interest,
  type Slot,
  type TravelGroup,
  type TravelStyle,
  type TripLength,
} from "@/data/itinerary";
import { areas } from "@/data/attractions";
import { formatList, hashString, seededRandom } from "./utils";

export type TripPreferences = {
  style: TravelStyle | null;
  length: TripLength | null;
  interests: Interest[];
  group: TravelGroup | null;
  budget: Budget | null;
};

export type CompletePreferences = TripPreferences & {
  style: TravelStyle;
  length: TripLength;
  group: TravelGroup;
};

export type PlannedStop = { slot: Slot; activity: Activity };
export type PlannedDay = { day: number; theme: string; stops: PlannedStop[] };
export type Itinerary = { title: string; summary: string; days: PlannedDay[] };

export const emptyPreferences: TripPreferences = {
  style: null,
  length: null,
  interests: [],
  group: null,
  budget: null,
};

export const SLOTS: Slot[] = ["morning", "afternoon", "evening"];

export function isComplete(p: TripPreferences): p is CompletePreferences {
  return Boolean(p.style && p.length && p.group && p.interests.length > 0);
}

/** Number of the four required steps (style, length, interests, group) completed. */
export function completedSteps(p: TripPreferences) {
  return [p.style, p.length, p.interests.length > 0, p.group].filter(Boolean).length;
}

function score(a: Activity, p: CompletePreferences, rand: () => number) {
  let s = 0;
  s += a.interests.filter((i) => p.interests.includes(i)).length * 3;
  if (a.styles.includes(p.style)) s += 2.5;
  if (a.groups && !a.groups.includes(p.group)) s -= 4;
  if (p.budget && a.budget > p.budget) s -= (a.budget - p.budget) * 2.5;
  return s + rand() * 1.6;
}

const interestThemes: Record<Interest, string> = {
  beaches: "Sun, sand & salt air",
  boardwalk: "Boardwalk classics",
  amusement: "Thrills on the piers",
  dining: "Taste of the shore",
  shopping: "Treasures & souvenirs",
  nature: "Wild side of the island",
  events: "Neon, music & happenings",
};

/**
 * Builds a day-by-day plan from local sample data. Deterministic for a given
 * set of preferences and `variant`, so "shuffle" produces a fresh but stable mix.
 */
export function generateItinerary(p: CompletePreferences, variant = 0): Itinerary {
  const length = tripLengths.find((t) => t.id === p.length)!;
  const rand = seededRandom(hashString(JSON.stringify(p)) + variant * 7919);
  const used = new Set<string>();
  const days: PlannedDay[] = [];

  for (let d = 1; d <= length.days; d++) {
    const stops: PlannedStop[] = [];
    const dayAreas = new Set<string>();

    for (const slot of SLOTS) {
      const candidates = activities
        .filter((a) => a.slots.includes(slot) && !used.has(a.id))
        .map((a) => ({
          a,
          // Gently favour staying in one or two areas per day.
          s: score(a, p, rand) + (dayAreas.size && dayAreas.has(a.area) ? 0.8 : 0),
        }))
        .sort((x, y) => y.s - x.s);

      // Long trips may exhaust the best matches; allow repeats as a last resort.
      const pick =
        candidates[0]?.a ??
        activities.filter((a) => a.slots.includes(slot)).sort(() => rand() - 0.5)[0];
      if (!pick) continue;
      used.add(pick.id);
      dayAreas.add(pick.area);
      stops.push({ slot, activity: pick });
    }

    const counts = new Map<Interest, number>();
    stops.forEach(({ activity }) =>
      activity.interests
        .filter((i) => p.interests.includes(i))
        .forEach((i) => counts.set(i, (counts.get(i) ?? 0) + 1)),
    );
    const top = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? p.interests[0];
    days.push({ day: d, theme: interestThemes[top], stops });
  }

  const interestLabels = p.interests.map(
    (id) => interestOptions.find((i) => i.id === id)!.label.toLowerCase(),
  );
  const dayWord = length.days === 1 ? "one-day" : `${length.days}-day`;

  return {
    title: `Your ${dayWord} ${stylePhrases[p.style]}`,
    summary: `Planned for ${groupPhrases[p.group]}, built around ${formatList(interestLabels)}.`,
    days,
  };
}

const stylePhrases: Record<TravelStyle, string> = {
  family: "family getaway",
  adventure: "shore adventure",
  relax: "beach reset",
  romantic: "romantic escape",
  foodie: "foodie tour",
};

const groupPhrases: Record<TravelGroup, string> = {
  solo: "a solo traveller",
  couple: "the two of you",
  family: "the whole family",
  friends: "you and your crew",
};

export function areaName(id: string) {
  return areas.find((a) => a.id === id)?.name ?? "The Wildwoods";
}

export function itineraryToText(it: Itinerary) {
  const lines = [it.title.toUpperCase(), it.summary, ""];
  for (const day of it.days) {
    lines.push(`DAY ${day.day} — ${day.theme}`);
    for (const stop of day.stops) {
      lines.push(
        `  ${stop.slot[0].toUpperCase()}${stop.slot.slice(1)}: ${stop.activity.title} (${areaName(stop.activity.area)})`,
      );
    }
    lines.push("");
  }
  lines.push("Suggestions only — check hours and seasonal availability before you go.");
  return lines.join("\n");
}
