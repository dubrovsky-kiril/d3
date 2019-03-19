import * as React from "react";
import Form from "../Form/Form";
import Input from "../Input/Input";

type RegularFormProps = {
  formId: string;
  inputId: string;
  inputLabel: string;
  inputType: string;
  onSubmit(event: React.FormEvent<HTMLElement>): void;
  buttonTxt: string;
  isInputRequired: boolean;
};

const RegularForm = (props: RegularFormProps) => {
  const {
    formId,
    inputId,
    inputLabel,
    inputType,
    onSubmit,
    buttonTxt,
    isInputRequired
  } = props;
  return (
    <Form formId={formId} onSubmit={onSubmit} buttonTxt={buttonTxt}>
      <Input
        id={inputId}
        type={inputType}
        label={inputLabel}
        isRequired={isInputRequired}
      />
    </Form>
  );
};

export default RegularForm;