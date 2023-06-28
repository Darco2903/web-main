declare const THEME: {
    [key: string]: {
        background: string;
        name: string;
        textColor: string;
    };
};

declare function seTheme(theme: string): void;
