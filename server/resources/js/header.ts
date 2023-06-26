function hasCookie(name: string): boolean;

function getCookie(name: string): string;

function setCookie(
    name: string,
    value: string,
    options: {
        path: string;
        domain: string;
        expires: number | string;
        maxAge: number;
        secure: boolean;
        sameSite: "strict" | "lax";
    }
): void;

type theme = {
    background: string;
    name: string;
    textColor: string;
};

function seTheme(theme: theme): void;
