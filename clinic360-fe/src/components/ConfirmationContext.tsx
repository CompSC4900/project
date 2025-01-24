import Confirmation from "./Confirmation";
import { createContext, ReactNode, useState, useContext } from "react";

interface ConfirmationContextType {
    showConfirmation(text: string): Promise<void>;
}

const ConfirmationContext = createContext<ConfirmationContextType | undefined>(undefined);

export function ConfirmationProvider({ children }: { children: ReactNode }) {
    const [confirmation, setConfirmation] = useState<ReactNode>(undefined);

    function showConfirmation(text: string) {
        return new Promise<void>((resolve, reject) => {
            setConfirmation(
                <Confirmation
                    text={text}
                    onContinue={() => {
                        resolve();
                        setConfirmation(undefined);
                    }}
                    onCancel={() => {
                        reject();
                        setConfirmation(undefined);
                    }}
                />
            );
        });
    };

    return (
        <ConfirmationContext.Provider value={{showConfirmation}}>
            {children}
            {confirmation}
        </ConfirmationContext.Provider>
    );
}

export function useConfirmation() {
    const context = useContext(ConfirmationContext);
    if (!context) {
        throw new Error("useConfirmation must be used within a ConfirmationProvider");
    }
    return context.showConfirmation;
}