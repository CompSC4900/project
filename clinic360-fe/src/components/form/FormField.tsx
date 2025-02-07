import { ChangeEvent, HTMLAttributes, ReactNode } from "react"

interface BaseProps {
    name: string
    displayName: string
    error: string | null
    value: string
    className?: string
    onChange(value: string): void
}

type TextFieldProps = BaseProps & {
    type: "text"
    inputMode?: HTMLAttributes<HTMLInputElement>["inputMode"]
}

type ChoiceFieldProps = BaseProps & {
    type: "choice"
    choices: Record<string, string>
}

type DateFieldProps = BaseProps & {
    type: "date"
}

type DayFieldProps = BaseProps & {
    type: "time"
}

type Props = TextFieldProps | ChoiceFieldProps | DateFieldProps | DayFieldProps

export default function FormField(props: Props) {
    const {type, name, displayName, error, value, className, onChange} = props;
    const inputMode = "inputMode" in props ? props.inputMode : undefined;
    let inputElement: ReactNode;

    function getHtmlType() {
        switch (type) {
            case "date":
            case "time":
                return type;
            default:
                break;
        }

        switch (name) {
            case "email":
                return "email";
            case "password":
            case "password2":
                return "password";
            default:
                return "text";
        }
    }

    switch (type) {
        case "text":
        case "date":
        case "time":
            inputElement = (
                <input 
                    type={getHtmlType()}
                    inputMode={inputMode}
                    className={`form-control ${error !== null ? "is-invalid" : ""}`} 
                    id={name}
                    value={value}
                    onChange={handleChange}
                />
            );
            break;
        case "choice":
            const choices = (props as ChoiceFieldProps).choices;
            inputElement = (
                <select
                    className={`form-select ${error !== null ? "is-invalid" : ""}`}
                    id={name}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                >
                    <option value="">—</option>
                    {Object.entries(choices).map(([key, label]) =>
                        <option key={key} value={key}>{label}</option>
                    )}
                </select>
            );
            break;
    }

    function handleChange(e: ChangeEvent<HTMLInputElement>) {
        if (inputMode === "numeric") {
            onChange(e.target.value.replace(/\D/g, ''));
        } else if (inputMode === "tel") {
            onChange(e.target.value.replace(/[^\d\(\)\- ]/g, ''))
        } else {
            onChange(e.target.value);
        }
    }

    return (
        <div className={className}>
            <label htmlFor={name} className="form-label">{displayName}</label>
            {inputElement}
            {error && <div className="invalid-feedback">{error}</div>}
        </div>
    );
}