import { MessageCircle, NotebookPen, Radio, Video, Users, Music, BookOpen, Code } from 'lucide-react';
// feature navigation handled via setActiveSection prop

type HomeProps = {
	setActiveSection?: (section: string) => void;
};

const quickLinks = [
	{
		label: 'Launch chat',
		description: 'Open NST Commons and sync the whole batch.',
		icon: MessageCircle,
		section: 'Chat',
	},
	{
		label: 'Start a video pod',
		description: 'Hop into the peer-to-peer lounge for lab prep.',
		icon: Video,
		section: 'Video Chat',
	},
	{
		label: 'Capture quick notes',
		description: 'Drop lab takeaways or sprint todos before you forget.',
		icon: NotebookPen,
		section: 'Notes',
	},
	{
		label: 'Listen together',
		description: 'Play the lo-fi playlist from the Spotify tab.',
		icon: Radio,
		section: 'Spotify',
	},
];

export default function Home({ setActiveSection }: HomeProps) {
	const go = (s: string) => {
		if (setActiveSection) return setActiveSection(s);
		localStorage.setItem('activeSection', s);
		window.location.reload();
	};

	return (
		<div className="space-y-8">
			<section className="glass-panel hero-gradient p-8 grid gap-6 lg:grid-cols-2 items-center">
				<div className="space-y-4">
					<p className="text-xs uppercase tracking-widest text-amber-200">Welcome back</p>
					<h1 className="text-4xl font-extrabold text-white leading-tight">BTech Buddy — your campus co-pilot for focus and collaboration</h1>
					<p className="text-white/70 max-w-xl">Everything you need for study sessions, project pairing and campus life — chat rooms, instant video pods, collaborative notes, playlists, and a ranked LeetCode practice board tailored for your growth.</p>

					<div className="flex items-center gap-3 mt-4">
						<button onClick={() => go('Chat')} className="primary-btn px-6 py-3 text-lg">Open Chat</button>
						<button onClick={() => go('Video Chat')} className="ghost-btn px-5 py-3">Start Video Pod</button>
					</div>

					<div className="mt-6 grid grid-cols-3 gap-3 max-w-sm">
						<div className="glass-panel p-3 text-center feature-card floaty">
							<div className="text-xl font-semibold">Live</div>
							<div className="text-xs text-white/60">Rooms & calls</div>
						</div>
						<div className="glass-panel p-3 text-center feature-card">
							<div className="text-xl font-semibold">Focus</div>
							<div className="text-xs text-white/60">Music & timer</div>
						</div>
						<div className="glass-panel p-3 text-center feature-card">
							<div className="text-xl font-semibold">Practice</div>
							<div className="text-xs text-white/60">LeetCode curation</div>
						</div>
					</div>
				</div>

				<div className="hidden lg:flex items-center justify-center">
					<div className="w-full max-w-[520px]">
						<svg viewBox="0 0 560 360" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full rounded-xl border border-white/6">
							<rect x="0" y="0" width="560" height="360" rx="16" fill="#071023" />
							<circle cx="460" cy="80" r="78" fill="#FFB347" opacity="0.12" />
							<rect x="36" y="60" width="320" height="200" rx="12" fill="#0b1220" />
							<rect x="56" y="82" width="280" height="22" rx="8" fill="#FFB347" opacity="0.12" />
							<rect x="56" y="116" width="240" height="14" rx="6" fill="#fff" opacity="0.03" />
							<rect x="56" y="138" width="200" height="14" rx="6" fill="#fff" opacity="0.03" />
							<circle cx="420" cy="260" r="48" fill="#FF6A00" opacity="0.08" />
						</svg>
					</div>
				</div>
			</section>

			<section className="grid gap-6 md:grid-cols-3">
				<div className="glass-panel p-6 feature-card">
					<h3 className="text-lg font-semibold text-white">Chat</h3>
					<p className="text-white/70 mt-2 text-sm">Persistent rooms, optimistic messages and quick threading for campus life. Jump into community rooms and keep context.</p>
					<div className="mt-4 flex gap-2">
						<button onClick={() => go('Chat')} className="primary-btn px-3 py-2 text-sm">Open Chat</button>
					</div>
				</div>

				<div className="glass-panel p-6 feature-card">
					<h3 className="text-lg font-semibold text-white">Video Pods</h3>
					<p className="text-white/70 mt-2 text-sm">Peer-to-peer rooms with simple audio/video controls for interviews, mock sessions, or study groups.</p>
					<div className="mt-4 flex gap-2">
						<button onClick={() => go('Video Chat')} className="primary-btn px-3 py-2 text-sm">Start a Pod</button>
					</div>
				</div>

				<div className="glass-panel p-6 feature-card">
					<h3 className="text-lg font-semibold text-white">LeetCode & Tasks</h3>
					<p className="text-white/70 mt-2 text-sm">Curated problem lists, progress tracking and quick tasks integration to keep your practice structured.</p>
					<div className="mt-4 flex gap-2">
						<button onClick={() => go('LeetCode')} className="primary-btn px-3 py-2 text-sm">Practice</button>
					</div>
				</div>
			</section>

			<section className="grid gap-4 md:grid-cols-2">
				<div className="glass-panel p-4 testimonial">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-full bg-amber-400/20 flex items-center justify-center">A</div>
						<div>
							<div className="font-semibold">Arjun, NST</div>
							<div className="text-xs text-white/60">Product Design student</div>
						</div>
					</div>
					<p className="text-white/70 mt-3 text-sm">"BTech Buddy keeps our study groups together — instant video rooms + quick chat threads make collaboration painless."</p>
				</div>

				<div className="glass-panel p-4 testimonial">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-full bg-amber-400/20 flex items-center justify-center">S</div>
						<div>
							<div className="font-semibold">Shruti, CSE</div>
							<div className="text-xs text-white/60">Intern</div>
						</div>
					</div>
					<p className="text-white/70 mt-3 text-sm">"The LeetCode curation and quick notes saved me time prepping for interviews — super convenient."</p>
				</div>
			</section>
		</div>
	);
}
