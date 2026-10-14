import { useState } from 'react';
import { motion } from 'motion/react';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import DemoStage from './DemoStage';

interface Dish {
	id: string;
	name: string;
	price: number;
	cat: string;
	blurb: string;
}

const DISHES: Dish[] = [
	{ id: 'veg', name: '清炒时蔬', price: 18, cat: '清淡', blurb: '少油' },
	{ id: 'egg', name: '番茄鸡蛋', price: 16, cat: '热菜', blurb: '家常' },
	{ id: 'soup', name: '紫菜蛋花汤', price: 12, cat: '清淡', blurb: '清口' },
	{ id: 'set', name: '米饭套餐', price: 22, cat: '套餐', blurb: '含汤' },
];

const CATS = ['全部', '热菜', '清淡', '套餐'];

function Shop() {
	const reduced = useReducedMotion();
	const [cat, setCat] = useState('全部');
	const [cart, setCart] = useState<Record<string, number>>({});
	const [status, setStatus] = useState<'浏览' | '待接单' | '派送中'>('浏览');
	const [toast, setToast] = useState('');
	const [wish, setWish] = useState('我想吃清淡一点的');
	const [advice, setAdvice] = useState('');

	const visible = DISHES.filter((dish) => cat === '全部' || dish.cat === cat);
	const count = Object.values(cart).reduce((sum, value) => sum + value, 0);
	const total = DISHES.reduce((sum, dish) => sum + dish.price * (cart[dish.id] ?? 0), 0);

	const ping = (message: string) => {
		setToast(message);
		window.setTimeout(() => setToast(''), reduced ? 0 : 1600);
	};

	return (
		<div className="shop">
			<header>
				<strong>苍穹外卖</strong>
				<span>营业中 · 模拟</span>
			</header>
			<div className="shop-cats" role="group" aria-label="分类">
				{CATS.map((item) => (
					<button type="button" key={item} aria-pressed={cat === item} onClick={() => setCat(item)}>
						{item}
					</button>
				))}
			</div>
			<ul className="shop-list">
				{visible.map((dish) => (
					<li key={dish.id}>
						<div>
							<strong>{dish.name}</strong>
							<span>
								¥{dish.price} · {dish.blurb}
							</span>
						</div>
						<button
							type="button"
							onClick={() => setCart((current) => ({ ...current, [dish.id]: (current[dish.id] ?? 0) + 1 }))}
							disabled={status !== '浏览'}
						>
							加购{cart[dish.id] ? ` ${cart[dish.id]}` : ''}
						</button>
					</li>
				))}
			</ul>
			<form
				className="shop-ai"
				onSubmit={(event) => {
					event.preventDefault();
					setAdvice(
						wish.includes('清淡')
							? '清炒时蔬 · ¥18 · 清淡少油，贴近你刚说的口味。'
							: '番茄鸡蛋 · ¥16 · 模拟推荐，没有查询真实菜单。',
					);
				}}
			>
				<label htmlFor="shop-wish">想吃什么</label>
				<input id="shop-wish" value={wish} onChange={(event) => setWish(event.target.value)} />
				<button type="submit">推荐</button>
			</form>
			{advice && <p className="shop-advice">{advice}</p>}
			{status === '浏览' ? (
				<button
					type="button"
					className="shop-order"
					disabled={count === 0}
					onClick={() => setStatus('待接单')}
				>
					下单 · ¥{total}
				</button>
			) : (
				<div className="shop-status">
					<p>订单状态：{status}。这不是真实订单。</p>
					<button type="button" onClick={() => ping('商家已收到催单（模拟 WebSocket）')}>
						催单
					</button>
					{status === '待接单' && (
						<button type="button" onClick={() => setStatus('派送中')}>
							模拟接单
						</button>
					)}
				</div>
			)}
			{toast && (
				<motion.p className="shop-toast" role="status" initial={reduced ? false : { y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
					{toast}
				</motion.p>
			)}
		</div>
	);
}

export default function CangqiongDemo() {
	return (
		<DemoStage caption="按用户端走一遍：选分类、加购、下单，再到待接单和催单。推荐语是本地写好的，不会请求菜单或支付。">
			<Shop />
		</DemoStage>
	);
}
