# Sentence Workshop

An interactive English grammar course for Grade 5 learners. Students learn parts of speech, build sentences with editable word tiles, and develop their use of six verb tenses through guided practice and reviews.

**[Open Sentence Workshop](https://sentenceworkshop.mtomlinson.ca/)** · [Privacy](https://sentenceworkshop.mtomlinson.ca/privacy.html) · [Current single-file app: v0.7.0](Sentence%20Workshop%20v0.7.0.html)

## What students do

- Study illustrated examples with the app's consistent parts-of-speech colors.
- Identify words by their job in a sentence. Identification hides teaching artwork, category colors and labels until practice is checked.
- Build sentences by selecting or dragging words, changing word forms, adding descriptions, and supplying capitalization and punctuation.
- Get rule-based feedback and make corrections during practice.
- Complete reviews with first-answer scores and feedback revealed at the end.
- Sign in with Google to save progress and resume on another device.

The grammar checker runs in the browser. It does not use AI to assess student answers.

## Course

| Section | Focus | Lessons and review |
| --- | --- | --- |
| Introduction | Nouns, verbs and helping verbs, pronouns, determiners, adjectives, adverbs, prepositions, conjunctions | 8 identification lessons + 16-question review |
| Chapter 1 | Simple present | 6 building lessons + 12-question review |
| Chapter 2 | Present continuous | 6 building lessons + 12-question review |
| Chapter 3 | Simple past | 6 building lessons + 12-question review |
| Chapter 4 | Past continuous | 6 building lessons + 12-question review |
| Chapter 5 | Simple future | 6 building lessons + 12-question review |
| Chapter 6 | Future continuous | 6 building lessons + 12-question review |

Building lessons develop from a simple sentence to articles, adjectives, adverbs, time expressions and joined ideas. All 44 teaching illustrations are embedded in the app, with descriptive alt text. A mixed-tense review provides optional continued practice after the building chapters; a shorter review becomes available after studying at least two tenses.

The Introduction uses authored sentence contexts, including distinctions such as *her* as a pronoun or determiner and *fast* as an adjective or adverb. Punctuation is taught separately from parts of speech.

## Getting started

1. Open the [live website](https://sentenceworkshop.mtomlinson.ca/) in a modern browser.
2. Preview the Introduction, or sign in with Google to begin the saved course.
3. Study the lesson example, then start practice.
4. Build readiness through practice, complete the section review, and continue to the next chapter.

New students begin with the Introduction. Returning students retain their previous drafts, attempts, earned progress and accessed chapters; the new Introduction is optional for them.

The interface adapts to desktop and phone screens. Buttons and keyboard alternatives are available alongside dragging. Automated browser checks use Chrome; native touch dragging and screen-reader behavior have not been fully verified.

## Progress and reviews

The overall indicator shows **percent complete**, based on earned lesson-readiness milestones and passed reviews. New students have 51 required milestones: 44 lessons and 7 section reviews. Returning students have 42, with the Introduction optional. A passed review credits its lessons even if an older profile lacks practice-readiness history. Access to a chapter alone does not count as completion.

Readiness and earned review passes remain earned after later weaker work. Corrections help students learn but do not replace their first-answer scores.

### Introduction

- Readiness: 4 correct first answers in a 5-answer window, including successful word-finding and category-naming questions.
- Review: 16 questions, two per part of speech.
- Pass: at least 14/16 correct, with at least one correct answer in every category.

### Building chapters

- Readiness: correct grammar on at least 4 of 5 scored first answers, including the relevant subject-number and time-position coverage.
- Review: 12 questions, two per lesson.
- Pass: grammar on at least 10/12, verb forms/agreement on 11/12, capitalization and punctuation on 10/12 each, with grammar success in every lesson and the required coverage.

Reviews hide lesson navigation, teaching examples and correctness feedback while active. Reloading or signing in again resumes an unfinished review. In building reviews, skipped or checker-unscored questions receive fresh replacement questions while preserving scored answers and the original history.

An unsuccessful review recommends focused practice. Fresh first answers establish recovery readiness before a fresh retry. Retries are unlimited; after repeated unsuccessful reviews, the app suggests working with a teacher.

These are classroom pilot readiness rules, not empirically validated mastery thresholds.

### Completing the course

Passing all required section reviews brings progress to 100%. Students can revisit lessons and use mixed-tense reviews for continued practice without losing earned completion.

A dedicated congratulations/completion screen is planned. It is not included in v0.7.0; students currently remain on their review results after the final chapter.

## Saving and privacy

Google sign-in is required for the saved course. Progress is synchronized to this app's hidden application-data folder in the student's Google Drive and cached separately per account in the browser. The app requests application-data access, not general access to ordinary Drive documents. Google access tokens remain in memory rather than being saved in browser storage or backups.

Saved information includes the current activity, sentence and identification attempts, original answers, scores, corrections, readiness, review history and course access. The signed-in student can export a progress backup and explicitly import their own compatible single-student backup. Class backups are not uploaded to one student's account.

Use one active tab or device per account. Conflicting changes pause synchronization rather than silently overwrite an original answer. Keep a backup before clearing browser storage or removing the app's Drive data.

There is no separate application database, advertising or analytics. See the [privacy policy](privacy.html) for details.

## Running and maintaining the app

This is a static, single-file HTML application with JavaScript, styles and lesson images embedded. No package installation, build step or application server is required to preview it.

- `index.html` is the live entry point.
- `Sentence Workshop v0.7.0.html` is the matching versioned release.
- `privacy.html` contains the privacy policy.
- `CNAME` configures the custom domain for GitHub Pages.
- Older versioned HTML files are retained for reference and rollback.

Download and open the current HTML file to preview lessons. Google sign-in from a downloaded file opens the hosted website. Saved-course sign-in requires an approved web origin in the existing Google OAuth configuration and the Google Drive API enabled for that project.

GitHub Pages publishes the root of the `main` branch. Keep `index.html` and the current versioned release identical when making an app update. Preserve the existing account-storage keys and validate compatibility before changing progress data. Student backups, account caches and credentials do not belong in this public repository.

### Built-in grammar checks

The app includes 15,912 grammar, rubric and vocabulary-reachability checks. To run them, open the app and execute this in the browser's developer console:

```javascript
const report = await SENTENCE_WORKSHOP.SELFTEST.run();
console.log({ passed: report.passed, checks: report.total, failures: report.failures });
```

The embedded checks assess the grammar engine. Release validation also uses local interaction, progress, simulated Google synchronization and Chrome layout checks. Those local development suites are not shipped in this repository. v0.7.0 checks covered Introduction identification, percentage progress, preservation of existing work, review resume, recovery, conflicting saves, all teaching-image decodes and layouts from 320 to 1440 pixels.

Real-account Google authorization is not established by simulated sign-in tests. The earlier first-click sign-in issue still needs verification with a fresh real account.

## Contributing

Describe the classroom problem and expected student behavior in an issue or pull request. Keep changes focused, preserve saved student work, and check both desktop and narrow-screen layouts. Changes to grading or progression should include a reproducible example and an explanation of the effect on existing students.
