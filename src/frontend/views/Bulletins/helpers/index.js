import { ToWords } from "to-words";

const toWords = new ToWords({
  localeCode: 'fr-FR',
  converterOptions: {
    ignoreDecimal: false,
    ignoreZeroCurrency: false,
    doNotAddOnly: false,
  }
});

export function convertMoyennesToLetters(moyenne){
  return toWords.convert(moyenne).toLowerCase();
}