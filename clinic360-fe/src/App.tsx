import { useState } from 'react';
import Header from "./components/Header";
import Home from "./components/tabs/Home";
import Scheduling from "./components/tabs/Scheduling";
import Messages from "./components/tabs/Messages";
import Availability from "./components/tabs/Availability";
import EditProfileTab from "./components/tabs/EditProfile";
import { ConfirmationProvider } from './components/ConfirmationContext';
import { AuthProvider } from './components/AuthContext';

const TAB_COMPONENTS = {
    "Home": Home,
    "Scheduling": Scheduling,
    "Messages": Messages,
    "Availability": Availability,
    "Edit Profile": EditProfileTab,
};

function MainApp() {
    const tabs = Object.keys(TAB_COMPONENTS);
    const [activeTab, setActiveTab] = useState(tabs[0]);
    const [userData, setUserData] = useState({});

    const TabComponent = TAB_COMPONENTS[activeTab];

    return (
        <div className="d-flex flex-column h-100">
            <Header tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
            <div className="d-flex p-5 flex-grow-1 bg-body-tertiary" style={{ minHeight: 0 }}>
                <TabComponent userData={userData} updateUserData={setUserData} setActiveTab={setActiveTab}/>
            </div>
        </div>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <ConfirmationProvider>
                <MainApp />
            </ConfirmationProvider>
        </AuthProvider>
    );
}
