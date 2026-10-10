# Sentence Workshop

An interactive English grammar course for Grade 5 learners. Students learn parts of speech, build sentences with editable word tiles, and develop their use of six verb tenses through guided practice and reviews.

**[Open Sentence Workshop](https://sentenceworkshop.mtomlinson.ca/)** · [Privacy](https://sentenceworkshop.mtomlinson.ca/privacy.html) · [Current single-file app: v0.7.4](Sentence%20Workshop%20v0.7.4.html)

## What students do

- Study illustrated examples with the app's consistent parts-of-speech colors.
- Identify words by their job in a sentence. Identification hides teaching artwork, category colors and labels until practice is checked.
- Work in a clearly outlined blue practice panel, with a white area for sentence tiles.
- Build sentences by selecting or dragging words, changing word forms, adding descriptions, and supplying capitalization and punctuation.
- Get rule-based feedback and make corrections during practice.
- Complete reviews with first-answer scores and feedback revealed at the end.
- Sign in with Google to save progress and resume on another device.

The grammar checker runs in the browser. It does not use AI to assess student answers.

## Course

| Section | Focus | Lessons and review |
| --- | --- | --- |
| Introduction: Words and their jobs | Nouns, verbs and helping verbs, pronouns, determiners, adjectives, adverbs, prepositions, conjunctions | 8 identification lessons + 16-question review |
| Chapter 1 | Simple present | 6 building lessons + 12-question review |
| Chapter 2 | Present continuous | 6 building lessons + 12-question review |
| Chapter 3 | Simple past | 6 building lessons + 12-question review |
| Chapter 4 | Past continuous | 6 building lessons + 12-question review |
| Chapter 5 | Simple future | 6 building lessons + 12-question review |
| Chapter 6 | Future continuous | 6 building lessons + 12-question review |

Building lessons develop from a simple sentence to articles, adjectives, adverbs, time expressions and joined ideas. All 44 teaching illustrations are embedded in the app, with descriptive alt text. A mixed-tense review provides optional continued practice after the building chapters; a shorter review becomes available after passing at least two building chapters.

**Words and their jobs** is subtitled **An introduction to parts of speech**. Its eight teaching images highlight and label only the target word class; other sentence words and punctuation remain plain. The taller pronoun card places an illustrated object-pronoun example below the subject-pronoun section.

The Introduction uses 26–32 sentence contexts per lesson, including distinctions such as *her* and *fast* in context. Consecutive practice questions use different sentences and focus only on the current word class. Students select its words or answer Yes/No about one outlined word. Checking highlights and labels only that lesson’s target words. Other classes are assessed in their own lessons; the section review covers all eight. Punctuation is taught separately from parts of speech.

Check/Submit buttons are blue. Earned next-question, next-lesson and next-chapter buttons are green. Correct practice answers hide Check; incorrect answers stay on the question for correction. Review answers advance without revealing correctness until the review is finished.

## Getting started

1. Open the [live website](https://sentenceworkshop.mtomlinson.ca/) in a modern browser.
2. Preview the Introduction, or sign in with Google to begin the saved course.
3. Study the lesson example, then start practice.
4. Build readiness through practice, complete the section review, and continue to the next chapter.

Sentence Workshop is in beta testing. Every account follows the same sequence: finish each Introduction lesson, pass the Introduction review, then finish the six lessons and review in each building chapter before starting the next. Earlier earned passes remain valid; old access flags do not bypass prerequisites. Saved answers and earned progress are retained.

The interface adapts to desktop and phone screens. Buttons and keyboard alternatives are available alongside dragging. Automated browser checks use Chrome; native touch dragging and screen-reader behavior have not been fully verified.

## Progress and reviews

The overall indicator shows **percent complete**, based on earned lesson-readiness milestones and passed reviews. Every account has 51 required milestones: 44 lessons and 7 section reviews. A passed review credits its lessons even if an older profile lacks practice-readiness history. Access to a chapter alone does not count as completion.

Readiness and earned review passes remain earned after later weaker work. Corrections help students learn but do not replace their first-answer scores.

### Introduction

- Readiness: 4 correct first answers in a 5-answer window, including successful word-finding and yes/no word-job questions.
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

After the final required review brings the course to 100%, a congratulations screen celebrates completion. **Keep practicing** opens a mixed-tense review; **Revisit lessons** opens Chapter 1 and focuses its lesson menu so students can choose any completed lesson. The final review results remain available in an expandable section below. Reloading the completed final review restores the congratulations screen. Optional practice and weaker retries do not remove earned completion.

## Saving and privacy

Google sign-in is required for the saved course. Progress is synchronized to this app's hidden application-data folder in the student's Google Drive and cached separately per account in the browser. The app requests application-data access, not general access to ordinary Drive documents. Google access tokens remain in memory rather than being saved in browser storage or backups.

Saved information includes the current activity, sentence and identification attempts, original answers, scores, corrections, readiness, review history and course access. The signed-in student can export a progress backup and explicitly import their own compatible single-student backup. Class backups are not uploaded to one student's account.

Use one active tab or device per account. Conflicting changes pause synchronization rather than silently overwrite an original answer. Keep a backup before clearing browser storage or removing the app's Drive data.

There is no separate application database, advertising or analytics. See the [privacy policy](privacy.html) for details.

## Running and maintaining the app

The course is a static HTML application with JavaScript, styles and lesson images embedded. Browser and device icons are separate files alongside the app. No package installation, build step or application server is required to preview the course.

- `index.html` is the live entry point.
- `Sentence Workshop v0.7.4.html` is the matching versioned release.
- `privacy.html` contains the privacy policy.
- `favicon.svg` and `favicon.ico` provide scalable and multi-size browser-tab icons.
- `icons/` contains PNG icons from 16 to 512 pixels, including Apple and maskable variants.
- `apple-touch-icon.png` provides the 180-pixel Apple home-screen icon.
- `site.webmanifest` declares 192- and 512-pixel launch icons and the app name and colors.
- `CNAME` configures the custom domain for GitHub Pages.
- Older versioned HTML files are retained for reference and rollback.

Download and open the current HTML file to preview lessons. Keep the icon files and manifest beside it, in their existing folders, when hosting your own copy. Google sign-in from a downloaded file opens the hosted website. Saved-course sign-in requires an approved web origin in the existing Google OAuth configuration and the Google Drive API enabled for that project.

GitHub Pages publishes the root of the `main` branch. Keep `index.html` and the current versioned release identical when making an app update. Preserve the existing account-storage keys and validate compatibility before changing progress data. Student backups, account caches and credentials do not belong in this public repository.

### Browser and device icons

The icons use the same sentence-tile artwork as the header. The favicon has transparent corners; Apple and maskable launch icons have an opaque blue background and padding to protect the artwork when a device crops it. Apple icon sizes are 152, 167 and 180 pixels. The ICO contains 16-, 24-, 32-, 48-, 64-, 128- and 256-pixel frames.

A browser or device may offer **Add to Home Screen** or an app shortcut. Availability and installation behavior depend on that platform. The manifest does not provide offline caching; saved-course sign-in and Google synchronization require a connection. Actual iOS and Android home-screen installation has not been tested. See the [web app manifest documentation](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest) and [Apple web-content guidance](https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/ConfiguringWebApplications/ConfiguringWebApplications.html).

### Built-in grammar checks

The app includes 15,912 grammar, rubric and vocabulary-reachability checks. To run them, open the app and execute this in the browser's developer console:

```javascript
const report = await SENTENCE_WORKSHOP.SELFTEST.run();
console.log({ passed: report.passed, checks: report.total, failures: report.failures });
```

The embedded checks assess the grammar engine. Release validation also uses local interaction, progress, simulated Google synchronization and Chrome layout checks. Those local development suites are not shipped in this repository. v0.7.0 checks covered Introduction identification, percentage progress, preservation of existing work, review resume, recovery, conflicting saves, all teaching-image decodes and layouts from 320 to 1440 pixels.

v0.7.1 adds checks for the framed work areas, retained drafts, word editing, dragging, Undo, hidden identification clues, all icon dimensions, same-origin image loading and the manifest. Desktop and phone layouts were checked from 320 to 1440 pixels. The grading and progress logic is unchanged from v0.7.0.

v0.7.2 replaces all eight Introduction images, updates their descriptive alt text, names the chapter Words and their jobs with its subtitle, and gives the practice panels matching thin borders. Browser checks cover all eight image decodes, aspect ratios, narrow-screen layouts, neutral identification, the review and saved-answer resume. Grading, authored questions and progress storage remain unchanged.

v0.7.3 enforces sequential access for every beta account, expands the Introduction practice bank, isolates practice prompts and feedback by word class, and clarifies submission and earned next-step buttons. Checks cover the entire course sequence, fresh contexts, target-only cues, corrections, original scores, practice/review reload, recovery, backups, Google synchronization and Chrome layouts. Previously saved question sources retain their original answers so existing beta progress remains compatible.

v0.7.4 adds the congratulations screen and its practice/revisit options. Completion checks cover a genuine final-review pass, incomplete and unsuccessful reviews, restoration after reload, both actions, optional-review resume, retained 100% completion, final-answer access and desktop/phone layouts. Grading, readiness rules and saved progress formats are unchanged.

Real-account Google authorization is not established by simulated sign-in tests. The earlier first-click sign-in issue still needs verification with a fresh real account.

## Contributing

Describe the classroom problem and expected student behavior in an issue or pull request. Keep changes focused, preserve saved student work, and check both desktop and narrow-screen layouts. Changes to grading or progression should include a reproducible example and an explanation of the effect on existing students.
