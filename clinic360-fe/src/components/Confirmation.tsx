interface Props {
    text: string
    onContinue(): void
    onCancel(): void
}

export default function Confirmation({text, onContinue, onCancel}: Props) {
    return (
        <div className="modal" style={{display: "block", backgroundColor: "rgba(0, 0, 0, 0.5)"}}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">
                            Wait!
                        </h5>
                    </div>
                    <div className="modal-body">
                        {text}
                    </div>
                    <div className="modal-footer">
                        <button className="btn btn-secondary" onClick={onCancel}>
                            Cancel
                        </button>
                        <button className="btn btn-primary" onClick={onContinue}>
                            Continue
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}