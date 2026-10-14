export const EFFECTS_KEY = 'meng-lab-effects';
export const EFFECTS_EVENT = 'meng-effects';

export function lowEffectsEnabled() {
	return document.documentElement.dataset.effects === 'low';
}

export function setLowEffects(low: boolean) {
	if (low) document.documentElement.dataset.effects = 'low';
	else delete document.documentElement.dataset.effects;
	localStorage.setItem(EFFECTS_KEY, low ? 'low' : 'full');
	document.documentElement.dispatchEvent(new Event(EFFECTS_EVENT));
}
