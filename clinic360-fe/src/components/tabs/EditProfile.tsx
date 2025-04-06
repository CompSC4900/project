import { useEffect, useState } from "react";
import { useAuth } from "../AuthContext";
import { expectSuccess } from "../../util/auth";
import AccountInfo from "../AccountInfo";
import { Button, ButtonGroup } from "react-bootstrap";
import FormFieldFactory from "../form/FormFieldFactory";

interface Props {
    onUsernameChange(username: string): void
}

export default function EditProfile({ onUsernameChange }: Props) {
    const auth = useAuth();

    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<"private" | "public">("private");
    const [cleanedFormValues, setCleanedFormValues] = useState<Record<string, string>>({});
    const [initialFormValues, setInitialFormValues] = useState<Record<string, string>>({});
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        (async () => {
            const fetchResult = await auth.fetchProtectedData("userinfo/", "GET");
            expectSuccess(fetchResult, auth);
            setInitialFormValues(fetchResult.data);
            setLoading(false);
        })();
    }, []);

    async function handleSaveProfile() {
        (async () => {
            try {
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
            } catch (e) {
                setFormErrors({"global": "An unknown error occured. Please try again later."})
            }
        })();
    }

    function handleTabChange(tab: "private" | "public") {
        setTab(tab);
        setCleanedFormValues({});
        setFormErrors({});
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
                            <Button variant={tab === "private" ? "primary" : "secondary"} onClick={() => handleTabChange("private")}>
                                Private
                            </Button>
                            <Button variant={tab === "public" ? "primary" : "secondary"} onClick={() => handleTabChange("public")}>
                                Public
                            </Button>
                        </ButtonGroup>
                    </div>
                    <hr />
                    {tab === "private" && (
                        <AccountInfo
                            setCleanedFormValues={setCleanedFormValues}
                            initialFormValues={initialFormValues}
                            formErrors={formErrors}
                        >
                            {formErrors["global"] && <div className="invalid-feedback d-block m-0 mb-3">{formErrors["global"]}</div>}
                            <div className="modal-footer">
                                <button type="button" className="btn btn-primary" onClick={handleSaveProfile}>
                                    Save Changes
                                </button>
                            </div>
                        </AccountInfo>
                    )}
                    {tab === "public" && (
                        <>
                            <formFieldFactory.FormField name="about_me" displayName="About Me" type="text" />
                            
                        </>
                    )}
                </div>
            )}
        </div>
    );
}