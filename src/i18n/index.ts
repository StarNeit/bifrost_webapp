import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import ar from './ar-EG.json';
import cn from './cn.json';
import de from './de.json';
import el from './el.json';
import en from './en.json';
import es from './es.json';
import fr from './fr.json';
import it from './it.json';
import ja from './ja.json';
import ko from './ko.json';
import pl from './pl.json';
import pt from './pt.json';
import ru from './ru.json';
import tr from './tr.json';

import config from '../config';

const translationsMap = {
  ar: { translation: ar },
  cn: { translation: cn },
  de: { translation: de },
  el: { translation: el },
  en: { translation: en },
  es: { translation: es },
  fr: { translation: fr },
  it: { translation: it },
  ja: { translation: ja },
  ko: { translation: ko },
  pl: { translation: pl },
  pt: { translation: pt },
  ru: { translation: ru },
  tr: { translation: tr },
};

const language = localStorage.getItem('language') || config.LANGUAGE_DEFAULT;

i18n
  .use(initReactI18next)
  .init({
    resources: translationsMap,
    lng: language,
    fallbackLng: config.LANGUAGE_DEFAULT,

    interpolation: {
      escapeValue: false,
    },
  });

export const changeLanguage = (code: string): void => {
  i18n.changeLanguage(code);
  localStorage.setItem('language', code);
};

export default i18n;
