// Presentation only. Internal IDs, release, URLs and filenames do not derive from these labels.
// A later naming PR changes this object, then runs npm run build.
const display=Object.freeze({name:'凪の島',subtitle:'NAGI',wordmark:'N A G I',folio:'凪'});
export const DISPLAY_NAME=Object.freeze({
 title:display.subtitle?`${display.name} — ${display.subtitle}`:display.name,
 shortName:display.name,
 wordmark:display.wordmark,
 folio:display.folio??display.name
});
