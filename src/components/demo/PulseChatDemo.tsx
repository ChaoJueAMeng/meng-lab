import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import DemoStage from './DemoStage';

const STREAM = '这是霓虹列表里的模拟回复。没有连上聊天服务器，@ 和撤回也只发生在这个页面里。';
const PEOPLE = ['Kimi', '萌'];

function Chat() {
	const reduced = useReducedMotion();
	const [text, setText] = useState('');
	const [stream, setStream] = useState('');
	const [recalled, setRecalled] = useState(false);
	const [mention, setMention] = useState(false);
	const timer = useRef(0);

	useEffect(() => {
		let index = 0;
		let stopped = false;
		const step = () => {
			if (stopped || document.hidden) return;
			index += 1;
			setStream(STREAM.slice(0, index));
			if (index < STREAM.length) timer.current = window.setTimeout(step, reduced ? 0 : 28);
		};
		const onVis = () => {
			if (!document.hidden) step();
		};
		step();
		document.addEventListener('visibilitychange', onVis);
		return () => {
			stopped = true;
			window.clearTimeout(timer.current);
			document.removeEventListener('visibilitychange', onVis);
		};
	}, [reduced]);

	const hold = useRef(0);
	const onHoldStart = () => {
		window.clearTimeout(hold.current);
		hold.current = window.setTimeout(() => setRecalled(true), 480);
	};
	const onHoldEnd = () => window.clearTimeout(hold.current);

	return (
		<div className="pulse">
			<aside>
				<button type="button" className="pulse-row is-active">
					<span>Kimi</span>
					<small>流式回复</small>
				</button>
				<button type="button" className="pulse-row">
					<span>项目群</span>
					<small>@你 看下接口</small>
				</button>
			</aside>
			<div className="pulse-thread">
				<p
					className="bubble mine"
					onPointerDown={onHoldStart}
					onPointerUp={onHoldEnd}
					onPointerLeave={onHoldEnd}
				>
					{recalled ? '已撤回' : '到了吗'}
					<button type="button" onClick={() => setRecalled(true)} disabled={recalled}>
						撤回
					</button>
				</p>
				<motion.p className="bubble ai" animate={{ opacity: 1 }} initial={reduced ? false : { opacity: 0.4 }}>
					{stream}
					{stream.length < STREAM.length && <span className="caret" aria-hidden="true" />}
				</motion.p>
				<form
					onSubmit={(event) => {
						event.preventDefault();
						setText('');
						setMention(false);
					}}
				>
					<label className="visually-hidden" htmlFor="pulse-draft">
						消息
					</label>
					<input
						id="pulse-draft"
						value={text}
						placeholder="输入 @ 提及"
						onChange={(event) => {
							const value = event.target.value;
							setText(value);
							setMention(/@\w*$/.test(value));
						}}
					/>
					{mention && (
						<div className="mentions" role="group" aria-label="提及">
							{PEOPLE.map((name) => (
								<button
									type="button"
									key={name}
									onClick={() => {
										setText((value) => value.replace(/@\w*$/, `@${name} `));
										setMention(false);
									}}
								>
									@{name}
								</button>
							))}
						</div>
					)}
					<button type="submit">发送</button>
				</form>
			</div>
		</div>
	);
}

export default function PulseChatDemo() {
	return (
		<DemoStage caption="左侧是霓虹会话列表，右侧 AI 气泡在本地逐字出现。输入 @ 可以选择提及。长按自己的消息，或点「撤回」。">
			<Chat />
		</DemoStage>
	);
}
