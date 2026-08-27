import {
	Button,
	DialogWrapper,
	Input,
	Label,
	Typography,
	toast,
} from "@package/ui";
import { useEffect, useState } from "react";
import {
	useUpdateVisitorDetailsMutation,
	useVisitorInfoQuery,
} from "../../hooks";
import { useVisitorPanelsStore } from "../../store";
import type { UpdateVisitorDetailsPayload, VisitorStatus } from "../../types";

interface EditVisitorDetailsDialogProps {
	organizationId: string;
}

const STATUSES: VisitorStatus[] = ["NEW", "REVIEWED", "CONVERTED", "IGNORED"];

export function EditVisitorDetailsDialog({
	organizationId,
}: EditVisitorDetailsDialogProps) {
	const openPanel = useVisitorPanelsStore((s) => s.openPanel);
	const visitorId = useVisitorPanelsStore((s) => s.visitorId);
	const closePanel = useVisitorPanelsStore((s) => s.closePanel);

	const isOpen = openPanel === "edit" && Boolean(visitorId);
	const { data } = useVisitorInfoQuery(
		organizationId,
		isOpen ? visitorId : null,
	);
	const visitor = data?.data?.data;

	const mutation = useUpdateVisitorDetailsMutation(
		organizationId,
		visitorId ?? "",
	);

	const [form, setForm] = useState<UpdateVisitorDetailsPayload>({});

	// seed the form once the visitor loads, and reset it when the dialog closes
	useEffect(() => {
		if (isOpen && visitor) {
			setForm({
				name: visitor.name ?? "",
				email: visitor.email ?? "",
				phone: visitor.phone ?? "",
				status: visitor.status,
			});
		}
		if (!isOpen) setForm({});
	}, [isOpen, visitor]);

	const handleSubmit = () => {
		if (!visitorId) return;

		// only send fields that actually have a value, so blanks do not
		// overwrite existing data with empty strings
		const payload: UpdateVisitorDetailsPayload = {};
		if (form.name?.trim()) payload.name = form.name.trim();
		if (form.email?.trim()) payload.email = form.email.trim();
		if (form.phone?.trim()) payload.phone = form.phone.trim();
		if (form.status) payload.status = form.status;

		mutation.mutate(payload, {
			onSuccess: () => {
				toast.success("Visitor updated");
				closePanel();
			},
			onError: () => toast.error("Could not update visitor"),
		});
	};

	return (
		<DialogWrapper
			open={isOpen}
			onOpenChange={(open) => {
				if (!open) closePanel();
			}}
			size="sm"
			title="Edit visitor details"
			description="Identify this visitor so your team can recognise them later."
			footer={
				<>
					<Button
						variant="secondary"
						size="sm"
						className="w-auto"
						onClick={closePanel}
					>
						Cancel
					</Button>
					<Button
						size="sm"
						className="w-auto"
						isPending={mutation.isPending}
						onClick={handleSubmit}
					>
						Save changes
					</Button>
				</>
			}
		>
			<div className="flex flex-col gap-3">
				<Field label="Name">
					<Input
						value={form.name ?? ""}
						onChange={(event) => setForm((f) => ({ ...f, name: event.target.value }))}
						placeholder="Jane Doe"
					/>
				</Field>
				<Field label="Email">
					<Input
						type="email"
						value={form.email ?? ""}
						onChange={(event) =>
							setForm((f) => ({ ...f, email: event.target.value }))
						}
						placeholder="jane@example.com"
					/>
				</Field>
				<Field label="Phone">
					<Input
						value={form.phone ?? ""}
						onChange={(event) =>
							setForm((f) => ({ ...f, phone: event.target.value }))
						}
						placeholder="+1 555 0100"
					/>
				</Field>
				<Field label="Status">
					<select
						value={form.status ?? "NEW"}
						onChange={(event) =>
							setForm((f) => ({ ...f, status: event.target.value as VisitorStatus }))
						}
						className="h-10 rounded-[6px] border border-gray-border-200 bg-white-base px-3 typo-t3 text-gray-950 outline-none focus:border-primary-500"
					>
						{STATUSES.map((status) => (
							<option key={status} value={status}>
								{status}
							</option>
						))}
					</select>
				</Field>
			</div>
		</DialogWrapper>
	);
}

function Field({
	label,
	children,
}: {
	label: string;
	children: React.ReactNode;
}) {
	return (
		<div className="flex flex-col gap-1.5">
			<Label>
				<Typography.T5 weight="medium" className="text-gray-700">
					{label}
				</Typography.T5>
			</Label>
			{children}
		</div>
	);
}
