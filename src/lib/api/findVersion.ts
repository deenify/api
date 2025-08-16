import { quranLanguageVersions } from "./consts";
import validateLowercase from "./validateLowercase";

function findVersion(language: string, versionParam?: string) {
  if (!versionParam) return undefined;

  validateLowercase(versionParam, "Version");
  const allowedVersions = (quranLanguageVersions[language] || []).map((v) =>
    v.toLowerCase()
  );
  if (!allowedVersions.includes(versionParam)) {
    throw { message: "Invalid version", status: 400 };
  }

  return (quranLanguageVersions[language] || []).find(
    (v) => v.toLowerCase() === versionParam
  );
}
export default findVersion;
