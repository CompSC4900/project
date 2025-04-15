import { useEffect, useState } from "react";
import { useAuth } from "../AuthContext";
import { expectSuccess } from "../../util/auth";
import AccountInfo from "../AccountInfo";
import { Button, ButtonGroup } from "react-bootstrap";
import FormFieldFactory from "../form/FormFieldFactory";
import { getMySocialInfo, updateMySocialInfo } from "../../util/SocialInfo";

interface Props {
    profileTab: "private" | "public";
    setProfileTab(tab: "private" | "public"): void;
    onUsernameChange(username: string): void
}

export default function EditProfile({ profileTab, setProfileTab, onUsernameChange }: Props) {
    const auth = useAuth();

    const [loading, setLoading] = useState(true);
    const [cleanedFormValues, setCleanedFormValues] = useState<Record<string, string>>({});
    const [initialFormValues, setInitialFormValues] = useState<Record<string, string>>({});
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [profilePicture, setProfilePicture] = useState<File | null>(null);
    const [id, setId] = useState<number | null>(null);
    const [savedFeedback, setSavedFeedback] = useState<string>("");

    useEffect(() => {
        setLoading(true);
        (async () => {
            if (profileTab === "private") {
                const fetchResult = await auth.fetchProtectedData("userinfo/", "GET");
                expectSuccess(fetchResult, auth);
                setInitialFormValues(fetchResult.data);
                setLoading(false);
            } else {
                const socialInfo = await getMySocialInfo(auth);
                if (socialInfo.length > 0) {
                    setCleanedFormValues({
                        about_me: socialInfo[0].about_me,
                        public: socialInfo[0].public.toString(),
                    });
                    setId(socialInfo[0].id);
                }
                setLoading(false);
            }
        })();
    }, [profileTab]);

    async function handleSaveProfile() {
        (async () => {
            try {
                if (profileTab === "private") {
                    const fetchResult = await auth.fetchProtectedData("userinfo/", "PUT", cleanedFormValues);
                    if (fetchResult.errorCode !== null) {
                        const errors = fetchResult.error as Record<string, Array<string>>;
                        setFormErrors(
                            Object.entries(errors).reduce((obj, error) => ({...obj, [error[0]]: error[1][0]}), {} as Record<string, string>)
                        );
                    } else {
                        setInitialFormValues(fetchResult.data);
                        onUsernameChange(fetchResult.data.first_name + " " + fetchResult.data.last_name);
                    }
                } else {
                    const socialInfo = await updateMySocialInfo(auth, {
                        id,
                        about_me: cleanedFormValues.about_me,
                        profile_picture: profilePicture ?? undefined,
                        public: cleanedFormValues.public === "true"
                    });
                    setId(socialInfo.id);
                    setSavedFeedback("Profile saved successfully.");
                }
            } catch (e) {
                setFormErrors({"global": "An unknown error occured. Please try again later."})
            }
        })();
    }

    function handleTabChange(tab: "private" | "public") {
        setFormErrors({});
        setProfileTab(tab);
        if (tab === "private") {
            setCleanedFormValues({});
        }
    }

    function handleFileUpload(file: File) {
        setProfilePicture(file);
    }

    const formFieldFactory = new FormFieldFactory(cleanedFormValues, setCleanedFormValues, formErrors);

    return (
        <div className="h-100 w-100 d-flex justify-content-center align-items-center">
            {loading && (
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            )}
            {!loading && (
                <div className="card p-3 w-50 h-75">
                    <div className="d-flex justify-content-between">
                        <h5 className="modal-title">Edit Profile</h5>
                        <ButtonGroup>
                            <Button variant={profileTab === "private" ? "primary" : "secondary"} onClick={() => handleTabChange("private")}>
                                Private
                            </Button>
                            <Button variant={profileTab === "public" ? "primary" : "secondary"} onClick={() => handleTabChange("public")}>
                                Public
                            </Button>
                        </ButtonGroup>
                    </div>
                    <hr />
                    {profileTab === "private" && (
                        <AccountInfo
                            setCleanedFormValues={setCleanedFormValues}
                            initialFormValues={initialFormValues}
                            formErrors={formErrors}
                        />
                    )}
                    {profileTab === "public" && (
                        <>
                            {formFieldFactory.FormField({name: "about_me", displayName: "About Me", type: "text", className: "mb-3"})}
                            {formFieldFactory.FormField({name: "public", displayName: "Public", type: "checkbox", className: "mb-3"})}
                            {formFieldFactory.FormField({name: "profile_picture", displayName: "Change Profile Picture", type: "file", className: "mb-3", onFileUpload: handleFileUpload})}
                        </>
                    )}
                    <div className="mt-auto">
                        {formErrors["global"] && <div className="invalid-feedback d-block m-0 mb-3">{formErrors["global"]}</div>}
                        <div className="d-flex flex-row align-items-center">
                            <button type="button" className="btn btn-primary" onClick={handleSaveProfile}>
                                Save Changes
                            </button>
                            {savedFeedback && <div className="ms-3">{savedFeedback}</div>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}