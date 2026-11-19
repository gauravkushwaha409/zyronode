import { Typography } from "@package/ui";

interface AdminPageProps {
	title: string;
	description: string;
}

export function AdminPage({ title, description }: AdminPageProps) {
	return (
		<div className="p-6">
			<Typography.T1 weight="semibold" className="text-gray-950">
				{title}
			</Typography.T1>
			<Typography.T3 className="mt-2 text-gray-500">{description}</Typography.T3>
		</div>
	);
}
