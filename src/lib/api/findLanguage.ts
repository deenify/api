import { quranLanguages } from "./consts";

function findQuranicLanguage(languageParam: string) {
  const allowedLower = quranLanguages.map((l) => l.toLowerCase());
  if (!allowedLower.includes(languageParam)) {
    throw { message: "Invalid language", status: 400 };
  }
  return quranLanguages.find((lang) => lang.toLowerCase() === languageParam)!;
}
export default findQuranicLanguage;
