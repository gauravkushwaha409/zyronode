import { AccordionWrapper, Button, Typography } from "@package/ui";
import { useState } from "react";
import { AddTags } from "./add-tags-accordion";
import { AiInsights } from "./ai-insights-accordion";
import { AiSummary } from "./ai-summary-accordion";
import { CompanyDetails } from "./company-details-accordion";
import { LeadType } from "./lead-type-accordion";
import { Notes } from "./notes-accordion";
import { VisitInformation } from "./visit-information-accordion";
import { VisitedSites } from "./visited-sites-accordion";
import { useConversationItem } from "../../hooks/custom";
import { FormInput, FormWrapper } from "@package/form";
import { useForm } from "@package/form";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, Icon } from "@package/ui";
import { isValidElement } from "react";
import { z } from "zod";
import type { IconName } from "@package/icons";

const editSchema = z.object({
	name: z.string().min(1, "Required"),
	email: z.string().email("Invalid email").optional().or(z.literal("")),
	phone: z.string().optional().or(z.literal("")),
});

type UserInfo = { name: string; email: string; phone: string; city: string; country: string; timezone: string };

export function ConversationDetails() {
	const { value: conversationUuid } = useConversationItem();
	const [userInfo, setUserInfo] = useState<UserInfo>({
		name: "John Doe",
		email: "john@example.com",
		phone: "",
		city: "",
		country: "",
		timezone: "GMT+5:30",
	});
	const [openItems, setOpenItems] = useState<string[]>(["user-information"]);
	const isUserOpen = openItems.includes("user-information");

	return (
		<section className="h-full flex flex-col">
			<DetailsHeader />
			<div className="overflow-y-auto flex-1 scrollbar-hover">
				<AccordionWrapper
					showIcon
					type="multiple"
					value={openItems}
					onValueChange={(val) => setOpenItems(Array.isArray(val) ? val : [val])}
					items={[
						{
							title: <UserInfoTrigger isOpen={isUserOpen} info={userInfo} onSave={setUserInfo} />,
							value: "user-information",
							content: <UserInfoContent info={userInfo} />,
						},
						{
							title: <LeadType.Trigger />,
							value: "lead-type",
							content: <LeadType.Content conversationUuid={conversationUuid ?? ""} />,
						},
						{
							title: <AddTags.Trigger />,
							value: "add-tags",
							content: <AddTags.Content conversationUuid={conversationUuid ?? ""} />,
						},
						{
							title: <Typography.T5 weight="medium" className="text-gray-600">Company Details</Typography.T5>,
							value: "company-details",
							content: <CompanyDetails />,
						},
						{ title: <Typography.T5 weight="medium" className="text-gray-600">Notes</Typography.T5>, value: "notes", content: <Notes /> },
						{ title: <Typography.T5 weight="medium" className="text-gray-600">AI Summary</Typography.T5>, value: "ai-summary", content: <AiSummary /> },
						{ title: <Typography.T5 weight="medium" className="text-gray-600">Visit Information</Typography.T5>, value: "visit-information", content: <VisitInformation /> },
						{ title: <Typography.T5 weight="medium" className="text-gray-600">Visited Sites</Typography.T5>, value: "visited-sites", content: <VisitedSites /> },
						{ title: <Typography.T5 weight="medium" className="text-gray-600">AI Insights</Typography.T5>, value: "ai-insights", content: <AiInsights /> },
					]}
				/>
			</div>
		</section>
	);
}

function DetailsHeader() {
	return (
		<div className="w-full pl-3 pr-2.25 h-13.5 flex items-center justify-between bg-white border-b border-gray-200">
			<Typography.T3 weight="medium" className="text-gray-950">Details</Typography.T3>
			<Button icon="close" variant="ghost" size="icon-xs" />
		</div>
	);
}

function UserInfoContent({ info }: { info: UserInfo }) {
	const items = [
		{ icon: "email" as IconName, label: info.email || null, placeholder: "Add email address", tooltiptext: "Email" },
		{ icon: "call" as IconName, label: info.phone || null, placeholder: "Add phone number", tooltiptext: "Phone Number" },
		{ icon: "location" as IconName, label: info.city || info.country ? `${info.city ? `${info.city}, ` : ""}${info.country}` : null, placeholder: "Add location", tooltiptext: "Location" },
		{ icon: "gmt" as IconName, label: <Typography.T4 className="truncate text-gray-950">{info.timezone} <span className="text-gray-400">(GMT)</span></Typography.T4>, placeholder: "Add timezone", tooltiptext: "Visitor Time" },
	];
	return (
		<section className="space-y-1.5 px-3">
			<div className="flex-1 min-w-0">
				{items.map((item) => (
					<UserInfoItem key={item.icon} {...item} />
				))}
			</div>
			<div className="grid grid-cols-2 gap-2">
				<div className="flex flex-col gap-1 px-2.5 py-2 bg-gray-50 rounded-[6px]">
					<Typography.T6 className="text-gray-500" weight="regular">Total sessions</Typography.T6>
					<Typography.T4 className="text-gray-950" weight="medium">3</Typography.T4>
				</div>
				<div className="flex flex-col gap-1 px-2.5 py-2 bg-gray-50 rounded-[6px]">
					<Typography.T6 className="text-gray-500" weight="regular">Total Duration</Typography.T6>
					<Typography.T4 className="text-gray-950" weight="medium">12m</Typography.T4>
				</div>
			</div>
		</section>
	);
}

function UserInfoItem({ icon, label, placeholder, tooltiptext }: { icon: IconName; label: React.ReactNode | string; placeholder: string; tooltiptext: string }) {
	return (
		<div className="py-1.5 flex items-center gap-x-2.5">
			<Icon name={icon} size={16} showTooltip tooltipText={tooltiptext} tooltipPlacement="top-left" className="text-gray-500 shrink-0" />
			<div className="flex-1 min-w-0">
				{label ? (isValidElement(label) ? label : <Typography.T4 weight="medium" className="text-gray-950 truncate">{label}</Typography.T4>) : <Typography.T4 weight="regular" className="text-gray-300">{placeholder}</Typography.T4>}
			</div>
		</div>
	);
}

function UserInfoTrigger({ isOpen, info, onSave }: { isOpen: boolean; info: UserInfo; onSave: (data: UserInfo) => void }) {
	const form = useForm<z.infer<typeof editSchema>>({
		schema: editSchema,
		defaultValues: { name: info.name, email: info.email, phone: info.phone },
		values: { name: info.name, email: info.email, phone: info.phone },
	});
	const [isEditOpen, setIsEditOpen] = useState(false);
	const handleSubmit = form.handleSubmit((payload) => {
		onSave({ ...info, name: payload.name, email: payload.email ?? "", phone: payload.phone ?? "" });
		setIsEditOpen(false);
	});
	return (
		<div className="flex gap-1 items-center">
			<Typography.T5 className="text-gray-600" weight="medium">User Information</Typography.T5>
			{isOpen && (
				<div onPointerDown={(e) => e.stopPropagation()}>
					<DropdownMenu open={isEditOpen} onOpenChange={setIsEditOpen}>
						<DropdownMenuTrigger asChild>
							<Button icon="edit" size="icon-xs" variant="ghost" className="h-fit w-fit" />
						</DropdownMenuTrigger>
						<DropdownMenuContent className="p-2 w-75" align="center" side="bottom" onClick={(e) => e.stopPropagation()}>
							<FormWrapper useFormMethods={form}>
								<div className="flex flex-col gap-2">
									<FormInput name="name" leftIcon="assignee" placeholder="Add name" />
									<FormInput name="email" leftIcon="email" placeholder="Add email address" />
									<FormInput name="phone" leftIcon="call" placeholder="Add phone number" />
								</div>
								<div className="flex justify-end gap-2 mt-2">
									<Button type="button" className="w-fit" size="xs" variant="secondary" onClick={() => setIsEditOpen(false)}>Cancel</Button>
									<Button type="button" className="w-fit" size="xs" variant="default" onClick={() => handleSubmit()} disabled={!form.formState.isDirty || !form.formState.isValid}>Save</Button>
								</div>
							</FormWrapper>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			)}
		</div>
	);
}
