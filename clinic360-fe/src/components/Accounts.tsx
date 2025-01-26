import { useState } from "react";
import CreateAccount from "./CreateAccount";
import Login from "./Login";

export default function Accounts() {
    const [creatingAccount, setCreatingAccount] = useState(false);

    return (
        <div className="w-100 h-100 bg-clinic360">
            <div className="container h-100 p-0 d-flex justify-content-center align-items-center">
                <div className="card w-100 p-3" style={{maxWidth: 540}}>
                    {
                        creatingAccount ?
                            <CreateAccount login={() => setCreatingAccount(false)} />
                        :
                            <Login createAccount={() => setCreatingAccount(true)} />
                    }
                </div>
            </div>
        </div>
    );
}