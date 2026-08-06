import { faker } from '@faker-js/faker';

/**
 * The sample hostnames aren't one pattern, they're several conventions that
 * tend to coexist in a real estate: a Windows default, a corporate asset tag,
 * a user-named laptop, a site/department code, and so on. Each generator below
 * is one of those conventions, so the output looks like a mixed environment
 * rather than fifty variations of the same string.
 */
const SITES = ['NY', 'TOR', 'LDN', 'SF', 'CHI', 'HQ', 'BR1'];
const DEPARTMENTS = ['FIN', 'HR', 'ENG', 'OPS', 'MKT', 'LEG', 'IT'];
const ENVIRONMENTS = ['DEV', 'QA', 'STG', 'PROD'];
const ROLES = ['BUILD', 'TEST', 'WEB', 'DB', 'CI'];
const PLATFORMS = ['LIN', 'WIN'];
const LAPTOP_MODELS = ['MBP16', 'MBP14', 'XPS13', 'TP14', 'YG7'];

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const ALPHANUMERIC = `${LETTERS}0123456789`;

function randomFrom(alphabet: string, length: number): string {
  return faker.helpers
    .multiple(() => faker.helpers.arrayElement([...alphabet]), { count: length })
    .join('');
}

function twoDigits(): string {
  return String(faker.number.int({ min: 1, max: 99 })).padStart(2, '0');
}

// DESKTOP-8KJ2M9P
function windowsDefault(): string {
  return `DESKTOP-${randomFrom(ALPHANUMERIC, 7)}`;
}

// CORP-LAP-M7421
function corporateAsset(): string {
  const kind = faker.helpers.arrayElement(['LAP', 'WS', 'DSK']);
  const letter = randomFrom(LETTERS, 1);
  const digits = String(faker.number.int({ min: 1000, max: 9999 }));
  return `CORP-${kind}-${letter}${digits}`;
}

/**
 * faker sometimes returns double-barrelled surnames like "Schowalter-Harvey",
 * which glue into an unreadable hostname once the punctuation is stripped.
 * Take the first part only and cap the length.
 */
function cleanName(value: string): string {
  const firstPart = value.split(/[\s-]/)[0] ?? value;
  return firstPart.replace(/[^A-Za-z]/g, '').slice(0, 9);
}

// JSMITH-MBP16
function userNamed(): string {
  const initial = cleanName(faker.person.firstName()).slice(0, 1);
  const surname = cleanName(faker.person.lastName());
  const model = faker.helpers.arrayElement(LAPTOP_MODELS);
  return `${initial}${surname}-${model}`.toUpperCase();
}

// NY-FIN-WS04
function siteDepartment(): string {
  const site = faker.helpers.arrayElement(SITES);
  const department = faker.helpers.arrayElement(DEPARTMENTS);
  const kind = faker.helpers.arrayElement(['WS', 'LAP', 'LTP']);
  return `${site}-${department}-${kind}${twoDigits()}`;
}

// DEV-BUILD-LIN02
function environmentBox(): string {
  const environment = faker.helpers.arrayElement(ENVIRONMENTS);
  const role = faker.helpers.arrayElement(ROLES);
  const platform = faker.helpers.arrayElement(PLATFORMS);
  return `${environment}-${role}-${platform}${twoDigits()}`;
}

// ALEX-RIG-PC
function personalRig(): string {
  const name = cleanName(faker.person.firstName()).toUpperCase();
  const suffix = faker.helpers.arrayElement(['RIG-PC', 'RIG-01', 'PC-01']);
  return `${name}-${suffix}`;
}

// HOME-SERVER-01
function homeLab(): string {
  const kind = faker.helpers.arrayElement(['SERVER', 'NAS', 'LAB']);
  return `HOME-${kind}-${twoDigits()}`;
}

// HQ-EXEC-MAC01
function executiveMachine(): string {
  const site = faker.helpers.arrayElement(['HQ', 'BR1', 'BR2']);
  const role = faker.helpers.arrayElement(['EXEC', 'MGR', 'DIR']);
  const platform = faker.helpers.arrayElement(['MAC', 'WIN']);
  return `${site}-${role}-${platform}${twoDigits()}`;
}

const GENERATORS = [
  windowsDefault,
  corporateAsset,
  userNamed,
  siteDepartment,
  environmentBox,
  personalRig,
  homeLab,
  executiveMachine,
];

const MAX_ATTEMPTS = 200;

/**
 * Returns a hostname not already in `taken`, and adds it. Bounded so a shrunken
 * generator set can't spin forever.
 */
export function uniqueHostname(taken: Set<string>): string {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const hostname = faker.helpers.arrayElement(GENERATORS)();
    if (!taken.has(hostname)) {
      taken.add(hostname);
      return hostname;
    }
  }

  throw new Error(`Could not find an unused hostname in ${String(MAX_ATTEMPTS)} attempts.`);
}
