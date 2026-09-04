import { FormWrapper } from "@package/form";
import { useForm } from "@package/form";
import { Badge, Button, Icon, Input, Popover, PopoverContent, PopoverTrigger, Typography } from "@package/ui";
import { useState } from "react";
import { z } from "zod";

const tagSchema = z.object({ name: z.string().min(1).max(20) });

export function AddTagsContent(_props: { conversationUuid?: string }) {
	const [tags, setTags] = useState<{ id: number; name: string; uuid: string }[]>([
		{ id: 1, name: "vip", uuid: "1" },
		{ id: 2, name: "follow-up", uuid: "2" },
	]);
	const [assigned, setAssigned] = useState<{ id: number; tag: { id: number; name: string; uuid: string } }[]>([
		{ id: 1, tag: { id: 1, name: "vip", uuid: "1" } },
	]);
	const form = useForm<z.infer<typeof tagSchema>>({ schema: tagSchema, defaultValues: { name: "" } });
	const searchValue = form.watch("name") ?? "";
	const assignedIds = new Set(assigned.map((a) => a.tag.id));
	const filtered = tags.filter((t) => !assignedIds.has(t.id) && t.name.toLowerCase().includes(searchValue.trim().toLowerCase()));
	const handleAssign = (id: number) => {
		const tag = tags.find((t) => t.id === id);
		if (tag) setAssigned((prev) => [...prev, { id: Date.now(), tag }]);
	};
	const handleRemove = (uuid: string) => setAssigned((prev) => prev.filter((a) => a.tag.uuid !== uuid));
	const handleCreate = form.handleSubmit((payload) => {
		const newTag = { id: Date.now(), name: payload.name, uuid: String(Date.now()) };
		setTags((prev) => [...prev, newTag]);
		handleAssign(newTag.id);
		form.reset();
	});

	return (
		<section className="flex flex-wrap gap-2 px-3">
			{assigned.map((ct) => (
				<Badge key={ct.id} size="sm" radius="rounded" variant="secondary" removable onRemove={() => handleRemove(ct.tag.uuid)}>
					{ct.tag.name}
				</Badge>
			))}
			<Popover>
				<PopoverTrigger className="border rounded-[6px] shadow-xs size-6 flex items-center justify-center text-gray-600 cursor-pointer">
					<Icon name="plus" size={16} />
				</PopoverTrigger>
				<PopoverContent className="p-2 w-65 border" align="start">
					<Typography.T3>Tags</Typography.T3>
					<FormWrapper useFormMethods={form} formProps={{ onSubmit: handleCreate }}>
						<div className="mt-2 space-y-2">
							<Input value={searchValue} onChange={(e: React.ChangeEvent<HTMLInputElement>) => form.setValue("name", e.target.value, { shouldValidate: true })} placeholder="search or create tag" className="h-8" />
							<div className="max-h-40 overflow-y-auto space-y-1">
								{filtered.map((t) => (
									<button key={t.id} type="button" onClick={() => handleAssign(t.id)} className="w-full text-left px-2 py-1.5 hover:bg-gray-50 rounded text-sm">
										{t.name}
									</button>
								))}
								{filtered.length === 0 && searchValue.trim() && (
									<Button variant="ghost" type="submit" className="w-full justify-start h-fit" size="xs" disabled={!searchValue.trim()}>
										create "{searchValue}"
									</Button>
								)}
							</div>
						</div>
					</FormWrapper>
				</PopoverContent>
			</Popover>
		</section>
	);
}

function AddTagsTrigger() {
	return <Typography.T5 className="text-gray-600" weight="medium">Add Tags</Typography.T5>;
}

export const AddTags = { Content: AddTagsContent, Trigger: AddTagsTrigger };
export default AddTags;
