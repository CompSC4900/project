import { ReactNode } from "react";

interface Props {
    shown: boolean
    onDismiss(): void
    children?: ReactNode
}

export default function Popup({shown, onDismiss, children}: Props) {
    if (shown) {
        return (
            <div className="modal" style={{display: "block", backgroundColor: "rgba(0, 0, 0, 0.5)"}} onClick={() => onDismiss()}>
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="btn-close position-absolute top-0 end-0 m-2" aria-label="Close" onClick={() => onDismiss()} />
                        {children}
                    </div>
                </div>
            </div>
        );
    }
}