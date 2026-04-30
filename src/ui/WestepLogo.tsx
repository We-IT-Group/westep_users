import westepDarkLogo from "../assets/westep_dark_logo.png";
import westepLightLogo from "../assets/westep_ligth-logo.png";

interface WestepLogoProps {
    className?: string;
    darkModeClassName?: string;
    lightModeClassName?: string;
    alt?: string;
}

export default function WestepLogo({
    className = "",
    darkModeClassName = "",
    lightModeClassName = "",
    alt = "Westep",
}: WestepLogoProps) {
    return (
        <>
            <img
                src={westepDarkLogo}
                alt={alt}
                className={`dark:hidden ${className} ${lightModeClassName}`.trim()}
            />
            <img
                src={westepLightLogo}
                alt={alt}
                className={`hidden dark:block ${className} ${darkModeClassName}`.trim()}
            />
        </>
    );
}
