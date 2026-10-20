# EmDash upgrade work order

This file is the handoff for upgrading the project at `/Users/redmomn/workspace/webstorm/blog` to the npm `latest` release. The updater resolved the direct packages, changed and installed them where needed, refreshed the project EmDash skills, and compared the installed core migration manifests. It did not edit application code, apply a database migration, or deploy the site.

## Package changes

- `@emdash-cms/cloudflare`: `0.37.0` → `1.3.1` (`^0.37.0` → `^1.3.1`)
- `@emdash-cms/plugin-forms`: `0.2.6` → `0.2.11` (`^0.2.6` → `^0.2.11`)
- `@emdash-cms/plugin-webhook-notifier`: `0.2.0` → `0.2.3` (`^0.2.0` → `^0.2.3`)
- `emdash`: `0.37.0` → `1.3.1` (`^0.37.0` → `^1.3.1`)

## Release entries to assess

These are the complete authored major, minor, and patch entries crossed by the direct EmDash packages in this project. Changesets dependency-bump entries and attribution wrappers have been removed. Check whether each entry affects code or configuration in this project. Do not adopt an unrelated feature merely because it appears here.

### Change 1

Applies to: `@emdash-cms/cloudflare@1.3.1` (patch)  
Source: [#4234](https://github.com/emdash-cms/emdash/pull/4234)

Fixes imports of `d1()`, `r2()`, `kvCache()`, and other config descriptors when `wrangler` is not installed. Wrangler is now an optional peer dependency and is only loaded when calling `sandbox()`. Projects using `sandbox()` must still install `wrangler`.

### Change 2

Applies to: `@emdash-cms/cloudflare@1.3.0` (patch)  
Source: [#3886](https://github.com/emdash-cms/emdash/pull/3886)

Fixes sandboxed plugins' `ctx.media.readBytes()` calls failing with "Media storage is not configured" under concurrent requests on Cloudflare Workers with an R2 `MEDIA` binding. Sites without that binding continue to use the existing storage callback fallback.
  
  Updates `createPluginRuntimeTestHost()` to store media fixtures and uploads in its local R2 binding, so plugins can read their bytes through the production bridge.

### Change 3

Applies to: `@emdash-cms/cloudflare@1.3.0` (patch)  
Source: [#4047](https://github.com/emdash-cms/emdash/pull/4047)

Fixes the Playground toolbar covering the end of site pages on narrow screens. Site pages now leave room below their last content, so footer links and buttons such as the theme switcher can be scrolled clear of the toolbar and clicked.

### Change 4

Applies to: `@emdash-cms/cloudflare@1.3.0` (patch), `emdash@1.3.0` (patch)  
Source: [#4053](https://github.com/emdash-cms/emdash/pull/4053)

Fixes the `defaultRole` and `roleMapping` hover text for external auth providers and Cloudflare Access, which called role 30 "Editor" and role 40 "Developer". Role 30 is Author and can publish its own content, and role 40 is Editor. Only the descriptions and examples changed, not how roles resolve.
  
  #### What should I do?
  
  If you set `defaultRole` or a `roleMapping` entry to `30` because the hover text said Editor, check that Author access is what you meant. Use `20` (Contributor) for people who should not publish. The Access `defaultRole` still defaults to `30`.

### Change 5

Applies to: `@emdash-cms/cloudflare@1.2.0` (minor), `emdash@1.2.0` (minor)  
Source: [#3875](https://github.com/emdash-cms/emdash/pull/3875)

Adds a `syncName` option to external auth providers such as Cloudflare Access. By default, EmDash still replaces a user's name with the provider's name on every authenticated request, so a name edited in the admin is restored on that user's next request. Set `syncName: false` to keep names edited in the admin; the provider's name is then used only when the user is first provisioned.
  
  ```js
  auth: access({
  	teamDomain: "myteam.cloudflareaccess.com",
  	syncName: false,
  }),
  ```

### Change 6

Applies to: `@emdash-cms/cloudflare@1.2.0` (patch), `emdash@1.2.0` (patch)  
Source: [#3828](https://github.com/emdash-cms/emdash/pull/3828)

Fixes videos served from `/_emdash/api/media/file/` not playing in Safari and on iOS, and not seeking past the buffered part in other browsers. With the local, S3, and R2 storage adapters, the media route answers `Range` requests with `206 Partial Content`, or `416 Range Not Satisfiable` for a range past the end of the file, and sends `Accept-Ranges: bytes`.
  
  Custom storage adapters can serve ranges by accepting the optional `options.range` argument to `download()` and setting `range` on the result, as described in [the storage interface docs](https://docs.emdashcms.com/deployment/storage/#byte-ranges). Adapters that ignore the argument still work: range requests to them receive the whole file, or `416` for a range past the end of the file.

### Change 7

Applies to: `@emdash-cms/cloudflare@1.2.0` (patch), `emdash@1.2.0` (patch)  
Source: [#3855](https://github.com/emdash-cms/emdash/pull/3855)

Adds `ETag` and `Last-Modified` validators to media file responses and `/image` transforms, and returns `304 Not Modified` when a browser's `If-None-Match` or `If-Modified-Since` precondition matches. This lets cached mutable media (images that can be replaced under the same storage key) be revalidated with a single header exchange instead of re-downloaded on every visit. Storage backends now report `lastModified` with downloads where available (local filesystem, S3-compatible, and R2). The short `public, max-age=0, must-revalidate` cache lifetime for images is unchanged, so replacements still appear immediately.

### Change 8

Applies to: `@emdash-cms/cloudflare@1.2.0` (patch), `emdash@1.2.0` (patch)  
Source: [#3776](https://github.com/emdash-cms/emdash/pull/3776)

Fixes plugin `ctx.storage.<collection>.getMany()` and `deleteMany()` failing on D1 with `too many SQL variables` when passed more than 98 ids. Both now accept any number of ids, in trusted and sandboxed plugins alike.

### Change 9

Applies to: `@emdash-cms/cloudflare@1.2.0` (patch), `emdash@1.2.0` (patch)  
Source: [#3681](https://github.com/emdash-cms/emdash/pull/3681)

Fixes stored cross-site scripting through the editor toolbar. EmDash inserted the toolbar before the first `</body>` in a response, but Astro leaves `<` and `>` unescaped in attribute values, so content such as an image's alt text could contain `</body>` and move the toolbar inside that attribute, turning the rest of the text into live markup. The editor toolbar, and the Cloudflare preview and playground toolbars, now go only before the closing body tag of a whole HTML document, never into server island or partial page responses.
  
  Before this fix:
  
  - Unless a site set `toolbar: false`, an Author's published content could run script for any signed-in Author, Editor, or Admin who viewed it, and a Contributor's draft could do the same to a signed-in Author, Editor, or Admin who previewed it.
  - With `toolbar: "client"`, published content could also run script for every visitor.
  - In preview Workers built with `createPreviewMiddleware`, published content could run script for anyone who opened a preview link, whatever the `toolbar` setting.

### Change 10

Applies to: `@emdash-cms/cloudflare@1.1.0` (patch)  
Source: [#3633](https://github.com/emdash-cms/emdash/pull/3633)

Fixes Kysely `numAffectedRows` on the Durable Object SQL database backend and the preview database: writes now report the number of changed table rows (SQLite `changes()`) instead of `rowsWritten`, which also counts index entries. This resolves false `stale` outcomes when fencing a collection for deletion with media-usage tracking enabled, and fixes any other `numAffectedRows` / `numUpdatedRows` comparisons against indexed tables.

### Change 11

Applies to: `@emdash-cms/cloudflare@1.0.1` (patch), `emdash@1.0.1` (patch)  
Source: [#3515](https://github.com/emdash-cms/emdash/pull/3515)

Releases EmDash 1.0. This release includes breaking changes, such as removing APIs deprecated during 0.x. Before upgrading from 0.42, read the [upgrade guide](https://docs.emdashcms.com/upgrade-to-v1/), which lists each change and how to migrate.
  
  From this release, breaking changes ship only in a new major version.

### Change 12

Applies to: `@emdash-cms/cloudflare@1.0.1` (patch), `emdash@1.0.1` (patch)  
Source: [#3518](https://github.com/emdash-cms/emdash/pull/3518)

Moves the subpaths that only EmDash itself loads under `emdash/internal/`, and the D1 and Hyperdrive migration executors under `@emdash-cms/cloudflare/internal/`. These paths are not public API: their exports can change or be removed in any release.
  
  Sites that use `emdash()` in `astro.config.mjs` need no changes. The integration, the database, cache and media adapter helpers, and the first-party Cloudflare, workerd sandbox and plugin-test packages all load the new paths automatically.
  
  The following subpaths are removed:
  
  | Removed subpath                                   | Now loaded from                                            |
  | ------------------------------------------------- | ---------------------------------------------------------- |
  | `emdash/routes/*`                                 | `emdash/internal/routes/*`                                 |
  | `emdash/middleware/auth`                          | `emdash/internal/middleware/auth`                          |
  | `emdash/middleware/redirect`                      | `emdash/internal/middleware/redirect`                      |
  | `emdash/middleware/request-context`               | `emdash/internal/middleware/request-context`               |
  | `emdash/middleware/setup`                         | `emdash/internal/middleware/setup`                         |
  | `emdash/middleware/media-usage-write-fence`       | `emdash/internal/middleware/media-usage-write-fence`       |
  | `emdash/image-endpoint`                           | `emdash/internal/image-endpoint`                           |
  | `emdash/media/local-runtime`                      | `emdash/internal/media/local-runtime`                      |
  | `emdash/object-cache/memory`                      | `emdash/internal/object-cache/memory`                      |
  | `emdash/db/sqlite-migrations`                     | `emdash/internal/db/sqlite-migrations`                     |
  | `emdash/db/libsql-migrations`                     | `emdash/internal/db/libsql-migrations`                     |
  | `emdash/db/postgres-migrations`                   | `emdash/internal/db/postgres-migrations`                   |
  | `emdash/database/migration-lock`                  | `emdash/internal/database/migration-lock`                  |
  | `emdash/database/pg-migration-lock`               | `emdash/internal/database/pg-migration-lock`               |
  | `emdash/plugins/host`                             | `emdash/internal/plugins/host`                             |
  | `emdash/plugins/http-wire`                        | `emdash/internal/plugins/http-wire`                        |
  | `emdash/plugins/adapt-sandbox-entry`              | `emdash/internal/plugins/adapt-sandbox-entry`              |
  | `emdash/plugin-test-runtime`                      | `emdash/internal/plugin-test-runtime`                      |
  | `emdash/testing/registry`                         | `emdash/internal/testing/registry`                         |
  | `@emdash-cms/cloudflare/db/d1-migrations`         | `@emdash-cms/cloudflare/internal/db/d1-migrations`         |
  | `@emdash-cms/cloudflare/db/hyperdrive-migrations` | `@emdash-cms/cloudflare/internal/db/hyperdrive-migrations` |
  
  #### What should I do?
  
  If your project or package imports one of the removed subpaths directly, replace the import with a public entrypoint:
  
  - To configure a database, object cache or media provider, use `sqlite()`, `libsql()` or `postgres()` from `emdash/db`, `memoryCache()` from `emdash/astro`, or `localMedia()` from `emdash/media`, instead of writing their entrypoints by hand.
  - To test a plugin, use `@emdash-cms/plugin-test` instead of `emdash/plugin-test-runtime`.
  - To run your own middleware before EmDash's, set the `middleware.outer` option of `emdash()`. The internal auth, setup, redirect and request-context middleware have no public replacement.
  
  Rebuild after upgrading. `emdash migrate` rejects a migration manifest written by an earlier EmDash version.

### Change 13

Applies to: `@emdash-cms/cloudflare@1.0.1` (patch)  
Source: [#3519](https://github.com/emdash-cms/emdash/pull/3519)

Removes the deprecated `cloudflareCache()` route-cache provider and its `@emdash-cms/cloudflare/cache` and `@emdash-cms/cloudflare/cache/config` entry points. Sites that still import `cloudflareCache` fail to build after upgrading.
  
  Switch to native Workers Caching with the Astro Cloudflare adapter's provider. The adapter enables Workers Cache in the generated deployment configuration when this provider is set:
  
  ```diff title="astro.config.mjs"
  - import { cloudflareCache } from "@emdash-cms/cloudflare";
  + import { cacheCloudflare } from "@astrojs/cloudflare/cache";
  
   export default defineConfig({
   	cache: {
  -		provider: cloudflareCache(),
  +		provider: cacheCloudflare(),
   	},
   });
  ```
  
  Invalidation moves to `cache.purge()` from `cloudflare:workers`, so the `CF_ZONE_ID` and `CF_CACHE_PURGE_TOKEN` secrets are no longer needed and can be deleted. The KV object cache (`kvCache()` and `@emdash-cms/cloudflare/cache/kv`) is unchanged.

### Change 14

Applies to: `@emdash-cms/cloudflare@1.0.1` (patch), `emdash@1.0.1` (patch)  
Source: [#3519](https://github.com/emdash-cms/emdash/pull/3519)

Adds a startup warning when an installed or configured plugin declares deprecated capability names such as `read:content`, `network:fetch` or `page:inject`. The warning appears once per plugin and lists each current replacement, for example `read:content → content:read`. The deprecated names keep working throughout 1.x. If a plugin you use triggers the warning, update it, or ask its author to publish a version that uses the current names.
  
  `aiSearch()` from `@emdash-cms/cloudflare` now declares `content:read`, so it no longer triggers the warning.

### Change 15

Applies to: `@emdash-cms/cloudflare@0.42.0` (minor)  
Source: [#3394](https://github.com/emdash-cms/emdash/pull/3394)

Adds the `bylines:read` plugin capability, which lets plugins read public byline profiles and the bylines credited on content entries through `ctx.bylines`.
  
  `ctx.bylines` provides `get()` and cursor-paginated `list()` for profiles, plus `getEntriesBylines()` for credits. `getEntriesBylines()` resolves up to 100 entries of one collection in a single call, so a search indexer or feed plugin can attach author names to a page of `ctx.content.list()` results:
  
  ```ts
  const page = await ctx.content.list("posts", { limit: 100 });
  const credits = await ctx.bylines.getEntriesBylines(
  	"posts",
  	page.items.map((entry) => entry.id),
  );
  ```
  
  Credits match what the site renders: the credits assigned in the editor, or the author's linked byline, marked `source: "inferred"`, when an entry has none. They resolve at the entry's own locale. Profiles omit the linked user account, guest flag, and byline custom field values.
  
  The capability is independent of `content:read` and `users:read`. It is available to native plugins and to sandboxed plugins on Cloudflare Worker Loader and Node.js workerd. Installation and update consent list it as a new permission.

### Change 16

Applies to: `@emdash-cms/cloudflare@0.42.0` (patch)  
Source: [#3335](https://github.com/emdash-cms/emdash/pull/3335)

Fixes sandboxed plugins on Cloudflare reporting that media storage is not configured when `ctx.media.readBytes()` reads an R2-backed media item.

### Change 17

Applies to: `@emdash-cms/cloudflare@0.40.0` (minor)  
Source: [#3333](https://github.com/emdash-cms/emdash/pull/3333)

Adds optional `cc` and `replyTo` fields to plugin email messages, including from sandboxed plugins:
  
  ```ts
  await ctx.email.send({ to, cc: ["team@example.com"], replyTo: visitorEmail, subject, text });
  ```
  
  `ctx.email.send()` throws when `cc` is not an array of strings or `replyTo` is not a string. `email:beforeSend`, `email:deliver`, and `email:afterSend` hooks receive both fields on `event.message`, and the development console provider prints them. The Cloudflare email provider delivers both, and a message's `replyTo` overrides the provider's configured `replyTo`. Custom `email:deliver` providers should pass `cc` and `replyTo` to their email service.

### Change 18

Applies to: `@emdash-cms/cloudflare@0.40.0` (patch)  
Source: [#3352](https://github.com/emdash-cms/emdash/pull/3352)

Fixes `emdash migrate` on Cloudflare D1 failing with `D1 response is too large` in `079_datetime_normalization`. The REST transport refused any response over 1 MiB, and a batch of fifty revisions with their bodies is several MiB on a site with real content. The default bound is now 64 MiB; `maxResponseBytes` still tightens it.

### Change 19

Applies to: `@emdash-cms/cloudflare@0.40.0` (patch)  
Source: [#3151](https://github.com/emdash-cms/emdash/pull/3151)

Fix `cloudflareEmail()` silently failing to reach `binding.send()` on some Astro Cloudflare builds, and make email delivery errors visible in runtime logs.
  
  - The provider now resolves `cloudflare:workers` `env` through a dedicated helper module (`cloudflare-email-env.ts`) so the Worker runtime evaluates it as a static import rather than a direct dynamic import of the built-in specifier. This avoids bundler/runtime paths where `import("cloudflare:workers")` inside the bundled Worker did not resolve.
  - `EmailPipeline.send()` now `console.error`s the provider and recipient before re-throwing a delivery error, so failures are not lost when callers (e.g. magic-link routes) intentionally swallow the error to avoid leaking whether an account exists.
  
  No configuration changes are required; existing `send_email` bindings continue to work.

### Change 20

Applies to: `@emdash-cms/cloudflare@0.40.0` (patch)  
Source: [#3346](https://github.com/emdash-cms/emdash/pull/3346)

Updates sandboxed plugin content writes to respect the site transfer write fence. While a site import is writing, or after a failed or cancelled import until it is abandoned, `ctx.content` create, update, and delete calls fail with `503 TRANSFER_IMPORT_IN_PROGRESS`. When the fence cannot be checked, they now fail with `TRANSFER_FENCE_CHECK_FAILED` instead of `MEDIA_USAGE_ACTIVATION_CHECK_FAILED`.

### Change 21

Applies to: `@emdash-cms/cloudflare@0.40.0` (patch)  
Source: [#3114](https://github.com/emdash-cms/emdash/pull/3114)

Fixes `ctx.kv.set()` and storage collection `put()` and `putMany()` writes for sandboxed plugins on Cloudflare. Overwrites retain creation timestamps, and unique constraint failures preserve existing records.

### Change 22

Applies to: `@emdash-cms/cloudflare@0.39.0` (minor)  
Source: [#3180](https://github.com/emdash-cms/emdash/pull/3180)

Adds binary-safe `ctx.http.fetch()` behavior to sandboxed plugins on Cloudflare Worker Loader and Node/workerd. Request and response bodies are buffered with an 8 MiB decoded limit, and the returned WHATWG `Response` preserves bytes, status text, headers, final URL, redirect state, and clones across both runners.
  
  Redirected requests follow Fetch method and body rules. The Node/workerd runner also applies the installed version's current network capability and host list immediately after a plugin update.
  
  #### Reading binary responses
  
  Read bytes from the buffered response with the standard Response API:
  
  ```ts
  const response = await ctx.http!.fetch("https://api.example.com/report");
  const bytes = new Uint8Array(await response.arrayBuffer());
  ```
  
  #### Testing external HTTP
  
  `createPluginRuntimeTestHost()` adds `http.respond()`, `http.requests()`, and `http.clear()` for deterministic production-bridge tests:
  
  ```ts
  await host.http.respond("https://api.example.com/report", new Response(new Uint8Array([0, 255])));
  await host.transport.invokeRoute("import-report");
  expect(host.http.requests()).toContainEqual(
  	expect.objectContaining({ url: "https://api.example.com/report" }),
  );
  ```

### Change 23

Applies to: `@emdash-cms/cloudflare@0.39.0` (minor)  
Source: [#3171](https://github.com/emdash-cms/emdash/pull/3171)

Adds capability-gated schema, translation, public URL, and content revision discovery for plugins.
  
  Declare `schema:read` to list collection and field definitions through `ctx.schema`. Existing `content:read` access can inspect safe content identity, discover locale siblings with `getTranslations()`, and resolve published routes with `getPublicUrl()`. Public URL resolution follows the site's collection pattern, locale routing, and trailing-slash policy and returns `null` for content without a public route.
  
  Revision snapshots require the separate `content:revisions:read` capability because retained history can contain field values that an administrator removed later. This capability implies ordinary `content:read` access. Installation and plugin updates show both new authorities for consent, and the native, Cloudflare Worker Loader, and Node.js workerd runtimes expose the same methods.

### Change 24

Applies to: `@emdash-cms/cloudflare@0.39.0` (minor)  
Source: [#3184](https://github.com/emdash-cms/emdash/pull/3184)

Adds capability-gated redirect access for sandboxed plugins. Declare `redirects:read` to list redirect rules with cursor pagination and read a rule with an opaque `_rev`. Declare `redirects:write` to create, update, and delete redirect rules; write access implies read access and installation consent states that the plugin can change where visitors are sent.
  
  Redirect mutations use EmDash's redirect validation and cache invalidation path. Writes are serialized across runtimes so duplicate-source and loop validation use a consistent rule graph. The expanded redirect schema remains compatible with writes from previous host processes during rolling deployments. Loop validation runs when a rule is created or its source or destination changes; enabled-only updates retain the host API's existing behavior. Updates and deletes require the latest `_rev`, reject concurrent changes with `CONFLICT`, and do not let plugins set the host-owned automatic redirect marker. The Cloudflare Worker Loader and Node.js workerd runners expose the same API, and `createPluginRuntimeTestHost()` includes redirect fixtures and inspection for production-boundary tests.

### Change 25

Applies to: `@emdash-cms/cloudflare@0.39.0` (minor)  
Source: [#3170](https://github.com/emdash-cms/emdash/pull/3170)

Adds `comments:read` and `comments:moderate` for sandboxed plugins. `ctx.comments` can get, count, and cursor-page through non-trashed comments, and can change a comment between `approved`, `pending`, and `spam` when the caller supplies the status it previously observed.
  
  `comments:read` exposes comment bodies, author names and email addresses, pseudonymous IP hashes, user agents, and moderation metadata. It does not expose the linked EmDash user-account ID. `comments:moderate` implies that read access, and installation or an update that requests either capability requires operator consent.
  
  Status changes use the core moderation path. A stale expected status rejects with `COMMENT_STATUS_CONFLICT`, and an overlapping transition can reject with `COMMENT_MODERATION_IN_PROGRESS`; a successful transition runs `comment:afterModerate` once with the calling plugin's origin and preserves approval notifications. Hard deletion and bulk status replacement are not included.

### Change 26

Applies to: `@emdash-cms/cloudflare@0.39.0` (minor)  
Source: [#3172](https://github.com/emdash-cms/emdash/pull/3172)

Adds separate sandboxed-plugin capabilities for reading media bytes and editing media metadata.
  
  Declare `media:bytes:read` to use `ctx.media.readBytes()`. Reads are available only for ready media, default to a 10 MiB limit, enforce the caller's limit while consuming the storage stream, and cannot request more than 16 MiB. The result includes the content hash; ordinary `media:read` metadata excludes content hashes, storage keys, and author identity.
  
  Ready-media metadata URLs use an authenticated media ID route. Authenticated callers with the `media:read` permission can fetch the asset without receiving its storage key; logged-out requests are rejected before the route queries media.
  
  Declare `media:metadata:write` to use `ctx.media.updateMetadata()` for alt text, captions, and focal points. This capability cannot upload, replace, move, or delete media. It does not imply `media:read` or `media:bytes:read`.
  
  `@emdash-cms/plugin-test` also provides binary media fixtures and inspection through the runtime-backed host so plugin tests can exercise the production Worker Loader bridge.

### Change 27

Applies to: `@emdash-cms/cloudflare@0.39.0` (minor)  
Source: [#3173](https://github.com/emdash-cms/emdash/pull/3173)

Adds `ctx.settings` for plugin configuration and encrypts fields declared as `type: "secret"` before writing them to the database. Native plugins, Cloudflare Worker Loader plugins, and Node/workerd plugins share the same versioned AES-GCM envelope and plugin-scoped API. `@emdash-cms/plugin-test` can update generated settings through the runtime host and inspect their raw persisted envelope.
  
  Set `EMDASH_ENCRYPTION_KEY` in the runtime process environment before saving secret settings. A standalone Node server does not load `.env` automatically. To rotate the key, place the new key first in a comma-separated list and retain old keys until every plugin secret has been saved again. EmDash does not currently report which key IDs remain in use, so track each resaved credential and verify its integration before removing an old key. Restores need both the database and every encryption key referenced by its stored envelopes.
  
  Cloudflare sites using `nodejs_compat` with a compatibility date before `2025-04-01` must also add `nodejs_compat_populate_process_env` before saving secrets through the generated admin form. Cloudflare enables that behavior by default for later compatibility dates.
  
  Existing plaintext secrets remain readable and are encrypted when saved again. The `ctx.kv.get("settings:<key>")` compatibility alias remains available throughout the EmDash 0.x release line; new plugin code should use `ctx.settings.get("<key>")`.
  
  Only fields declared as `type: "secret"` in `admin.settingsSchema` use this encryption path. Arbitrary plugin KV and state values are unchanged; credentials stored by the bundled AT Protocol and webhook notifier plugins are not migrated by this release.

### Change 28

Applies to: `@emdash-cms/cloudflare@0.39.0` (minor)  
Source: [#3194](https://github.com/emdash-cms/emdash/pull/3194)

Adds separately consented publication and restore actions to native and sandboxed plugin contexts.
  
  Plugins with `content:publish` can read an entry with an opaque revision and publish, unpublish, schedule, or unschedule it through the same runtime behavior as REST and MCP. Each mutation requires the revision returned by the read or preceding action, and a plugin cannot recursively run the same action for the same entry. The capability implies `content:read` but not `content:write`.
  
  Plugins with `content:restore` can read and restore trashed entries without receiving ordinary content-read or write authority. Restore is revision-fenced and returns the next revision. Existing plugin installations receive neither capability unless a new version declares it and the administrator approves the expanded access.

### Change 29

Applies to: `@emdash-cms/cloudflare@0.39.0` (minor)  
Source: [#3185](https://github.com/emdash-cms/emdash/pull/3185)

Adds `hooks.content-policy:register` for sandboxed and native plugins that need to inspect and reject publication, scheduling, or unpublication without receiving content read, write, or publication-action access.
  
  Policy plugins can register `content:beforePublish`, `content:beforeSchedule`, and `content:beforeUnpublish`. Each event identifies the API, MCP, visual editor, plugin, scheduler, or system origin and includes the authenticated actor when one exists. Return `{ cancel: true, reason }` to reject the action with a stable error code. EmDash validates the reason as 1–500 plain-text characters. For allowed actions, the revision read before policy evaluation becomes the mutation precondition.
  
  Scheduled content runs `content:beforePublish` again when it becomes due. A policy rejection unschedules the entry, lists its public-safe reason and entry link on the dashboard, and avoids retrying the same permanent rejection on every scheduler tick. Successful rescheduling, publication, or deletion clears the record; administrators can dismiss stale records. `@emdash-cms/plugin-test` exposes stored scheduler rejections through `inspect.scheduledPolicyRejections()`.

### Change 30

Applies to: `@emdash-cms/cloudflare@0.39.0` (minor)  
Source: [#3190](https://github.com/emdash-cms/emdash/pull/3190)

Adds declared request and raw response contracts for sandboxed plugin routes across the native,
  Cloudflare Worker Loader, and Node/workerd runtimes.
  
  Use `methods` to have the host reject other HTTP methods with `405 Method Not Allowed`. Use
  `request.body` with `json`, `text`, `bytes`, `form-data`, or `none` for bounded buffered parsing, and
  list the safe request headers the handler needs. Undeclared routes retain their existing
  method-agnostic JSON and query-string behavior.
  
  Routes with `response: "raw"` return `pluginResponse()` with an unwrapped text or byte body, status,
  and allowlisted representation, download, or redirect headers. Raw responses are limited to 8 MiB.
  The host removes all other plugin-supplied headers, applies the route's cache and browser security
  policy, and rejects active same-origin content types.
  
  `pluginRoute()` infers a sandboxed handler's input from its declared body mode.
  `definePluginRoute()` provides the equivalent inference for trusted native routes.
  `createPluginRuntimeTestHost()` accepts `rawBody` for testing the production request parser with
  text, bytes, URL-encoded data, and multipart form data.

### Change 31

Applies to: `@emdash-cms/cloudflare@0.39.0` (minor)  
Source: [#3169](https://github.com/emdash-cms/emdash/pull/3169)

Adds the `taxonomies:write` sandboxed-plugin capability for creating taxonomy terms and adding or removing term assignments through `ctx.taxonomies`.
  
  Assignment methods accept term row IDs or translation-group IDs and apply idempotent deltas, so they do not replace existing assignments and concurrent additions are preserved. EmDash validates collection attachment, entry existence, term ownership, configured locales, translation identity, and hierarchy before changing taxonomy state. Sandboxed `createTerm()` rejects `parentId` for a non-hierarchical taxonomy instead of ignoring it. The capability implies `taxonomies:read` and requires renewed consent when an installed plugin first declares it.
  
  Existing REST and MCP term mutations also reject creating or updating a term with a parent in a non-hierarchical taxonomy. Callers that assign parents must mark the taxonomy as hierarchical before creating or reparenting terms.
  
  This release includes migration `082_taxonomy_translation_locale_unique`, which enforces one term per translation group and locale. If an existing database contains duplicate rows, the migration preserves them as independent term groups and copies their assignments before adding the unique index. It can restart safely after any completed statement.
  
  `@emdash-cms/plugin-test` adds taxonomy fixtures and an assignment inspector for production-boundary tests. Taxonomy definition management, assignment replacement, term updates, and term deletion remain unavailable to sandboxed plugins.

### Change 32

Applies to: `@emdash-cms/cloudflare@0.39.0` (patch), `emdash@0.39.0` (patch)  
Source: [#3272](https://github.com/emdash-cms/emdash/pull/3272)

Fixes revision restore on Cloudflare D1 so the restored content and its audit revision commit atomically. If either write fails, the entry and its revision history remain unchanged.

### Change 33

Applies to: `@emdash-cms/cloudflare@0.39.0` (patch)  
Source: [#3164](https://github.com/emdash-cms/emdash/pull/3164)

Fixes concurrent core migrations on Cloudflare D1 failing partway with errors such as `table "_plugin_storage" already exists`. `emdash migrate` and runtime migrations in `auto` mode take a migration lock in the D1 database. A second run waits up to 10 seconds: it succeeds without applying anything if the first run finishes in that time, and otherwise fails without applying migrations.
  
  A run that stops before releasing the lock leaves it held, because it may have stopped partway through a migration. This happens when a CI job is cancelled during `emdash migrate`, when a Worker in `auto` mode stops during a runtime migration, or when a development server is stopped while it applies migrations. Until the lock is released, pending migrations do not run and a D1 site in `auto` mode fails to initialize EmDash. Once the lock is older than a minute, migration runs fail at once with the lock's time and id, and the runtime retries after its migration-failure backoff.
  
  Adds `emdash migrate --release-lock <id>` to release such a lock. `emdash migrate --status` reports the lock and its id. After confirming that no migration is running, release the lock with that id:
  
  ```sh
  pnpm emdash migrate --release-lock 1788264000000
  ```
  
  Releasing the lock of a remote D1 database needs a build manifest and an API token with D1 Edit permission. A lock in the local D1 database of a development server is released with Wrangler. See [Release a stuck migration lock](https://docs.emdashcms.com/deployment/core-migrations/#release-a-stuck-migration-lock) for both procedures.

### Change 34

Applies to: `@emdash-cms/cloudflare@0.39.0` (patch)  
Source: [#3095](https://github.com/emdash-cms/emdash/pull/3095)

Fixes `emdash migrate --d1 <name>` failing for every database name with "Cloudflare D1 database list total_pages is invalid". The D1 list endpoint does not return `total_pages`, so the page count is now derived from `total_count` and `per_page` when it is absent. A preview database whose name only contains the requested name (the `name` filter matches substrings) no longer fails the lookup either.

### Change 35

Applies to: `@emdash-cms/cloudflare@0.39.0` (patch)  
Source: [#3244](https://github.com/emdash-cms/emdash/pull/3244)

Fixes playground retries reusing a partially initialized database after setup fails, which could make every retry return another 500 error. Trying again now discards the incomplete session and creates a fresh playground database.

### Change 36

Applies to: `@emdash-cms/cloudflare@0.39.0` (patch)  
Source: [#3052](https://github.com/emdash-cms/emdash/pull/3052)

Fixes sandboxed `ctx.content.create()` accepting `author_id` and `primary_byline_id` from plugin data on Cloudflare and Workerd. Those values are ignored during creation, and sandboxed reads omit the raw `primary_byline_id` field from `item.data`.

### Change 37

Applies to: `@emdash-cms/cloudflare@0.39.0` (patch)  
Source: [#3176](https://github.com/emdash-cms/emdash/pull/3176)

Fixes `cloudflareImages()` and `cloudflareStream()` so their `*EnvVar` options (`accountIdEnvVar`, `accountHashEnvVar`, `apiTokenEnvVar`) read `process.env` on the Node adapter. Previously they only checked Cloudflare Workers bindings, so a Node-hosted site with credentials exported as environment variables failed with a "Missing ..." error even though the variable was set. A Cloudflare Workers binding of the same name still takes precedence when one exists.

### Change 38

Applies to: `@emdash-cms/cloudflare@0.39.0` (patch)  
Source: [#3152](https://github.com/emdash-cms/emdash/pull/3152)

Fixes standard sandboxed plugins so lifecycle, content, media, comment, email, cron, and page metadata hooks run through the same ordered, capability-gated host pipeline as trusted plugins on Cloudflare Workers and Node.js.
  
  Sandbox contexts now expose canonical capabilities, database-backed `ctx.cron`, complete content metadata and filtering, and a real `Response` shape from `ctx.http.fetch()`. Cloudflare response bodies still cross the bridge as text. Admin-managed settings now share the `ctx.kv` settings namespace, lifecycle hooks run once at the correct install/enable boundary, and uninstall cleanup runs before plugin data or bundles are removed.
  
  Plugin builds also preserve hook, route permission and cache, MCP, settings, and field-widget metadata in registry bundles and npm descriptors.

### Change 39

Applies to: `@emdash-cms/cloudflare@0.39.0` (patch), `emdash@0.39.0` (patch)  
Source: [#3199](https://github.com/emdash-cms/emdash/pull/3199)

Adds `emdash/plugins/host` as a narrow runtime entry for platform sandbox adapters. The Cloudflare Worker loads scheduled maintenance and sandbox bridge dependencies when those capabilities first run, reducing startup CPU while preserving existing Worker exports and behavior.

### Change 40

Applies to: `@emdash-cms/cloudflare@0.39.0` (patch)  
Source: [#3162](https://github.com/emdash-cms/emdash/pull/3162)

Adds `createPluginRuntimeTestHost()` for sandboxed plugin tests that must exercise EmDash orchestration instead of invoking an isolate directly. The host separates direct transport calls, fixtures, production actions, observable-state inspectors, scheduled time control, cold restart, and disposal.
  
  Runtime actions cover the shipped content lifecycle, plugin activation and deactivation, media upload, public comment submission, comment moderation, plugin-route policy, and scheduled task execution. The controlled scheduler clock applies to cron tasks and scheduled publishing. `restart()` retains D1, plugin storage, media storage, and plugin state while replacing runtime and isolate memory. The host captures delivered email for assertions.
  
  `createPluginTestHost()` and its top-level `invokeHook()` and `invokeRoute()` methods remain compatible for fast transport-level tests. `emdashPluginTest()` supplies the runtime modules required by the documented Vitest configuration. Generated plugin projects continue to use Worker Loader by default and describe Node/workerd parity as an opt-in test for runner-sensitive behavior.

### Change 41

Applies to: `@emdash-cms/cloudflare@0.39.0` (patch)  
Source: [#3174](https://github.com/emdash-cms/emdash/pull/3174)

Adds structured Block Kit navigation and host-attested administrator locale context for sandboxed plugin pages and dashboard widgets.
  
  Plugins can return `link` elements that target saved content, another page declared by the same plugin, generated plugin settings, or an external HTTP, HTTPS, or `mailto:` URL. EmDash constructs internal admin URLs and opens external links with `noopener noreferrer`. Links never dispatch block actions and cannot appear as form fields.
  
  Block Kit route handlers receive `routeCtx.ui` with the validated surface, administrator locale, and text direction. The host validates every sandboxed page and widget response before rendering it, rejects undeclared plugin-page targets and active URL protocols, and permits external images only over HTTPS to hosts declared in `allowedHosts` under `network:request` consent or under `network:request:unrestricted` consent. Responses are limited to 256 KiB, 20 levels, 2,000 nodes, 1,000 items per array, and 64 KiB per string.
  
  `createPluginRuntimeTestHost()` adds `admin.loadPage()`, `loadWidget()`, `act()`, and `submit()` helpers that exercise the private production route, Worker Loader isolate, host UI context, and response validation.
  
  This is a breaking security tightening for sandboxed plugins that return an external Block Kit image without matching network authority. EmDash rejects the complete page or widget response instead of allowing the administrator's browser to contact an unapproved host.
  
  #### What should I do?
  
  If a plugin returns external Block Kit images, add `network:request` and every image hostname to `allowedHosts`, or add `network:request:unrestricted` when the plugin genuinely requires any hostname. Publish a plugin update so administrators can review and approve the expanded authority. Root-relative images need no manifest change.

### Change 42

Applies to: `@emdash-cms/cloudflare@0.39.0` (patch)  
Source: [#3182](https://github.com/emdash-cms/emdash/pull/3182)

Adds translation-aware sandboxed plugin content creation through `ctx.content.create(collection, data, { locale, translationOf })`.
  
  The source must be an active entry in the same collection. The new entry joins its translation group, inherits its byline credits and taxonomy assignments, and takes non-translatable field values from the source. Content validation and save hooks run in both the Cloudflare Worker Loader and Node/workerd runners. Save-hook-originated creates do not re-enter save hooks, and the creating plugin's own `content:afterSave` hook is not re-entered.
  
  Each translation group permits one active entry per locale. Duplicate locale creates return `CONFLICT`, missing sources return `NOT_FOUND`, invalid or unconfigured locales return `VALIDATION_ERROR`, and save hooks can return `SAVE_REJECTED`.

### Change 43

Applies to: `@emdash-cms/cloudflare@0.38.0` (minor)  
Source: [#3105](https://github.com/emdash-cms/emdash/pull/3105)

Fixes scheduled publishing cache invalidation so newly published content is served after the scheduled task completes.
  
  This release requires stable Astro 6.0.0 or later. Astro 6 prereleases no longer satisfy the package's peer dependency range.
  
  #### What should I do?
  
  Upgrade Astro to version 6.0.0 or later before updating `@emdash-cms/cloudflare` if the site still uses an Astro 6 prerelease.

### Change 44

Applies to: `@emdash-cms/cloudflare@0.38.0` (minor)  
Source: [#2980](https://github.com/emdash-cms/emdash/pull/2980)

Adds `getVersioned`, `compareAndSet` and `compareAndDelete` to plugin storage collections and `ctx.kv`. Native and sandboxed plugins can create an absent key or condition a replacement or deletion on the revision they read, preventing concurrent requests from silently overwriting each other.
  
  Pass an explicit `null` revision to create only when absent. A successful replacement returns its new revision; a conflict returns `{ applied: false }`. Invalid input, permission failures and database failures reject the promise. Atomicity applies to one key, so changes spanning multiple records still require an application-level protocol.
  
  Update core and the sandbox adapter together and apply the host database migrations before using the methods. The migration initializes existing records without a backfill. Stored values are preserved, and existing unconditional writes continue to work while invalidating old revisions. Conditional keys are limited to 1,024 JavaScript string characters and values to 1 MiB of UTF-8 JSON.

### Change 45

Applies to: `@emdash-cms/cloudflare@0.38.0` (patch), `emdash@0.38.0` (patch)  
Source: [#3065](https://github.com/emdash-cms/emdash/pull/3065)

Fixes Cloudflare binding failures during runtime startup returning `NOT_CONFIGURED` from EmDash API routes. Missing D1, R2, KV, Durable Object, and Hyperdrive bindings now return `BINDING_NOT_FOUND` with the binding-specific setup message. Invalid KV and Hyperdrive binding configuration returns `CONFIGURATION_ERROR`.

### Change 46

Applies to: `@emdash-cms/cloudflare@0.38.0` (patch)  
Source: [#2169](https://github.com/emdash-cms/emdash/pull/2169)

Adds `ctx.storage.<collection>.updateIf(id, { where, set?, delta? })` for atomic conditional updates to existing plugin documents. Use `where` to check stored fields, `set` to replace field values, and `delta` to increment or decrement integer counters. The method returns `{ applied: true, data }` with the updated document, or `{ applied: false }` when the document is absent or the condition fails. It never inserts a document.
  
  Malformed update arguments reject without writing. Deltas require safe integer operands and results; missing or `null` counters start at `0`. Invalid stored counters, overflow, and non-object documents return `{ applied: false }` without changing any fields.
  
  Available to native plugins and sandboxed plugins on Cloudflare and Workerd, with SQLite, D1, and PostgreSQL support. PostgreSQL serialization failures and deadlocks expose `code: "STORAGE_SERIALIZATION_FAILURE"` and `retryable: true`, including across sandbox transports. Retry standalone calls with bounded backoff, or restart the entire explicit transaction.

### Change 47

Applies to: `@emdash-cms/cloudflare@0.38.0` (patch)  
Source: [#2351](https://github.com/emdash-cms/emdash/pull/2351)

New Cloudflare projects leave the paid-plan Worker Loader binding disabled so they can deploy on the Workers free plan. Enable sandboxed plugins in the scaffold prompt or with `--sandboxed-plugins`.
  
  The Cloudflare `sandbox()` helper now selects the runner from the `LOADER` binding in `wrangler.jsonc`, including the named environment selected with `CLOUDFLARE_ENV`. Without it, config-based sandboxed plugins do not load and marketplace or registry installs return `SANDBOX_NOT_AVAILABLE`, while browsing remains available.

### Change 48

Applies to: `@emdash-cms/cloudflare@0.38.0` (patch)  
Source: [#3041](https://github.com/emdash-cms/emdash/pull/3041)

Adds the cause to the `SANDBOX_NOT_AVAILABLE` error and to the "Plugin sandbox is configured but not available on this platform" startup warning when a configured sandbox runner cannot run plugins. On Cloudflare Workers the message names the missing `worker_loaders` binding or `PluginBridge` export; on Node.js it says that the `workerd` binary did not run.
  
  Sandbox runners report the cause through a new optional `unavailableReason()` method on `SandboxRunner`. Runners without it keep the previous messages.

### Change 49

Applies to: `@emdash-cms/plugin-forms@0.2.11` (patch)  
Source: [#4249](https://github.com/emdash-cms/emdash/pull/4249)

Fixes conditional form fields remaining visible when their condition is false on sites using the forms plugin's default stylesheet.

### Change 50

Applies to: `@emdash-cms/plugin-forms@0.2.11` (patch)  
Source: [#4247](https://github.com/emdash-cms/emdash/pull/4247)

Fixes single `checkbox` fields so the input keeps its intrinsic width and sits next to its label, instead of stretching to full width and pushing the label away.

### Change 51

Applies to: `@emdash-cms/plugin-forms@0.2.11` (patch)  
Source: [#4248](https://github.com/emdash-cms/emdash/pull/4248)

Fixes single checkbox fields so a checked box is stored as `true` when the default submitted value is `"1"`. Required checkbox fields that are not checked are still rejected during validation.

### Change 52

Applies to: `@emdash-cms/plugin-forms@0.2.10` (patch)  
Source: [#3979](https://github.com/emdash-cms/emdash/pull/3979)

Fixes the daily digest. Creating a form with the digest on, or turning it on for an existing form, failed with an "Invalid task name" error, and a form created that way was saved with the digest on but never sent one. The digest is now scheduled, including for a duplicated form, and is rescheduled or cancelled when the form's digest settings change.

### Change 53

Applies to: `@emdash-cms/plugin-forms@0.2.10` (patch)  
Source: [#3031](https://github.com/emdash-cms/emdash/pull/3031)

Fixes duplicate element IDs when the same form is embedded more than once on a page. Field IDs were built from the form ID and the field name alone, so a form appearing in, say, a sidebar and a pop-up produced several elements sharing an ID: clicking a label focused the first copy rather than the one beside it, and anything resolving an ID — `aria-describedby`, a password manager, a test selector — reached the wrong instance. Each rendering now suffixes its IDs with a per-instance value, so labels, inputs and the honeypot stay paired within their own copy. Element IDs are not part of the plugin's API and nothing else references them; the client script scopes its lookups to the form element.

### Change 54

Applies to: `@emdash-cms/plugin-forms@0.2.10` (patch)  
Source: [#3032](https://github.com/emdash-cms/emdash/pull/3032)

Fixes embedded forms showing only the browser's validation bubble instead of the plugin's inline field errors. Native validation is turned off by the client script once it loads, so readers without JavaScript keep it.

### Change 55

Applies to: `@emdash-cms/plugin-forms@0.2.8` (patch)  
Source: [#3407](https://github.com/emdash-cms/emdash/pull/3407)

Fixes forms with a file field failing on every submission from the bundled form component. With JavaScript enabled, the component now sends a chosen file in the JSON submission body under `files.<fieldName>` as `{ filename, contentType, bytes }`, where `bytes` is the file encoded as base64. A required file field is now satisfied only by an attached file; a value for a file field in `data` is ignored, and a file sent for a field that its condition hides is not uploaded. A submission that attaches a file to one of the form's file fields now fails with a `500` error instead of being saved without it when the site has no media storage configured.

### Change 56

Applies to: `@emdash-cms/plugin-forms@0.2.8` (patch)  
Source: [#3405](https://github.com/emdash-cms/emdash/pull/3405)

Fixes public form submissions ignoring a file field's maximum file size, which let a visitor upload a file of any size. Submitted files are now checked against the field's `maxFileSize`, and no file can exceed 10 MB, even when the field's limit is higher or unset. Empty files are rejected. A file that fails its field's size or accepted-types check is rejected before any file in the submission is uploaded, and when a later upload fails, the files already uploaded for that submission are deleted.
  
  A file's `bytes` can now be sent as a base64 string, which is about a third larger than the file, instead of as an array of byte values, which is several times larger. Arrays of byte values are still accepted.
  
  Once `emdash` is also updated, file fields accept only PNG, JPEG, GIF, WebP, and AVIF images, video, audio, and PDF files. Submissions with any other file type are rejected with a `415` error, even when the field's accepted types list them, and a file with a malformed content type is rejected with a `400` error.

### Change 57

Applies to: `@emdash-cms/plugin-forms@0.2.8` (patch)  
Source: [#3207](https://github.com/emdash-cms/emdash/pull/3207)

Updating one form setting no longer resets the others. A partial `forms/update` previously filled in schema defaults for every setting the caller left out, so changing a notification address also reset the form's confirmation message, submit label, digest options, retention and — most seriously — its spam protection, silently turning off Cloudflare Turnstile.

### Change 58

Applies to: `@emdash-cms/plugin-forms@0.2.7` (patch)  
Source: [#3181](https://github.com/emdash-cms/emdash/pull/3181)

Fixes a form's webhook silently doing nothing. The call was never awaited or handed to the runtime, so on Cloudflare Workers it could be dropped once the visitor's confirmation had been sent; it now runs through `after()`, which registers it with the host so it is guaranteed to finish. A response that is not a success is also logged now: `fetch` only rejects on a transport error, so a 4xx, a 5xx, and the sign-in page an authenticated endpoint redirects to were all treated as if the webhook had worked, leaving no trace anywhere. The redirect case is detected by comparing the final URL rather than `Response.redirected`, because plugin HTTP access follows redirects itself and always reports `redirected: false`.

### Change 59

Applies to: `@emdash-cms/plugin-forms@0.2.7` (patch)  
Source: [#3139](https://github.com/emdash-cms/emdash/pull/3139)

Fixes checkbox-group validation so forms submit successfully when more than one option is selected.

### Change 60

Applies to: `@emdash-cms/plugin-webhook-notifier@0.2.3` (patch)  
Source: [#3362](https://github.com/emdash-cms/emdash/pull/3362)

Fixes the Webhook Settings page failing with `502 INVALID_BLOCK_RESPONSE` ("Plugin returned invalid Block Kit content") when the plugin runs sandboxed on EmDash 0.39. The Test Webhook button now uses `label`, and the "Enter a webhook URL first." and "Failed to save settings" banners use `title` and `variant`, as Block Kit requires. The Webhooks dashboard widget now loads: the plugin answers the `widget:status` id declared in its manifest instead of `widget:webhook-status`.

### Change 61

Applies to: `@emdash-cms/plugin-webhook-notifier@0.2.1` (patch)  
Source: [#3396](https://github.com/emdash-cms/emdash/pull/3396)

Fixes the webhook notifier never sending webhooks for content saves, content deletions, or media uploads: it now declares the `content:read` and `media:read` capabilities EmDash requires before it runs those hooks.

### Change 62

Applies to: `@emdash-cms/plugin-webhook-notifier@0.2.1` (patch)  
Source: [#3412](https://github.com/emdash-cms/emdash/pull/3412)

Fixes the webhook notifier ignoring its Events to Send and Include Content Data settings. "Content changes only" now sends only content create, update and delete webhooks, and "Media uploads only" sends only media upload webhooks. With Include Content Data on, content create and update payloads carry the saved entry's field values in `data`, and media upload payloads carry the file's `filename`, `mimeType` and `size`; delete payloads have no `data`. No earlier release sent `data`, and releases before the plugin declared `content:read` and `media:read` sent none of these webhooks, so there is no earlier payload shape to keep compatible.
  
  Content create and update payloads also carry `metadata.draftRevisionId`. In a collection with revisions, saving changes to an existing entry stages a draft, so `data` holds the draft's values; `draftRevisionId` names that draft and is `null` when the saved values are the entry's current ones.
  
  Also fixes the plugin's delivery counts always being 0. Each content or media webhook now records its outcome, HTTP status and duration in the plugin's `deliveries` storage collection, which prunes down to the 500 most recent deliveries after every write; the `status` route and the dashboard widget's Delivered and Failed counts read from that same pruned log, so they only ever total the 500 most recent deliveries. The Test Webhook button's sends are not recorded. Both the `status` route and the widget drop their Pending stat: nothing ever wrote a pending delivery, so it always read 0.

### Change 63

Applies to: `emdash@1.3.1` (patch)  
Source: [#4069](https://github.com/emdash-cms/emdash/pull/4069)

Fixes sites on Cloudflare Workers in the default `auto` migration mode serving pages without their content, with a 200 status, after an upgrade whose migrations a request could not finish.
  
  Such a site now answers with a 503 response until its migrations are applied, so uptime checks notice it. A deployed Worker also no longer starts a migration that processes every entry and revision of a large site, such as the datetime normalization from 0.39.0; it answers with 503 until `emdash migrate` applies it.
  
  #### What should I do?
  
  If your site runs on Workers in `auto` mode and upgrades from 0.38 or earlier, run `emdash migrate` before you deploy, as described in [Apply large content migrations from the CLI](https://docs.emdashcms.com/deployment/core-migrations/#apply-large-content-migrations-from-the-cli).
  
  If a site answers with 503 after an upgrade, read the Worker log. When it names a pending migration, apply it with `emdash migrate`. When it reports a held migration lock, follow [Release a stuck migration lock](https://docs.emdashcms.com/deployment/core-migrations/#release-a-stuck-migration-lock).

### Change 64

Applies to: `emdash@1.3.1` (patch)  
Source: [#4226](https://github.com/emdash-cms/emdash/pull/4226)

Fixes purged pages being cached again with stale site settings, including SEO verification tags, titles, and logos, on sites with or without an object cache. Route-cache fills with an object cache read settings directly from the database. Without an object cache, responses using an outdated settings snapshot are kept out of the route cache, and the next render reloads the settings. Warm settings snapshots also revalidate in the background after 30 seconds, retaining the last good value if a reload fails.

### Change 65

Applies to: `emdash@1.3.1` (patch)  
Source: [#4180](https://github.com/emdash-cms/emdash/pull/4180)

Fixes `emdash login` and `emdash logout` ignoring `EMDASH_URL`. Without `--url`, they now use the site in `EMDASH_URL`, like the other commands, instead of always going to `http://localhost:4321`.

### Change 66

Applies to: `emdash@1.3.1` (patch)  
Source: [#4239](https://github.com/emdash-cms/emdash/pull/4239)

Fixes CLI commands failing behind Cloudflare Access once the EmDash access token saved by `emdash login` has expired. Refreshing the token now sends the custom headers from `--header`, `EMDASH_HEADERS` and `emdash login`, as every other request does. `EmDashClient` from `emdash/client` now also runs the `interceptors` you pass on its automatic token refresh request.

### Change 67

Applies to: `emdash@1.3.1` (patch)  
Source: [#4070](https://github.com/emdash-cms/emdash/pull/4070)

Fixes `createField` on D1 leaving a field in the schema without a backing column when the collection reaches the column limit. Failed fields can now be created after freeing a column, without a `FIELD_EXISTS` error.

### Change 68

Applies to: `emdash@1.3.1` (patch)  
Source: [#4161](https://github.com/emdash-cms/emdash/pull/4161)

Fix an issue where the redirect middleware would rerun a route and hide the original error when the route (or later middleware) threw. The catch block is now narrowed to the redirect lookup, so `next()` is called exactly once and route errors propagate to Astro. Failures during the middleware's own post-response work (404 logging and cache handling) are still caught and logged rather than propagated.

### Change 69

Applies to: `emdash@1.3.1` (patch)  
Source: [#4181](https://github.com/emdash-cms/emdash/pull/4181)

Fixes the admin dashboard showing the number of users to roles that cannot list users. The Users card, and `userCount` in the `GET /_emdash/api/dashboard` response, are now limited to Administrators.

### Change 70

Applies to: `emdash@1.3.1` (patch)  
Source: [#4170](https://github.com/emdash-cms/emdash/pull/4170)

Fixes `<Image>` from `emdash/ui` so images with a blurhash placeholder keep their focal point. The generated style previously omitted the separating semicolon between the placeholder background and `object-position`, which caused browsers to discard both declarations.

### Change 71

Applies to: `emdash@1.3.1` (patch)  
Source: [#4013](https://github.com/emdash-cms/emdash/pull/4013)

Fixes the admin login page so the help text under a provider's `LoginForm` is no longer hard-coded to "Enter your handle to sign in." for every provider.
  
  Providers can now export an optional `loginHelp` string or component from their admin entry. When `loginHelp` is absent, the page falls back to a neutral "Continue with {label}." message.
  
  The built-in AT Protocol provider keeps its handle-specific prompt and translates it using the admin's active locale. It requires `@lingui/react` as a peer dependency; if your package manager does not install peers automatically, install a compatible Lingui 5 version alongside the provider.

### Change 72

Applies to: `emdash@1.3.1` (patch)  
Source: [#4043](https://github.com/emdash-cms/emdash/pull/4043)

Fixes media previews and file downloads timing out on Node.js sites using S3-compatible storage, including Cloudflare R2, after repeated cache revalidation or HEAD requests.

### Change 73

Applies to: `emdash@1.3.1` (patch)  
Source: [#4024](https://github.com/emdash-cms/emdash/pull/4024)

Fixes `getEmDashCollection()` returning empty results when `where` or `orderBy` uses a custom field while migration `086_relations_structural` is pending. Reference fields become available on the next request after migrating, without waiting for the object cache to expire. Missing columns unrelated to caller fields are reported as collection-loading errors rather than filter warnings.

### Change 74

Applies to: `emdash@1.3.1` (patch)  
Source: [#4255](https://github.com/emdash-cms/emdash/pull/4255)

Fixes menu item create, update, and reorder requests accepting missing, cross-menu, or cyclic parents that can hide items from rendered menus. Invalid parent changes now return a validation error without changing the menu; reorder validation uses the final state of the batch.
  
  Unchanged parent links from older writes do not block label edits or reorders, so menus with legacy invalid data remain editable.

### Change 75

Applies to: `emdash@1.3.1` (patch)  
Source: [#4224](https://github.com/emdash-cms/emdash/pull/4224)

Fixes locale-aware queries when Astro locales use custom paths and codes, such as `{ path: "en", codes: ["en-US"] }`. Passing `Astro.currentLocale` to content, menu, taxonomy, and byline queries now matches rows stored under either the configured path or its codes. New writes use the path, while existing code-stamped rows keep their IDs, locale values, and associations. Reapplying seeds using either spelling reuses existing rows instead of creating duplicates.
  
  When both path- and code-stamped rows exist for the same slug or name, lookups and seed matching prefer the path, then codes in configuration order. Public content queries consider only published rows, so a draft path row does not hide a published code row. Existing rows are not merged or deleted: listings retain both, and row-ID lookups remain available. This read-side compatibility avoids a destructive data migration or manual renaming during upgrade.

### Change 76

Applies to: `emdash@1.3.1` (patch)  
Source: [#4229](https://github.com/emdash-cms/emdash/pull/4229)

Fixes repeated plugin storage index registration so unchanged declarations no longer rewrite the `_plugin_indexes` registry rows on every sync. This reduces background write traffic on D1 and other SQLite-backed deployments when index declarations have not changed.

### Change 77

Applies to: `emdash@1.3.1` (patch)  
Source: [#4220](https://github.com/emdash-cms/emdash/pull/4220)

Reduces database round trips for the `search()`, `searchCollection()`, and `getSuggestions()` helpers, including searches with no matches, to improve response times on Cloudflare D1. Empty or whitespace-only queries no longer query the database. Autocomplete also skips collections whose search indexes are missing.

### Change 78

Applies to: `emdash@1.3.1` (patch)  
Source: [#4201](https://github.com/emdash-cms/emdash/pull/4201)

Fixes captions being omitted from image field values and their generated TypeScript types. Image selection, content saves, and seed export/import preserve captions, including explicitly empty captions. Seed exports keep library defaults separately from per-use captions. Image and focal-point edits retain per-use captions unless the caption is explicitly edited. Templates should read the top-level `caption`; the legacy `meta.caption` alias stays consistent when present.
  
  For existing image fields whose captions were previously omitted, reselect the image or explicitly edit its caption, then save and publish the content entry. Upgrading alone does not fill captions into previously stored content values.

### Change 79

Applies to: `emdash@1.3.1` (patch)  
Source: [#4256](https://github.com/emdash-cms/emdash/pull/4256)

Fixes D1 parameter-limit errors when updating the status of up to 100 comments at once or saving content with more than 100 byline credits.

### Change 80

Applies to: `emdash@1.3.1` (patch)  
Source: [#4225](https://github.com/emdash-cms/emdash/pull/4225)

Fixes duplicate menu items and widgets when concurrent first requests apply the same seed through D1 bindings. Menu and widget replacements are atomic on D1 bindings, transactional SQLite, and PostgreSQL, so a failed replacement retains the previous items. This does not make replacements atomic on the Durable Object SQL backend.

### Change 81

Applies to: `emdash@1.3.1` (patch)  
Source: [#4221](https://github.com/emdash-cms/emdash/pull/4221)

Fixes the `Image` component from `emdash/ui` rejecting the `quality` prop during `astro check`. Quality now reaches both Astro image rendering paths and providers that support it, without leaking onto unoptimized `<img>` elements.
  
  Fixes EmDash's internal-media transforms on Cloudflare serving the full-size original for Astro quality presets or fractional and out-of-range numbers. Presets `low`, `mid`, `high`, and `max` map to 25, 50, 80, and 100; finite numbers are rounded and clamped to 1–100.

### Change 82

Applies to: `emdash@1.3.1` (patch)  
Source: [#4074](https://github.com/emdash-cms/emdash/pull/4074)

Fixes stale automatic slug-change redirects hiding new entries published at the old URL. Publishing an entry now removes the automatic redirect from its URL, so visitors can reach the new page.

### Change 83

Applies to: `emdash@1.3.1` (patch)  
Source: [#4179](https://github.com/emdash-cms/emdash/pull/4179)

Fixes Subscribers, and other users without `content:read_drafts`, seeing unpublished content through the content API and MCP tools. Asking for the terms or translations of a draft or scheduled entry now returns not found, and MCP `content_get` returns only the published version of an entry with unpublished changes.

### Change 84

Applies to: `emdash@1.3.1` (patch)  
Source: [#4203](https://github.com/emdash-cms/emdash/pull/4203)

Fixes pages that show categories, tags or term counts hanging with a 524 error for every visitor on a Cloudflare Workers isolate after one visitor disconnected while the isolate was loading taxonomy definitions or its list of collections.

### Change 85

Applies to: `emdash@1.3.1` (patch)  
Source: [#4106](https://github.com/emdash-cms/emdash/pull/4106)

Stop forcing `blank: true` on every new text link.
  
  TipTap's Link extension defaults `HTMLAttributes.target` to `"_blank"`. Because both the admin rich-text editor and the inline visual editor configured Link with only styling classes, the default survived deep-merge, so every link created with `setLink()` was serialized as `blank: true` and rendered with `target="_blank" rel="noopener noreferrer"`. Both editors now set `target: null` in their Link `HTMLAttributes`, so newly saved text links no longer open in a new tab unless an author explicitly chooses that option (available only for image links today).
  
  Existing content that already has `blank: true` is unchanged and will continue to open in a new tab.

### Change 86

Applies to: `emdash@1.3.1` (patch)  
Source: [#4207](https://github.com/emdash-cms/emdash/pull/4207)

Fixes edits disappearing after unpublishing an entry in a collection without revisions: the editor showed the previously published content after every save, and the next save wrote it back over the edits. Saves now keep the edits, including on entries unpublished before this release.

### Change 87

Applies to: `emdash@1.3.0` (minor)  
Source: [#4117](https://github.com/emdash-cms/emdash/pull/4117)

Updates the visual-editing rich text editor's selection toolbar and slash menu to match the admin editor's.
  
  Selecting text now shows the admin's toolbar: a Turn into menu, link, bold, italic, underline, strikethrough, inline code, and a More menu with subscript, superscript, alignment, and Clear formatting. With the caret in a link, a bar shows where it goes, with buttons to edit or remove it, and clicking a link no longer opens it in a new tab. A typed bare domain such as `example.com` links to `https://example.com`, and a link the editor can't use is refused with a message.
  
  The slash menu now groups its commands, shows each one's Markdown shortcut and description, ranks matches as you type (`/bl` finds Bullet List), and finds Heading 4 to 6 by name. Headings 4 to 6 now show at their own size while editing instead of as Heading 1. Both menus follow the system's light or dark theme and stay readable in dark mode.

### Change 88

Applies to: `emdash@1.3.0` (minor)  
Source: [#4137](https://github.com/emdash-cms/emdash/pull/4137)

Adds an image picker and an image toolbar to the visual-editing rich text editor.
  
  Typing `/image` now opens a picker below the line instead of a full-screen dialog. It shows the media library nine images a page, newest first, with a tab for each media provider the site has set up. One click, or the arrow keys and Enter, inserts an image.
  
  The picker no longer uploads images. To use a new image, upload it to the media library in the admin first, then choose it with `/image`. When the library is empty, the picker links to the media library, which opens in a new tab.
  
  Images now show as they publish, with their alignment and a caption field right underneath. Selecting one shows a toolbar to replace it, edit its alt text, or delete it. Replacing an image keeps its caption and takes the new image's alt text.
  
  Typing `/image` now opens a picker only in the editor it was typed in, not in every editor on the page, and an inserted image no longer gets its file name as its alt text. An image inserted from a line inside a quote or list now goes after the quote or list; saving used to drop an image inside one.

### Change 89

Applies to: `emdash@1.3.0` (minor)  
Source: [#4068](https://github.com/emdash-cms/emdash/pull/4068)

Adds `emdash migrate --take-over-lock <id>`, which applies pending migrations under a stuck D1 migration lock without freeing it first. Releasing the lock with `--release-lock` and then running `emdash migrate` let a Worker in `auto` mode take the free lock in between, and the apply failed with a lock error.
  
  ```sh
  pnpm emdash migrate --take-over-lock 1788264000000
  ```
  
  Like `--release-lock`, it asks you to confirm the target, or needs `--expected-target-fingerprint` in a non-interactive shell.

### Change 90

Applies to: `emdash@1.3.0` (minor)  
Source: [#4136](https://github.com/emdash-cms/emdash/pull/4136)

Adds readable revision history to the content editor. Selecting a version in the **Revisions** panel shows it in place, read-only, with added text highlighted and removed text struck through in the color of the person who saved it. The selected version lists its changes in plain words, such as "Changed the title", and selecting one scrolls to it. **Restore** moves to a bar at the bottom of the editor, and a version that matches an earlier one is marked "Restored from" with that version's date. **Save** and **Publish** pause while a version is open. The panel no longer shows raw JSON.
  
  The revisions list API (`GET /_emdash/api/content/{collection}/{id}/revisions`) and the MCP `revision_list` tool include each revision's `author` as `{ id, name }`, or `null` when no author was recorded or the account no longer exists, so editors without access to user management can see who saved each version.
  
  `ContentEditor`'s `onRevisionRestored` callback can now return a promise. The restore stays pending until it settles, and the restore dialog shows the error if it rejects. When a host passes this callback, the restored version stays on screen until `item` carries the restored draft, and the writer can't go back to editing before then. The editor still refreshes the entry's `content` and `revisions` queries, so a host that reads `item` from the entry's `content` query needs no change. Other hosts must reload `item` from the callback.

### Change 91

Applies to: `emdash@1.3.0` (minor)  
Source: [#3623](https://github.com/emdash-cms/emdash/pull/3623)

Adds a **Disallow AI training** option to **Settings > SEO**. When it is on, `/robots.txt` disallows the AI training crawlers and opt-out tokens `Amazonbot`, `Applebot-Extended`, `Bytespider`, `CCBot`, `ClaudeBot`, `Google-Extended`, `GPTBot`, and `meta-externalagent`, and adds a `Content-Signal: search=yes, ai-train=no` line. Search engine access stays as your other rules define it. The rules are added to both the default and a custom `robots.txt`. The option is also available as `seo.disallowAiTraining` in the settings API and the MCP `settings_update` tool. It is off by default, so existing `robots.txt` output is unchanged.

### Change 92

Applies to: `emdash@1.3.0` (patch)  
Source: [#4034](https://github.com/emdash-cms/emdash/pull/4034)

Fixes `emdash whoami` failing on sites behind Cloudflare Access: it now sends the headers from `--header` and `EMDASH_HEADERS` and reads `EMDASH_URL`, like the other commands. Without a token on localhost, it now signs in through the dev bypass and reports the dev user, and exits 1 when no site answers or the site isn't running under `astro dev`, so scripts can use it as a reachability check.

### Change 93

Applies to: `emdash@1.3.0` (patch)  
Source: [#3955](https://github.com/emdash-cms/emdash/pull/3955)

Fixes `<CommentForm>` making right-to-left pages (`<html dir="rtl">`) about 10,000 pixels wider, with a horizontal scrollbar. This happened on every such page in Firefox, and in Chrome and Safari when the form or an element around it is positioned, for example with `position: relative`. On right-to-left pages, `<Comments>` now also indents threaded replies from the right, and the separator before a signed-in commenter's email in `<CommentForm>` no longer touches the email.

### Change 94

Applies to: `emdash@1.3.0` (patch)  
Source: [#3907](https://github.com/emdash-cms/emdash/pull/3907)

Reduces `getComments()` to a single database query when the approved comment list fits on one page.
  
  Pages rendering comments previously ran a `COUNT` query followed by the list query, even when the result was not truncated. `getComments()` now fetches the list first and derives the total from the returned rows whenever cursor pagination indicates there are no more pages, falling back to `COUNT` only for posts that exceed the page limit. Cache misses on sites without an object cache benefit most.

### Change 95

Applies to: `emdash@1.3.0` (patch)  
Source: [#4133](https://github.com/emdash-cms/emdash/pull/4133)

Fixes Contributors being unable to save changes to their own drafts. A Contributor could create an entry, but the next save, the entry lock, and setting categories or tags returned 403. Contributors can now edit their own entries while they are drafts, in the admin, the REST API, and the MCP `content_update` tool. They still cannot edit entries once they are published or scheduled, or publish them.
  
  The new `content:edit_own_drafts` permission grants this and is held by Contributor and every higher role. No other role's permissions change.

### Change 96

Applies to: `emdash@1.3.0` (patch)  
Source: [#3937](https://github.com/emdash-cms/emdash/pull/3937)

Fixes slower page loads for logged-out visitors on D1 with `session: "auto"` or `"primary-first"` and no `coalesce`. A session runs a request's queries one at a time, so EmDash's preload of site settings, menus, widget areas, and taxonomy terms for HTML pages delayed the page's own first query and added queries the page might never use. In that setup EmDash no longer preloads them; those queries run only when the page uses them. Sites with `coalesce: true` keep the preload, batched into one round trip.
  
  New Cloudflare sites from the templates now use `d1({ binding: "DB", session: "auto", coalesce: true })`, so reads issued together share one D1 round trip, with or without read replication. To get the same on an existing site, set `session: "auto"` (or `"primary-first"`) and `coalesce: true` in its `d1()` call; `coalesce` has no effect without a session. `coalesce` is experimental: a read and a write started together may run write-first, so await a read before a write that must not affect it.

### Change 97

Applies to: `emdash@1.3.0` (patch)  
Source: [#4171](https://github.com/emdash-cms/emdash/pull/4171)

Fixes the admin dashboard for users without `content:read_drafts`, such as Subscribers. Recent activity and collection counts now include only published entries, matching what these users can open elsewhere in the admin, and scheduled-publication policy notices are no longer shown to them. Contributors and above see the dashboard as before.

### Change 98

Applies to: `emdash@1.3.0` (patch)  
Source: [#4128](https://github.com/emdash-cms/emdash/pull/4128)

On sites that use a route cache such as Workers Cache, creating or duplicating an entry no longer purges cached pages. The new entry is a draft that no public page shows, so pages that list the collection stay cached until a later change to published content. This applies to `POST /_emdash/api/content/{collection}`, `POST /_emdash/api/content/{collection}/{id}/duplicate`, and the `content_create` and `content_duplicate` MCP tools. `content_create` with `status: "published"` still purges the collection and the new entry.

### Change 99

Applies to: `emdash@1.3.0` (patch)  
Source: [#4000](https://github.com/emdash-cms/emdash/pull/4000)

Fixes first-user passkey registration so the newly created Admin is authenticated immediately after registration verification. Clicking "Open the dashboard" now opens the dashboard instead of redirecting to the login page.

### Change 100

Applies to: `emdash@1.3.0` (patch)  
Source: [#4073](https://github.com/emdash-cms/emdash/pull/4073)

Fixes force-deleting a collection so it also removes the entries' records in shared tables: revisions, SEO data, comments, content bylines, taxonomy assignments, entry locks, and the revision prune queue. Previously these rows were left behind because only the content table, FTS table, and collection row were dropped.

### Change 101

Applies to: `emdash@1.3.0` (patch)  
Source: [#4045](https://github.com/emdash-cms/emdash/pull/4045)

Fixes site settings updates during a running export so the export's `write_epoch` bump happens inside the same transaction. If the export fence cannot record the write, the settings update now rolls back instead of committing invisibly to the export.

### Change 102

Applies to: `emdash@1.3.0` (patch)  
Source: [#3824](https://github.com/emdash-cms/emdash/pull/3824)

Fixes MCP `content_create` and `content_update` rejecting writes that omit a blocks field with "must be an array". A create that omits a blocks field treats it as empty, and an update keeps the stored blocks. Supplied non-array values are still rejected.

### Change 103

Applies to: `emdash@1.3.0` (patch)  
Source: [#3885](https://github.com/emdash-cms/emdash/pull/3885)

Fix plugin storage cursor behavior when the anchor row of an ordered page is deleted. `PluginStorageRepository.query()` now encodes scalar ordered field values into the cursor and compares subsequent pages against those values, so ascending walks no longer end early and descending walks no longer restart from the top. Cursors for non-scalar values (objects or arrays) or very long strings fall back to the anchor-row lookup used before this fix, keeping those pages working while still surfacing a clear invalid-cursor error when that anchor row has been deleted. Legacy cursors that do not contain the field values still work under the same fallback.

### Change 104

Applies to: `emdash@1.3.0` (patch)  
Source: [#3825](https://github.com/emdash-cms/emdash/pull/3825)

Fixes content writes to single-type blocks fields rejecting blocks that omit `_type`, including nested Markdown conversion over MCP and the TypeScript client. EmDash infers the only allowed type on ordinary writes; multiple allowed types, seed files, and stored blocks of a different type still require an explicit `_type`. Explicit invalid types remain errors.

### Change 105

Applies to: `emdash@1.3.0` (patch)  
Source: [#3942](https://github.com/emdash-cms/emdash/pull/3942)

Fixes the visual-editing rich text editor adding a revision to the entry's history every time it saves on blur. Its saves now replace the pending draft revision, like the admin editor's autosave.

### Change 106

Applies to: `emdash@1.3.0` (patch)  
Source: [#3982](https://github.com/emdash-cms/emdash/pull/3982)

Fixes new and changed redirects being ignored for pages already in the Workers Cache. Saving a redirect for an exact path now clears the cached page at that path.

### Change 107

Applies to: `emdash@1.3.0` (patch)  
Source: [#4102](https://github.com/emdash-cms/emdash/pull/4102)

Fixes the MCP `content_create` tool so it accepts optional `seo` and `publishedAt` fields and persists them in the same call. Agents no longer need to create a post and then call `content_update` just to set SEO metadata or backdate an item. `publishedAt` is gated behind the `content:publish_any` permission, matching the REST API and `content_update`.

### Change 108

Applies to: `emdash@1.3.0` (patch)  
Source: [#3791](https://github.com/emdash-cms/emdash/pull/3791)

Fixes two problems with number fields in the content editor. Clearing a number field now saves it as empty instead of `0`, which previously failed a field's minimum (such as `min: 1`) or silently stored zero. Decimal values such as `4.50` no longer block the Save button with the browser's "nearest valid values" message, while `integer` fields keep stepping in whole numbers.

### Change 109

Applies to: `emdash@1.3.0` (patch)  
Source: [#3202](https://github.com/emdash-cms/emdash/pull/3202)

Fixes full-text search so queries containing lowercase words like "and", "or", "not" or "near" are no longer parsed as FTS5 operators. This restores results for searches with possessive apostrophes and keeps prefix matching for those queries.

### Change 110

Applies to: `emdash@1.3.0` (patch)  
Source: [#4092](https://github.com/emdash-cms/emdash/pull/4092)

Fixes WordPress imports through the EmDash Exporter plugin losing Advanced Custom Fields values: a field stored on only one post was never created, and a repeater row that only one post had was lost. For ACF field groups assigned to a post type, the import now creates a field for every ACF field and stores selects, checkboxes, repeaters, groups, relationships and other structured values as JSON. Relationship, post object, user and taxonomy values that arrive as WordPress posts, users or terms keep only their IDs, so a related post's content and password or a user's password hash are not copied into EmDash. A collection from an earlier import keeps the fields it has, so its repeaters still arrive as one field per row and sub-field.
  
  #### What should I do?
  
  Running the import again skips entries that already exist, so if you imported ACF relationship, post object or user fields through the exporter with an earlier version, check those JSON fields for whole WordPress posts and users yourself.

### Change 111

Applies to: `emdash@1.3.0` (patch)  
Source: [#988](https://github.com/emdash-cms/emdash/pull/988)

Fixes MCP tool names for plugins with scoped IDs such as `@acme/calendar`: their tools are listed as `acme__calendar__<tool>`, which MCP clients accept. Update saved calls that use the old scoped names. Plugins with plain IDs keep their names, and the admin plugin list displays the generated names before consent.
  
  A plugin tool whose JSON Schema cannot be read no longer stops other tools from loading. Unreadable input schemas accept object inputs for route validation; unreadable output schemas are omitted. Duplicate generated names keep the first tool and log a warning instead of disabling the MCP endpoint.

### Change 112

Applies to: `emdash@1.3.0` (patch)  
Source: [#3584](https://github.com/emdash-cms/emdash/pull/3584)

Removes up to two database round trips from the first request after a cold start on sites with the plugin marketplace or registry enabled.
  
  With the sandbox disabled (`sandbox: false`), a failure to load the in-process plugin adapter now stops startup with an error instead of silently starting without any marketplace plugins, matching how sandboxed plugins listed in the integration config already behave.

### Change 113

Applies to: `emdash@1.3.0` (patch)  
Source: [#4005](https://github.com/emdash-cms/emdash/pull/4005)

Fixes server-rendered pages that inspect public plugin route metadata before dispatching, so logged-out visitors can load plugin data. Public metadata is available through `getPublicPluginRouteMeta` for both visitors and signed-in users. Private route metadata stays on the signed-in `getPluginRouteMeta` helper.

### Change 114

Applies to: `emdash@1.3.0` (patch)  
Source: [#2768](https://github.com/emdash-cms/emdash/pull/2768)

Fixes scheduled maintenance stopping after the initialization request in Cloudflare `astro dev`. EmDash now drives its own maintenance through a dev-only workerd route from the long-lived dev server, keeping plugin cron jobs, scheduled publishing, cleanup, and declared plugin storage index creation running between requests without invoking application-wide scheduled jobs. Also works with HTTPS dev servers, including self-signed certificates.

### Change 115

Applies to: `emdash@1.3.0` (patch)  
Source: [#3997](https://github.com/emdash-cms/emdash/pull/3997)

Fixes Astro's route cache, such as Workers Cache, storing a page at a redirect's source after the redirect was saved. A Worker isolate that had not yet reloaded its redirect rules could render the old page and the route cache kept it, even after the cached page was purged. Before the route cache stores a response, the redirect middleware now checks that its rules are current and answers with the redirect when they have changed. This costs one database read for each response the route cache stores; other responses are unchanged.

### Change 116

Applies to: `emdash@1.3.0` (patch)  
Source: [#4097](https://github.com/emdash-cms/emdash/pull/4097)

Fixes oversized plugin screenshots failing to load in the admin registry gallery with HTTP 413.
  
  The registry artifact proxy now requests the `feed_fullsize` image preset for screenshots instead of `feed_thumbnail`. This aligns the admin preview with the public plugin site and avoids the lossless upscaling that pushed modest source images over the 1 MiB proxy cap.

### Change 117

Applies to: `emdash@1.3.0` (patch)  
Source: [#4072](https://github.com/emdash-cms/emdash/pull/4072)

Fixes the datetime normalization migration taking hours on large Cloudflare D1 sites and starting over after every interruption. It now writes changed rows in batches, and running `emdash migrate` again after a failed write continues from the last written batch.

### Change 118

Applies to: `emdash@1.3.0` (patch)  
Source: [#4044](https://github.com/emdash-cms/emdash/pull/4044)

Fix saving a draft when retired fields remain only in the published content row. A full read-then-write update no longer fails validation for keys the entry already stores in its live data but that are absent from the current draft revision. Genuinely never-stored unknown keys are still rejected.

### Change 119

Applies to: `emdash@1.3.0` (patch)  
Source: [#3987](https://github.com/emdash-cms/emdash/pull/3987)

Fixes saves in the admin and through MCP reporting an error when the configured cache provider fails to purge, although the change was already saved. These saves now report success, and the failed purge is logged.

### Change 120

Applies to: `emdash@1.3.0` (patch)  
Source: [#3921](https://github.com/emdash-cms/emdash/pull/3921)

Fixes `emdash seed` to avoid leaking duplicate media rows and adds `--skip-media` for storage-less seeds.
  
  - `$media` references now deduplicate against existing ready media rows by content hash, so re-running `emdash seed ... --on-conflict=update` reuses the same rows instead of creating new ones each time.
  - New `--skip-media` flag resolves `$media` references to external URLs without downloading files or creating local `./uploads`, which is useful when seeding a site whose media lives in remote object storage.

### Change 121

Applies to: `emdash@1.3.0` (patch)  
Source: [#4014](https://github.com/emdash-cms/emdash/pull/4014)

Fixes visual editing selecting all of a text field's text when it is clicked, which made the first keystroke replace the whole value. A click now places the caret where it lands, including on a field inside a link, and text selected by dragging stays selected.

### Change 122

Applies to: `emdash@1.3.0` (patch)  
Source: [#3942](https://github.com/emdash-cms/emdash/pull/3942)

Fixes visual editing for empty Portable Text fields, such as the body of a new post. Edit mode now renders the inline editor for them, so the field can be written on the page instead of having no editor at all. The empty editor stays blank until it is clicked, then shows a "Type / for commands..." hint. In edit mode, an empty Portable Text field reads as an empty array instead of `null`.

### Change 123

Applies to: `emdash@1.3.0` (patch)  
Source: [#4058](https://github.com/emdash-cms/emdash/pull/4058)

Warns during `astro build` and `astro dev` when the installed `@emdash-cms/cloudflare` version differs from `emdash`. The adapter depends on the exact `emdash` version it was released with, so upgrading only one of the two packages installs a second copy of `emdash` that the adapter runs against. The warning names both versions and the command to install matching ones.

### Change 124

Applies to: `emdash@1.3.0` (patch)  
Source: [#3265](https://github.com/emdash-cms/emdash/pull/3265)

Fixes `getEmDashCollection`'s `where` filter so an object with none of `gt`, `gte`, `lt` or `lte` (such as `{ in: [...] }`) now logs a warning instead of silently returning unfiltered rows. Long array values no longer fail on Cloudflare D1 with "too many SQL variables": the longest arrays are each bound as one JSON parameter, keeping ordering and paging in the database on SQLite, D1 and PostgreSQL. Values bound that way compare as text.

### Change 125

Applies to: `emdash@1.3.0` (patch)  
Source: [#4056](https://github.com/emdash-cms/emdash/pull/4056)

Fixes WordPress WXR imports overcounting skipped items. The "skipped (already exists)" count in the admin, and the `skipped` value returned by `POST /_emdash/api/import/wordpress/execute`, now only include entries whose slug already exists in the target collection and locale. Menu items, reusable blocks (imported as sections), revisions and post types you disabled are no longer counted. The "X of Y" progress shown during the import no longer runs past the number of selected items.

### Change 126

Applies to: `emdash@1.3.0` (patch)  
Source: [#4113](https://github.com/emdash-cms/emdash/pull/4113)

Send an identifying `User-Agent: EmDash-Importer/1.0` header on all WordPress plugin importer requests. Without this header, hosts that block requests with an empty User-Agent (such as ScalaHosting's bot filter) returned 403 during analyze and media import. The plugin API fetcher now adds the header to every request, and direct media downloads from `fetchMedia` send the same value. This matches the existing media import route behavior.

### Change 127

Applies to: `emdash@1.3.0` (patch)  
Source: [#4150](https://github.com/emdash-cms/emdash/pull/4150)

Explains why the WordPress exporter import can't connect when Cloudflare's bot protection answers with a challenge page. The URL check and the analyze and import steps now say that bot protection blocked the request and how to let it through, instead of reporting that WordPress couldn't be detected or that the analysis failed. In this case the analyze and execute endpoints return the `WP_SITE_CHALLENGE` error code with status 502, and probe results include `challenged: true`.

### Change 128

Applies to: `emdash@1.3.0` (patch)  
Source: [#4150](https://github.com/emdash-cms/emdash/pull/4150)

Stops a WordPress exporter import with the bot-protection message when Cloudflare challenges a request for taxonomies, menus, site settings, or the media list. Previously the import skipped that part without telling you and finished without it. The analyze and execute endpoints now return `WP_SITE_CHALLENGE` with status 502 in these cases too.

### Change 129

Applies to: `emdash@1.3.0` (patch)  
Source: [#3892](https://github.com/emdash-cms/emdash/pull/3892)

Fixes the WordPress export file (WXR) import in the admin keeping links to the old WordPress domain in imported content. Links to the source site are now rewritten to root-relative paths. The WordPress permalink structure is kept (for example `/2024/05/my-post/`), so add redirects if your routes differ. Links to uploaded files stay absolute, including in raw HTML blocks, which the WordPress plugin import previously turned into broken relative `/wp-content/` links. Links inside reusable blocks imported as sections are not changed.
  
  The import analysis now also shows the real site title and address instead of a generic "WordPress Site" heading. For programmatic use, `parseWxrString` now returns the export's site metadata (it was always empty before), and content fetched through `wxrSource` gets the same link rewriting.

### Change 130

Applies to: `emdash@1.3.0` (patch)  
Source: [#4090](https://github.com/emdash-cms/emdash/pull/4090)

Fixes WordPress XML imports creating `acf_field` and `acf_field_group` collections full of serialized field settings on sites that use Advanced Custom Fields. The admin import now skips ACF's own post types, as it already does for WordPress internals such as revisions and menu items. Collections created by earlier imports stay in place; delete them in the admin if you don't need them.

### Change 131

Applies to: `emdash@1.3.0` (patch)  
Source: [#4123](https://github.com/emdash-cms/emdash/pull/4123)

Fixes `media:afterUpload` hooks being silently dropped for REST API multipart uploads and MCP `media_create` uploads on Cloudflare Workers. Both upload paths now defer hook execution through `after()`, matching the admin confirm flow so hooks that perform async work complete as expected.

### Change 132

Applies to: `emdash@1.2.0` (minor)  
Source: [#3056](https://github.com/emdash-cms/emdash/pull/3056)

Adds an `admin.locales` option that limits the admin interface to the languages a site uses, which makes the admin bundle smaller.
  
  ```js
  emdash({
  	admin: { locales: ["en", "de"] },
  });
  ```
  
  Only the listed languages are built into the admin and offered in its language switcher. Users whose preferred languages aren't listed see English. `en` is always included as the fallback, even when the list leaves it out, so `admin: { locales: ["en-GB"] }` still ships English alongside British English. A code the admin doesn't ship fails the build, and the error lists the available codes. Sites that don't set the option keep every language.

### Change 133

Applies to: `emdash@1.2.0` (minor)  
Source: [#3877](https://github.com/emdash-cms/emdash/pull/3877)

Updates the admin user editor to show the name as read-only, with a hint to change it at the identity provider, when an external auth provider such as Cloudflare Access syncs names (the default). Previously the field looked editable, but the change was replaced on that user's next request. Set `syncName: false` in the provider config to make names editable again.

### Change 134

Applies to: `emdash@1.2.0` (minor)  
Source: [#3744](https://github.com/emdash-cms/emdash/pull/3744)

Adds a **Change domain** dialog to **Settings > General** for moving a site to a new domain. Before it changes the **Site URL**, EmDash checks that the new domain serves the site. Links in emails and plugins, sitemaps, `robots.txt`, hreflang links, social image URLs, and canonical links set in the SEO panel then use the new domain. If the check can't reach the site, for example on `localhost` or behind a login, the dialog offers to store the address without the check.
  
  The **Site URL** field becomes read-only, and saving **Settings > General** no longer writes it. When `siteUrl`, `EMDASH_SITE_URL`, or `SITE_URL` is set, the page names that address, which links in emails and plugins keep using.
  
  Passkeys only work at the address where they were created. After a move, keep signing in at the old address, or sign in at the new one with an email link and add a passkey there.

### Change 135

Applies to: `emdash@1.2.0` (minor)  
Source: [#3697](https://github.com/emdash-cms/emdash/pull/3697)

Adds a `labels` prop to the `Comments` and `CommentForm` components from `emdash/ui/comments`, so sites can translate the comment heading, member badge, Like button, form fields, submit button, and status messages. Keys you leave out keep their English defaults.
  
  `Comments` now formats comment dates in the page locale (`Astro.currentLocale`) instead of always using `en-US`, and accepts a `locale` prop to override it. Sites without Astro i18n routing still show `en-US` dates; pass `locale="en-US"` to keep the previous format on a localized site.
  
  After a successful submission, `CommentForm` now says "Comment published" when the comment is approved immediately and "Comment submitted for review" when it waits for moderation, instead of always showing "Comment submitted!".

### Change 136

Applies to: `emdash@1.2.0` (minor)  
Source: [#3744](https://github.com/emdash-cms/emdash/pull/3744)

Adds an **Email users** action to **Settings > General** that tells every other active user where the site now lives. Each user gets an email with a button to the sign-in page at the configured `siteUrl`, or the **Site URL** when none is set, and a note that passkeys from the old address don't work there. The email does not sign anyone in. The action needs an email provider, passkey sign-in, and the `users:manage` permission, and shows how many emails were sent and how many the provider rejected.
  
  The emails come from the new `POST /_emdash/api/settings/domain/notify` endpoint. It accepts signed-in sessions only and can be used 3 times per hour per site.

### Change 137

Applies to: `emdash@1.2.0` (minor)  
Source: [#3827](https://github.com/emdash-cms/emdash/pull/3827)

Adds a video block to the rich text editor. Type `/video` to choose a Media Library video or upload one. Closing the picker leaves an empty video block in place, which you can fill later by clicking it or dropping a video file on it. Video files dropped or pasted anywhere in the text also upload to the Media Library and appear where you dropped them. The video plays in the editor at the width of the text, with a caption field under it and **Replace video** and **Delete video** in its corner. A video's **Used in** tab in the Media Library lists the entries that use it in a video block.
  
  On the site, `Video` from `emdash/ui` renders the `video` block as the browser's own player with its caption. Media Library videos play from your storage's public URL when one is configured, and need the block's `asset.url`: a block without one renders nothing on the site, and the editor shows it as unplayable. A block whose `asset.provider` names a media provider renders from that provider's embed. An empty video block is saved without `asset` and renders nothing.
  
  Uploads follow `maxUploadSize`, 50 MiB by default. The admin's content security policy now allows media from `blob:` and `https:` URLs (`media-src 'self' blob: https:`), as it already did for images. This lets the admin read a video's size before uploading it, and preview a video block whose `asset.url` is on another site. Before, videos uploaded from the admin in production were saved without a width and height.
  
  #### What should I do?
  
  - If a plugin already defines a `video` block, the editor keeps using the plugin's block: it doesn't offer the built-in Video block, and dropped video files aren't uploaded. On the site, the plugin's renderer still wins; a plugin without one gets `Video` for blocks that have only the built-in fields. In TypeScript, narrowing `PortableTextBlock` on `_type === "video"` now gives `PortableTextVideoBlock | PortableTextUnknownBlock`, so reading the plugin's own fields needs a check.
  - If you edit Portable Text with `portableTextToProsemirror` and `prosemirrorToPortableText` from `emdash` in your own TipTap editor, add a `videoBlock` node with the attributes `src`, `mediaId`, `provider`, `caption`, `width` and `height` to its schema. `portableTextToProsemirror` turns every built-in video block into that node, and a schema without it can't load the document.
  - The media usage API and `emdash/client` can now return the reference type `"portable_text_video"` for a video used in a video block. Code that checks every reference type, or validates the list, needs to accept it.
  - With Astro's content security policy turned on and media on another host, allow that host in `media-src`.

### Change 138

Applies to: `emdash@1.2.0` (minor)  
Source: [#3773](https://github.com/emdash-cms/emdash/pull/3773)

Adds numbered pages to every collection list in the admin. The All and Trash tabs load one page of entries at a time, so a collection opens with 20 entries instead of fetching 100, and both tabs use the Media Library's pagination footer pinned to the bottom of the screen: the entry range, 20, 50, or 100 entries per page, and controls to jump to any page. The Trash badge counts every trashed entry instead of stopping at 50, and every trashed entry is reachable.
  
  Selections persist across pages. Changing the search, a filter, the locale, or the collection clears them.
  
  `GET /_emdash/api/content/{collection}` and `GET /_emdash/api/content/{collection}/trash` accept a 1-based `page` parameter instead of `cursor`. A numbered page returns `total` and no `nextCursor`, and sending both `page` and `cursor` returns a `400` validation error. Cursor pagination is unchanged.
  
  `ContentList` accepts optional `pagination` and `trashPagination` props for numbered pages; without them it behaves as before.

### Change 139

Applies to: `emdash@1.2.0` (minor)  
Source: [#3744](https://github.com/emdash-cms/emdash/pull/3744)

Adds a **Continue on** button to **Settings > General** after a site moves to a new domain. Passkeys only work at the address where they were created, so a user signed in at the old address can select the button to sign in at the new one without email. The single-use link expires after 5 minutes and opens **Settings > Security**, ready to add a passkey for the new address. The button appears when you are signed in at an address other than the **Site URL**, or the configured `siteUrl` when one is set. It is not shown when an external provider such as Cloudflare Access handles sign-in.
  
  The link comes from the new `POST /_emdash/api/auth/handover` endpoint, which accepts signed-in sessions only and allows 5 links per user every 5 minutes. `GET /_emdash/api/settings/domain` now also returns `siteOrigin`, the address the link points to.
  
  `@emdash-cms/auth` exports `createMagicLinkUrl()`, which creates a single-use sign-in link without sending an email.

### Change 140

Applies to: `emdash@1.2.0` (patch)  
Source: [#3781](https://github.com/emdash-cms/emdash/pull/3781)

Fixes locally stored images being served as unoptimized originals on sites that set their public origin with `EMDASH_SITE_URL` or `SITE_URL` instead of `siteUrl`, such as Node.js deployments behind an HTTPS reverse proxy. The variable must be set when `astro build` runs; a value set only in the runtime environment does not enable image optimization.

### Change 141

Applies to: `emdash@1.2.0` (patch)  
Source: [#3767](https://github.com/emdash-cms/emdash/pull/3767)

Fixes API token "Last used" dates and the cleanup of expired authentication and rate-limit records on Cloudflare Workers, where the Worker could stop before these writes finished. These writes now finish after the response is sent, and a failure is logged instead of ignored.

### Change 142

Applies to: `emdash@1.2.0` (patch)  
Source: [#3753](https://github.com/emdash-cms/emdash/pull/3753)

Fixes scheduled 404-log cleanup to run only when the table has grown past its cap. The check uses a bounded sample, so most cron ticks no longer scan the entire `_emdash_404_log` table when there is nothing to evict. This prevents the per-minute cleanup from consuming a large D1 row-read budget for tables that are below the limit.

### Change 143

Applies to: `emdash@1.2.0` (patch)  
Source: [#3762](https://github.com/emdash-cms/emdash/pull/3762)

Fixes WordPress imports turning tables in Classic editor posts into a single paragraph. Tables whose cells hold only text now import as tables, keeping their rows, header row, formatting and links. Tables with images, headings, lists or merged cells, with a caption or footer rows, or inside a `<div>` or `<figure>` keep their previous output.
  
  `gutenbergToPortableText()` also sets `hasHeaderRow: true` on tables whose first row holds only `<th>` cells.

### Change 144

Applies to: `emdash@1.2.0` (patch)  
Source: [#3802](https://github.com/emdash-cms/emdash/pull/3802)

Fixes `getEmDashCollection()` returning published content in edit mode and preview, while `getEmDashEntry()` returned the draft. Lists now show each entry's draft revision to editors in edit mode, and the draft of the previewed entry to a preview link, so inline edits made on a list page no longer appear to revert after saving and previews of list pages show the changes. Other entries in a preview, and all public requests, still get published content.

### Change 145

Applies to: `emdash@1.2.0` (patch)  
Source: [#3631](https://github.com/emdash-cms/emdash/pull/3631)

Fixes `comment:afterCreate` hooks being cut short on Cloudflare Workers. The hooks for a new comment ran as fire-and-forget work that the host did not keep alive, so they could be cancelled as soon as the response was sent. Sandboxed plugins, which call back into the host for settings and email, were stopped at their first call and never ran: a plugin that emails admins about new comments sent nothing. These hooks now run through the host's `waitUntil`, after the response, until they finish.

### Change 146

Applies to: `emdash@1.2.0` (patch)  
Source: [#3381](https://github.com/emdash-cms/emdash/pull/3381)

Fixes comment listings so a fractional `limit` no longer fails with a 500. The page size is rounded down to a whole number on the public comments endpoint, the moderation inbox, and plugin comment reads, and a non-numeric `limit` uses the default of 50.

### Change 147

Applies to: `emdash@1.2.0` (patch)  
Source: [#3785](https://github.com/emdash-cms/emdash/pull/3785)

Fixes `plugin:install` and `plugin:activate` never running for plugins registered in the `plugins` array of `astro.config.mjs`, so setup such as `ctx.cron.schedule()` in `plugin:activate` now takes effect.
  
  Each plugin's hooks run once, when the site first starts with that plugin. On existing sites, this happens on the first start after upgrading for every plugin in `plugins` that you have never enabled, disabled, or changed MCP access for in the admin. A `plugin:install` hook that is not safe to run on a site where the plugin is already in use will run then, so check your plugins before upgrading.
  
  If either hook throws, EmDash logs the error and disables the plugin instead of retrying on every start. Re-enable it from the Plugins page after fixing the problem; this runs `plugin:activate` again.

### Change 148

Applies to: `emdash@1.2.0` (patch)  
Source: [#3930](https://github.com/emdash-cms/emdash/pull/3930)

Fixes `PUT /_emdash/api/content/{collection}/{id}` so a save that carries `_rev` can no longer overwrite a change another writer saved while the request was being processed. The token was checked once against the first read of the entry, and a save that landed before the entry was read again for the write went unnoticed. The version used by the write is now checked against `_rev` as well, and a mismatch returns `409 CONFLICT`. Saves without `_rev` are unchanged.

### Change 149

Applies to: `emdash@1.2.0` (patch)  
Source: [#3911](https://github.com/emdash-cms/emdash/pull/3911)

Load `EMDASH_ENCRYPTION_KEY` from the project `.env` into `process.env` during `astro dev`. This lets freshly scaffolded Node.js sites save plugin settings declared with `type: "secret"` without first exporting the `.env` file into the shell. Existing environment variables are honored and never overwritten; other EmDash variables are not copied so that `.env` values intended for production do not override generated dev values.

### Change 150

Applies to: `emdash@1.2.0` (patch)  
Source: [#3744](https://github.com/emdash-cms/emdash/pull/3744)

Fixes email links pointing to the address a site was set up on after it moved to a new domain. Sign-in, invitation, self-signup, recovery, and comment notification emails now use the **Site URL** from **Settings > General** when `siteUrl`, `EMDASH_SITE_URL`, or `SITE_URL` is not configured, and fall back to the setup address when the field is empty. Only the origin of the **Site URL** is used, and it must use `https://` unless the host is a loopback address. A configured `siteUrl` still takes precedence. `emdash export-seed` no longer copies the **Site URL** into the seed.
  
  If you don't configure `siteUrl` and the **Site URL** field holds an address that doesn't serve this site's admin, for example an old domain, links in these emails point there after upgrading. Check the field before upgrading; clearing it restores the previous behavior. Seeds that set `settings.url`, including seeds exported by earlier versions, still fill in the **Site URL**, so remove `url` from a seed copied from another site before using it.

### Change 151

Applies to: `emdash@1.2.0` (patch)  
Source: [#3920](https://github.com/emdash-cms/emdash/pull/3920)

Fixes `emdash types` so the generated `.emdash/types.ts` imports `BylineSummary`, `ContentBylineCredit`, and `TaxonomyTerm` alongside `PortableTextBlock`.
  
  Previously the CLI downloaded TypeScript definitions whose collection interfaces referenced these three names but only imported `PortableTextBlock`, causing `tsc` to report `TS2304` errors for every collection.

### Change 152

Applies to: `emdash@1.2.0` (patch)  
Source: [#3591](https://github.com/emdash-cms/emdash/pull/3591)

Fixes the visual editor stripping superscript and subscript formatting from Portable Text fields on save, and adds superscript and subscript buttons to its formatting menu. A field that contains formatting the visual editor can't represent now shows a message instead of opening for editing, so editing on the page no longer silently removes that formatting.

### Change 153

Applies to: `emdash@1.2.0` (patch)  
Source: [#3736](https://github.com/emdash-cms/emdash/pull/3736)

Fixes the `core:recent-posts` widget so it shows each post's publication date and thumbnail. Dates use the page's locale and the site's configured timezone, falling back to UTC when the timezone setting isn't recognized. The widget doesn't apply the `dateFormat` setting; dates always use the locale's long format, such as "October 1, 2026" in English. Thumbnails render at up to 96 pixels wide instead of at full size.

### Change 154

Applies to: `emdash@1.2.0` (patch)  
Source: [#3731](https://github.com/emdash-cms/emdash/pull/3731)

Fixes `decodeSlug()` so malformed percent-escaped slugs return `undefined` instead of throwing, letting `[slug]` pages fall through to their 404 handling.

### Change 155

Applies to: `emdash@1.2.0` (patch)  
Source: [#3941](https://github.com/emdash-cms/emdash/pull/3941)

Fixes installing and updating registry plugins whose releases were attested with `actions/attest-build-provenance` v3, including releases from the workflow that `emdash-plugin release setup` generates. These installs previously failed with "release provenance could not be verified". Provenance in both GitHub formats is now accepted, and releases built on self-hosted runners are still rejected.

### Change 156

Applies to: `emdash@1.2.0` (patch)  
Source: [#3851](https://github.com/emdash-cms/emdash/pull/3851)

Adds Indonesian translations for the site domain-change flow, general settings screen, marketplace capability labels, and visual-editing toolbar strings.

### Change 157

Applies to: `emdash@1.2.0` (patch)  
Source: [#3746](https://github.com/emdash-cms/emdash/pull/3746)

Fixes in-page visual editing removing the link and alignment from Portable Text images. Saving any edit to a Portable Text field from the page no longer turns linked images into plain images or resets left, right, center, wide, and full alignment.

### Change 158

Applies to: `emdash@1.2.0` (patch)  
Source: [#3795](https://github.com/emdash-cms/emdash/pull/3795)

Fixes the content editor failing to open any entry with a date field when the site timezone setting is not a valid IANA timezone (for example `Lisboa` instead of `Europe/Lisbon`). The editor now falls back to UTC for such a value instead of crashing, and the settings API and MCP settings tool reject an unrecognized timezone with a validation error. A site that already stores one can still save its other settings, and can fix the timezone in Settings > General.

### Change 159

Applies to: `emdash@1.2.0` (patch)  
Source: [#3922](https://github.com/emdash-cms/emdash/pull/3922)

Fixes `entry.id` sometimes missing the locale prefix on multilingual sites. With several locales configured, entries in a locale whose URLs are prefixed get an `entry.id` such as `en/my-post`. With a Cloudflare database (D1, Durable Object SQL or Hyperdrive), in production and in `astro dev`, the prefix could be missing, depending on what else had already run in the same isolate, so the same entry returned `my-post` on some requests and `en/my-post` on others. Collection queries, `getEmDashEntry()` and referenced entries now always include the prefix.
  
  If your templates add the locale to links themselves, for example `/en/posts/${entry.id}`, or pass `entry.id` to `getEmDashEntry()`, use `entry.data.slug` instead, which never includes the locale.

### Change 160

Applies to: `emdash@1.2.0` (patch)  
Source: [#3914](https://github.com/emdash-cms/emdash/pull/3914)

Fixes admin media uploads skipping `media:beforeUpload` and `media:afterUpload` plugin hooks. Plugins can validate, rename, change the file type, or cancel uploads before they are accepted, and receive a notification after a new media item becomes ready. Filename and type changes are validated; the upload size stays tied to the original client bytes.

### Change 161

Applies to: `emdash@1.2.0` (patch)  
Source: [#3755](https://github.com/emdash-cms/emdash/pull/3755)

Fixes `emdash media upload --alt` and `--caption`, which reported a successful upload but saved neither value on the new media item. Direct uploads to `POST /_emdash/api/media` store the `alt` and `caption` form fields.

### Change 162

Applies to: `emdash@1.2.0` (patch)  
Source: [#3758](https://github.com/emdash-cms/emdash/pull/3758)

Fixes the admin's new-entry form ignoring field default values: a boolean field with `defaultValue: true` started switched off, and saving the entry untouched could store no value. New entries in the admin now start with each field's default value.
  
  Manifest field descriptors now include stored field defaults as `defaultValue`, except for relation-bound reference fields.

### Change 163

Applies to: `emdash@1.2.0` (patch)  
Source: [#3573](https://github.com/emdash-cms/emdash/pull/3573)

Speeds up the first anonymous page views on each new server instance, such as a fresh Cloudflare Worker isolate, when migrations run automatically: the database setup check now runs at the same time as runtime startup instead of before it.
  
  When all migrations are already applied, a temporary database error during the startup migration check (for example a lost D1 connection) no longer blocks runtime startup on that instance for 30 seconds; the next request tries again. An error while pending migrations are being applied, or a migration lock left behind by a stopped instance, still pauses retries.

### Change 164

Applies to: `emdash@1.2.0` (patch)  
Source: [#3806](https://github.com/emdash-cms/emdash/pull/3806)

Fixes collection sitemaps silently dropping entries beyond the first 50,000. Each `/sitemap-{collection}.xml` now holds up to 2,000 entries, ordered by entry ID instead of last update, and continues at `/sitemap-{collection}-2.xml`, `-3.xml`, and so on. `/sitemap.xml` lists every page with its own last-modified date, and translations that land on different pages still list each other as hreflang alternates.
  
  #### What should I do?
  
  Nothing, if search engines read `/sitemap.xml` and you have not replaced the sitemap routes. For collections with more than 2,000 listed entries:
  
  - If you submitted a collection sitemap such as `/sitemap-post.xml` directly to a search console, submit `/sitemap.xml` instead so search engines find every page.
  - If you replaced `src/pages/sitemap.xml.ts`, add `/sitemap-{collection}-{n}.xml` for each further page of 2,000 entries.
  - If you replaced `src/pages/sitemap-[collection].xml.ts`, handle the `-{n}` suffix in the `collection` parameter (for example `post-2`) and serve that page of entries.

### Change 165

Applies to: `emdash@1.2.0` (patch)  
Source: [#3546](https://github.com/emdash-cms/emdash/pull/3546)

Adds `group` to plugin admin pages, in native plugin descriptors and in `admin.pages` of `emdash-plugin.jsonc`, to place them in collapsible admin sidebar folders. A page whose group matches the group of a collection shown in the sidebar appears inside that folder, after its collections and taxonomies. Pages that share any other group, from one plugin or several, fold into one folder in the Plugins section. Pages without a group stay where they are.

### Change 166

Applies to: `emdash@1.2.0` (patch)  
Source: [#3602](https://github.com/emdash-cms/emdash/pull/3602)

Fixes trusted (in-process) plugin API routes dropping error `details`: a route that throws `PluginRouteError.badRequest(message, details)`, or whose `input` schema rejects the request, now returns those details in the JSON error body (`error.details`), so a form can show which fields failed. Unexpected errors still return only a generic message.

### Change 167

Applies to: `emdash@1.2.0` (patch)  
Source: [#3741](https://github.com/emdash-cms/emdash/pull/3741)

Fixes native plugin routes returning a generic `INTERNAL_ERROR` under `astro dev` when the handler throws `PluginRouteError`, so the client receives the error's code, status, and message.

### Change 168

Applies to: `emdash@1.2.0` (patch)  
Source: [#3744](https://github.com/emdash-cms/emdash/pull/3744)

Fixes plugins seeing an outdated site address in `ctx.site.url` and `ctx.url()`. They now use the same origin as links in emails: the configured `siteUrl`, `EMDASH_SITE_URL`, or `SITE_URL`, then the **Site URL** from **Settings > General**, then the address the site was set up on. Previously plugins only saw the setup address, even when `siteUrl` was configured or the site had moved to a new domain. A changed **Site URL** reaches plugins after the server restarts or, on Cloudflare Workers, as new isolates start.

### Change 169

Applies to: `emdash@1.2.0` (patch)  
Source: [#3931](https://github.com/emdash-cms/emdash/pull/3931)

Fixes `parseApiResponse` from `emdash/plugin-utils` rejecting with an error message that ends in a bare colon when a plugin route responds with an error page instead of an error message. The message is now the fallback message alone, without the HTTP status text, which browsers leave empty over HTTP/2 and HTTP/3.

### Change 170

Applies to: `emdash@1.2.0` (patch)  
Source: [#3574](https://github.com/emdash-cms/emdash/pull/3574)

Speeds up the first request on a fresh Cloudflare Worker isolate for sites on D1 or Durable Object SQLite: runtime startup now loads the stored plugin provider selections (such as the active comment moderator) with its other startup reads, saving one database round trip.

### Change 171

Applies to: `emdash@1.2.0` (patch)  
Source: [#3553](https://github.com/emdash-cms/emdash/pull/3553)

Stops the datetime normalization migration from printing an error-level `[datetime migration] 0 noncanonical values …` line on new sites and on upgrades with nothing to convert. When stored datetimes are rewritten, the migration still prints its report, now as an informational message.

### Change 172

Applies to: `emdash@1.2.0` (patch)  
Source: [#1899](https://github.com/emdash-cms/emdash/pull/1899)

Adds an optional `urlTemplate` prop to the `core:recent-posts` widget (e.g. `"/blog/:slug"` or `"/:slug"` for catch-all routes), using the same `:collection`, `:id`, `:slug`, and `:path` tokens as LiveSearch's `routeMap`, with a localized label in the admin widget form. Without a template the widget links exactly as before.

### Change 173

Applies to: `emdash@1.2.0` (patch)  
Source: [#3287](https://github.com/emdash-cms/emdash/pull/3287)

Fixes missing redirect hit counts and 404 log entries on Cloudflare Workers. The Worker could stop before these writes finished. It now stays alive until they complete, and a failed write is logged with a `[emdash:redirects]` prefix.

### Change 174

Applies to: `emdash@1.2.0` (patch)  
Source: [#3943](https://github.com/emdash-cms/emdash/pull/3943)

Fixes publishing and installing registry plugins attested by a GitHub Actions reusable workflow in the same repository and ref as its calling workflow. These releases previously failed with `PROVENANCE_UNVERIFIABLE` because the caller and signer were treated as the same workflow.

### Change 175

Applies to: `emdash@1.2.0` (patch)  
Source: [#3898](https://github.com/emdash-cms/emdash/pull/3898)

Fixes Astro route rules caching responses that belong to one visitor. With a cache provider such as `cacheCloudflare()`, a page rendered for a signed-in user (for example a comment form showing their name and email) could be stored and served to anonymous visitors, and a catch-all rule such as `/[...slug]` could store EmDash admin API responses or anonymous `401` responses and serve them to other users.
  
  Responses rendered for a signed-in user, and responses sent with `Cache-Control: private` or `no-store`, are no longer stored in the route cache. This includes EmDash API responses such as `/_emdash/api/search`, so route rules no longer cache them. A page requested by a signed-in user is filled into the cache by the next anonymous visitor instead.

### Change 176

Applies to: `emdash@1.2.0` (patch)  
Source: [#3559](https://github.com/emdash-cms/emdash/pull/3559)

Fixes Select All inside code blocks in the admin and inline visual editors so it selects only the code instead of the entire document.

### Change 177

Applies to: `emdash@1.2.0` (patch)  
Source: [#3861](https://github.com/emdash-cms/emdash/pull/3861)

Fixes every-minute cron ticks exceeding the Workers Free CPU limit on cold isolates by running system cleanup once per hour instead of on every tick. The scheduled-publish sweep, cron tasks, and heartbeat still run each minute; bookkeeping cleanups now run only on the top of the hour.

### Change 178

Applies to: `emdash@1.2.0` (patch)  
Source: [#3525](https://github.com/emdash-cms/emdash/pull/3525)

Fixes `emdash seed --no-content` applying the seed's content entries, bylines, and taxonomy terms anyway. The flag now skips them as documented, so combining it with `--on-conflict update` no longer overwrites existing entries.
  
  #### What should I do?
  
  If a script uses the undocumented `--noContent` spelling, switch it to `--no-content` or `--content=false`. `--noContent` was the only spelling that skipped content before this release. It is now ignored without an error, so the command applies the seed's content.

### Change 179

Applies to: `emdash@1.2.0` (patch)  
Source: [#3857](https://github.com/emdash-cms/emdash/pull/3857)

Warns when a seed file's `repeater` field has no `validation.subFields`, or declares its sub-fields under `fields` instead. Such a repeater previously seeded without any warning, and the admin then showed rows labelled "Item 1", "Item 2" with no inputs to edit. `emdash seed` prints the warning naming the field, and `validateSeed()` returns it in `warnings`; the seed still applies as before. The setup wizard does not display seed warnings.

### Change 180

Applies to: `emdash@1.2.0` (patch)  
Source: [#3672](https://github.com/emdash-cms/emdash/pull/3672)

Fixes seed validation accepting reserved collection and field slugs, such as a field named `version`. `emdash seed --validate` and the check that runs before a seed is applied now report the reserved slug, instead of the seed passing validation and then failing while it is applied.

### Change 181

Applies to: `emdash@1.2.0` (patch)  
Source: [#3578](https://github.com/emdash-cms/emdash/pull/3578)

Warns when `emdash seed` (including `--validate`) finds a widget that sets its options under `settings`. Seeding ignores that key; widget options belong in `props`.

### Change 182

Applies to: `emdash@1.2.0` (patch)  
Source: [#3754](https://github.com/emdash-cms/emdash/pull/3754)

Fixes the setup wizard staying on "Loading EmDash..." on sites whose Astro `security.csp` sets `scriptDirective.strictDynamic`. The setup page now gets the same Content-Security-Policy as the rest of the admin.

### Change 183

Applies to: `emdash@1.2.0` (patch)  
Source: [#3749](https://github.com/emdash-cms/emdash/pull/3749)

Fixes new sites created from a template keeping the template's site title and tagline instead of the ones entered in the setup wizard. Sites set up on 0.39.0 or later keep their stored values after upgrading; change them under Settings → General.

### Change 184

Applies to: `emdash@1.2.0` (patch)  
Source: [#3595](https://github.com/emdash-cms/emdash/pull/3595)

Fixes `/sitemap-{collection}.xml` returning 500 `<!-- EmDash not configured -->` for names that are not valid collection slugs, such as the `/sitemap-0.xml` that crawlers request. These now return 404.

### Change 185

Applies to: `emdash@1.2.0` (patch)  
Source: [#3750](https://github.com/emdash-cms/emdash/pull/3750)

Fixes blurry small images, such as avatars and icons, on high-density screens, and stops requesting high-density sizes larger than the original image.
  
  Media-provider images in `Image` from `emdash/ui`, Portable Text images, and galleries now get a `srcset` with the rendered width and, up to 1920 pixels, a high-density candidate: twice the rendered width, or the original width when that is smaller. Before, provider images narrower than 320 pixels had no `srcset` at all, and other provider images could list widths larger than the original. Provider images shown at their original size, as gallery images always are, now also offer that original width, even above 1920 pixels.
  
  `Image` applies the same high-density candidate to media URLs from another origin, such as a public R2 bucket.

### Change 186

Applies to: `emdash@1.2.0` (patch)  
Source: [#3889](https://github.com/emdash-cms/emdash/pull/3889)

Fixes assigning more than about 30 categories or tags to an entry on Cloudflare D1, and removing more than about 100 at once. These failed with `too many SQL variables`, whether from the admin, the content terms API, a plugin, or the WordPress import, which left such imported posts without any terms.

### Change 187

Applies to: `emdash@1.2.0` (patch)  
Source: [#3823](https://github.com/emdash-cms/emdash/pull/3823)

Fixes parameterized redirect patterns so URLs with a trailing slash match the same rule as URLs without one, consistent with exact and catch-all redirects.

### Change 188

Applies to: `emdash@1.2.0` (patch)  
Source: [#3771](https://github.com/emdash-cms/emdash/pull/3771)

Fixes the visual editing toolbar's Publish button switching to English after a save when the toolbar is shown in another language. The button now keeps its translated label, and the toolbar's status badges and image popover can be translated as well.

### Change 189

Applies to: `emdash@1.2.0` (patch)  
Source: [#3756](https://github.com/emdash-cms/emdash/pull/3756)

Fixes Publish in the visual editing toolbar publishing an older version when it is clicked while an inline Portable Text edit is still saving, which left that edit as unpublished changes. Publish now waits until every save on the page has finished.

### Change 190

Applies to: `emdash@1.2.0` (patch)  
Source: [#3894](https://github.com/emdash-cms/emdash/pull/3894)

Fixes the `WebMcpSearch` component's `search_site` tool so agents can tell a failed search from an empty one. An empty query, an HTTP error or a network failure now fails the tool call, where it previously reached the agent as a successful result. Results now arrive as a JSON array of `{ title, url, collection, excerpt }` objects, without a JSON-encoded string nested inside.

### Change 191

Applies to: `emdash@1.2.0` (patch)  
Source: [#3575](https://github.com/emdash-cms/emdash/pull/3575)

Updates `getWidgetAreas()` to return areas in creation order (previously unspecified), and removes a database round trip from logged-out page loads on Cloudflare D1.

### Change 192

Applies to: `emdash@1.2.0` (patch)  
Source: [#3896](https://github.com/emdash-cms/emdash/pull/3896)

Fixes WordPress imports leaving links to the old site's uploads in place outside image blocks. After the media import, these URLs now also point to the imported media: cover backgrounds, file blocks, self-hosted audio and video, links in text and tables (for example to a PDF), buttons, and images and links in raw HTML blocks. Content imported before this fix is not changed.

### Change 193

Applies to: `emdash@1.2.0` (patch)  
Source: [#3895](https://github.com/emdash-cms/emdash/pull/3895)

Fixes scheduled WordPress posts being imported as plain drafts. The WordPress export file (WXR) import and the WordPress plugin import in the admin now schedule them for their original publish date. Posts whose scheduled date has already passed are still imported as drafts. Posts imported before this fix are skipped on a re-import, so schedule them from the editor or delete and import them again.
  
  The WordPress plugin import also reads post dates as UTC now. On Node servers running in a time zone other than UTC, imported created and modified dates were shifted by the server's offset.

### Change 194

Applies to: `emdash@1.1.0` (minor)  
Source: [#3680](https://github.com/emdash-cms/emdash/pull/3680)

Adds a publishing calendar to the admin. It shows published entries on their publication date, and scheduled entries and scheduled updates on their scheduled date, across every visible collection and locale. Contributors and higher roles open it from **Calendar** in the sidebar, the command palette, or the dashboard's **Scheduled** count.
  
  **Month** shows a grid of days and **Agenda** lists entries by day; phones and other narrow screens open the agenda and show the month as a date picker. Both views place entries in the site's time zone, show browser-zone times when the viewer's zone differs, mark schedules that missed their time as **Overdue**, filter by collection, locale, and state, and keep the view, month, filters, and open entry in the URL. When a month's grid holds more than 1,000 entries, the calendar shows the first 1,000 and marks the days it didn't load.
  
  Selecting an entry opens a side panel with its details, a link to the editor, and a preview or live link. Users who can publish the entry can also reschedule it, remove its schedule, or publish an overdue entry immediately. Ctrl-click or Cmd-click opens the entry in the editor instead.

### Change 195

Applies to: `emdash@1.1.0` (minor)  
Source: [#3566](https://github.com/emdash-cms/emdash/pull/3566)

Adds `locale` and `translationOf` to the `content:beforeSave` and `content:afterSave` hook events, for trusted and sandboxed plugins, so a hook can tell a new entry from a new translation of an existing one.
  
  `locale` is the locale the entry is saved in: the resolved requested locale (or the default locale) on a create, and the stored entry's locale on an update. `translationOf` is the ID of the source entry when a create comes from the translation flow, and is absent otherwise. Both fields are optional; existing hooks are unaffected.

### Change 196

Applies to: `emdash@1.1.0` (minor)  
Source: [#3687](https://github.com/emdash-cms/emdash/pull/3687)

Adds CSS and JavaScript to HTML blocks, and changes how new HTML blocks render on the site.
  
  Previously, every HTML block rendered inline, and the site sanitized its HTML, removing scripts and styles. HTML blocks created in the admin editor, or with `/html` in visual editing, now render in a sandboxed iframe that runs their HTML, CSS and JavaScript. Anyone who can edit content (Contributor and up, and sandboxed plugins with `content:write`) can add JavaScript that runs for visitors once the entry is published. The iframe can't read the site's cookies, storage or pages, and the site's styles don't apply inside it. Relative links in it resolve from the site's root. After a visitor clicks inside the iframe, it can open other pages in the visitor's tab or a new one. There is no site-wide setting for this; to render a block the previous way, choose **Inline** in its menu.
  
  Existing HTML blocks, and blocks created through imports, REST or MCP, keep rendering inline unless they set `isolated: true`.
  
  In the editor, an HTML block has HTML, CSS and JS tabs with a code editor, and a Preview tab that shows the block as the site renders it. A saved block that runs JavaScript waits for **Run preview**. The admin editor no longer nests HTML blocks in quotes, lists or table cells, where saving dropped them. HTML blocks pasted from another website or browser tab render inline.
  
  #### New fields
  
  `htmlBlock` gains optional `css` and `js` strings and an `isolated` flag. They're written only when set, so existing content is unchanged when it's opened and saved.
  
  #### What should I do?
  
  - If your site replaces the `htmlBlock` renderer, pass blocks with `isolated: true` to `HtmlBlock` from `emdash/ui`, or render them in an iframe whose `sandbox` omits `allow-same-origin`. Otherwise isolated blocks render without their CSS and JavaScript.
  - If you render Portable Text outside EmDash's components, handle `isolated` blocks the same way.
  - With Astro's content security policy turned on, the browser blocks the styles and scripts inside isolated blocks, so they render without their CSS, JavaScript or automatic height.

### Change 197

Applies to: `emdash@1.1.0` (minor)  
Source: [#3688](https://github.com/emdash-cms/emdash/pull/3688)

Adds an iframe block for embedding pages from other sites. In the editor, type `/iframe` and paste an embed code or a link into the Code tab; YouTube and Vimeo links become their players, and the Preview tab shows the embedded page. When an entry opens, a saved block waits for **Load preview**. Iframe blocks pasted from another website or browser tab arrive empty. On the site, `Iframe` from `emdash/ui` renders the `iframe` block as a responsive, lazy-loading iframe.
  
  The iframe is sandboxed and sends a `strict-origin-when-cross-origin` referrer. Only https sources render, pages on the site's own host lose same-origin access, and only the permissions video and map players need (such as autoplay, fullscreen and picture-in-picture) reach the embedded page.
  
  The admin's content security policy now allows https frames (`frame-src 'self' https:`), so previews can load embedded pages, including frames inside HTML block previews.
  
  #### What should I do?
  
  - If a plugin already defines an `iframe` block, the editor keeps using the plugin's block and doesn't offer the built-in one. On the site, the plugin's renderer still wins; a plugin without one gets `Iframe` for blocks that have only the built-in fields. In TypeScript, narrowing `PortableTextBlock` on `_type === "iframe"` now gives `PortableTextIframeBlock | PortableTextUnknownBlock`, so reading the plugin's own fields needs a check such as `"theme" in block`.
  - With Astro's content security policy turned on, allow the embedded hosts in `frame-src`. Iframe blocks also lose their custom size under that policy.

### Change 198

Applies to: `emdash@1.1.0` (minor)  
Source: [#3254](https://github.com/emdash-cms/emdash/pull/3254)

Adds a `microsoft()` login provider, so editors can sign in to the admin with a Microsoft Entra ID work or school account next to passkeys and the other providers.
  
  ```js
  import { microsoft } from "emdash/auth/providers/microsoft";
  
  emdash({ authProviders: [microsoft()] });
  ```
  
  The provider reads `EMDASH_OAUTH_MICROSOFT_CLIENT_ID`, `EMDASH_OAUTH_MICROSOFT_CLIENT_SECRET`, and `EMDASH_OAUTH_MICROSOFT_TENANT_ID` (or the unprefixed names) and stays unconfigured until all three are set. The tenant is a directory (tenant) ID, or `common`, `organizations`, or `consumers`. With a directory ID, an account that signs in through that directory counts as verified when its address is in the domain of its sign-in name, or when the optional `xms_edov` claim confirms the address's domain, so it can link to an existing user, accept an invite, sign up through an allowed domain, and create the first admin account. Accounts that sign in through another directory or identity provider, such as guests, and sign-ins through `common`, `organizations`, or `consumers` do not count as verified. `microsoft({ emailVerified })` overrides this either way.

### Change 199

Applies to: `emdash@1.1.0` (minor)  
Source: [#3632](https://github.com/emdash-cms/emdash/pull/3632)

Adds a `WebMcpSearch` component (`emdash/ui/webmcp-search`) that lets AI agents in a visitor's browser search your published content. In browsers that support WebMCP, it registers a read-only `search_site` tool backed by the public search API and returns titles, absolute URLs, and plain-text excerpts. It accepts the same `collections`, `locale`, `limit`, and `routeMap` props as `LiveSearch` and does nothing in other browsers.

### Change 200

Applies to: `emdash@1.1.0` (patch)  
Source: [#3526](https://github.com/emdash-cms/emdash/pull/3526)

Fixes byline translations dropping the source byline's linked user, which left the user's entries in the translation's locale without an author credit. Translations created with the admin's Translate action now keep the source's user, so those entries show the translated byline.
  
  When `translationOf` is set and the call omits `userId`, the `byline_create` MCP tool now links the source's user instead of creating an unlinked translation. Pass `userId: null` to keep the previous behavior.
  
  A user can have only one byline per locale. Creating a byline with a `userId` that already has a different byline in the target locale fails with `CONFLICT` naming that byline, instead of a server error. Translating a byline whose user already has a different byline in the target locale also fails with `CONFLICT`, where it previously created an unlinked translation.
  
  #### What should I do?
  
  Translations created before this release stay unlinked, and the admin's byline list marks them as unlinked. To restore author credits in a locale, open the translation in the admin and link the user.
  
  If Translate reports that the user is already linked to another byline in that locale, unlink that byline in the admin first, or create the translation with `byline_create` and `userId: null`.

### Change 201

Applies to: `emdash@1.1.0` (patch)  
Source: [#3711](https://github.com/emdash-cms/emdash/pull/3711)

Fixes the setup wizard failing with `SITE_URL_REQUIRED` on Cloudflare Workers since 0.40.1 when `siteUrl`, `EMDASH_SITE_URL`, or `SITE_URL` is not set, which blocked new sites created with the Deploy to Cloudflare button. On Cloudflare's network, setup now records `https://` and the hostname it runs on as the origin for authentication emails, and passkeys created during setup only work on that hostname.
  
  - To use a custom domain, run setup on that domain or set `EMDASH_SITE_URL` first.
  - Node.js deployments still need a configured origin before production setup.
  - A Workers build served outside Cloudflare (`wrangler dev`, `astro preview`, or self-hosted workerd) on a reachable address should set `siteUrl` or `EMDASH_SITE_URL` before setup.

### Change 202

Applies to: `emdash@1.1.0` (patch)  
Source: [#3580](https://github.com/emdash-cms/emdash/pull/3580)

Adds `image/jxl` (JPEG XL) to the default media upload allowlist, so `.jxl` files can be uploaded without a field-specific MIME list. Upload routes now fall back to the filename extension when the browser reports an empty or generic MIME type, which is the common case for JPEG XL outside Safari.

### Change 203

Applies to: `emdash@1.1.0` (patch)  
Source: [#3652](https://github.com/emdash-cms/emdash/pull/3652)

Speeds up the image endpoint EmDash installs (`/_image` by default): its requests no longer wait for the database setup check and runtime startup that delayed the first images on a fresh server instance, such as a new Cloudflare Worker isolate. Signed-in requests still get `locals.user`, but on D1 with `session` enabled their responses no longer set the D1 bookmark cookie, so an edge-cache route rule for `/_image` now also caches admin media thumbnails.
  
  On these requests `locals.emdash` holds only `storage`, plus `db` for a signed-in user; the page and admin helpers it carried before are not set. Playground requests are unchanged. While `check` or `manual` migration mode answers other requests with the 503 "Database migrations are required" response, image endpoint requests are still served.

### Change 204

Applies to: `emdash@1.1.0` (patch)  
Source: [#3662](https://github.com/emdash-cms/emdash/pull/3662)

Fixes the MCP `content_list` tool suggesting `created_at` and `updated_at` for `orderBy`, which it rejects with a validation error. The tool description now lists only fields it accepts: `createdAt`, `updatedAt`, `publishedAt`, `scheduledAt`, `slug`, `status`, `locale`, and field slugs that are indexed or set as the collection's `titleField` or `dateField`.

### Change 205

Applies to: `emdash@1.1.0` (patch)  
Source: [#3579](https://github.com/emdash-cms/emdash/pull/3579)

Reduces database queries when rendering navigation menus with `getMenu()` and `getMenuWithCacheHint()`: a menu and its items now load in a single query, including when the menu falls back to another locale, saving at least one query per menu that isn't already served from the object cache. With an object cache configured, logged-out HTML page loads on Cloudflare D1 and Durable Object databases also skip one more query per request, and menus created or removed by seeding, WordPress import, or site transfer show up without waiting for the cache to expire.

### Change 206

Applies to: `emdash@1.1.0` (patch)  
Source: [#3662](https://github.com/emdash-cms/emdash/pull/3662)

Fixes content lists skipping entries when paging with `nextCursor` while sorted by a field that can be empty, such as the publish date, scheduled date, title, slug, or a collection's `dateField` or `titleField`. This affected the admin content list for collections with more than 100 entries, including its default sort when the collection sets a `dateField`. It also affected `GET /_emdash/api/content/{collection}`, the MCP `content_list` tool, and plugin `ctx.content.list` calls that set `orderBy`.
  
  The order of entries is unchanged, and cursors issued before the upgrade are still accepted.

### Change 207

Applies to: `emdash@1.1.0` (patch)  
Source: [#3662](https://github.com/emdash-cms/emdash/pull/3662)

Fixes `getEmDashCollection` skipping entries when paging with `nextCursor` while sorted by a field that can be empty, such as `published_at`, `title`, `slug`, or a custom date field, including lists filtered by taxonomy terms. Paging by a boolean field or by a system column such as `version` also returns every entry now. The order of entries is unchanged, and cursors issued before the upgrade are still accepted.

### Change 208

Applies to: `emdash@1.1.0` (patch)  
Source: [#3651](https://github.com/emdash-cms/emdash/pull/3651)

Fixes sites using `d1()` or `durableObjects()` with `session` enabled, or `hyperdrive()`, reading the preview secret and IP salt from the database on every editor page view, preview link, and comment request. `durableObjects()` without `session` did the same on write requests, such as comment submissions and reactions. Both values are now read once per isolate, as with other database adapters, so rotating one by deleting its `options` row takes effect after a redeploy.

### Change 209

Applies to: `emdash@1.1.0` (patch)  
Source: [#3694](https://github.com/emdash-cms/emdash/pull/3694)

Speeds up redirect matching on sites with many redirects. Public requests now load the enabled redirect rules in a single query and afterwards check one small row to see whether they changed, instead of reading the whole redirects table every 30 seconds in every Worker isolate. Redirect changes made in the admin, through the API, by automatic slug-change redirects, by seeding or by import take effect as before. A site that has just upgraded, or whose published redirect data is missing or damaged, keeps serving redirects from the redirects table while it rebuilds that data in the background.

### Change 210

Applies to: `emdash@1.1.0` (patch)  
Source: [#3692](https://github.com/emdash-cms/emdash/pull/3692)

Fixes enabling a disabled redirect that closes a redirect loop. Enabling it from the admin, the API, or a plugin now fails with a loop validation error, as creating or editing the same redirect already did, and the database rejects it for writers that bypass the API. Previously such an enable succeeded and the loop was only flagged with an admin warning, so automation that toggled a loop-closing redirect on will now receive a validation error instead. Loops that already exist on a site are unchanged and can still be disabled.

### Change 211

Applies to: `emdash@1.1.0` (patch)  
Source: [#3693](https://github.com/emdash-cms/emdash/pull/3693)

Fixes redirect pattern precedence when several enabled pattern rules match the same path. The earliest-created rule now always wins. Previously the winner depended on database row order, which could change after a rule was edited or hit, particularly on PostgreSQL.

### Change 212

Applies to: `emdash@1.1.0` (patch)  
Source: [#3665](https://github.com/emdash-cms/emdash/pull/3665)

Fixes the settings page of a plugin installed from the registry or marketplace showing the plugin's internal ID, such as `r_dsniqezhchh4zone`, as its title instead of its name. The admin endpoint `GET /_emdash/api/admin/plugins/:id` returns these plugins with the same details as the plugin list instead of a 404.

### Change 213

Applies to: `emdash@1.1.0` (patch)  
Source: [#3625](https://github.com/emdash-cms/emdash/pull/3625)

Fixes partial `seo` and `social` settings updates through the MCP `settings_update` tool, `POST /_emdash/api/settings`, `setSiteSettings()`, and seeds applied with `onConflict: "update"` replacing the whole stored object. Sending one field, for example `{ seo: { googleVerification: "…" } }`, used to remove the custom `robots.txt`, title separator, other verification code, and default social image that were not in the request. Fields you leave out now keep their stored values. To clear a text field inside `seo` or `social`, send it as an empty string, for example `{ social: { twitter: "" } }`.

### Change 214

Applies to: `emdash@1.1.0` (patch)  
Source: [#3617](https://github.com/emdash-cms/emdash/pull/3617)

Fixes publishing staged content after one of its fields is deleted. Existing drafts now publish against the current collection schema while their historical revision data remains available.

### Change 215

Applies to: `emdash@1.1.0` (patch)  
Source: [#3528](https://github.com/emdash-cms/emdash/pull/3528)

Fixes returning visitors seeing a stale page after a content publish until the next deploy. A cached page whose `Astro.cache.set()` hints carry no last-modified time no longer sends the build time as `Last-Modified`, so browsers download the page again instead of receiving a 304. The fix applies to pages that pass no hint and to pages that pass only tag hints, such as those from `getSiteSettingsWithCacheHint()` and `getMenuWithCacheHint()` or from a query that returned no entries. Pages whose hints carry a last-modified time, such as those from `getEmDashEntry()`, still revalidate against both the content and the build.

### Change 216

Applies to: `emdash@1.1.0` (patch)  
Source: [#3402](https://github.com/emdash-cms/emdash/pull/3402)

Fixes taxonomy-filtered `getEmDashCollection()` listings sorted by `published_at` or `created_at` (the default) on D1 and SQLite reading up to the whole collection when the term has fewer than 200 entries or the listing filters by several terms. These listings now read only the term's entries. A single term with 200 or more entries is still read in date order and stops once the page is full.

### Change 217

Applies to: `emdash@1.1.0` (patch)  
Source: [#3608](https://github.com/emdash-cms/emdash/pull/3608)

Fixes image, feed and JSON responses for signed-in editors, such as admin media library thumbnails, waiting on the visual editing toolbar. Only HTML pages show the toolbar, so EmDash no longer renders it for other responses.

### Change 218

Applies to: `emdash@1.1.0` (patch)  
Source: [#3650](https://github.com/emdash-cms/emdash/pull/3650)

Fixes pages that answer a missing entry with `Astro.rewrite("/404")`: the visual editing toolbar (and the client toolbar script) now appears once instead of twice, and the 404 response is kept out of the route cache, so the URL starts working as soon as the entry is published.

### Change 219

Applies to: `emdash@1.1.0` (patch)  
Source: [#3622](https://github.com/emdash-cms/emdash/pull/3622)

Fixes comment Turnstile verification ignoring `EMDASH_TURNSTILE_SECRET_KEY` and `TURNSTILE_SECRET_KEY` when they are set at runtime, for example with `wrangler secret put` or container environment variables. Comment submissions were accepted without a Turnstile check unless the key was also present when the site was built, and a key present at build time was written into the server bundle.
  
  On Node, the key must now be in the server's process environment at runtime. If you only set it in a `.env` file, load it when starting the server (for example `node --env-file=.env ./dist/server/entry.mjs`) or set it in your host's environment; otherwise comments are accepted without a Turnstile check. If your server build output was shared or stored, rotate a key that was present at build time.

### Change 220

Applies to: `emdash@1.0.1` (patch)  
Source: [#3531](https://github.com/emdash-cms/emdash/pull/3531)

Fixes recreating a deleted collection failing with `Collection "…" already exists` (`COLLECTION_EXISTS`) on sites with media usage tracking turned on, which new sites turn on automatically. Creating a collection through the admin, the API, MCP or a seed now finishes the deleted collection's media usage cleanup first, so sites already stuck in this state can recreate the collection after upgrading.
  
  Each create attempt does a bounded amount of that cleanup. If it can't finish, for example because the deleted collection referenced media from many entries, the error says the collection is being deleted, and the next attempt continues where the last one stopped. If the cleanup has failed, the error says so and includes the deleted collection's ID in `details.deletedCollectionId`. Both errors keep the `COLLECTION_EXISTS` code. Send that ID as `{ "collectionId": "…" }` to `POST /_emdash/api/admin/media-usage/collection-deletions/retry`, which requires the `schema:manage` permission and, for API tokens, the `admin` scope, then create the collection again.

### Change 221

Applies to: `emdash@1.0.1` (patch)  
Source: [#3537](https://github.com/emdash-cms/emdash/pull/3537)

Fixes the WordPress media URL rewrite matching a URL map key that carries a query string by its base URL. A key such as an attachment's `?attachment_id=7` shortlink also matched the home page, so the rewrite pointed links to the home page at that file. Such a key now matches that URL only, and inside a text field only where the URL ends with it.

### Change 222

Applies to: `emdash@1.0.1` (patch)  
Source: [#3519](https://github.com/emdash-cms/emdash/pull/3519)

Removes the deprecated `Comments` and `CommentForm` exports from `emdash/ui`. Sites that still import either component from `emdash/ui` fail to build after upgrading.
  
  Import them from `emdash/ui/comments` instead:
  
  ```diff
  - import { Comments, CommentForm } from "emdash/ui";
  + import { Comments, CommentForm } from "emdash/ui/comments";
  ```
  
  The components themselves are unchanged. Importing them from `emdash/ui/comments` also keeps comment styles off pages that don't render comments.

### Change 223

Applies to: `emdash@1.0.1` (patch)  
Source: [#3519](https://github.com/emdash-cms/emdash/pull/3519)

Removes the deprecated `emdash dev` and `emdash auth secret` CLI commands. Scripts that still call either command now exit with `Unknown command`.
  
  - Replace `emdash dev` with the site's own dev script, such as `pnpm dev`, or run `astro dev` directly. The site then uses its configured database adapter instead of a local `./data.db`, which `emdash dev` created and migrated even on D1 sites. The `url` key under `emdash` in `package.json` was only read by `emdash dev --types` and can be deleted. To generate types from a remote instance, run `emdash types --url <site-url>`, or set `EMDASH_URL`.
  - Remove `emdash auth secret` from scripts. New installations don't need `EMDASH_AUTH_SECRET`. Existing installations should keep the value they already have, since EmDash still reads it to keep commenter-IP hashes stable. To encrypt plugin secrets at rest, generate `EMDASH_ENCRYPTION_KEY` with `emdash secrets generate`.

### Change 224

Applies to: `emdash@1.0.1` (patch)  
Source: [#3519](https://github.com/emdash-cms/emdash/pull/3519)

Removes the deprecated `experimental.registry` integration option. Sites that still set it now fail at startup with an error pointing to the top-level `registry` option, including sites that already set `registry` alongside it. The value is not silently ignored, because that would drop the configured aggregator and release-age policy.
  
  Move the value unchanged. The top-level option accepts the same URL string or configuration object:
  
  ```diff
   emdash({
  -	experimental: {
  -		registry: {
  -			aggregatorUrl: "https://registry.example.com",
  -			policy: { minimumReleaseAge: "48h" },
  -		},
  -	},
  +	registry: {
  +		aggregatorUrl: "https://registry.example.com",
  +		policy: { minimumReleaseAge: "48h" },
  +	},
   });
  ```
  
  The `experimental` option is also removed from the `EmDashConfig` type, because it has no remaining settings. An empty `experimental: {}` block is still ignored at runtime, but TypeScript configs should delete it. Registry configuration errors in the admin now always name the top-level `registry.*` setting.

### Change 225

Applies to: `emdash@1.0.1` (patch)  
Source: [#3322](https://github.com/emdash-cms/emdash/pull/3322)

Fixes `routeCtx.ui` being undefined for the declared Block Kit pages and dashboard widgets of plugins registered in `plugins: []`. They now receive the administrator's locale, text direction, and surface, as sandboxed plugins do, so a plugin can localize its Block Kit text in both install modes.

### Change 226

Applies to: `emdash@0.42.0` (minor)  
Source: [#3335](https://github.com/emdash-cms/emdash/pull/3335)

Adds multi-release fixtures to `emdash/testing/registry`, allowing browser and integration tests to exercise registry updates between authoritative package versions. Existing single-release fixtures continue to work unchanged.

### Change 227

Applies to: `emdash@0.42.0` (minor)  
Source: [#3440](https://github.com/emdash-cms/emdash/pull/3440)

Adds two settings to the Navigation section of the content type editor:

  - **Icon**: the Phosphor icon name shown for the collection in the admin sidebar and in command palette navigation, such as `calendar-blank`. A sidebar folder shows the icon of the first collection in it that declares one. A name that does not resolve falls back to the collection's default icon.
  - **Hide from navigation**: removes the collection's sidebar entry, its command palette link, and its dashboard quick action. The collection stays reachable by URL, the API, and plugins. Collections that were already hidden now also drop out of the command palette.

  #### API and seed files

  The manifest now publishes each collection's `icon`. Collection icon names are now trimmed and limited to 64 characters in the schema API and the MCP collection tools, and limited to 64 characters in seed files, so longer values are rejected. Sending an empty `icon` clears the stored icon.

### Change 228

Applies to: `emdash@0.42.0` (minor)  
Source: [#3440](https://github.com/emdash-cms/emdash/pull/3440)

Adds an `admin.quickCreate` collection setting that removes the collection's "new entry" quick action from the admin dashboard. Set it to `false` in a seed file or through the schema API, or turn off "Quick action on the dashboard" in the content type editor's Navigation section. Collections without the setting keep their quick action. A schema API update replaces the whole `admin` object, so include any existing `admin.listColumns` in the same request.

### Change 229

Applies to: `emdash@0.42.0` (minor)  
Source: [#1939](https://github.com/emdash-cms/emdash/pull/1939)

Adds a core update notice to the admin dashboard. When a newer EmDash version is available, admins see a dismissible banner with a link to the release notes. The banner names the newest release that has been public on npm for at least 24 hours.

  The check is on by default: the server sends a GET request to `https://registry.npmjs.org/emdash` at most once a day, in the background, with no site data. To wait longer before a release is announced, for example to match pnpm's `minimumReleaseAge`, or to turn the check off:

  ```js
  emdash({ updateCheck: { minimumReleaseAge: "7d" } }); // a duration string or seconds
  emdash({ updateCheck: false });
  ```

  The banner reads `GET /_emdash/api/admin/core-update`, which requires the new `updates:read` permission (admins only).

### Change 230

Applies to: `emdash@0.42.0` (minor)  
Source: [#3059](https://github.com/emdash-cms/emdash/pull/3059)

Updates the MCP content tools and revision restore to honor an entry's edit lock, so an AI tool connected over MCP no longer overwrites an entry that someone else has open in the admin.

  `content_update`, `content_delete`, `content_publish`, `content_unpublish`, `content_schedule`, `content_unschedule`, `content_discard_draft` and `revision_restore` fail with `ENTRY_LOCKED` while another user holds the entry's lock, where the call used to succeed. The error message names the holder, and `_meta.details` carries their `userId`, `userName`, `acquiredAt` and `expiresAt`. Reading the item again does not clear the refusal. Each of these tools takes an optional `overrideLock: true` to write anyway.

  `POST /_emdash/api/revisions/{revisionId}/restore` now returns `409 ENTRY_LOCKED` in the same case. Pass `"overrideLock": true` in the request body to restore anyway.

  To keep the previous behavior for a whole collection, switch edit locking off for it under **Content Types** → your collection → **Edit locking**.

### Change 231

Applies to: `emdash@0.42.0` (minor)  
Source: [#3394](https://github.com/emdash-cms/emdash/pull/3394)

Adds the `byline:afterSave` and `byline:afterDelete` plugin hooks, so plugins can keep external copies of author data, such as a search index, current when byline profiles change.

  Both hooks require the `bylines:read` capability and receive the same public byline profile that `ctx.bylines.get()` returns. `byline:afterSave` runs after a byline or one of its translations is created or updated, with `isNew` set on creation. `byline:afterDelete` receives the byline as it was before deletion. They run after changes made through the admin API or MCP tools, not seeds or imports, and hook errors are logged without undoing the change.

  Credit changes on an entry are still reported through `content:afterSave`. Relinking a byline to another user can change the credits inferred for that user's entries without a per-entry event.

### Change 232

Applies to: `emdash@0.42.0` (minor)  
Source: [#3394](https://github.com/emdash-cms/emdash/pull/3394)

Adds the `bylines:read` plugin capability, which lets plugins read public byline profiles and the bylines credited on content entries through `ctx.bylines`.

  `ctx.bylines` provides `get()` and cursor-paginated `list()` for profiles, plus `getEntriesBylines()` for credits. `getEntriesBylines()` resolves up to 100 entries of one collection in a single call, so a search indexer or feed plugin can attach author names to a page of `ctx.content.list()` results:

  ```ts
  const page = await ctx.content.list("posts", { limit: 100 });
  const credits = await ctx.bylines.getEntriesBylines(
  	"posts",
  	page.items.map((entry) => entry.id),
  );
  ```

  Credits match what the site renders: the credits assigned in the editor, or the author's linked byline, marked `source: "inferred"`, when an entry has none. They resolve at the entry's own locale. Profiles omit the linked user account, guest flag, and byline custom field values.

  The capability is independent of `content:read` and `users:read`. It is available to native plugins and to sandboxed plugins on Cloudflare Worker Loader and Node.js workerd. Installation and update consent list it as a new permission.

### Change 233

Applies to: `emdash@0.42.0` (minor)  
Source: [#3501](https://github.com/emdash-cms/emdash/pull/3501)

Removes the legacy `emdash plugin` command group, including its marketplace login, logout, scaffold, validation, bundle, and publish commands.

  Use the dedicated `@emdash-cms/plugin-cli` package for sandboxed plugin authoring and registry publishing:

  ```sh
  pnpm add -D @emdash-cms/plugin-cli
  pnpm exec emdash-plugin --help
  ```

  Native plugins are npm packages and continue to use their package build scripts.

### Change 234

Applies to: `emdash@0.42.0` (minor)  
Source: [#3495](https://github.com/emdash-cms/emdash/pull/3495)

Adds `admin.footerLabel` for customizing or hiding the label beside the version in the admin sidebar. The label defaults to `"EmDash"` instead of reusing the configured site name. Set it to a string to use another label, or set it to `false` to show the version alone.

### Change 235

Applies to: `emdash@0.42.0` (patch)  
Source: [#3493](https://github.com/emdash-cms/emdash/pull/3493)

Fixes bulk term assignment only working with the built-in `tag` taxonomy. Editors can now add a term from any taxonomy, such as a category or a custom taxonomy, to up to 50 posts from a collection's bulk-actions bar or from that taxonomy's page. When several taxonomies apply to a collection, the dialog asks which one to use. The `POST /_emdash/api/taxonomies/bulk-tag` endpoint now accepts a term from any taxonomy, and matches only entries in the collections that use that taxonomy.

### Change 236

Applies to: `emdash@0.42.0` (patch)  
Source: [`43565ef`](https://github.com/emdash-cms/emdash/commit/43565efe85b19b6bb5ed2e3dead627a34341698d)

List endpoints now treat a zero or negative `limit` as 1, matching the documented range of 1 to 100. Previously some lists, including public comment lists, could return more items than the maximum page size.

### Change 237

Applies to: `emdash@0.42.0` (patch)  
Source: [#3517](https://github.com/emdash-cms/emdash/pull/3517)

Fixes `emdash-env.d.ts` not updating when the schema changes during `astro dev` with the Cloudflare adapter. Adding or editing collections and fields now regenerates types on Cloudflare too, not only on Node.

### Change 238

Applies to: `emdash@0.42.0` (patch)  
Source: [#2390](https://github.com/emdash-cms/emdash/pull/2390)

Fixes the admin UI remaining on "Loading EmDash..." when running EmDash from source in development on Windows. No configuration change is required.

### Change 239

Applies to: `emdash@0.42.0` (patch)  
Source: [#2898](https://github.com/emdash-cms/emdash/pull/2898)

Fixes rich text image settings so caption, alt text, tooltip, size, and alignment edits persist when authors click back into the post. Captions and tooltip titles also round-trip independently, so clearing a caption no longer restores it from the tooltip text.

### Change 240

Applies to: `emdash@0.42.0` (patch)  
Source: [#3487](https://github.com/emdash-cms/emdash/pull/3487)

Fixes draft publication of a reference field from undoing link changes published from the opposite end of the relation in the meantime.

  Draft reference changes now merge with concurrent changes from either end of the relation. Additions and removals made in the draft take effect, while links changed only from the opposite end remain unchanged. Restoring a revision continues to replace the live selection exactly.

### Change 241

Applies to: `emdash@0.42.0` (patch)  
Source: [#3439](https://github.com/emdash-cms/emdash/pull/3439)

Fixes WordPress WXR imports failing partway through large exports. The admin now imports taxonomy terms, content, and reusable blocks in bounded requests while preserving translation links and the complete import summary.

  Direct API clients can continue using a single request for small exports. Larger exports return `WXR_IMPORT_TOO_LARGE` and must use the chunked `taxonomy`, `content`, and `finalize` phases.

### Change 242

Applies to: `emdash@0.42.0` (patch)  
Source: [#3439](https://github.com/emdash-cms/emdash/pull/3439)

Fixes `POST /_emdash/api/import/wordpress/prepare` so it also accepts the post-type shape returned by `/import/wordpress/analyze` (`suggestedCollection` and `requiredFields`), in addition to the existing `collection`/`fields` shape.

### Change 243

Applies to: `emdash@0.42.0` (patch)  
Source: [#3488](https://github.com/emdash-cms/emdash/pull/3488)

Fixes Astro route-cache fills rebuilding purged pages from stale object-cache data on Cloudflare KV. Anonymous cache fills now read from the database, while edge-cache hits continue to avoid the Worker. Content cache reads also stop fetching the retired legacy epoch, reducing KV reads while current publishers keep invalidating older rolling-deploy readers.

### Change 244

Applies to: `emdash@0.42.0` (patch)  
Source: [#3468](https://github.com/emdash-cms/emdash/pull/3468)

Fixes missing MCP tools for plugins built with `emdash-plugin build` and registered in `plugins: []`. Administrators can now review and enable those tools with the plugin's **Agent access** switch, and enabled tools appear in `tools/list`, as they already did for sandboxed and registry installs.

### Change 245

Applies to: `emdash@0.42.0` (patch)  
Source: [#3310](https://github.com/emdash-cms/emdash/pull/3310)

Fixes `ctx.kv.list("settings:")` scanning the options table twice. The general prefix scan read every settings row and discarded it before `SettingsAccess.list()` read the same rows again, so a plugin that lists its settings in a `page:metadata` hook cost every page render an extra query.

### Change 246

Applies to: `emdash@0.42.0` (patch)  
Source: [#3421](https://github.com/emdash-cms/emdash/pull/3421)

Fixes the admin marketplace plugin icon and theme thumbnail proxies following redirects off the marketplace origin, which could make the server fetch an internal or loopback URL and return the response to any user with plugin read access (Editor and above). Sites with `marketplace` configured are affected. Redirects that stay on the marketplace origin still work; others now return `502` with `PROXY_REDIRECT_UNTRUSTED`, and chains longer than five hops return `502` with `PROXY_TOO_MANY_REDIRECTS`.

### Change 247

Applies to: `emdash@0.42.0` (patch)  
Source: [#3473](https://github.com/emdash-cms/emdash/pull/3473)

Adds an optional `caption` to the MCP `media_upload` tool, stored on the media record next to `alt`. The tool previously had no caption, and its schema dropped an unknown `caption` argument without an error, so a caption sent with an upload (often the picture's credit) was lost and the record stored none.

### Change 248

Applies to: `emdash@0.42.0` (patch)  
Source: [#3463](https://github.com/emdash-cms/emdash/pull/3463)

Fixes `emdash migrate --from-config` failing with "Stripping types is currently unsupported for files under node_modules" when the Astro config imports a plugin that publishes TypeScript source, such as `@emdash-cms/plugin-forms`.

### Change 249

Applies to: `emdash@0.42.0` (patch)  
Source: [#3422](https://github.com/emdash-cms/emdash/pull/3422)

Fixes anonymous OAuth dynamic client registration (`POST /_emdash/api/oauth/register`) letting unauthenticated visitors create unlimited OAuth client records. Registration is now limited to 10 per minute per client IP. Requests over the limit get a `429` with `Retry-After: 60` and a `temporarily_unavailable` error body. Like the other auth rate limits, it applies only when EmDash can determine the client IP: on Cloudflare, or when `trustedProxyHeaders` (or `EMDASH_TRUSTED_PROXY_HEADERS`) is configured.

### Change 250

Applies to: `emdash@0.42.0` (patch)  
Source: [#3409](https://github.com/emdash-cms/emdash/pull/3409)

Fixes taxonomy-filtered listings sorted by `updated_at` or a custom field reading the whole collection on D1. `published_at` and `created_at` sorts still use the indexed path that stops at `LIMIT`; `updated_at` and field sorts now seek from the term's assignments again.

### Change 251

Applies to: `emdash@0.42.0` (patch)  
Source: [#3502](https://github.com/emdash-cms/emdash/pull/3502)

Fixes type errors when registering native plugins whose options are declared as an interface, such as `formsPlugin()`, `embedsPlugin()`, and plugins scaffolded by `emdash plugin init --native`. A type-checked `astro.config.mjs` (for example, one checked by `astro check`) no longer reports TS2322 for these `plugins` entries. Plugin options must still be an object.

### Change 252

Applies to: `emdash@0.42.0` (patch)  
Source: [#3484](https://github.com/emdash-cms/emdash/pull/3484)

Fix plugin one-shot schedules that use a space-separated date and time or a UTC offset. New and existing one-shot due times are stored as canonical UTC timestamps, so the scheduler wakes and runs them at the intended instant. Invalid saved task data or a recurring schedule with no future run is now disabled after it is claimed instead of blocking the rest of the batch and being retried indefinitely.

### Change 253

Applies to: `emdash@0.42.0` (patch)  
Source: [#3325](https://github.com/emdash-cms/emdash/pull/3325)

Fixes an open redirect in the admin login page and the logout, magic-link sign-in, and dev-bypass routes: a `?redirect=` value containing a tab, carriage return, or line feed (for example `/%09/evil.example`) could send the browser to another site. Redirect values that contain control characters are now ignored.

### Change 254

Applies to: `emdash@0.42.0` (patch)  
Source: [#3418](https://github.com/emdash-cms/emdash/pull/3418)

Fixes registry plugin updates ignoring `policy.minimumReleaseAge`. Updating an installed plugin to a release younger than the configured age, or to a release without a valid index timestamp, is now refused, just as installing it is. Publishers and packages listed in `minimumReleaseAgeExclude` remain exempt.

  The admin update endpoint (`POST /_emdash/api/admin/plugins/registry/:id/update`) now refuses a `version` older than the installed one with `DOWNGRADE_NOT_ALLOWED`; the admin dashboard never sends one, so dashboard updates are unaffected. Updates without `version` still follow the aggregator's latest release, which can be older than the installed one after a publisher withdraws the newest release. To roll back to an older release, uninstall the plugin and install that version.

### Change 255

Applies to: `emdash@0.42.0` (patch)  
Source: [#3485](https://github.com/emdash-cms/emdash/pull/3485)

Fixes fresh Cloudflare D1 sites remaining partially initialized when the first-request seed is interrupted while creating a collection. The next request now resumes the seed. Existing configured sites and sites initialized with `emdash seed` are left unchanged, so upgrades and cold starts do not recreate deleted sample content. Attempts to create a collection over an orphaned content table now return a specific conflict instead of a generic server error.

### Change 256

Applies to: `emdash@0.42.0` (patch)  
Source: [#3436](https://github.com/emdash-cms/emdash/pull/3436)

Fixes sites on Cloudflare D1 or SQLite that stay stuck on the `036_i18n_menus_and_taxonomies` migration after a first attempt stopped partway, for example on a slow cold start. Every retry failed with `no such table`, and pages rendered without CMS data. The migration now resumes where it stopped and completes, and content-taxonomy assignments come back intact.

  #### Already-stuck sites

  On a site that was already stuck at the menus, menu items, taxonomies, or taxonomy definitions table, earlier retries emptied that table. The migration completes after updating, but those rows must be restored from a backup, such as D1 Time Travel or a copy of the SQLite database file.

### Change 257

Applies to: `emdash@0.42.0` (patch)  
Source: [#1814](https://github.com/emdash-cms/emdash/pull/1814)

Fixes seed application failing with a database uniqueness error when a seeded slug or slugless entry ID belongs to content in the trash. In `skip` and `update` modes, EmDash leaves the trashed content unchanged and counts the collision as skipped. In `error` mode, it reports a conflict identifying the trashed entry. References and translations do not resolve through skipped trashed entries.

### Change 258

Applies to: `emdash@0.42.0` (patch)  
Source: [#3384](https://github.com/emdash-cms/emdash/pull/3384)

Fixes the setup wizard creating two administrator accounts when two passkey setup verifications finish at the same time. Whichever verification saves its account second now fails with `ADMIN_EXISTS`, and no second account is created.

### Change 259

Applies to: `emdash@0.42.0` (patch)  
Source: [#3326](https://github.com/emdash-cms/emdash/pull/3326)

Hardens redirect rules, including rules stored without going through the admin API:

  - The redirect middleware now only redirects to site-relative paths that start with a single `/`. It skips any rule whose destination has a scheme, starts with `//` or `/\`, or contains control characters, and logs a warning with the rule's ID.
  - Pattern sources treat parentheses and other regex characters as literal text. Previously a source such as `/(.*.*.*x)/[slug]` compiled into a regex that could stall requests, and one with an unbalanced `(` stopped every redirect on the site from working.
  - Fixes pattern rules that put a `[param]` before a `[...splat]`, such as `/[category]/[...rest]`, which swapped the two captured values.
  - Stored pattern rules whose source is malformed (for example, `/[a][b][c]`) are skipped with a warning instead of being compiled.
  - Seed files now get the same redirect checks as the redirects API. Validation fails when a pattern source is malformed, a destination uses a placeholder the source doesn't capture, or a destination would resolve to another site.

### Change 260

Applies to: `emdash@0.42.0` (patch)  
Source: [#3281](https://github.com/emdash-cms/emdash/pull/3281)

Fixes `astro build` failing with `GetStaticPathsRequired` inside an EmDash route when the Astro config sets `output: "static"`. Every route EmDash adds, including the admin, the API, `sitemap.xml`, and `robots.txt`, now renders on demand under either output setting, so a static-output site still needs a server adapter. The site's own pages keep Astro's default: under `output: "static"` they prerender at build time and show content from that build. Builds with `output: "server"` are unchanged.

### Change 261

Applies to: `emdash@0.42.0` (patch)  
Source: [#3455](https://github.com/emdash-cms/emdash/pull/3455)

Fixes `client.terms()` so dictionary consumers can skip usage counts. `client.terms("tag", { includeCounts: false })` leaves `count` off each term, and counts stay enabled by default.

### Change 262

Applies to: `emdash@0.42.0` (patch)  
Source: [#3327](https://github.com/emdash-cms/emdash/pull/3327)

Fixes stored cross-site scripting through `url` content fields. EmDash previously accepted `javascript:` and `data:` values, so a theme rendering `<a href={entry.data.website}>` could run an attacker's script on the site origin. A `url` field, including one inside a repeater or block, now accepts only these values:

  - `http:` and `https:` URLs
  - `mailto:` and `tel:` links
  - site-relative paths such as `/about`, and fragments such as `#contact`

  The REST API, MCP tools, site transfers, WordPress imports, and the admin editor reject any other value with a validation error. Seeds and plugin content updates also reject unsafe schemes and path forms that browsers resolve to another site, including `//example.com` and `/\\example.com`. The admin editor now accepts relative paths, fragments, `mailto:`, and `tel:` and keeps URL input left-to-right in every locale.

  Existing entries are not changed. An unsafe stored value is still returned by queries, and saving or duplicating that entry fails until the field is corrected. `sanitizeHref()` and `isSafeHref()` now reject unsafe protocol-relative, backslash-prefixed, and control-character forms when rendering older content.

### Change 263

Applies to: `emdash@0.42.0` (patch)  
Source: [#3303](https://github.com/emdash-cms/emdash/pull/3303)

Fixes a denial-of-service in public URL routing: a collection URL pattern with several placeholders in one path segment, such as `/{a}{b}{c}{d}{e}x`, let a single crafted request tie up the server for seconds while `resolveEmDashPath()` matched it.

  Collection URL patterns now allow at most one placeholder per path segment. `/{year}/{month}/{slug}.html` and `/p-{id}/{slug}` are still valid, but `/{year}{month}/{slug}` and `/{slug}-{id}` are rejected when a collection is created or its pattern is changed through the admin, the REST API, the MCP `schema_update_collection` tool, or a seed. Seed files with such a pattern fail validation before anything is applied. The admin's collection editor shows the problem next to the URL Pattern field.

  If a collection already has a pattern that breaks this rule, it keeps working for generating links in menus, sitemaps and redirects, but `resolveEmDashPath()` no longer matches it, and the site logs a warning naming the collection. REST, MCP and admin updates that send the stored pattern back unchanged still succeed. Give each placeholder its own segment (for example, change `/{slug}-{id}` to `/{id}/{slug}`) to route those entries again.

### Change 264

Applies to: `emdash@0.42.0` (patch)  
Source: [#3445](https://github.com/emdash-cms/emdash/pull/3445)

Fixes admin sign-in silently returning to the login page when no Astro session driver is configured. Signing in with a passkey, magic link, invite link, or signup link now fails with a `SESSION_UNAVAILABLE` error explaining that a session driver is required, and OAuth sign-in returns to the login page with the same explanation, instead of reporting success without keeping the user signed in. Magic links, invite links, and signup links stay usable for a retry. `astro dev` and `astro build` also warn when the driver is missing or sessions are disabled with `session: false`. The Node, Cloudflare, and Netlify adapters configure a driver automatically; on other adapters, such as Vercel, configure `session.driver` in `astro.config.mjs`.

### Change 265

Applies to: `emdash@0.41.0` (minor)  
Source: [#3294](https://github.com/emdash-cms/emdash/pull/3294)

Fixes `emdash export-seed` output so it survives `emdash seed` on a fresh database, and adds `--media-base-url` so exported media can be imported.

  - Exports sections and redirect rules. Anything a seed cannot represent is left out with a warning on stderr: redirect rules with status 410 or 451, duplicate redirect sources kept from older databases, and imported sections whose slug contains characters other than lowercase letters, digits, and hyphens.
  - Menu items that link to exported content now point at the restored entries instead of losing their link. `emdash seed` also restores links to entries in custom collections and collection archive links.
  - Scheduled entries are exported as drafts instead of being published on import.
  - Exports each collection's comments setting and its title and date fields, and whether each field is translatable. Seed fields accept `translatable`, and sections accept `source: "user"`.
  - Exports file fields and image sub-fields of repeaters as `$media` references, as well as image fields.

  `$media` URLs are site-relative by default, and `emdash seed` cannot download a relative URL, so those fields came back empty. Pass the source site's public URL to write absolute URLs:

  ```sh
  npx emdash export-seed --with-content=all --media-base-url=https://example.com > seed.json
  ```

  Without `--media-base-url`, the export warns when it writes relative media URLs. Images inside Portable Text fields are not converted and still refer to the source site's media.

### Change 266

Applies to: `emdash@0.41.0` (minor)  
Source: [#1928](https://github.com/emdash-cms/emdash/pull/1928)

Adds relations, and makes `reference` fields entry pickers that link through them. A relation joins two collections under a site-unique slug, with a label and an optional link limit for each side; a reference field shows one side of it. An entry's selection is shared by all its translations, and on collections with revisions it goes live when the entry is published. Send selections under `references` on entry create and update, keyed by field slug. To render them, pass the field slugs in the `references` option of `getEmDashEntry`, and use `getEmDashReferences` to page past the first 50. `emdash types` generates a `{Collection}References` interface, seeds accept a top-level `relations` array, and `emdash export-seed --with-content` exports each entry's links. See the [Relations guide](https://docs.emdashcms.com/guides/relations/).

  Upgrading changes existing data and APIs:

  - A reference field that names a target collection becomes a picker and keeps its entries. Fields with no target, fields marked searchable or indexed, and fields whose locales select different entries keep working as before; convert them by hand under Content Types.
  - Relations are no longer translated. A relation with different labels per locale keeps one set of labels. The relations API uses `slug` instead of `name`, requires `parentCollection` and `childCollection` on create, and no longer accepts `locale` or `translationOf`. `GET /_emdash/api/relations/:id/translations` is removed, and `GET /_emdash/api/relations` takes `collection` instead of `locale`.
  - `POST /_emdash/api/content/:collection/:id/references/:relation/children` is removed. Write selections through `references` on the content create and update routes instead.
  - `relations` is now a reserved collection slug. An existing collection with that slug keeps its content and API, but the admin no longer opens it.

  See [Reference fields bind to relations](https://docs.emdashcms.com/deployment/updating/#changed-reference-fields-bind-to-relations) for how existing fields are converted.

### Change 267

Applies to: `emdash@0.41.0` (patch)  
Source: [#3479](https://github.com/emdash-cms/emdash/pull/3479)

Updates the empty Plugins screen to open the registry when sandboxed plugin installation is available, or link to the plugin installation guide when it is not.

### Change 268

Applies to: `emdash@0.41.0` (patch)  
Source: [#3295](https://github.com/emdash-cms/emdash/pull/3295)

Shows the permissions a CLI or agent is requesting on the admin device authorization page (`/_emdash/admin/device`) before you approve its code. The page lists the permissions that approval will grant, and separately lists any requested permissions your role does not allow. The Authorize button stays disabled until the code is confirmed valid and at least one requested permission can be granted.

  A new authenticated `GET /_emdash/api/oauth/device/authorize?user_code=XXXX-XXXX` endpoint returns a pending code's `requestedScopes` and the `grantedScopes` an approval by the current user would receive. Unknown, already-used and expired codes return `INVALID_CODE` or `EXPIRED_CODE`.

### Change 269

Applies to: `emdash@0.41.0` (patch)  
Source: [#3478](https://github.com/emdash-cms/emdash/pull/3478)

Fixes registry plugin installs, updates, and media previews failing on Cloudflare Workers with errors such as `The publisher DID document could not be fetched.` Registry HTTPS requests now use the Workers Fetch API instead of unsupported raw TCP sockets.

### Change 270

Applies to: `emdash@0.41.0` (patch)  
Source: [#3456](https://github.com/emdash-cms/emdash/pull/3456)

Fixes cached pages continuing to show stale widget areas after an editor changes their widgets. `<WidgetArea>` now registers its cache dependency automatically, so templates do not need a separate widget-area query to receive invalidation.

### Change 271

Applies to: `emdash@0.41.0` (patch)  
Source: [#3451](https://github.com/emdash-cms/emdash/pull/3451)

Fixes `getEmDashEntry` stopping at the first locale that lacks an entry instead of continuing through the locale fallback chain. When the requested locale has no entry, it now returns the entry from the next locale in the chain, with `fallbackLocale` set, including in preview and visual-editing mode. An entry that exists in no locale now returns `entry: null` without an `error`, so pages that check `error` before `entry` show their not-found page instead of a 500 error.

### Change 272

Applies to: `emdash@0.40.1` (patch)  
Source: [`8bee2f4`](https://github.com/emdash-cms/emdash/commit/8bee2f4a2618394b6660540ea1d7d2599eccd087)

Updates the MCP `media_create` tool to complete pending signed uploads. Pass the `storageKey` returned by `POST /_emdash/api/media/upload-url` after uploading the file. Confirmation uses the same user and the file size supplied when the upload URL was issued.

  Media deletion and abandoned-upload cleanup preserve stored objects while another media record references the same key.

### Change 273

Applies to: `emdash@0.40.1` (patch)  
Source: [#3449](https://github.com/emdash-cms/emdash/pull/3449)

Fixes the inline Portable Text editor failing to load in visual editing under `astro dev` on sites installed with pnpm, along with the `Failed to resolve dependency` warnings for `lowlight`, `highlight.js`, and `highlight.js/lib/core` that `astro dev` and `astro build` printed on those sites.

### Change 274

Applies to: `emdash@0.40.1` (patch)  
Source: [`f9cac8d`](https://github.com/emdash-cms/emdash/commit/f9cac8d494952243a1c67c9a47cbc9f5b523a512)

Reduces D1 work when recording new 404 paths by moving log-cap maintenance to scheduled cleanup. The log remains bounded to 10,000 paths.

### Change 275

Applies to: `emdash@0.40.1` (patch)  
Source: [`190717a`](https://github.com/emdash-cms/emdash/commit/190717a12732c505636e231c3b2c43020d3a3a03)

Updates the `media_upload` MCP tool to accept base64-encoded content only. Pass the file bytes and `contentType`; callers that previously passed `url` must download the file before calling the tool.

### Change 276

Applies to: `emdash@0.40.1` (patch)  
Source: [`cc42ac9`](https://github.com/emdash-cms/emdash/commit/cc42ac94417a44a75aa5618e7b5c2ac2e2066c25)

Updates link rendering in nested Portable Text inside column and cover blocks. Nested and top-level Portable Text links now follow the same URL handling.

### Change 277

Applies to: `emdash@0.40.1` (patch)  
Source: [#3448](https://github.com/emdash-cms/emdash/pull/3448)

Fixes the setup wizard failing with "Failed to apply seed" on Cloudflare Workers when its sample content needs more database queries than one request allows. The wizard now adds sample content over as many requests as it needs and shows the progress. When a request fails, the content added so far is kept, and **Continue** adds the rest.

### Change 278

Applies to: `emdash@0.40.1` (patch)  
Source: [`a59690e`](https://github.com/emdash-cms/emdash/commit/a59690eea91699408994fe574c87f0e555aecc76)

Updates preview-signature snapshots to match the published site view. These snapshots include published content and its related SEO, taxonomy and media records. Signed-in editors can still request the complete draft snapshot with `?drafts=true`, and backups are unchanged.

### Change 279

Applies to: `emdash@0.40.1` (patch)  
Source: [`88253e0`](https://github.com/emdash-cms/emdash/commit/88253e0d6f68131a58316e71eb7550d413464c8a)

Updates production setup to use an explicitly configured public origin. Set `siteUrl`, `EMDASH_SITE_URL`, or `SITE_URL` before setup outside local development. Loopback development continues to use the request origin.

### Change 280

Applies to: `emdash@0.40.0` (minor)  
Source: [#3364](https://github.com/emdash-cms/emdash/pull/3364)

Adds bulk tagging for editors. Select posts from a collection's bulk-actions bar or paste up to 50 public links from the Tags page, review their exact titles and languages, and apply one existing or new tag. Assignments take effect immediately without publishing other draft edits, preserve existing tags, and report unmatched links or failed writes for retry.

### Change 281

Applies to: `emdash@0.40.0` (minor)  
Source: [#3320](https://github.com/emdash-cms/emdash/pull/3320)

Adds first-class `blocks` fields for ordered, typed page compositions. Define retained block-type versions through the schema API, MCP, or seed files; edit block cards in the admin; and render stored compositions with `<Blocks value components fallback>` from `emdash/ui`.

  Generated collection types include each retained block version, and `defineBlockComponents<T>()` type-checks that a component map covers every generated `_type`. Image, file, repeater-image, and Portable Text media inside blocks participate in normalization, MIME validation, usage tracking, and cleanup protection.

  Deploy renderer support before activating a breaking block-type version. Existing versions remain available for drafts, revisions, and stored content, and migrating a stored block to a new version requires explicit `migrateBlocks: true` intent.

  Sites upgrading from a release older than 0.39 must deploy 0.39 first and upgrade every runtime before creating a blocks field. The 0.39 unknown-field protection prevents an older runtime in a rolling deployment or rollback from overwriting block JSON.

### Change 282

Applies to: `emdash@0.40.0` (minor)  
Source: [#3167](https://github.com/emdash-cms/emdash/pull/3167)

Adds optional `link` on portable-text image blocks: editor link buttons work on image selection, and `Image.astro` wraps images in a sanitized `<a>` when `link.href` is set. Legacy `link: "https://…"` strings written by WordPress/Gutenberg imports are normalised on read, so already-imported linked images keep their link and are upgraded to the object shape on their next edit.

### Change 283

Applies to: `emdash@0.40.0` (minor)  
Source: [#1944](https://github.com/emdash-cms/emdash/pull/1944)

Localizes invite, magic-link, and account-recovery emails: they now follow the site locale (falling back to the requesting user's admin language) instead of always being sent in English. Email HTML sets `lang` and `dir` on the root element, so right-to-left languages render correctly. A non-canonical site locale (`pt-br`) is normalized to its catalog (`pt-BR`); an unsupported value falls back to the requesting user's admin language.

  `@emdash-cms/auth`'s invite and magic-link builders (`buildInviteEmail`, `buildMagicLinkEmail`, now exported) accept optional injected copy and locale via new `emailStrings`/`emailLocale` config options (`InviteEmailStrings`/`MagicLinkEmailStrings`). `@emdash-cms/admin/locales` exports the copy resolvers `getInviteEmailStrings`/`getMagicLinkEmailStrings` and the BCP 47 matcher `matchLocale`.

### Change 284

Applies to: `emdash@0.40.0` (minor)  
Source: [#3333](https://github.com/emdash-cms/emdash/pull/3333)

Adds optional `cc` and `replyTo` fields to plugin email messages, including from sandboxed plugins:

  ```ts
  await ctx.email.send({ to, cc: ["team@example.com"], replyTo: visitorEmail, subject, text });
  ```

  `ctx.email.send()` throws when `cc` is not an array of strings or `replyTo` is not a string. `email:beforeSend`, `email:deliver`, and `email:afterSend` hooks receive both fields on `event.message`, and the development console provider prints them. The Cloudflare email provider delivers both, and a message's `replyTo` overrides the provider's configured `replyTo`. Custom `email:deliver` providers should pass `cc` and `replyTo` to their email service.

### Change 285

Applies to: `emdash@0.40.0` (minor)  
Source: [#3360](https://github.com/emdash-cms/emdash/pull/3360)

Updates taxonomy definitions so `hierarchical` and `collections` belong to the taxonomy instead of to each locale. Every locale reads the same values, and translations can no longer disagree about whether a taxonomy is hierarchical or which collections it applies to. `label` and `labelSingular` stay per locale.

  This changes behavior for multilingual sites:

  - `PUT /_emdash/api/taxonomies/{name}` and the MCP `taxonomy_update` tool change `hierarchical` and `collections` for every locale, even when `locale` is passed. Previously they changed only the addressed locale's definition.
  - Creating a definition for a name that already exists in another locale joins that taxonomy, with or without `translationOf`, instead of starting a separate translation group. It takes the taxonomy's `hierarchical` and `collections`; a create that sends different values returns `VALIDATION_ERROR`, where it previously stored them for the new locale only. Change them with an update instead.
  - `getTaxonomyTerms()`, `getTaxonomyDef()` and `getTaxonomyDefs()` return a taxonomy in every locale, including a locale without its own definition, which takes its label from the first locale on its fallback chain that has one, else the default locale, else the lowest locale code. Previously such a locale got no definition and an empty term list, so the built-in Categories and Tags widgets rendered empty on sites whose default locale had no definition.
  - Seed files may omit `hierarchical` and `collections` on a taxonomy entry whose `translationOf` points at an entry with the same `name`. Applying a seed follows `translationOf` through entries with the same `name` and takes them from the last one, whatever the translations carry and wherever the entries appear in the file. Validation warns when a translation declares values other than the ones it takes, or when two entries that declare them for one taxonomy disagree. The exported `SeedTaxonomy` type marks both fields optional, so code that reads them from a seed must handle `undefined`. `emdash export-seed` writes them only on the entry the translations point at.
  - Importing a WordPress export (WXR) into a locale assigns the terms of a taxonomy that is defined only in another locale. Previously the import skipped them and reported the taxonomy as missing.

  The upgrade migration merges existing definitions of each taxonomy name into one. Where locales disagreed, the taxonomy becomes hierarchical if any locale's definition was, and applies to every collection any locale's definition listed, so no term tree flattens and no collection loses a taxonomy it showed in some locale. Definitions of one name that were in separate translation groups are joined into one group. Definitions of different names that shared a translation group, which older seed files and API versions could create, get one group per name.

  #### What should I do?

  If your site defines different `hierarchical` or `collections` values per locale on purpose, check them after upgrading and set the values you want once.

  If your code changes `hierarchical` or `collections` by writing to `_emdash_taxonomy_defs` with SQL, use the taxonomy API, the MCP `taxonomy_update` tool or a seed file instead. A direct write no longer changes what EmDash reads, only what sandboxed plugins see. EmDash still updates those columns whenever a taxonomy changes, for code that reads them.

  `@emdash-cms/plugin-test`: `runtimeHost.fixtures.taxonomyDefinition()` sets `hierarchical` and `collections` for every locale of the taxonomy.

### Change 286

Applies to: `emdash@0.40.0` (minor)  
Source: [#3346](https://github.com/emdash-cms/emdash/pull/3346)

Adds site transfer: export a whole EmDash site as a `.emdash` package and import it into an empty EmDash site, on Cloudflare (D1 and R2) or Node (SQLite or PostgreSQL). A package carries content, revisions, schema and block types, taxonomies, bylines, menus, widgets, redirects, SEO, settings, media files, and comments unless you leave them out. Imports are checked before anything is written, run in bounded steps, and end with a receipt issued only after the imported site is verified against the package.

  #### From the command line

  ```sh
  emdash site export --output site.emdash --url https://old.example.com
  emdash site import site.emdash --analyze --url https://new.example.com
  emdash site import site.emdash --plan sha256:… --confirm --url https://new.example.com
  ```

  - `site export` runs the export on the server, downloads and checks it file by file, and writes the package atomically. `--no-comments` leaves out comments and reactions. Run it again with the same `--output` to resume an interrupted export.
  - `site import <file> --analyze` checks the package locally, uploads only what the target is missing, and prints the plan: record counts, package users and suggested matches, the changes the import makes, warnings, blockers, and the plan digest. Map package users with `--map-principal <id or email>=<user id, email, or none>` (repeatable), and keep this site's title or tagline with `--use-target-title` and `--use-target-tagline`. The command exits with `2` when the plan has blockers.
  - `site import <file> --plan <digest> --confirm` runs the reviewed plan and prints the receipt. It refuses to run if the plan changed after review.
  - `site import status|resume|receipt <operation-id>` inspects, continues, or prints the receipt of an import. Resuming an import that is still uploading needs the package file as a third argument.

  Every command accepts `--json`; errors print as `{ "error": { "code", "message" } }`. The client adds matching `transfer*` methods and `users()`.

  #### REST API

  The API lives under `/_emdash/api/admin/transfer`. Exports: `POST exports` (with an optional `Idempotency-Key`), `POST exports/:id/advance` until `nextRequestInMs` is `null`, then `GET exports/:id/archive` for one archive or `GET exports/:id/manifest` and `GET exports/:id/files/<path>` file by file. Imports: `POST imports` with the package's `manifest.json`, `PUT imports/:id/files/<path>` for each file listed by `GET imports/:id/missing`, `POST imports/:id/analyze` until the plan is ready (optionally with `decisions`), `POST imports/:id/execute` with the reviewed `{ packageDigest, planDigest }`, `POST imports/:id/advance` until it finishes, and `GET imports/:id/receipt`. `GET capabilities` reports supported formats and limits and whether this site can receive an import.

  A plan lists every change the import makes as `transformations`, including those the exporter already made (for example, records left out because their parent no longer existed, or content that refers to media files the origin site did not have). `warnings` hold findings that need attention, and any `blockers` prevent execution.

  #### MCP

  The MCP server adds `site_transfer_capabilities`, `site_export_start`, `site_export_status`, `site_import_analyze`, `site_import_start`, `site_import_resume`, `site_import_status`, and `site_import_receipt`. Package files are uploaded over HTTP. Tool results are bounded summaries and never include record values, principal emails, media bytes, or download URLs.

  #### Access

  Site transfer needs the `transfer:export` or `transfer:import` permission (admins). API and OAuth tokens need `transfer:export` to export, `transfer:analyze` to upload and analyze, and `transfer:execute` to run, cancel, or abandon an import. The `admin` scope includes all three, so existing admin tokens and `emdash login` credentials can use site transfer; grant a single transfer scope to give a token, such as an agent's, narrower access.

  An MCP token without `admin` or the needed transfer scope can still start an export or import once an admin approves it: the tool fails with `TRANSFER_APPROVAL_REQUIRED` and an `approvalId`, a signed-in admin approves the request under **Settings → Transfer** (or `POST approvals/:id/approve`), and the agent repeats the call with `approvalId`. A request must be approved within 15 minutes, and an approval must be used within 15 minutes. It is single-use and bound to the user, the token, and the exact request.

  The audit log records who creates an export or import, requests, cancels, or abandons an import, or approves or denies a transfer request, and whose request completed or failed each import. Entries hold operation and approval ids, digests, record counts, and error codes, never package content.

  #### Writes during an import

  While an import is writing, and after a failed or cancelled import until it is abandoned, content and settings changes through the REST API, MCP, public comment and reaction forms, plugin routes, sandboxed plugins, and scheduled publishing return `503 TRANSFER_IMPORT_IN_PROGRESS`. Reads, sign-in, user management, API token management, and entry edit locks keep working. Do not send visitors to an imported site until its receipt is available.

  When the site cannot check whether writes are allowed, writes that returned `503 MEDIA_USAGE_ACTIVATION_CHECK_FAILED` now return `503 TRANSFER_FENCE_CHECK_FAILED`, in REST, MCP, and plugin route responses. Update any client that matches the old code.

  The public media route now refuses storage keys under `transfers/`. System cleanup removes an import's staged files 24 hours after it finishes and an export's when it expires.

### Change 287

Applies to: `emdash@0.40.0` (minor)  
Source: [#3376](https://github.com/emdash-cms/emdash/pull/3376)

Updates the `sqlite()` database adapter to open the database in write-ahead logging (WAL) mode, matching what `emdash init`, `emdash dev`, and `emdash seed` already do. Sites whose database was created or touched by those commands were already running in WAL mode; sites whose database was only ever opened by the running server switch to it on their next start.

  In WAL mode, SQLite keeps `-wal` and `-shm` files next to the database (for example `data.db-wal` and `data.db-shm`), and the server needs write access to the database directory. If your backup script copies only the `.db` file while the site is running, switch to `sqlite3 data.db ".backup backup.db"`, or stop the server first and copy all three files.

  Keep the database on a local disk or block volume: WAL does not work on network filesystems such as NFS or SMB.

### Change 288

Applies to: `emdash@0.40.0` (patch)  
Source: [#3354](https://github.com/emdash-cms/emdash/pull/3354)

Fixes entries that could not be saved because a rich text, multi-select, or repeater field held a blank string, typically left behind by an import. Saving failed with `expected array, received string` on a field the editor never touched. Blank or whitespace-only values for these fields are now stored as empty (`null`) when sent through the admin, the content API, or MCP, so such entries save normally and are repaired the next time they are saved from the admin. Blank values in required fields are still rejected as missing.

### Change 289

Applies to: `emdash@0.40.0` (patch)  
Source: [#3017](https://github.com/emdash-cms/emdash/pull/3017)

Fixes email-verification signup, which could not be completed: the verification email linked to the JSON API endpoint instead of the signup page, the signup page itself redirected anonymous visitors to login, and that redirect dropped the `?token=` from the URL. The email now links to `/_emdash/admin/signup?token=…` (as the invite email already did), the page is reachable without a session, and the login redirect preserves the query string of the page it returns to.

### Change 290

Applies to: `emdash@0.40.0` (patch)  
Source: [#3241](https://github.com/emdash-cms/emdash/pull/3241)

Fixes the General and SEO settings screens so removing the site logo, favicon, or default social image remains cleared after saving. REST, MCP, and `setSiteSettings()` callers can remove these media references by setting them to `null`; omitted settings remain unchanged.

### Change 291

Applies to: `emdash@0.40.0` (patch)  
Source: [#3400](https://github.com/emdash-cms/emdash/pull/3400)

Fixes new comments waiting for review with the reason "No moderator configured" on a site with one comment moderation plugin. When no `comment:moderate` choice is stored and exactly one plugin provides the hook, EmDash selects that plugin over the built-in moderator. EmDash no longer stores the built-in moderator as the choice when it is the only moderator, so a moderation plugin added later takes over.

  A choice stored by an earlier release is kept, which on most existing sites is the built-in moderator. The admin route `PUT /_emdash/api/admin/hooks/exclusive/comment:moderate` currently changes a stored choice.

### Change 292

Applies to: `emdash@0.40.0` (patch)  
Source: [#3382](https://github.com/emdash-cms/emdash/pull/3382)

Enforces the public comment submission rate limit under concurrent requests. Parallel submissions could previously all pass the check before any of them was saved, so a burst could post far more than the allowed 5 comments per 10 minutes per IP address (or 20 in total, shared by all visitors, when the site cannot determine a trusted client IP). The limit now resets at fixed 10-minute boundaries, so up to twice the cap can be accepted in quick succession across a boundary. On sites with Turnstile enabled, only submissions that pass the CAPTCHA count toward the limit. Submissions that pass the rate-limit check but are rejected later, for example by a `comment:beforeCreate` hook, now also count toward the limit. Rate-limited responses now include a `Retry-After` header.

### Change 293

Applies to: `emdash@0.40.0` (patch)  
Source: [#3358](https://github.com/emdash-cms/emdash/pull/3358)

Fixes `GET /_emdash/api/content/{collection}?status=all` returning an empty list. `status=all` now lists entries of every status, the same as omitting `status`. The endpoint, `EmDashClient.list()`, and `emdash content list --status` now reject any other value outside `draft`, `published`, `scheduled`, `archived`, `pending`, `private`, and `future` with a `400 VALIDATION_ERROR` instead of silently returning no items. Clients that sent a mistyped or unsupported status should send one of these values or omit `status`.

### Change 294

Applies to: `emdash@0.40.0` (patch)  
Source: [#3390](https://github.com/emdash-cms/emdash/pull/3390)

Fixes plugin cron schedules (`ctx.cron.schedule()` with `@daily`, `@hourly`, or standard cron expressions) so they resolve in UTC on every host. Node self-hosts previously resolved them in the server's `TZ`, so the same schedule fired at a different time than on Cloudflare Workers, which always runs in UTC.

  Node deployments whose `TZ` is not UTC will see recurring plugin tasks move after upgrading: `0 2 * * *` now runs at 02:00 UTC instead of 02:00 local time, and schedules no longer shift with daylight saving time. Each task switches the next time it runs or is rescheduled. Cloudflare Workers deployments and one-shot ISO 8601 schedules are unchanged. Plugin authors who need a local wall-clock time should write the expression in UTC; host-timezone resolution cannot be restored.

### Change 295

Applies to: `emdash@0.40.0` (patch)  
Source: [#3361](https://github.com/emdash-cms/emdash/pull/3361)

Fixes `definePlugin()` silently producing a plugin with no hooks when given a plugin descriptor, such as the result of `cloudflareEmail({...})`. The wrapped plugin registered normally but did nothing, so a wrapped email provider left the site with no email delivery. `definePlugin()` now throws an error that names the plugin, so a site that still wraps a descriptor fails to start until the wrapper is removed. Pass the descriptor directly to the `plugins` array of the `emdash()` integration instead:

  ```js
  // Before: a local plugin module whose createPlugin() returns
  // definePlugin(cloudflareEmail({ from: "cms@mails.example.com" }))

  // After, in astro.config.mjs
  emdash({
  	plugins: [cloudflareEmail({ from: "cms@mails.example.com" })],
  });
  ```

### Change 296

Applies to: `emdash@0.40.0` (patch)  
Source: [#3300](https://github.com/emdash-cms/emdash/pull/3300)

Fixes a D1/SQLite performance regression where taxonomy-filtered listings (e.g. `where: { category: "News" }` ordered by `published_at` or `created_at`) read orders of magnitude more rows than necessary. The `picked` CTE now uses a plain `JOIN` so the planner can drive from the content table's deleted-sort index, probe the pivot by primary key, and short-circuit at `LIMIT`, restoring the indexed-sort early-limit behavior.

### Change 297

Applies to: `emdash@0.40.0` (patch)  
Source: [#3359](https://github.com/emdash-cms/emdash/pull/3359)

Fixes every admin page (including login and the setup wizard) returning an empty response when `fonts: false` is set in the `emdash()` integration config. The admin now falls back to system fonts.

### Change 298

Applies to: `emdash@0.40.0` (patch)  
Source: [#3151](https://github.com/emdash-cms/emdash/pull/3151)

Fix `cloudflareEmail()` silently failing to reach `binding.send()` on some Astro Cloudflare builds, and make email delivery errors visible in runtime logs.

  - The provider now resolves `cloudflare:workers` `env` through a dedicated helper module (`cloudflare-email-env.ts`) so the Worker runtime evaluates it as a static import rather than a direct dynamic import of the built-in specifier. This avoids bundler/runtime paths where `import("cloudflare:workers")` inside the bundled Worker did not resolve.
  - `EmailPipeline.send()` now `console.error`s the provider and recipient before re-throwing a delivery error, so failures are not lost when callers (e.g. magic-link routes) intentionally swallow the error to avoid leaking whether an account exists.

  No configuration changes are required; existing `send_email` bindings continue to work.

### Change 299

Applies to: `emdash@0.40.0` (patch)  
Source: [#3348](https://github.com/emdash-cms/emdash/pull/3348)

Fixes gallery blocks seeded with `$media` showing empty images and losing their media on first edit. The `Gallery` component now renders these images, including galleries seeded with earlier versions, and the content editor previews them and keeps their media references, alt text, and dimensions when it saves. Seeding a gallery now stores each `$media` image as a regular gallery media reference. Galleries whose references an earlier autosave already stripped are not restored.

### Change 300

Applies to: `emdash@0.40.0` (patch)  
Source: [#3398](https://github.com/emdash-cms/emdash/pull/3398)

Fixes Portable Text image blocks seeded with `$media`, including those seeded with earlier versions, rendering with an empty `src` and losing their media reference when first edited in the admin or through visual editing. Seeding now stores the image as a regular media reference with its alt text and dimensions on the block, the same shape the editor saves. Blocks whose media reference an earlier edit already removed need their image selected again.

### Change 301

Applies to: `emdash@0.40.0` (patch)  
Source: [#3350](https://github.com/emdash-cms/emdash/pull/3350)

Fixes saving from visual editing changing custom blocks identified by `url`, such as embeds imported from WordPress, to use `id`, which dropped their `url`. Blocks now keep the identity field they were stored with: blocks with both `id` and `url` keep both, and blocks with neither no longer gain an empty `id`. Custom blocks inserted in the content editor no longer gain an empty `id` when no ID is entered.

### Change 302

Applies to: `emdash@0.40.0` (patch)  
Source: [#3438](https://github.com/emdash-cms/emdash/pull/3438)

Fixes upgrades that hang or fail on the `035_bounded_404_log` migration when `_emdash_404_log` holds many rows, on PostgreSQL, SQLite, and Cloudflare D1. Deduplicating the 404 log slowed down sharply as the log grew, so a log with a few hundred thousand entries never finished, held the migration lock, and on PostgreSQL could run the server out of memory. The migration now takes about as long as reading the log once, so sites no longer need to empty the 404 log before upgrading.

  #### Sites that already failed on this migration

  On SQLite and D1, a site whose earlier attempt stopped partway kept failing on every start with a unique-constraint error on `_emdash_404_log`. The migration now finishes deduplicating on the next start. If startup instead reports that the migration lock is held, [release the stuck migration lock](https://docs.emdashcms.com/deployment/core-migrations/#release-a-stuck-migration-lock) first. PostgreSQL sites were rolled back to their pre-migration state and simply complete on the next start.

### Change 303

Applies to: `emdash@0.40.0` (patch)  
Source: [#3338](https://github.com/emdash-cms/emdash/pull/3338)

Fixes cached published pages remaining stale when tag or category assignments change. Assignments still save immediately, and the editor clarifies that term changes do not wait for **Publish changes**.

### Change 304

Applies to: `emdash@0.40.0` (patch)  
Source: [#3337](https://github.com/emdash-cms/emdash/pull/3337)

Fixes magic link and account recovery emails failing for recipients whose mail is scanned (for example by Microsoft 365 Safe Links). Opening the link now shows a confirmation page in the admin, and the one-time link is only used when the recipient presses Continue, so a scanner that fetches the link no longer uses it up or receives the session. Links in emails sent before the upgrade keep working.

  `GET /_emdash/api/auth/magic-link/verify` no longer signs in; it redirects to the confirmation page. Scripts that signed in by requesting that URL must now send `POST /_emdash/api/auth/magic-link/verify` with a JSON body `{ "token": "..." }` and the `X-EmDash-Request: 1` header, then keep the returned session cookie.

### Change 305

Applies to: `emdash@0.40.0` (patch)  
Source: [#3416](https://github.com/emdash-cms/emdash/pull/3416)

Fixes marketplace plugin updates installing a version that failed or did not clear the marketplace security audit. Updating to a version whose audit verdict is `fail` or `warn`, whether it is the latest version or one chosen explicitly, is now refused with the same `AUDIT_FAILED` error as installing it, and the installed version stays in place.

### Change 306

Applies to: `emdash@0.40.0` (patch)  
Source: [#3433](https://github.com/emdash-cms/emdash/pull/3433)

Fixes the MCP `content_duplicate` tool letting contributors and authors copy content owned by other users. The tool now requires permission to edit the source item, matching the REST duplicate endpoint: authors can duplicate their own content, editors and above can duplicate anyone's, and contributors can no longer duplicate content through MCP. The copy is now attributed to the user who made it instead of the source item's author.

### Change 307

Applies to: `emdash@0.40.0` (patch)  
Source: [#3067](https://github.com/emdash-cms/emdash/pull/3067)

Media deletion no longer leaves files behind. The MCP `media_delete` tool and the plugin `ctx.media.delete()` API now remove the stored file as well as the record, matching the admin API. When the storage delete fails, `DELETE /_emdash/api/media/:id` reports `storageDeleted: false` instead of a plain success, and the periodic cleanup retries the file deletion until it succeeds.

### Change 308

Applies to: `emdash@0.40.0` (patch)  
Source: [#3413](https://github.com/emdash-cms/emdash/pull/3413)

Fixes the Media Library **Used in** tab reporting no usage for a file selected as the site logo, favicon, or default social image. Those settings appear as a **Site Settings** result, `GET /_emdash/api/media/{id}/usage` lists them in a new `siteSettings` array, and `usage.count` includes them. An empty **Used in** tab now says "No tracked references found" and names what is not checked, such as custom rich text blocks, instead of stating that the file is not used in any content.

### Change 309

Applies to: `emdash@0.40.0` (patch)  
Source: [#3395](https://github.com/emdash-cms/emdash/pull/3395)

Fixes `astro build` failing with `Rollup failed to resolve import "cloudflare:sockets"` on Astro 6 sites that use `@astrojs/node` or another non-Cloudflare adapter, so EmDash's own import no longer needs a `vite.build.rollupOptions.external: [/^cloudflare:/]` workaround.

### Change 310

Applies to: `emdash@0.40.0` (patch)  
Source: [#3386](https://github.com/emdash-cms/emdash/pull/3386)

Fixes passkey sign-in options revealing whether an email address has an account. `POST /_emdash/api/auth/passkey/options` now ignores the optional `email` field and returns the same options for every request, so the browser offers any passkey saved for the site. The default admin login is unaffected. Clients that posted `email` to this endpoint to sign in with passkeys not stored on the authenticator (non-discoverable credentials, such as some older security keys) can no longer sign in with those keys. Register a passkey on an authenticator that supports discoverable credentials (most platform authenticators and current security keys), or sign in with a magic link or a configured OAuth provider. The `@emdash-cms/admin` `PasskeyLogin` component's `showEmailInput` prop is deprecated and no longer shows an email field; existing callers still type-check and can drop the prop. The previous email-scoped behavior cannot be restored.

### Change 311

Applies to: `emdash@0.40.0` (patch)  
Source: [#3419](https://github.com/emdash-cms/emdash/pull/3419)

Fixes click-to-edit for text on the page in Edit mode:

  - In the Playground, clicking an editable title or text field now edits it in place, and clicking an editable image opens the image picker. Previously these fields showed an outline on hover but did nothing when clicked.
  - Multi-line text fields, such as excerpts, now edit in place when the page shows the field's stored text unchanged, and line breaks added while editing are saved. Previously, clicking a text field always opened the entry in the admin. It still does when the page shows the text transformed, for example Markdown rendered as HTML or a shortened excerpt, so an edit on the page can't overwrite the full stored text.
  - Clicking an editable field inside a link, such as a title in a post card, edits the field instead of following the link, including when the field is clicked before the editor has finished loading.

### Change 312

Applies to: `emdash@0.40.0` (patch)  
Source: [#1745](https://github.com/emdash-cms/emdash/pull/1745)

Fixes preview links 404ing on sites with a custom collection `url_pattern`. The content Preview button now resolves the collection's `url_pattern` (the same route the sitemap and "View published" links use) instead of the hard-coded `/{collection}/{id}`, falling back to `/{collection}/{id}` only when no pattern is configured. An explicit `pathPattern` or `EMDASH_PREVIEW_PATH_PATTERN` still takes precedence.

### Change 313

Applies to: `emdash@0.40.0` (patch)  
Source: [#3403](https://github.com/emdash-cms/emdash/pull/3403)

Fixes registry plugin installs and updates on Node.js sites, along with the plugin icons, banners, and screenshots on the admin's registry plugin page. Since 0.36.0, every registry download on Node.js failed, and installs stopped with errors such as `The publisher DID document could not be fetched.` Sites on Cloudflare Workers were not affected.

### Change 314

Applies to: `emdash@0.40.0` (patch)  
Source: [#3399](https://github.com/emdash-cms/emdash/pull/3399)

Fixes the admin plugin registry showing "Handle unavailable" for every publisher and scrolling sideways, so verified publisher handles now appear and unresolved publisher identifiers stay inside their cards.

  A publisher whose handle no longer resolves back to its account now shows **INVALID HANDLE**, and installing its plugins from the registry detail page is disabled until the publisher fixes the handle. Plugins that are already installed keep running.

### Change 315

Applies to: `emdash@0.40.0` (patch)  
Source: [#3410](https://github.com/emdash-cms/emdash/pull/3410)

Reduces the D1 queries needed to apply a seed with sample content, such as through the setup wizard's **Include sample content** option, from 22 to 10 per published entry with plain fields, leaving more of a Worker invocation's D1 query limit for larger seeds.

### Change 316

Applies to: `emdash@0.40.0` (patch)  
Source: [#3355](https://github.com/emdash-cms/emdash/pull/3355)

Fixes seeds that declare `category` or `tag` losing their labels and collection assignments. Every new database starts with built-in versions of these two taxonomy definitions, and seeding skipped them as existing. Until a site edits them, the built-in definitions are now replaced by the seed's in every `onConflict` mode, including `--on-conflict error`, which no longer fails on them. Edited definitions are still kept by the default `skip` mode. Running `emdash seed` against an existing site that never edited these two taxonomies now applies the seed's labels, collections, and hierarchy to them. `applySeed()` results include `taxonomies.skipped`, `emdash seed` prints it, and the automatic first-boot seed logs a warning when it keeps any existing taxonomy definitions.

### Change 317

Applies to: `emdash@0.40.0` (patch)  
Source: [#3401](https://github.com/emdash-cms/emdash/pull/3401)

Fixes `kvCache()` rate-limit (429) errors, logged as `[object-cache] epoch bump failed`, when a seed with sample content is applied on Cloudflare Workers, such as through the setup wizard's **Include sample content** option. Applying a seed now writes each invalidated cache key to KV once, when the seed finishes, instead of once per entry.

### Change 318

Applies to: `emdash@0.40.0` (patch)  
Source: [#3356](https://github.com/emdash-cms/emdash/pull/3356)

Fixes public pages redirecting visitors and crawlers to `/_emdash/admin/setup` when the database has never been migrated. With the default automatic migration mode, the first public request now migrates the database and renders the page. If that fails, the page answers with a temporary uncached `503` that links to the setup wizard. Opening `/_emdash/admin` on a new site still leads to the setup wizard.

### Change 319

Applies to: `emdash@0.40.0` (patch)  
Source: [#3357](https://github.com/emdash-cms/emdash/pull/3357)

Fixes anonymous public page requests making a second database connection attempt after the setup check on a fresh server instance has already failed to reach the database. The request now skips CMS runtime initialization and renders without plugin-contributed metadata and page fragments, as it already did when runtime initialization failed. Later requests retry the check, and a server instance whose runtime is already running keeps using it.

### Change 320

Applies to: `emdash@0.40.0` (patch)  
Source: [#3368](https://github.com/emdash-cms/emdash/pull/3368)

Fixes term translations that could sit under a different parent than the term they translate. A translation created without a parent through the REST API, MCP `taxonomy_create_term`, the plugin `createTerm()` API, a seed file or a WordPress import now takes its term's parent and position instead of becoming a root term in its locale; sending `parentId: null` does the same as leaving it out. A translation created under a different parent moves the term in every locale, as changing the parent through any locale already did.

  On sites where earlier versions left a term's locales under different parents, saving the term's parent from any locale now moves every locale under it. The admin's term dialog sends the current parent on every save, so the first save of such a nested term, even a label change, settles its parent for all locales.

### Change 321

Applies to: `emdash@0.40.0` (patch)  
Source: [#3380](https://github.com/emdash-cms/emdash/pull/3380)

Malformed invite, signup, and magic-link tokens now return a clean "invalid token" error instead of a 500. Token hashing tolerates values that aren't valid base64url, so an unrecognized token misses the lookup like any other unknown token.

### Change 322

Applies to: `emdash@0.40.0` (patch)  
Source: [#3405](https://github.com/emdash-cms/emdash/pull/3405)

Fixes `ctx.media.upload()` in trusted (in-process) plugins accepting any content type and keeping the filename's extension, which let a public plugin route, such as the forms plugin's submit endpoint, store files like HTML pages that the site then served under their own type. Trusted plugins can now upload through `ctx.media.upload()` or request an upload URL through `ctx.media.getUploadUrl()` only for the types in the default media upload allowlist: PNG, JPEG, GIF, WebP, and AVIF images, video, audio, and PDF. Any other type, including SVG and `application/octet-stream`, throws a `PluginRouteError` with status `415 UNSUPPORTED_MEDIA_TYPE`, and a malformed content type throws one with status `400`. A file stored by `upload()` or reserved by `getUploadUrl()` gets an extension that matches its content type, so an upload named `page.html` with type `image/png` is stored and served as a PNG; when the type has no known extension, the filename's extension is kept only if it belongs to an allowed media type. Trusted plugins that uploaded other types must switch to one of the accepted types.

### Change 323

Applies to: `emdash@0.40.0` (patch)  
Source: [#2889](https://github.com/emdash-cms/emdash/pull/2889)

Generated `emdash-env.d.ts` files now include `entry.data.byline?: BylineSummary | null` alongside `bylines`, matching the byline data hydrated by `getEmDashEntry` and `getEmDashCollection` at runtime.

### Change 324

Applies to: `emdash@0.40.0` (patch)  
Source: [#3397](https://github.com/emdash-cms/emdash/pull/3397)

Fixes the image popover in the visual editing toolbar: uploads no longer report "Save failed" and leave an unused copy in the media library on each attempt, the media library lists your images instead of "No images found", and alt text edits on an existing image are saved.

### Change 325

Applies to: `emdash@0.40.0` (patch)  
Source: [#3051](https://github.com/emdash-cms/emdash/pull/3051)

Fixes Workerd plugins retaining access after they are disabled or unloaded, and keeps capabilities, allowed hosts, and storage declarations scoped to the loaded plugin version. Re-enabling a plugin issues fresh credentials.

### Change 326

Applies to: `emdash@0.39.1` (patch)  
Source: [#3311](https://github.com/emdash-cms/emdash/pull/3311)

Fixes `emdash migrate` failing on Cloudflare D1 with `incomplete input: SQLITE_ERROR (migration: 081_redirect_write_guards)`. The redirect loop triggers no longer contain an inner `CASE ... END;`, which the D1 HTTP API treated as the end of the `CREATE TRIGGER` statement. Loop detection is unchanged. Sites where 081 stopped partway can run `emdash migrate` again: the migration resumes safely.

### Change 327

Applies to: `emdash@0.39.0` (minor)  
Source: [#3180](https://github.com/emdash-cms/emdash/pull/3180)

Adds binary-safe `ctx.http.fetch()` behavior to sandboxed plugins on Cloudflare Worker Loader and Node/workerd. Request and response bodies are buffered with an 8 MiB decoded limit, and the returned WHATWG `Response` preserves bytes, status text, headers, final URL, redirect state, and clones across both runners.

  Redirected requests follow Fetch method and body rules. The Node/workerd runner also applies the installed version's current network capability and host list immediately after a plugin update.

  #### Reading binary responses

  Read bytes from the buffered response with the standard Response API:

  ```ts
  const response = await ctx.http!.fetch("https://api.example.com/report");
  const bytes = new Uint8Array(await response.arrayBuffer());
  ```

  #### Testing external HTTP

  `createPluginRuntimeTestHost()` adds `http.respond()`, `http.requests()`, and `http.clear()` for deterministic production-bridge tests:

  ```ts
  await host.http.respond("https://api.example.com/report", new Response(new Uint8Array([0, 255])));
  await host.transport.invokeRoute("import-report");
  expect(host.http.requests()).toContainEqual(
  	expect.objectContaining({ url: "https://api.example.com/report" }),
  );
  ```

### Change 328

Applies to: `emdash@0.39.0` (minor)  
Source: [#3188](https://github.com/emdash-cms/emdash/pull/3188)

Adds saved-entry panels and actions for sandboxed plugins. Declare collection-filtered `admin.editorPanels` and `admin.editorActions` entries that point to private plugin routes.

  Panels load Block Kit only when an editor opens them. Actions support confirmation and can return a toast, request an entry refresh, or navigate through a structured link target. EmDash reloads and ownership-authorizes the saved entry before invocation, then exposes only its canonical identity, locale, and version through `routeCtx.ui`; unsaved editor values never cross the sandbox boundary.

  `createPluginRuntimeTestHost()` includes panel and action helpers that exercise the production authorization, response-validation, and Worker Loader path.

### Change 329

Applies to: `emdash@0.39.0` (minor)  
Source: [#3171](https://github.com/emdash-cms/emdash/pull/3171)

Adds capability-gated schema, translation, public URL, and content revision discovery for plugins.

  Declare `schema:read` to list collection and field definitions through `ctx.schema`. Existing `content:read` access can inspect safe content identity, discover locale siblings with `getTranslations()`, and resolve published routes with `getPublicUrl()`. Public URL resolution follows the site's collection pattern, locale routing, and trailing-slash policy and returns `null` for content without a public route.

  Revision snapshots require the separate `content:revisions:read` capability because retained history can contain field values that an administrator removed later. This capability implies ordinary `content:read` access. Installation and plugin updates show both new authorities for consent, and the native, Cloudflare Worker Loader, and Node.js workerd runtimes expose the same methods.

### Change 330

Applies to: `emdash@0.39.0` (minor)  
Source: [#3184](https://github.com/emdash-cms/emdash/pull/3184)

Adds capability-gated redirect access for sandboxed plugins. Declare `redirects:read` to list redirect rules with cursor pagination and read a rule with an opaque `_rev`. Declare `redirects:write` to create, update, and delete redirect rules; write access implies read access and installation consent states that the plugin can change where visitors are sent.

  Redirect mutations use EmDash's redirect validation and cache invalidation path. Writes are serialized across runtimes so duplicate-source and loop validation use a consistent rule graph. The expanded redirect schema remains compatible with writes from previous host processes during rolling deployments. Loop validation runs when a rule is created or its source or destination changes; enabled-only updates retain the host API's existing behavior. Updates and deletes require the latest `_rev`, reject concurrent changes with `CONFLICT`, and do not let plugins set the host-owned automatic redirect marker. The Cloudflare Worker Loader and Node.js workerd runners expose the same API, and `createPluginRuntimeTestHost()` includes redirect fixtures and inspection for production-boundary tests.

### Change 331

Applies to: `emdash@0.39.0` (minor)  
Source: [#3145](https://github.com/emdash-cms/emdash/pull/3145)

Updates plugin discovery to show only the registry. Sites with an enabled `sandboxRunner` use the hosted aggregator at `https://registry.emdashcms.com` by default. The new top-level `registry` option accepts a registry URL or configuration object, while `registry: false` disables registry discovery and registry-installed plugins without disabling the sandbox runner.

  The former `experimental.registry` location is deprecated but remains supported when the top-level option is omitted. A top-level value takes precedence.

  The `marketplace` integration option is deprecated but remains supported for plugins already installed from Marketplace. Those plugins continue to run and can still be updated or uninstalled from **Plugins**. Marketplace browse and install pages are hidden, and configured sites display a migration guide banner.

  #### What should I do?

  Move an existing `experimental.registry` value to the top-level `registry` option. The deprecated location continues to work during the pre-1.0 compatibility period.

  Set `registry: false` if the site needs its sandbox runner but should not load registry-installed plugins or expose registry discovery.

  Keep `marketplace` configured while any installed Marketplace plugin still needs updates. Replace or uninstall those plugins, then remove the option by following the [Marketplace migration guide](https://docs.emdashcms.com/plugins/migrate-from-marketplace/).

### Change 332

Applies to: `emdash@0.39.0` (minor)  
Source: [#3170](https://github.com/emdash-cms/emdash/pull/3170)

Adds `comments:read` and `comments:moderate` for sandboxed plugins. `ctx.comments` can get, count, and cursor-page through non-trashed comments, and can change a comment between `approved`, `pending`, and `spam` when the caller supplies the status it previously observed.

  `comments:read` exposes comment bodies, author names and email addresses, pseudonymous IP hashes, user agents, and moderation metadata. It does not expose the linked EmDash user-account ID. `comments:moderate` implies that read access, and installation or an update that requests either capability requires operator consent.

  Status changes use the core moderation path. A stale expected status rejects with `COMMENT_STATUS_CONFLICT`, and an overlapping transition can reject with `COMMENT_MODERATION_IN_PROGRESS`; a successful transition runs `comment:afterModerate` once with the calling plugin's origin and preserves approval notifications. Hard deletion and bulk status replacement are not included.

### Change 333

Applies to: `emdash@0.39.0` (minor)  
Source: [#3251](https://github.com/emdash-cms/emdash/pull/3251)

Adds explicit, consented access to selected unsaved content for sandboxed editor panels and actions.

  Plugins can request `admin.editor-draft:read` to receive extension-selected field values after an editor invokes them, and `admin.editor-draft:patch` to propose atomic whole-field `set` or `clear` operations. Patch access does not imply read access. Each extension must declare explicit collection scope and narrow its access to field slugs, translatable fields, or both.

  EmDash authenticates and authorizes the saved entry, reloads its schema and revision, validates snapshot and patch limits, and rejects stale or invalid responses. The admin shows a host-rendered before-and-after preview, applies accepted changes to the visible form, marks it dirty, and leaves saving to the editor. Panel load and ordinary typing do not expose draft data or invoke the plugin.

  `createPluginRuntimeTestHost()` now provides draft capture and host-validated patch application helpers for production-boundary plugin tests.

### Change 334

Applies to: `emdash@0.39.0` (minor)  
Source: [#3172](https://github.com/emdash-cms/emdash/pull/3172)

Adds separate sandboxed-plugin capabilities for reading media bytes and editing media metadata.

  Declare `media:bytes:read` to use `ctx.media.readBytes()`. Reads are available only for ready media, default to a 10 MiB limit, enforce the caller's limit while consuming the storage stream, and cannot request more than 16 MiB. The result includes the content hash; ordinary `media:read` metadata excludes content hashes, storage keys, and author identity.

  Ready-media metadata URLs use an authenticated media ID route. Authenticated callers with the `media:read` permission can fetch the asset without receiving its storage key; logged-out requests are rejected before the route queries media.

  Declare `media:metadata:write` to use `ctx.media.updateMetadata()` for alt text, captions, and focal points. This capability cannot upload, replace, move, or delete media. It does not imply `media:read` or `media:bytes:read`.

  `@emdash-cms/plugin-test` also provides binary media fixtures and inspection through the runtime-backed host so plugin tests can exercise the production Worker Loader bridge.

### Change 335

Applies to: `emdash@0.39.0` (minor)  
Source: [#3164](https://github.com/emdash-cms/emdash/pull/3164)

Fixes concurrent core migrations on Cloudflare D1 failing partway with errors such as `table "_plugin_storage" already exists`. `emdash migrate` and runtime migrations in `auto` mode take a migration lock in the D1 database. A second run waits up to 10 seconds: it succeeds without applying anything if the first run finishes in that time, and otherwise fails without applying migrations.

  A run that stops before releasing the lock leaves it held, because it may have stopped partway through a migration. This happens when a CI job is cancelled during `emdash migrate`, when a Worker in `auto` mode stops during a runtime migration, or when a development server is stopped while it applies migrations. Until the lock is released, pending migrations do not run and a D1 site in `auto` mode fails to initialize EmDash. Once the lock is older than a minute, migration runs fail at once with the lock's time and id, and the runtime retries after its migration-failure backoff.

  Adds `emdash migrate --release-lock <id>` to release such a lock. `emdash migrate --status` reports the lock and its id. After confirming that no migration is running, release the lock with that id:

  ```sh
  pnpm emdash migrate --release-lock 1788264000000
  ```

  Releasing the lock of a remote D1 database needs a build manifest and an API token with D1 Edit permission. A lock in the local D1 database of a development server is released with Wrangler. See [Release a stuck migration lock](https://docs.emdashcms.com/deployment/core-migrations/#release-a-stuck-migration-lock) for both procedures.

### Change 336

Applies to: `emdash@0.39.0` (minor)  
Source: [#2880](https://github.com/emdash-cms/emdash/pull/2880)

Adds the field constraints declared in a collection schema to the content editor, so authors see a limit before a save can fail on it.

  Text fields with `maxLength` show a live character count below the input and stop accepting input at the limit; a `minLength` is shown as a hint. Number fields with `min` or `max` show the allowed range and set it on the input. Content that is outside its bounds, such as text saved before a limit was lowered, is marked in the editor before a save is attempted.

  The admin manifest now carries a field's `validation` object for every field type. Previously only repeater, file and image fields exposed it, so length and range rules never reached the editor. Plugin field widgets for trusted plugins receive the same `validation` object as a prop, so a custom widget can enforce the limits without hardcoding them.

### Change 337

Applies to: `emdash@0.39.0` (minor)  
Source: [#3173](https://github.com/emdash-cms/emdash/pull/3173)

Adds `ctx.settings` for plugin configuration and encrypts fields declared as `type: "secret"` before writing them to the database. Native plugins, Cloudflare Worker Loader plugins, and Node/workerd plugins share the same versioned AES-GCM envelope and plugin-scoped API. `@emdash-cms/plugin-test` can update generated settings through the runtime host and inspect their raw persisted envelope.

  Set `EMDASH_ENCRYPTION_KEY` in the runtime process environment before saving secret settings. A standalone Node server does not load `.env` automatically. To rotate the key, place the new key first in a comma-separated list and retain old keys until every plugin secret has been saved again. EmDash does not currently report which key IDs remain in use, so track each resaved credential and verify its integration before removing an old key. Restores need both the database and every encryption key referenced by its stored envelopes.

  Cloudflare sites using `nodejs_compat` with a compatibility date before `2025-04-01` must also add `nodejs_compat_populate_process_env` before saving secrets through the generated admin form. Cloudflare enables that behavior by default for later compatibility dates.

  Existing plaintext secrets remain readable and are encrypted when saved again. The `ctx.kv.get("settings:<key>")` compatibility alias remains available throughout the EmDash 0.x release line; new plugin code should use `ctx.settings.get("<key>")`.

  Only fields declared as `type: "secret"` in `admin.settingsSchema` use this encryption path. Arbitrary plugin KV and state values are unchanged; credentials stored by the bundled AT Protocol and webhook notifier plugins are not migrated by this release.

### Change 338

Applies to: `emdash@0.39.0` (minor)  
Source: [#3120](https://github.com/emdash-cms/emdash/pull/3120)

Adds `GET /_emdash/api/health` so external tools can confirm an EmDash site is reachable and whether its plugin registry is enabled. The anonymous response does not query the database and permits cross-origin reads.

### Change 339

Applies to: `emdash@0.39.0` (minor)  
Source: [#3194](https://github.com/emdash-cms/emdash/pull/3194)

Adds separately consented publication and restore actions to native and sandboxed plugin contexts.

  Plugins with `content:publish` can read an entry with an opaque revision and publish, unpublish, schedule, or unschedule it through the same runtime behavior as REST and MCP. Each mutation requires the revision returned by the read or preceding action, and a plugin cannot recursively run the same action for the same entry. The capability implies `content:read` but not `content:write`.

  Plugins with `content:restore` can read and restore trashed entries without receiving ordinary content-read or write authority. Restore is revision-fenced and returns the next revision. Existing plugin installations receive neither capability unless a new version declares it and the administrator approves the expanded access.

### Change 340

Applies to: `emdash@0.39.0` (minor)  
Source: [#3185](https://github.com/emdash-cms/emdash/pull/3185)

Adds `hooks.content-policy:register` for sandboxed and native plugins that need to inspect and reject publication, scheduling, or unpublication without receiving content read, write, or publication-action access.

  Policy plugins can register `content:beforePublish`, `content:beforeSchedule`, and `content:beforeUnpublish`. Each event identifies the API, MCP, visual editor, plugin, scheduler, or system origin and includes the authenticated actor when one exists. Return `{ cancel: true, reason }` to reject the action with a stable error code. EmDash validates the reason as 1–500 plain-text characters. For allowed actions, the revision read before policy evaluation becomes the mutation precondition.

  Scheduled content runs `content:beforePublish` again when it becomes due. A policy rejection unschedules the entry, lists its public-safe reason and entry link on the dashboard, and avoids retrying the same permanent rejection on every scheduler tick. Successful rescheduling, publication, or deletion clears the record; administrators can dismiss stale records. `@emdash-cms/plugin-test` exposes stored scheduler rejections through `inspect.scheduledPolicyRejections()`.

### Change 341

Applies to: `emdash@0.39.0` (minor)  
Source: [#3190](https://github.com/emdash-cms/emdash/pull/3190)

Adds declared request and raw response contracts for sandboxed plugin routes across the native,
  Cloudflare Worker Loader, and Node/workerd runtimes.

  Use `methods` to have the host reject other HTTP methods with `405 Method Not Allowed`. Use
  `request.body` with `json`, `text`, `bytes`, `form-data`, or `none` for bounded buffered parsing, and
  list the safe request headers the handler needs. Undeclared routes retain their existing
  method-agnostic JSON and query-string behavior.

  Routes with `response: "raw"` return `pluginResponse()` with an unwrapped text or byte body, status,
  and allowlisted representation, download, or redirect headers. Raw responses are limited to 8 MiB.
  The host removes all other plugin-supplied headers, applies the route's cache and browser security
  policy, and rejects active same-origin content types.

  `pluginRoute()` infers a sandboxed handler's input from its declared body mode.
  `definePluginRoute()` provides the equivalent inference for trusted native routes.
  `createPluginRuntimeTestHost()` accepts `rawBody` for testing the production request parser with
  text, bytes, URL-encoded data, and multipart form data.

### Change 342

Applies to: `emdash@0.39.0` (minor)  
Source: [#3162](https://github.com/emdash-cms/emdash/pull/3162)

Adds `createPluginRuntimeTestHost()` for sandboxed plugin tests that must exercise EmDash orchestration instead of invoking an isolate directly. The host separates direct transport calls, fixtures, production actions, observable-state inspectors, scheduled time control, cold restart, and disposal.

  Runtime actions cover the shipped content lifecycle, plugin activation and deactivation, media upload, public comment submission, comment moderation, plugin-route policy, and scheduled task execution. The controlled scheduler clock applies to cron tasks and scheduled publishing. `restart()` retains D1, plugin storage, media storage, and plugin state while replacing runtime and isolate memory. The host captures delivered email for assertions.

  `createPluginTestHost()` and its top-level `invokeHook()` and `invokeRoute()` methods remain compatible for fast transport-level tests. `emdashPluginTest()` supplies the runtime modules required by the documented Vitest configuration. Generated plugin projects continue to use Worker Loader by default and describe Node/workerd parity as an opt-in test for runner-sensitive behavior.

### Change 343

Applies to: `emdash@0.39.0` (minor)  
Source: [#3174](https://github.com/emdash-cms/emdash/pull/3174)

Adds structured Block Kit navigation and host-attested administrator locale context for sandboxed plugin pages and dashboard widgets.

  Plugins can return `link` elements that target saved content, another page declared by the same plugin, generated plugin settings, or an external HTTP, HTTPS, or `mailto:` URL. EmDash constructs internal admin URLs and opens external links with `noopener noreferrer`. Links never dispatch block actions and cannot appear as form fields.

  Block Kit route handlers receive `routeCtx.ui` with the validated surface, administrator locale, and text direction. The host validates every sandboxed page and widget response before rendering it, rejects undeclared plugin-page targets and active URL protocols, and permits external images only over HTTPS to hosts declared in `allowedHosts` under `network:request` consent or under `network:request:unrestricted` consent. Responses are limited to 256 KiB, 20 levels, 2,000 nodes, 1,000 items per array, and 64 KiB per string.

  `createPluginRuntimeTestHost()` adds `admin.loadPage()`, `loadWidget()`, `act()`, and `submit()` helpers that exercise the private production route, Worker Loader isolate, host UI context, and response validation.

  This is a breaking security tightening for sandboxed plugins that return an external Block Kit image without matching network authority. EmDash rejects the complete page or widget response instead of allowing the administrator's browser to contact an unapproved host.

  #### What should I do?

  If a plugin returns external Block Kit images, add `network:request` and every image hostname to `allowedHosts`, or add `network:request:unrestricted` when the plugin genuinely requires any hostname. Publish a plugin update so administrators can review and approve the expanded authority. Root-relative images need no manifest change.

### Change 344

Applies to: `emdash@0.39.0` (minor)  
Source: [#3235](https://github.com/emdash-cms/emdash/pull/3235)

Adds a `scope=title` option to the search API and the `search()`/`searchCollection()` helpers that restricts matching to each collection's title field instead of the full indexed text.

### Change 345

Applies to: `emdash@0.39.0` (minor)  
Source: [#3182](https://github.com/emdash-cms/emdash/pull/3182)

Adds translation-aware sandboxed plugin content creation through `ctx.content.create(collection, data, { locale, translationOf })`.

  The source must be an active entry in the same collection. The new entry joins its translation group, inherits its byline credits and taxonomy assignments, and takes non-translatable field values from the source. Content validation and save hooks run in both the Cloudflare Worker Loader and Node/workerd runners. Save-hook-originated creates do not re-enter save hooks, and the creating plugin's own `content:afterSave` hook is not re-entered.

  Each translation group permits one active entry per locale. Duplicate locale creates return `CONFLICT`, missing sources return `NOT_FOUND`, invalid or unconfigured locales return `VALIDATION_ERROR`, and save hooks can return `SAVE_REJECTED`.

### Change 346

Applies to: `emdash@0.39.0` (minor)  
Source: [#3169](https://github.com/emdash-cms/emdash/pull/3169)

Adds the `taxonomies:write` sandboxed-plugin capability for creating taxonomy terms and adding or removing term assignments through `ctx.taxonomies`.

  Assignment methods accept term row IDs or translation-group IDs and apply idempotent deltas, so they do not replace existing assignments and concurrent additions are preserved. EmDash validates collection attachment, entry existence, term ownership, configured locales, translation identity, and hierarchy before changing taxonomy state. Sandboxed `createTerm()` rejects `parentId` for a non-hierarchical taxonomy instead of ignoring it. The capability implies `taxonomies:read` and requires renewed consent when an installed plugin first declares it.

  Existing REST and MCP term mutations also reject creating or updating a term with a parent in a non-hierarchical taxonomy. Callers that assign parents must mark the taxonomy as hierarchical before creating or reparenting terms.

  This release includes migration `082_taxonomy_translation_locale_unique`, which enforces one term per translation group and locale. If an existing database contains duplicate rows, the migration preserves them as independent term groups and copies their assignments before adding the unique index. It can restart safely after any completed statement.

  `@emdash-cms/plugin-test` adds taxonomy fixtures and an assignment inspector for production-boundary tests. Taxonomy definition management, assignment replacement, term updates, and term deletion remain unavailable to sandboxed plugins.

### Change 347

Applies to: `emdash@0.39.0` (patch)  
Source: [#3068](https://github.com/emdash-cms/emdash/pull/3068)

Reduces the CPU work needed to render the Archives widget on sites with many posts. Archive links, ordering, and post counts stay the same.

### Change 348

Applies to: `emdash@0.39.0` (patch)  
Source: [#3146](https://github.com/emdash-cms/emdash/pull/3146)

Fixes datetime sorting and range queries by storing every content datetime as a UTC ISO string with fixed milliseconds. The admin converts date-and-time fields through the site's configured timezone, while API, MCP, and CLI writes now require `Z` or an explicit UTC offset.

  The core migration reports noncanonical values before changing them, then normalizes content columns and revision snapshots in bounded batches. Legacy values without an offset use the site timezone. If a value falls in a repeated or skipped daylight-saving hour, the migration stops before writing and reports the content row or revision that needs an explicit offset.

### Change 349

Applies to: `emdash@0.39.0` (patch)  
Source: [#3228](https://github.com/emdash-cms/emdash/pull/3228)

Fixes content writes when a database schema contains a field type that the running EmDash version does not support. Entries remain readable, but the admin makes them read-only and content create or update requests return `UNSUPPORTED_FIELD_TYPE` instead of treating the unknown field as text and risking data loss.

  Deploy this release to every runtime before enabling a later EmDash feature that adds a new field type. Sites whose schemas use only supported field types require no action.

### Change 350

Applies to: `emdash@0.39.0` (patch)  
Source: [#3142](https://github.com/emdash-cms/emdash/pull/3142)

Fixes an entry with a pending draft becoming unsaveable after one of its fields is deleted. The draft revision stores the whole `data`, so the deleted field's value stayed in it and every read handed it back; writing that data back was then refused with `unknown field on collection`, an explicit `null` was refused too, and omitting the key was accepted but left the merge carrying it, so no request body got the entry out of the state. An update now drops a key the collection has no field for when the entry already stores it, and a saved entry is written without those keys, so it sheds them. A key the entry does not already store is still reported as an unknown field. This applies to every content write, including those made from a plugin or a sandboxed plugin bridge.

### Change 351

Applies to: `emdash@0.39.0` (patch)  
Source: [#3269](https://github.com/emdash-cms/emdash/pull/3269)

Fixes the generated OpenAPI document so publish, unpublish, and discard-draft include their optional request bodies, and restore-from-Trash describes the returned item and revision token. The MCP `content_unschedule` description now states that scheduled drafts return to draft while published entries stay published.

### Change 352

Applies to: `emdash@0.39.0` (patch)  
Source: [#3271](https://github.com/emdash-cms/emdash/pull/3271)

Fixes `emdash export-seed` changing the database it exports. The command now opens the source database read-only and stops with instructions to run `emdash migrate` when its schema is outdated, instead of applying pending migrations during an export.

### Change 353

Applies to: `emdash@0.39.0` (patch)  
Source: [#2776](https://github.com/emdash-cms/emdash/pull/2776)

Fixes `emdash export-seed --with-content` so `reference` field values survive a round trip through `emdash seed`. The export now names a reference's target by the seed id it assigns that entry, and writes a referenced collection before the collection pointing at it. Previously the export emitted the source database's row id, which the restored database does not carry: the literal `$ref:<row-id>` string was stored in the column, the restore reported success, and the reference was lost wherever it was rendered.

### Change 354

Applies to: `emdash@0.39.0` (patch)  
Source: [#2776](https://github.com/emdash-cms/emdash/pull/2776)

Fixes `emdash export-seed` so its progress line goes to stderr and kysely's `orderBy` deprecation notice is no longer triggered, allowing `emdash export-seed > seed.json` to write a file that parses as JSON. Previously the redirected file began with `ℹ Database: …` and `orderBy(array) is deprecated…`, the command still exited `0` with an empty stderr, and the corruption surfaced only when `emdash seed` rejected the file at restore time.

### Change 355

Applies to: `emdash@0.39.0` (patch)  
Source: [#3144](https://github.com/emdash-cms/emdash/pull/3144)

Fixes `menu_set_items` creating replacement items without a translation group and repairs existing affected items, so seed exports retain each item's localization identity.

### Change 356

Applies to: `emdash@0.39.0` (patch)  
Source: [#3248](https://github.com/emdash-cms/emdash/pull/3248)

Fixes registry plugins appearing in discovery but failing installation when their signed profiles predated repository metadata.

  Profiles without the optional repository extension permit releases without provenance. Manual publishing adds an available canonical HTTPS repository with optional provenance, preserves explicit profile policies on later releases, and refuses manual releases when the publisher requires provenance. EmDash routes installation verification correctly and shows site administrators actionable publisher guidance when signed records fail verification.

### Change 357

Applies to: `emdash@0.39.0` (patch)  
Source: [#2779](https://github.com/emdash-cms/emdash/pull/2779)

Fixes the image field type so a stored focal point is readable. `focalX` and `focalY` reach content entries but were missing from the generated collection types, so reading them from an image field was a type error. The dark-variant slot shares the media shape, so its focal point is readable on the same terms.

### Change 358

Applies to: `emdash@0.39.0` (patch)  
Source: [#3127](https://github.com/emdash-cms/emdash/pull/3127)

Fixes MCP write tools leaving cached pages stale on sites with Astro route caching enabled (for example `cacheCloudflare()`). A change made over MCP reached the database, but the cached page kept serving the old copy until its TTL expired. The tools now invalidate the same route-cache tags as the matching REST routes.

  #### Content tools

  `content_create`, `content_update`, `content_publish`, `content_unpublish`, `content_delete`, `content_restore`, `content_permanent_delete`, `content_schedule`, `content_unschedule`, `content_discard_draft` and `content_duplicate` invalidate the same tags as their REST routes.

  A `content_update` that only stages a draft invalidates nothing, as over REST. A `content_update` with a `status` still invalidates when its publish or unpublish step fails, if the update step already changed live content.

  #### Taxonomy, menu and settings tools

  `taxonomy_create`, `taxonomy_update`, `taxonomy_delete`, `taxonomy_create_term`, `taxonomy_update_term`, `taxonomy_delete_term`, `menu_create`, `menu_update`, `menu_delete`, `menu_set_items` and `settings_update` invalidate their taxonomy, menu or site-settings cache tags.

### Change 359

Applies to: `emdash@0.39.0` (patch)  
Source: [#3264](https://github.com/emdash-cms/emdash/pull/3264)

The MCP `taxonomy_update_term` and `taxonomy_delete_term` tools accept an optional `locale`, so a term whose translations share a slug can be edited or deleted in one language without touching the others. Without `locale`, the tools still act on the lowest matching locale, as before.

### Change 360

Applies to: `emdash@0.39.0` (patch)  
Source: [#3285](https://github.com/emdash-cms/emdash/pull/3285)

Exposes the existing media upload handler on authenticated Astro request locals, matching the published `EmDashHandlers` contract.

### Change 361

Applies to: `emdash@0.39.0` (patch)  
Source: [#3096](https://github.com/emdash-cms/emdash/pull/3096)

Fixes media usage tracking ignoring images inside Portable Text gallery blocks. A media item used only in galleries showed an empty "Used in" list and looked unused; gallery images are now indexed as `portable_text_image` references with a field path into the gallery (`body[3].images[0].asset._ref`). Indexes written before this fix are now reported as stale rather than complete, so gallery-only media no longer looks safe to delete until those indexes are rebuilt.

### Change 362

Applies to: `emdash@0.39.0` (patch)  
Source: [#3230](https://github.com/emdash-cms/emdash/pull/3230)

Fixes the `QueryOptions.limit` type comment to match the documented and enforced maximum of 100 rows. Plugin storage queries were already clamped at 100; the previous comment incorrectly stated 1000.

### Change 363

Applies to: `emdash@0.39.0` (patch)  
Source: [#3158](https://github.com/emdash-cms/emdash/pull/3158)

Fixes permanently deleting an entry leaving its byline credits in the database, where a seed that re-creates a slugless entry under the same ID picked them up. Credits left behind by entries deleted before this release are not removed.

### Change 364

Applies to: `emdash@0.39.0` (patch)  
Source: [#3180](https://github.com/emdash-cms/emdash/pull/3180)

Fixes repeat 404 hits unnecessarily running row-cap maintenance when consecutive requests share the same timestamp.

### Change 365

Applies to: `emdash@0.39.0` (patch)  
Source: [#3285](https://github.com/emdash-cms/emdash/pull/3285)

Restores the existing OpenAPI, relation-definition, and content-reference HTTP endpoints in generated Astro sites. These handlers were shipped in the package but omitted from route injection, so requests returned Astro's generic `404 Not Found` instead of reaching the API.

### Change 366

Applies to: `emdash@0.39.0` (patch)  
Source: [#3152](https://github.com/emdash-cms/emdash/pull/3152)

Fixes standard sandboxed plugins so lifecycle, content, media, comment, email, cron, and page metadata hooks run through the same ordered, capability-gated host pipeline as trusted plugins on Cloudflare Workers and Node.js.

  Sandbox contexts now expose canonical capabilities, database-backed `ctx.cron`, complete content metadata and filtering, and a real `Response` shape from `ctx.http.fetch()`. Cloudflare response bodies still cross the bridge as text. Admin-managed settings now share the `ctx.kv` settings namespace, lifecycle hooks run once at the correct install/enable boundary, and uninstall cleanup runs before plugin data or bundles are removed.

  Plugin builds also preserve hook, route permission and cache, MCP, settings, and field-widget metadata in registry bundles and npm descriptors.

### Change 367

Applies to: `emdash@0.39.0` (patch)  
Source: [#3068](https://github.com/emdash-cms/emdash/pull/3068)

Reduces duplicate database reads when widget areas render while layout prefetch is still running on remote database adapters.

### Change 368

Applies to: `emdash@0.39.0` (patch)  
Source: [#3285](https://github.com/emdash-cms/emdash/pull/3285)

Fixes registry and marketplace installation failing after the plugin bundle and state were written because the request runtime did not expose plugin lifecycle hooks. Failed plugin updates now restore the previous state, remove the failed bundle, and reactivate the previous version after resynchronizing the runtime. Registry update and uninstall requests are also registered in generated Astro sites instead of returning `404 Not Found`.

  Registry consent now uses a neutral summary when a release has no build provenance, keeps record identifiers and publisher-policy mechanics under collapsed technical details, and shows the requested permission count with a scroll cue for longer lists.

### Change 369

Applies to: `emdash@0.39.0` (patch)  
Source: [#3128](https://github.com/emdash-cms/emdash/pull/3128)

Fixes pages failing with `TypeError: Cannot read properties of undefined (reading 'set')` when a preview link, an `_edit` link or a signed-in editor reaches a response Astro renders without a route-cache handle, such as the 404 page for a URL that matches no route. EmDash's middleware now skips the route-cache opt-out when there is no cache handle instead of throwing.

### Change 370

Applies to: `emdash@0.39.0` (patch)  
Source: [#3162](https://github.com/emdash-cms/emdash/pull/3162)

Fixes ISO date-time plugin schedules being treated as recurring tasks when the cron parser accepts the timestamp. A successful one-shot task is now removed after it runs.

### Change 371

Applies to: `emdash@0.39.0` (patch)  
Source: [#3235](https://github.com/emdash-cms/emdash/pull/3235)

The search API now resolves the signed-in session, so `status=draft` queries return draft content for users with the required permission instead of silently falling back to published results. Anonymous requests are unaffected.

### Change 372

Applies to: `emdash@0.39.0` (patch)  
Source: [#3274](https://github.com/emdash-cms/emdash/pull/3274)

Fixes seed application overwriting admin-managed site settings. The default `skip` mode preserves existing settings such as `site:title` and `site:tagline` while filling in missing settings; use `update` to overwrite supplied settings or `error` to stop at the first conflict.

### Change 373

Applies to: `emdash@0.39.0` (patch)  
Source: [#3236](https://github.com/emdash-cms/emdash/pull/3236)

Adds a disposable R2 bucket to `emdashPluginTest()` so sandbox plugin tests can exercise `ctx.media.upload()` and `ctx.media.delete()` through the same Worker Loader bridge used in production.

  Fixes registry installation rejecting sandbox plugins whose manifests declare `content.publish`, `content.restore`, or `content.policy` access. These permissions now survive bundle-manifest validation and reach the normal installation consent checks.

### Change 374

Applies to: `emdash@0.39.0` (patch)  
Source: [#3221](https://github.com/emdash-cms/emdash/pull/3221)

Fixes 404 logging to enforce the `MAX_404_LOG_ROWS` cap only when a new unique path is inserted. Repeat hits now skip the full-table `COUNT(*)`, significantly reducing D1 row reads for sites that serve many repeated 404s.

### Change 375

Applies to: `emdash@0.39.0` (patch)  
Source: [#3238](https://github.com/emdash-cms/emdash/pull/3238)

Fix 404 logging on PostgreSQL. Recording a missed path failed with `column reference "hits" is ambiguous`, so the 404 log stayed empty and hit counts never incremented on Postgres. The 404 Errors tab and its hit counters now populate correctly.

### Change 376

Applies to: `emdash@0.39.0` (patch)  
Source: [#3290](https://github.com/emdash-cms/emdash/pull/3290)

Fixes API tokens scoped only to `settings:read` or `settings:manage` being accepted by the backup routes under `/_emdash/api/settings/backups`, including the full-site export. An API token now needs the `admin` scope to use any backup route; other tokens get a 403. Session sign-ins are unaffected.

  JSON backups also no longer include `emdash:site_url`, the deployment URL recorded at setup. Site settings, title, tagline, and locale are still included.

### Change 377

Applies to: `emdash@0.39.0` (patch)  
Source: [#3157](https://github.com/emdash-cms/emdash/pull/3157)

Fixes entries going live again after they were unpublished or restored from Trash.

  Unpublishing an entry cancels its pending schedule, so scheduled publishing no longer republishes it when the old time arrives. Restoring an entry from Trash returns it as a draft with no schedule, whatever its status was when it was trashed: a published entry is no longer public again the moment it is restored, and a schedule is dropped whether or not it has come due. This applies to **Restore** in the admin, `POST /_emdash/api/content/{collection}/{id}/restore`, the `content_restore` MCP tool, `emdash content restore`, and `EmDashClient.restore()`. Scripts and agents that restore an entry and expect it to be live must publish or schedule it afterwards. `content:afterRestore` hooks receive the entry with `status: "draft"`.

### Change 378

Applies to: `emdash@0.39.0` (patch)  
Source: [#3205](https://github.com/emdash-cms/emdash/pull/3205)

Fixes the content editor reporting a failed save with the field's slug and the validator's wording, such as `excerpt: Too big: expected string to have <=160 characters`. When a save, autosave, new entry or new translation fails field validation, the error toast now names each field by the label the editor shows and says what the field needs, for example "Summary can have at most 160 characters."

### Change 379

Applies to: `emdash@0.38.0` (minor)  
Source: [#3062](https://github.com/emdash-cms/emdash/pull/3062)

Adds a `group` setting to collections. Collections that share a group render as one collapsible folder in the admin sidebar, positioned where the first of them appears; a taxonomy joins the folder when every collection it is assigned to is shown in that folder. A folder you have not touched opens while one of its members is active; once you open or close it yourself, the sidebar remembers that choice in the browser. Set the group in the content type editor under Navigation, in seed files, or through the schema API and the MCP collection tools; leaving it empty keeps today's flat list.

### Change 380

Applies to: `emdash@0.38.0` (minor)  
Source: [#1963](https://github.com/emdash-cms/emdash/pull/1963)

`<EmDashHead>` now applies the entry's SEO panel values (title, description, image, canonical, noindex) automatically on server-rendered content pages. Previously the panel was silently ignored unless the page wired `getSeoMeta()` by hand.

  #### Affected pages

  Pages that include `<EmDashHead>` and fetch their entry through `getEmDashEntry()` receive the overlay. This includes warm object-cache hits, because `getEmDashEntry()` primes the same request-scoped cache from the cached snapshot when the loader never runs. Multi-entry collection results (e.g. `getEmDashCollection()`) are not currently covered.

  #### What editors can override

  Editor-set panel values replace the template-provided base fields for `description`, `og:title`, `og:description`, `og:image`, the canonical URL, and robots. They also feed the JSON-LD structured data, so head tags and structured data stay in sync.

  #### What plugins see

  Plugin `page:metadata` and `page:fragments` hooks — in the head and in the body components — receive the overlaid page context, but plugin contributions still win via first-wins dedup.

  #### What does not change
  - The `<title>` element remains the template's responsibility.
  - Prerendered pages and pages that bypass `<EmDashHead>` keep using `getSeoMeta()`.
  - No additional database query is made; the panel data rides along on the entry query the page already runs.

  #### Canonical and image URL resolution

  `getSeoMeta()` now resolves an explicit SEO panel canonical through the same resolver as `<EmDashHead>`: root-relative values (`/custom-path`) are absolutized against the site URL when one is configured (previously they were returned unchanged), and protocol-relative values (`//host/path`) pass through untouched. The same panel value now produces the same canonical URL on both paths.

  Protocol-relative SEO image references (`//cdn.example.com/x.png`) are no longer prefixed with the site URL, which previously produced a broken doubled-path URL. This corrects `og:image` output everywhere the panel image is resolved: the `<EmDashHead>` overlay, `getSeoMeta()`, and image URLs in the sitemap.

### Change 381

Applies to: `emdash@0.38.0` (minor)  
Source: [#2919](https://github.com/emdash-cms/emdash/pull/2919)

Adds an edit lock per content entry, so two people no longer discover a collision only after both have done the work.

  Opening an entry in the admin takes a lock on it. A second editor is told who has it and chooses between opening the entry read-only, where nothing they type can be lost to a refused save, and taking it over. After a take-over, the previous holder is told within two minutes that the entry moved on, their next save is refused, and a banner names who holds it now.

  The lock lasts seven minutes. The admin renews it every two minutes while the entry is open, so a pause in typing does not lose it, and every save on the entry extends it too. Leaving the editor or closing the tab releases it, as does moving the entry to the trash; a tab that loses power or network lets it lapse.

  #### Who is newly refused

  Scripts, API tokens and the CLI that update, delete, publish, unpublish, schedule or discard an entry while an editor has it open in the admin now receive `409 ENTRY_LOCKED` where the write used to succeed. This applies to every collection once the migration has run. The response's `error.message` names the holder and `error.details` carries their `userId`, `userName`, `acquiredAt` and `expiresAt`. Pass `"overrideLock": true` in the request body to write anyway, or `?overrideLock=true` on `DELETE`, which has no body. The CLI takes `--override-lock` on `content update`, `content delete`, `content publish`, `content unpublish` and `content schedule`. The MCP content tools do not honour the lock yet.

  Locks are per entry and per locale, so two translations of the same entry can be edited at once.

  Take or read a lock directly through `GET`, `POST` and `DELETE` on `/_emdash/api/content/{collection}/{id}/lock`.

  #### Turning it off

  Locking is on for every collection. Switch it off under **Content Types** → your collection → **Edit locking**, with `editLocking: false` in a seed file, or through `schema_update_collection`:

  ```json
  { "slug": "posts", "editLocking": false }
  ```

  #### Upgrading

  Includes database migration `075_entry_edit_locks`. Projects on the default `auto` runtime migration mode need no action. Projects that migrate as a deployment step: run `emdash migrate` before deploying this version.

### Change 382

Applies to: `emdash@0.38.0` (minor)  
Source: [#1526](https://github.com/emdash-cms/emdash/pull/1526)

Adds WordPress-style date tokens to collection URL patterns. `url_pattern` now supports `{year}`, `{month}`, `{day}`, `{hour}`, `{minute}`, `{second}` (resolved from the entry's publish date, zero-padded) alongside `{slug}` and `{id}` — so you can reproduce permalinks like `/{year}/{month}/{day}/{slug}.html`. The tokens resolve everywhere the pattern is used: sitemap canonical URLs, hreflang alternates, navigation menu links, slug-change auto-redirects, and the admin's preview and "View published" links. Tokens stay literal when an entry has no publish date, so canonical URLs remain stable across edits.

### Change 383

Applies to: `emdash@0.38.0` (minor)  
Source: [#2169](https://github.com/emdash-cms/emdash/pull/2169)

Adds `ctx.storage.<collection>.updateIf(id, { where, set?, delta? })` for atomic conditional updates to existing plugin documents. Use `where` to check stored fields, `set` to replace field values, and `delta` to increment or decrement integer counters. The method returns `{ applied: true, data }` with the updated document, or `{ applied: false }` when the document is absent or the condition fails. It never inserts a document.

  Malformed update arguments reject without writing. Deltas require safe integer operands and results; missing or `null` counters start at `0`. Invalid stored counters, overflow, and non-object documents return `{ applied: false }` without changing any fields.

  Available to native plugins and sandboxed plugins on Cloudflare and Workerd, with SQLite, D1, and PostgreSQL support. PostgreSQL serialization failures and deadlocks expose `code: "STORAGE_SERIALIZATION_FAILURE"` and `retryable: true`, including across sandbox transports. Retry standalone calls with bounded backoff, or restart the entire explicit transaction.

### Change 384

Applies to: `emdash@0.38.0` (minor)  
Source: [#2934](https://github.com/emdash-cms/emdash/pull/2934)

Adds responsive, lossless Portable Text tables with an accessible size picker, complete row and column controls, merge and split, persistent column widths, HTML and spreadsheet clipboard support, keyboard navigation, and right-to-left resizing. Wide tables keep their horizontal position while resizing, hide native scrollbar chrome, and show edge shadows for hidden columns.

  Use the compact, scrollable Table menu for structural actions, or press Backspace or Delete to remove selected full rows or columns. Undo restores the removed content and structure.

  The editor toolbar no longer includes Spotlight Mode, leaving more room for table controls at the standard editor width.

  The public renderer now preserves table headers, spans, alignment, and preferred widths. Existing legacy string-cell tables continue to render. `portableTextToProsemirror()` now returns real `table`, `tableRow`, `tableHeader`, and `tableCell` nodes, so custom ProseMirror schemas that consume its output must register the existing TipTap table extensions.

  Pass a localized `tablePlaceholder` string to `PortableText` to set the inline editor's initial table label. Omitted values retain the English label.

### Change 385

Applies to: `emdash@0.38.0` (minor)  
Source: [#3041](https://github.com/emdash-cms/emdash/pull/3041)

Adds the cause to the `SANDBOX_NOT_AVAILABLE` error and to the "Plugin sandbox is configured but not available on this platform" startup warning when a configured sandbox runner cannot run plugins. On Cloudflare Workers the message names the missing `worker_loaders` binding or `PluginBridge` export; on Node.js it says that the `workerd` binary did not run.

  Sandbox runners report the cause through a new optional `unavailableReason()` method on `SandboxRunner`. Runners without it keep the previous messages.

### Change 386

Applies to: `emdash@0.38.0` (minor)  
Source: [#2980](https://github.com/emdash-cms/emdash/pull/2980)

Adds `getVersioned`, `compareAndSet` and `compareAndDelete` to plugin storage collections and `ctx.kv`. Native and sandboxed plugins can create an absent key or condition a replacement or deletion on the revision they read, preventing concurrent requests from silently overwriting each other.

  Pass an explicit `null` revision to create only when absent. A successful replacement returns its new revision; a conflict returns `{ applied: false }`. Invalid input, permission failures and database failures reject the promise. Atomicity applies to one key, so changes spanning multiple records still require an application-level protocol.

  Update core and the sandbox adapter together and apply the host database migrations before using the methods. The migration initializes existing records without a backfill. Stored values are preserved, and existing unconditional writes continue to work while invalidating old revisions. Conditional keys are limited to 1,024 JavaScript string characters and values to 1 MiB of UTF-8 JSON.

### Change 387

Applies to: `emdash@0.38.0` (patch)  
Source: [#3057](https://github.com/emdash-cms/emdash/pull/3057)

Fixes content attribution for authenticated REST, visual editing, and MCP saves.

  - Revisions record the acting user without changing the entry owner. MCP updates preserve the existing owner, and actorless internal writes leave revision attribution unset instead of inferring it from ownership.
  - `content:beforeSave` and `content:afterSave` receive an actor snapshot with the authenticated user's `id` and `role`. The snapshot is isolated between hooks so one plugin cannot change the attribution seen by another.
  - The audit-log plugin stores the actor ID as `userId` on content create and update entries.

### Change 388

Applies to: `emdash@0.38.0` (patch)  
Source: [#3026](https://github.com/emdash-cms/emdash/pull/3026)

Fixes snapshot exports and content backups on PostgreSQL so preview snapshots, manual backups, and scheduled backups include the same content and portable schema metadata as SQLite.

### Change 389

Applies to: `emdash@0.38.0` (patch)  
Source: [#3075](https://github.com/emdash-cms/emdash/pull/3075)

Fixes overlapping marketplace or registry plugin updates and downgrades deleting the active plugin bundle. Updates retain previous version bundles so delayed work cannot remove a version that becomes active again.

### Change 390

Applies to: `emdash@0.38.0` (patch)  
Source: [#3078](https://github.com/emdash-cms/emdash/pull/3078)

Adds a fail-closed first-release exemption to the plugin registry's optional minimum release age policy. A package's first release can install immediately only when the aggregator reports exactly one retained release and confirms that it continuously observed the package's release history.

  Existing packages, backfilled packages, and packages with missing or incomplete history remain subject to the configured holdback. Deleted releases still count, and explicit publisher or package exemptions continue to work.

### Change 391

Applies to: `emdash@0.38.0` (patch)  
Source: [#3105](https://github.com/emdash-cms/emdash/pull/3105)

Fixes Cloudflare-backed Astro development servers hanging during initial setup or the first admin request.

### Change 392

Applies to: `emdash@0.38.0` (patch)  
Source: [#3103](https://github.com/emdash-cms/emdash/pull/3103)

Fixes the Portable Text `Gallery` component telling browsers each image fills the viewport. Its `sizes` attribute now describes one grid cell, using the gallery's column count and its two-column layout at 640px and below, so browsers stop downloading oversized images for multi-column galleries. Pass the new `sizes` prop to `Gallery` when it renders in a container narrower than the viewport.

### Change 393

Applies to: `emdash@0.38.0` (patch)  
Source: [#3074](https://github.com/emdash-cms/emdash/pull/3074)

Fixes visual editing saving a new draft when nothing changed. With edit mode on, the inline Portable Text editor saved the body every time focus left it and every time the page was left, even if no one had typed, because each save check compared freshly generated block keys against the stored ones. Entries picked up drafts that differed only in `_key` and showed "Pending changes" in the admin. The editor now compares its document with the one last saved, so an unedited body is never saved and a real edit is saved once.

### Change 394

Applies to: `emdash@0.38.0` (patch)  
Source: [#3090](https://github.com/emdash-cms/emdash/pull/3090)

Fixes non-translatable fields never reaching an entry's other translations on collections with revisions, which is the default. Publishing an entry now copies the non-translatable values it changed to the rest of its translation group, and a save that started from a translation's earlier version gets a conflict instead of overwriting the copied values. Values that already differ between translations stay as they are until a change to that field is published in one of them.

### Change 395

Applies to: `emdash@0.38.0` (patch)  
Source: [#2970](https://github.com/emdash-cms/emdash/pull/2970)

Fixes visual editing on list pages. Entries from `getEmDashCollection` now carry a working `edit` proxy in edit mode, so spreading `{...entry.edit.title}` renders the annotation and the toolbar makes the element editable. Previously every collection entry received a no-op proxy in every mode, so only pages built from `getEmDashEntry` were click-to-edit — fields shown exclusively in a list, and collections with no detail page, could not be edited on the page at all.

### Change 396

Applies to: `emdash@0.38.0` (patch)  
Source: [#3050](https://github.com/emdash-cms/emdash/pull/3050)

Fixes plugin HTTP requests with `allowedHosts` so initial URLs and redirects also pass SSRF validation. Requests are rejected when URL or DNS validation identifies an unsupported scheme or a non-public address.

  Existing callers of the shared outbound URL validator also reject these non-public ranges.

  The default validator resolves public hostnames through `cloudflare-dns.com` before dispatch. Self-hosted deployments must permit access to that endpoint when using the default resolver.

### Change 397

Applies to: `emdash@0.38.0` (patch)  
Source: [#2169](https://github.com/emdash-cms/emdash/pull/2169)

Fixes a plugin storage range filter whose every bound is `undefined` matching every row instead of failing. Building a bound from an optional value — `where: { stock: { gte: minStock } }` where `minStock` is `undefined` — type-checks, but contributed no SQL, so `query()` and `count()` returned the whole collection and `updateIf()` applied its write with no guard at all. A guarded decrement could then drive a counter past the bound the caller asked for.

  Such a filter now throws `StorageQueryError` naming the field. Pass a defined bound, or omit the field when you mean to match unconditionally:

  ```typescript
  const where = minStock === undefined ? {} : { stock: { gte: minStock } };
  await ctx.storage.products.query({ where });
  ```

### Change 398

Applies to: `emdash@0.38.0` (patch)  
Source: [#3091](https://github.com/emdash-cms/emdash/pull/3091)

Fixes permanently deleting an entry leaving its taxonomy term assignments in the database. The assignments are removed with the last translation of the entry and kept while another translation exists, including one in the trash.

### Change 399

Applies to: `emdash@0.38.0` (patch)  
Source: [#2351](https://github.com/emdash-cms/emdash/pull/2351)

New Cloudflare projects leave the paid-plan Worker Loader binding disabled so they can deploy on the Workers free plan. Enable sandboxed plugins in the scaffold prompt or with `--sandboxed-plugins`.

  The Cloudflare `sandbox()` helper now selects the runner from the `LOADER` binding in `wrangler.jsonc`, including the named environment selected with `CLOUDFLARE_ENV`. Without it, config-based sandboxed plugins do not load and marketplace or registry installs return `SANDBOX_NOT_AVAILABLE`, while browsing remains available.

### Change 400

Applies to: `emdash@0.38.0` (patch)  
Source: [#3076](https://github.com/emdash-cms/emdash/pull/3076)

Fixes marketplace plugin updates so administrators review newly requested capabilities, public routes, and MCP tools before granting them. Update confirmation remains pinned to the version that was reviewed, so a newer release requires a separate review.

### Change 401

Applies to: `emdash@0.38.0` (patch)  
Source: [#3077](https://github.com/emdash-cms/emdash/pull/3077)

Fixes invalid plugin registry settings causing the admin manifest to fail with a generic server error. EmDash reports malformed `experimental.registry` fields while Astro loads the site configuration. If invalid registry settings reach the runtime, the admin remains available and shows which field to correct in `astro.config.mjs`.

### Change 402

Applies to: `emdash@0.38.0` (patch)  
Source: [#2043](https://github.com/emdash-cms/emdash/pull/2043)

Taxonomy term counting no longer sends queries against declared collections that were never created, eliminating the phantom `no such table: ec_posts` database error logs that sites without a `posts` collection produced on every uncached taxonomy render. On multi-isolate deployments, term counts now pick up a collection created or deleted on another isolate within about a minute instead of immediately; the write-handling isolate reflects it at once.

### Change 403

Applies to: `emdash@0.38.0` (patch)  
Source: [#3101](https://github.com/emdash-cms/emdash/pull/3101)

Fixes taxonomy and menu translations being accepted under a different name than their source. Creating a taxonomy or a menu with `translationOf` through the REST API or the MCP `taxonomy_create` and `menu_create` tools now returns a validation error unless `name` matches the source.

### Change 404

Applies to: `emdash@0.38.0` (patch)  
Source: [#3092](https://github.com/emdash-cms/emdash/pull/3092)

Fix stale revision tokens after unpublish, discard, and revision restore.

  The admin editor now reads the new `_rev` returned by unpublish, discard-draft, and revision-restore responses and advances its optimistic-concurrency token before the next save. Unpublish also flushes pending editor changes before sending the request, matching the ordering already used for publish, schedule, and publication-date changes, and it now catches the promise rejection when the action is blocked by invalid fields or a click while another publishing action is already in progress. This prevents subsequent autosaves or publish actions from being refused as a 409 conflict, stops unpublished posts from overwriting unsaved edits, and avoids unhandled promise rejections from the unpublish button.

### Change 405

Applies to: `emdash@0.38.0` (patch)  
Source: [#2934](https://github.com/emdash-cms/emdash/pull/2934)

Fixes entries in wide collections failing to load on Cloudflare D1 with a "too many columns in result set" error.

## Agent skills

The updater ran:

```sh
npx --yes skills@1.7.0 add emdash-cms/skills -y
```

Use the refreshed `upgrading-emdash` skill for this work order. If the skills command reported a conflict or failure, resolve that before continuing.

## Core database migrations

Installed EmDash changed from `0.37.0` to `1.3.1`.

The target package adds these core migrations:

- `075_entry_edit_locks`
- `076_collection_nav_group`
- `077_plugin_storage_revisions`
- `078_menu_item_translation_groups`
- `079_datetime_normalization`
- `080_content_translation_locale_unique`
- `081_redirect_write_guards`
- `082_taxonomy_translation_locale_unique`
- `083_block_types`
- `084_site_transfer`
- `085_taxonomy_def_groups`
- `086_relations_structural`
- `087_reference_field_relations`
- `088_cron_oneshot_utc`
- `089_auto_seed_completion`
- `090_redirect_enable_loop_guard`
- `091_redirect_artifacts`

Do not apply migrations until the application changes compile and the target build has generated `.emdash/migrations.json`. Before starting or deploying the upgraded build, follow [Backups and recovery](https://docs.emdashcms.com/guides/backups/) to create a restorable database backup, back up media storage separately, and retain the `EMDASH_ENCRYPTION_KEY` rotation list. A JSON backup is not a recovery point. Apply migrations from the same build artifact that will be deployed.

Build the upgraded project and inspect the exact database target:

```sh
pnpm build
pnpm exec emdash migrate --status
```

After a human has reviewed the target and backup, apply pending migrations:

```sh
pnpm exec emdash migrate
```

The command shows the target and asks for confirmation. In a non-interactive shell, add `--expected-target-fingerprint` with the target fingerprint that the status command printed for the reviewed database.

Deploy the same build artifact with the project's deployment workflow, without rebuilding it. On Cloudflare Workers, run `wrangler deploy`.

Verify the deployed database against that artifact:

```sh
pnpm exec emdash migrate --check
```

Do not run migration `down()` functions or delete migration records to roll back. Restore the matching pre-migration database, media, keys, and application artifact together if recovery is required.

## Verification

1. Assess every release entry above and make the project changes it requires.
2. Run the project's format, tests, typecheck, and build commands.
3. Inspect the migration target and pending names before applying them.
4. Verify the public site, admin sign-in, content editing, media reads, and encrypted plugin settings after deployment.

## Project review — 2026-10-20

- Prepared with `pnpm dlx upgrade-emdash@latest --yes`, starting from the installed 0.37.0 packages. The updater completed dependency installation and refreshed all six EmDash skills and `skills-lock.json`.
- Reviewed the release entries against this project's Astro/Cloudflare configuration, public content pages, comments, Portable Text rendering, seed, forms, and webhook notifier. No additional application-code changes are required: the project already uses `cacheCloudflare()`, imports comments from `emdash/ui/comments`, uses public entrypoints, sets `siteUrl`, and runs Astro 7. It has no custom plugins, removed CLI commands in package scripts, custom editor schema, reference fields in the seed, or `experimental.registry` configuration requiring conversion.
- The worker restoration is a separate commit, `cdc3ca7`, already pushed. The hourly Wrangler trigger remains configured.
- `pnpm build` passed. `pnpm typecheck` passed for 19 files with 0 errors, 0 warnings, and 0 hints. The build reports an advisory about large chunks.
- Production D1 `blog-db` (`d2532d85-3a96-4802-9873-b2e8a2f568a8`) in account `a0cb4de7c997830a6d8683184ce058f0` successfully applied all 17 migrations, 075–091, using the verified EmDash 1.3.1 build manifest. The apply report has no pending or unknown migrations.
- The independent post-migration `pnpm exec emdash migrate --check --json` completed successfully: all 90 known migrations are applied, with no pending or unknown migrations.
- Reviewed target fingerprint: `6655fe88f64f3fceb94bb97e490284cdc6f4ab0ea8012653c3c9c96701b82046`.
- The user explicitly authorized production migration and instructed that no backup be created. No additional database, media, or key backup was performed for this migration, overriding the backup procedure above. The previous D1 SQL export failed because the database contains FTS5 virtual tables; it is not a backup.
- Upgrade submission follows the completed migration. No manual deployment is performed; deployment remains with the existing Git-triggered workflow. Public/admin/editing/media checks remain for after deployment.
