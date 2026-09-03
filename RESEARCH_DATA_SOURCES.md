# NAVPRARAMBH Data Source Research Report

**Date:** September 2, 2026  
**Goal:** Identify authorized, legitimate sources for real job and internship opportunities  
**Constraint:** NO scraping, NO fake data, NO migrations—only official APIs/feeds  

---

## Executive Summary

**🔴 CRITICAL FINDING:** Most major job platforms (LinkedIn, Indeed, Naukri, Internshala, Unstop) **explicitly prohibit third-party aggregation** through their Terms of Service or lack public APIs entirely.

**✅ VIABLE OPTIONS:**
1. Government portals with manual data ingestion (NCS, AICTE)
2. Custom integrations with partners via direct API agreements
3. Community-driven open data sources (with strict license compliance)
4. User-submitted opportunities (crowd-sourced model)

---

## Platform-by-Platform Analysis

### 🇮🇳 GOVERNMENT SOURCES

#### 1. National Career Service (NCS) - ncs.gov.in

| Aspect | Finding |
|--------|---------|
| **Official API?** | ❌ NO - Portal only |
| **Public Feed?** | ⚠️ Unknown - Requires investigation |
| **Authentication** | N/A (public portal) |
| **Legal for 3rd Party?** | ✅ YES - Government data, public service |
| **Available Fields** | Job title, company, location, salary, skills |
| **Storage in Supabase** | ✅ YES |
| **Attribution Required** | ✅ YES - Link to NCS required |
| **Refresh Capability** | Manual via portal or batch downloads |
| **Scraping Prohibited** | ⚠️ Unknown - Website terms need review |
| **Rate Limits** | N/A (no API) |
| **Cost** | FREE |

**Feasibility Score: 3/5**

**Rationale:**
- ✅ Legitimate government source
- ✅ Legal for display with attribution
- ✅ No API found, but may support data exports
- ⚠️ Requires manual ingestion or negotiation with MoLE
- ⚠️ Refresh frequency unclear

**Next Steps:**
- [ ] Contact NCS (Ministry of Labour & Employment) for data sharing agreement
- [ ] Check if NCS offers bulk data exports or CSV downloads
- [ ] Review website terms for bulk data usage permissions
- [ ] Investigate if NCS has a job API documentation

**Contact:** Ministry of Labour & Employment, New Delhi

---

#### 2. AICTE Internship Portal - internship.aicte-india.org

| Aspect | Finding |
|--------|---------|
| **Official API?** | ❌ NO - Portal only (403 Access Denied) |
| **Public Feed?** | ❌ Unknown - Portal blocked |
| **Authentication** | N/A |
| **Legal for 3rd Party?** | ✅ POSSIBLY - Government internships |
| **Available Fields** | Internship title, duration, stipend, skills |
| **Storage in Supabase** | ✅ YES |
| **Attribution Required** | ✅ YES - AICTE attribution required |
| **Refresh Capability** | Unknown |
| **Scraping Prohibited** | ✅ YES - Access denied suggests protection |
| **Rate Limits** | N/A |
| **Cost** | FREE |

**Feasibility Score: 2/5**

**Rationale:**
- ✅ Official government internship program
- ✅ Legal to reference/promote
- ❌ No public API or documented data access
- ❌ Website access controlled (403 errors)
- ⚠️ Likely requires formal partnership agreement

**Next Steps:**
- [ ] Contact AICTE directly for data partnership
- [ ] Investigate if AICTE publishes internship lists elsewhere
- [ ] Check if registered institutions publish AICTE internship data

**Contact:** All India Council for Technical Education (AICTE)

---

#### 3. India Data Portal (data.gov.in)

| Aspect | Finding |
|--------|---------|
| **Official API?** | ⚠️ MAYBE - Requires investigation |
| **Public Feed?** | ⚠️ Unknown - Access denied (403) |
| **Authentication** | N/A (public data) |
| **Legal for 3rd Party?** | ✅ YES - OGL (Open Government License) India |
| **Available Fields** | Varies by dataset |
| **Storage in Supabase** | ✅ YES |
| **Attribution Required** | ✅ YES - OGL India compliance required |
| **Refresh Capability** | Dataset-dependent |
| **Scraping Prohibited** | ❓ License permits reuse |
| **Rate Limits** | Unknown |
| **Cost** | FREE |

**Feasibility Score: 3/5**

**Rationale:**
- ✅ Official open data portal (OGL licensed)
- ✅ Legal for reuse with attribution
- ⚠️ Current website access restricted
- ⚠️ May have employment/job datasets but search needed
- ⚠️ Requires dataset-by-dataset evaluation

**Next Steps:**
- [ ] Research available employment/job-related datasets on data.gov.in
- [ ] Check dataset licensing terms (OGL compliance)
- [ ] Identify if any ministry publishes job opening data
- [ ] Test API access with proper headers

**Datasets to Search:**
- Ministry of Labour employment statistics
- AICTE registered internship programs
- Government recruitment notifications

---

### 🌐 PRIVATE SECTOR PLATFORMS

#### 4. LinkedIn Jobs

| Aspect | Finding |
|--------|---------|
| **Official API?** | ✅ YES - linkedin.com/developers |
| **Public Feed?** | ❌ NO - Restricted |
| **Authentication** | OAuth2 + API Key (complex) |
| **Legal for 3rd Party?** | ❌ NO - Explicitly prohibited |
| **Available Fields** | Job title, company, salary, skills, location |
| **Storage in Supabase** | ✅ Technically yes |
| **Attribution Required** | N/A (prohibited) |
| **Refresh Capability** | Real-time API |
| **Scraping Prohibited** | ✅ YES - Violates ToS |
| **Rate Limits** | Yes (partnership-dependent) |
| **Cost** | PAID - Enterprise partnership required |

**Feasibility Score: 1/5** ❌ NOT VIABLE

**Why Not:**
```
LinkedIn Terms of Service explicitly prohibit:
- Scraping or automated collection
- Third-party job aggregation platforms
- Display of LinkedIn jobs on external sites without partnership
- Data resale or redistribution

Quote from LinkedIn: "You may not scrape or copy information 
about members or jobs through any means (including crawlers, 
browser plugins, add-ons, or any other technology or manual work)."
```

**Alternative:** LinkedIn has a limited partnership program for specific use cases. Would require:
- Formal partnership agreement with LinkedIn
- Legal review
- Significant compliance requirements
- $$$$$$ (enterprise pricing)

**Recommendation:** ❌ DO NOT PURSUE

---

#### 5. Indeed - Job Publisher API

| Aspect | Finding |
|--------|---------|
| **Official API?** | ✅ YES - partners.indeed.com |
| **Public Feed?** | ❌ NO - Publisher-only |
| **Authentication** | API Key |
| **Legal for 3rd Party?** | ❌ NO - Aggregators not allowed |
| **Available Fields** | Job listings via publisher feed |
| **Storage in Supabase** | ✅ Technically yes |
| **Attribution Required** | Yes - Back to Indeed |
| **Refresh Capability** | API feed (real-time) |
| **Scraping Prohibited** | ✅ YES - Enforced |
| **Rate Limits** | Yes (API-limited) |
| **Cost** | PAID - Publisher program |

**Feasibility Score: 1/5** ❌ NOT VIABLE

**Why Not:**
```
Indeed Publisher API is for:
- Job publishers posting their own openings
- HR systems integrating with Indeed
- Recruiting software (with proper licensing)

NOT for:
- Third-party job aggregation
- Cross-posting without employer consent
- Scraping or data collection

API explicitly documented for publishers only.
```

**Recommendation:** ❌ DO NOT PURSUE

---

#### 6. Naukri.com

| Aspect | Finding |
|--------|---------|
| **Official API?** | ❌ NO - No public API |
| **Public Feed?** | ❌ NO |
| **Authentication** | N/A |
| **Legal for 3rd Party?** | ❌ NO - ToS prohibits it |
| **Available Fields** | N/A |
| **Storage in Supabase** | ❌ Not permitted |
| **Attribution Required** | N/A |
| **Refresh Capability** | N/A |
| **Scraping Prohibited** | ✅ YES - Explicitly forbidden |
| **Rate Limits** | N/A |
| **Cost** | N/A |

**Feasibility Score: 0/5** ❌ BLOCKED

**Why Not:**
```
Naukri.com Terms of Service explicitly prohibit:
- Scraping, bots, automated collection
- Republishing content on third-party sites
- API access without formal partnership

Website actively blocks crawlers and scrapers.
```

**Recommendation:** ❌ DO NOT PURSUE

---

#### 7. Internshala

| Aspect | Finding |
|--------|---------|
| **Official API?** | ❌ NO - `/api` returns 404 |
| **Public Feed?** | ❌ NO |
| **Authentication** | N/A |
| **Legal for 3rd Party?** | ❌ NO - ToS prohibits it |
| **Available Fields** | Internships, courses, jobs |
| **Storage in Supabase** | ❌ Not permitted |
| **Attribution Required** | N/A |
| **Refresh Capability** | N/A |
| **Scraping Prohibited** | ✅ YES - Actively enforced |
| **Rate Limits** | N/A |
| **Cost** | N/A |

**Feasibility Score: 0/5** ❌ BLOCKED

**Why Not:**
```
Internshala Terms of Service:
- No public API
- Scraping and data extraction strictly prohibited
- Internship listings are proprietary content
- Active bot detection and blocking
```

**Recommendation:** ❌ DO NOT PURSUE

---

#### 8. Unstop (formerly HackerEarth Competitions)

| Aspect | Finding |
|--------|---------|
| **Official API?** | ❌ NO - Requires authentication |
| **Public Feed?** | ❌ NO - Cookies/session required |
| **Authentication** | Web session (browser cookies) |
| **Legal for 3rd Party?** | ❌ NO - ToS prohibits extraction |
| **Available Fields** | Competitions, internships, jobs |
| **Storage in Supabase** | ❌ Not permitted |
| **Attribution Required** | N/A |
| **Refresh Capability** | N/A |
| **Scraping Prohibited** | ✅ YES - Enforced via authentication |
| **Rate Limits** | N/A |
| **Cost** | N/A |

**Feasibility Score: 0/5** ❌ BLOCKED

**Why Not:**
```
Unstop access model:
- No public API
- Content behind login/cookies
- Terms explicitly prohibit scraping
- Active session tracking prevents automation
```

**Recommendation:** ❌ DO NOT PURSUE

---

### 📊 OPEN SOURCE / ALTERNATIVE SOURCES

#### 9. Remote.ok (Crowdsourced Remote Jobs)

| Aspect | Finding |
|--------|---------|
| **Official API?** | ⚠️ UNDOCUMENTED - But requests work |
| **Public Feed?** | ✅ YES - Jobs are public |
| **Authentication** | None required |
| **Legal for 3rd Party?** | ⚠️ UNCERTAIN - ToS needs review |
| **Available Fields** | Job title, company, link, tags, remote type |
| **Storage in Supabase** | ✅ YES |
| **Attribution Required** | ✅ YES - Source attribution |
| **Refresh Capability** | Real-time via API calls |
| **Scraping Prohibited** | ⚠️ UNKNOWN - ToS review needed |
| **Rate Limits** | No documented limits |
| **Cost** | FREE |

**Feasibility Score: 4/5** ⚠️ POSSIBLE WITH CAUTION

**Rationale:**
- ✅ Data appears to be public
- ✅ No authentication required
- ✅ Undocumented but functional API
- ⚠️ Terms of Service compliance uncertain
- ⚠️ Crowdsourced data (may include low-quality listings)
- ⚠️ No formal partnership/agreement

**Next Steps:**
- [ ] **Review Remote.ok ToS** for third-party use restrictions
- [ ] Reach out to Remote.ok for data partnership/usage agreement
- [ ] Evaluate data quality (deduplicate, verify sources)
- [ ] Test API stability and rate limiting
- [ ] Implement proper attribution/backlinks

**Risk:** Medium - Need explicit permission from Remote.ok

**Recommended Approach:** Contact Remote.ok for partnership agreement before implementation

---

### 🏛️ POSSIBLE GOVERNMENT SOLUTIONS

#### 10. Direct Ministry Partnerships

**Potential Partners:**
- **Ministry of Labour & Employment** (NCS oversight)
- **Ministry of Education** (AICTE oversight)
- **Ministry of Skill Development & Entrepreneurship** (NSDM, apprenticeships)
- **NASSCOM** (tech industry association, may have job database)

**Approach:**
1. Formal letter requesting data partnership
2. Demonstrate educational benefit for student platform
3. Agree to proper attribution and usage terms
4. Sign data sharing agreement
5. Implement secure data ingestion pipeline

**Timeline:** 2-4 weeks for initial contact/response

---

## FEASIBILITY MATRIX

| Source | API | Legal | India-Focused | Feasibility | Recommendation |
|--------|-----|-------|----------------|-------------|-----------------|
| NCS Portal | ❌ | ✅ | ✅ | 3/5 | ⚠️ Negotiate partnership |
| AICTE Portal | ❌ | ✅ | ✅ | 2/5 | ⚠️ Formal request needed |
| LinkedIn | ✅ | ❌ | ✅ | 1/5 | ❌ DO NOT USE |
| Indeed | ✅ | ❌ | ✅ | 1/5 | ❌ DO NOT USE |
| Naukri | ❌ | ❌ | ✅ | 0/5 | ❌ PROHIBITED |
| Internshala | ❌ | ❌ | ✅ | 0/5 | ❌ PROHIBITED |
| Unstop | ❌ | ❌ | ✅ | 0/5 | ❌ PROHIBITED |
| Remote.ok | ✅ | ⚠️ | ❌ | 4/5 | ⚠️ Verify ToS first |
| Data.gov.in | ⚠️ | ✅ | ✅ | 3/5 | ⚠️ Dataset search needed |

---

## RECOMMENDED STRATEGY

### Phase 1: Immediate (Week 1)
**Goal:** Secure legitimate data sources

**Option A: Government Partnership** (Preferred)
1. Contact Ministry of Labour & Employment about NCS data partnership
2. Contact AICTE for internship data sharing
3. Target: Official, free, legal, comprehensive coverage of opportunities

**Option B: Open Data Investigation** (Parallel)
1. Search data.gov.in for employment/job datasets
2. Review licensing terms (OGL compliance)
3. Check if ministries publish job opening notifications

**Option C: Remote.ok Verification** (Lower Priority)
1. Review Remote.ok Terms of Service
2. Contact founder/admin for partnership inquiry
3. Negotiate data usage agreement
4. Note: Remote-only, may not serve India-specific opportunities well

### Phase 2: Implementation (Week 2-3)
Once partnership established:
1. Design ingestion pipeline
2. Create data transformation scripts
3. Validate Supabase storage (no migrations needed)
4. Test dashboard display with real data
5. Implement proper attribution/source links

### Phase 3: Production (Week 4+)
1. Set up automated refresh schedule
2. Monitor data quality
3. Handle errors and missing data gracefully
4. Display source attribution on dashboard

---

## WHAT NOT TO DO ❌

```
DO NOT:
❌ Scrape LinkedIn (violates ToS, legal risk)
❌ Scrape Indeed (violates ToS, legal risk)
❌ Scrape Naukri (violates ToS, legal risk)
❌ Scrape Internshala (violates ToS, legal risk)
❌ Scrape Unstop (violates ToS, legal risk)
❌ Use undocumented APIs without ToS review
❌ Republish content without attribution
❌ Store data without understanding license terms
❌ Create fake data (violates project rules)
❌ Disable RLS to work around data issues
❌ Ignore copyright/intellectual property laws
```

---

## LEGAL / COMPLIANCE NOTES

### Data Sharing Agreements
When approaching government or private partners:
1. **Clearly state:** This is an educational, non-profit student platform
2. **Offer:** Proper attribution and backlinks to source
3. **Commit:** No republication without permission
4. **Provide:** Regular usage reports if requested
5. **Implement:** Terms of Service compliance

### Attribution Requirements
For ANY external data source:
```html
<!-- Example attribution for job listing -->
<p class="text-xs text-slate-500">
  Source: <a href="https://ncs.gov.in" rel="external">National Career Service</a>
  • Last updated: [date]
</p>
```

### License Compliance
- **OGL (India)**: Allows reuse with attribution
- **CC-BY**: Allows reuse with attribution
- **Public Domain**: No restrictions
- **Proprietary**: Requires written permission

---

## TIMELINE & NEXT ACTIONS

### Immediate (Today)
- [x] Document all API/feed investigation
- [x] Create feasibility matrix
- [x] Identify compliance risks

### This Week
- [ ] Contact NCS (Ministry of Labour & Employment)
- [ ] Contact AICTE for partnership inquiry
- [ ] Search data.gov.in for relevant datasets
- [ ] Review Remote.ok ToS

### Next Week
- [ ] Follow up with government contacts
- [ ] Prepare formal data partnership proposal
- [ ] Draft data ingestion specification
- [ ] Design attribution/credit system

### Implementation (Post-Approval)
- [ ] Build data pipeline
- [ ] Transform data to Supabase schema
- [ ] Test dashboard integration
- [ ] Deploy with proper attribution

---

## CONCLUSION

**The honest assessment:**

The NAVPRARAMBH dashboard shows empty states not because of a bug, but because **real data requires real partnerships**. The platform is architecturally sound and legally compliant.

To populate it with genuine opportunities:

1. **Best Path**: Negotiate official data partnerships with government portals (NCS, AICTE)
2. **Alternative**: Search for relevant open datasets (data.gov.in)
3. **Fallback**: Carefully review and contact emerging platforms (Remote.ok)

**What NOT to do**: Scraping major job platforms is illegal, unethical, and unnecessary when legitimate alternatives exist.

NAVPRARAMBH can become a trusted source for real opportunities—the right way.

---

**Report prepared for:** NAVPRARAMBH Platform  
**Prepared by:** Architecture Review  
**Date:** September 2, 2026  
**Status:** Ready for partnership outreach
