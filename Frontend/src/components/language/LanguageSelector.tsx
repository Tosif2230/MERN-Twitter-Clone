"use client";

import { ChevronDown, Languages } from "lucide-react";
import { useTranslation } from "react-i18next";

import { cn } from "@/src/lib/utils";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

const languages = [
  { code: "en", label: "English" },
  { code: "hi", label: "Hindi" },
  { code: "es", label: "Espanol" },
  { code: "pt", label: "Portugues" },
  { code: "zh", label: "Chinese" },
  { code: "fr", label: "Francais" },
];

interface LanguageSelectorProps {
  className?: string;
  type?: "default" | "dropdownMenu";
}

export default function LanguageSelector({
  className,
  type = "default",
}: LanguageSelectorProps) {
  const { i18n, t } = useTranslation();
  const selectedLanguage = i18n.resolvedLanguage || i18n.language || "en";
  const selectedLanguageLabel =
    languages.find((language) => language.code === selectedLanguage)?.label ||
    t("languageSelector.placeholder");

  const handleChange = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("i18nextLng", lang);
  };

  const languageItems = (
    <DropdownMenuRadioGroup
      value={selectedLanguage}
      onValueChange={handleChange}
    >
      {languages.map((language) => (
        <DropdownMenuRadioItem
          key={language.code}
          value={language.code}
          className="cursor-pointer text-white focus:bg-gray-900 focus:text-white"
        >
          {language.label}
        </DropdownMenuRadioItem>
      ))}
    </DropdownMenuRadioGroup>
  );

  if (type === "dropdownMenu") {
    return (
      <DropdownMenuSub>
        <DropdownMenuSubTrigger
          className={cn("w-full cursor-pointer text-white", className)}
        >
          <Languages className="h-4 w-4" />
          <span className="mx-2">{t("languageLabel")}</span>
          <span className="ml-auto text-xs text-gray-400">
            {selectedLanguageLabel}
          </span>
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent className="w-44 border-gray-800 bg-black text-white">
          {languageItems}
        </DropdownMenuSubContent>
      </DropdownMenuSub>
    );
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className={cn(
            "h-auto gap-2 border-none px-2 py-1 text-sm font-normal",
            className,
          )}
          aria-label={t("languageLabel")}
        >
          <Languages className="h-4 w-4" />
          <span>{selectedLanguageLabel}</span>
          <ChevronDown className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="center"
        className="min-w-36 border-gray-800  bg-black text-white"
      >
        {languageItems}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
