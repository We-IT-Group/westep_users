import {baseUrlImage} from "../api/apiClient.ts";

interface Props {
    imageUrl: string | null,
    className?: string,
}

function Image({imageUrl, className = ""}: Props) {

    const resolvedImageUrl = imageUrl
        ? imageUrl.startsWith("http://") || imageUrl.startsWith("https://")
            ? imageUrl
            : baseUrlImage + imageUrl
        : null;


    return (
        <div className={`relative w-full h-[180px] ${className}`}>
            {
                resolvedImageUrl && <img
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        objectPosition: 'center'
                    }}
                    loading='lazy'
                    src={resolvedImageUrl}
                    alt={imageUrl as string}
                />
            }
        </div>);
}

export default Image;
