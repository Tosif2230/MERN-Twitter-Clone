"use client";

import "@/src/i18n";
import i18n from "@/src/i18n";
import { ReactNode, useEffect } from "react";

export default function I18nProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const updateDocumentLanguage = (language: string) => {
      document.documentElement.lang = language;
    };

    updateDocumentLanguage(i18n.resolvedLanguage || i18n.language || "en");
    i18n.on("languageChanged", updateDocumentLanguage);

    return () => {
      i18n.off("languageChanged", updateDocumentLanguage);
    };
  }, []);

  return <>{children}</>;
}
