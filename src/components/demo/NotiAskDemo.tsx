import { useState } from 'react';
import { motion } from 'motion/react';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import DemoStage from './DemoStage';

const MODELS = ['DeepSeek', 'Kimi', '通义千问'];
const ANSWER = '这是留在通知栏里的模拟回答。没有调用任何模型，也没有离开这台浏览器。';

type Phase = 'shade' | 'reply' | 'thinking' | 'answer';

function Phone() {
	const reduced = useReducedMotion();
	const [phase, setPhase] = useState<Phase>('shade');
	const [draft, setDraft] = useState('');
	const [model, setModel] = useState(0);
	const [open, setOpen] = useState(false);
	const [copied, setCopied] = useState(false);

	const ask = () => {
		const question = draft.trim();
		if (!question) return;
		setPhase('thinking');
		setCopied(false);
		window.setTimeout(() => setPhase('answer'), reduced ? 0 : 700);
	};

	const copy = async () => {
		try {
			await navigator.clipboard.writeText(ANSWER);
			setCopied(true);
		} catch {
			setCopied(false);
		}
	};

	return (
		<div className="phone">
			<div className="phone-status">
				<span>9:41</span>
				<span>通知栏</span>
			</div>
			<article className="notice">
				<header>
					<strong>NotiAsk</strong>
					<span>常驻 · {MODELS[model]}</span>
				</header>
				<p>下拉通知栏就能问。这一屏是模拟的，不会发出请求。</p>
				<div className="notice-actions">
					<button type="button" onClick={() => setPhase('reply')}>
						提问
					</button>
					<button type="button" onClick={() => setModel((value) => (value + 1) % MODELS.length)}>
						切换模型
					</button>
				</div>
			</article>

			{phase === 'reply' && (
				<form
					className="direct-reply"
					onSubmit={(event) => {
						event.preventDefault();
						ask();
					}}
				>
					<label htmlFor="notiask-draft">Direct Reply</label>
					<input
						id="notiask-draft"
						value={draft}
						onChange={(event) => setDraft(event.target.value)}
						placeholder="在通知栏输入问题"
					/>
					<button type="submit">发送</button>
				</form>
			)}

			{phase === 'thinking' && <p className="notice thinking">正在生成模拟回答…</p>}

			{phase === 'answer' && (
				<motion.article
					className="notice answer"
					initial={reduced ? false : { opacity: 0, y: 8 }}
					animate={{ opacity: 1, y: 0 }}
				>
					<header>
						<strong>回答</strong>
						<button type="button" onClick={() => setOpen((value) => !value)}>
							{open ? '收起' : '展开'}
						</button>
					</header>
					{open && <p>{ANSWER}</p>}
					<button type="button" onClick={copy}>
						{copied ? '已复制' : '复制'}
					</button>
				</motion.article>
			)}
		</div>
	);
}

export default function NotiAskDemo() {
	return (
		<DemoStage caption="下拉通知栏后点「提问」，在 Direct Reply 里发送。回答可以展开和复制，芯片只在本地切换模拟模型。">
			<Phone />
		</DemoStage>
	);
}
