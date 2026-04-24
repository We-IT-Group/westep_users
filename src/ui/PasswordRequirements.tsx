import { TickCircle } from "../assets/icon";
import { clsx } from "clsx";

interface PasswordRequirementsProps {
    password?: string;
}

export default function PasswordRequirements({ password = "" }: PasswordRequirementsProps) {
    const requirements = [
        {
            id: 1,
            label: "Kamida bitta katta harf",
            met: /[A-Z]/.test(password),
        },
        {
            id: 2,
            label: "Kamida bitta kichik harf",
            met: /[a-z]/.test(password),
        },
        {
            id: 3,
            label: "Kamida bitta raqam",
            met: /\d/.test(password),
        },
        {
            id: 4,
            label: "Kamida 6 ta belgi",
            met: password.length >= 6,
        },
    ];

    return (
        <div className="mt-3 space-y-2 animate-fadeIn px-2">
            {requirements.map((req) => (
                <div
                    key={req.id}
                    className={clsx(
                        "flex items-center gap-2 transition-all duration-300",
                        req.met ? "text-green-500 transform translate-x-1" : "text-gray-400"
                    )}
                >
                    <div className={clsx(
                        "transition-transform duration-300",
                        req.met ? "scale-110" : "scale-100 opacity-50"
                    )}>
                        <TickCircle width={16} height={16} />
                    </div>
                    <span className="text-sm font-medium">{req.label}</span>
                </div>
            ))}
        </div>
    );
}
