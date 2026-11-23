import { Badge, Button, DialogWrapper, Input, Table, Textarea, Typography, type ColumnDef, toast } from "@package/ui";
import { useState } from "react";
import { useAdminPlansQuery, useCreateAdminPlanMutation, useUpdateAdminPlanMutation } from "../hooks/use-admin-plans";
import type { AdminPlan, PlanPayload } from "../types";

function PlanForm({ plan, onClose }: { plan?: AdminPlan; onClose: () => void }) {
	const [form, setForm] = useState<PlanPayload>({
		name: plan?.name ?? "",
		slug: plan?.slug ?? "",
		description: plan?.description ?? "",
		monthlyPrice: plan?.monthlyPrice ?? 0,
		annualPrice: plan?.annualPrice ?? 0,
		maxMembers: plan?.maxMembers ?? undefined,
		maxVisitors: plan?.maxVisitors ?? undefined,
		isActive: plan?.isActive ?? true,
	});
	const createMutation = useCreateAdminPlanMutation();
	const updateMutation = useUpdateAdminPlanMutation(plan?.id ?? "");
	const isPending = createMutation.isPending || updateMutation.isPending;
	const set = (key: keyof PlanPayload, value: string | number | boolean) =>
		setForm((current) => ({ ...current, [key]: value }));

	const submit = () => {
		const mutation = plan ? updateMutation : createMutation;
		mutation.mutate(form, {
			onSuccess: () => {
				toast.success(plan ? "Plan updated successfully" : "Plan created successfully");
				onClose();
			},
			onError: () => toast.error("Unable to save plan"),
		});
	};

	return (
		<DialogWrapper
			open
			onOpenChange={(open) => !open && onClose()}
			title={plan ? "Edit plan" : "Create plan"}
			description="Configure pricing and usage limits for this SaaS plan."
			footer={
				<div className="flex justify-end gap-2">
					<Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
					<Button size="sm" isPending={isPending} onClick={submit}>{plan ? "Save changes" : "Create plan"}</Button>
				</div>
			}
		>
			<div className="grid grid-cols-2 gap-4">
				<Input placeholder="Plan name" value={form.name} onChange={(e) => set("name", e.target.value)} />
				<Input placeholder="Slug" value={form.slug} onChange={(e) => set("slug", e.target.value)} />
				<Textarea className="col-span-2" placeholder="Description" value={form.description} onChange={(e) => set("description", e.target.value)} />
				<Input type="number" placeholder="Monthly price (cents)" value={form.monthlyPrice} onChange={(e) => set("monthlyPrice", Number(e.target.value))} />
				<Input type="number" placeholder="Annual price (cents)" value={form.annualPrice} onChange={(e) => set("annualPrice", Number(e.target.value))} />
				<Input type="number" placeholder="Maximum members" value={form.maxMembers ?? ""} onChange={(e) => set("maxMembers", e.target.value ? Number(e.target.value) : undefined as never)} />
				<Input type="number" placeholder="Maximum visitors" value={form.maxVisitors ?? ""} onChange={(e) => set("maxVisitors", e.target.value ? Number(e.target.value) : undefined as never)} />
			</div>
		</DialogWrapper>
	);
}

export function PlansList() {
	const [editing, setEditing] = useState<AdminPlan | null | undefined>(undefined);
	const plansQuery = useAdminPlansQuery();
	const plans = plansQuery.data?.data.data.items ?? [];
	const columns: ColumnDef<AdminPlan>[] = [
		{ id: "name", header: "Plan", cell: ({ row }) => <div><p className="font-semibold text-gray-950">{row.original.name}</p><p className="text-xs text-gray-500">{row.original.slug}</p></div> },
		{ id: "monthly", header: "Monthly", cell: ({ row }) => `${row.original.monthlyPrice / 100}` },
		{ id: "annual", header: "Annual", cell: ({ row }) => `${row.original.annualPrice / 100}` },
		{ id: "status", header: "Status", cell: ({ row }) => <Badge variant={row.original.isActive ? "success" : "secondary"} size="sm">{row.original.isActive ? "Active" : "Inactive"}</Badge> },
		{ id: "actions", header: "", cell: ({ row }) => <Button size="xs" variant="outline" onClick={() => setEditing(row.original)}>Edit</Button> },
	];

	return <div className="space-y-4 p-6">
		<div className="flex items-center justify-between"><div><Typography.T1 weight="semibold">Billing & Subscription Plans</Typography.T1><Typography.T3 className="text-gray-500">Create and manage the plans offered by the SaaS platform.</Typography.T3></div><Button onClick={() => setEditing(null)}>Create plan</Button></div>
		<Table data={plans} columns={columns} getRowId={(plan) => plan.id} isPending={plansQuery.isLoading} isError={plansQuery.isError} emptyState={<Typography.T4 className="text-gray-500">No plans configured.</Typography.T4>} />
		{editing !== undefined && <PlanForm plan={editing ?? undefined} onClose={() => setEditing(undefined)} />}
	</div>;
}
