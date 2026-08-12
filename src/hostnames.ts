import { faker } from '@faker-js/faker';

const SITES = ['NY', 'TOR', 'LDN', 'SF', 'CHI', 'HQ', 'BR1'];
const DEPARTMENTS = ['FIN', 'HR', 'ENG', 'OPS', 'MKT', 'LEG', 'IT'];
const ENVIRONMENTS = ['DEV', 'QA', 'STG', 'PROD'];
const ROLES = ['BLD', 'TEST', 'WEB', 'DB', 'CI'];
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

/** Windows hostnames are capped at 15 characters, so names get a budget. */
const MAX_HOSTNAME_LENGTH = 15;

/**
 * faker sometimes returns double-barrelled surnames like "Schowalter-Harvey",
 * which glue into an unreadable hostname once the punctuation is stripped.
 * Take the first part only, and cut it to whatever room is left.
 */
function cleanName(value: string, maxLength: number): string {
  const firstPart = value.split(/[\s-]/)[0] ?? value;
  return firstPart.replace(/[^A-Za-z]/g, '').slice(0, maxLength);
}

function windowsDefault(): string {
  return `DESKTOP-${randomFrom(ALPHANUMERIC, 7)}`;
}

function corporateAsset(): string {
  const kind = faker.helpers.arrayElement(['LAP', 'WS', 'DSK']);
  const letter = randomFrom(LETTERS, 1);
  const digits = String(faker.number.int({ min: 1000, max: 9999 }));
  return `CORP-${kind}-${letter}${digits}`;
}

function userNamed(): string {
  const model = faker.helpers.arrayElement(LAPTOP_MODELS);
  // 1 for the initial, 1 for the hyphen, and whatever the model takes.
  const surnameBudget = MAX_HOSTNAME_LENGTH - 1 - 1 - model.length;
  const initial = cleanName(faker.person.firstName(), 1);
  const surname = cleanName(faker.person.lastName(), surnameBudget);
  return `${initial}${surname}-${model}`.toUpperCase();
}

function siteDepartment(): string {
  const site = faker.helpers.arrayElement(SITES);
  const department = faker.helpers.arrayElement(DEPARTMENTS);
  const kind = faker.helpers.arrayElement(['WS', 'LAP', 'LTP']);
  return `${site}-${department}-${kind}${twoDigits()}`;
}

function environmentBox(): string {
  const environment = faker.helpers.arrayElement(ENVIRONMENTS);
  const role = faker.helpers.arrayElement(ROLES);
  const platform = faker.helpers.arrayElement(PLATFORMS);
  return `${environment}-${role}-${platform}${twoDigits()}`;
}

function personalRig(): string {
  const suffix = faker.helpers.arrayElement(['RIG-PC', 'RIG-01', 'PC-01']);
  const nameBudget = MAX_HOSTNAME_LENGTH - 1 - suffix.length;
  const name = cleanName(faker.person.firstName(), nameBudget).toUpperCase();
  return `${name}-${suffix}`;
}

function homeLab(): string {
  const kind = faker.helpers.arrayElement(['SERVER', 'NAS', 'LAB']);
  return `HOME-${kind}-${twoDigits()}`;
}

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
