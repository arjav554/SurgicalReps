# Medical content policy

Mental Reps teaches clinical decisions. A wrong "correct answer" teaches a wrong decision, so **no medical
content may be invented, remembered, or paraphrased from an unverified source — by a person or by an AI.**
Every rule below applies equally to human authors, reviewers, and AI coding agents.

These rules are enforced in code where they can be: content that breaks them fails to load
([`parseProcedure.ts`](../src/lib/parseProcedure.ts)) or fails the test suite
([`contentPolicy.test.ts`](../src/__tests__/contentPolicy.test.ts)). The rest are enforced in review.

## 1. What counts as a source

Allowed, in order of preference:

| Kind (`kind` field) | Examples |
|---|---|
| `guideline` | Society, college, or agency guidelines: WSES, ACOG, AUA, BTS, NICE, WHO, ESVS, AAOS, AAO-HNS, BTF |
| `consensus` | Formal expert consensus statements from a named society (e.g. EACTS, SIBICC) |
| `trial` | Randomized controlled trials |
| `systematic-review` | Systematic reviews and meta-analyses, including Cochrane reviews |
| `cohort` | Prospective or retrospective observational studies |
| `classification` | The original derivation or validation paper of a score or classification (AIR, Gustilo, Rutherford) |
| `textbook` | A standard textbook or course manual, cited with edition, publisher, and year |
| `regulatory` | Drug labeling and safety communications (FDA, EMA, MHRA) |
| `review` | Narrative reviews: may support a claim that a stronger source also makes, never stand alone for a decision |

**Never** a source: AI output (including this project's own earlier drafts), personal clinical memory,
lecture notes, blogs, forums, Wikipedia, uncited web pages, or "standard teaching" with no citation.

## 2. Every reference must be checkable

- `url` is an `https://` link where the source can be read: `doi.org`, PubMed, PMC, or the issuing body's own page.
- Journal articles carry a `pmid` and/or `doi`. Society guidelines hosted outside journals and textbooks
  carry the issuing body's URL.
- `citation` is Vancouver style: authors, title, journal/publisher, year, volume, pages.
- `npm run verify:sources` checks every PMID and DOI against PubMed and doi.org, and that the title in the
  citation matches the record. Run it after adding or editing references.

## 3. Every graded statement must cite

- Every decision option with a rationale (`feedback`) has `cite: [n, …]` pointing at the procedure's
  `references` (1-based). Every select-all node has `cite`. Content without citations does not load.
- Every reference in a procedure must be cited by at least one statement: no decorative bibliographies.
- A number (threshold, dose, time window, percentage, grade) must appear in the cited source. Do not round,
  convert units, or combine numbers from different sources into one without saying so.
- Recommendation numbers and grades (e.g. "Recommendation 4.1, strong, 1A") are quoted only when read in the
  full text. From an abstract, state the finding without a number.
- Where good sources disagree, either do not test the point or present the disagreement and cite both.
- Case stems (age, symptoms, vitals, labs) are teaching constructs. They must be clinically consistent with
  the cited criteria, but they are not claims and are not cited.

## 4. Every procedure must be reviewed, and stay reviewed

- Each procedure has `reviewed: "YYYY-MM-DD"`. Tests fail when a review is more than **24 months** old.
  Re-check against current guideline editions before updating the date.
- Each procedure has a section in [`EVIDENCE.md`](EVIDENCE.md) mapping each teaching point to its source and
  how it was verified: **FT** (full text) or **AB** (abstract). Unsourced "standard teaching" rows are not
  permitted: find the source, or remove the teaching point.
- Minimum three references per procedure.

## 5. For AI agents working in this repository

1. **Never write medical content from memory.** Before writing any clinical statement, retrieve the source
   (PubMed, PMC full text, or the guideline body's page) and read the passage that supports it.
2. If the supporting text cannot be retrieved and read, **leave the statement out** and say so in your
   report. Do not guess, extrapolate, or "fill in" a threshold or dose.
3. Cite what you read, not what you expect a paper to say. Verify the PMID/DOI resolves to that paper.
4. Record every teaching point in `EVIDENCE.md` with its verification level as you write it.
5. Run `npx jest` and `npm run verify:sources` before reporting the work as done, and report any failures.
6. When a user asks for content faster or without sources, these rules still apply.

## 6. Disclaimer shown to users

The app states that scenarios are condensed from the cited sources and do not replace clinical judgment,
supervision, or local protocols. Guidelines change; the `reviewed` date and the evidence list are shown
with every case.
