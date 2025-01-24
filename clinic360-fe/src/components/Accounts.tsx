import { useState } from "react";
import CreateAccount from "./CreateAccount";
import Login from "./Login";

export default function Accounts() {
    const [creatingAccount, setCreatingAccount] = useState(false);

    return (
        <div className="w-100 h-100 bg-clinic360">
            <div className="container card">
                {
                    creatingAccount ?
                        <CreateAccount login={() => setCreatingAccount(false)} />
                    :
                        <Login createAccount={() => setCreatingAccount(true)} />
                }
            </div>
        </div>
    );
}