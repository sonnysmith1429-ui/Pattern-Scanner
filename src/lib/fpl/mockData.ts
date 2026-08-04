/**
 * Deterministic, procedurally generated fallback dataset.
 *
 * Used whenever the live FPL API is unreachable (CORS blocked, network down,
 * endpoint changed) and for the app's explicit "Try Demo Squad" mode. Every
 * screen that renders this data must show a DEMO DATA badge — see
 * useFplData's `freshness.source === 'mock'` flag.
 *
 * Player and club names are real (so screenshot OCR has something genuine
 * to match against) but every statistic — price, points, form, fixtures,
 * results, injury status — is procedurally generated (seeded RNG) and is
 * never real. The DEMO DATA badge shown everywhere this dataset is used
 * makes that split explicit, and injury/news text is itself labelled as
 * simulated so it's never mistaken for a real report about a real player.
 */
import type {
  Player,
  Team,
  Gameweek,
  Fixture,
  FplDataset,
  Position,
  PlayerGameweekHistory,
  AvailabilityStatus,
} from '../../types';
import type { Squad, DetectedSquad } from '../../types';

function mulberry32(seed: number) {
  let a = seed;
  return function rng() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Rng = () => number;
const int = (rng: Rng, min: number, max: number) => Math.floor(rng() * (max - min + 1)) + min;
const round1 = (n: number) => Math.round(n * 10) / 10;
const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

interface ClubSeed {
  id: number;
  name: string;
  shortName: string;
  tier: number; // 1 (weakest) - 5 (strongest) — drives fixture difficulty & player quality
}

/**
 * Real, recognisable Premier League club and player names, so that OCR
 * matching against an uploaded screenshot actually has something real to
 * find — a purely fictional name pool means every upload fails to match
 * anything. Everything numeric (price, points, form, injuries, fixtures,
 * results) is still procedurally generated and is never real; the
 * DEMO DATA badge shown everywhere this dataset is used makes that
 * distinction explicit. Rosters reflect recent squads from this app's
 * training data, not a live transfer feed, so treat exact club/position
 * assignments as illustrative rather than currently accurate.
 */
const CLUBS: ClubSeed[] = [
  { id: 1, name: 'Arsenal', shortName: 'ARS', tier: 5 },
  { id: 2, name: 'Manchester City', shortName: 'MCI', tier: 5 },
  { id: 3, name: 'Liverpool', shortName: 'LIV', tier: 5 },
  { id: 4, name: 'Chelsea', shortName: 'CHE', tier: 4 },
  { id: 5, name: 'Manchester United', shortName: 'MUN', tier: 4 },
  { id: 6, name: 'Newcastle United', shortName: 'NEW', tier: 4 },
  { id: 7, name: 'Tottenham Hotspur', shortName: 'TOT', tier: 4 },
  { id: 8, name: 'Aston Villa', shortName: 'AVL', tier: 4 },
  { id: 9, name: 'Brighton & Hove Albion', shortName: 'BHA', tier: 3 },
  { id: 10, name: 'Crystal Palace', shortName: 'CRY', tier: 3 },
  { id: 11, name: 'Brentford', shortName: 'BRE', tier: 3 },
  { id: 12, name: 'West Ham United', shortName: 'WHU', tier: 3 },
  { id: 13, name: 'Fulham', shortName: 'FUL', tier: 2 },
  { id: 14, name: 'Everton', shortName: 'EVE', tier: 2 },
  { id: 15, name: 'Bournemouth', shortName: 'BOU', tier: 2 },
  { id: 16, name: 'Nottingham Forest', shortName: 'NFO', tier: 2 },
  { id: 17, name: 'Wolverhampton Wanderers', shortName: 'WOL', tier: 2 },
  { id: 18, name: 'Leicester City', shortName: 'LEI', tier: 1 },
  { id: 19, name: 'Southampton', shortName: 'SOU', tier: 1 },
  { id: 20, name: 'Ipswich Town', shortName: 'IPS', tier: 1 },
];

interface RosterEntry {
  first: string;
  last: string;
}

/** Ordered to match roleTemplate(): GKP, GKP, DEF x5, MID x5, FWD x3 — first MID/FWD is the "star" slot. */
const ROSTERS: Record<string, RosterEntry[]> = {
  ARS: [
    { first: 'David', last: 'Raya' }, { first: 'Aaron', last: 'Ramsdale' },
    { first: 'William', last: 'Saliba' }, { first: 'Gabriel', last: 'Magalhaes' }, { first: 'Ben', last: 'White' }, { first: 'Jurrien', last: 'Timber' }, { first: 'Oleksandr', last: 'Zinchenko' },
    { first: 'Martin', last: 'Odegaard' }, { first: 'Declan', last: 'Rice' }, { first: 'Bukayo', last: 'Saka' }, { first: 'Gabriel', last: 'Martinelli' }, { first: 'Mikel', last: 'Merino' },
    { first: 'Kai', last: 'Havertz' }, { first: 'Gabriel', last: 'Jesus' }, { first: 'Leandro', last: 'Trossard' },
  ],
  MCI: [
    { first: 'Ederson', last: 'Moraes' }, { first: 'Stefan', last: 'Ortega' },
    { first: 'Ruben', last: 'Dias' }, { first: 'John', last: 'Stones' }, { first: 'Kyle', last: 'Walker' }, { first: 'Josko', last: 'Gvardiol' }, { first: 'Nathan', last: 'Ake' },
    { first: 'Kevin', last: 'De Bruyne' }, { first: 'Bernardo', last: 'Silva' }, { first: 'Rodri', last: 'Hernandez' }, { first: 'Phil', last: 'Foden' }, { first: 'Jack', last: 'Grealish' },
    { first: 'Erling', last: 'Haaland' }, { first: 'Julian', last: 'Alvarez' }, { first: 'Jeremy', last: 'Doku' },
  ],
  LIV: [
    { first: 'Alisson', last: 'Becker' }, { first: 'Caoimhin', last: 'Kelleher' },
    { first: 'Virgil', last: 'van Dijk' }, { first: 'Ibrahima', last: 'Konate' }, { first: 'Trent', last: 'Alexander-Arnold' }, { first: 'Andrew', last: 'Robertson' }, { first: 'Joe', last: 'Gomez' },
    { first: 'Mohamed', last: 'Salah' }, { first: 'Dominik', last: 'Szoboszlai' }, { first: 'Alexis', last: 'Mac Allister' }, { first: 'Curtis', last: 'Jones' }, { first: 'Ryan', last: 'Gravenberch' },
    { first: 'Darwin', last: 'Nunez' }, { first: 'Diogo', last: 'Jota' }, { first: 'Cody', last: 'Gakpo' },
  ],
  CHE: [
    { first: 'Robert', last: 'Sanchez' }, { first: 'Djordje', last: 'Petrovic' },
    { first: 'Levi', last: 'Colwill' }, { first: 'Wesley', last: 'Fofana' }, { first: 'Reece', last: 'James' }, { first: 'Marc', last: 'Cucurella' }, { first: 'Axel', last: 'Disasi' },
    { first: 'Cole', last: 'Palmer' }, { first: 'Enzo', last: 'Fernandez' }, { first: 'Moises', last: 'Caicedo' }, { first: 'Conor', last: 'Gallagher' }, { first: 'Christopher', last: 'Nkunku' },
    { first: 'Nicolas', last: 'Jackson' }, { first: 'Mykhailo', last: 'Mudryk' }, { first: 'Armando', last: 'Broja' },
  ],
  MUN: [
    { first: 'Andre', last: 'Onana' }, { first: 'Altay', last: 'Bayindir' },
    { first: 'Lisandro', last: 'Martinez' }, { first: 'Raphael', last: 'Varane' }, { first: 'Diogo', last: 'Dalot' }, { first: 'Luke', last: 'Shaw' }, { first: 'Harry', last: 'Maguire' },
    { first: 'Bruno', last: 'Fernandes' }, { first: 'Casemiro', last: 'Silva' }, { first: 'Mason', last: 'Mount' }, { first: 'Christian', last: 'Eriksen' }, { first: 'Kobbie', last: 'Mainoo' },
    { first: 'Rasmus', last: 'Hojlund' }, { first: 'Marcus', last: 'Rashford' }, { first: 'Antony', last: 'Santos' },
  ],
  NEW: [
    { first: 'Nick', last: 'Pope' }, { first: 'Martin', last: 'Dubravka' },
    { first: 'Sven', last: 'Botman' }, { first: 'Fabian', last: 'Schar' }, { first: 'Kieran', last: 'Trippier' }, { first: 'Dan', last: 'Burn' }, { first: 'Tino', last: 'Livramento' },
    { first: 'Bruno', last: 'Guimaraes' }, { first: 'Joelinton', last: 'Cassio' }, { first: 'Sean', last: 'Longstaff' }, { first: 'Miguel', last: 'Almiron' }, { first: 'Sandro', last: 'Tonali' },
    { first: 'Alexander', last: 'Isak' }, { first: 'Callum', last: 'Wilson' }, { first: 'Anthony', last: 'Gordon' },
  ],
  TOT: [
    { first: 'Guglielmo', last: 'Vicario' }, { first: 'Fraser', last: 'Forster' },
    { first: 'Cristian', last: 'Romero' }, { first: 'Micky', last: 'van de Ven' }, { first: 'Pedro', last: 'Porro' }, { first: 'Destiny', last: 'Udogie' }, { first: 'Ben', last: 'Davies' },
    { first: 'James', last: 'Maddison' }, { first: 'Yves', last: 'Bissouma' }, { first: 'Pape Matar', last: 'Sarr' }, { first: 'Rodrigo', last: 'Bentancur' }, { first: 'Giovani', last: 'Lo Celso' },
    { first: 'Son', last: 'Heung-min' }, { first: 'Dominic', last: 'Solanke' }, { first: 'Richarlison', last: 'Andrade' },
  ],
  AVL: [
    { first: 'Emiliano', last: 'Martinez' }, { first: 'Robin', last: 'Olsen' },
    { first: 'Ezri', last: 'Konsa' }, { first: 'Pau', last: 'Torres' }, { first: 'Lucas', last: 'Digne' }, { first: 'Matty', last: 'Cash' }, { first: 'Diego', last: 'Carlos' },
    { first: 'Morgan', last: 'Rogers' }, { first: 'John', last: 'McGinn' }, { first: 'Leon', last: 'Bailey' }, { first: 'Boubacar', last: 'Kamara' }, { first: 'Jacob', last: 'Ramsey' },
    { first: 'Ollie', last: 'Watkins' }, { first: 'Jhon', last: 'Duran' }, { first: 'Cameron', last: 'Archer' },
  ],
  BHA: [
    { first: 'Bart', last: 'Verbruggen' }, { first: 'Jason', last: 'Steele' },
    { first: 'Lewis', last: 'Dunk' }, { first: 'Adam', last: 'Webster' }, { first: 'Pervis', last: 'Estupinan' }, { first: 'Jan Paul', last: 'van Hecke' }, { first: 'Tariq', last: 'Lamptey' },
    { first: 'Kaoru', last: 'Mitoma' }, { first: 'Pascal', last: 'Gross' }, { first: 'Billy', last: 'Gilmour' }, { first: 'Facundo', last: 'Buonanotte' }, { first: 'Julio', last: 'Enciso' },
    { first: 'Danny', last: 'Welbeck' }, { first: 'Joao', last: 'Pedro' }, { first: 'Evan', last: 'Ferguson' },
  ],
  CRY: [
    { first: 'Dean', last: 'Henderson' }, { first: 'Sam', last: 'Johnstone' },
    { first: 'Marc', last: 'Guehi' }, { first: 'Joachim', last: 'Andersen' }, { first: 'Tyrick', last: 'Mitchell' }, { first: 'Daniel', last: 'Munoz' }, { first: 'Nathaniel', last: 'Clyne' },
    { first: 'Eberechi', last: 'Eze' }, { first: 'Adam', last: 'Wharton' }, { first: 'Jefferson', last: 'Lerma' }, { first: 'Will', last: 'Hughes' }, { first: 'Cheick', last: 'Doucoure' },
    { first: 'Jean-Philippe', last: 'Mateta' }, { first: 'Odsonne', last: 'Edouard' }, { first: 'Eddie', last: 'Nketiah' },
  ],
  BRE: [
    { first: 'Mark', last: 'Flekken' }, { first: 'Thomas', last: 'Strakosha' },
    { first: 'Ethan', last: 'Pinnock' }, { first: 'Nathan', last: 'Collins' }, { first: 'Rico', last: 'Henry' }, { first: 'Ben', last: 'Mee' }, { first: 'Kristoffer', last: 'Ajer' },
    { first: 'Mikkel', last: 'Damsgaard' }, { first: 'Vitaly', last: 'Janelt' }, { first: 'Mathias', last: 'Jensen' }, { first: 'Yehor', last: 'Yarmoliuk' }, { first: 'Frank', last: 'Onyeka' },
    { first: 'Bryan', last: 'Mbeumo' }, { first: 'Yoane', last: 'Wissa' }, { first: 'Kevin', last: 'Schade' },
  ],
  WHU: [
    { first: 'Alphonse', last: 'Areola' }, { first: 'Lukasz', last: 'Fabianski' },
    { first: 'Kurt', last: 'Zouma' }, { first: 'Nayef', last: 'Aguerd' }, { first: 'Vladimir', last: 'Coufal' }, { first: 'Emerson', last: 'Palmieri' }, { first: 'Aaron', last: 'Cresswell' },
    { first: 'Lucas', last: 'Paqueta' }, { first: 'James', last: 'Ward-Prowse' }, { first: 'Tomas', last: 'Soucek' }, { first: 'Edson', last: 'Alvarez' }, { first: 'Mohammed', last: 'Kudus' },
    { first: 'Jarrod', last: 'Bowen' }, { first: 'Michail', last: 'Antonio' }, { first: 'Danny', last: 'Ings' },
  ],
  FUL: [
    { first: 'Bernd', last: 'Leno' }, { first: 'Marek', last: 'Rodak' },
    { first: 'Calvin', last: 'Bassey' }, { first: 'Issa', last: 'Diop' }, { first: 'Antonee', last: 'Robinson' }, { first: 'Kenny', last: 'Tete' }, { first: 'Timothy', last: 'Castagne' },
    { first: 'Andreas', last: 'Pereira' }, { first: 'Sasa', last: 'Lukic' }, { first: 'Harrison', last: 'Reed' }, { first: 'Tom', last: 'Cairney' }, { first: 'Alex', last: 'Iwobi' },
    { first: 'Raul', last: 'Jimenez' }, { first: 'Rodrigo', last: 'Muniz' }, { first: 'Adama', last: 'Traore' },
  ],
  EVE: [
    { first: 'Jordan', last: 'Pickford' }, { first: 'Joao', last: 'Virginia' },
    { first: 'Jarrad', last: 'Branthwaite' }, { first: 'James', last: 'Tarkowski' }, { first: 'Vitaliy', last: 'Mykolenko' }, { first: 'Ashley', last: 'Young' }, { first: 'Nathan', last: 'Patterson' },
    { first: 'Idrissa', last: 'Gueye' }, { first: 'Abdoulaye', last: 'Doucoure' }, { first: 'Dwight', last: 'McNeil' }, { first: 'James', last: 'Garner' }, { first: 'Iliman', last: 'Ndiaye' },
    { first: 'Dominic', last: 'Calvert-Lewin' }, { first: 'Beto', last: 'Betuncal' }, { first: 'Youssef', last: 'Chermiti' },
  ],
  BOU: [
    { first: 'Neto', last: 'Murara' }, { first: 'Mark', last: 'Travers' },
    { first: 'Illia', last: 'Zabarnyi' }, { first: 'Marcos', last: 'Senesi' }, { first: 'Adam', last: 'Smith' }, { first: 'Milos', last: 'Kerkez' }, { first: 'James', last: 'Hill' },
    { first: 'Ryan', last: 'Christie' }, { first: 'Philip', last: 'Billing' }, { first: 'David', last: 'Brooks' }, { first: 'Marcus', last: 'Tavernier' }, { first: 'Alex', last: 'Scott' },
    { first: 'Antoine', last: 'Semenyo' }, { first: 'Justin', last: 'Kluivert' }, { first: 'Enes', last: 'Unal' },
  ],
  NFO: [
    { first: 'Matz', last: 'Sels' }, { first: 'Wayne', last: 'Hennessey' },
    { first: 'Murillo', last: 'Santos' }, { first: 'Willy', last: 'Boly' }, { first: 'Ola', last: 'Aina' }, { first: 'Neco', last: 'Williams' }, { first: 'Andrew', last: 'Omobamidele' },
    { first: 'Morgan', last: 'Gibbs-White' }, { first: 'Ryan', last: 'Yates' }, { first: 'Danilo', last: 'dos Santos' }, { first: 'Nicolas', last: 'Dominguez' }, { first: 'Callum', last: 'Hudson-Odoi' },
    { first: 'Chris', last: 'Wood' }, { first: 'Taiwo', last: 'Awoniyi' }, { first: 'Anthony', last: 'Elanga' },
  ],
  WOL: [
    { first: 'Jose', last: 'Sa' }, { first: 'Daniel', last: 'Bentley' },
    { first: 'Toti', last: 'Gomes' }, { first: 'Craig', last: 'Dawson' }, { first: 'Rayan', last: 'Ait-Nouri' }, { first: 'Nelson', last: 'Semedo' }, { first: 'Santiago', last: 'Bueno' },
    { first: 'Mario', last: 'Lemina' }, { first: 'Joao', last: 'Gomes' }, { first: 'Pablo', last: 'Sarabia' }, { first: 'Boubacar', last: 'Traore' }, { first: 'Jean-Ricner', last: 'Bellegarde' },
    { first: 'Matheus', last: 'Cunha' }, { first: 'Hwang', last: 'Hee-chan' }, { first: 'Pedro', last: 'Neto' },
  ],
  LEI: [
    { first: 'Mads', last: 'Hermansen' }, { first: 'Danny', last: 'Ward' },
    { first: 'Wout', last: 'Faes' }, { first: 'Jannik', last: 'Vestergaard' }, { first: 'Ricardo', last: 'Pereira' }, { first: 'Victor', last: 'Kristiansen' }, { first: 'James', last: 'Justin' },
    { first: 'Youri', last: 'Tielemans' }, { first: 'Kiernan', last: 'Dewsbury-Hall' }, { first: 'Wilfred', last: 'Ndidi' }, { first: 'Harry', last: 'Winks' }, { first: 'Bobby', last: 'Decordova-Reid' },
    { first: 'Jamie', last: 'Vardy' }, { first: 'Patson', last: 'Daka' }, { first: 'Abdul', last: 'Fatawu' },
  ],
  SOU: [
    { first: 'Alex', last: 'McCarthy' }, { first: 'Gavin', last: 'Bazunu' },
    { first: 'Jan', last: 'Bednarek' }, { first: 'Taylor', last: 'Harwood-Bellis' }, { first: 'Kyle', last: 'Walker-Peters' }, { first: 'Ryan', last: 'Manning' }, { first: 'Jack', last: 'Stephens' },
    { first: 'Will', last: 'Smallbone' }, { first: 'Flynn', last: 'Downes' }, { first: 'Joe', last: 'Rothwell' }, { first: 'Mateus', last: 'Fernandes' }, { first: 'Shea', last: 'Charles' },
    { first: 'Adam', last: 'Armstrong' }, { first: 'Ross', last: 'Stewart' }, { first: 'Paul', last: 'Onuachu' },
  ],
  IPS: [
    { first: 'Arijanet', last: 'Muric' }, { first: 'Christian', last: 'Walton' },
    { first: 'Axel', last: 'Tuanzebe' }, { first: 'Cameron', last: 'Burgess' }, { first: 'Leif', last: 'Davis' }, { first: 'Jacob', last: 'Greaves' }, { first: 'Harry', last: 'Clarke' },
    { first: 'Sammie', last: 'Szmodics' }, { first: 'Massimo', last: 'Luongo' }, { first: 'Jack', last: 'Taylor' }, { first: 'Kalvin', last: 'Phillips' }, { first: 'Jens', last: 'Cajuste' },
    { first: 'Liam', last: 'Delap' }, { first: 'George', last: 'Hirst' }, { first: 'Conor', last: 'Chaplin' },
  ],
};

export const CURRENT_GAMEWEEK = 4;
const TOTAL_GAMEWEEKS = 38;

function buildTeams(): Team[] {
  return CLUBS.map((c) => {
    const overall = 900 + c.tier * 85;
    return {
      id: c.id,
      name: c.name,
      shortName: c.shortName,
      strengthOverallHome: overall + 40,
      strengthOverallAway: overall,
      strengthAttackHome: overall + 30,
      strengthAttackAway: overall - 10,
      strengthDefenceHome: overall + 30,
      strengthDefenceAway: overall - 10,
    };
  });
}

/** Circle-method round robin: 19 rounds covering all 190 unique pairings once. */
function buildFixtures(rng: Rng): Fixture[] {
  const ids = CLUBS.map((c) => c.id);
  const rotating = ids.slice(1);
  const fixtures: Fixture[] = [];
  let fixtureId = 1;
  const baseDate = new Date('2026-08-15T15:00:00Z');

  const roundsOfPairs: { home: number; away: number }[][] = [];
  const arr = [ids[0], ...rotating];
  for (let round = 0; round < 19; round++) {
    const pairs: { home: number; away: number }[] = [];
    for (let i = 0; i < 10; i++) {
      const a = arr[i];
      const b = arr[19 - i];
      const swap = (round + i) % 2 === 0;
      pairs.push(swap ? { home: a, away: b } : { home: b, away: a });
    }
    roundsOfPairs.push(pairs);
    arr.splice(1, 0, arr.pop() as number);
  }

  const clubById = new Map(CLUBS.map((c) => [c.id, c]));
  const difficultyFor = (opponentId: number) => clamp(clubById.get(opponentId)?.tier ?? 3, 1, 5);

  for (let leg = 0; leg < 2; leg++) {
    for (let round = 0; round < 19; round++) {
      const gw = leg * 19 + round + 1;
      const kickoff = new Date(baseDate.getTime() + (gw - 1) * 7 * 86400000);
      for (const pair of roundsOfPairs[round]) {
        const home = leg === 0 ? pair.home : pair.away;
        const away = leg === 0 ? pair.away : pair.home;
        const finished = gw < CURRENT_GAMEWEEK;
        let homeScore: number | null = null;
        let awayScore: number | null = null;
        if (finished) {
          const homeTier = clubById.get(home)?.tier ?? 3;
          const awayTier = clubById.get(away)?.tier ?? 3;
          homeScore = clamp(Math.round(rng() * 3 + homeTier / 3), 0, 5);
          awayScore = clamp(Math.round(rng() * 2.5 + awayTier / 3.5), 0, 5);
        }
        fixtures.push({
          id: fixtureId++,
          gameweek: gw,
          kickoffTime: kickoff.toISOString(),
          finished,
          homeTeamId: home,
          awayTeamId: away,
          homeDifficulty: difficultyFor(away),
          awayDifficulty: difficultyFor(home),
          homeScore,
          awayScore,
        });
      }
    }
  }
  return fixtures;
}

interface RoleSeed {
  position: Position;
  role: 'star' | 'starter' | 'rotation' | 'backup';
}

function roleTemplate(tier: number): RoleSeed[] {
  const template: RoleSeed[] = [
    { position: 'GKP', role: 'starter' },
    { position: 'GKP', role: 'backup' },
    { position: 'DEF', role: 'starter' },
    { position: 'DEF', role: 'starter' },
    { position: 'DEF', role: 'starter' },
    { position: 'DEF', role: 'rotation' },
    { position: 'DEF', role: 'backup' },
    { position: 'MID', role: tier >= 4 ? 'star' : 'starter' },
    { position: 'MID', role: 'starter' },
    { position: 'MID', role: 'starter' },
    { position: 'MID', role: 'rotation' },
    { position: 'MID', role: 'backup' },
    { position: 'FWD', role: tier >= 4 ? 'star' : 'starter' },
    { position: 'FWD', role: 'starter' },
    { position: 'FWD', role: 'rotation' },
  ];
  return template;
}

function basePrice(position: Position, role: RoleSeed['role'], tier: number, rng: Rng): number {
  const tierBump = tier * (position === 'GKP' ? 0.2 : position === 'DEF' ? 0.35 : position === 'MID' ? 0.55 : 0.6);
  const roleBump =
    role === 'star' ? 3.4 + tier * 0.55 : role === 'starter' ? 1.2 : role === 'rotation' ? 0.2 : -0.3;
  const floor = position === 'GKP' ? 4.0 : position === 'DEF' ? 3.9 : position === 'MID' ? 4.4 : 4.4;
  const price = floor + tierBump + roleBump + rng() * 1.1;
  return round1(clamp(price, 3.9, 14.5));
}

interface WeekStat {
  points: number;
  minutes: number;
  goals: number;
  assists: number;
  bonus: number;
  cleanSheets: number;
  xG: number;
  xA: number;
  goalsConceded: number;
  saves: number;
}

function generateWeek(
  rng: Rng,
  position: Position,
  role: RoleSeed['role'],
  tier: number,
  fixtureDifficultyForTeam: number,
): WeekStat {
  const playChance = role === 'backup' ? 0.12 : role === 'rotation' ? 0.55 : 0.93;
  const plays = rng() < playChance;
  if (!plays) {
    return { points: rng() < 0.3 ? 1 : 0, minutes: rng() < 0.3 ? int(rng, 5, 30) : 0, goals: 0, assists: 0, bonus: 0, cleanSheets: 0, xG: 0, xA: 0, goalsConceded: int(rng, 0, 2), saves: 0 };
  }
  const minutes = role === 'rotation' ? int(rng, 45, 90) : int(rng, 75, 90);
  const easy = fixtureDifficultyForTeam <= 2;
  const hard = fixtureDifficultyForTeam >= 4;
  const cleanSheetChance = clamp(0.15 + tier * 0.06 + (easy ? 0.15 : hard ? -0.12 : 0), 0.03, 0.65);
  const cleanSheets = (position === 'GKP' || position === 'DEF') && rng() < cleanSheetChance ? 1 : 0;
  const goalsConceded = cleanSheets ? 0 : int(rng, 1, hard ? 4 : 2);

  let goals = 0;
  let assists = 0;
  let xG = 0;
  let xA = 0;
  const attackTilt = role === 'star' ? 1 : role === 'starter' ? 0.55 : 0.25;
  if (position === 'MID' || position === 'FWD') {
    xG = round1(rng() * (position === 'FWD' ? 0.9 : 0.55) * attackTilt * (easy ? 1.3 : hard ? 0.75 : 1));
    xA = round1(rng() * (position === 'MID' ? 0.6 : 0.3) * attackTilt * (easy ? 1.3 : hard ? 0.75 : 1));
    if (rng() < xG * 0.8) goals = 1;
    if (rng() < xA * 0.8 && !goals) assists = 1;
    if (rng() < 0.05 * attackTilt) goals += 1;
  } else if (position === 'DEF') {
    xG = round1(rng() * 0.15 * attackTilt);
    xA = round1(rng() * 0.2 * attackTilt);
    if (rng() < 0.06 * attackTilt) assists = 1;
    if (rng() < 0.03 * attackTilt) goals = 1;
  }

  const saves = position === 'GKP' ? int(rng, 0, hard ? 7 : 4) : 0;
  let points = position === 'GKP' || position === 'DEF' ? 2 : position === 'MID' ? 2 : 2;
  points += cleanSheets ? (position === 'FWD' ? 0 : 4) : 0;
  points += goals * (position === 'GKP' || position === 'DEF' ? 6 : position === 'MID' ? 5 : 4);
  points += assists * 3;
  points += Math.floor(saves / 3);
  points -= Math.floor(goalsConceded / 2) * (position === 'GKP' || position === 'DEF' ? 1 : 0);
  const bonus = rng() < 0.18 * (attackTilt + 0.3) ? int(rng, 1, 3) : 0;
  points += bonus;
  points = Math.max(0, Math.round(points));

  return { points, minutes, goals, assists, bonus, cleanSheets, xG, xA, goalsConceded, saves };
}

/** Mirrors real FPL's web_name convention: surname alone, unless that collides with another player, in which case fall back to "F. Surname" or the full name. */
function resolveDisplayNameCollisions(players: Player[]): void {
  const bySurname = new Map<string, Player[]>();
  for (const p of players) {
    const group = bySurname.get(p.secondName) ?? [];
    group.push(p);
    bySurname.set(p.secondName, group);
  }
  for (const group of bySurname.values()) {
    if (group.length === 1) continue;
    const byInitial = new Map<string, Player[]>();
    for (const p of group) {
      const key = p.firstName[0] ?? '';
      const sub = byInitial.get(key) ?? [];
      sub.push(p);
      byInitial.set(key, sub);
    }
    for (const p of group) {
      const initial = p.firstName[0] ?? '';
      const sameInitialGroup = byInitial.get(initial) ?? [];
      p.displayName = sameInitialGroup.length > 1 ? `${p.firstName} ${p.secondName}` : `${initial}. ${p.secondName}`;
    }
  }
}

export interface MockBundle {
  dataset: FplDataset;
  playerHistory: Map<number, PlayerGameweekHistory[]>;
  demoSquad: Squad;
  demoDetectedSquad: DetectedSquad;
}

let cached: MockBundle | null = null;

export function getMockBundle(): MockBundle {
  if (cached) return cached;

  const rng = mulberry32(20260804);
  const teams = buildTeams();
  const fixtures = buildFixtures(rng);
  const fixturesByTeamGw = new Map<string, number>();
  for (const f of fixtures) {
    if (f.gameweek == null) continue;
    fixturesByTeamGw.set(`${f.homeTeamId}-${f.gameweek}`, f.homeDifficulty);
    fixturesByTeamGw.set(`${f.awayTeamId}-${f.gameweek}`, f.awayDifficulty);
  }

  const players: Player[] = [];
  const playerHistory = new Map<number, PlayerGameweekHistory[]>();
  let nextId = 1;
  let injuredAssigned = false;

  for (const club of CLUBS) {
    const roles = roleTemplate(club.tier);
    const roster = ROSTERS[club.shortName] ?? [];
    for (let roleIndex = 0; roleIndex < roles.length; roleIndex++) {
      const roleSeed = roles[roleIndex];
      const id = nextId++;
      const code = 300000 + id;
      const rosterEntry = roster[roleIndex];
      const firstName = rosterEntry?.first ?? 'Reserve';
      const secondName = rosterEntry?.last ?? `Player ${id}`;
      const price = basePrice(roleSeed.position, roleSeed.role, club.tier, rng);

      const history: PlayerGameweekHistory[] = [];
      let totalPoints = 0;
      let minutes = 0;
      let goals = 0;
      let assists = 0;
      let cleanSheets = 0;
      let bonus = 0;
      let saves = 0;
      let goalsConcededTotal = 0;
      let xGTotal = 0;
      let xATotal = 0;

      for (let gw = 1; gw < CURRENT_GAMEWEEK; gw++) {
        const diff = fixturesByTeamGw.get(`${club.id}-${gw}`) ?? 3;
        const wk = generateWeek(rng, roleSeed.position, roleSeed.role, club.tier, diff);
        totalPoints += wk.points;
        minutes += wk.minutes;
        goals += wk.goals;
        assists += wk.assists;
        cleanSheets += wk.cleanSheets;
        bonus += wk.bonus;
        saves += wk.saves;
        goalsConcededTotal += wk.goalsConceded;
        xGTotal += wk.xG;
        xATotal += wk.xA;
        const fx = fixtures.find(
          (f) => f.gameweek === gw && (f.homeTeamId === club.id || f.awayTeamId === club.id),
        );
        history.push({
          gameweek: gw,
          points: wk.points,
          minutes: wk.minutes,
          goals: wk.goals,
          assists: wk.assists,
          bonus: wk.bonus,
          cleanSheets: wk.cleanSheets,
          xG: wk.xG || null,
          xA: wk.xA || null,
          wasHome: fx ? fx.homeTeamId === club.id : gw % 2 === 0,
          opponentTeamId: fx ? (fx.homeTeamId === club.id ? fx.awayTeamId : fx.homeTeamId) : club.id,
        });
      }
      playerHistory.set(id, history);

      const gamesPlayed = Math.max(1, history.filter((h) => h.minutes > 0).length);
      const last4 = history.slice(-4);
      const form = last4.length ? round1(last4.reduce((s, h) => s + h.points, 0) / last4.length) : 0;
      const eventPoints = history[history.length - 1]?.points ?? 0;
      const bps = totalPoints * 3 + int(rng, -10, 25);
      const influence = round1(clamp(bps / 6 + rng() * 8, 0, 140));
      const creativity = round1(clamp((assists * 25 + xATotal * 20) + rng() * 10, 0, 140));
      const threat = round1(clamp((goals * 30 + xGTotal * 22) + rng() * 10, 0, 150));
      const ictIndex = round1((influence + creativity + threat) / 10);

      let status: AvailabilityStatus = 'a';
      let news = '';
      let chanceOfPlayingNextRound: number | null = null;
      if (!injuredAssigned && roleSeed.role === 'starter' && club.tier >= 4 && rng() < 0.5) {
        status = 'd';
        news = 'Simulated demo status (not a real report): minor knock, assessed ahead of next fixture.';
        chanceOfPlayingNextRound = 50;
        injuredAssigned = true;
      } else if (rng() < 0.03) {
        status = 'i';
        news = 'Simulated demo status (not a real report): modelled as out for several weeks with a muscle injury.';
        chanceOfPlayingNextRound = 0;
      }

      const selectedByPercent = round1(
        clamp(
          (roleSeed.role === 'star' ? 22 : roleSeed.role === 'starter' ? 8 : roleSeed.role === 'rotation' ? 2.5 : 0.6) +
            rng() * 6,
          0.1,
          65,
        ),
      );

      players.push({
        id,
        code,
        firstName,
        secondName,
        displayName: secondName,
        teamId: club.id,
        team: club.shortName,
        teamName: club.name,
        position: roleSeed.position,
        price,
        totalPoints,
        eventPoints,
        minutes,
        starts: history.filter((h) => h.minutes >= 60).length,
        goals,
        assists,
        cleanSheets,
        goalsConceded: goalsConcededTotal,
        bonus,
        bps,
        ictIndex,
        influence,
        creativity,
        threat,
        form,
        pointsPerGame: round1(totalPoints / gamesPlayed),
        selectedByPercent,
        transfersInEvent: int(rng, 0, roleSeed.role === 'star' ? 40000 : 4000),
        transfersOutEvent: int(rng, 0, roleSeed.role === 'backup' ? 8000 : 2000),
        xG: round1(xGTotal),
        xA: round1(xATotal),
        xGI: round1(xGTotal + xATotal),
        xGC: roleSeed.position === 'GKP' || roleSeed.position === 'DEF' ? round1(goalsConcededTotal * 0.9) : null,
        saves,
        penaltiesSaved: roleSeed.position === 'GKP' && rng() < 0.1 ? 1 : 0,
        penaltiesMissed: 0,
        yellowCards: int(rng, 0, 2),
        redCards: rng() < 0.03 ? 1 : 0,
        ownGoals: 0,
        status,
        news,
        chanceOfPlayingNextRound,
        dreamTeamCount: rng() < 0.1 ? int(rng, 1, 3) : 0,
        setPieceNotes:
          roleSeed.role === 'star' && (roleSeed.position === 'MID' || roleSeed.position === 'FWD')
            ? '1st choice penalties'
            : null,
      });
    }
  }

  resolveDisplayNameCollisions(players);

  const events: Gameweek[] = Array.from({ length: TOTAL_GAMEWEEKS }, (_, i) => {
    const id = i + 1;
    const kickoff = new Date(new Date('2026-08-15T15:00:00Z').getTime() + i * 7 * 86400000);
    return {
      id,
      name: `Gameweek ${id}`,
      deadlineTime: kickoff.toISOString(),
      isCurrent: id === CURRENT_GAMEWEEK,
      isNext: id === CURRENT_GAMEWEEK + 1,
      finished: id < CURRENT_GAMEWEEK,
    };
  });

  const dataset: FplDataset = {
    players,
    teams,
    events,
    fixtures,
    freshness: { source: 'mock', fetchedAt: new Date().toISOString(), note: 'Procedurally generated demo dataset' },
  };

  const demoSquad = buildDemoSquad(players);
  const demoDetectedSquad: DetectedSquad = {
    playersFound: demoSquad.picks.length,
    playersExpected: 15,
    overallConfidence: 1,
    source: 'demo',
    picks: demoSquad.picks.map((p) => {
      const player = players.find((pl) => pl.id === p.playerId) as Player;
      return {
        slotId: `demo-${p.playerId}`,
        rawText: `${player.firstName} ${player.secondName}`,
        isStarter: p.isStarter,
        isBench: !p.isStarter,
        isCaptain: p.isCaptain,
        isViceCaptain: p.isViceCaptain,
        matchedPlayerId: player.id,
        matchConfidence: 1,
        alternatives: [],
      };
    }),
  };

  cached = { dataset, playerHistory, demoSquad, demoDetectedSquad };
  return cached;
}

const SQUAD_BUDGET = 100;

function buildDemoSquad(players: Player[]): Squad {
  const byPos = (pos: Position) => players.filter((p) => p.position === pos).sort((a, b) => a.price - b.price);
  const gkp = byPos('GKP');
  const def = byPos('DEF');
  const mid = byPos('MID');
  const fwd = byPos('FWD');

  const used = new Set<number>();
  function at(pool: Player[], pct: number): Player {
    const start = Math.max(0, Math.min(pool.length - 1, Math.round(pool.length * pct)));
    for (let offset = 0; offset < pool.length; offset++) {
      for (const idx of [start + offset, start - offset]) {
        if (idx >= 0 && idx < pool.length && !used.has(pool[idx].id)) {
          used.add(pool[idx].id);
          return pool[idx];
        }
      }
    }
    return pool[start];
  }

  // Percentiles chosen to land close to a realistic ~£100m budget: one
  // premium midfielder, one semi-premium forward, and mid-to-budget picks
  // elsewhere — a believable squad with real weaknesses, not the best XV.
  const starters: Player[] = [
    at(gkp, 0.55),
    at(def, 0.75), at(def, 0.55), at(def, 0.4), at(def, 0.25),
    at(mid, 0.93), at(mid, 0.6), at(mid, 0.45), at(mid, 0.3),
    at(fwd, 0.85), at(fwd, 0.5),
  ];
  const bench: Player[] = [at(gkp, 0.05), at(def, 0.08), at(mid, 0.05), at(fwd, 0.08)];

  // If the percentile picks happen to run over budget, trade down the
  // cheapest-to-downgrade non-premium starters until the squad fits.
  const downgradable = [1, 2, 3, 4, 6, 7, 8].filter((i) => starters[i]);
  let guard = 0;
  while (
    [...starters, ...bench].reduce((s, p) => s + p.price, 0) > SQUAD_BUDGET - 0.3 &&
    guard < 20
  ) {
    guard++;
    const i = downgradable[guard % downgradable.length];
    const player = starters[i];
    const pool = player.position === 'DEF' ? def : player.position === 'MID' ? mid : player.position === 'GKP' ? gkp : fwd;
    const cheaperIdx = pool.findIndex((p) => p.id === player.id) - 3;
    if (cheaperIdx >= 0 && !used.has(pool[cheaperIdx].id)) {
      used.delete(player.id);
      used.add(pool[cheaperIdx].id);
      starters[i] = pool[cheaperIdx];
    }
  }

  const totalSpend = [...starters, ...bench].reduce((s, p) => s + p.price, 0);
  const bank = Math.max(0, Math.round((SQUAD_BUDGET - totalSpend) * 10) / 10);

  const picks = [...starters, ...bench].map((p, i) => ({
    playerId: p.id,
    isStarter: i < 11,
    isCaptain: p.id === starters[5].id,
    isViceCaptain: p.id === starters[9].id,
    benchOrder: i >= 11 ? i - 11 : null,
  }));

  return {
    picks,
    context: { bank, freeTransfers: 2, wildcardActive: false },
  };
}
