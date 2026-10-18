# SentenceWorkshop classroom reporting

Two private Sheets are in Michael’s ChatGPT Drive folder, owned by `michael.t@ku.th` and shared with his reporting account `pickripper@gmail.com`. FactFlow’s originals and receivers are unchanged.

- IP5/8: https://docs.google.com/spreadsheets/d/1oibqmKsvz_LfC9Pg45mqjFd_fJujFG38VjeGNwcsNP4/edit
- IP5/9: https://docs.google.com/spreadsheets/d/16XyCCXlszjz_rEZhKgG6CIowR00ART8V-btavYIyv6c/edit

Apps Script project (Gmail reporting account): https://script.google.com/home/projects/1kglf-v5kE57nYjMFjDaPZIUy-9QRbnaySWic-04NVf8J80FtKRq4yxBA/edit

Live receiver: https://script.google.com/macros/s/AKfycbwaE60NToAIbrtCKRnPeBphWvEVx3wyLkjlRYf3Tk5j1yIsfUraMKr_qmGYM3GhrsgN6Q/exec

## Receiver deployment

The project contains `classroom-receiver.gs`. Deploy as a web app, executing as the reporting account, with access set to Anyone. This allows the student app to submit summaries without giving students access to the Sheets. Google authorization is required for the receiver to edit spreadsheets. The code opens only the two spreadsheet IDs in `CLASS_SHEETS`; there is no fallback destination or endpoint that returns student records.

The main app script carries `data-cfasync="false"`, following [Cloudflare’s script exclusion guidance](https://developers.cloudflare.com/speed/optimization/content/rocket-loader/ignore-javascripts/). Preserve it when rebuilding: Rocket Loader otherwise rewrites the inline script into a deferred type, while the app’s strict security policy blocks the injected loader and prevents startup.

The receiver is deployed as version 1. For a future replacement deployment, set the `CLASSROOM_REPORT` endpoint in `Sentence Workshop v0.7.6.html`, rebuild `index.html` with `node scripts/build-hosted.cjs "Sentence Workshop v0.7.6.html"`, and publish the site. To update the receiver later, edit the same project and update the existing deployment to a new version, preserving its URL.

## Reporting behavior

Student links are `https://sentenceworkshop.mtomlinson.ca/?t=IP5/8` and `https://sentenceworkshop.mtomlinson.ca/?t=IP5/9`. No class parameter means personal progress only; unknown class codes do not submit.

Students sign in normally with Google. A report is queued after sign-in and when a progress summary changes, with a short delay to combine nearby changes. Reports contain aggregate readiness/pass status, not raw answers or access tokens. The student’s existing course progress remains in their own Drive app-data folder; reports reflect that personal progress rather than a separate progress record per class.

The receiver checks the exact class/spreadsheet pair, field bounds and schema before taking a write lock. It updates one row per Google account and appends one log record per unique update ID. Older client timestamps remain in the log but cannot replace newer summaries. Public GET requests return receiver metadata or a yes/no receipt for an update ID, never student records. The app confirms that receipt before displaying success. Failed updates remain in the browser, separated by class and Google account, for automatic retry while open or on the next sign-in. Keep one active tab/device per student, as with private Drive sync.

This follows FactFlow’s lightweight self-reported pattern: a class link is not proof of enrollment, and a report is not independently verified grading. The receiver is publicly reachable for submissions. Keep Sheet sharing restricted to intended teachers, and retire the deployment at the end of the year if reporting should stop. Archive the Sheet normally in Drive; deleting it or removing the receiver account’s edit access stops writes. Removing the `t` parameter from future student links also stops classroom submissions.

## Checks

`node tests/classroom-report.cjs` checks routing, both class destinations, malformed reports, formula-like names, duplicate and out-of-order updates, receipt privacy, failed-send retries and signed-out/invalid/testing-mode isolation. `node tests/standard-access.cjs` and `node tests/storage-health.cjs` cover unchanged course gates and private storage. A real anonymous web-app write and receipt must be verified before publishing a new endpoint; a successful local test is not deployment verification.

Verified 18 October 2026: anonymous updates and repeated sends reached both configured Sheets, with one summary and one log entry per update; stored receipts matched the target class. Browser checks using simulated Google identity and the real deployed receiver confirmed both class routes, the saved status, cross-origin requests, no token disclosure and rejection of an invalid class link. Setup-test rows were removed afterward. Real student account sign-in was not repeated. All 15,912 grammar checks, course gates, storage checks and mobile/tablet checks passed.
