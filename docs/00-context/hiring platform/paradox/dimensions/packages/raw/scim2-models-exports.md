<!-- source: https://pypi.org/pypi/scim2-models/json + https://raw.githubusercontent.com/python-scim/scim2-models/main/scim2_models/__init__.py · captured_at: 2026-08-09 · method: registry-metadata + source-read of the public __init__.py -->

# `scim2-models` — public API surface

**Ownership correction (read this first):** this is the **upstream `python-scim`/Yaal Coop** package on
PyPI, not a Paradox publish. `ParadoxAi/scim2-models` on GitHub is a private fork (2 commits ahead / 192
behind, see `paradoxai-scim2-models-fork.json`) that consumes this library — the surface below is what
Paradox's engineering team is building against, not code Paradox wrote or ships publicly.

## Package shape

- Single top-level Python package `scim2_models`, Pydantic v2-based (`pydantic[email]>=2.12.0`).
- No `exports`-map equivalent (Python has no subpath-export gating) — the entire surface is re-exported
  flat from `scim2_models/__init__.py`.

## Public symbol catalog (from `__init__.py`, grouped)

**RFC 7644 protocol/message envelopes**
`BulkOperation`, `BulkRequest`, `BulkResponse`, `Error`, `ListResponse`, `Message`, `PatchOp`,
`PatchOperation`, `ResponseParameters`, `SearchRequest`

**RFC 7643 core resource types**
`User` (+ `Address`, `Email`, `Entitlement`, `GroupMembership`, `Im`, `Name`, `PhoneNumber`, `Photo`,
`Role`, `X509Certificate`), `Group` (+ `GroupMember`), `EnterpriseUser` (+ `Manager`), `ResourceType`,
`Schema`, `ServiceProviderConfig` (+ `AuthenticationScheme`, `Bulk`, `ChangePassword`, `ETag`, `Filter`,
`Patch`, `Sort`)

**Base / generic model plumbing**
`BaseModel`, `Resource`, `AnyResource`, `Extension`, `AnyExtension`, `Meta`, `ComplexAttribute`,
`MultiValuedComplexAttribute`

**Field-level annotations (mutability/uniqueness/return semantics — the SCIM schema metadata layer)**
`CaseExact`, `Mutability`, `Required`, `Returned`, `Uniqueness`, `Context`,
`CreationRequestContext`/`CreationResponseContext`, `PatchRequestContext`/`PatchResponseContext`,
`QueryRequestContext`/`QueryResponseContext`, `ReplacementRequestContext`/`ReplacementResponseContext`,
`SearchRequestContext`/`SearchResponseContext`, `SCIMSerializer`, `SCIMValidator`

**References & paths**
`URI`, `External`, `ExternalReference`, `Reference`, `URIReference`, `URN`, `Path`

**Exceptions**
`SCIMException` (+ `InvalidFilterException`, `InvalidPathException`, `InvalidSyntaxException`,
`InvalidValueException`, `InvalidVersionException`, `MutabilityException`, `NoTargetException`,
`PathNotFoundException`, `SensitiveException`, `TooManyException`, `UniquenessException`)

## What this tells us about Paradox

Paradox's fork touches exactly `PatchOp` (commit: "Adjust the PatchOp model") and the `User`/manager
mutability path (commit: "CoreUser has no attribute 'manager' when validating mutability" — note "CoreUser"
in the commit message doesn't match any symbol in the current upstream `__init__.py`; either an older
upstream version had a `CoreUser` type, or it's an internal wrapper class name in Paradox's own code that
calls into this library). Both patched areas are squarely in the **SCIM PATCH-request / User-provisioning**
path — consistent with Paradox consuming (or serving) SCIM `PATCH /Users/{id}` calls, the standard
operation an HRIS/IdP (Workday, SAP SuccessFactors, Okta, Azure AD) uses to push incremental user updates
to a downstream SaaS app. This is a real, if narrow, corroboration of enterprise-identity-provisioning
plumbing in Paradox's stack — just not evidence of a Paradox-published package.
