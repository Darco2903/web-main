import "vue-i18n";
import type { LocalesSchema } from "@/locales/types/index";

declare module "vue-i18n" {
    export interface DefineLocaleMessage extends LocalesSchema {}
}
