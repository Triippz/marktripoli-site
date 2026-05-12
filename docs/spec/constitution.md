# marktripoli-site Spec Constitution

**Version:** 0.1.0
**Ratified:** 2026-05-11
**Last Amended:** 2026-05-11

## Purpose

A React + TypeScript + Vite personal portfolio site implementing an interactive Mission Control-themed experience. The site presents career information through a command-and-control (C2) console metaphor with a Mapbox globe interface, terminal interactions, Easter eggs, and immersive animations. Features are client-side only (SPA) with no backend services.

## Articles

Articles are non-negotiable. They use RFC 2119 keywords (MUST, MUST NOT, SHOULD, SHOULD NOT, MAY). The first three articles are required by this repo and may not be removed; they only ever expand.

### Article I — Test-First (NON-NEGOTIABLE)

Production code MUST NOT be written before a failing test exists. The Red-Green-Refactor cycle is enforced. The /tdd skill is the implementation of this article.

**Why:** Without this article, AI-generated code is reviewed against a specification it has already shaped its own assumptions around. Tests written first are the only defensible record of what behaviour was actually asked for.

**How to verify:** spec-validator inspects each task in tasks.md and confirms test tasks precede implementation tasks for the same behaviour.

### Article II — Specs Are Evidence-Driven

Every requirement, constraint, performance target, and architectural choice MUST be either (a) quantified, (b) cited to a source (file:line, RFC, benchmark, prior incident, or stakeholder decision), or (c) marked as an explicit Assumption with the engineer's rationale. Vague adjectives (fast, scalable, secure, robust, intuitive, lightweight, modern, simple, efficient) MUST NOT appear without an adjacent quantification.

**Why:** Vague language is the single largest source of agent misinterpretation. "Fast" cannot generate code; "p95 latency under 150 ms at 1000 RPS" can.

**How to verify:** spec-challenger runs a vague-adjective scan over spec.md and reports each violation as a HIGH finding.

### Article III — Hard-Fail on CRITICAL Findings

A spec MUST NOT advance to implementation while any CRITICAL finding from spec-challenger or spec-validator is unresolved. CRITICAL findings include: constitution-article violations without recorded Complexity Tracking justification; functional requirements with zero task coverage; user stories without an Independent Test definition; contradictions between spec.md, plan.md, and tasks.md.

**Why:** Soft-failing CRITICAL findings is how SDD degrades into vibe coding with extra paperwork.

**How to verify:** spec-validator's verdict is `BLOCKED` if any CRITICAL is open.

---

### Article IV — Independent User Stories

Every user story prioritised P1 MUST be independently testable: implementing only that story MUST yield a viable MVP that delivers the user the value the spec promises.

### Article V — Simplicity Gate

The implementation MUST use the smallest project structure that solves the problem. Adding a new project, library, or service requires a recorded Complexity Tracking entry with a rejected-alternative analysis.

### Article VI — Anti-Abstraction

The implementation SHOULD use framework features directly rather than wrapping them. New abstractions are justified only by repeated concrete need (the rule of three).

### Article VII — Mission Control Theme Consistency

All user-visible UI additions MUST adhere to the established Mission Control / C2 aesthetic: black backgrounds, neon green (`#00ff00`) as primary accent, monospace typography (JetBrains Mono), tactical naming conventions (codenames, operation prefixes), and military-inspired interaction patterns. New visual elements (markers, overlays, animations) MUST use the project's color token palette (`mc-black`, `mc-green`, `mc-green-glow`, `mc-white`, `mc-gray`) defined in `tailwind.config.js`. Non-themed UI (raw browser defaults, unstyled components, off-palette colors) MUST NOT be shipped without a recorded Complexity Tracking justification.

**Why:** The C2 theme is the product's core identity. Breaking it degrades the experience from "immersive portfolio" to "generic website with green bits."

**How to verify:** Visual review of any new UI element against the existing color tokens and aesthetic patterns.

## Gates

| Gate | Article | Pass Criteria | Failure Remedy |
|------|---------|----------------|----------------|
| Test-First | I | tasks.md shows test task IDs preceding the first implementation task ID for the same behaviour | Re-order tasks.md or add missing test tasks |
| Evidence | II | spec-challenger vague-adjective scan returns zero HIGH findings | Quantify each flagged adjective |
| CRITICAL-Resolved | III | spec-validator verdict is READY | Resolve every CRITICAL finding or rewrite the spec |
| Independent-MVP | IV | Each P1 user story has a non-empty Independent Test field | Rewrite Independent Test as a specific action + value-delivered statement |
| Simplicity | V | Project Structure section in plan.md uses the chosen structure unmodified, OR Complexity Tracking has an entry per added piece | Either justify each violation or remove the addition |
| Anti-Abstraction | VI | New abstractions in plan.md have a Why-Needed entry | Same |
| Theme-Consistency | VII | All new UI elements use mc-* color tokens and match C2 aesthetic | Restyle with correct tokens or justify deviation |

## Amendment Process

The constitution is amended via PR to `docs/spec/constitution.md` with reviewer approval. It is not amended via the spec-generation flow. Amendments increment the Version field per semantic versioning:

- **MAJOR:** an article is removed or its meaning is reversed.
- **MINOR:** a new article is added or an existing article gains a new gate.
- **PATCH:** wording, clarifications, typo fixes.

The Last Amended field is set to the date of merge.
