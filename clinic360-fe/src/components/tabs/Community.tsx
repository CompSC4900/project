import { useEffect } from "react";

interface Props {
    setActiveTab(tab: string): void;
}

export default function Community({ setActiveTab }: Props) {
    useEffect(() => {
        setActiveTab("Community");
    }, [setActiveTab]);

    return (
        <div className="p-4 card w-100 h-100">
            <h2>Community Page</h2>
            <p>This is the community page.</p>
        </div>
    );
}