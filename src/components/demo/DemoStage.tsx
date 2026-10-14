import { useState } from 'react';
import './demos.css';

interface Props {
	caption: string;
	children: React.ReactNode;
}

export default function DemoStage({ caption, children }: Props) {
	const [epoch, setEpoch] = useState(0);

	return (
		<section className="demo-stage" aria-label="模拟演示">
			<p className="demo-kicker">本地模拟</p>
			<div className="demo-frame" key={epoch}>
				{children}
			</div>
			<p className="demo-caption">{caption}</p>
			<button type="button" className="demo-reset" onClick={() => setEpoch((value) => value + 1)}>
				重置
			</button>
		</section>
	);
}
