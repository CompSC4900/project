/*
 * CreateAccount: form for creation of accounts
 * TODO: add length limits to text inputs
 */

import { useState } from "react";
import { fetchData } from "../util/auth";
import AccountInfo from "./AccountInfo";
import FormField from "./form/FormField";

interface Props {
    login(): void
}

export default function CreateAccount({login}: Props) {
    const [cleanedFormValues, setCleanedFormValues] = useState<Record<string, string>>({});
    const [myFormValues, setMyFormValues] = useState<Record<string, string>>({});
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    async function handleCreateAccount() {
        try {
            const fetchResult = await fetchData("createaccount/", "POST", {...cleanedFormValues, ...myFormValues});
            if (fetchResult.errorCode !== null) {
                const errors = fetchResult.error as Record<string, Array<string>>;
                setFormErrors(
                    Object.entries(errors).reduce((obj, error) => ({...obj, [error[0]]: error[1][0]}), {} as Record<string, string>)
                );
            } else {
                login();
            }
        } catch (e) {
            setFormErrors({"global": "An unknown error occured. Please try again later."})
        }
    }

    return (
        <>
            <AccountInfo
                setCleanedFormValues={setCleanedFormValues}
                formErrors={formErrors}
            >
            <FormField
                className="mb-3"
                type="text"
                name="password"
                displayName="Password"
                error={formErrors["password"] === undefined ? null : formErrors["password"]}
                value={myFormValues["password"] || ""}
                onChange={(value: string) => setMyFormValues({...myFormValues, ["password"]: value})}
            />
            <FormField
                className="mb-3"
                type="text"
                name="password2"
                displayName="Retype Password"
                error={formErrors["password2"] === undefined ? null : formErrors["password2"]}
                value={myFormValues["password2"] || ""}
                onChange={(value: string) => setMyFormValues({...myFormValues, ["password2"]: value})}
            />
                {formErrors["global"] && <div className="invalid-feedback d-block m-0 mb-3">{formErrors["global"]}</div>}
                <div className="d-flex flex-row-reverse">
                    <button className="btn btn-primary ms-3" onClick={handleCreateAccount}>Create Account</button>
                    <button className="btn btn-secondary" onClick={login}>Cancel</button>
                </div>
            </AccountInfo>
        </>
    );
}