// First-run seeder: populates each default skill with relevant starter files
// so the cards aren't empty. Runs once per browser (gated by localStorage).
// Only seeds a skill if the user hasn't already attached files there.

import { setSkillFiles, type StoredFile } from "./skill-files";

const SEED_KEY = "skills-library:seeded";
const SEED_VERSION = "v1";

interface SeedFile {
  name: string;
  type: string;
  content: string;
}

function encode(content: string): ArrayBuffer {
  return new TextEncoder().encode(content).buffer;
}

function toStored(seed: SeedFile): StoredFile {
  const bytes = new TextEncoder().encode(seed.content);
  return { name: seed.name, type: seed.type, size: bytes.byteLength, data: bytes.buffer };
}

// ─── Default files per skill ───────────────────────────────────────────────

const SUMMARIZE_POLICY_TEMPLATE = `# Policy Summary Template

## Policy at a Glance
- **Named Insured:** {Company / Individual}
- **Policy Number:** {Number}
- **Effective Date:** {YYYY-MM-DD}
- **Expiration Date:** {YYYY-MM-DD}
- **Carrier:** {Legal entity name}
- **Producer:** {Agency}

## Coverage Summary
- **Line of Business:** {GL / CGL / Auto / Property / etc.}
- **Coverage Form:** {Occurrence / Claims-made}
- **Limits:**
  - Each Occurrence: ${"$"}{amount}
  - General Aggregate: ${"$"}{amount}
  - Products-Completed Operations Aggregate: ${"$"}{amount}
  - Personal & Advertising Injury: ${"$"}{amount}

## Premium & Deductibles
- **Annual Premium:** ${"$"}{amount}
- **Deductible / SIR:** ${"$"}{amount}
- **Minimum Earned Premium:** {percentage}%

## Key Endorsements
- {Form #} — {Plain-language description}

## Notable Exclusions
- {Exclusion} — {Context}

## Open Items / Flags
- {Anything that warrants follow-up}
`;

const SUMMARIZE_POLICY_CHECKLIST = `# Required Fields for the One-Page Brief

If a field is missing in the source document, write "Not specified" rather than omitting the row.

## Identification
- Named insured (full legal name)
- Additional named insureds
- DBA names
- Mailing address & insured locations
- Policy number
- Carrier (legal entity, not just brand)
- Producer / agency

## Term
- Effective and expiration dates
- Coverage form (occurrence vs claims-made)
- Retroactive date (for claims-made)
- Extended reporting period

## Coverage
- Lines of business
- Limits by coverage type
- Sub-limits and aggregates
- Deductibles / SIR
- Coinsurance percentages

## Premium
- Annual premium
- Minimum earned premium
- Audit basis (payroll / sales / units)
- Payment schedule

## Forms & Endorsements
- Schedule of forms with edition dates
- Additional insured endorsements
- Waiver of subrogation
- Manuscript endorsements

## Exclusions / Warranties
- Material exclusions
- Warranties and conditions
`;

const PREMIUM_RATE_FACTORS_CSV = `category,subcategory,factor,notes
Class Code,Low hazard (clerical/professional),0.85,Office-only operations
Class Code,Medium hazard (light retail/services),1.00,Baseline
Class Code,High hazard (construction/manufacturing),1.45,Field operations
Territory,Tier 1 (urban dense),1.20,Higher loss frequency
Territory,Tier 2 (suburban),1.00,Baseline
Territory,Tier 3 (rural),0.90,Lower frequency
Loss History,No losses 3+ years,0.80,Schedule credit
Loss History,1 loss in 3 years,1.00,Baseline
Loss History,2+ losses or large severity,1.25,Schedule debit
Limits Factor,${"$"}1M / ${"$"}2M,1.00,Baseline
Limits Factor,${"$"}2M / ${"$"}4M,1.18,Increased Limit Factor
Limits Factor,${"$"}5M / ${"$"}10M,1.55,Increased Limit Factor
Deductible Credit,${"$"}1000,1.00,Baseline
Deductible Credit,${"$"}2500,0.95,
Deductible Credit,${"$"}5000,0.88,
Deductible Credit,${"$"}10000,0.78,
`;

const PREMIUM_FORMULA_REFERENCE = `# Premium Calculation — Quick Reference

## Base Premium
\`Base = Exposure x Rate per Unit\`

Exposure units vary by line of business:
- General Liability: gross sales per ${"$"}1,000 (or payroll per ${"$"}100)
- Workers' Comp: payroll per ${"$"}100 by class code
- Auto: per vehicle, weighted by use class
- Property: TIV per ${"$"}100

## Modified Premium
\`Modified = Base x Class x Territory x Experience x ILF x Schedule\`

| Factor | What it captures |
| --- | --- |
| Class | Hazard of the operation |
| Territory | Geographic loss frequency |
| Experience Mod (e-mod) | 3-year loss history vs class average |
| ILF (Increased Limit Factor) | Cost of higher policy limits |
| Schedule | Underwriter judgment (credits/debits, typically ±25%) |

## Final Premium
\`Final = Modified - Deductible Credit + Expense Constant + Taxes/Fees\`

## Sanity Checks
- Rate per ${"$"}1,000 should fall within carrier filed rates.
- e-mod above 1.25 usually requires a referral.
- Schedule credits/debits should be documented per state filings.
`;

const EMAIL_VOICE_GUIDE = `# Firm Voice — Quick Reference

We sound like a smart, plain-spoken colleague — never a form letter.

## Do
- Lead with the answer or ask. The reason follows.
- Use the client's first name. Sign with your first name only.
- Numbers in figures. Dates as "May 14".
- One idea per paragraph. Short sentences.
- Name next steps and owners.

## Don't
- "Per my last email" / "As discussed" / "Hope this email finds you well"
- "Please be advised" / "Kindly"
- Triple-stacked adjectives ("comprehensive, robust, best-in-class")
- Industry jargon when a normal word will do
- Hedging ("just wanted to" / "I think maybe we could possibly")

## Tone by Audience
- **Broker partners** — peer-to-peer, candid, fast.
- **Clients** — confident, accessible, no jargon unless we define it.
- **Carriers/underwriters** — precise, structured, evidence-first.

## Sign-offs
- "Thanks," — default
- "Talk soon," — when there is a follow-up planned
- "Best," — formal first contact only
`;

const EMAIL_TEMPLATES = `# Common Email Templates

---

## 1. Renewal kickoff (to client)

Subject: Renewal coming up — quick check-in

Hi {first name},

Your {LOB} policy renews on {date}. A few things I'd like to confirm before we shop the market:

1. Any changes in operations, revenue, or headcount this year?
2. New locations, vehicles, or equipment to add or remove?
3. Any incidents you'd want us to know about (claim or not)?

I'll send our renewal proposal by {date - 30 days}. Easiest reply works.

Thanks,
{Your first name}

---

## 2. Quote follow-up (to broker)

Subject: {Account} — quote ready

{Broker first name},

Quote is attached. Highlights:

- Premium: ${"$"}{amount}
- Limits: ${"$"}{limit each occurrence} / ${"$"}{aggregate}
- Notable terms: {key endorsement or exclusion}

Bind authority is good through {date}. Let me know what you'd like to do.

Thanks,
{Your first name}

---

## 3. Loss notification (to carrier)

Subject: FNOL — {Account} — {date of loss}

Reporting a new loss for {Account}, policy {number}.

- Date of loss: {date}
- Location: {address}
- Description: {1-3 sentences, factual only}
- Reported by: {name, role}
- Reserves estimated: ${"$"}{amount} (preliminary)

Please assign and confirm receipt.

Thanks,
{Your first name}
`;

const COVERAGE_ENDORSEMENTS_BY_LOB = `# Endorsements to Check by Line of Business

## General Liability (CGL)
- Additional Insured — Owners, Lessees or Contractors (CG 20 10 / CG 20 37)
- Waiver of Transfer of Rights of Recovery (CG 24 04)
- Primary and Noncontributory wording
- Per Project / Per Location Aggregate (CG 25 03 / CG 25 04)
- Contractual Liability Limitation (CG 24 26)
- Designated Construction Project(s) General Aggregate

## Workers' Compensation
- Waiver of Subrogation (WC 00 03 13)
- Alternate Employer (WC 00 03 01A)
- Voluntary Compensation (WC 00 03 11A)
- USL&H endorsement if exposure exists

## Commercial Auto
- Hired & Non-Owned Auto (CA 99 33)
- Drive Other Car (CA 99 10)
- Additional Insured — Lessor (CA 20 01)
- Waiver of Subrogation (CA 04 44)

## Property
- Ordinance or Law (CP 04 05)
- Equipment Breakdown (BM 00 20)
- Flood / Earthquake (where excluded by base form)
- Business Income & Extra Expense
- Mortgageholder / Loss Payee schedule

## Professional / E&O
- Prior Acts / Retroactive Date confirmation
- Extended Reporting Period (ERP) option
- Defense outside the limits (if available)

## Cyber
- First-party (business interruption, ransom, restoration)
- Third-party (privacy liability, regulatory)
- Sub-limits for social engineering and funds transfer fraud
- Waiting period for BI
`;

const COVERAGE_GAP_CHECKLIST_CSV = `category,item,status,notes
Additional Insureds,Owners listed as AI on tenants improvements,,
Additional Insureds,Lenders/mortgagees scheduled,,
Additional Insureds,Vendor AI for ongoing operations,,
Subrogation,Waiver of subro endorsed where contracts require,,
Subrogation,Primary & noncontributory wording in place,,
Aggregates,Per-project or per-location aggregate purchased,,
Aggregates,Products-completed ops aggregate sufficient,,
Exclusions,No total pollution exclusion if industry-relevant,,
Exclusions,No professional services exclusion if performing design,,
Cyber,Social engineering sublimit at least ${"$"}250K,,
Cyber,Funds transfer fraud sublimit present,,
Cyber,Dependent business interruption coverage included,,
Property,Ordinance or law A/B/C coverages,,
Property,Equipment breakdown included or scheduled,,
Property,Business income with extended period of indemnity,,
Auto,Hired and non-owned auto coverage in place,,
Auto,Drive other car endorsement for executives if needed,,
Workers Comp,Waiver of subrogation matching contract requirements,,
Workers Comp,Voluntary compensation if any out-of-state exposure,,
`;

const LOSS_RATIO_FORMULAS = `# Loss Ratio Formulas

## Paid Loss Ratio
\`Paid Loss Ratio = Paid Losses / Earned Premium\`

## Incurred Loss Ratio
\`Incurred Loss Ratio = (Paid Losses + Case Reserves) / Earned Premium\`

## Ultimate Loss Ratio
Apply Loss Development Factors (LDFs) to incurred:
\`Ultimate = Incurred at Maturity x LDF for that maturity\`

## Combined Ratio
\`Combined = Loss Ratio + Expense Ratio\`

Below 100% = underwriting profit. Above 100% = underwriting loss
(but the carrier can still be profitable via investment income).

## Trends to Watch
- Three-year rolling loss ratio
- Frequency vs severity decomposition
- Large-loss carve-out (claims above some threshold, e.g. ${"$"}100K)
- IBNR development pattern across reporting periods

## Red Flags
- Loss ratio climbing each year of the policy term
- High frequency on small claims (suggests operational issue)
- A single shock loss distorting an otherwise clean book
- Reserve strengthening late in the policy term
`;

const LOSS_RATIO_BENCHMARKS_CSV = `line_of_business,segment,median_loss_ratio,top_quartile,bottom_quartile,notes
Workers Compensation,All industries,0.58,0.42,0.78,Includes ALAE
Workers Compensation,Construction,0.71,0.55,0.92,Higher severity
Workers Compensation,Office/clerical,0.31,0.18,0.46,Lower frequency
General Liability,Small/mid commercial,0.52,0.38,0.71,Excludes catastrophe
General Liability,Construction,0.64,0.48,0.86,High construction-defect drag
Commercial Auto,Light fleet,0.68,0.52,0.91,Rising severity 2020-2024
Commercial Auto,Heavy trucking,0.78,0.60,0.99,Distracted driving impact
Property,Habitational,0.61,0.45,0.84,High cat exposure
Property,Office/retail,0.46,0.33,0.65,Moderate cat exposure
Cyber,SMB,0.59,0.42,0.85,Ransomware variability
Cyber,Mid-market,0.65,0.48,0.92,Higher BI exposure
Professional Liability,Architects/engineers,0.58,0.42,0.79,
Professional Liability,Lawyers,0.62,0.46,0.84,Tail risk
Directors & Officers,Public companies,0.55,0.40,0.78,Securities litigation driver
`;

const AM_BEST_SCALE_GUIDE = `# AM Best Financial Strength Rating Scale

AM Best assigns Financial Strength Ratings (FSRs) on the scale below. Use these as a baseline gate when evaluating carriers for binding.

| FSR | Category | Description |
| --- | --- | --- |
| A++, A+ | Superior | Strongest balance sheet; broadest acceptance |
| A, A- | Excellent | Very strong; standard for most placements |
| B++, B+ | Good | Acceptable for many lines with notice |
| B, B- | Fair | Use with caution; client disclosure recommended |
| C++, C+ | Marginal | Higher risk of impairment |
| C, C- | Weak | Significant financial vulnerability |
| D | Poor | Major financial vulnerability |
| E | Under Regulatory Supervision | State has stepped in |
| F | In Liquidation | Carrier is being wound down |
| S | Suspended | Information unavailable |

## Outlook & Action
Each FSR also carries an outlook (Positive, Stable, Negative) and possible "Under Review" action. Treat any Negative outlook or Under Review status as a flag worth surfacing in your summary.

## Internal Acceptance Policy
- Default acceptance: **A- or better** with stable outlook
- B-rated: require manager approval and client written disclosure
- Below B: only with documented exception and client sign-off
- Non-rated (NR): only via approved program markets

## Lookup Path
1. ambest.com → search by carrier legal name
2. Confirm NAIC code matches policy declarations
3. Note rating action date — anything older than 18 months should be re-pulled
`;

const NAIC_CODES_GUIDE = `# NAIC Codes — Quick Reference

The NAIC code is a 5-digit identifier for an insurance company filed with state insurance departments. It's the carrier's "legal entity ID" — different from a group code, which clusters affiliated companies.

## Why It Matters
- Pulls back the exact legal entity that's on the hook for a claim
- Group brand names can hide weaker subsidiaries
- Required on certificates and ACORD forms

## Where to Find It
- Policy declarations page (top right or signature block)
- ACORD 25 certificate of insurance
- State insurance department lookup
- naic.org → I-SITE (members) or state filings portal

## Common Pitfalls
- Two carriers under one brand can have different ratings — always rate the legal entity, not the marketing brand
- Surplus lines carriers may not appear in admitted databases — check the state surplus lines stamping office
- Reinsurance recoverables: a strong front company may rely on a weaker reinsurer

## Cross-References to Pull for Every Carrier Review
1. NAIC code → legal entity name
2. AM Best FSR + outlook
3. State of domicile + license status in the policy state
4. Recent regulatory actions (NAIC SERFF, state DOI)
5. Group structure (parent / affiliates)
`;

// ─── Map skill IDs to their seed files ─────────────────────────────────────

const SEED_FILES: Record<string, SeedFile[]> = {
  // Summarize Policy
  s1: [
    { name: "policy-summary-template.md", type: "text/markdown", content: SUMMARIZE_POLICY_TEMPLATE },
    { name: "key-fields-checklist.md",    type: "text/markdown", content: SUMMARIZE_POLICY_CHECKLIST },
  ],
  // Premium Estimator
  s2: [
    { name: "rate-factors.csv",       type: "text/csv",      content: PREMIUM_RATE_FACTORS_CSV },
    { name: "formula-reference.md",   type: "text/markdown", content: PREMIUM_FORMULA_REFERENCE },
  ],
  // Email Drafter
  s3: [
    { name: "firm-voice-guide.md", type: "text/markdown", content: EMAIL_VOICE_GUIDE },
    { name: "email-templates.md",  type: "text/markdown", content: EMAIL_TEMPLATES },
  ],
  // Coverage Gap Check
  s4: [
    { name: "endorsements-by-lob.md", type: "text/markdown", content: COVERAGE_ENDORSEMENTS_BY_LOB },
    { name: "gap-checklist.csv",      type: "text/csv",      content: COVERAGE_GAP_CHECKLIST_CSV },
  ],
  // Loss Ratio Trend
  s5: [
    { name: "loss-ratio-formulas.md",   type: "text/markdown", content: LOSS_RATIO_FORMULAS },
    { name: "industry-benchmarks.csv",  type: "text/csv",      content: LOSS_RATIO_BENCHMARKS_CSV },
  ],
  // Carrier Lookup
  s6: [
    { name: "am-best-scale.md",     type: "text/markdown", content: AM_BEST_SCALE_GUIDE },
    { name: "naic-codes-guide.md",  type: "text/markdown", content: NAIC_CODES_GUIDE },
  ],
};

// ─── Public API ────────────────────────────────────────────────────────────

export async function seedSkillFilesIfNeeded(
  current: Record<string, StoredFile[]>,
): Promise<Record<string, StoredFile[]>> {
  if (typeof window === "undefined") return current;
  try {
    if (localStorage.getItem(SEED_KEY) === SEED_VERSION) return current;
  } catch {
    return current;
  }

  const updated: Record<string, StoredFile[]> = { ...current };
  for (const [skillId, seeds] of Object.entries(SEED_FILES)) {
    if (current[skillId]?.length) continue; // respect any files the user already added
    const files = seeds.map(toStored);
    try {
      await setSkillFiles(skillId, files);
      updated[skillId] = files;
    } catch {
      // ignore individual failures so a single bad write doesn't block the rest
    }
  }

  try {
    localStorage.setItem(SEED_KEY, SEED_VERSION);
  } catch {
    // ignore
  }
  return updated;
}
