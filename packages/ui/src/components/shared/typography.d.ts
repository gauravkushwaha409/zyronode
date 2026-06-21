import type React from 'react';
import type { ElementType, HTMLAttributes } from 'react';
declare const weightMap: {
    readonly regular: "font-normal";
    readonly medium: "font-medium";
    readonly semibold: "font-semibold";
    readonly bold: "font-bold";
};
export type FontWeight = keyof typeof weightMap;
interface TypographyProps extends HTMLAttributes<HTMLElement> {
    as?: ElementType;
    weight?: FontWeight;
    children?: React.ReactNode;
}
export declare const Typography: {
    D1: {
        ({ as, weight, className, children, ...rest }: TypographyProps): import("react/jsx-runtime").JSX.Element;
        displayName: string;
    };
    D2: {
        ({ as, weight, className, children, ...rest }: TypographyProps): import("react/jsx-runtime").JSX.Element;
        displayName: string;
    };
    H1: {
        ({ as, weight, className, children, ...rest }: TypographyProps): import("react/jsx-runtime").JSX.Element;
        displayName: string;
    };
    H2: {
        ({ as, weight, className, children, ...rest }: TypographyProps): import("react/jsx-runtime").JSX.Element;
        displayName: string;
    };
    H3: {
        ({ as, weight, className, children, ...rest }: TypographyProps): import("react/jsx-runtime").JSX.Element;
        displayName: string;
    };
    H4: {
        ({ as, weight, className, children, ...rest }: TypographyProps): import("react/jsx-runtime").JSX.Element;
        displayName: string;
    };
    H5: {
        ({ as, weight, className, children, ...rest }: TypographyProps): import("react/jsx-runtime").JSX.Element;
        displayName: string;
    };
    H6: {
        ({ as, weight, className, children, ...rest }: TypographyProps): import("react/jsx-runtime").JSX.Element;
        displayName: string;
    };
    T1: {
        ({ as, weight, className, children, ...rest }: TypographyProps): import("react/jsx-runtime").JSX.Element;
        displayName: string;
    };
    T2: {
        ({ as, weight, className, children, ...rest }: TypographyProps): import("react/jsx-runtime").JSX.Element;
        displayName: string;
    };
    T3: {
        ({ as, weight, className, children, ...rest }: TypographyProps): import("react/jsx-runtime").JSX.Element;
        displayName: string;
    };
    T4: {
        ({ as, weight, className, children, ...rest }: TypographyProps): import("react/jsx-runtime").JSX.Element;
        displayName: string;
    };
    T5: {
        ({ as, weight, className, children, ...rest }: TypographyProps): import("react/jsx-runtime").JSX.Element;
        displayName: string;
    };
    T6: {
        ({ as, weight, className, children, ...rest }: TypographyProps): import("react/jsx-runtime").JSX.Element;
        displayName: string;
    };
    Cap: {
        ({ as, weight, className, children, ...rest }: TypographyProps): import("react/jsx-runtime").JSX.Element;
        displayName: string;
    };
};
export default Typography;
