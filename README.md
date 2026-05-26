# natural-duration

Parse and format human-written time expressions. Covers durations, relative times, and recurring schedules in one small, zero-dependency package.

```
npm install natural-duration
```

## Why

JavaScript has no native way to parse time expressions the way people actually type them. `date-fns` is date-focused and heavyweight. Writing your own regex breaks on edge cases. `natural-duration` is a focused library that handles the full range of natural language time input and stays under 5 KB gzipped.

## Quick start

```ts
import { parseDuration, parseRelative, parseRecurring, formatDuration } from 'natural-duration'

parseDuration('2 hours 30 minutes')
// { hours: 2, minutes: 30, ms: 9000000 }

parseRelative('in 3 days')
// { direction: 'future', duration: { days: 3, ms: 259200000 }, resolvedDate: Date }

parseRecurring('every Monday at 9am')
// { type: 'weekday', day: 1, hour: 9, minute: 0 }

formatDuration({ hours: 2, minutes: 30, ms: 9000000 }, 'verbose')
// '2 hours and 30 minutes'
```

## API

### `parseDuration(input, options?)`

Parses a duration string into a structured object. Always includes `ms` (total milliseconds).

```ts
parseDuration('2 hours 30 minutes')   // { hours: 2, minutes: 30, ms: 9000000 }
parseDuration('1h 45m')               // { hours: 1, minutes: 45, ms: 6300000 }
parseDuration('3 days')               // { days: 3, ms: 259200000 }
parseDuration('90 seconds')           // { seconds: 90, ms: 90000 }
parseDuration('2.5 hours')            // { hours: 2.5, ms: 9000000 }
parseDuration('1.5 days')             // { days: 1.5, ms: 129600000 }
parseDuration('1/2 hour')             // { hours: 0.5, ms: 1800000 }
parseDuration('half an hour')         // { hours: 0.5, ms: 1800000 }
parseDuration('2 and a half hours')   // { hours: 2.5, ms: 9000000 }
parseDuration('a day')                // { days: 1, ms: 86400000 }
parseDuration('1y 2mo 3d')            // { years: 1, months: 2, days: 3, ms: ... }
parseDuration('2 days 3 hours 15 minutes')
// { days: 2, hours: 3, minutes: 15, ms: ... }
```

In **loose mode** (default), unrecognised input returns `{ ms: 0 }`. In **strict mode**, it throws:

```ts
parseDuration('blah', { strict: true }) // throws Error
```

---

### `parseDurationSafe(input, options?)`

Non-throwing variant. Returns the parsed value alongside a `confidence` score (0–1) and the original `input`.

```ts
parseDurationSafe('2 hours')
// { value: { hours: 2, ms: 7200000 }, confidence: 1, input: '2 hours' }

parseDurationSafe('unknown')
// { value: { ms: 0 }, confidence: 0, input: 'unknown' }
```

---

### `parseRelative(input, options?)`

Parses relative time expressions and resolves them to a `Date`. Pass `options.now` to anchor relative to a specific moment instead of the current time.

```ts
parseRelative('in 3 days')
// { direction: 'future', duration: { days: 3, ms: ... }, resolvedDate: Date }

parseRelative('5 minutes ago')
// { direction: 'past', duration: { minutes: 5, ms: ... }, resolvedDate: Date }

parseRelative('tomorrow')
parseRelative('yesterday')
parseRelative('today')
parseRelative('now')

parseRelative('next Monday')
parseRelative('last Friday')

parseRelative('in 1 hour 30 minutes')
parseRelative('2 weeks ago')

// Anchor to a specific moment
parseRelative('next Monday', { now: new Date('2024-06-12') })
```

**direction** is `"future"`, `"past"`, or `"present"`.

---

### `parseRecurring(input, options?)`

Parses recurring schedule expressions.

```ts
// Interval — fires every N units
parseRecurring('every 10 minutes')
// { type: 'interval', every: { minutes: 10 }, ms: 600000 }

parseRecurring('every 2 hours')
// { type: 'interval', every: { hours: 2 }, ms: 7200000 }

parseRecurring('each hour')
// { type: 'interval', every: { hours: 1 }, ms: 3600000 }

// Weekday — fires on a specific day, with optional ordinal and time
parseRecurring('every Monday')
// { type: 'weekday', day: 1 }

parseRecurring('every Monday at 9am')
// { type: 'weekday', day: 1, hour: 9, minute: 0 }

parseRecurring('every Friday at 2:30pm')
// { type: 'weekday', day: 5, hour: 14, minute: 30 }

parseRecurring('every 2nd Tuesday')
// { type: 'weekday', day: 2, nth: 2 }

// Daily — fires every day, with optional time
parseRecurring('every daily at 9am')
// { type: 'daily', hour: 9, minute: 0 }
```

`day` follows JavaScript's `Date.getDay()` convention: 0 = Sunday, 1 = Monday … 6 = Saturday.

---

### `formatDuration(input, style?, locale?)`

Formats a `DurationObject` (or raw milliseconds) back into a human-readable string.

```ts
const d = { hours: 2, minutes: 30, ms: 9000000 }

formatDuration(d)               // '2 hours 30 minutes'   (default: 'long')
formatDuration(d, 'short')      // '2h 30m'
formatDuration(d, 'verbose')    // '2 hours and 30 minutes'

formatDuration({ hours: 1, ms: 3600000 })  // '1 hour'  (correct singular)
formatDuration(3600000)                    // '1 hour'  (accepts raw ms)
formatDuration({ ms: 0 })                 // '0 seconds'
formatDuration({ ms: 0 }, 'short')        // '0s'
```

---

### `msToComponents(ms)`

Decomposes raw milliseconds into a `DurationObject` with the largest-unit breakdown.

```ts
msToComponents(90 * 60 * 1000)  // { hours: 1, minutes: 30, ms: 5400000 }
msToComponents(24 * 3600 * 1000) // { days: 1, ms: 86400000 }
```

---

### `ParseOptions`

All parse functions accept an optional options object:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `strict` | `boolean` | `false` | Throw on unrecognised input instead of returning a zero/empty result |
| `locale` | `string` | `"en"` | BCP 47 locale tag. Falls back to the base language if a region variant isn't registered |
| `now` | `Date` | `new Date()` | Reference point for relative expressions |

---

## Locales

The package ships with English (`"en"`). Additional locales can be registered at runtime:

```ts
import { registerLocale } from 'natural-duration'
import type { LocaleDefinition } from 'natural-duration'

const fr: LocaleDefinition = {
  units: {
    year:   ['an', 'ans', 'année', 'années'],
    month:  ['mois'],
    week:   ['semaine', 'semaines'],
    day:    ['jour', 'jours', 'j'],
    hour:   ['heure', 'heures', 'h'],
    minute: ['minute', 'minutes', 'min'],
    second: ['seconde', 'secondes', 'sec', 's'],
  },
  shortUnits: { year: 'a', month: 'mo', week: 'sem', day: 'j', hour: 'h', minute: 'min', second: 's' },
  relative: {
    future: ['dans', 'après'],
    past: ['il y a', 'avant'],
    ago: ['il y a'],
    in: ['dans'],
    next: ['prochain', 'prochaine'],
    last: ['dernier', 'dernière'],
  },
  recurring: { every: ['chaque', 'tous les', 'toutes les'], at: ['à'] },
  weekdays: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
  weekdayAbbrevs: ['dim', 'lun', 'mar', 'mer', 'jeu', 'ven', 'sam'],
  specials: {
    today: ['aujourd\'hui'],
    tomorrow: ['demain'],
    yesterday: ['hier'],
    now: ['maintenant'],
    halfWords: ['demi', 'et demi'],
    aWord: ['un', 'une'],
    andWord: ['et'],
  },
}

registerLocale('fr', fr)

parseDuration('2 heures 30 minutes', { locale: 'fr' })
// { hours: 2, minutes: 30, ms: 9000000 }
```

---

## TypeScript

The package is written in TypeScript and ships its own types. No `@types/` package needed.

Key types:

```ts
interface DurationObject {
  years?: number; months?: number; weeks?: number;
  days?: number; hours?: number; minutes?: number; seconds?: number;
  ms: number; // always present
}

interface RelativeResult {
  direction: 'future' | 'past' | 'present'
  duration: DurationObject
  resolvedDate: Date
}

type RecurringResult =
  | { type: 'interval'; every: Partial<DurationObject>; ms: number }
  | { type: 'weekday'; day: number; hour?: number; minute?: number; nth?: number }
  | { type: 'daily'; hour?: number; minute?: number }
  | { type: 'monthly'; dayOfMonth: number; hour?: number; minute?: number }

type FormatStyle = 'long' | 'short' | 'verbose'
```

---

## Design notes

**Returns plain objects, not Dates.** `parseDuration` and `parseRecurring` give you numbers. You decide what to do with them — pass `ms` straight to `setTimeout`, compare durations, store in a database.

**`m` means minutes, not months.** Months use `mo`/`mos`. This is the least-surprising default.

**Strict vs. loose.** Default (loose) never throws — unrecognised input returns `{ ms: 0 }` or a zero-duration result. `strict: true` throws `Error` on anything it can't parse. `parseDurationSafe` gives you a `confidence` score as a middle ground.

**1000-character input limit.** All parse functions reject inputs over 1000 characters to prevent denial-of-service from pathological strings. Override by sanitising input before passing it in.

---

## License

MIT
