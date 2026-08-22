"use client";

/**
 * Hand-drawn product illustrations for the aisles free stock libraries
 * cannot serve.
 *
 * Searching those categories returns unrelated goods — "diapers" gives
 * lingerie, smokestacks and literal photographs of bees — and taking
 * imagery from Amazon or Noon is not an option: those are their
 * copyrighted photographs, and a commercial storefront using them is the
 * client's legal exposure, not a technicality.
 *
 * So these are drawn here: accurate to the product, consistent with the
 * brand palette, crisp at any size, and impossible to 404. They read as a
 * deliberate catalogue style rather than a missing asset, and any of them
 * is replaced the moment real photography is uploaded in the admin.
 */

type Props = { className?: string };

const INK = "#2b2523";
const LINE = "#9c948c";

function Frame({
  tint,
  children,
}: {
  tint: string;
  children: React.ReactNode;
}) {
  const id = tint.replace("#", "g");
  return (
    <svg
      viewBox="0 0 200 200"
      className="h-full w-full"
      role="img"
      aria-hidden
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        {/* Soft vignette: lifts the product shape off the flat ground so
            it still reads at thumbnail size. */}
        <radialGradient id={id} cx="50%" cy="42%" r="72%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
          <stop offset="100%" stopColor={tint} stopOpacity="1" />
        </radialGradient>
      </defs>
      <rect width="200" height="200" fill={tint} />
      <rect width="200" height="200" fill={`url(#${id})`} />
      {children}
    </svg>
  );
}

/** A nappy: the classic hourglass brief with a tab and a wetness stripe. */
function Diaper({ body, accent, tint }: { body: string; accent: string; tint: string }) {
  return (
    <Frame tint={tint}>
      <path
        d="M55 68c30-9 60-9 90 0 4 20 2 38-6 54-12 24-30 36-39 36s-27-12-39-36c-8-16-10-34-6-54Z"
        fill={body}
        stroke={LINE}
        strokeWidth="2.5"
      />
      {/* Leg cuffs */}
      <path d="M62 116c14 6 24 8 38 8s24-2 38-8" fill="none" stroke={LINE} strokeWidth="2.5" />
      {/* Waist band */}
      <path d="M55 76c30-8 60-8 90 0" fill="none" stroke={accent} strokeWidth="6" strokeLinecap="round" />
      {/* Fastening tabs */}
      <rect x="47" y="78" width="16" height="12" rx="4" fill={accent} />
      <rect x="137" y="78" width="16" height="12" rx="4" fill={accent} />
      {/* Wetness indicator */}
      <path d="M100 96v26" stroke={accent} strokeWidth="3" strokeLinecap="round" opacity="0.55" />
    </Frame>
  );
}

function WipesPack() {
  return (
    <Frame tint="#dceafb">
      <rect x="42" y="66" width="116" height="76" rx="16" fill="#ffffff" stroke={LINE} strokeWidth="2.5" />
      {/* Dispenser flap */}
      <rect x="70" y="58" width="60" height="22" rx="10" fill="#dceafb" stroke={LINE} strokeWidth="2.5" />
      {/* The wipe being pulled through */}
      <path d="M92 60c0-8 16-8 16 0v-9c0-6-16-6-16 0Z" fill="#ffffff" stroke={LINE} strokeWidth="2" />
      <path d="M58 104h44" stroke="#9fc4ec" strokeWidth="4" strokeLinecap="round" />
      <path d="M58 118h28" stroke="#c4dcf5" strokeWidth="4" strokeLinecap="round" />
    </Frame>
  );
}

function BabyBottle() {
  return (
    <Frame tint="#dceafb">
      {/* Teat + collar */}
      <path d="M92 34c0-9 16-9 16 0 0 7-3 10-3 14H95c0-4-3-7-3-14Z" fill="#f3d9c4" stroke={LINE} strokeWidth="2" />
      <rect x="84" y="48" width="32" height="14" rx="5" fill="#dceafb" stroke={LINE} strokeWidth="2.5" />
      {/* Body */}
      <rect x="74" y="62" width="52" height="102" rx="20" fill="#ffffff" stroke={LINE} strokeWidth="2.5" />
      {/* Milk fill */}
      <path d="M74 112h52v32a20 20 0 0 1-20 20H94a20 20 0 0 1-20-20v-32Z" fill="#f4f8ff" />
      <path d="M74 112h52" stroke="#c4dcf5" strokeWidth="3" />
      {/* Measure marks */}
      <path d="M86 78h12M86 92h12M86 106h12" stroke={LINE} strokeWidth="2.5" strokeLinecap="round" />
    </Frame>
  );
}

function BathBottle() {
  return (
    <Frame tint="#dceafb">
      <rect x="86" y="34" width="28" height="18" rx="6" fill="#dceafb" stroke={LINE} strokeWidth="2.5" />
      <rect x="70" y="52" width="60" height="112" rx="22" fill="#ffffff" stroke={LINE} strokeWidth="2.5" />
      {/* Label band */}
      <rect x="70" y="86" width="60" height="44" fill="#dceafb" opacity="0.75" />
      <path d="M84 100h32M84 112h20" stroke="#8fb7e6" strokeWidth="4" strokeLinecap="round" />
    </Frame>
  );
}

function SanitaryPad() {
  return (
    <Frame tint="#fbdce9">
      {/* Pad body with wings */}
      <path
        d="M74 52h52c8 0 12 8 12 18v60c0 10-4 18-12 18H74c-8 0-12-8-12-18V70c0-10 4-18 12-18Z"
        fill="#ffffff"
        stroke={LINE}
        strokeWidth="2.5"
      />
      <path d="M62 88c-12 2-16 8-16 14s4 12 16 14V88Z" fill="#ffffff" stroke={LINE} strokeWidth="2.5" />
      <path d="M138 88c12 2 16 8 16 14s-4 12-16 14V88Z" fill="#ffffff" stroke={LINE} strokeWidth="2.5" />
      {/* Absorbent core */}
      <rect x="80" y="66" width="40" height="72" rx="18" fill="#fbdce9" />
      <path d="M100 78v48" stroke="#f2b8d0" strokeWidth="3" strokeLinecap="round" />
    </Frame>
  );
}

function TissueBox() {
  return (
    <Frame tint="#dcf3e6">
      <path d="M46 84h108v66a8 8 0 0 1-8 8H54a8 8 0 0 1-8-8V84Z" fill="#ffffff" stroke={LINE} strokeWidth="2.5" />
      <path d="M46 84l14-26h80l14 26Z" fill="#e4f7ec" stroke={LINE} strokeWidth="2.5" />
      {/* Tissue coming out of the slot */}
      <path d="M86 58c0-14 28-14 28 0-6-4-22-4-28 0Z" fill="#ffffff" stroke={LINE} strokeWidth="2" />
      <path d="M64 112h72" stroke="#a8dcc0" strokeWidth="5" strokeLinecap="round" />
      <path d="M64 128h44" stroke="#cdeddd" strokeWidth="5" strokeLinecap="round" />
    </Frame>
  );
}

function CreamTube({ tint, accent }: { tint: string; accent: string }) {
  return (
    <Frame tint={tint}>
      {/* Crimped tail */}
      <path d="M74 150h52v12H74z" fill={accent} />
      <path d="M74 150c8-46 8-74 0-96h52c-8 22-8 50 0 96Z" fill="#ffffff" stroke={LINE} strokeWidth="2.5" />
      {/* Shoulder + cap */}
      <path d="M74 54h52l-8-10H82Z" fill="#ffffff" stroke={LINE} strokeWidth="2.5" />
      <rect x="88" y="28" width="24" height="18" rx="5" fill={accent} />
      <rect x="80" y="80" width="40" height="34" rx="6" fill={accent} opacity="0.22" />
    </Frame>
  );
}

/**
 * Talc-style shaker: straight-sided tub, domed cap with sprinkle holes,
 * and a little powder falling. Foot powders are the one product in this
 * aisle a cream tube would misrepresent — the shaker top is how a shopper
 * recognises it on a shelf.
 */
function PowderBottle({ tint, accent }: { tint: string; accent: string }) {
  return (
    <Frame tint={tint}>
      {/* Body */}
      <rect x="70" y="66" width="60" height="94" rx="10" fill="#ffffff" stroke={LINE} strokeWidth="2.5" />
      {/* Label band */}
      <rect x="70" y="96" width="60" height="40" fill={accent} opacity="0.22" />
      <path d="M82 110h36M82 122h24" stroke={accent} strokeWidth="4" strokeLinecap="round" />
      {/* Shoulder + domed shaker cap */}
      <path d="M74 66h52l-6-12H80Z" fill="#ffffff" stroke={LINE} strokeWidth="2.5" />
      <path d="M80 54h40a20 20 0 0 0-40 0Z" fill={accent} />
      {/* Sprinkle holes */}
      <g fill="#ffffff">
        <circle cx="92" cy="44" r="2.4" />
        <circle cx="100" cy="41" r="2.4" />
        <circle cx="108" cy="44" r="2.4" />
      </g>
      {/* Powder in the air */}
      <g fill={accent} opacity="0.55">
        <circle cx="138" cy="46" r="3" />
        <circle cx="148" cy="58" r="2.2" />
        <circle cx="143" cy="70" r="1.8" />
        <circle cx="54" cy="52" r="2.4" />
        <circle cx="47" cy="64" r="1.8" />
      </g>
    </Frame>
  );
}

function Insole() {
  return (
    <Frame tint="#fbe8d6">
      <path
        d="M100 34c22 0 34 18 34 40 0 16-6 26-6 44 0 22-10 48-28 48s-28-24-28-44c0-20-6-30-6-48 0-22 12-40 34-40Z"
        fill="#ffffff"
        stroke={LINE}
        strokeWidth="2.5"
      />
      {/* Arch support shading */}
      <path d="M84 96c10 6 22 6 32 0" stroke="#e7b98c" strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d="M78 120c14 8 30 8 44 0" stroke="#f0d3b6" strokeWidth="4" strokeLinecap="round" fill="none" />
    </Frame>
  );
}

function FaceMask() {
  return (
    <Frame tint="#dbe7fa">
      <path
        d="M56 74c28-10 60-10 88 0v40c0 16-20 32-44 32s-44-16-44-32V74Z"
        fill="#ffffff"
        stroke={LINE}
        strokeWidth="2.5"
      />
      {/* Pleats */}
      <path d="M58 92h84M58 106h84M58 120h84" stroke="#cddef5" strokeWidth="3" />
      {/* Ear loops */}
      <path d="M56 78c-16 6-16 40 0 46" fill="none" stroke={LINE} strokeWidth="2.5" />
      <path d="M144 78c16 6 16 40 0 46" fill="none" stroke={LINE} strokeWidth="2.5" />
      {/* Nose wire */}
      <path d="M74 76c18-5 34-5 52 0" stroke="#9fc4ec" strokeWidth="4" strokeLinecap="round" fill="none" />
    </Frame>
  );
}

function WalkingStick() {
  return (
    <Frame tint="#dfe4ed">
      {/* Handle */}
      <path d="M120 44h-18a16 16 0 0 0-16 16v4" fill="none" stroke={INK} strokeWidth="9" strokeLinecap="round" />
      {/* Shaft */}
      <path d="M86 64v88" stroke="#8d97a8" strokeWidth="9" strokeLinecap="round" />
      {/* Height adjustment holes */}
      <circle cx="86" cy="108" r="3" fill="#dfe4ed" />
      <circle cx="86" cy="120" r="3" fill="#dfe4ed" />
      {/* Ferrule */}
      <rect x="78" y="150" width="16" height="14" rx="5" fill={INK} />
    </Frame>
  );
}

/** Aisle slug -> illustration. Only aisles with no honest photograph. */
const BY_AISLE: Record<string, () => React.ReactElement> = {
  "baby-diapers": () => <Diaper body="#ffffff" accent="#8fc4ea" tint="#dceafb" />,
  "adult-diapers": () => <Diaper body="#ffffff" accent="#9aa8bd" tint="#dfe4ed" />,
  "baby-wipes": WipesPack,
  feeding: BabyBottle,
  "baby-bath": BathBottle,
  "intimate-wash": () => <CreamTube tint="#fbdce9" accent="#e79ec0" />,
  "sanitary-pads": SanitaryPad,
  "tissues-paper": TissueBox,
  "foot-sweat": () => <PowderBottle tint="#eef4fb" accent="#6f9fd0" />,
  "foot-treatments": () => <CreamTube tint="#fbe8d6" accent="#e0a63c" />,
  "foot-tools": () => <CreamTube tint="#fbe8d6" accent="#c9a06a" />,
  insoles: Insole,
  "masks-gloves": FaceMask,
  "mobility-comfort": WalkingStick,
};

export function hasIllustration(aisleSlug?: string) {
  return Boolean(aisleSlug && BY_AISLE[aisleSlug]);
}

export function ProductIllustration({ aisleSlug }: { aisleSlug?: string } & Props) {
  const Draw = aisleSlug ? BY_AISLE[aisleSlug] : undefined;
  if (!Draw) return null;
  return <Draw />;
}
