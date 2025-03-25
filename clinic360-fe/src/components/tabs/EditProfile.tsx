import { useEffect, useState } from "react";
import { useAuth } from "../AuthContext";
import { expectSuccess } from "../../util/auth";
import AccountInfo from "../AccountInfo";

export default function EditProfile() {
    const auth = useAuth();

    const [loading, setLoading] = useState(false);
    const [cleanedFormValues, setCleanedFormValues] = useState<Record<string, string>>({});
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [newProfilePicture, setNewProfilePicture] = useState<File | null>(null);

    async function handleSaveProfile() {
        // TODO: implement
    }

    return (
        <>
            {!loading && (
                <div className="h-100 w-100 d-flex justify-content-center align-items-center">
                    <div className="card p-3">
                        <h5 className="modal-title">Edit Profile</h5>
                        <hr />
                        <AccountInfo
                            setCleanedFormValues={setCleanedFormValues}
                            formErrors={formErrors}
                        >
                            <div className="modal-footer">
                                <button type="button" className="btn btn-primary" onClick={handleSaveProfile}>
                                    Save Changes
                                </button>
                            </div>
                        </AccountInfo>
                    </div>
                </div>
            )}
        </>
    );
}