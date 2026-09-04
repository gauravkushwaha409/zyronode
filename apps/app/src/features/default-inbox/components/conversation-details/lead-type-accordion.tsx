import { FormTextarea, FormWrapper } from "@package/form";
import { useForm } from "@package/form";
import { Button, DialogWrapper, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, Icon, Typography } from "@package/ui";
import { useState } from "react";
import { z } from "zod";

const remarksSchema = z.object({ remarks: z.string().min(1, "Required").max(100) });

export function LeadTypeContent({
	customerLeadType: initial = "non-potential" as "potential" | "non-potential",
}: {
	customerUuid?: string;
	customerLeadType?: "potential" | "non-potential";
	conversationUuid?: string;
}) {
	const [leadType] = useState<"potential" | "non-potential">(initial);
	const [open, setOpen] = useState(false);
	const [dropdownOpen, setDropdownOpen] = useState(false);
	const form = useForm<z.infer<typeof remarksSchema>>({ schema: remarksSchema, defaultValues: { remarks: "" } });
	const isCustomerAvailable = true;

	const handleSubmit = form.handleSubmit((vals) => {
		console.log("lead remarks", vals);
		setOpen(false);
		form.reset();
	});

	return (
		<>
			<section className="flex gap-3 items-center px-3 typo-t5 text-gray-500">
				<DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
					<DropdownMenuTrigger asChild>
						<Button size="xs" variant="secondary" className="h-8 w-31 rounded-[4px]">
							{leadType === "potential" ? "Potential" : leadType === "non-potential" ? "Non-potential" : "Select Lead Type"}
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="start">
						<DropdownMenuItem onClick={() => { setDropdownOpen(false); setOpen(true); }}>Potential</DropdownMenuItem>
						<DropdownMenuItem onClick={() => { setDropdownOpen(false); setOpen(true); }}>Non-potential</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
				<Icon name="list-view" className="text-gray-500" size={16} />
			</section>
			{isCustomerAvailable ? (
				<DialogWrapper open={open} onOpenChange={setOpen} title="Mark as Potential Lead">
					<FormWrapper useFormMethods={form} formProps={{ onSubmit: handleSubmit }}>
						<div className="p-6 block space-y-5">
							<FormTextarea label="Remarks" name="remarks" hint="Maximum number of characters is 100" placeholder="Add remarks (e.g. Customer interested in product, follow up needed...)" rows={4} />
							<div className="w-full mt-2 grid grid-cols-2 gap-x-3">
								<Button type="button" className="w-full" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
								<Button type="submit" className="w-full" rightIcon="long-arrow-right" onClick={handleSubmit}>Submit</Button>
							</div>
						</div>
					</FormWrapper>
				</DialogWrapper>
			) : (
				<DialogWrapper open={open} onOpenChange={setOpen}>
					<div className="flex flex-col items-center text-center px-6 py-8">
						<div className="flex items-center justify-center size-12 rounded-full bg-amber-50 mb-4">
							<Icon name="alert" size={24} className="text-alert-500" />
						</div>
						<Typography.T5 className="text-gray-500 text-sm leading-relaxed">Only customers can be converted into a potential lead type.</Typography.T5>
						<Button type="button" className="w-1/2 mt-7" variant="alert" onClick={() => setOpen(false)}>Close</Button>
					</div>
				</DialogWrapper>
			)}
		</>
	);
}

function LeadTypeTrigger() {
	return (
		<Typography.T5 className="text-gray-600" weight="medium">Lead Type</Typography.T5>
	);
}

export const LeadType = { Content: LeadTypeContent, Trigger: LeadTypeTrigger };
export default LeadType;
