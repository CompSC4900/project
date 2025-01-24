interface Props {
    name: string
    displayName: string
    error: string | null
    value: string
    onChange(value: string): void
}

export default function TextInput({name, displayName, error, value, onChange}: Props) {
    let htmlType: string
    switch (name) {
        case "email":
        case "password":
            htmlType = name;
            break;
        case "password2":
            htmlType = "password";
            break;
        default:
            htmlType = "text";
    }

    return (
        <div className="mb-3">
            <label htmlFor={name} className="form-label">{displayName}</label>
            <input 
                type={htmlType} 
                className={`form-control ${error !== null ? "is-invalid" : ""}`} 
                id={name}
                value={value}
                onChange={e => onChange(e.target.value)}
            />
            {error && <div className="invalid-feedback">{error}</div>}
        </div>
    );
}