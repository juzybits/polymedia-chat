import Polyglot from 'node-polyglot';

const translations: Record<string, object> = {
    'en': {
        'hello': 'hello',
    },
    'es': {
        'hello': 'hola',
    }
};

let polyglot: Polyglot;

export const setLang = (lang: string): void => {
    polyglot = new Polyglot({
        locale: lang,
        phrases: translations[lang],
    });
};
export const translate = (text: string): string => {
    return polyglot.t(text);
}
