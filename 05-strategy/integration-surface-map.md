---
AUTHOR: Claude. Six research angles, each independently audited by a separate agent instructed to refute
rather than agree. 13 agents, 281 tool calls, 22 minutes, no stalls
WHAT THIS IS: which system holds the truth at each of the twenty funnel steps, how many integrations one
customer deployment needs, and what being the system of record actually costs
WHAT THIS IS NOT: a build plan or an estimate
EVIDENCE: every claim traces to a URL that was fetched and loaded. Where a fetch failed, the claim was dropped
and the gap is named in section 6
DATE: 16 Aug 2026
---

# Integration surface map

**How to read the count. Rewritten 18 Aug 2026 after meeting 2.**

**We replace nothing.** D-020 reverses D-015: Nishant accepted a connector architecture, so the applicant
tracking system stays where it is and we connect to it like everything else. The word "replace" appears in
several places below and it is now wrong everywhere it appears.

What that changes about this document:

- The count barely moves. We add the applicant tracking system as a connector and drop it as a replacement.
- Section 3, on what being the system of record costs, is now a description of a cost we have chosen not to
  incur. Kept in full, because it is the clearest statement of what the reversal buys us.
- The postures change substantially, and mostly for the better. Most steps become reads rather than writes,
  which is the posture a security review approves fastest. The step-by-step version is in connector-map.md,
  which answers the specific question Nishant asked.

**The headline, for anyone reading one line.** Six to eight external systems per customer deployment, seven
likely. That is lower than feared. But the two that gate the schedule, ADP payroll and E-Verify, both publish
no total timeline anywhere, and the biggest single unknown in the whole map is what a retailer can actually
export out of their existing applicant tracking system, which is the thing D-015 requires them to leave.

# Integration surface map: US frontline retail hiring

## How to read this

Terms, defined once. **ATS** is applicant tracking system, the software that holds applications and moves candidates through hiring. **HRIS** or **HCM** is the human resources information system, the employee record of truth. **WFM** is workforce management, meaning scheduling and time and attendance. **CRA** is a consumer reporting agency, the vendor that runs background checks. **LMS** is a learning management system. **POS** is point of sale, the store till system. **API** is an application programming interface, the documented way one system reads from or writes to another. **SSO** is single sign on.

This map is built from six research angles that were then independently audited. Where the audit corrected the research, the corrected version is used here. Where an angle returned nothing usable, that is stated plainly rather than filled in.

One caveat that shapes everything below. Only two retailer-to-system pairings were verified against a live production page. Trader Joe's runs Avature (a live hourly apply flow with store-level Crew and Mate postings). Ross Stores runs three vendors at once: NAS Activate as its careers front door at jobs.rossstores.com, Avature for its talent community at ross.avature.net, and Oracle Taleo for apply at rossstores.taleo.net. Nothing was established for Kroger, Albertsons, Publix, CVS, Walgreens, Macy's, Kohl's, Nordstrom, Dollar General, Dollar Tree, Ulta, Dick's, AutoZone, O'Reilly, Tractor Supply, Burlington, Foot Locker, Bath and Body Works, Sephora, Petco or Advance Auto Parts. So "typical" below means the category of system, not a verified census.

Ross also breaks the shortcut everyone uses. A careers-site hostname tells you one layer of a stack, not what the retailer runs. Steps 1 to 5 often sit in a marketing or CRM vendor that is not the ATS at all.

---

## 1. The map

| Step | Where the truth sits today | Ours to replace, or theirs to integrate | Documented integration reality |
|---|---|---|---|
| 1. Application captured | ATS, usually with a separate recruitment marketing layer in front of it. Verified at Ross: NAS Activate front door, Avature talent community, Taleo apply. | Replace. Job boards remain external as a candidate source, not a pipeline dependency. | Not applicable once we are the ATS. Indeed Apply is an embed rendered inside Indeed's own product; both incumbent frontline vendors market it, and the mechanism was not verified. |
| 2. Eligibility on hard rules | ATS screening configuration. | Replace. | No external system. Note the NYC rule in section 5 may or may not apply here. A deterministic knockout rule is probably not an automated employment decision tool under the statutory definition, but this was not resolved. |
| 3. Behavioural screening | Assessment vendor, or the ATS itself. Paradox owns its assessment outright (Traitify). | Replace, or license one assessment engine once. Only becomes a per-customer integration if a retailer insists on keeping an incumbent assessment vendor. | Nothing verified about any assessment vendor's API. |
| 4. Interview scheduled | ATS scheduler plus the recruiter and manager calendars in the retailer's Microsoft 365 or Google Workspace tenant. | Replace the scheduler. Integrate with the calendar tenant. | Fountain buys calendar federation rather than building it (Cronofy is a monitored production dependency). The calendar tenant is usually the same tenant as the identity directory, but it is a separate API. |
| 5. Interview happens or no-show | No external system. The interviewer's record is the truth. | Replace. | Video interview capture is optional. Fountain brokers one vendor for it. Nothing verified. |
| 6. Hire or reject decision | ATS. | Replace. | No external system. The FCRA and NYC obligations in section 5 attach here. |
| 7. Offer made | ATS plus an e-signature vendor. | Replace the ATS layer. License e-signature once. | Fountain names two e-signature vendors and monitors one of them as a production dependency. Both publish public APIs. |
| 8. Offer accepted | Same as step 7. | Same as step 7. | Same as step 7. |
| 9. Background check ordered | CRA: Checkr, First Advantage (which now includes Sterling), HireRight, Accurate Background. | Integrate. The retailer normally holds the CRA contract. | Mixed. Checkr and Accurate publish full public references. Sterling publishes public docs but issues credentials only after an email request. First Advantage points developers at Sterling's docs. HireRight has no reachable documentation at all. |
| 10. Check returns clear | Same CRA. | Integrate. | Checkr decomposes a report into child searches, including a per-county array, so a pending report can be resolved to which county is outstanding. Accurate publicly documents verification-attempt and estimated-completion endpoints. Sterling documents no status enumeration. First Advantage and HireRight, unknown. |
| 11. I-9, W-4, direct deposit | Form I-9 is governed by federal regulation and is held by whoever runs the process. W-4 withholding and direct deposit land in payroll. | We take the I-9 process. Integrate with payroll for the pay record. License a withholding form engine or build one. | Payroll writes are documented at several vendors (see step 14). Federal Register notice 88 FR 47990 expressly allows the remote document examination to be performed by an authorised representative acting for the employer, such as a third-party vendor. That is direct authority for us to run it. |
| 12. E-Verify | DHS and USCIS. Nothing else can return this answer. | Integrate. Non-negotiable. | Web services access is open to both employers and E-Verify employer agents, but is gated by enrolment plus a technical certification test. The Interface Control Agreement, which is the actual technical specification, is issued only to enrolled participants and is not published. |
| 13. Training and certifications | LMS. Fountain markets four; Paradox markets none in this category. | Integrate. | Nothing verified. No LMS API was checked in any angle. This is a hole. |
| 14. Uniform, badge, systems access, payroll record | Four different things. Payroll record sits in the HRIS. Systems access sits in the corporate identity directory. Badge sits in a physical access system. Store app and POS logins sit somewhere else again. | Integrate with all of them. | Payroll is the best-documented target in the whole map. Identity is the worst-understood relative to how confident people are about it. Badge and POS provisioning returned nothing at all, from any source. |
| 15. First shift scheduled | WFM. | Integrate. | Documented and public at UKG Pro WFM (`POST /v1/scheduling/schedule/multi_update` and `POST /v1/scheduling/schedule/shifts/apply_update`, readable without a login). Not documented at Legion, whose only integration call to action is a demo request. Blue Yonder's developer portal sits on a legacy host that was never read. Zebra's Workcloud scheduling page is live but no API docs were found. |
| 16. Day one shows up | WFM time and attendance. The punch is the evidence. | Integrate. Same system as step 15. | Same as step 15. |
| 17. Week one training | LMS for content completion, WFM for the scheduled training hours. | Integrate with both. | LMS unverified. WFM as step 15. |
| 18. Ramp to unsupervised | Usually no system. A manager's judgement, sometimes recorded in the LMS. | Ours to create. | No external system in most cases. |
| 19. 30/60/90 check-ins | Usually no system, or a talent module inside the HRIS. | Ours to create. Write back to the HRIS if the customer wants it there. | No mandatory external system. |
| 20. Employed at day 90 | Payroll and HRIS employment status. That is the number the CFO believes. | Integrate, read only. | Same targets as step 14. |

Steps with no external system at all: 2, 5, 6, 18, and in most deployments 19. Steps 1, 3, 7 and 8 have no mandatory external system once we are the ATS, though each has an optional vendor attached.

---

## 2. The integration count

**Six to eight distinct external systems per customer deployment. Seven is the likely case. Six only when payroll and workforce management come from the same vendor.**

Here is the working.

Counting rule. An external system is one the retailer owns or contracts, which we must read from or write to for the 20 steps to run end to end. Vendors we license once and embed in our own product are not counted, because they are built once and not renegotiated per retailer. Those are listed separately below.

The mandatory list:

1. Payroll and HR system of record. Steps 11, 14, 19, 20.
2. Workforce management, meaning scheduling and time and attendance. Steps 15, 16, 17, 18.
3. Corporate identity directory. Step 14. This tenant usually also supplies recruiter and manager calendars for step 4, but that is a second API on the same tenant.
4. Background check agency. Steps 9 and 10.
5. E-Verify, operated by DHS. Step 12.
6. Learning management system. Steps 13 and 17.
7. Store access layer: badge or physical access, plus store application and POS provisioning. Step 14.

That is seven.

Where the range comes from:

- Drops to six when payroll and WFM are the same vendor. Important caveat: the system count drops, the build does not halve. Inside one vendor the two products are separate API surfaces with separate authentication. UKG Pro HCM uses basic authentication with a web service account plus a Customer API key and a User API key. UKG Pro WFM uses a different specification. ADP states in its own partner guide that only one project should be created per ADP system you integrate with. So six systems still means seven API surfaces.
- Rises to eight when the store access layer is two systems rather than one, which is the common case if badge issuance and POS provisioning are separate products.
- Could reach nine if a retailer runs its mail and calendar on a different tenant from its directory, or runs two payrolls after an acquisition. Neither was verified, so neither is in the headline.

Deliberately not counted, and why:

- WOTC (Work Opportunity Tax Credit) capture. Real revenue for a large retailer, and both incumbents market it. It is not a gate on the hire, so the pipeline completes without it.
- Job advertising and programmatic distribution. Upstream of step 1. A careers site alone satisfies step 1.
- Any assessment vendor the retailer already runs, if they agree to move to ours.

Separately, vendors we license once and embed. Every deployment touches these, but we build them once, not per retailer. Roughly four to six of them:

- Messaging. Fountain runs two in parallel, Twilio and Bird, monitored across five and four regions respectively. Plan for two, not one.
- E-signature.
- Withholding form engine for W-4. Paradox does not build this; it embeds Symmetry Software as a formal sub-processor.
- Calendar federation, if bought rather than built.
- Resume and job parsing, if bought. Paradox licenses Textkernel, trading as Sovren, rather than building it.
- An I-9 vendor, if we buy rather than build. LawLogix Guardian and Symmetry I-9 are the two with public documentation.

So the honest full answer is: six to eight customer-side systems, plus four to six platform vendors. The number that drives per-customer schedule risk is the first one.

A cross-check on that number. Paradox markets more than a hundred integration partners, but its legally binding sub-processor list contains exactly thirteen third parties: AWS, Twilio and SendGrid, Google, Snowflake, Atlassian, Salesforce and Slack, Textkernel and Sovren, Symmetry Software, Merge API, Helpjuice, Cielo, The Cloud Connectors, and Woofound trading as Traitify. Checkr, HireRight, Accurate, Equifax, ADP, iCIMS, Greenhouse and Indeed are all absent from it. If Paradox were pushing candidate data into those systems it would have to list them. Their absence points to thin, status-only integrations with the client holding the vendor contract. That is a reasonable reading of sub-processor obligations, not a documented fact, but it is consistent with a real count in single digits rather than triple.

---

## 3. What being the system of record would have cost

> **Superseded 18 Aug 2026.** D-020 means we are not the system of record, so none of this is a cost we now
> carry. It is kept because it is the best statement of what the connector architecture avoids, and because if
> anybody proposes owning the record again, this is the bill.

### What the retailer loses

**Application and candidate history.** Years of it. This is the single largest unknown in the whole research set. Nothing was verified about bulk export formats, disposition data or attachment export for any of Workday Recruiting, iCIMS, Oracle Taleo, Oracle Recruiting Cloud, UKG, ADP or Avature. Every one of those documentation sets is either behind a login or rendered by JavaScript that fetchers cannot read. We do not know what comes out, in what format, or what it costs.

**Do-not-hire and not-eligible-for-rehire flags.** These are the operationally hottest records in a frontline ATS, because rehiring someone who was terminated for cause is a real incident. Where they are stored and whether they survive an export was verified for zero vendors.

**Requisition and approval chains.** On Workday these live in the HCM business process framework, not in a separable recruiting layer. A Workday Recruiting customer is not swapping an ATS, they are unpicking part of their HCM configuration.

**The recruitment marketing and CRM layer.** Ross runs a separate front door vendor and a separate talent community vendor on top of its ATS. Replacing the ATS does not replace those, and it can break the handoffs between them. Any deal that assumes "one system out, one system in" will discover the other two on the implementation call.

**Report generation for EEO-1 and OFCCP.** Which system produces these today was not established for any vendor. This matters more than it sounds, because those reports are annual obligations with named deadlines and a broken report is a compliance event, not a product bug.

### What has to be migrated

- Applicant and application records for everyone still inside a retention window.
- Disposition reasons, and do-not-hire or rehire-eligibility flags.
- Completed Form I-9s and, where the remote procedure was used, the retained document copies.
- Everything under a litigation hold.
- Requisition templates, approval chains and the job description library.
- Careers site content and the job feeds going out to boards.

### What compliance record-keeping transfers to us

All of the following are confirmed from primary government text. Full URLs are in section 5.

**Form I-9 retention.** Three years after the date of hire, or one year after the date employment is terminated, whichever is later. For frontline retail this matters more than it looks. Someone who leaves at day 60 still has an I-9 we must hold until hire plus three years. The three-year leg governs almost every early leaver. Where the remote examination procedure was used, the document copies inherit the same clock, and copying becomes mandatory rather than optional.

**EEOC records.** Personnel or employment records for one year, and one year from the date of termination for anyone involuntarily terminated. Under the ADEA, payroll records for three years, and benefit plans and any written seniority or merit system for the full period the plan is in effect plus at least one year after it ends. Under the FLSA and Equal Pay Act, payroll records for at least three years, and at least two years for records explaining wage differentials between employees of opposite sexes.

**Litigation hold.** Once a charge is filed, records must be kept until final disposition of the charge or any lawsuit based on the charge. A correction worth making explicitly, because the research got this wrong and the audit caught it: this is an obligation to retain records, not to keep the old ATS running. Exported archives and read-only preservation copies are the normal way holds are satisfied. If we price a customer running two systems in parallel, price it on export fidelity and defensibility of the archive, not on the EEOC page. That page does not say what people think it says.

**State E-Verify retention, which is not one clock.** Arizona requires the verification record for the duration of employment or at least three years, whichever is longer. Florida requires the documentation provided and any official verification generated for at least three years, and requires evidence of a system outage for each day when the fallback to paper is used. Retention cannot be a single global setting in our data model.

**NYC Local Law 144.** If our screening qualifies as an automated employment decision tool, we owe every NYC customer three things they cannot produce without us: a bias audit conducted by an independent auditor that is never more than one year old at the moment of use, a published summary of that audit plus the distribution date of the tool, and the machinery to send each in-city candidate a notice at least ten business days before use that offers an alternative selection process. The legal duty sits on the employer or employment agency. If we ever operate as an employment agency for a customer, it sits on us directly.

**FCRA.** The disclosure must be in a document that consists solely of the disclosure. That single clause constrains the step 9 screen absolutely. It cannot share a page or a signature with an application, an at-will acknowledgement or a liability release. Before adverse action we must have delivered a copy of the report and the Bureau-prescribed summary of rights, and be able to prove we did.

**E-Verify, if we act as an employer agent.** Three separate memoranda of understanding exist with DHS: one for web services employers, one for web services E-Verify employer agents and software developers, and one for employers using a web services employer agent. That third one means every retailer client signs a DHS document as part of onboarding. That is a per-customer legal review step, not a checkbox.

**The recurring cost nobody budgets.** Every new Interface Control Agreement version from DHS starts a six-month clock to update our systems. Miss it and access can be denied, and support for previous versions can be withdrawn. This is permanent maintenance headcount, not a one-time build.

---

## 4. The integrations that are hard, ranked

Ranked by schedule risk, worst first.

### 1. ADP, for large-employer payroll

The only vendor whose full gate is documented and confirmed. Their current partner guide (last modified 22 June 2026) sets out the flow: a "move forward with partnership" decision, a Global Security Organization partner risk assessment, thirty days of sandbox access, a signed Developer's Participation Agreement, a kick-off call, then a split into a marketing path with a dedicated partner success manager and a technical path with a dedicated technical account manager, integration development, an integration demo, GSO testing, GSO approval with a remediation loop back on failure, production listings, a production demo, then approval from the technical account manager, the partner success manager and Finance, and only then published. There are two exit points where the partnership simply ends.

The guide is explicit that you cannot complete the integration without an executed agreement. It requires two marketplace listings, not one: Core for new clients and Connector for existing mutual clients. It requires mutual TLS on all API calls to the ADP gateway. It requires SSO integration. And it states that only one project should be created per ADP system you integrate with.

That last line is the sizing trap. ADP's own guide sizes Workforce Now at fifty to three thousand employees and directs businesses over a thousand to Vantage HCM, alongside separately named Enterprise HR and Lyric products. A retailer above two billion dollars in revenue with tens of thousands of frontline staff is not on Workforce Now. Integrating "with ADP" is not one integration.

No total calendar time is published anywhere in the guide. The only durations stated are the thirty-day sandbox and a thirty-day deadline to submit specification, pricing and milestones. Do not quote a total. Two claims that circulate about ADP certification, an ISO 27001 based security questionnaire and at least two rounds of certification, are not in the document and were dropped.

Two documented constraints on the actual write. The Enterprise HR Worker Hire event API does not support the applied-for-SSN flag, and the guide's workaround is to send a hardcoded placeholder. And the employee identifier is not returned in the hire response, with a delay before it becomes available, so a downstream call cannot be chained straight off the hire.

### 2. E-Verify web services

Not partner-gated. There is no partner programme. It is enrolment-gated and certification-gated, and any enrolled employer or employer agent may use it. That is a different shape of risk and in some ways a worse one.

You cannot scope the build before you enrol, because the Interface Control Agreement is the technical specification and it is issued only to participants. Certification is a real test cycle against DHS-supplied custom test data, and the production URL and user ID are withheld until you pass. No timeline is published for either enrolment or certification.

Then the recurring obligation described in section 3: six months from each DHS notice to update, with access denial as the stated consequence of failing.

One softer risk. The public statement that both SOAP and REST are available comes from a supplemental guide that is dated September 2019. It is accurately quoted, but it is seven years old, and it says both protocols are available, not that they are at feature parity. Do not architect on it without asking.

### 3. Identity provisioning into the retailer's directory

This is the integration most likely to be under-estimated, because "we will just use SCIM" sounds like a solved problem. It is not.

SCIM (System for Cross-domain Identity Management) is an open standard, and the standard direction of travel is an identity provider pushing users into an application. We need the opposite: to push new hires from our system into the retailer's directory. For Microsoft Entra ID that inbound path is not a plain SCIM user create. It is a Microsoft Graph bulk upload endpoint. It accepts a SCIM-schema payload but it is a proprietary endpoint. It is asynchronous, so you submit and then poll a provisioning logs API. It requires the customer's IT administrator to install a provisioning application per data source, grant two specific permissions, and configure attribute mappings and scoping rules. It requires an Entra ID P1, P2 or Governance licence. And on P1 and P2 it is throttled to forty calls per five seconds and two thousand calls per twenty-four hours per tenant.

Every one of those is per customer, admin-gated and licence-dependent. The daily cap is a live operational risk at peak-season retail hiring volume. Okta's equivalent path was not verified.

### 4. Checkr partner certification

Legible, and comparatively light, but the date is not ours. Because we are the platform ordering on behalf of many employer accounts rather than one company screening its own hires, we need the partner path, not direct API keys. That means OAuth tokens minted per connected customer account, support for account hierarchy with nodes and work locations, and mandatory webhook handling. Then you email their partner address to schedule an integration review and demonstrate the working integration over a screenshare against acceptance criteria covering account connection, package selection, ordering and results display. Checkr's own words are that the review exists to ensure the integration adheres to FCRA regulations. No duration is published.

### 5. Sterling and First Advantage, which are now one target

The acquisition closed on 31 October 2024. This is not a pending deal, and treating it as two vendors to hedge across is a planning error. First Advantage's own standard API page points developers at Sterling's documentation.

Sterling's documentation is public to read, with a clean ordering model: create a candidate, list packages, start a screening against a candidate and a package, and set a callback URI on the screening request itself. But credentials are not self-serve. You email their API support address with company and project details and wait to be issued a client ID and secret. No duration published. Their public introduction documents no status vocabulary and no per-search breakdown, so we cannot tell from outside whether a stalled report can be resolved to a specific county.

### 6. Workday

Genuinely unknown, and the unknown is the risk. Two things are true at once.

The write surface is open. The Staffing operation reference is static HTML served without a login, and it documents hiring a pre-hire into a position, headcount or job through the Hire Employee business process. Workday's own note says pre-hire was previously called applicant and the element names were kept for backwards compatibility. That models our funnel almost exactly: we create the pre-hire and trigger the hire.

But Workday publishes no certification criteria, no cost and no timeline in public. That material sits behind their community site. Any figure you have seen for how long Workday certification takes did not come from a Workday public page. Treat every such number as unsourced.

One commercial factor. Workday announced its acquisition of Paradox on 21 August 2025, expected to close by 31 October 2025, and roughly twenty-five Workday legal entities now appear as affiliate sub-processors on Paradox's own list. Workday owns a direct competitor in frontline hiring. That is a partner-risk question, not a technical one, and it should be asked before we plan a Workday marketplace route.

### 7. Systems with no public path at all

- **HireRight.** Their developer subdomain does not resolve. Their Connect API page returns a title with no body to a fetcher, twice. Nothing about HireRight is corroborated, including the claim that it offers real-time status push. If a target customer runs HireRight, treat that integration as entirely unscoped.
- **Badge, physical access, POS and store application provisioning.** Zero documentation found, from any vendor, in any angle. This is the largest unscoped item in step 14 and it sits on the critical path to day one.
- **Learning management systems.** Names are marketed by the incumbents. Not one API was checked. Step 13 and step 17 are unscoped.
- **Legion.** Marketing copy describes secure APIs and file exchanges, but no developer portal is linked anywhere and the only integration call to action is a demo request.
- **Avature.** Confirmed live at two retailers inside our target profile, and no developer documentation was located at all. For us this is a migration-export problem more than a live integration.
- **Blue Yonder and Zebra Workcloud.** Blue Yonder's portal exists on a legacy host that was never read. Zebra's Reflexis product was renamed under the Workcloud brand and the current page is live, but no API documentation was found. Both are unknown rather than closed.
- **SAP SuccessFactors.** Nothing whatsoever was verified. Their help portal is a JavaScript application that returns no content to a fetcher.
- **Paycom.** No developer surface was reachable. This does not prove there is no public API.

### Where the path is genuinely open

Worth recording, because two of these were wrongly written off in the research and the corrections matter for how we rank the work.

- **UKG.** Both halves are publicly documented. Pro HCM uses basic authentication with a web service account plus two API keys. Pro WFM publishes schedule write operations, including a multi-employee schedule update covering shifts, paycode edits, day locks and schedule tags, readable without a login. The research concluded that writing a shift was documented nowhere. That was wrong, and it was wrong at exactly the vendor most likely to be running a retailer's stores.
- **Dayforce.** Documented publicly, just not on the developer portal. The web services guide is readable on their help site, with a versioned employees resource and a documented convention that a post to that resource signifies a new hire.
- **Paylocity.** A clean documented create-employee call with OAuth client credentials.
- **Greenhouse.** The most open ATS surface verified. Bearer token authentication, docs self-serve, and an explicit split between customer-built integrations that need no partnership and partner integrations that do. Least relevant to our customer profile, but a useful reference for what "open" looks like.
- **iCIMS.** Correcting the research: iCIMS does publish its API reference publicly, including the endpoint pattern, staleness parameters, request and response examples and a thousand-results-per-page cap. The new-user request form gates community membership, not the documentation. What remains genuinely untested is whether tenant credentials are customer-obtainable or partner-gated.
- **Accurate Background.** Also correcting the research: their reference is public, covering candidates, orders, documents, packages, adjudication, verification attempts and estimated completion times. No sales conversation is needed to scope it.
- **LawLogix Guardian.** Public unauthenticated documentation for a bidirectional I-9 and E-Verify integration, returning a status code, resolution code, next step and next step due date. That field set is exactly the state machine step 12 needs, and buying it would let us avoid owning the DHS agreement and the six-month upgrade treadmill ourselves.
- **Symmetry I-9.** Public docs, but read them carefully before treating this as a white-label option. Their API covers configuration, notifications and completed form details. E-Verify case creation, monitoring and resolution are delivered as embedded user interface, not as API operations.

---

## 5. Verified compliance deadlines

Every row below is confirmed verbatim against a primary government source.

| Obligation | The deadline | Source |
|---|---|---|
| Form I-9 Section 1, employee attestation | At the time of hire. "Hire" is defined in the same regulation as the actual commencement of employment for wages or other remuneration. | https://www.ecfr.gov/api/versioner/v1/full/2026-08-01/title-8.xml?chapter=I&subchapter=B&part=274a&section=274a.2 (definition at 8 CFR 274a.1(c), same part) |
| Form I-9 Section 2, employer document examination | Within three business days of the hire. | Same eCFR URL as above |
| Form I-9 Section 2 where the engagement is shorter than three business days | At the time of hire, and receipts may not be accepted at all. | Same eCFR URL as above |
| Form I-9 retention | Three years after the date of hire, or one year after the date employment is terminated, whichever is later. | Same eCFR URL as above |
| Remote document examination, legal basis | Only lawful to the extent DHS has authorised it by notice in the Federal Register. The regulation is permissive to the Secretary, not self-executing. | Same eCFR URL as above, at 274a.2(b)(1)(ix) |
| Remote document examination, who may use it | Only qualified employers: enrolled in E-Verify, having completed all required E-Verify training, and in good standing. Enrolment is assessed per hiring site. | https://www.federalregister.gov/documents/full_text/text/2023/07/25/2023-15532.txt and https://www.uscis.gov/i-9-central/remote-examination-of-documents |
| Remote document examination, how | Employee transmits copies first, then presents the same documents during a live video interaction. Retain a clear and legible copy, front and back if the document is two-sided. Tick the alternative procedure box in Section 2. It does not extend the three-business-day clock. | Same two URLs as above |
| E-Verify case creation | No later than the third business day after the employee starts work for pay. | https://www.e-verify.gov/employers/verification-process |
| E-Verify mismatch, employee informs the employer | Ten federal government working days from issuance of the mismatch. If the employee gives no decision by the end of the tenth day, the employer closes the case. | https://www.e-verify.gov/employers/verification-process/tentative-nonconfirmations |
| E-Verify mismatch, employee contacts DHS or visits SSA after referral | Eight federal government working days. The same page states that timeframes have been extended for certain mismatches, so any hardcoded value needs an override. | Same URL as above |
| E-Verify adverse action bar | No termination, suspension, delayed training, withheld or lowered pay, or any other adverse action, until the mismatch becomes a Final Nonconfirmation. | Same URL as above |
| E-Verify web services, upgrade window | Six months from the date DHS notifies participants to update their systems. Failure can mean access denied and support for prior versions withdrawn. | https://www.e-verify.gov/book/export/html/3533 (guide dated September 2019) |
| E-Verify web services, access | Interface Control Agreement issued to participants only, plus a technical certification test. Production URL and user ID provided only on passing. | https://www.e-verify.gov/employers/web-services |
| Florida, who must use E-Verify | Private employers with 25 or more employees, from 1 July 2023. | https://www.flsenate.gov/laws/statutes/2025/448.095 |
| Florida, outage fallback | If E-Verify is unavailable for three business days, revert to Form I-9 and retain evidence for each day: a screenshot, a public announcement of the outage, or another recorded communication. | Same URL as above |
| Florida, retention | At least three years for the documentation provided and any official verification generated. | Same URL as above |
| Florida, enforcement | Thirty days to cure after a Department of Commerce noncompliance finding, from 1 July 2024. One thousand dollars per day after three violations in any twenty-four month period, plus suspension of all licences issued by a licensing agency subject to chapter 120. | Same URL as above |
| Florida, suspension of the mandate | The requirement does not apply in any federal fiscal year in which E-Verify is not funded by the federal government. | Same URL as above |
| Arizona, who must use E-Verify | Every employer, with no employee-count threshold. | https://www.azleg.gov/ars/23/00214.htm |
| Arizona, retention | For the duration of the employee's employment or at least three years, whichever is longer. | Same URL as above |
| South Carolina, verification | Within three business days after employing a new employee. Applies to private employers required by federal law to complete I-9s, who hold a state business licence and employ one or more people. | https://www.scstatehouse.gov/code/t41c008.php |
| South Carolina, penalties | First occurrence on or after 1 July 2012: immediate compliance plus one year of probation with quarterly reports to the director. Subsequent occurrences: licence suspension of ten to thirty days. | Same URL as above |
| EEOC, personnel and employment records | One year. One year from the date of termination for anyone involuntarily terminated. | https://www.eeoc.gov/employers/recordkeeping-requirements |
| ADEA, payroll records | Three years. | Same URL as above |
| ADEA, benefit plans and written seniority or merit systems | The full period the plan or system is in effect, plus at least one year after it ends. | Same URL as above |
| FLSA and Equal Pay Act, payroll | At least three years. At least two years for records explaining wage differentials between employees of opposite sexes. | Same URL as above |
| EEOC, once a charge is filed | Records must be kept until final disposition of the charge or any lawsuit based on the charge. This is an obligation to retain records, not to keep a system running. | Same URL as above |
| NYC Local Law 144, bias audit age | Conducted no more than one year prior to each use of the tool. A rolling twelve-month lookback, not a calendar-annual exercise. | https://legistar.council.nyc.gov/LegislationDetail.aspx?ID=4344524&GUID=B051915D-A9AC-451E-81F8-6596032FA3F9&Options=ID%7CText%7C&Search= |
| NYC Local Law 144, publication | A summary of the most recent bias audit results plus the distribution date of the tool, public on the employer's or employment agency's website, before use. | Same URL as above |
| NYC Local Law 144, candidate notice | No less than ten business days before use, to each candidate or employee who resides in the city, and the notice must allow a request for an alternative selection process or accommodation. | Same URL as above |
| NYC Local Law 144, effective date | 1 January 2023. | Same URL as above |

Two notes on sourcing.

First, USCIS states the practical bookends for Section 1 more clearly than the regulation does: the employee must complete it no later than their first day of employment, and you may not ask someone who has not accepted a job offer to complete it. That is from the M-274 Handbook for Employers, section 3.0, on uscis.gov. The auditor loaded that page but did not record the full URL, so it sits in this note rather than in the table.

Second, the FCRA rules are deliberately not in the table. The two obligations were verified verbatim: the disclosure must be clear and conspicuous, in writing, before the report is procured, in a document that consists solely of the disclosure (15 U.S.C. 1681b(b)(2)(A)); and before adverse action the employer must provide a copy of the report and a written description of the consumer's rights as prescribed by the Bureau (15 U.S.C. 1681b(b)(3)(A)). But the text was read on law.cornell.edu, which is a law school mirror, not a government site. The authoritative text at uscode.house.gov or govinfo.gov was not fetched. Do that before the specification relies on it.

### Commonly repeated versions that the audit found to be wrong

**Florida requires E-Verify of all private employers from 1 July 2025.** Wrong. The current statute still reads twenty-five or more employees from 1 July 2023, with a history line ending in 2024. The 2025 version came from a proposed bill, not enacted law. Treat this as a watch item rather than settled: a law firm blog dated June 2026 reports that the Florida House passed a bill in January 2026 to remove the threshold, with a Senate companion. That was not checked against Florida Senate bill records and is not a primary source.

**Three business days is a South Carolina requirement.** Wrong. It is the federal E-Verify baseline that applies to every participant everywhere, and Florida imposes it independently. Model it as a global constraint, not a state branch.

**"Hire" and "starts work for pay" are different events needing separate timers.** Wrong. The regulation defines hire as the actual commencement of employment for wages or other remuneration. There is one anchor, day one of paid work, with two deadlines running from it: Section 1 by end of day one, and both Section 2 and the E-Verify case by the third business day. Offer acceptance is the only genuinely separate event, and its role is as the earliest permitted trigger, not as a deadline anchor.

**E-Verify auto-issues a Final Nonconfirmation if the employee does not act within ten working days after referral.** Not supported. The only post-referral number on the E-Verify page is eight federal government working days. The ten-day clock runs from issuance of the mismatch, not from referral. This is exactly the clock-collapsing error that circulates in vendor material.

**FCRA requires five business days between the pre-adverse notice and adverse action.** Not in the statute. It is industry custom and guidance about a reasonable interval. Build it as a configurable policy timer, not as a legal clock.

**The NYC candidate notice is ten calendar days.** Wrong. Ten business days.

**The NYC bias audit is an annual exercise.** Wrong. It is a rolling twelve-month lookback measured from each use. An audit that ages past twelve months makes every subsequent screen unlawful, even if the audit was done "this year".

**I-9 retention is three years and one year, or whichever is sooner.** Wrong on both counts. It is whichever is later, and the two legs are alternatives, not cumulative.

**Remote I-9 examination is generally available now.** Wrong in two ways. It is lawful only under a specific DHS Federal Register notice that DHS can amend or withdraw, and it is available only to employers who are enrolled in E-Verify, have completed all required E-Verify training, and are in good standing.

**The remote procedure requires copies of both sides of every document.** Overstated. The notice conditions it: front and back if the document is two-sided. And it does not create a longer retention period. What changes is that copying becomes mandatory where physical examination leaves it optional.

**Certification takes N weeks, for ADP, E-Verify or Workday.** No such number is published by any of them. ADP publishes only a thirty-day sandbox and a thirty-day submission deadline. E-Verify says a participant may request certification at their convenience and gives no duration. Workday publishes nothing. Any circulating figure is unsourced.

Three further corrections that are not deadlines but change planning:

**iCIMS does not publish its API docs.** Wrong. The reference is publicly readable.

**The First Advantage acquisition of Sterling is pending.** Wrong. It closed on 31 October 2024.

**"89 percent of criminal checks complete within one hour, so 11 percent are stuck."** The 89 percent figure is real and on Checkr's marketing page, but it describes individual criminal searches, not whole reports. A report bundles several screenings and completes at the pace of the slowest, and the same page quotes one to three days for a criminal check and two to seven days for a manual employment verification. Do not derive a report-level figure from it, and do not size a product opportunity on it.

---

## 6. What we still cannot answer from desk research

### Angles that returned nothing usable, stated plainly

- **OFCCP.** Complete blank. No retention period, no Internet Applicant definition, no federal contractor threshold verified. Both source attempts were blocked. Since many large US retailers are federal contractors through GSA or pharmacy contracts, this undercuts the federal-contractor half of the switching-cost argument entirely. Retry via govinfo.gov PDFs, which are static.
- **SAP SuccessFactors.** Nothing verified at all.
- **HireRight.** Nothing verified at all.
- **Badge, physical access, POS and store application provisioning.** Nothing, from any source, in any angle.
- **Learning management systems.** Nothing. Names marketed, no API checked.
- **Fair Workweek and predictive scheduling ordinances.** Not researched. These impose advance-notice requirements on schedules and therefore constrain what a step 15 write is even allowed to do.
- **Whether payroll and WFM are usually the same vendor at retailers above two billion dollars in revenue.** No analyst data, no survey. Both patterns exist. The section 2 range depends on this and it is unresolved.
- **Retail-specific evidence in the background check angle.** None. No filing, job posting or case study links any named retailer to any screening vendor.
- **Turnaround times from any screening vendor other than Checkr.** None, and Checkr's are marketing figures, not a service level agreement.

### Questions to put to a practitioner at a target retailer

1. What is the supported bulk export for your ATS, covering candidates, applications, disposition reasons and attachments? Is it self-serve or a paid professional services engagement, and what lead time were you quoted?
2. Where does your do-not-hire or not-eligible-for-rehire flag physically live, and does it survive that export?
3. Which system actually generates your EEO-1 Component 1 report and, if you are a federal contractor, your applicant flow log? The ATS, the HRIS, or a compliance vendor?
4. Are you a federal contractor through GSA, pharmacy or any other route? Which entity holds the contract?
5. When you last replaced an HR system with charges open, did counsel let you export to an archive, or did they require the old system to stay live? For how long, and what did the parallel run cost?
6. Do you run one payroll or more than one? Is your workforce management on the same vendor as payroll?
7. What issues the store badge, and what provisions the POS login? Is either single sign-on off the corporate directory, or are they separate manual steps?
8. Which of your store locations sit under a Fair Workweek or predictive scheduling ordinance, and what advance notice does that require for a first shift?
9. Do you hold the background check contract, or does your current vendor hold it on your behalf?
10. Which directory do you run, and at what licence tier? Who inside your organisation can grant admin consent to install a provisioning application?

### Questions to put to a vendor's sales engineer

**ADP.** What is the total calendar time from partner application to published, for a partner who has already cleared your security review on another ADP system? Does the two-listing requirement apply once, or per ADP system, given the one-project-per-system rule? If we must support Vantage HCM, Enterprise HR and Lyric, is that three projects and six listings? Who administers the registry entry for the worker hire canonical URI, and can a client practitioner do it without ADP involvement? Is the Worker Hire event API being deprecated in favour of a newer applicant onboarding API? What is the expected delay before the employee identifier becomes available after a hire, and what is the supported way to retrieve it?

**DHS and the E-Verify Contact Center.** Typical elapsed time from web services enrolment to passing technical certification. What is the current Interface Control Agreement version, and what does it contain: endpoints, schemas, rate limits, error codes? Is REST at feature parity with SOAP today, given that the only public statement is in a guide dated September 2019? What are the terms of the employer agent and software developer memorandum, does it permit a platform to act as employer agent for many retail clients at scale, and what liability transfers to us? What throughput is supported at peak-season volume?

**Microsoft.** Does the two thousand call per twenty-four hour inbound provisioning cap survive peak-season retail hiring, and is a higher tier available? What is the practical latency of the asynchronous bulk upload path end to end?

**Checkr.** Elapsed time from first partner contact to production approval, for a platform integration. Is an estimated completion date exposed as an API field, or only in your candidate-facing interface?

**Sterling and First Advantage.** What status values does a screening expose, and is there any per-search or per-jurisdiction decomposition, so a stalled report can be resolved to a specific county? Typical time from credential request to issued client ID.

**iCIMS.** Can a customer obtain their own tenant API credentials, or is that partner-gated? Which write operations are supported for candidates and applications?

**Workday.** What are the Certified Integration and Design Approved criteria, cost and duration? Given Workday now owns Paradox, how are competing frontline hiring products handled in the marketplace?

**UKG.** Who may obtain API access: customers directly, or partners only? Is a marketplace listing required?

**Avature.** Is there any developer documentation? What is the supported export path for candidate and application history?

**Oracle.** Can an external system create a candidate and a job application in Oracle Recruiting Cloud via REST, and what is the authentication model?

**Legion, Blue Yonder and Zebra.** Is there a developer portal, and what is the documented way to write a first shift and read a punch?