/*
 * AccountInfo: form for editing account information
 * TODO: add length limits to text inputs
 */

import { STATES } from "../util/names";
import { useEffect, useState } from "react";
import FormField from "./form/FormField";

interface Props {
    setCleanedFormValues: (values: Record<string, string>) => void
    formErrors: Record<string, string>
    children?: React.ReactNode
}

export default function AccountInfo({setCleanedFormValues, formErrors, children}: Props) {
    const [formValues, setFormValues] = useState<Record<string, string>>({});

    function preprocessFormValues() {
        const cleanedFormValues = {...formValues};
        const phone_number = formValues["phone_number"];
        if (phone_number) {
            cleanedFormValues["phone_number"] = phone_number.replace(/\(\)- /g, "");
        }
        return cleanedFormValues;
    }

    function formValuePropsFactory(name: string) {
        return {
            error: formErrors[name] === undefined ? null : formErrors[name],
            value: formValues[name] || "",
            onChange: (value: string) => setFormValues({...formValues, [name]: value}),
        };
    }

    useEffect(() => {
        setCleanedFormValues(preprocessFormValues());
    }, [formValues]);

    return (
        <>
            <FormField
                className="mb-3"
                type="text"
                name="email"
                displayName="Email"
                {...formValuePropsFactory("email")}
            />
            <div className="d-flex mb-3">
                <FormField
                    className="w-50 me-3"
                    type="text"
                    name="first_name"
                    displayName="First Name"
                    {...formValuePropsFactory("first_name")}
                />
                <FormField
                    className="w-50"
                    type="text"
                    name="last_name"
                    displayName="Last Name"
                    {...formValuePropsFactory("last_name")}
                />
            </div>
            <FormField
                className="mb-3"
                type="text"
                name="address"
                displayName="Address"
                {...formValuePropsFactory("address")}
            />
            <div className="d-flex mb-3">
                <FormField
                    className="w-33 me-3"
                    type="text"
                    name="city"
                    displayName="City"
                    {...formValuePropsFactory("city")}
                />
                <FormField
                    className="w-33 me-3"
                    type="choice"
                    name="state"
                    displayName="State"
                    choices={STATES}
                    {...formValuePropsFactory("state")}
                />
                <FormField
                    className="w-33"
                    type="text"
                    name="zip_code"
                    displayName="Zip Code"
                    inputMode="numeric"
                    {...formValuePropsFactory("zip_code")}
                />
            </div>
            <div className="d-flex mb-3">
                <FormField
                    className="w-33 me-3"
                    type="date"
                    name="birth_date"
                    displayName="Date of Birth"
                    {...formValuePropsFactory("birth_date")}
                />
                <FormField
                    className="w-33 me-3"
                    type="choice"
                    name="gender"
                    displayName="Gender"
                    choices={{"M": "Male", "F": "Female"}}
                    {...formValuePropsFactory("gender")}
                />
                <FormField
                    className="w-33"
                    type="text"
                    name="phone_number"
                    displayName="Phone Number"
                    inputMode="tel"
                    {...formValuePropsFactory("phone_number")}
                />
            </div>
            {children}
        </>
    );
}