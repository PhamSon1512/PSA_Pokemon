# Changelog

All notable changes to this project will be documented in this file. See [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) for commit guidelines.

## [1.7.0](https://github.com/vunamhung/cms-fullstack/compare/v1.6.0...v1.7.0) (2026-03-21)


### Features

* Add .nvmrc file with Node version 22 ([0522bab](https://github.com/vunamhung/cms-fullstack/commit/0522bab9290c382bd39c91e1836213cd56cb6eb2))
* Add JWT token issuance and refresh token persistence ([392ad27](https://github.com/vunamhung/cms-fullstack/commit/392ad27d08ae77824ef94aed392f6d18d0fdefd3))
* **agents:** remove test workflow file ([c4b5680](https://github.com/vunamhung/cms-fullstack/commit/c4b5680ea2879ade13b6be8162c6c3c08e0eea0d))
* **api:** refactor media route to separate batch delete functionality ([e25081a](https://github.com/vunamhung/cms-fullstack/commit/e25081a1f31a4d8a5bf20a4ab889e4fda1b1c71e))
* **GEMINI.md:** Add rule for using .as() with raw SQL in subqueries ([c03ee78](https://github.com/vunamhung/cms-fullstack/commit/c03ee78dc07f10d7e0b61a40810498814f887310))
* **husky:** add pre-push script to mirror main branch and tags to winvuvn ([810416b](https://github.com/vunamhung/cms-fullstack/commit/810416b3c84101a45afd888e370bf13840899ebc))
* Improve query performance by changing the way data is fetched ([ae35fea](https://github.com/vunamhung/cms-fullstack/commit/ae35fea08e22191129c50b118cdc814675433bd2))
* Index project in GitNexus for code intelligence ([2821aeb](https://github.com/vunamhung/cms-fullstack/commit/2821aeb40aa03d084efc1e68f2ac209ada544006))
* **rbac:** Update roles and permissions ([50470b3](https://github.com/vunamhung/cms-fullstack/commit/50470b3922352c613842713c212fb5aa11a57840))
* Remove inline DB query helpers ([954d095](https://github.com/vunamhung/cms-fullstack/commit/954d095099b8e57fefeecd2b7b22b1e0fe750a50))
* Remove vitest.config.ts and use vitest.config.mts for root configuration ([1758016](https://github.com/vunamhung/cms-fullstack/commit/1758016da86daafa30546bfe9ef7397c171baee7))
* **server:** add buildPatch helper function ([fb74650](https://github.com/vunamhung/cms-fullstack/commit/fb7465088224a367c671b3a454c57b4fac99817e))
* Update README.md with information on GitNexus indexing ([4b5fe98](https://github.com/vunamhung/cms-fullstack/commit/4b5fe989e181b108352c00006f53e90d556727c2))
* **utils:** Add unit tests for utility functions ([05a8d71](https://github.com/vunamhung/cms-fullstack/commit/05a8d71489840df6d865505b1dbb6059acc1bd88))


### Bug Fixes

* **openapi:** change method and path for batchDeleteMediaRoute ([afbaf7d](https://github.com/vunamhung/cms-fullstack/commit/afbaf7dd0194bf0d8aa47f8610a58ccef25c652b))
* remove baseURL configuration from xior.create() calls ([d540379](https://github.com/vunamhung/cms-fullstack/commit/d540379068c6adaf86dbcdeb34cacdb75e93d4d9))

## [1.6.0](https://github.com/vunamhung/cms-fullstack/compare/v1.5.0...v1.6.0) (2026-03-17)

### Features

- **gemini:** add mandatory rules for GitNexus index ([57168e9](https://github.com/vunamhung/cms-fullstack/commit/57168e9dd41fb95032a1da1a120b33257e359391))
- Update README with detailed project overview and structure ([9aa163b](https://github.com/vunamhung/cms-fullstack/commit/9aa163b8c9ea12f03ec89d9250287e1382e7b9e0))

## 1.5.0 (2026-03-17)

### Features

- Add GitNexus CLI Commands ([eae83d6](https://github.com/vunamhung/cms-fullstack/commit/eae83d6547c05af57f4f56485de7db02d8ee5aad))
- Add hono v4.12.8 and slugify v1.6.8 to dependencies ([c80c51b](https://github.com/vunamhung/cms-fullstack/commit/c80c51b6b2d22b7c0a6bdc811634e62ecee90303))
- Add new post types and fields to the post model ([04868d2](https://github.com/vunamhung/cms-fullstack/commit/04868d2994b71d640742dfdbfbf7e7014f256156))
- Add setup-wrangler script for creating Cloudflare resources ([418a835](https://github.com/vunamhung/cms-fullstack/commit/418a83538bbd552fde2a96e2cf26aa039c01c19f))
- Add toast notifications when creating and updating users ([e8c2534](https://github.com/vunamhung/cms-fullstack/commit/e8c25349b455a385e2446021ccf1a1ed1959bc87))
- **agent-workflows:** Add agent workflows for various roles ([c40a8c7](https://github.com/vunamhung/cms-fullstack/commit/c40a8c76252f9a983f57fc7aa2fbc01735809b39))
- **api+/media:** Add requireAuthSession to handle user authentication and update uploadedBy field in uploadMedia function ([d4c405a](https://github.com/vunamhung/cms-fullstack/commit/d4c405a7657fea1b6b342d71c72b154e55875665))
- **api+/media:** enforce 50 MB file size limit to prevent oversized uploads ([b7e9cf3](https://github.com/vunamhung/cms-fullstack/commit/b7e9cf3cf0a911ec5f94dc8f08885242ed936a6b))
- **api:** add endpoint to delete admin permissions ([bcd1d33](https://github.com/vunamhung/cms-fullstack/commit/bcd1d332cafca4e80e5c4315f5ac3c0ba6e757eb))
- **auth:** refactor auth service to use separate password module ([8c6f6d5](https://github.com/vunamhung/cms-fullstack/commit/8c6f6d5607fd427dda0a392aeda2ae84e294928d))
- Integrate createId function from '@paralleldrive/cuid2' library ([2b20e00](https://github.com/vunamhung/cms-fullstack/commit/2b20e001e2083b48d611ae691f0be2eba0f088c1))
- **openapi:** update path param for role-permission revoke ([c31e30b](https://github.com/vunamhung/cms-fullstack/commit/c31e30b2f73b3eccf05879971aa4ba0f63d39b6d))
- **pages:** refactor import paths in \_index.tsx ([03fc14f](https://github.com/vunamhung/cms-fullstack/commit/03fc14f112ed50281dd4c0f1f1373c5d05d1f132))
- **server:** update post service to use featuredImageId instead of featuredImage ([6b696c4](https://github.com/vunamhung/cms-fullstack/commit/6b696c4146097fc39120035d0a8edbe2151250d6))
- **service:** Add tag service ([8aee80f](https://github.com/vunamhung/cms-fullstack/commit/8aee80f6826f8761731458ca66db0b12966e087f))
- **session:** import Hono's generateCookie helper for building cookies ([4a9bb17](https://github.com/vunamhung/cms-fullstack/commit/4a9bb175a7d99804bcbddf7ce793398aeb668618))
- **ui-ux-pro-max:** Add UI/UX Pro Max Design Intelligence workflow ([a5f0609](https://github.com/vunamhung/cms-fullstack/commit/a5f060924c2cab687aece56156c487ec9ad63960))

### Bug Fixes

- Ensure unique slug validation outside the transaction ([b8c74b8](https://github.com/vunamhung/cms-fullstack/commit/b8c74b884c1e7b4f20ae97b60bdb421c132a3332))
- handle null user object in edit-user-dialog.tsx ([488806b](https://github.com/vunamhung/cms-fullstack/commit/488806bf1c95d69b542f713185bd56d6f0d52b7e))

## [1.4.0](https://github.com/vunamhung/react-router-vite-cfw-shadcn/compare/v1.3.0...v1.4.0) (2026-03-15)

### Features

- **husky:** Add pre-commit hook to run lint-staged ([6665368](https://github.com/vunamhung/react-router-vite-cfw-shadcn/commit/6665368212f5bdc9f5d361893a5724aee71785a5))

## [1.3.0](https://github.com/vunamhung/react-router-vite-cfw-shadcn/compare/v1.2.0...v1.3.0) (2026-03-15)

### Features

- Add environment variable validation ([2f3b352](https://github.com/vunamhung/react-router-vite-cfw-shadcn/commit/2f3b352112b7397418fe398d7a3279c20f928e9f))
- Add METHOD_COLORS import and update PermissionToggle styles ([d91f960](https://github.com/vunamhung/react-router-vite-cfw-shadcn/commit/d91f96015ac3c3feac91c7bce6270fa59aa7dd09))
- Add ThemeToggle component and integrate it in the UI ([9b58f78](https://github.com/vunamhung/react-router-vite-cfw-shadcn/commit/9b58f7899a2dc30e274f8a1b9b9b7fae6bcd1c8d))
- **admin-rbac:** add seed default roles and permissions ([b29548f](https://github.com/vunamhung/react-router-vite-cfw-shadcn/commit/b29548f883550da9a29ac041a0028cee4e1d6904))
- **admin:** add 'Media' navigation item in admin dashboard ([74da314](https://github.com/vunamhung/react-router-vite-cfw-shadcn/commit/74da314211162ac8d8d1117e3cfba49a8b23c6bc))
- **admin:** add handling for non-admin user access ([141b061](https://github.com/vunamhung/react-router-vite-cfw-shadcn/commit/141b0616d696a603d83cfb235a58a3337a9eb99b))
- **admin:** Add RBAC routes discovery and management ([e01978c](https://github.com/vunamhung/react-router-vite-cfw-shadcn/commit/e01978cdd2032bb34f225effdc24f7b26801d473))
- **admin:** refactor permissions table rendering ([ce62fa9](https://github.com/vunamhung/react-router-vite-cfw-shadcn/commit/ce62fa9b5d96e2db320f64fd39bf065049814607))
- **app:** update login page UI ([8a37df4](https://github.com/vunamhung/react-router-vite-cfw-shadcn/commit/8a37df4ae01ab264afc6137f63e13c9f1227b1f4))
- **http:** improve handling of 401 errors for non-auth endpoints ([6043ce4](https://github.com/vunamhung/react-router-vite-cfw-shadcn/commit/6043ce412d08cf01ab7100d988397b58e88c620e))
- **media:** Add Separator component to Media Detail Panel ([59cff48](https://github.com/vunamhung/react-router-vite-cfw-shadcn/commit/59cff48f218d1beff73a0c51a0e5dfbfa899b8c7))
- **rbac:** Add function to get inherited permission IDs ([08e0abc](https://github.com/vunamhung/react-router-vite-cfw-shadcn/commit/08e0abcb4280eda26d14d690394ad9fc0e7b632a))
- **rbac:** update method color classes and glow values ([cfabca0](https://github.com/vunamhung/react-router-vite-cfw-shadcn/commit/cfabca0501b28218f7cd53247580c357b88d6c40))
- **server:** auto-discover API routes from openapi files ([a2e89c7](https://github.com/vunamhung/react-router-vite-cfw-shadcn/commit/a2e89c764c5a7d4953b31588bd4a4f5c0a8cf3a5))
- Update `response.ts` to include `extraHeaders` in `ok` function ([5076d20](https://github.com/vunamhung/react-router-vite-cfw-shadcn/commit/5076d20ed056ea63d231de13368aa369e9252117))
- Update discover-routes.ts glob pattern in .server ([dcfa5d4](https://github.com/vunamhung/react-router-vite-cfw-shadcn/commit/dcfa5d471ca8b0f15c090050d985a25dccd934eb))
- Update role enum values and add new role "subscriber" ([b0c812d](https://github.com/vunamhung/react-router-vite-cfw-shadcn/commit/b0c812de84b266928914f0cab46ad69995866ce1))
- **users:** Add form validation for creating and editing users ([1e6ee38](https://github.com/vunamhung/react-router-vite-cfw-shadcn/commit/1e6ee3867fc6f4f2314a59b3055f6ebc40ad9703))
- **validators:** update error message handling ([c0abec0](https://github.com/vunamhung/react-router-vite-cfw-shadcn/commit/c0abec003a1b260deedbf3e8ec48cb0a466d87ec))

## [1.2.0](https://github.com/vunamhung/react-router-vite-cfw-shadcn/compare/v1.1.0...v1.2.0) (2026-03-15)

### Features

- **api:** update request body schema for media update ([9b0ef1e](https://github.com/vunamhung/react-router-vite-cfw-shadcn/commit/9b0ef1ebcc3c37e7443cb9512759f6bc751541c2))
- **app:** Update session management in session.ts ([bc8c1a0](https://github.com/vunamhung/react-router-vite-cfw-shadcn/commit/bc8c1a0211d5a8110692a2f99361ee9bf338f736))
- **openapi:** add openapi.ts for defining API response schemas and error responses ([6fddf38](https://github.com/vunamhung/react-router-vite-cfw-shadcn/commit/6fddf3840c9d437e6a3ed2572bd1197158332673))
- **openapi:** update zod import in openapi.ts ([40c9ee8](https://github.com/vunamhung/react-router-vite-cfw-shadcn/commit/40c9ee8cd3f3b733a06c6c15d5b691b9261b5c74))
- **server:** add HttpOnly flag to refresh token cookie ([58cccf3](https://github.com/vunamhung/react-router-vite-cfw-shadcn/commit/58cccf33d1b165a07db4e379888f9c7fe73bf414))
- **session:** refactor clearAuthCookies function ([f3f19fd](https://github.com/vunamhung/react-router-vite-cfw-shadcn/commit/f3f19fd83b9669df67cdc4e5040c5fff6a91782e))

### Bug Fixes

- **server:** update error code in internalError function ([09c87df](https://github.com/vunamhung/react-router-vite-cfw-shadcn/commit/09c87dfe7957adae878ef5bd998a2a3c1005579c))

## 1.1.0 (2026-03-14)

### Features

- Add compatibility flags for nodejs_compat in wrangler.jsonc ([d34ef7f](https://github.com/vunamhung/react-router-vite-cfw-shadcn/commit/d34ef7fea27bcaea79027b5e9cc3e7d0b84c3e41))
- Add new experimental features for future optimizations ([d838a96](https://github.com/vunamhung/react-router-vite-cfw-shadcn/commit/d838a96c98409502f14349bb4e5525544b5fab3c))
- add seed-admin script to create first admin user ([b2da3b9](https://github.com/vunamhung/react-router-vite-cfw-shadcn/commit/b2da3b9979b24c514f923007a606049fed273a0e))
- **app:** add light and dark mode icons ([a585ee8](https://github.com/vunamhung/react-router-vite-cfw-shadcn/commit/a585ee82ca543bf7b2daafee029f73d5684cb7fe))
- **app:** add tw-animate-css import ([5b3eb36](https://github.com/vunamhung/react-router-vite-cfw-shadcn/commit/5b3eb3683b2041c84420ab6f85cc2c3d13ee79ec))
- **chat:** add chat component and initial messages ([ac6a9ed](https://github.com/vunamhung/react-router-vite-cfw-shadcn/commit/ac6a9ed85df073966a21fbba9d257ce89ef44e43))
- **components.json:** add [@ai-elements](https://github.com/ai-elements) registry URL ([d24648b](https://github.com/vunamhung/react-router-vite-cfw-shadcn/commit/d24648b281206bf57da8322748ef9890fab1bcbd))
- **config:** add observability settings to wrangler.jsonc ([a245845](https://github.com/vunamhung/react-router-vite-cfw-shadcn/commit/a2458456a1539339dccdf317c39e728e29293874))
- **deps:** update dependencies in package.json ([0a83af8](https://github.com/vunamhung/react-router-vite-cfw-shadcn/commit/0a83af833cc1ff30b3e206f935cf2f197b2be530))
- **drizzle:** add drizzle.config.ts file ([ff4708c](https://github.com/vunamhung/react-router-vite-cfw-shadcn/commit/ff4708c412db5b058a8f5a29294062b603b19376))
- Enable v8_viteEnvironmentApi in react-router.config.ts ([d2b28eb](https://github.com/vunamhung/react-router-vite-cfw-shadcn/commit/d2b28eb0160c0d53788af4e9248c6ce0d8ae3176))
- Implement changes in auth.me.ts loader function ([b6e2a1a](https://github.com/vunamhung/react-router-vite-cfw-shadcn/commit/b6e2a1afa9ce10dbedeed5fd61035936724035b0))
- **server:** implement PBKDF2 key derivation for password hashing ([9d4b099](https://github.com/vunamhung/react-router-vite-cfw-shadcn/commit/9d4b09912074c20fbaa63ef487abf37dade51c37))
- **tsconfig:** enable allowJs option ([fd9b9d6](https://github.com/vunamhung/react-router-vite-cfw-shadcn/commit/fd9b9d641b59b43adcbb3a5998b7df3819f496f8))
- **ui:** Add Button component ([f094cef](https://github.com/vunamhung/react-router-vite-cfw-shadcn/commit/f094cefe1db32347262cd42b251ffd5d2ba92ef9))
- **vite:** update vite.config.ts and react-router.config.ts ([1130e1c](https://github.com/vunamhung/react-router-vite-cfw-shadcn/commit/1130e1c690209bed73a35808eade1dd75b406936))

### Bug Fixes

- **types:** update import path for AuthUserMeta ([a2ee1c9](https://github.com/vunamhung/react-router-vite-cfw-shadcn/commit/a2ee1c9552ca2ee4837b99c2634b007fc4c77555))
