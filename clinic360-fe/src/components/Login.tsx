import { useState } from "react";
import TextInput from "./TextInput";
import { useAuth } from "./AuthContext";

interface Props {
    createAccount(): void
}

export default function Login({createAccount}: Props) {
    const [formValues, setFormValues] = useState({email: "", password: ""});
    const [error, setError] = useState<string | null>(null);

    function formValuePropsFactory(name: "email" | "password") {
        return {
            value: formValues[name],
            onChange: (value: string) => setFormValues({...formValues, [name]: value}),
        };
    }

    async function handleLogin() {
        const auth = useAuth();
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
            <TextInput 
                name="email" 
                displayName="Email" 
                error={error === null ? null : ""}
                {...formValuePropsFactory("email")}
            />
            <TextInput 
                name="password" 
                displayName="Password" 
                error={error} 
                {...formValuePropsFactory("password")}
            />
            <div className="d-flex flex-row-reverse">
                <button className="btn btn-primary ms-3" onClick={handleLogin}>Login</button>
                <button className="btn btn-primary" onClick={createAccount}>CreateAccount</button>
            </div>
        </>
    );
}