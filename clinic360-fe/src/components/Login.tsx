import { useState } from "react";
import FormField from "./form/FormField";
import { useAuth } from "./AuthContext";

interface Props {
    createAccount(): void
}

export default function Login({createAccount}: Props) {
    const [formValues, setFormValues] = useState({email: "", password: ""});
    const [error, setError] = useState<string | null>(null);
    const auth = useAuth();

    function formValuePropsFactory(name: "email" | "password") {
        return {
            value: formValues[name],
            onChange: (value: string) => setFormValues({...formValues, [name]: value}),
        };
    }

    async function handleLogin() {
        try {
            await auth.login(formValues.email, formValues.password);
        } catch (e) {
            if (e instanceof Error) {
                setError(e.message);
            } else {
                throw e;
            }
        }
    }

    return (
        <>
            <FormField
                className="mb-3"
                type="text"
                name="email" 
                displayName="Email" 
                error={error === null ? null : ""}
                {...formValuePropsFactory("email")}
            />
            <FormField 
                className="mb-3"
                type="text"
                name="password" 
                displayName="Password" 
                error={error} 
                {...formValuePropsFactory("password")}
            />
            <div className="d-flex flex-row-reverse">
                <button className="btn btn-primary ms-2" onClick={handleLogin}>Login</button>
                <button className="btn btn-secondary" onClick={createAccount}>Create Account</button>
            </div>
        </>
    );
}