import type { Ref } from 'react';
import { Text, TextInput, type TextInputProps } from 'react-native';

import { useGlobalStyles } from './globalStyles';

interface FormTextInputProps
  extends Omit<TextInputProps, 'style' | 'editable'> {
  error?: string;
  loading: boolean;
  inputRef?: Ref<TextInput>;
}

export const FormTextInput = ({
  error,
  loading,
  inputRef,
  ...inputProps
}: FormTextInputProps) => {
  const globalStyles = useGlobalStyles();

  return (
    <>
      <TextInput
        {...inputProps}
        ref={inputRef}
        style={[globalStyles.input, error && globalStyles.inputError]}
        placeholderTextColor={globalStyles.textSecondary.color}
        editable={!loading}
      />
      {error ? (
        <Text style={globalStyles.formErrorText}>{error}</Text>
      ) : null}
    </>
  );
};
