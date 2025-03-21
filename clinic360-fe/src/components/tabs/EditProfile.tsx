import { useEffect, useState } from "react";
import { useAuth } from "../AuthContext";
import { expectSuccess } from "../../util/auth";

interface Props {
    tabs: string[];
    activeTab: string;
    setActiveTab(tab: string): void;
}

interface UserOption {
    label: string;
    callback: VoidFunction;
}

export default function Header({ tabs, activeTab, setActiveTab }: Props) {
    const auth = useAuth();

    const [username, setUsername] = useState("");
    const [isStaff, setStaff] = useState(false);
    const [showEditProfile, setShowEditProfile] = useState(false);
    const [profileData, setProfileData] = useState({
        name: "",
        email: "",
        address: "",
        city: "",
        state: "",
        zip_code: "",
        birth_date: "",
        gender: "",
        phone: "",
        profilePicture: "",
    });
    const [newProfilePicture, setNewProfilePicture] = useState<File | null>(null);

    useEffect(() => {
        if (!tabs || tabs.length === 0) return;

        (async () => {
            try {
                // Fetch user profile data
                const response = await auth.fetchProtectedData("userinfo/", "GET");
                expectSuccess(response, auth);
                setUsername(response.data.name || "New User");
                setProfileData({
                    name: response.data.name || "",
                    email: response.data.email || "",
                    address: response.data.address || "",
                    city: response.data.city || "",
                    state: response.data.state || "",
                    zip_code: response.data.zip_code || "",
                    birth_date: response.data.birth_date || "",
                    gender: response.data.gender || "",
                    phone: response.data.phone || "",
                    profilePicture: response.data.profilePicture || "/dummy-pfp.png",
                });

                // Fetch staff status
                const response2 = await auth.fetchProtectedData("is_staff/", "GET");
                expectSuccess(response2, auth);
                setStaff(response2.data.staff);

                // Set the active tab to the first tab
                setActiveTab(tabs[0]);
            } catch (error) {
                console.error("Error fetching profile data:", error);
            }
        })();
    }, [tabs]);

    useEffect(() => {
        (async () => {
            try {
                // Fetch user profile data
                const response = await auth.fetchProtectedData("userinfo/", "GET");
                expectSuccess(response, auth);
                setProfileData({
                    name: response.data.name || "",
                    email: response.data.email || "",
                    address: response.data.address || "",
                    city: response.data.city || "",
                    state: response.data.state || "",
                    zip_code: response.data.zip_code || "",
                    birth_date: response.data.birth_date || "",
                    gender: response.data.gender || "",
                    phone: response.data.phone || "",
                    profilePicture: profileData.profilePicture, // Keep existing profile picture
                });
            } catch (error) {
                console.error("Error fetching profile data:", error);
            }
        })();
    }, []);

    const handleSaveProfile = async () => {
        const updatedData = { ...profileData };
        console.log("Sending updated profile:", updatedData);

        try {
            // Handle profile picture upload if a new one is selected
            if (newProfilePicture) {
                const formData = new FormData();
                formData.append("profilePicture", newProfilePicture);
                const uploadResponse = await auth.fetchProtectedData("upload_profile_picture/", "POST", formData, true);
                expectSuccess(uploadResponse, auth);
                updatedData.profilePicture = uploadResponse.data.profilePicture;
            }

            // Update profile data
            const response = await auth.fetchProtectedData("update_profile/", "POST", updatedData);
            console.log("Response from backend:", response);
            expectSuccess(response, auth);

            // Fetch updated profile data
            const newResponse = await auth.fetchProtectedData("userinfo/", "GET");
            expectSuccess(newResponse, auth);

            setProfileData({
                name: newResponse.data.name,
                email: newResponse.data.email,
                address: newResponse.data.address,
                city: newResponse.data.city,
                state: newResponse.data.state,
                zip_code: newResponse.data.zip_code,
                birth_date: newResponse.data.birth_date,
                gender: newResponse.data.gender,
                phone: newResponse.data.phone,
                profilePicture: newResponse.data.profilePicture || "/dummy-pfp.png",
            });
            setUsername(newResponse.data.name);
            setShowEditProfile(false);
        } catch (error) {
            console.error("Error updating profile:", error);
        }
    };

    const homeTab = tabs?.[0] ?? "";
    const namedTabs = tabs?.slice(1) ?? [];

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
            if (tab === "Availability" && isStaff) {
                return (
                    <li className="nav-item" key={tab}>
                        <a className="nav-link" href="#" onClick={() => setActiveTab(tab)}>
                            {tab}
                        </a>
                    </li>
                );
            } else {
                return (
                    <li className="nav-item" key={tab}>
                        <a className="nav-link" href="#" onClick={() => setActiveTab(tab)}>
                            {tab}
                        </a>
                    </li>
                );
            }
        }
    }

    function createUserOption({ label, callback }: UserOption) {
        return (
            <li key={label}>
                <button className="dropdown-item" onClick={callback}>
                    {label}
                </button>
            </li>
        );
    }

    return (
        <>
            <nav className="navbar navbar-expand-lg bg-body-secondary">
                <div className="container-fluid">
                    <a className="navbar-brand" href="#" onClick={() => setActiveTab(homeTab)}>
                        <img src="/logo.svg" style={{ width: 50, height: 50 }} />
                    </a>
                    <div className="collapse navbar-collapse">
                        <ul className="navbar-nav">{namedTabs.map(createNavItem)}</ul>
                    </div>
                    <div className="ms-auto bg-body rounded border border-secondary-subtle dropdown">
                        <button className="btn dropdown-toggle py-1 px-2" data-bs-toggle="dropdown" aria-expanded="false">
                            <img
                                src={profileData.profilePicture}
                                className="rounded-circle me-2"
                                style={{ width: 40, height: 40 }}
                            />
                            <span className="me-2">{username}</span>
                        </button>
                        <ul className="dropdown-menu">
                            {userOptions.map(createUserOption)}
                            <li>
                                <hr className="dropdown-divider" />
                            </li>
                            <li>
                                <button className="dropdown-item" onClick={() => setShowEditProfile(true)}>
                                    Edit Profile
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>

            {showEditProfile && (
                <div className="modal fade show d-block" tabIndex={-1}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Edit Profile</h5>
                                <button type="button" className="btn-close" onClick={() => setShowEditProfile(false)}></button>
                            </div>
                            <div className="modal-body">
                                <label>Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={profileData.name}
                                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                />
                                <label>Email</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    value={profileData.email}
                                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                />
                                <label>Address</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={profileData.address}
                                    onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                                />
                                <label>City</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={profileData.city}
                                    onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                                />
                                <label>State</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={profileData.state}
                                    onChange={(e) => setProfileData({ ...profileData, state: e.target.value })}
                                />
                                <label>Zip Code</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={profileData.zip_code}
                                    onChange={(e) => setProfileData({ ...profileData, zip_code: e.target.value })}
                                />
                                <label>Date of Birth</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={profileData.birth_date}
                                    onChange={(e) => setProfileData({ ...profileData, birth_date: e.target.value })}
                                />
                                <label>Gender</label>
                                <select
                                    className="form-control"
                                    value={profileData.gender}
                                    onChange={(e) => setProfileData({ ...profileData, gender: e.target.value })}
                                >
                                    <option value="">Select</option>
                                    <option value="M">Male</option>
                                    <option value="F">Female</option>
                                </select>
                                <label>Phone</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={profileData.phone}
                                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                />
                                <label>Profile Picture</label>
                                <input
                                    type="file"
                                    className="form-control"
                                    onChange={(e) => setNewProfilePicture(e.target.files ? e.target.files[0] : null)}
                                />
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowEditProfile(false)}>
                                    Close
                                </button>
                                <button type="button" className="btn btn-primary" onClick={handleSaveProfile}>
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}