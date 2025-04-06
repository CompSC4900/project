import FormField from "./FormField";

export default class FormFieldFactory {
    constructor(
        private readonly formValues: Record<string, string>,
        private readonly setFormValues: React.Dispatch<React.SetStateAction<Record<string, string>>>,
        private readonly formErrors: Record<string, string>,
    ) {}

    public FormField<T extends {name: string}>(props: T): JSX.Element {
        return <FormField
            {...(props as any)}
            error={this.formErrors[props.name] ?? null}
            value={this.formValues[props.name] ?? ""}
            onChange={(value) => this.setFormValues({...this.formValues, [props.name]: value})}
        />
    }
}