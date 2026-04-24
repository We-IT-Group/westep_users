import westepLogo from "../../assets/westep_dark_logo.png";

export default function AuthBrand() {
    return (
        <div className="mb-6 flex justify-center">
            <div className="flex items-center justify-center rounded-[24px] px-2 py-2">
                <img
                    src={westepLogo}
                    alt="Westep"
                    className="h-auto w-[180px] object-contain md:w-[220px]"
                />
            </div>
        </div>
    );
}
