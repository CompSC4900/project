import { useEffect, useState } from 'react';

import Header from "./components/Header";
import Home from "./components/tabs/Home";
import Scheduling from "./components/tabs/Scheduling"
import Messages from "./components/tabs/Messages"
import Availability from "./components/tabs/Availability"
import Community from "./components/tabs/Community";
import { ConfirmationProvider } from './components/ConfirmationContext';
import { AuthProvider } from './components/AuthContext';
import EditProfile from './components/tabs/EditProfile';

const TAB_COMPONENTS = {
    "Home": Home,
    "Scheduling": Scheduling,
    "Messages": Messages,
    "Availability": Availability,
    "Community": Community,
    "Edit Profile": EditProfile,
} as const;

const TABS = [
    "Home",
    "Scheduling",
    "Messages",
    "Availability",
    "Community",
];

export default function App() {
    const [activeTab, setActiveTab] = useState(TABS[0]);
    const [username, setUsername] = useState<string | null>(null);

    const TabComponent = TAB_COMPONENTS[activeTab as keyof typeof TAB_COMPONENTS];

    return (
        <AuthProvider>
            <ConfirmationProvider>
                <div className="d-flex flex-column h-100">
                    <Header tabs={TABS} activeTab={activeTab} setActiveTab={setActiveTab} usernameOverride={username} />
                    <div className="d-flex p-5 flex-grow-1 bg-body-tertiary" style={{minHeight: 0}}>
                        <TabComponent setActiveTab={setActiveTab} onUsernameChange={setUsername}/>
                    </div>
                </div>
            </ConfirmationProvider>
        </AuthProvider>
    );
}