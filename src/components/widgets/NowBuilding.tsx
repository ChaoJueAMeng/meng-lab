interface Props {
	title: string;
	status: string;
	href: string;
}

export default function NowBuilding({ title, status, href }: Props) {
	return (
		<section className="widget-card">
			<p className="widget-kicker">正在做</p>
			<a className="now-title" href={href}>
				{title}
			</a>
			<p className="now-status">
				<span className="now-dot" aria-hidden="true" />
				{status}
			</p>
		</section>
	);
}
