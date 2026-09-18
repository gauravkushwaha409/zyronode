import type { DropzoneOptions } from "react-dropzone";
import { useInputFile } from "../../hooks/use-input-file";

interface InputFileProps {
	dropzoneOptions?: DropzoneOptions;
	customComponent?: (props: ReturnType<typeof useInputFile>) => React.ReactNode;
}

export function InputFile(props: InputFileProps) {
	const { getInputProps, getRootProps, ...rest } = useInputFile(
		props.dropzoneOptions,
	);

	const _custom_component = props.customComponent?.({
		getInputProps,
		getRootProps,
		...rest,
	});
	return (
		<div {...getRootProps()}>
			<input type="file" {...getInputProps()} className="text-black" />
			{_custom_component || <p>Click to upload</p>}
		</div>
	);
}
