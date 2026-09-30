import type { ImageSourcePropType } from "react-native";

/**
 * Anatomical plates from Henry Gray, "Anatomy of the Human Body" (1918), public domain,
 * via Wikimedia Commons. Processed by scripts/prepare-figures.py. Each caption is Gray's own
 * figure caption, checked against the 1918 text (archive.org OCR) and the Commons file page.
 */
export interface Figure {
  plate: ImageSourcePropType;
  /** Ivory linework for dark cards; only the original seven plates have one. */
  ghost?: ImageSourcePropType;
  /** Figure number as printed, e.g. "Fig. 1098". */
  label: string;
  caption: string;
  /** width / height of the processed plate. */
  aspect: number;
}

export const FIGURE_CREDIT =
  "Anatomical plates: Gray's Anatomy (1918), public domain, via Wikimedia Commons.";

const gallbladder: Figure = {
  plate: require("../../assets/figures/gallbladder-plate.jpg"),
  ghost: require("../../assets/figures/gallbladder-ghost.png"),
  label: "Plate",
  caption: "The gall-bladder and bile ducts (after Gray).",
  aspect: 472 / 374,
};

const pancreas: Figure = {
  plate: require("../../assets/figures/pancreas-plate.jpg"),
  ghost: require("../../assets/figures/pancreas-ghost.png"),
  label: "Fig. 1098",
  caption: "The duodenum and pancreas.",
  aspect: 696 / 496,
};

const appendix: Figure = {
  plate: require("../../assets/figures/appendix-plate.jpg"),
  ghost: require("../../assets/figures/appendix-ghost.png"),
  label: "Fig. 1073",
  caption: "The cecum and vermiform process, with their arteries.",
  aspect: 500 / 405,
};

const ileocecal: Figure = {
  plate: require("../../assets/figures/ileocecal-plate.jpg"),
  ghost: require("../../assets/figures/ileocecal-ghost.png"),
  label: "Fig. 1044",
  caption: "The terminal ileum at the inferior ileocecal fossa.",
  aspect: 550 / 313,
};

const stomach: Figure = {
  plate: require("../../assets/figures/stomach-plate.jpg"),
  ghost: require("../../assets/figures/stomach-ghost.png"),
  label: "Fig. 1050",
  caption: "The interior of the stomach.",
  aspect: 500 / 327,
};

const sigmoid: Figure = {
  plate: require("../../assets/figures/sigmoid-plate.jpg"),
  ghost: require("../../assets/figures/sigmoid-ghost.png"),
  label: "Fig. 1076",
  caption: "Iliac colon, sigmoid colon, and rectum.",
  aspect: 600 / 503,
};

const neck: Figure = {
  plate: require("../../assets/figures/neck-plate.jpg"),
  ghost: require("../../assets/figures/neck-ghost.png"),
  label: "Fig. 557",
  caption: "Veins of the head and neck, lateral view.",
  aspect: 847 / 1000,
};

const inguinal: Figure = {
  plate: require("../../assets/figures/inguinal-plate.jpg"),
  label: "Fig. 547",
  caption:
    "The relations of the femoral and abdominal inguinal rings, seen from within the abdomen. Right side.",
  aspect: 597 / 583,
};

const eyeball: Figure = {
  plate: require("../../assets/figures/eyeball-plate.jpg"),
  label: "Fig. 869",
  caption: "Horizontal section of the eyeball.",
  aspect: 600 / 481,
};

const eyeFront: Figure = {
  plate: require("../../assets/figures/eye-front-plate.jpg"),
  label: "Fig. 883",
  caption:
    "The upper half of a sagittal section through the front of the eyeball.",
  aspect: 600 / 682,
};

const aorticArch: Figure = {
  plate: require("../../assets/figures/aortic-arch-plate.jpg"),
  label: "Fig. 505",
  caption: "The arch of the aorta, and its branches.",
  aspect: 451 / 700,
};

const abdominalAorta: Figure = {
  plate: require("../../assets/figures/abdominal-aorta-plate.jpg"),
  label: "Fig. 531",
  caption: "The abdominal aorta and its branches.",
  aspect: 600 / 643,
};

const femoralArtery: Figure = {
  plate: require("../../assets/figures/femoral-artery-plate.jpg"),
  label: "Fig. 550",
  caption: "The femoral artery.",
  aspect: 445 / 750,
};

const carotid: Figure = {
  plate: require("../../assets/figures/carotid-plate.jpg"),
  label: "Fig. 513",
  caption: "The internal carotid and vertebral arteries. Right side.",
  aspect: 600 / 864,
};

const legSection: Figure = {
  plate: require("../../assets/figures/leg-section-plate.jpg"),
  label: "Fig. 440",
  caption: "Cross-section through middle of leg.",
  aspect: 600 / 413,
};

const legBones: Figure = {
  plate: require("../../assets/figures/leg-bones-plate.jpg"),
  label: "Fig. 258",
  caption: "Bones of the right leg. Anterior surface.",
  aspect: 346 / 1000,
};

const hipJoint: Figure = {
  plate: require("../../assets/figures/hip-joint-plate.jpg"),
  label: "Fig. 342",
  caption:
    "Hip-joint, front view. The capsular ligament has been largely removed.",
  aspect: 420 / 450,
};

const broadLigament: Figure = {
  plate: require("../../assets/figures/broad-ligament-plate.jpg"),
  label: "Fig. 1161",
  caption:
    "Uterus and right broad ligament, seen from behind. The broad ligament has been spread out and the ovary drawn downward.",
  aspect: 904 / 628,
};

const femalePelvis: Figure = {
  plate: require("../../assets/figures/female-pelvis-plate.jpg"),
  label: "Fig. 1165",
  caption: "Female pelvis and its contents, seen from above and in front.",
  aspect: 648 / 500,
};

const uterus: Figure = {
  plate: require("../../assets/figures/uterus-plate.jpg"),
  label: "Fig. 1167",
  caption: "Posterior half of uterus and upper part of vagina.",
  aspect: 276 / 300,
};

const femaleSagittal: Figure = {
  plate: require("../../assets/figures/female-sagittal-plate.jpg"),
  label: "Fig. 1139",
  caption: "Median sagittal section of female pelvis.",
  aspect: 569 / 500,
};

const uterineVessels: Figure = {
  plate: require("../../assets/figures/uterine-vessels-plate.jpg"),
  label: "Fig. 589",
  caption: "Vessels of the uterus and its appendages, rear view.",
  aspect: 600 / 356,
};

const brainBase: Figure = {
  plate: require("../../assets/figures/brain-base-plate.jpg"),
  label: "Fig. 516",
  caption: "The arteries of the base of the brain.",
  aspect: 600 / 681,
};

const cerebrum: Figure = {
  plate: require("../../assets/figures/cerebrum-plate.jpg"),
  label: "Fig. 726",
  caption: "Lateral surface of left cerebral hemisphere, viewed from the side.",
  aspect: 700 / 405,
};

const meninges: Figure = {
  plate: require("../../assets/figures/meninges-plate.jpg"),
  label: "Fig. 769",
  caption:
    "Diagrammatic section across the top of the skull, showing the membranes of the brain.",
  aspect: 550 / 416,
};

const nasalSeptum: Figure = {
  plate: require("../../assets/figures/nasal-septum-plate.jpg"),
  label: "Fig. 854",
  caption: "Bones and cartilages of septum of nose. Right side.",
  aspect: 400 / 369,
};

const mouth: Figure = {
  plate: require("../../assets/figures/mouth-plate.jpg"),
  label: "Fig. 1014",
  caption:
    "The mouth cavity. The cheeks have been slit transversely and the tongue pulled forward.",
  aspect: 600 / 582,
};

const neckLymph: Figure = {
  plate: require("../../assets/figures/neck-lymph-plate.jpg"),
  label: "Fig. 602",
  caption: "Superficial lymph glands and lymphatic vessels of head and neck.",
  aspect: 500 / 505,
};

const tongueLymph: Figure = {
  plate: require("../../assets/figures/tongue-lymph-plate.jpg"),
  label: "Fig. 605",
  caption: "Lymphatics of the tongue.",
  aspect: 500 / 488,
};

const mandible: Figure = {
  plate: require("../../assets/figures/mandible-plate.jpg"),
  label: "Fig. 176",
  caption: "Mandible. Outer surface. Side view.",
  aspect: 600 / 402,
};

const mandibularNerve: Figure = {
  plate: require("../../assets/figures/mandibular-nerve-plate.jpg"),
  label: "Fig. 781",
  caption: "Mandibular division of the trigeminal (trifacial) nerve.",
  aspect: 600 / 514,
};

const colicValve: Figure = {
  plate: require("../../assets/figures/colic-valve-plate.jpg"),
  label: "Fig. 1075",
  caption:
    "Interior of the cecum and lower end of ascending colon, showing colic valve.",
  aspect: 500 / 329,
};

const stomachOutline: Figure = {
  plate: require("../../assets/figures/stomach-outline-plate.jpg"),
  label: "Fig. 1046",
  caption: "Outline of stomach, showing its anatomical landmarks.",
  aspect: 374 / 288,
};

const spleen: Figure = {
  plate: require("../../assets/figures/spleen-plate.jpg"),
  label: "Fig. 1188",
  caption: "The visceral surface of the spleen.",
  aspect: 428 / 500,
};

const intestines: Figure = {
  plate: require("../../assets/figures/intestines-plate.jpg"),
  label: "Fig. 988",
  caption: "Final disposition of the intestines and their vascular relations.",
  aspect: 248 / 500,
};

const kidneys: Figure = {
  plate: require("../../assets/figures/kidneys-plate.jpg"),
  label: "Fig. 1121",
  caption:
    "Posterior abdominal wall, after removal of the peritoneum, showing kidneys, suprarenal capsules, and great vessels.",
  aspect: 538 / 599,
};

const malePelvis: Figure = {
  plate: require("../../assets/figures/male-pelvis-plate.jpg"),
  label: "Fig. 1135",
  caption: "Median sagittal section of male pelvis.",
  aspect: 597 / 550,
};

const testis: Figure = {
  plate: require("../../assets/figures/testis-plate.jpg"),
  label: "Fig. 1148",
  caption: "The right testis, exposed by laying open the tunica vaginalis.",
  aspect: 872 / 650,
};

const pleura: Figure = {
  plate: require("../../assets/figures/pleura-plate.jpg"),
  label: "Fig. 965",
  caption:
    "Front view of thorax, showing the relations of the pleurae and lungs to the chest wall.",
  aspect: 396 / 500,
};

const surfaceAnatomy: Figure = {
  plate: require("../../assets/figures/surface-anatomy-plate.jpg"),
  label: "Fig. 1219",
  caption: "Surface anatomy of the front of the thorax and abdomen.",
  aspect: 428 / 650,
};

const surfaceLines: Figure = {
  plate: require("../../assets/figures/surface-lines-plate.jpg"),
  label: "Fig. 1220",
  caption: "Surface lines of the front of the thorax and abdomen.",
  aspect: 434 / 550,
};

const skin: Figure = {
  plate: require("../../assets/figures/skin-plate.jpg"),
  label: "Fig. 940",
  caption: "A diagrammatic sectional view of the skin (magnified).",
  aspect: 500 / 566,
};

const figures: Record<string, Figure> = {
  "acute-angle-closure": eyeFront,
  "acute-aortic-dissection": aorticArch,
  "acute-appendicitis": appendix,
  "acute-cholecystitis": gallbladder,
  "acute-compartment-syndrome": legSection,
  "acute-diverticulitis": sigmoid,
  "acute-limb-ischemia": femoralArtery,
  "adhesive-sbo": ileocecal,
  "adnexal-torsion": broadLigament,
  "adult-neck-mass": neckLymph,
  "advanced-ovarian-cancer": femalePelvis,
  "aneurysmal-sah": brainBase,
  "bladder-trauma": malePelvis,
  "central-line-ij": neck,
  "cutaneous-melanoma": skin,
  "early-cervical-cancer": femaleSagittal,
  "early-endometrial-cancer": uterus,
  "early-oral-cavity-cancer": tongueLymph,
  "ectopic-pregnancy": broadLigament,
  epistaxis: nasalSeptum,
  "fulminant-c-difficile": intestines,
  "gallstone-pancreatitis": pancreas,
  "hip-fracture": hipJoint,
  intussusception: colicValve,
  "lap-chole": gallbladder,
  "major-burn": skin,
  "mandibular-third-molar": mandibularNerve,
  "mronj-risk": mandible,
  "necrotizing-soft-tissue-infection": legSection,
  "obstructing-infected-stone": kidneys,
  "open-globe-injury": eyeball,
  "open-tibial-fracture": legBones,
  "pediatric-spleen-injury": spleen,
  "perforated-peptic-ulcer": stomach,
  "pleural-infection": pleura,
  "postoperative-endophthalmitis": eyeball,
  "postpartum-hemorrhage": uterineVessels,
  "pyloric-stenosis": stomachOutline,
  "ruptured-aaa": abdominalAorta,
  "severe-tbi": cerebrum,
  "sigmoid-volvulus": sigmoid,
  "spontaneous-pneumothorax": pleura,
  "surgical-safety-checklist": surfaceLines,
  "symptomatic-carotid-stenosis": carotid,
  "tapp-inguinal-hernia": inguinal,
  "testicular-torsion": testis,
  tonsillectomy: mouth,
  "trauma-primary-survey": surfaceAnatomy,
  "traumatic-intracranial-hematoma": meninges,
};

export function figureFor(procedureId: string): Figure | undefined {
  return figures[procedureId];
}
