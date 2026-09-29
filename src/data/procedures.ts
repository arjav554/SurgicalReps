import { parseProcedure } from '@/lib/parseProcedure';
import type { Procedure } from '@/types/procedure';

import acuteAngleClosure from './acute-angle-closure.json';
import acuteAorticDissection from './acute-aortic-dissection.json';
import acuteAppendicitis from './acute-appendicitis.json';
import acuteCholecystitis from './acute-cholecystitis.json';
import acuteCompartmentSyndrome from './acute-compartment-syndrome.json';
import acuteDiverticulitis from './acute-diverticulitis.json';
import acuteLimbIschemia from './acute-limb-ischemia.json';
import adhesiveSbo from './adhesive-sbo.json';
import adnexalTorsion from './adnexal-torsion.json';
import adultNeckMass from './adult-neck-mass.json';
import advancedOvarianCancer from './advanced-ovarian-cancer.json';
import aneurysmalSah from './aneurysmal-sah.json';
import bladderTrauma from './bladder-trauma.json';
import centralLineIj from './central-line-ij.json';
import cutaneousMelanoma from './cutaneous-melanoma.json';
import earlyCervicalCancer from './early-cervical-cancer.json';
import earlyEndometrialCancer from './early-endometrial-cancer.json';
import ectopicPregnancy from './ectopic-pregnancy.json';
import epistaxis from './epistaxis.json';
import fulminantCDifficile from './fulminant-c-difficile.json';
import gallstonePancreatitis from './gallstone-pancreatitis.json';
import hipFracture from './hip-fracture.json';
import intussusception from './intussusception.json';
import lapChole from './lap-chole.json';
import lapCholeMeta from './lap-chole.meta.json';
import majorBurn from './major-burn.json';
import necrotizingSoftTissueInfection from './necrotizing-soft-tissue-infection.json';
import obstructingInfectedStone from './obstructing-infected-stone.json';
import openGlobeInjury from './open-globe-injury.json';
import openTibialFracture from './open-tibial-fracture.json';
import pediatricSpleenInjury from './pediatric-spleen-injury.json';
import perforatedPepticUlcer from './perforated-peptic-ulcer.json';
import pleuralInfection from './pleural-infection.json';
import postoperativeEndophthalmitis from './postoperative-endophthalmitis.json';
import postpartumHemorrhage from './postpartum-hemorrhage.json';
import pyloricStenosis from './pyloric-stenosis.json';
import rupturedAaa from './ruptured-aaa.json';
import severeTbi from './severe-tbi.json';
import sigmoidVolvulus from './sigmoid-volvulus.json';
import spontaneousPneumothorax from './spontaneous-pneumothorax.json';
import surgicalSafetyChecklist from './surgical-safety-checklist.json';
import symptomaticCarotidStenosis from './symptomatic-carotid-stenosis.json';
import tappInguinalHernia from './tapp-inguinal-hernia.json';
import testicularTorsion from './testicular-torsion.json';
import tonsillectomy from './tonsillectomy.json';
import traumaPrimarySurvey from './trauma-primary-survey.json';
import traumaticIntracranialHematoma from './traumatic-intracranial-hematoma.json';

/**
 * `lap-chole.json` is kept exactly as originally specified (a test pins its hash), so its
 * catalogue metadata and citations live in `lap-chole.meta.json` and are merged in before
 * parsing. `cites` maps node → option index → reference numbers (or node → numbers for info).
 */
function withMeta(raw: typeof lapChole, meta: typeof lapCholeMeta): unknown {
  const doc = JSON.parse(JSON.stringify(raw)) as { nodes: Record<string, Record<string, unknown>> };
  for (const [nodeId, cite] of Object.entries(meta.cites)) {
    const node = doc.nodes[nodeId];
    if (!node) throw new Error(`lap-chole.meta.json: unknown node ${nodeId}`);
    if (Array.isArray(cite)) node.cite = cite;
    else {
      const options = node.options as Record<string, unknown>[];
      for (const [index, numbers] of Object.entries(cite)) {
        const option = options[Number(index)];
        if (!option) throw new Error(`lap-chole.meta.json: ${nodeId} has no option ${index}`);
        option.cite = numbers;
      }
    }
  }
  const { cites: _cites, ...rest } = meta;
  return { ...doc, ...rest };
}

/** Registry of available simulations. Add a procedure by importing its JSON here. */
export const procedures: Procedure[] = [
  parseProcedure(withMeta(lapChole, lapCholeMeta)),
  ...[
    acuteCholecystitis,
    gallstonePancreatitis,
    acuteAppendicitis,
    adhesiveSbo,
    perforatedPepticUlcer,
    acuteDiverticulitis,
    tappInguinalHernia,
    traumaPrimarySurvey,
    centralLineIj,
    surgicalSafetyChecklist,
    spontaneousPneumothorax,
    acuteAorticDissection,
    pleuralInfection,
    sigmoidVolvulus,
    fulminantCDifficile,
    ectopicPregnancy,
    postpartumHemorrhage,
    adnexalTorsion,
    earlyEndometrialCancer,
    earlyCervicalCancer,
    severeTbi,
    traumaticIntracranialHematoma,
    aneurysmalSah,
    advancedOvarianCancer,
    acuteAngleClosure,
    postoperativeEndophthalmitis,
    openGlobeInjury,
    hipFracture,
    openTibialFracture,
    acuteCompartmentSyndrome,
    epistaxis,
    tonsillectomy,
    adultNeckMass,
    intussusception,
    pyloricStenosis,
    pediatricSpleenInjury,
    obstructingInfectedStone,
    bladderTrauma,
    testicularTorsion,
    acuteLimbIschemia,
    rupturedAaa,
    symptomaticCarotidStenosis,
    cutaneousMelanoma,
    majorBurn,
    necrotizingSoftTissueInfection,
  ].map(parseProcedure),
];

const CATEGORY_ORDER = [
  'Hepatobiliary',
  'Emergency General Surgery',
  'Colorectal',
  'Hernia',
  'Trauma',
  'Bedside Procedures',
  'Perioperative Safety',
  'Thoracic',
];

/** Procedures grouped by category for the catalogue, in teaching order. */
export const procedureSections: { title: string; data: Procedure[] }[] = (() => {
  const groups = new Map<string, Procedure[]>();
  for (const procedure of procedures) {
    const key = procedure.category ?? 'General';
    groups.set(key, [...(groups.get(key) ?? []), procedure]);
  }
  const rank = (title: string) => {
    const i = CATEGORY_ORDER.indexOf(title);
    return i === -1 ? CATEGORY_ORDER.length : i;
  };
  return [...groups.entries()]
    .map(([title, data]) => ({ title, data }))
    .sort((a, b) => rank(a.title) - rank(b.title));
})();

export function getProcedure(id: string): Procedure | undefined {
  return procedures.find((procedure) => procedure.id === id);
}
