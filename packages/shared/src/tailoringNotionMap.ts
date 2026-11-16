import type { TailoringProductId } from "./tailoringCatalog.js";

/**
 * [DB] Прайс → «Назва виробу» for each site catalog line.
 * Must match Notion exactly. Several names = working days are summed (e.g. a kit).
 */
export const NOTION_CATALOG_PRICE_NAMES: Record<
  TailoringProductId,
  string | string[]
> = {
  "competition.st.body": "Сорочка-боді ST",
  "competition.st.jacket": "Жилет ST з атласним коміром",
  "competition.st.pants": "Штани ST",
  "competition.st.accessories": "Краватка-метелик атлас",
  "competition.st.kit": "Фрачний комплект",
  "competition.st.frock": ["Піджак фрачний", "Штани фрачні", "Сорочка фрачна"],
  "competition.lat.shirt": "Сорочка LAT TR довгий рукав",
  "competition.lat.pants": "Штани LAT",
  "competition.lat.vest": "Жилет ST з атласним коміром",
  "competition.lat.accessories": "Краватка-метелик атлас",
  "competition.lat.golf_body": "Гольф-боді LAT довгий рукав",
  "training.st.tshirt": "Футболка поло ST короткий рукав",
  "training.st.shirt": "Сорочка ST TR довгий рукав",
  "training.st.pants": "Штани ST",
  "training.st.kit": ["Сорочка ST TR довгий рукав", "Штани ST"],
  "training.lat.longsleeve": "Лонгслів LAT TR довгий рукав",
  "training.lat.tshirt": "Футболка LAT TR короткий рукав",
  "training.lat.pants": "Штани LAT",
  "training.lat.kit": ["Футболка LAT TR короткий рукав", "Штани LAT"],
};