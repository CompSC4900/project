import { useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

interface Props {
    tabs: string[]
    activeTab: string
    setActiveTab(tab: string): void;
}

interface UserOption {
    label: string
    callback: VoidFunction
}

export default function Header({tabs, activeTab, setActiveTab}: Props) {
    const auth = useAuth();

    const [username, setUsername] = useState("");

    useEffect(() => {(async () => {
        const response = await auth.fetchProtectedData("userinfo/");
        if (response.hasError) {
            console.error("Logging out user because an unexpected server error occured");
            auth.logout();
        }
        setUsername(response.data.name);
    })()}, []);

    const homeTab = tabs[0];
    const namedTabs = tabs.slice(1);

    const userOptions: UserOption[] = [
        {
            label: "Logout",
            callback: auth.logout,
        },
    ];

    function createNavItem(tab: string) {
        if (tab === activeTab) {
            return (
                <li className="nav-item" key={tab}>
                    <a className="nav-link active" aria-current="page" href="#" onClick={() => setActiveTab(tab)}>
                        {tab}
                    </a>
                </li>
            );
        } else {
            return (
                <li className="nav-item" key={tab}>
                    <a className="nav-link" href="#" onClick={() => setActiveTab(tab)}>{tab}</a>
                </li>
            );
        }
    }

    function createUserOption({label, callback}: UserOption) {
        return (
            <li key={label}>
                <button className="dropdown-item" onClick={callback}>{label}</button>
            </li>
        );
    }

    return (
        <nav className="navbar navbar-expand-lg bg-body-secondary">
            <div className="container-fluid">
                <a className="navbar-brand" href="#" onClick={() => setActiveTab(homeTab)}>
                    <img src="/logo.svg" style={{width: 50, height: 50}} />
                </a>
                <div className="collapse navbar-collapse">
                    <ul className="navbar-nav">
                        {namedTabs.map(createNavItem)}
                    </ul>
                </div>
                <div className="ms-auto bg-body rounded border border-secondary-subtle dropdown">
                    <button className="btn dropdown-toggle py-1 px-2" data-bs-toggle="dropdown" aria-expanded="false">
                        <img src="/dummy-pfp.png" className="rounded-circle me-2" style={{width: 40, height: 40}} />
                        <span className="me-2">{username}</span>
                    </button>
                    <ul className="dropdown-menu">
                        {userOptions.map(createUserOption)}
                    </ul>
                </div>
            </div>
        </nav>
    );
}