import { cn } from "../../lib/utils";

interface FlagImageProps {
	/** ISO 3166-1 alpha-2, case-insensitive (e.g. "NP", "us"). */
	countryCode?: string | null;
	className?: string;
	title?: string;
}

const CODE_POINT_OFFSET = 0x1f1e6 - "A".charCodeAt(0);

/**
 * Renders the country as a flag emoji rather than a remote sprite, so it
 * needs no network request and cannot leak a referrer per row.
 * Falls back to a neutral globe when the code is missing or malformed.
 */
export function FlagImage({ countryCode, className, title }: FlagImageProps) {
	const code = countryCode?.trim().toUpperCase();
	const isValid = !!code && /^[A-Z]{2}$/.test(code);

	const flag = isValid
		? String.fromCodePoint(
				...[...code].map((char) => char.charCodeAt(0) + CODE_POINT_OFFSET),
			)
		: "\u{1F310}";

	return (
		<span
			data-slot="flag-image"
			aria-hidden={title ? undefined : true}
			title={title ?? code ?? undefined}
			className={cn("inline-block leading-none", className)}
		>
			{flag}
		</span>
	);
}
