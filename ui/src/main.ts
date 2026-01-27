import "./styles.css";
import { initI18n } from "./i18n/index.js";

await initI18n();

import("./ui/app.ts");
