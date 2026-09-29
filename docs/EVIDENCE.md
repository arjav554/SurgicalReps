# Evidence register

Every graded statement in Mental Reps cites a published source (see [CONTENT_POLICY.md](CONTENT_POLICY.md)).
This register records, for each case, **what it teaches, where that comes from, and how it was verified**, so
faculty can audit content without reading the JSON. `npm run verify:sources` separately confirms every PMID
and DOI against PubMed and doi.org (title, first author, volume, pages).

## Verification levels

| Level | Meaning |
|---|---|
| **FT** | Checked against the full text: PMC, the journal's open-access version, or the issuing body's own published document. Wording, numbers, and grades match. |
| **AB** | Checked against the PubMed abstract only. Only what the abstract states is used; recommendation numbers and grades are never quoted from an abstract. |

There is no third level. A teaching point that cannot be verified at FT or AB is removed, not kept as "standard
teaching" (the previous register's **ST** level was retired in this audit).

## Audit of 2026-09-28/29: corrections

Rewritten under the new policy. Each item below was either re-sourced or changed to match its source.

| Case | Problem found | Fix |
|---|---|---|
| All | Rationales did not name their sources; references had no PMIDs/DOIs. | Every rationale now carries `cite`; every reference has identifiers verified against PubMed. |
| Acute cholecystitis | TG18 Grade III numeric thresholds (dopamine dose, PaO2/FiO2, creatinine, INR, platelets) could not be read: the TG18/TG13 tables are images on a site that blocks access. | Feedback now teaches what the TG07 full text states (Grade III = organ dysfunction) and what TG18 practice papers confirm for Grade II. |
| Acute cholecystitis | "Pericholecystic fluid is not a Grade II criterion" could not be verified. | Distractor replaced with one the sources address (fever and leukocytosis are diagnostic signs). |
| Acute cholecystitis | Strasberg 1995 was cited for the CVS criteria but has no abstract and could not be read. | Replaced by the ACS Bulletin (2025) and TG18 safe steps, both read. |
| Acute cholecystitis | "Subtotal preferred over fundus-first" was attributed to the multi-society guideline (Brunt 2020), whose full text could not be accessed. | Now sourced to WSES 2020 and the ACS Bulletin. "Call a second surgeon" removed (unverifiable). |
| Acute cholecystitis | "Retained stones cause recurrent symptoms" was unsourced (ST). | Sourced: Elshaer 2015 meta-analysis (retained stones 3.1%) and Strasberg 2016 (remnant can form stones). |
| Acute appendicitis | AIR bands taught as 0–4 / 5–8 / 9–12; the 2021 validation study moved the low band to 0–3. "Low (0–4): score 4" would now be wrong. | Bands stated as both original and revised; distractor changed to a score of 3. |
| Acute appendicitis | "Long stump → stump appendicitis" was unsourced (ST). | Sourced: Manatakis 2019 systematic review (stump > 0.5 cm). |
| Gallstone pancreatitis | "Low-grade fever reflects sterile inflammation" is not how ACG 2024 puts it. | Now: early SIRS can mimic sepsis; stop antibiotics when cultures are negative with no source (ACG 2024 text). |
| Adhesive SBO | "Avoid barium" was unsourced (ST); no guideline read addresses it. | Distractor replaced by serial plain films, which Bologna 2017 addresses directly. |
| Adhesive SBO | "Wrap in warm saline; compromised bowel usually recovers" was unsourced (ST). | Re-sourced to the WSES 2025 ICG consensus: clinical viability signs are unreliable; assess perfusion before resecting. |
| Adhesive SBO | Level labels "(IB)", "(IIB)" quoted from a table that is not in the accessible text. | Removed; statements kept as the text states them. |
| Perforated peptic ulcer | "Stop NSAIDs" was unsourced (ST). | Sourced: JSGE 2020 peptic ulcer guideline (NSAIDs discontinued for NSAID ulcers). |
| Perforated peptic ulcer | "Endoscopic closure gives no source control"; "longer antibiotics add toxicity" were unsourced. | Replaced by the WSES rationale (clips fail in fibrotic tissue) and STOP-IT data. |
| Diverticulitis | "Plain films cannot stage", "anastomosis in shock will leak", "repeat colonoscopy low-yield" were unsourced. | Replaced with WSES 2020 and LADIES statements. |
| TAPP hernia | "Reduce cord lipoma" was unsourced (ST). | Sourced: Lilly & Arregui 2002 and Carilli 2004 (cohorts); HerniaSurge 2023 notes TAPP's limits in recognizing lipomas. |
| TAPP hernia | Daes & Felix 2017 (a letter with no abstract) was cited for parietalization. | Removed; parietalization sourced to Furtado 2019 full text. |
| Trauma | Tension pneumothorax "treat before imaging" was unsourced (ST). | Sourced: WSES 2025 needle-decompression meta-analysis (life-threatening; immediate decompression first-line). |
| Trauma | Crystalloid, vasopressor, hemoglobin, CT-in-unstable, and hypothermia rationales were unsourced. | Re-sourced to the European trauma bleeding guideline, 6th edition (2023), full text. |
| Trauma | WSES pelvic grades "(1A)" for compression and angioembolization, and "(2A)" for time to control, did not match the full text. | Grades corrected to the text: binder vs sheet (1C), preperitoneal packing (1B), angioembolization consideration (2A). |
| Trauma | "Record the tourniquet time" could not be sourced. | Removed. |
| Central line | "Needle-only arterial puncture: withdraw and compress" was unsourced (ST). | Re-sourced to Guilbert 2008 (needle puncture often harmless; danger is unrecognized dilation) and ASA 2020 (manometry catches punctures that blood color misses). "Compress" removed. |
| Central line | "Dark hypoxemic arterial blood", "never event", "pulling causes pseudoaneurysm", time-out item were unsourced. | Replaced with ASA 2020 text (case-report harms; immediate removal led to stroke, AV fistula, hemothorax) and Guilbert 2008 (47% major complications with pull/pressure). Time-out option removed. |
| Safety checklist | The WHO checklist PDF could not be retrieved (WHO repository blocks automated access). Items not confirmed elsewhere were: allergy/airway/blood loss, antibiotics within 60 min, critical events, specimen label read aloud with patient name. | Case restricted to items confirmed in a published audit (Gul 2022) and WHO's own pages; the airway decision and antibiotic-timing item were removed. |

## Case evidence maps

<a id="lap-chole"></a>
### Laparoscopic Cholecystectomy (`lap-chole.json` + `lap-chole.meta.json`)
The graph is kept verbatim from the product spec; only citations and metadata are layered on.

| Teaching point | Source | Level |
|---|---|---|
| CVS = hepatocystic triangle cleared, lower third off the liver, two and only two structures | ACS Bulletin 2025 (Peregrin) | FT |
| Fulfil all three CVS criteria before dividing any structure; CVS prevents misidentifying the cystic duct and CBD | TG18 safe steps (Wakabayashi 2018) | AB |
| Bile duct injury is the most common serious complication of laparoscopic cholecystectomy | Brunt 2020 | AB |

<a id="acute-cholecystitis"></a>
### Acute Cholecystitis: The Difficult Gallbladder (`acute-cholecystitis.json`)
| Teaching point | Source | Level |
|---|---|---|
| Diagnosis: local sign + systemic sign, confirmed on imaging | TG07 (Hirota 2007); TG13 (Yokoe 2013) | FT / AB |
| Grade III = organ dysfunction; Grade II = WBC >18,000/mm³, palpable tender mass, >72 h, marked local inflammation on imaging | TG07 full text; Turan 2025 (TG18 criteria applied) | FT / FT |
| TG18 adopted the TG13 criteria unchanged; elderly age is not itself a severity criterion | TG18 (Yokoe 2018); TG07 | AB / FT |
| Grade I with CCI ≤5 and ASA-PS ≤2 → early Lap-C; drainage for those unsuitable for early surgery | TG18 flowchart (Okamoto 2018) | AB |
| Dissect above the Rouvière's sulcus–segment 4 line; three CVS criteria before dividing | TG18 safe steps | AB |
| CVS criteria; CBD exposure not required; subtotal preferred when CVS cannot be obtained | ACS Bulletin 2025 | FT |
| Intraoperative biliary imaging for uncertain anatomy is one of two strong recommendations | Brunt 2020 | AB |
| Bail-out when scarring prevents CVS | TG18 safe steps | AB |
| Subtotal cholecystectomy recommended for the difficult gallbladder; bile leaks managed with drainage ± stent | WSES 2020 (Pisano) | FT |
| Subtotal: bile duct injury 0.08%, retained stones 3.1%, bile leak 18% | Elshaer 2015 | AB |
| Fenestrating vs reconstituting: fistula vs recurrent stones | Strasberg 2016 | AB |

<a id="gallstone-pancreatitis"></a>
### Acute Gallstone Pancreatitis (`gallstone-pancreatitis.json`)
| Teaching point | Source | Level |
|---|---|---|
| 2-of-3 diagnosis; no routine admission CT; CT/MRI if not improving at 48–72 h | ACG 2024 (Tenner); Revised Atlanta | FT / AB |
| Transabdominal US in all; avoid diagnostic ERCP; pancreatitis is ERCP's most common complication | ACG 2024 | FT |
| 10 mL/kg bolus if hypovolemic, then ≤1.5 mL/kg/h, with reassessment | ACG 2024 | FT |
| Aggressive resuscitation: fluid overload 20.5% vs 6.3% | WATERFALL 2022 | AB |
| No prophylactic antibiotics; SIRS can mimic sepsis; stop antibiotics if cultures negative | ACG 2024 | FT |
| Early low-fat solid diet as tolerated; avoid parenteral nutrition | ACG 2024 | FT |
| Urgent ERCP only for cholangitis (APEC: no reduction in major complications, 38% vs 44%) | ACG 2024; APEC 2020 | FT / AB |
| Mild / moderately severe / severe definitions | Revised Atlanta 2012 | AB |
| Same-admission cholecystectomy: recurrent events 17% → 5% | PONCHO 2015 | AB |

<a id="acute-appendicitis"></a>
### Acute Appendicitis (`acute-appendicitis.json`)
| Teaching point | Source | Level |
|---|---|---|
| AIR item points (0–12); bands 0–4/5–8/9–12, revised low band 0–3 | Andersson 2021 validation (Table 1 via PMC); Andersson 2008 | FT / AB |
| Clinical scores (AIR, AAS) recommended (1A); imaging for intermediate risk (2B) | WSES 2020 | FT |
| POCUS first-line (1B); low-dose over standard-dose CT (1A) | WSES 2020 | FT |
| Antibiotic-first only without appendicolith; CODA: 41% appendectomy, complications 20.2 vs 3.6/100 | WSES 2020; CODA 2020 | FT / AB |
| Operate within 24 h (1B); delay within 24 h safe | WSES 2020; WSES 2025 | FT / AB |
| Single preop dose; no postop antibiotics if uncomplicated | WSES 2020 | FT |
| Laparoscopic over open; three-port over SILS; ligation techniques; suction not irrigation; no drains; remove a normal-looking appendix | WSES 2020 | FT |
| Postop antibiotics 2–3 days in complicated disease; STOP-IT ~4 vs ~8 days similar | WSES 2025; STOP-IT | AB / AB |
| Stump > 0.5 cm → stump appendicitis, often late and more extensive surgery | Manatakis 2019 | AB |

<a id="adhesive-sbo"></a>
### Adhesive Small Bowel Obstruction (`adhesive-sbo.json`)
| Teaching point | Source | Level |
|---|---|---|
| Exam sensitivity for strangulation 48%; plain films miss early strangulation; CT ~90% accurate | Bologna 2017 | FT |
| Closed loop / ischemia / free fluid → surgery without delay; NOM always tried otherwise | Bologna 2017 | FT |
| NOM succeeds in 70–90%; NG decompression, fluids, electrolytes (low K common) | Bologna 2017 | FT |
| Recurrence slightly lower after surgery is not a reason to operate | Bologna 2017 | FT |
| Water-soluble contrast at 24 h predicts failure and shortens stay; 72 h trial limit | Bologna 2017 | FT |
| Contrast in colon at 4–24 h: sensitivity 96%, specificity 98% | Branco 2010 meta-analysis | AB |
| Clinical viability signs unreliable (36% of viable segments judged viable); ICG to assess perfusion before resecting | WSES ICG consensus 2025 | FT |

<a id="perforated-peptic-ulcer"></a>
### Perforated Peptic Ulcer (`perforated-peptic-ulcer.json`)
| Teaching point | Source | Level |
|---|---|---|
| CT recommended (1C); X-ray only if CT not promptly available (1C); free air on X-ray in 30–85% | WSES 2020 (Tarasconi) | FT |
| Antibiotics ASAP (1C); surgery ASAP (1B); −2.4% survival per hour of delay | WSES 2020 | FT |
| No routine NOM (2C); antifungals only if high risk (2C); avoid endoscopic treatment (2C) | WSES 2020 | FT |
| Laparoscopy if stable (2B); open if unstable (1D) because pneumoperitoneum reduces venous return and cardiac output; damage control in septic shock (2D) | WSES 2020 | FT |
| Primary repair <2 cm, no recommendation on omental patch (2C); large gastric ulcer → resection with frozen section (2D) | WSES 2020 | FT |
| Antibiotics 3–5 days (2C); STOP-IT short course | WSES 2020; STOP-IT | FT / AB |
| H. pylori eradication: relapse 4.8% vs 38.1%; acid-reduction surgery unnecessary | Ng 2000 | AB |
| Discontinue NSAIDs for NSAID ulcers | JSGE 2020 (Kamada) | AB |

<a id="acute-diverticulitis"></a>
### Acute Left-Sided Diverticulitis (`acute-diverticulitis.json`)
| Teaching point | Source | Level |
|---|---|---|
| Contrast CT first choice (2B); expert US then CT acceptable (2B) | WSES 2020 (Sartelli) | FT |
| No antibiotics if immunocompetent, uncomplicated, no systemic inflammation (1A); outpatient with re-evaluation ≤7 days (2B) | WSES 2020 | FT |
| Observation did not prolong recovery; stay 2 vs 3 days | DIABOLO 2017 | AB |
| Antibiotics selective in immunocompetent, strongly advised if immunocompromised; colonoscopy by history/last colonoscopy/severity | AGA 2021 | AB |
| Abscess <4–5 cm antibiotics (2C); larger → drainage + antibiotics, surgery if not feasible (2C) | WSES 2020 | FT |
| No routine colonoscopy after CT-proven uncomplicated (2B); colonoscopy 4–6 wk after abscess (2C) | WSES 2020 | FT |
| Hartmann's for critically ill (strong, 2B); primary anastomosis ± stoma if stable (2B); lavage not first-line (2A); damage control (2C) | WSES 2020 | FT |
| Stoma-free survival 94.6% vs 71.7%; similar short-term morbidity/mortality | LADIES 2019 | AB |
| Elective resection by patient factors, not episode count (2D) | WSES 2020; AGA 2021 | FT / AB |
| 4-day postop antibiotics (2B); ~4 vs ~8 days similar | WSES 2020; STOP-IT | FT / AB |

<a id="tapp-inguinal-hernia"></a>
### Laparoscopic Inguinal Hernia Repair (TAPP) (`tapp-inguinal-hernia.json`)
| Teaching point | Source | Level |
|---|---|---|
| Triangle of doom (vas / spermatic vessels; external iliac vessels); triangle of pain (LFCN, femoral branch GFN, femoral nerve) | Furtado 2019 | FT |
| No staples in either triangle; 2 cm above iliopubic tract as safety margin; watch inferior epigastrics | Furtado 2019 | FT |
| Parietalization of cord elements; inferior mesh edge must not fold (potential recurrence) | Furtado 2019 | FT |
| Mesh covering all weak areas with overlap; meshes < 10 × 15 cm "overly small" | Furtado 2019; HerniaSurge 2018 | FT |
| Fix mesh in M3 defects (expert consensus) | HerniaSurge 2018 | FT |
| Peritoneal closure covers mesh, leaves no gaps | Furtado 2019 | FT |
| Cord lipomas: 22.5%; easily overlooked laparoscopically; herniated fat should be treated as hernia | Lilly & Arregui 2002; Carilli 2004; HerniaSurge 2023 | AB / AB / FT |

<a id="trauma-primary-survey"></a>
### Trauma Primary Survey (`trauma-primary-survey.json`)
| Teaching point | Source | Level |
|---|---|---|
| xABCDE: exsanguinating external hemorrhage first | ACS ATLS 11 announcement (2025) | FT |
| Tourniquet for life-threatening extremity bleeding (1B); minimize time to bleeding control (1B) | European trauma guideline 2023 | FT |
| Tension pneumothorax: life-threatening; immediate needle decompression then chest drain; ATLS vs ETC site disagreement | WSES 2025 meta-analysis (Ahmad) | FT |
| 1:1:1: hemostasis 86% vs 78%; exsanguination deaths 9.2% vs 14.6% | PROPPR 2015 | AB |
| TXA 1 g/10 min + 1 g/8 h; benefit ≤3 h (most ≤1 h); harm after 3 h | CRASH-2 2011; European 2023 (1A) | AB / FT |
| Permissive hypotension 80–90 mmHg (1B); noradrenaline only if target not reached (1C); initial Hb may mask bleeding | European trauma guideline 2023 | FT |
| Shock with suspected source → immediate bleeding control (1B); investigation only if no need for immediate control | European trauma guideline 2023 | FT |
| E-FAST can exclude need for laparotomy in unstable pelvic trauma; binder > sheet (1C); PPP (1B); angioembolization consideration (2A); avoid delay to bleeding control | WSES pelvic 2017 | FT |
| Warm and prevent heat loss (1C); hypothermia impairs platelet and coagulation-factor function | European trauma guideline 2023 | FT |

<a id="central-line-ij"></a>
### Ultrasound-Guided IJ Central Line (`central-line-ij.json`)
| Teaching point | Source | Level |
|---|---|---|
| Upper-body site; maximal barrier precautions; chlorhexidine; Trendelenburg; real-time US for IJ | ASA 2020 (ASA final-draft document) | FT |
| US: arterial puncture −72%, first-attempt success +57% | Cochrane 2015 (Brass) | AB |
| Confirm venous placement objectively; not blood color or pulsatility; manometry detects arterial punctures missed by color | ASA 2020 | FT |
| Confirm wire in vein if uncertain; confirm catheter and tip before use | ASA 2020 | FT |
| Verify removed wire is complete; chest radiograph if not; retained-wire harms | ASA 2020 | FT |
| Large-bore arterial cannulation: leave in place and consult; immediate removal caused stroke, AV fistula, hemothorax | ASA 2020 | FT |
| Needle arterial puncture often harmless; unrecognized dilation is devastating; pull/pressure 47% major complications | Guilbert 2008 | AB |

<a id="surgical-safety-checklist"></a>
### WHO Surgical Safety Checklist (`surgical-safety-checklist.json`)
| Teaching point | Source | Level |
|---|---|---|
| Three pauses: before induction, before incision, before leaving the OR; 19 items | WHO safe surgery page; Gul 2022 | FT / FT |
| Sign In: site marked; anesthesia machine, medications, pulse oximeter checked | Gul 2022 | FT |
| Time Out: introductions by name and role; essential imaging displayed | Gul 2022 | FT |
| Sign Out: counts complete; specimen labelling | Gul 2022 | FT |
| Checklist is a verbal, read-aloud team exercise | WHO adaptation guide (2009) | FT |
| Deaths 1.5% → 0.8%; complications 11.0% → 7.0% | Haynes 2009 | AB |
| Checklists: better hazard detection, fewer complications, better communication | Treadwell 2014 systematic review | AB |

<a id="spontaneous-pneumothorax"></a>
### Primary Spontaneous Pneumothorax (`spontaneous-pneumothorax.json`)
| Teaching point | Source | Level |
|---|---|---|
| PSP vs SSP definitions; age > 50 with smoking history managed as SSP (may respond differently to aspiration) | BTS 2023 (Roberts) | FT |
| Size no longer an indication for invasive management (only for safety of intervention); conservative care for minimally symptomatic PSP regardless of size (conditional, consensus) | BTS 2023 | FT |
| Conservative vs interventional: re-expansion at 8 weeks 94.4% vs 98.5% (complete-case), 84.6% of conservative arm needed no intervention, fewer SAEs/recurrence; not robust in sensitivity analysis | Brown 2020 (NEJM) | AB |
| Treatment driven by symptoms rather than size; VATS preferred to thoracotomy | ERS 2015 (Tschopp) | AB |
| Ambulatory management with good support and expertise (conditional); median stay 0 vs 4 days; AEs 55% vs 39%; all 14 SAEs in ambulatory arm | BTS 2023; RAMPP (Hallifax 2020) | FT / AB |
| Aspiration vs drain: stay 2.55 days shorter, recurrence no different, more further procedures (626 vs 240/1000); recurrence after drain 179 vs 111/1000 after conservative care | BTS 2023 (Table 4) | FT |
| Drain: higher immediate success (RR for aspiration 0.78); aspiration −1.66 days stay; no difference in 1-year success | Cochrane 2017 (Carson-Chahhoud) | AB |
| High-risk characteristics (tension, significant hypoxia, bilateral, underlying lung disease) → drainage when safe | BTS 2023 pathway as summarized by Subedi 2023 (pathway figure is an image in the guideline) | FT |
| Surgery at first presentation only if recurrence prevention important (tension, high-risk occupation); discuss least invasive option | BTS 2023 | FT |
| Persistent air leak despite 5–7 days of drainage / failure to re-expand, and synchronous bilateral SP, are accepted indications for surgical advice; no evidence for suction; blood patch or endobronchial therapy if unfit for surgery | BTS 2023 | FT |
| VATS vs thoracotomy: stay 3.66 days shorter, complications 99 vs 138/1000, recurrence 31 vs 15/1000; thoracotomy for lowest-risk occupations; pleurodesis and/or bullectomy | BTS 2023 (Table 5, A4/A5) | FT |
| No evidence for elective surgery after first episode; consider for divers/pilots/military/tension; should consider after second ipsilateral or first contralateral | BTS 2023 | FT |
| Recurrence 32% overall, highest in first year; smoking cessation OR 0.26 | Walker 2018 | AB |
| Discharge: return with breathlessness; respiratory follow-up, CXR 2–4 weeks after observation/aspiration; fly 7 days after X-ray shows resolution; diving discouraged unless definitive prevention (e.g. pleurectomy); stop smoking | BTS 2023 | FT |

<a id="acute-aortic-dissection"></a>
### Acute Aortic Dissection (`acute-aortic-dissection.json`)
| Teaching point | Source | Level |
|---|---|---|
| ADD-RS items (conditions / pain / exam incl. pulse deficit or SBP differential); 2–3 = high risk | ACC/AHA 2022 (Isselbacher), Table 24 | FT |
| Low risk score + D-dimer < 500 ng/mL may exclude AAS; ADD-RS ≤ 1 / DD− failure rate 0.3% | ACC/AHA 2022; ADvISED (Nazerian 2018) | FT / AB |
| CT for initial imaging (COR 1, C-LD); CXR neither sensitive nor specific | ACC/AHA 2022 | FT |
| CXR normal in 12.4%; pulse deficit in 15.1%; type A mortality 26% surgical vs 58% without surgery | IRAD (Hagan 2000) | AB |
| Anti-impulse therapy with arterial line in ICU; SBP < 120 or lowest perfusing; HR 60–80; IV beta-blocker first; vasodilator only after (reflex tachycardia); IV opioids, avoid IV NSAIDs | ACC/AHA 2022 §7.3.1 | FT |
| Type A: immediate surgery (COR 1); unoperated mortality ~1%/h; medical 2–3× surgical mortality; IRAD surgical 25%→18% (1995–2013), medical 57% | ACC/AHA 2022 §7.4.1.1; IRAD 20-year (Evangelista 2018) | FT / AB |
| Malperfusion: immediate ascending repair for renal/mesenteric/limb malperfusion (COR 1); mesenteric-first reperfusion reasonable (2a); malperfusion syndrome mortality 30.5% vs 6.2% | ACC/AHA 2022 §7.4.1.2 | FT |
| Operative plan: valve resuspension (COR 1), open distal anastomosis (COR 1), hemiarch over total arch (COR 1; STS 16% vs 27%), axillary cannulation (2a), cerebral perfusion (2a) | ACC/AHA 2022 §7.4.1.3 | FT |
| Uncomplicated type B: medical therapy first (COR 1); TEVAR may be considered with high-risk features (>40 mm, false lumen > 20–22 mm, entry tear > 10 mm) (2b); IRAD open 32.1% vs medical 9.6% vs percutaneous 6.5% | ACC/AHA 2022 §7.4.2, Table 28 | FT |
| INSTEAD-XL: 5-year aorta-specific mortality 6.9% vs 19.3% with pre-emptive TEVAR | Nienaber 2013 | AB |
| Complicated type B (Table 27): intervention (COR 1); TEVAR over open for rupture, reasonable for other complications; lower emergency morbidity/mortality | ACC/AHA 2022 §7.4.2 | FT |
| Long-term beta-blocker ± ARB/ACEI (COR 1); CT/MRI at 1, 6, 12 months then yearly (COR 1); screen first-degree relatives (COR 1); expansion in 20–50% of medically managed type B over 4 years | ACC/AHA 2022 §7.3.2, §7.8, §6 | FT |

<a id="pleural-infection"></a>
### Pleural Infection and Empyema (`pleural-infection.json`)
| Teaching point | Source | Level |
|---|---|---|
| Immediate pH when aspirate is not frank pus (strong); pH ≤ 7.2 → drain if safe; 7.2–7.4 → LDH > 900 IU/L plus fever/volume/low glucose/CT enhancement/septations → consider drain; ≥ 7.4 → no immediate drainage; glucose < 3.3 mmol/L if no pH; heparin/LA lower pH, delay/air raise it; review + repeat tap if undrained | BTS 2023 (Roberts) §C2 | FT |
| LDH and glucose less accurate than pH; conventional culture 50–60% sensitive at best; blood culture bottles raise yield | BTS 2023 | FT |
| RAPID items and bands (0–2 low, 3–4 medium, 5–7 high); use to risk-stratify and inform discussion (conditional) | BTS 2023 Table 18 | FT |
| PILOT: 3-month mortality 2.3% / 9.2% / 29.3% by RAPID band | Corcoran 2020 | AB |
| No evidence that early tPA/DNase or surgery benefits high RAPID scores | Subedi 2023 (review of BTS 2023) | FT |
| Small-bore drain ≤ 14F (conditional); bore size no effect on mortality/surgery/LOS, > 14F more pain; early VATS/thoracotomy not over chest tube as initial treatment (GPP) | BTS 2023 §C3 | FT |
| Antibiotics before cultures incl. anaerobic cover (e.g., cefuroxime + metronidazole); 2–6 weeks; IV then oral; nutrition and VTE prophylaxis; fungal < 1% | BTS 2023 (other areas) | FT |
| tPA + DNase for residual collection after drainage stops (conditional, consensus); consent for bleeding; 10 mg tPA + 5 mg DNase twice daily × 3 days; no single agents; no streptokinase | BTS 2023 §C4 | FT |
| MIST2: tPA–DNase surgical referral 4% vs 16%, stay −6.7 days; single agents ineffective; DNase alone referral 39% | Rahman 2011 | AB |
| MIST1: streptokinase death/surgery 31% vs 27%; SAEs 7% vs 3% | Maskell 2005 | AB |
| VATS over thoracotomy (conditional): stay −2.3 days, complications 152 vs 197/1000, mortality 35 vs 47/1000; tailor extent; decortication individualized | BTS 2023 §C5–C6 | FT |

<a id="sigmoid-volvulus"></a>
### Sigmoid Volvulus (`sigmoid-volvulus.json`)
| Teaching point | Source | Level |
|---|---|---|
| Initial workup incl. blood gas and lactate (1C); ischemia possible without peritonitis or hyperlactatemia | WSES 2023 (Tian) Rec 1 | FT |
| Plain films first, coffee bean sign; chest film for free air (1C); CT if doubt or suspected ischemia/perforation (1C); enema contraindicated if perforation suspected; water-soluble over barium | WSES 2023 Rec 2–3 | FT |
| Flexible endoscopic detorsion first line if no ischemia/perforation (1C); success 60–95%, morbidity ~4%; pass transition points, inspect mucosa, leave decompression tube; flexible over rigid (rigid misses ischemia up to 24%); abort if necrosis found | WSES 2023 Rec 4 | FT |
| Non-operative reduction mortality 0.9% vs surgery 15.8% (827 cases) | Oren 2007 | AB |
| Urgent resection if detorsion fails or colon non-viable/perforated (1C); 5–25% present with ischemia; resect without detorsion, minimal handling | WSES 2023 Rec 5 | FT |
| Emergency reconstruction individualized; end colostomy often best when unstable, coagulopathic, acidotic, hypothermic; undiverted anastomosis leaks 7–12% in cited series | WSES 2023 Rec 5 | FT |
| Sigmoid colectomy during index admission (1C); recurrence 43–75% after detorsion alone; elective morbidity/mortality 0–12% | WSES 2023 Rec 4, 6 | FT |
| 61% recurrence at median 31 days after conservative management; no recurrence after surgery | Yassaie 2013 | AB |
| Recurrence after 84% of successful decompressions without planned surgery; mortality 3.3% planned vs 13% emergency | Johansson 2018 | AB |
| Non-resectional operations inferior, avoid (1C): mesosigmoidoplasty 16–21%, sigmoidopexy 29–36% recurrence; detorsion alone 30–35% morbidity, 11–15% mortality | WSES 2023 Rec 7 | FT |
| Endoscopic fixation (PEC) if operative risk prohibitive (2C); Baraza: major complications 10%, minor 37% | WSES 2023 Rec 8 | FT |
| Megacolon → subtotal colectomy (1C); recurrence 82% vs 6% | WSES 2023 Rec 9 | FT |

<a id="fulminant-c-difficile"></a>
### Fulminant C. difficile Colitis (`fulminant-c-difficile.json`)
| Teaching point | Source | Level |
|---|---|---|
| NAAT sensitive/specific; GDH + toxin algorithm; toxin EIA alone not recommended (1B); empirical therapy if strong suspicion of severe CDI (1C) | WSES 2019 (Sartelli) | FT |
| Stop unnecessary antibiotics (1B) and PPIs (1C); contact precautions and soap-and-water hand hygiene (1B), alcohol does not kill spores; anti-peristaltics discouraged (2C) | WSES 2019 | FT |
| Severe = WBC ≥ 15,000/µL or Cr > 1.5 mg/dL; vancomycin 125 mg qid or fidaxomicin 200 mg bid × 10 days (strong/high); metronidazole only for non-severe if others unavailable | IDSA/SHEA 2017 (McDonald), Table 1 | FT |
| Vancomycin or fidaxomicin for all severe CDI (1A); avoid repeated/prolonged metronidazole (neurotoxicity, 1B) | WSES 2019 | FT |
| First recurrence: tapered/pulsed vancomycin or 10-day fidaxomicin (weak); ~25% recur after vancomycin; FMT for multiple recurrences after failed antibiotics (strong) | IDSA/SHEA 2017 | FT |
| Fulminant (shock, ileus, megacolon): vancomycin 500 mg qid PO/NG (strong), rectal vancomycin if ileus (weak), IV metronidazole 500 mg q8h (strong) | IDSA/SHEA 2017 | FT |
| Early surgical consultation with systemic toxicity (1C); supportive care (1C); IVIG adjunct only (2C); mortality lower with surgery before vasopressors, higher after intubation/vasopressors; colectomy adjusted OR 0.70 for death (510 patients) | WSES 2019 | FT |
| Rising WBC ≥ 25,000 or lactate ≥ 5 mmol/L → early surgery may be best hope | IDSA/SHEA 2017 | FT |
| Subtotal colectomy preserving rectum (strong); loop ileostomy + lavage + antegrade vancomycin alternative (weak); WSES 1B for both; 15.9% reoperation when less than whole colon removed | IDSA/SHEA 2017; WSES 2019 | FT |
| Loop ileostomy: colon preserved 93%, mortality 19% vs 50% historical | Neal 2011 | AB |
| EAST multicenter: adjusted mortality 17.2% loop ileostomy vs 39.7% total colectomy | Ferrada 2017 | AB |

<a id="ectopic-pregnancy"></a>
### Tubal Ectopic Pregnancy (`ectopic-pregnancy.json`)
| Teaching point | Source | Level |
|---|---|---|
| Immediate referral with positive test + pain and abdominal/pelvic/cervical motion tenderness; ~1/3 have no risk factors; expectant only < 6 weeks, bleeding, no pain; unstable → straight to emergency department | NICE NG126 §1.4 | FT |
| Transvaginal scan to locate pregnancy; ultrasound signs of tubal ectopic; do not use hCG to locate pregnancy | NICE NG126 §1.5, 1.7, 1.8 | FT |
| Expectant: offer if stable, pain free, < 35 mm, no heartbeat, hCG ≤ 1,000, can return; consider 1,000–1,500; hCG days 2, 4, 7; ≥ 15% falls → weekly until < 20 IU/L | NICE NG126 §1.14 | FT |
| Methotrexate: hCG < 1,500 with criteria (offer); 1,500–5,000 choice of methotrexate or surgery, warn about further intervention; hCG days 4 and 7 then weekly | NICE NG126 §1.15 | FT |
| Surgery first line for significant pain, mass ≥ 35 mm, heartbeat, or hCG ≥ 5,000; laparoscopy whenever possible | NICE NG126 §1.15–1.16 | FT |
| Unstable tubal ectopic → prompt surgical intervention | ACOG PB 193 (2018) abstract | AB |
| Salpingectomy unless infertility risk factors; salpingotomy up to 1 in 5 need further treatment; urine pregnancy test 3 weeks after salpingectomy | NICE NG126 §1.17 | FT |
| ESEP: ongoing pregnancy 60.7% vs 56.2% (NS); persistent trophoblast 7% vs < 1%; 20% converted to salpingectomy | Mol 2014 | AB |
| DEMETER: no difference in 2-year fertility between methotrexate and conservative surgery | Fernandez 2013 | AB |
| 2026 update: no anti-D up to 11+6 weeks for ectopic/miscarriage; offer ≥ 250 IU at 12+0–12+6 with medical/surgical management; no Kleihauer test; information and self-referral | NICE NG126 §1.13, 1.18 | FT |

<a id="postpartum-hemorrhage"></a>
### Postpartum Hemorrhage (`postpartum-hemorrhage.json`)
| Teaching point | Source | Level |
|---|---|---|
| Classic definition > 500 mL vaginal / > 1,000 mL cesarean; ACOG 2017 ≥ 1,000 mL or loss with hypovolemia signs; shock index > 0.9 alerts to instability | FIGO 2022 (Escobar) §3.3, §5 | FT |
| Calibrated drape + bundle: PPH detected 93.1% vs 51.1%; severe PPH/laparotomy/death from bleeding 1.6% vs 4.3% (RR 0.40); bundle = massage, oxytocics, TXA, IV fluids, examination, escalation | E-MOTIVE (Gallos 2023) | AB |
| IV oxytocin first line; uterine massage; crystalloids over colloids; TXA 1 g IV at 1 mL/min within 3 h of birth, second dose if bleeding > 30 min or restarts within 24 h | FIGO 2022 §2.2 | FT |
| TXA: death from bleeding 1.5% vs 1.9% (RR 0.81); within 3 h 1.2% vs 1.7% (RR 0.69); no increase in adverse events | WOMAN 2017 | AB |
| Oxytocin failure → IM ergometrine, oxytocin–ergometrine, or misoprostol 800 µg SL (exclude hypertension for ergometrine); bimanual compression temporizing; no uterine packing after vaginal birth | FIGO 2022 §2.1–2.2 | FT |
| Balloon tamponade after failed uterotonics once retained products/rupture excluded; UAE if available; then compression sutures, uterine/hypogastric ligation, hysterectomy; conservative first, escalate rapidly | FIGO 2022 §2.2 | FT |

<a id="adnexal-torsion"></a>
### Adnexal Torsion (`adnexal-torsion.json`)
| Teaching point | Source | Level |
|---|---|---|
| No clinical/imaging criteria confirm torsion; suspicion → emergent diagnostic laparoscopy; Doppler alone should not guide decisions (normal flow in up to 60% of confirmed cases); WBC/CRP/ESR/pyuria unhelpful; negative laparoscopy (~50%) acceptable | ACOG CO 783 (2019) | FT |
| Ultrasound signs: Doppler findings sens 53%/spec 95%; whirlpool 65%/91%; ovarian edema 58%/86% | Garde 2023 | AB |
| Ultrasound pooled sens 0.79/spec 0.76; Doppler 0.80/0.88; MRI 0.81/0.91 | Wattar 2021 | AB |
| Detorse and preserve regardless of appearance/timing; blue-black ovary not a sign of necrosis; near-normal at 36 h second look; no VTE after detorsion reported; oophorectomy only if unavoidable | ACOG CO 783 | FT |
| Cystectomy not required at detorsion (friable ovary risk); drain large cysts; ultrasound at 6–12 weeks; simple cysts resolve 6–8 weeks; ovulation suppression | ACOG CO 783 | FT |
| Oophoropexy: strongest indications repeat torsion or absent contralateral ovary; insufficient data routinely; recurrence 2–12% | ACOG CO 783 | FT |

<a id="early-endometrial-cancer"></a>
### Early Endometrial Cancer (`early-endometrial-cancer.json`)
| Teaching point | Source | Level |
|---|---|---|
| MMR IHC Lynch pre-screen for all (III, A); molecular classification for all, on biopsy (IV, A); ER IHC for all (IV, A); HER2 for advanced/recurrent p53abn, serous, carcinosarcoma (IV, C); repeat on hysterectomy if new tumor component | ESGO–ESTRO–ESP 2025 (Concin) | FT |
| Standard surgery TH + BSO + nodal staging (II, A); MIS preferred (I, A); no spillage/morcellation (III, A); SLN for presumed uterus-confined (II, A), cervical ICG preferred; failed side → side-specific lymphadenectomy if high-intermediate/high (considered intermediate) (II, A); ultrastaging (II, A) | ESGO–ESTRO–ESP 2025 | FT |
| LACE: 4.5-year DFS 81.6% TLH vs 81.3% TAH (equivalent) | Janda 2017 | AB |
| LAP2: fewer moderate–severe adverse events (14% vs 21%); stay > 2 days 52% vs 94% | Walker 2009 | AB |
| FIRES: SLN sensitivity 97.2%, NPV 99.6% | Rossi 2017 | AB |
| Risk groups (5-year recurrence: low < 8%, intermediate 8–14%, high-intermediate 15–24%, high ≥ 25%); IAm POLEmut = stage I–II POLEmut (low); IICm p53abn = stage I–II p53abn with myoinvasion (high) | ESGO–ESTRO–ESP 2025 | FT |
| Adjuvant: low → none; intermediate → consider VBT (I, A), none an option esp. < 60/low grade; high-intermediate → EBRT (II, A) or VBT if pN0; high → EBRT + concurrent/adjuvant chemo (I, A), sequential (I, B), or chemo ± VBT (I, B) | ESGO–ESTRO–ESP 2025 | FT |
| PORTEC-2: VBT vs EBRT 5-year vaginal recurrence 1.8% vs 1.6%; acute GI toxicity 12.6% vs 53.8% | Nout 2010 | AB |

<a id="early-cervical-cancer"></a>
### Early Cervical Cancer (`early-cervical-cancer.json`)
| Teaching point | Source | Level |
|---|---|---|
| Examination + biopsy (II, A); pelvic MRI mandatory (II, A); no routine cystoscopy/proctoscopy (IV, D) | ESGO/ESTRO/ESP 2023 (Cibula) | FT |
| Radical surgery preferred, laparotomy standard for radical parametrectomy (I, A); MIS only < 2 cm with free margins after conization in high-volume centers (IV, C); no NACT then surgery (IV, D) | ESGO/ESTRO/ESP 2023 | FT |
| LACC: 4.5-year DFS 86.0% MIS vs 96.5% open; 3-year OS 93.8% vs 99.0%; final 4.5-year OS 90.6% vs 96.2% | Ramirez 2018; Ramirez 2024 | AB |
| SHAPE: low-risk (≤ 2 cm, limited stromal invasion) simple vs radical hysterectomy 3-year pelvic recurrence 2.52% vs 2.17%; less urinary incontinence/retention | Plante 2024 | AB |
| Nodes first (IV, A); SLN with ICG (III, A); frozen section (III, A); positive → abandon PLND/hysterectomy for definitive CTRT (III, A); negative → systematic PLND (III, A), level I only if bilateral level I SLN negative (IV, B); ultrastaging (III, A) | ESGO/ESTRO/ESP 2023 | FT |
| Avoid combining radical surgery and radiotherapy (IV, A); ovarian preservation for SCC with salpingectomy (IV, A) | ESGO/ESTRO/ESP 2023 | FT |
| Intermediate risk (combination of size, LVSI, stromal depth) → consider adjuvant RT (IV, A), observation alternative (IV, B); high risk (pN1/pN1mi, margins, parametria) → CTRT (IV, A) | ESGO/ESTRO/ESP 2023 | FT |
| Sedlis: ≥ 2 risk factors, RT recurrence 15% vs 28% (RR 0.53); grade 3–4 AEs 6% vs 2.1% | Sedlis 1999 | AB |
| Peters: CT + RT 4-year PFS 80% vs 63%, OS 81% vs 71% | Peters 2000 | AB |

<a id="severe-tbi"></a>
### Severe Traumatic Brain Injury (`severe-tbi.json`)
| Teaching point | Source | Level |
|---|---|---|
| SBP ≥ 110 (15–49 or > 70 years) or ≥ 100 (50–69) (Level III) | BTF 4th ed. 2017 (Carney) | FT |
| ICP-guided management reduces in-hospital and 2-week mortality (IIB); phenytoin for early PTS within 7 days (IIA); steroids not recommended, high-dose methylprednisolone contraindicated (Level I); no prolonged prophylactic hyperventilation ≤ 25 mm Hg (IIB); no early short-term prophylactic hypothermia (IIB) | BTF 4th ed. 2017 | FT |
| MRC CRASH: methylprednisolone 2-week mortality 21.1% vs 17.9% (RR 1.18) | Roberts 2004 | AB |
| Treat ICP > 22 mm Hg (IIB); CPP 60–70 (IIB); avoid aggressive CPP > 70 (Level III) | BTF 4th ed. 2017 | FT |
| Secondary DC for early refractory ICP not recommended for outcome (IIA); for late refractory ICP recommended (IIA); large FTP DC ≥ 12 × 15 cm (IIA); DC reduces ICP and ICU days (IIA) | BTF 2020 DC update (Hawryluk) | FT |
| DECRA: worse GOS-E (OR 1.84), mortality 19% vs 18% | Cooper 2011 | AB |
| RESCUEicp: 6-month mortality 26.9% vs 48.9%; vegetative 8.5% vs 2.1%; more severe disability | Hutchinson 2016 | AB |
| Nutrition by day 5–7 (IIA); early tracheostomy reduces ventilator days (IIA); no povidone-iodine oral care (IIA); LMWH/UFH + mechanical prophylaxis (Level III) | BTF 4th ed. 2017 | FT |

<a id="traumatic-intracranial-hematoma"></a>
### Anticoagulated Head Injury: Acute Subdural Hematoma (`traumatic-intracranial-hematoma.json`)
| Teaching point | Source | Level |
|---|---|---|
| CT within 1 hour for GCS ≤ 12 at first assessment, < 15 at 2 hours, suspected open/depressed/basal fracture, seizure, focal deficit, > 1 vomiting episode; anticoagulants (excluding aspirin monotherapy) → consider CT within 8 hours; CT primary investigation, no skull X-ray; admission criteria incl. new imaging abnormality or GCS not back to 15 | NICE NG232 (2023) | FT |
| Immediate PCC for warfarin reversal in head injury with suspected ICH; monitor INR; no FFP for vitamin K antagonist reversal | NICE NG24 (2015, updated 2026) §1.9, §1.12 | FT |
| ASDH > 10 mm or MLS > 5 mm → evacuate regardless of GCS; coma + < 10 mm / < 5 mm → evacuate if GCS falls ≥ 2, asymmetric/fixed pupils, or ICP > 20; ICP monitoring in all comatose ASDH; operate ASAP; craniotomy ± flap removal | Bullock 2006 (BTF surgical guidelines) abstract | AB |
| RESCUE-ASDH: 12-month death 30.2% craniotomy vs 32.2% craniectomy; reoperation within 2 weeks 14.6% vs 6.9%; wound complications 3.9% vs 12.2% | Hutchinson 2023 | AB |

<a id="aneurysmal-sah"></a>
### Aneurysmal Subarachnoid Hemorrhage (`aneurysmal-sah.json`)
| Teaching point | Source | Level |
|---|---|---|
| Thunderclap headache (peak 1–5 min) red flag; senior review → urgent non-contrast CT, most accurate within 6 h; CT < 6 h negative (radiologist) → no routine LP; LP ≥ 12 h after onset if CT > 6 h negative | NICE NG228 (2022) §1.1 | FT |
| CT within 6 h: sensitivity 100% (121/121), NPV 100% | Perry 2011 | AB |
| Opioid analgesia documented; urgent neurosurgical discussion; no severity score in isolation for transfer; CTA without delay | NICE NG228 §1.1 | FT |
| Consider enteral nimodipine; IV only in specialist setting | NICE NG228 §1.2 | FT |
| Nimodipine: infarction 22% vs 33%; poor outcome 20% vs 33% | Pickard 1989 | AB |
| Coiling, or clipping if coiling unsuitable, at earliest opportunity; rebleeding highest within 24 h | NICE NG228 §1.2 | FT |
| ISAT: dependency/death at 1 year 23.7% coiling vs 30.6% clipping | Molyneux 2002 | AB |
| Deterioration → non-contrast CT first; no TCD outside research; hydrocephalus → consider CSF drainage; DCI → euvolemia ± vasopressor | NICE NG228 §1.3 | FT |
| Follow-up plan; smoking cessation; don't withhold antithrombotics solely for SAH once secured; relatives' testing usually only with ≥ 2 affected first-degree relatives; advice on return to activities | NICE NG228 §1.4–1.5 | FT |

<a id="advanced-ovarian-cancer"></a>
### Advanced Ovarian Cancer (`advanced-ovarian-cancer.json`)
| Teaching point | Source | Level |
|---|---|---|
| Gyn-onc evaluation before therapy (strong); CA-125, CT abdomen/pelvis, chest CT (strong); laparoscopy/DW-MRI/PET conditional; germline + somatic BRCA1/2 at diagnosis for all (strong); genetic counseling for heritable variants | ASCO 2025 (Gaillard) Rec 1.1–1.3 | FT |
| PCS if fit and complete cytoreduction likely (conditional); NACT if complete cytoreduction unlikely (strong) or high perioperative risk (strong); EORTC 55971/CHORUS non-inferior, JCOG0602 did not confirm | ASCO 2025 Rec 2–3 | FT |
| Histologic confirmation (core biopsy) before NACT; platinum–taxane doublet (strong); single-agent carboplatin worse in vulnerable older patients | ASCO 2025 Rec 4–5 | FT |
| ICS after ≤ 4 cycles (conditional); fewer cycles better OS in 7,005-patient meta-analysis; HIPEC may be offered for stage III with good PS/renal function (conditional); OVHIPEC-1 OS 44.9 vs 33.3 months; total six cycles | ASCO 2025 Rec 6–8 | FT |
| CHORUS: median OS 24.1 vs 22.6 months; grade 3–4 postoperative AEs 14% vs 24% | Kehoe 2015 | AB |
| LION: no lymphadenectomy benefit (OS 65.5 vs 69.2 months); repeat laparotomy 12.4% vs 6.5%; 60-day mortality 3.1% vs 0.9% | Harter 2019 | AB |
| Maintenance: FDA-approved PARPi or bevacizumab (strong); SOLO1 olaparib HR 0.30, 3-year PFS 60% vs 27% | ASCO 2025 Rec 9; Moore 2018 | FT / AB |

<a id="acute-angle-closure"></a>
### Acute Angle-Closure Crisis (`acute-angle-closure.json`)
| Teaching point | Source | Level |
|---|---|---|
| AACC signs: corneal edema/halos, mid-dilated pupil, glaucomflecken, conjunctival/episcleral congestion, pain, headache, nausea/vomiting; permanent vision loss if untreated; fellow eye high risk | AAO PACD PPP 2020 (Gedde 2021) | FT |
| Medical therapy (beta-blocker, alpha-2 agonist, CAI, parasympathomimetic, hyperosmotic); suppressants may fail with ischemic ciliary body; miotics fail at very high IOP; mydriatics only for secondary pupillary block | AAO PPP 2020 | FT |
| Iridotomy as soon as possible after medical lowering; laser iridotomy preferred (favorable risk–benefit); alternatives if cornea cloudy; filtering surgery in unbroken AACC risks flat chamber | AAO PPP 2020 | FT |
| Fellow eye: prompt prophylactic LPI if narrow; ~50% attack within 5 years; chronic miotics not a substitute (~40% attack within 5 years) | AAO PPP 2020 | FT |
| Early phaco after medical reduction maintains IOP control; greater operative risk; EAGLE: clear-lens extraction superior to LPI for IOP and QoL | AAO PPP 2020 | FT |
| Lam 2008: IOP rise at 18 months 46.7% LPI vs 3.2% early phaco | Lam 2008 | AB |
| EAGLE: EQ-5D +0.052, IOP −1.18 mm Hg with clear-lens extraction | Azuara-Blanco 2016 | AB |

<a id="postoperative-endophthalmitis"></a>
### Endophthalmitis After Cataract Surgery (`postoperative-endophthalmitis.json`)
| Teaching point | Source | Level |
|---|---|---|
| Presumed endophthalmitis = emergency, treat within an hour; no delaying steroid trial unless TASS strongly suspected; presenting features (blurred vision 93–94%, pain 74–79%, hypopyon 72–85%) | ESCRS 2013 guidelines (Barry) | FT |
| Vitrectomy "gold standard" if available; vitreous biopsy + intravitreal antibiotics ("silver standard") to avoid delay; vancomycin 1 mg + ceftazidime 2 mg (or amikacin 0.4 mg), separate syringes; consider 50% dose after full vitrectomy | ESCRS 2013 | FT |
| EVS: no benefit of immediate vitrectomy at HM or better; at LP-only, 20/40 33% vs 11%, severe loss 20% vs 47%; systemic antibiotics no difference | EVS 1995 | AB |
| Review 6 h after tap/inject, 12 h after vitrectomy; topical steroid + atropine; chase cultures; repeat injection only if needed at 48–72 h (7% in EVS); gentamicin 400 µg may cause macular infarction | ESCRS 2013 | FT |
| No intracameral cefuroxime → 4.92-fold endophthalmitis risk; CCI, silicone IOL, complications increase risk | ESCRS study 2007 | AB |
| Topical drops add no clear benefit over intracameral (Swedish register); cefuroxime cross-reactivity with penicillin very low; withhold for cephalosporin allergy | ESCRS 2013 | FT |

<a id="open-globe-injury"></a>
### Open Globe Injury (`open-globe-injury.json`)
| Teaching point | Source | Level |
|---|---|---|
| Shield immediately; NPO for GA; tetanus prophylaxis; antiemetics to prevent Valsalva/expulsion; opioids; NSAIDs relatively contraindicated; IOP measurement contraindicated; Seidel unnecessary if obvious | Zhou 2022 (Clin Ophthalmol review) | FT |
| Non-contrast orbital CT recommended; specificity 90–100%, sensitivity 50–80% (does not rule out OGI); radiopaque FBs reliably detected; B-scan not advised for confirmed OGI; next-day review of seal | Zhou 2022 | FT |
| Repair < 24 h: endophthalmitis OR 0.39 (8,497 eyes, low certainty); no clear visual difference | McMaster 2025 | AB |
| Oral vs IV prophylaxis: 2.26% vs 2.11% (OR 1.07); no prospective evidence systemic prophylaxis reduces endophthalmitis | Patterson 2023 | AB |
| RCT: endophthalmitis 2.0% IV + oral vs 2.7% oral only | Du Toit 2017 | AB |
| Intravitreal gentamicin at repair 6% → 0% (pooled RCTs); delay effect not abrogated by systemic antibiotics; UK standard 12–24 h; plans > 24 h hard to defend | Blanch 2024 (Eye review) | FT |
| SO 0.06–0.19%; after repair 0.15% vs removal 0–0.21% (≥ 323 removals to prevent one); NPL recovery 26% (OTS I) / 73% (OTS II); repair where possible | Blanch 2024 | FT |
| RRD 29% within 1 month; vitrectomy within 4–7 days lowers PVR (retrospective + limited RCT), esp. zone III | Blanch 2024 | FT |

<a id="hip-fracture"></a>
### Hip Fracture in an Older Adult (`hip-fracture.json`)
| Teaching point | Source | Level |
|---|---|---|
| Immediate analgesia (incl. cognitive impairment), reassess at 30 min; paracetamol 6-hourly + opioids; consider nerve block, never as substitute for early surgery; no NSAIDs; look for cognitive impairment/delirium | NICE CG124 §1.3, §1.8 | FT |
| Nerve blocks: pain on movement SMD −1.05; acute confusion RR 0.67 (NNT 12); chest infection RR 0.41 | Guay 2020 (Cochrane) | AB |
| Surgery day of or day after admission; correct comorbidities immediately; planned trauma list | NICE CG124 §1.2, §1.5 | FT |
| HIP ATTACK: accelerated (median 6 h) vs standard (24 h): mortality 9% vs 10%, major complications 22% vs 22% | HIP ATTACK 2020 | AB |
| Displaced intracapsular → arthroplasty; cemented implants; consider THR if walks outdoors with ≤ stick, fit, independent > 2 years (2023) | NICE CG124 §1.6 | FT |
| HEALTH: secondary procedures 7.9% THA vs 8.3% hemi; dislocation 4.7% vs 2.4%; modest function benefit | Bhandari 2019 | AB |
| Trochanteric (≥ lesser trochanter, not reverse oblique) → sliding hip screw; subtrochanteric → IM nail | NICE CG124 §1.6.9–1.6.10 | FT |
| Full weight bearing; physio + mobilization day after surgery; orthogeriatric Hip Fracture Programme incl. falls and bone health | NICE CG124 §1.6.1, §1.7, §1.8 | FT |

<a id="open-tibial-fracture"></a>
### Open Tibial Fracture (`open-tibial-fracture.json`)
| Teaching point | Source | Level |
|---|---|---|
| IV prophylactic antibiotics immediately in ED; no ED irrigation of long-bone open fractures; saline-soaked dressing + occlusive layer | NICE NG37 §1.2.20–1.2.22 | FT |
| Infection 2.5% with debridement, irrigation, and pre/postoperative antibiotics (prospective series); type III 9% | Gustilo & Anderson 1976 | AB |
| Hard signs diagnose vascular injury; capillary return/Doppler do not exclude; explore immediately if persistent after realignment; shunt first; no delay for angiography | NICE NG37 §1.2.1–1.2.5 | FT |
| Wound excision: immediately if highly contaminated; ≤ 12 h high-energy (IIIA/IIIB); ≤ 24 h others; orthoplastic approach | NICE NG37 §1.2.27–1.2.28 | FT |
| Fixation + cover at excision if possible or within 72 h; cover with any internal fixation; temporary dressing avoiding desiccation (2022) | NICE NG37 §1.2.29–1.2.31 | FT |
| WOLLF: NPWT vs standard dressing — disability 45.5 vs 42.4 (NS); deep infection 7.1% vs 8.1% | Costa 2018 | AB |
| FLOW: reoperation 13.2% / 12.7% / 13.7% at high/low/very low pressure; soap 14.8% vs saline 11.6% | Bhandari 2015 | AB |
| Compartment syndrome awareness 48 h after tibial injury/fixation; record signs; consider continuous pressure monitoring when signs masked; teach self-monitoring | NICE NG37 §1.2.7 | FT |

<a id="acute-compartment-syndrome"></a>
### Acute Compartment Syndrome of the Leg (`acute-compartment-syndrome.json`)
| Teaching point | Source | Level |
|---|---|---|
| Key signs: pain out of proportion, pain on passive movement; early diagnosis vital; record analgesia; hourly assessment of at-risk patients | BOAST Compartment Syndrome (BOA 2025) | FT |
| Signs → release circumferential dressings to skin, elevate, reassess within 30 min | BOAST | FT |
| Inconclusive/incomplete assessment → hourly exam, pressures in all suspected compartments with concurrent BP, senior review; ΔP (diastolic − compartment) < 30 mm Hg = increased risk; absolute > 40 mm Hg → consider urgent decompression; consultant decides | BOAST | FT |
| Monitor 48 h after tibial injury/fixation; continuous pressure monitoring when signs masked (e.g., nerve block) | NICE NG37 §1.2.7 | FT |
| ΔP < 30 threshold: no missed cases; absolute 30 mm Hg threshold would have meant 43% fasciotomy | McQueen 1996 | AB |
| Continuous monitoring: sensitivity 94%, specificity 98% | McQueen 2013 | AB |
| At-risk: young men, tibial shaft fractures; 10% had bleeding disorder/anticoagulants | McQueen 2000 | AB |
| Immediate decompression after diagnosis; all involved compartments; two-incision four-compartment for leg; debride and document; plastics within 24 h; re-explore within 72 h | BOAST | FT |
| Late presentation: high surgical complication risk; two consultants; non-operative option with renal assessment/protection | BOAST | FT |

<a id="epistaxis"></a>
### Epistaxis on Anticoagulation (`epistaxis.json`)
| Teaching point | Source | Level |
|---|---|---|
| KAS 1–2: identify patients needing prompt management; firm sustained compression of lower third of nose ≥ 5 min | AAO-HNS CPG 2020 (Tunkel) abstract | AB |
| KAS 3a–4: packing if source not identifiable despite compression; resorbable packing with anticoagulants/antiplatelets/bleeding disorder; education on packing | AAO-HNS CPG 2020 | AB |
| KAS 5–6: document bleeding risk factors; anterior rhinoscopy after clot removal | AAO-HNS CPG 2020 | AB |
| KAS 7a, 8–10: endoscopy for recurrent bleeding despite packing/cautery or recurrent unilateral bleeding; treat identified site (vasoconstrictor, cautery, moisturizers); anesthetize and restrict cautery to site; ligation/embolization for persistent/recurrent bleeding | AAO-HNS CPG 2020 | AB |
| KAS 11: first-line treatment before transfusion, reversal, or withdrawal of anticoagulation unless life-threatening | AAO-HNS CPG 2020 | AB |
| KAS 13–14: education on prevention/home care/return; document outcome within 30 days after nonresorbable packing, surgery, ligation/embolization | AAO-HNS CPG 2020 | AB |
| NoPAC: topical TXA packing rate 43.7% vs placebo 41.3% (NS) | Reuben 2021 | AB |
| Cochrane: TXA re-bleeding 47% vs 67% (RR 0.71, moderate); single topical dose evidence low quality | Joseph 2018 | AB |

<a id="tonsillectomy"></a>
### Pediatric Tonsillectomy (`tonsillectomy.json`)
| Teaching point | Source | Level |
|---|---|---|
| Watchful waiting < 7/5/3 episodes (strong); tonsillectomy option ≥ thresholds with documented features (fever > 38.3 °C, adenopathy, exudate, GABHS) | AAO-HNS CPG 2019 (Mitchell) abstract | AB |
| Surgery reduced throat infections over 2 years in severely affected children; many unoperated had few mild episodes | Paradise 1984 | AB |
| PSG before tonsillectomy if < 2 years, obesity, Down syndrome, craniofacial, neuromuscular, sickle cell, MPS; advocate PSG when need uncertain or discordance | AAO-HNS CPG 2019 | AB |
| Recommend tonsillectomy for PSG-documented OSA; counsel OSDB may persist/recur | AAO-HNS CPG 2019 | AB |
| CHAT: PSG normalization 79% vs 46%; improved behavior, QoL, symptoms; no difference in attention/executive function | Marcus 2013 | AB |
| Single IV dexamethasone (strong); ibuprofen/acetaminophen (strong); no perioperative antibiotics (strong); no codeine < 12 (strong); overnight inpatient monitoring if < 3 years or severe OSA (AHI ≥ 10, nadir < 80%) | AAO-HNS CPG 2019 | AB |
| Document primary (< 24 h) and secondary (> 24 h) bleeding; determine rates at least annually | AAO-HNS CPG 2019 | AB |

<a id="adult-neck-mass"></a>
### Persistent Neck Mass in an Adult (`adult-neck-mass.json`)
| Teaching point | Source | Level |
|---|---|---|
| Increased risk: no infectious history and present ≥ 2 weeks without fluctuation (or uncertain duration); or fixation, firm, > 1.5 cm, skin ulceration; explain significance; no routine antibiotics without bacterial infection signs | AAO-HNS CPG 2017 (Pynnonen) abstract | AB |
| Contrast CT or MRI (strong); targeted exam visualizing larynx, tongue base, pharynx; FNA instead of open biopsy | AAO-HNS CPG 2017 | AB |
| FNA meta-analysis (3,459 aspirates): sensitivity 89.6%, specificity 96.5% | Tandon 2008 | AB |
| Continue evaluating cystic masses until diagnosis; ancillary tests; EUA of upper aerodigestive tract before open biopsy | AAO-HNS CPG 2017 | AB |
| Cystic nodal metastases: 17/20 tonsil/tongue-base primaries; HPV DNA in 87% | Goldenberg 2008 | AB |

<a id="intussusception"></a>
### Ileocolic Intussusception (`intussusception.json`)
| Teaching point | Source | Level |
|---|---|---|
| Ultrasound sensitivity 0.98, specificity 0.98; POCUS ≈ radiology US | Tsou 2019 | AB |
| No prophylactic antibiotics before enema (grade C); clinician able to decompress pneumoperitoneum present, surgical capability available (grade D); maximize non-operative management; enema success 76.8% | APSA systematic review 2021 (Kelley-Quon) | FT |
| Delayed repeat enema if stable, no peritonitis, partial reduction (grade C); +~10% success; DRE success 57.2%, perforation 1.1%; interval 30 min–4 h (grade D) | APSA 2021 | FT |
| ED discharge acceptable; ~4 h observation (grade C); counsel on recurrence (> 2 years slightly higher) and return | APSA 2021 | FT |
| ED discharge pathway: 30/46 eligible discharged; 1 recurrence needing repeat enema | Raval 2015 | AB |
| Initial laparoscopic approach (grade C); simultaneous enema may help; no routine appendectomy (grade D) | APSA 2021 | FT |

<a id="pyloric-stenosis"></a>
### Infantile Hypertrophic Pyloric Stenosis (`pyloric-stenosis.json`)
| Teaching point | Source | Level |
|---|---|---|
| Palpation sensitivity 10–93.4% (declining); US PMT ≥ 3 mm: sensitivity 97.6%, specificity 98.8%; authors advise PMT ≥ 3 mm | van den Bunder 2022 (Br J Radiol meta-analysis) | FT (PMC) / AB |
| Correction of metabolic derangement before surgery generally assumed to prevent apnea; apnea 27% preop, 0.2–16% postop; association with alkalosis unstudied | van den Bunder 2020 (Paediatr Anaesth SR) | AB |
| RCT: full feeds 18.5 vs 23.9 h; LOS 33.6 vs 43.8 h; similar complications; recommend lap where experienced | Hall 2009 | AB |
| Meta-analysis 4 RCTs (502): major complications 4.9% LP, not significantly more; full feeds 2.27 h sooner | Oomen 2012 | AB |
| Postnatal erythromycin OR 2.45 overall; OR 12.89 in first 14 days | Murchison 2016 | AB |

<a id="pediatric-spleen-injury"></a>
### Pediatric Blunt Splenic Injury (`pediatric-spleen-injury.json`)
| Teaching point | Source | Level |
|---|---|---|
| PECARN very-low-risk rule (7 findings absent); sensitivity 97%, NPV 99.9%; needs external validation | Holmes 2013 | AB |
| NOM achievable in > 95%; manage by hemodynamics not grade (1A); abbreviated bed rest (1A); transfusion threshold 7.0 g/dL (1A); > 40 mL/kg or 4 U blood as NOM end point (1B); local resources for failures (1A); discharge stable patients before 24 h (1B) | ATOMAC GRADE evaluation (Notrica 2015) | AB |
| LOS by physiology; activity restriction grade + 2 weeks safe; no prophylactic embolization for stable blush, reserve for ongoing bleeding; no routine follow-up imaging for low grade; limited data for high grade | APSA SR (Gates 2019) | AB |

<a id="obstructing-infected-stone"></a>
### Obstructing Ureteric Stone with Sepsis (`obstructing-infected-stone.json`)
| Teaching point | Source | Level |
|---|---|---|
| Immediate imaging with pyrexia, solitary kidney, or uncertainty; NCCT to confirm after ultrasound (strong); NSAIDs first-line for colic but may worsen reduced renal function | EAU Urolithiasis 2026 §3.3.1, §3.4.1 | FT |
| Obstructed infected kidney = emergency; urgent decompression by stent or nephrostomy (strong), equally effective (LE 1b); cultures and immediate antibiotics (strong); repeat urine culture after decompression; re-evaluate antibiotics; delay definitive stone treatment until sepsis resolves (strong); stent QoL burden | EAU Urolithiasis 2026 §3.4.2 | FT |
| RCT stent vs nephrostomy: time to normal temperature 2.6 vs 2.3 days; no superiority; choice by logistics | Pearle 1998 | AB |
| No decompression: mortality 19.2% vs 8.8%; adjusted OR 2.6 | Borofsky 2013 | AB |

<a id="bladder-trauma"></a>
### Bladder Rupture with Pelvic Fracture (`bladder-trauma.json`)
| Teaching point | Source | Level |
|---|---|---|
| Urethral injury signs: blood at meatus is cardinal but its absence does not exclude; inability to void with palpable bladder; scrotal/penile/perineal swelling and ecchymosis; high-riding prostate unreliable; evaluate with RUG and/or flexible cystourethroscopy (strong) | EAU Urological Trauma 2026 §4.4.3.b, §4.4.5 | FT |
| Cystography for visible haematuria + pelvic fracture (strong); active retrograde filling 300–350 mL (strong); passive clamping during excretory CT insufficient; CT cystography better for bone fragments, bladder neck and associated injuries | EAU Urological Trauma 2026 §4.3.3, §4.3.7 | FT |
| CT cystography 95% sensitive, 100% specific, equivalent to conventional cystography (212 patients) | Quagliano 2006 | AB |
| Blunt intraperitoneal rupture: surgical repair, open or laparoscopic (strong); inspect organs, drain urinoma; conservative care only for small uncomplicated endoscopic injuries without peritonitis/ileus | EAU Urological Trauma 2026 §4.3.5 | FT |
| Simple repair in a healthy patient: catheter out after 5–10 days without cystography; cystography after complex repair or impaired healing (strong) | EAU Urological Trauma 2026 §4.3.6 | FT |
| Uncomplicated blunt extraperitoneal: conservative drainage (weak); operate for bladder neck involvement, bone fragments, rectal/vaginal injury, entrapment, or when operating for other injuries (strong); follow-up cystography at ~10 days, cystoscopy and repeat cystogram at 1 week if leaking | EAU Urological Trauma 2026 §4.3.5–4.3.7 | FT |
| Catheter drainage (56) equivalent to early cystorrhaphy (24); without cystorrhaphy during other operations: more urological complications, ICU 9.0 vs 4.0 days, hospital 18.9 vs 10.6 days | Johnsen 2016 | AB |

<a id="testicular-torsion"></a>
### Testicular Torsion (`testicular-torsion.json`)
| Teaching point | Source | Level |
|---|---|---|
| Sudden severe pain with vagal reaction typical; horizontal testis more frequent in torsion; absent cremasteric reflex 100% sensitive, 66% specific; Prehn sign; abnormal urinalysis does not exclude torsion | EAU/ESPU Paediatric Urology 2026 §8.2 | FT |
| Diagnosis by examination; Doppler useful but must not delay intervention (strong); persistent arterial flow does not exclude torsion; compare sides; critical window ~4–6 h; immediate treatment (strong) | EAU/ESPU Paediatric Urology 2026 §8.2, §8.5 | FT |
| 208 surgically proven torsions: intratesticular flow absent in only 76%; spiral twist on high-resolution US in 96%; specificity 99% | Kalfa 2007 | AB |
| Survival by time to treatment: 97.2% (0–6 h), 79.3% (7–12 h), 61.3% (13–18 h), 42.5% (19–24 h) | Mellick 2019 | AB |
| Manual detorsion in ER while awaiting surgery, outward rotation, must not delay surgery; residual torsion 17/53 incl. 11 with pain relief; exploration necessary | EAU/ESPU Paediatric Urology 2026 §8.3.2 | FT |
| Contralateral orchiopexy immediately after detorsion, not electively; preserve testis unless unequivocally necrotic; up to half develop atrophy despite intraoperative viability | EAU/ESPU Paediatric Urology 2026 §8.3.2, §8.4 | FT |
| Mean early testicular loss 39%; late loss approaches 50% | MacDonald 2018 | AB |

<a id="acute-limb-ischemia"></a>
### Acute Limb Ischemia (`acute-limb-ischemia.json`)
| Teaching point | Source | Level |
|---|---|---|
| Emergency evaluation by experienced clinician (1, C-EO); viability assessment without noninvasive imaging (1, C-LD); CW Doppler because palpation inaccurate; cause testing must not delay treatment | ACC/AHA PAD 2024 §11.1, §11.3 | FT |
| Loss of arterial Doppler signal = threatened; absent arterial and venous signals = possibly irreversible (III); muscle tolerates ~4–6 h; revascularize salvageable limb, categories I–IIb (1, A); no revascularization of nonviable tissue (3: Harm) | ACC/AHA PAD 2024 §11, §11.1, §11.2.1 | FT |
| UFH on diagnosis unless contraindicated (1, C-EO) | ACC/AHA PAD 2024 §11.2.3 | FT |
| Surgery and catheter-based thrombolysis both effective; choice by patient/anatomic factors and resources; similar limb salvage, more bleeding with thrombolysis | ACC/AHA PAD 2024 §11.2.1 | FT |
| 5 RCTs, 1,292 patients: no clear difference in limb salvage, amputation, death; thrombolysis major haemorrhage OR 3.22, distal embolisation OR 31.68 | Darwood 2018 (Cochrane) | AB |
| Monitor and treat compartment syndrome with fasciotomy (1); immediate fasciotomy of all involved compartments with clinical evidence/raised CK; prophylactic fasciotomy reasonable IIa/IIb (2a, B-NR) | ACC/AHA PAD 2024 §11.2.2 | FT |
| Delayed vs prophylactic fasciotomy: 30-day major amputation 50% vs 5.9% | Rothenberg 2019 | AB |
| History/exam for cause (1); cardiac source testing (2a); AF → long-term oral anticoagulation to prevent recurrence | ACC/AHA PAD 2024 §11.3 | FT |

<a id="ruptured-aaa"></a>
### Ruptured Abdominal Aortic Aneurysm (`ruptured-aaa.json`)
| Teaching point | Source | Level |
|---|---|---|
| Suspect rupture with new abdominal/back pain, collapse, or LOC; risk factors known AAA, age >60, smoking, hypertension; immediate bedside ultrasound; discuss immediately with regional vascular service if AAA shown or ultrasound unavailable/non-diagnostic | NICE NG156 1.1.7–1.1.9 | FT |
| No single symptom, sign, risk factor, or score to decide transfer or suitability for repair | NICE NG156 1.3.1, 1.4.4–1.4.5 | FT |
| Leave referring unit within 30 min of transfer decision; consider restrictive fluids (permissive hypotension) during transfer | NICE NG156 1.3.4, 1.3.6 | FT |
| Lowest SBP strongly associated with 30-day mortality (51% below 70 mmHg); 70 mmHg too low a threshold; EVAR under LA alone adjusted OR 0.27 vs GA | Powell 2014 (IMPROVE observations) | AB |
| Consider EVAR or open repair; EVAR more benefit for most, especially men >70 and women; open better balance in men <70; consider LA alone for EVAR; complex EVAR only in trials if open suitable | NICE NG156 1.6.1–1.6.4 | FT |
| 30-day mortality 35.4% vs 37.4% (OR 0.92); women OR 0.44 | IMPROVE 2014 | AB |
| 3-year mortality 48% vs 56%; ~60% in both at 7 years | IMPROVE 2017 | AB |
| Abdominal compartment syndrome after EVAR or open repair; assess if not improving | NICE NG156 1.6.5–1.6.6 | FT |

<a id="symptomatic-carotid-stenosis"></a>
### Symptomatic Carotid Stenosis (`symptomatic-carotid-stenosis.json`)
| Teaching point | Source | Level |
|---|---|---|
| Exclude hypoglycaemia; aspirin 300 mg daily immediately; specialist assessment within 24 h; no ABCD2 or other scores; no CT brain for suspected TIA unless alternative diagnosis suspected | NICE NG128 1.1.2, 1.1.4–1.1.6, 1.2.1 | FT |
| Urgent carotid imaging for endarterectomy candidates; 50–99% NASCET (70–99% ECST) → urgent CEA referral plus best medical treatment; <50% NASCET → no surgery; reports state criteria | NICE NG128 1.2.3–1.2.6 | FT |
| CEA recommended for 70–99% symptomatic, suggested for 50–69%; early, ideally within 2 weeks (high quality); CAS may be considered <70 years (low quality) | ESO 2021 (abstract) | AB |
| Pooled ECST+NASCET (5,893): benefit greatest within 2 weeks; NNT 5 within 2 weeks vs 125 after 12 weeks | Rothwell 2004 | AB |
| 3,433 patients: 120-day stroke/death CAS 8.9% vs CEA 5.8%; ≥70 years 12.0% vs 5.9% (RR 2.04); <70 similar | Bonati 2010 (CSTC) | AB |

<a id="cutaneous-melanoma"></a>
### Primary Cutaneous Melanoma (`cutaneous-melanoma.json`)
| Teaching point | Source | Level |
|---|---|---|
| T3a = >2.0–4.0 mm without ulceration; T3a N0 M0 = IIA; T3a N1a = IIIB; T1a <0.8 mm without ulceration; ulcerated primary behaves like next thickness category (T2bN0 vs T3aN0 MSS 93/88% vs 94/88%) | Gershenwald 2017 (AJCC 8) Tables, Fig. 1 text | FT |
| No imaging/SLNB for IA; no imaging before SLNB unless metastases suspected; consider SLNB >1.0 mm, or 0.8–1.0 mm with ulceration, LVI, or mitoses ≥2; CE-CT staging for IIC–IV | NICE NG14 1.4.1–1.4.7 | FT |
| MSLT-I: 10-year DFS 71.3% vs 64.7% (intermediate thickness); MSS 62.1% with vs 85.1% without nodal metastasis | Morton 2014 | AB |
| Margins: ≥0.5 cm stage 0; 1 cm stage I (or if 2 cm causes unacceptable morbidity); 2 cm stage II; around biopsy scar | NICE NG14 1.5.1–1.5.3 | FT |
| 1 cm vs 3 cm (≥2 mm): more locoregional recurrence HR 1.26, similar OS | Thomas 2004 | AB |
| 2 cm vs 4 cm (>2 mm): no OS (HR 0.98) or MSS (HR 0.95) difference at 19.6 years | Utjés 2019 | AB |
| No routine completion dissection for SLNB micrometastases unless recurrent nodal disease hard to manage, after MDT | NICE NG14 1.6.1 | FT |
| MSLT-II: 3-year MSS 86% vs 86%; regional control 92% vs 77%; lymphoedema 24.1% vs 6.3% | Faries 2017 | AB |

<a id="major-burn"></a>
### Major Burn: First Aid, Fluids, and Escharotomy (`major-burn.json`)
| Teaching point | Source | Level |
|---|---|---|
| Remove burnt clothing (unless stuck) and constrictive jewellery; cool running water 20 min, avoid hypothermia; no ice or topical creams pre-hospital | EBA 2017 wound management (pre-hospital) | FT |
| Burn centre referral: >20% TBSA superficial dermal in adults; burn shock resuscitation; face/hands/genitalia/joints; deep partial or full thickness any extent; circumferential; inhalation; electrical/chemical | EBA 2017 §3.2 | FT |
| Children: 20 min cool running water within 3 h, grafting OR 0.6 (2,495 children) | Griffin 2020 | AB |
| Resuscitate adults >20% TBSA; 2–4 mL/kg/%TBSA first 24 h; crystalloid first line; against 0.9% saline; against systematic colloids (salvage only); half in first 8 h; de-escalate; Parkland 4 mL, modified Brooke 2 mL | EBA 2017 critical care Q4 | FT |
| Titrate Ringer's lactate to urine output: 0.5 mL/kg/h adults, 1 mL/kg/h children <30 kg, 1–2 mL/kg/h high voltage; no colloids first 8 h | EBA 2017 §4.1.3 (nursing) | FT |
| Fluid creep: ACS, oedema, respiratory failure, AKI | EBA 2017 critical care Q4 rationale | FT |
| Modern patients receive more than Parkland predicts; linked to ACS | Saffle 2007 (review) | AB |
| Escharotomy when circumferential burns compromise breathing/circulation; mid-axial, normal skin to normal skin, near not over neurovascular structures, dorsum of hand; fasciotomy if compression persists, rarely primary except high voltage/very deep | EBA 2017 wound management Q2 | FT |
| Aim for early wound closure (time to healing and hypertrophic scarring); prophylactic systemic antibiotics not supported | EBA 2017 wound management; §4.1.4 | FT |

<a id="necrotizing-soft-tissue-infection"></a>
### Necrotizing Soft-Tissue Infection (`necrotizing-soft-tissue-infection.json`)
| Teaching point | Source | Level |
|---|---|---|
| Signs: pain out of proportion, oedema beyond erythema, fever; rapidly progressive infection = necrotizing (1C); plain X-ray not to rule out (1B), gas present only in few cases; imaging must not delay surgery (1A) | WSES/SIS-E 2018 | FT |
| LRINEC ≥6 sensitivity 68.2%, specificity 84.8%; ≥8 40.8%/94.9%; no single exam sign rules out; CT 88.5%/93.3% | Fernando 2019 | AB |
| Source control ASAP, at least within 12 h when suspicion high (1B); delayed surgery associated with septic shock, renal failure, mortality | WSES/SIS-E 2018 | FT |
| Surgery ≤6 h: mortality 19% vs 32% (OR 0.43); ≤12 h: OR 0.41 (19% vs 34%) | Nawijn 2020 | FT |
| Prompt aggressive antibiotics (1B); broad incl. anti-MRSA and anti-Gram-negative (1C); clindamycin or linezolid (1C) for exotoxin inhibition; continue until no further debridement, clinical improvement, afebrile 48–72 h (1C) | WSES/SIS-E 2018 | FT |
| Remove non-viable tissue to healthy tissue; spare perfused skin, preserve questionable skin for reassessment (1C); multiple incisions preserve perforators; wound open; amputation for late/extreme cases; re-explore within 12–24 h until free of necrosis (1C) | WSES/SIS-E 2018 | FT |
| NPWT after necrosis removed (1C); multidisciplinary team mandatory, reconstruction and rehabilitation (1C) | WSES/SIS-E 2018 | FT |

## Open items for faculty review

1. **WHO checklist** full text (iris.who.int) blocks automated access. Allergy, airway, blood-loss, antibiotic-timing,
   and critical-events items are not taught until the checklist can be read directly.
2. **TG18 severity thresholds** (organ-dysfunction numbers) are in image tables that could not be read.
3. **ASA 2020** was read from the ASA's final-draft PDF; confirm wording against the published version.
4. **Brunt 2020** full text was not accessible; only its abstract (two strong recommendations) is used.
5. Case vignettes, vital signs, and chance weights are authored teaching constructs, not epidemiological estimates.
