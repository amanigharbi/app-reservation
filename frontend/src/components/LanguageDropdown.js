import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import frFlag from "../images/flags/fr.svg";
import enFlag from "../images/flags/en.svg";

const LANGUAGES = {
  en: { label: "EN", flag: enFlag },
  fr: { label: "FR", flag: frFlag },
};

function LanguageDropdown() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggle = () => setOpen(!open);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="language-dropdown" ref={dropdownRef}>
      <button onClick={toggle} className="lang-btn">
        <img src={LANGUAGES[i18n.language].flag} alt="flag" />
        {LANGUAGES[i18n.language].label}
      </button>
      {open && (
        <div className="lang-menu">
          {Object.keys(LANGUAGES).map((lng) => (
            <div
              key={lng}
              className="lang-option"
              onClick={() => changeLanguage(lng)}
            >
              <img src={LANGUAGES[lng].flag} alt="flag" />
              {LANGUAGES[lng].label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default LanguageDropdown;
