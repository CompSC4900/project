interface Props {
    choices: readonly string[]
    activeChoice: string
    onChange(choice: string): void
}

export default function Choices({choices, activeChoice, onChange}: Props) {
    function renderChoice(choice: string) {
        if (choice === activeChoice) {
            return (
                <button className="btn btn-outline-primary active" key={choice}>{choice}</button>
            );
        } else {
            return (
                <button className="btn btn-outline-primary" onClick={() => onChange(choice)} key={choice}>
                    {choice}
                </button>
            );
        }
    }

    return (
        <>
            <div className="btn-group">
                {choices.map(renderChoice)}
            </div>
        </>
    );
}