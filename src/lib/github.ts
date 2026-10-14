export interface GithubActivityItem {
	title: string;
	meta: string;
	href: string;
	day: string;
}

export interface GithubActivity {
	ok: boolean;
	items: GithubActivityItem[];
	week: number[];
}

interface GhEvent {
	type?: string;
	created_at?: string;
	repo?: { name?: string };
	payload?: {
		action?: string;
		ref_type?: string;
		commits?: { message?: string }[];
	};
}

const EMPTY: GithubActivity = { ok: false, items: [], week: [0, 0, 0, 0, 0, 0, 0] };

function shanghaiDay(date: Date) {
	return new Intl.DateTimeFormat('en-CA', {
		timeZone: 'Asia/Shanghai',
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
	}).format(date);
}

function formatStamp(iso?: string) {
	if (!iso) return '';
	const date = new Date(iso);
	if (Number.isNaN(date.valueOf())) return '';
	return new Intl.DateTimeFormat('zh-CN', {
		timeZone: 'Asia/Shanghai',
		month: 'numeric',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
		hourCycle: 'h23',
	}).format(date);
}

function label(event: GhEvent) {
	const repo = event.repo?.name ?? 'GitHub';
	switch (event.type) {
		case 'PushEvent': {
			const message = event.payload?.commits?.[0]?.message?.split('\n')[0];
			return message ? `${repo}：${message}` : `推送到 ${repo}`;
		}
		case 'WatchEvent':
			return `标星 ${repo}`;
		case 'ForkEvent':
			return `Fork ${repo}`;
		case 'ReleaseEvent':
			return `发布 ${repo}`;
		case 'CreateEvent':
			return `创建${event.payload?.ref_type ?? '内容'} ${repo}`;
		case 'PullRequestEvent':
			return `${event.payload?.action ?? '更新'} PR · ${repo}`;
		case 'IssuesEvent':
			return `${event.payload?.action ?? '更新'} issue · ${repo}`;
		default:
			return `${(event.type ?? 'Event').replace(/Event$/, '')} · ${repo}`;
	}
}

export async function getGithubActivity(): Promise<GithubActivity> {
	try {
		const response = await fetch('https://api.github.com/users/ChaoJueAMeng/events/public?per_page=8', {
			headers: {
				Accept: 'application/vnd.github+json',
				'User-Agent': 'meng-lab',
				'X-GitHub-Api-Version': '2022-11-28',
			},
			signal: AbortSignal.timeout(5000),
		});
		if (!response.ok) return EMPTY;
		const data: unknown = await response.json();
		if (!Array.isArray(data)) return EMPTY;

		const items = (data as GhEvent[]).slice(0, 4).map((event) => {
			const repo = event.repo?.name ?? 'ChaoJueAMeng';
			const when = event.created_at ? new Date(event.created_at) : new Date();
			return {
				title: label(event),
				meta: formatStamp(event.created_at),
				href: `https://github.com/${repo}`,
				day: shanghaiDay(when),
			};
		});

		const today = new Date();
		const week = Array.from({ length: 7 }, (_, index) => {
			const day = new Date(today);
			day.setDate(today.getDate() - (6 - index));
			const key = shanghaiDay(day);
			return (data as GhEvent[]).filter((event) => {
				if (!event.created_at) return false;
				return shanghaiDay(new Date(event.created_at)) === key;
			}).length;
		});

		return { ok: items.length > 0, items, week };
	} catch {
		return EMPTY;
	}
}
