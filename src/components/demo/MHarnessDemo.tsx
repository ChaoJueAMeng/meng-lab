import { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import DemoStage from './DemoStage';

type Mode = 'ask' | 'agent';

interface ToolLine {
	id: number;
	name: string;
	detail: string;
	tone: 'ok' | 'deny' | 'wait';
}

const HARD_DENY = /git\s+reset\s+--hard|git\s+push\s+--force|git\s+clean\s+-fd/i;

function Harness() {
	const reduced = useReducedMotion();
	const [mode, setMode] = useState<Mode>('ask');
	const [dryRun, setDryRun] = useState(false);
	const [autoApprove, setAutoApprove] = useState(false);
	const [draft, setDraft] = useState('');
	const [chat, setChat] = useState<string[]>(['Ask 只能读。Agent 改文件前会先问一句。下面全部是模拟。']);
	const [tools, setTools] = useState<ToolLine[]>([]);
	const [pending, setPending] = useState<string | null>(null);
	const seq = useRef(0);
	const pendingRef = useRef<string | null>(null);

	const pushTool = (name: string, detail: string, tone: ToolLine['tone']) => {
		seq.current += 1;
		const id = seq.current;
		setTools((lines) => [...lines, { id, name, detail, tone }]);
	};

	const send = (text: string) => {
		const prompt = text.trim();
		if (!prompt || pendingRef.current) return;
		setDraft('');
		setChat((lines) => [...lines, prompt]);
		if (HARD_DENY.test(prompt)) {
			pushTool('run_terminal', 'HardDeny：这条命令不能被自动批准覆盖', 'deny');
			setChat((lines) => [...lines, '这条命令被 HardDeny 拦住了。']);
			return;
		}
		if (mode === 'ask') {
			if (/写|改|删除|shell|终端/.test(prompt)) {
				pushTool('write_file', 'Ask 模式拒绝写操作', 'deny');
				setChat((lines) => [...lines, 'Ask 是只读的，写文件和 Shell 会直接拒绝。']);
				return;
			}
			pushTool('read_file', 'README.md · 模拟读取 12 行', 'ok');
			setChat((lines) => [...lines, '模拟读到：这是一个可回滚的本地 Coding Agent。']);
			return;
		}
		if (dryRun) {
			pushTool('search_replace', 'Dry-run 只返回预览，没有落盘，也没有 checkpoint', 'ok');
			setChat((lines) => [...lines, 'Dry-run：只预览，没有改工作区。']);
			return;
		}
		if (autoApprove) {
			pushTool('search_replace', '自动批准后写入模拟补丁，并记下 checkpoint', 'ok');
			setChat((lines) => [...lines, '已按自动批准执行（模拟），checkpoint 已拍下。']);
			return;
		}
		pendingRef.current = prompt;
		setPending(prompt);
		pushTool('search_replace', '等待批准', 'wait');
	};

	const closePending = () => {
		pendingRef.current = null;
		setPending(null);
	};

	return (
		<div className="harness">
			<div className="harness-chat">
				<div className="harness-modes" role="radiogroup" aria-label="模式">
					<button type="button" role="radio" aria-checked={mode === 'ask'} onClick={() => setMode('ask')}>
						Ask
					</button>
					<button type="button" role="radio" aria-checked={mode === 'agent'} onClick={() => setMode('agent')}>
						Agent
					</button>
				</div>
				<div className="harness-log">
					{chat.map((line, index) => (
						<p key={`${index}-${line.slice(0, 12)}`}>{line}</p>
					))}
				</div>
				<div className="harness-flags">
					<label>
						<input type="checkbox" checked={dryRun} onChange={(event) => setDryRun(event.target.checked)} />
						Dry-run
					</label>
					<label>
						<input
							type="checkbox"
							checked={autoApprove}
							onChange={(event) => setAutoApprove(event.target.checked)}
						/>
						自动批准
					</label>
					<button
						type="button"
						onClick={() => {
							pushTool('rollback', '工作区恢复到最近一次 checkpoint（模拟）', 'ok');
							setChat((lines) => [...lines, '已回滚到最近 checkpoint（模拟）。']);
						}}
					>
						回滚
					</button>
				</div>
				<form
					onSubmit={(event) => {
						event.preventDefault();
						send(draft);
					}}
				>
					<label className="visually-hidden" htmlFor="harness-draft">
						任务
					</label>
					<input
						id="harness-draft"
						value={draft}
						onChange={(event) => setDraft(event.target.value)}
						placeholder="描述一个模拟任务"
					/>
					<button type="submit">发送</button>
				</form>
				<div className="harness-chips">
					<button type="button" onClick={() => send('读一下 README')}>
						读 README
					</button>
					<button type="button" onClick={() => send('改一下标题')}>
						改标题
					</button>
					<button type="button" onClick={() => send('git reset --hard')}>
						git reset --hard
					</button>
				</div>
			</div>
			<aside className="harness-tools" aria-live="polite">
				<h3>工具日志</h3>
				{tools.length === 0 && <p>还没有工具调用。</p>}
				<ol>
					{tools.map((tool) => (
						<li key={tool.id} className={`tone-${tool.tone}`}>
							<strong>{tool.name}</strong>
							<span>{tool.detail}</span>
						</li>
					))}
				</ol>
			</aside>
			{pending && (
				<motion.div
					className="approve"
					role="dialog"
					aria-modal="true"
					aria-labelledby="approve-title"
					initial={reduced ? false : { opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
				>
					<h3 id="approve-title">批准这次修改？</h3>
					<p>{pending}</p>
					<div>
						<button
							type="button"
							onClick={() => {
								setTools((lines) =>
									lines.map((line) =>
										line.tone === 'wait' ? { ...line, detail: '已批准并写入模拟补丁', tone: 'ok' } : line,
									),
								);
								setChat((lines) => [...lines, '已批准（模拟）。']);
								closePending();
							}}
						>
							批准
						</button>
						<button
							type="button"
							onClick={() => {
								setTools((lines) =>
									lines.map((line) =>
										line.tone === 'wait' ? { ...line, detail: '已拒绝', tone: 'deny' } : line,
									),
								);
								setChat((lines) => [...lines, '已拒绝。']);
								closePending();
							}}
						>
							拒绝
						</button>
					</div>
				</motion.div>
			)}
		</div>
	);
}

export default function MHarnessDemo() {
	return (
		<DemoStage caption="Ask 只读，Agent 默认弹出批准框。Dry-run 只预览，自动批准会跳过确认，但 git reset --hard 仍会被 HardDeny 拦住。回滚只更新这块模拟日志。">
			<Harness />
		</DemoStage>
	);
}
