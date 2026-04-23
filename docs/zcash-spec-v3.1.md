# Zcash Community Grants (ZCG) — Integration Specification
## FtC × Tor Project Quadratic Funding Campaign

**Status:** Draft  
**Author:** Funding the Commons / Commons Lab  
**Purpose:** Define how Zcash-aligned projects participate in a multi-chain quadratic funding round

---

## 1. Overview

This document specifies how projects funded by or aligned with the Zcash ecosystem can participate in the FtC × Tor Project quadratic funding campaign.

The system introduces a complementary funding layer to ZCG:

- **ZCG** → structured, committee-reviewed grants  
- **FtC Campaign** → open, community-driven quadratic funding  

The goal is to:
- Enable Zcash projects to receive additional funding
- Introduce donor signaling into allocation decisions
- Preserve Zcash’s privacy guarantees while maintaining auditability

---

## 2. Design Principles

### 2.1 Privacy-Preserving Transparency

- Donor privacy is preserved at all times
- Recipient flows must be observable for matching eligibility
- Shielded transactions are supported via **view keys (read-only access)**

---

### 2.2 Non-Custodial

- Funds are never held by the campaign infrastructure
- All donations go directly to project-controlled addresses

---

### 2.3 Minimal Scope

- This is **not a blockchain indexer**
- Only a known set of addresses are tracked
- No smart contracts or on-chain governance

---

### 2.4 Off-Chain Matching

- Matching is computed off-chain
- Based on donation data
- Fully auditable and reproducible

---

## 3. Participation Model

### 3.1 Eligible Projects

Projects may participate if they:

- Are current or past ZCG grantees, OR  
- Are aligned with Zcash ecosystem goals (subject to approval)

---

### 3.2 Required Configuration

Each project must submit a configuration artifact (YAML or JSON):

```yaml
project:
  id: "example-project"
  name: "Example Zcash Project"
  description: "Short summary"
  zcash:
    t_address: "t1..."        # recommended
    z_address: "zs..."        # optional
    view_key: "zxview..."     # required if z_address is provided