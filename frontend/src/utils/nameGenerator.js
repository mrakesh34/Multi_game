/**
 * FILE: frontend/src/utils/nameGenerator.js
 * PURPOSE: Generates random fun player names for new visitors.
 *          Called by useLocalPlayer.js when no name is found in localStorage.
 *
 * FORMAT: {Adjective}{Animal}{2-digit number}  e.g. "CrimsonFalcon47"
 *
 * FUNCTION:
 *   generateName() → string
 *     Picks one random adjective, one random animal, one random 2-digit number (10–99).
 *     Returns the concatenated string (no spaces).
 *
 * WHY NO SPACES:
 *   Names are used as player identifiers in rooms. The reconnect system
 *   matches by name (case-insensitive), so names must be predictable strings.
 */

const ADJECTIVES = [
  'Blue','Red','Gold','Wild','Dark','Swift','Brave','Cool','Ninja','Fire',
  'Storm','Iron','Neon','Cyber','Lucky','Lazy','Fuzzy','Spicy','Cosmic','Shadow',
  'Super','Ultra','Mega','Hyper','Turbo','Zany','Funky','Witty','Jolly','Zippy',
  'Crimson','Silver','Jade','Amber','Violet','Scarlet','Cobalt','Coral','Indigo','Teal',
  'Atomic','Blaze','Frost','Volt','Spark','Surge','Flash','Gloom','Drift','Haze',
]

const ANIMALS = [
  'Fox','Wolf','Bear','Panda','Tiger','Lion','Eagle','Shark','Dragon','Falcon',
  'Cobra','Lynx','Otter','Hawk','Raven','Viper','Rhino','Moose','Bison','Crane',
  'Gecko','Dingo','Tapir','Okapi','Lemur','Stoat','Quoll','Genet','Fossa','Tayra',
  'Zorro','Xerus','Urubu','Tanki','Sable','Ratel','Quokka','Potto','Olingo','Nilgai',
  'Maned','Liger','Kudu','Jackal','Ibis','Hyena','Grebe','Finch','Egret','Dhole',
]

export function generateName() {
  const adj    = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)]
  const num    = Math.floor(Math.random() * 90) + 10   // 10–99
  return `${adj}${animal}${num}`
}

export const generatePlayerName = generateName
