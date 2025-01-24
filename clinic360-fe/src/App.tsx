import { useState } from 'react';

import Header from "./components/Header";
import Home from "./components/tabs/Home";
import Scheduling from "./components/tabs/Scheduling"
import Messages from "./components/tabs/Messages"
import { ConfirmationProvider } from './components/ConfirmationContext';

const TAB_COMPONENTS = {
    "Home": Home,
    "Scheduling": Scheduling,
    "Messages": Messages,
} as const;

const USER_OPTIONS = {
    "Logout": () => {}
} as const;

export default function App() {
    const tabs = Object.keys(TAB_COMPONENTS);
    const [activeTab, setActiveTab] = useState(tabs[0]);

    const TabComponent = TAB_COMPONENTS[activeTab as keyof typeof TAB_COMPONENTS];

    return (
        <ConfirmationProvider>
            <div className="d-flex flex-column h-100">
                <Header tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} username="John Doe" userOptions={USER_OPTIONS} />
                <div className="d-flex p-5 flex-grow-1 bg-body-tertiary" style={{minHeight: 0}}>
                    <TabComponent setActiveTab={setActiveTab}/>
                </div>
            </div>
        </ConfirmationProvider>
    );
}