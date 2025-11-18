import { useEffect, useMemo, useState } from 'react';
import { MessageCircle, NotebookPen, Radio, Video, BookOpen, Code, Sparkles, Heart, ListChecks, ChevronRight, ShieldCheck, Link2, Users } from 'lucide-react';
import api from '../../lib/api';

type HomeProps = {
	setActiveSection?: (section: string) => void;
};

interface FavoriteSong { title: string; artist: string; }
interface TodoItem { content: string; completed: boolean; priority: 'low' | 'medium' | 'high'; }
interface LeetProblem { id: string; title: string; status?: 'solved' | 'todo'; difficulty: string; }

const shortcuts = [
	{ label: 'Community Chat', description: 'NST Commons, placements & more', icon: MessageCircle, section: 'Chat' },
	{ label: 'Video Pods', description: 'Peer rooms for labs & mock interviews', icon: Video, section: 'Video Chat' },
	{ label: 'Notes & Tasks', description: 'Pin ideas and todo bursts', icon: NotebookPen, section: 'Notes' },
	{ label: 'Music & Focus', description: 'Ambient playlists & timers', icon: Radio, section: 'Spotify' },
	{ label: 'LeetCode Board', description: 'Curated problems & streaks', icon: Code, section: 'LeetCode' },
	{ label: 'Resume Desk', description: 'Polish PDFs & intro decks', icon: BookOpen, section: 'Resume' },
];

export default function Home({ setActiveSection }: HomeProps) {
	const [userName, setUserName] = useState('NST Student');
	const [userEmail, setUserEmail] = useState('');
	const [favoriteSongs, setFavoriteSongs] = useState<FavoriteSong[]>([]);
	const [todoItems, setTodoItems] = useState<TodoItem[]>([]);
	const [leetcodeProblems, setLeetcodeProblems] = useState<LeetProblem[]>([]);
	const guest = localStorage.getItem('guest') === 'true';

	const go = (s: string) => {
		if (setActiveSection) return setActiveSection(s);
		localStorage.setItem('activeSection', s);
		window.location.reload();
	};

	useEffect(() => {
		const storedName = localStorage.getItem('chat_name');
		if (storedName) setUserName(storedName);

		const loadUser = async () => {
			try {
				const res = await api.get('/auth/me');
				if (res.data?.username) setUserName(res.data.username);
				if (res.data?.email) setUserEmail(res.data.email);
			} catch {}
		};
		if (!guest) loadUser();
	}, [guest]);

	useEffect(() => {
		if (guest) {
			const fav = localStorage.getItem('fav-songs');
			if (fav) setFavoriteSongs(JSON.parse(fav));
			const todos = localStorage.getItem('sidebar-todos');
			if (todos) setTodoItems(JSON.parse(todos));
			const lc = localStorage.getItem('guest-lc');
			if (lc) setLeetcodeProblems(JSON.parse(lc));
			return;
		}

		const loadCloudData = async () => {
			try {
				const [songsRes, tasksRes, lcRes] = await Promise.all([
					api.get('/songs').catch(() => ({ data: [] })),
					api.get('/tasks').catch(() => ({ data: [] })),
					api.get('/leetcode').catch(() => ({ data: [] })),
				]);
				setFavoriteSongs(songsRes.data?.map((s: any) => ({ title: s.title, artist: s.artist })) ?? []);
				setTodoItems(tasksRes.data?.map((t: any) => ({ content: t.title, completed: !!t.completed, priority: t.priority || 'medium' })) ?? []);
				setLeetcodeProblems(lcRes.data?.map((p: any) => ({ id: p._id, title: p.title, status: p.status, difficulty: p.difficulty })) ?? []);
			} catch {}
		};
		loadCloudData();
	}, [guest]);

	const leetSolved = useMemo(() => leetcodeProblems.filter((p) => (p.status ?? 'todo') === 'solved').length, [leetcodeProblems]);
	const leetTotal = leetcodeProblems.length || 1;
	const leetUnsolved = leetTotal - leetSolved;
	const leetPercent = Math.round((leetSolved / leetTotal) * 100);
	const leetHighlights = useMemo(() => leetcodeProblems.filter((p) => (p.status ?? 'todo') !== 'solved').slice(0, 3), [leetcodeProblems]);
	const openTodos = todoItems.filter((t) => !t.completed).length;
	const completedTodos = todoItems.length - openTodos;
	const topSongs = favoriteSongs.slice(0, 4);

	const primaryName = userName.split(' ')[0] || 'there';
	const chatRoomsPreview = [
		{ id: 'nst-commons', name: 'NST Commons', status: 'Active • 38 online' },
		{ id: 'nst-placements', name: 'Placements', status: 'Interviews week' },
	];
	const videoStats = [
		{ label: 'Pods live', value: '02', meta: 'NST Commons · Pods' },
		{ label: 'Peers synced', value: '11', meta: 'Avg latency 34ms' },
		{ label: 'Room slots', value: '04', meta: 'Seats open right now' },
	];
	const videoSignals = [
		{ title: 'Instant invite', description: 'Drop pod.nst links straight from chat', icon: Link2 },
		{ title: 'Lock controls', description: 'Stage, mute, and admit with one tap', icon: ShieldCheck },
		{ title: '6-seat grid', description: 'Perfect for labs & mock panels', icon: Users },
	];

	return (
		<div className="space-y-8">
			<section className="grid gap-5 lg:grid-cols-2">
				<div className="glass-panel hero-gradient p-7 flex flex-col gap-6 min-h-[280px]">
					<div>
						<p className="text-xs uppercase tracking-[0.4em] text-amber-200">Chat Command Center</p>
						<h1 className="text-3xl font-extrabold text-white leading-tight">Hi {primaryName}, your rooms are waiting.</h1>
						<p className="text-white/70 mt-2 text-sm sm:text-base">Hop into NST Commons, sync with placements, or spin up a new topic without losing the vibe.</p>
					</div>
					<div className="space-y-3">
						{chatRoomsPreview.map((room) => (
							<div key={room.id} className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 flex items-center justify-between">
								<div>
									<p className="text-white font-semibold">{room.name}</p>
									<p className="text-xs text-white/50">{room.status}</p>
								</div>
								<button onClick={() => go('Chat')} className="text-xs text-amber-200 hover:text-amber-100 inline-flex items-center gap-1">
									Open <ChevronRight className="w-3 h-3" />
								</button>
							</div>
						))}
					</div>
					<div className="flex flex-wrap gap-3">
						<button onClick={() => go('Chat')} className="primary-btn px-5 py-3 text-base flex items-center gap-2">
							<Sparkles className="w-4 h-4" /> Jump into chat
						</button>
						<button onClick={() => go('Notes')} className="ghost-btn px-5 py-3">Drop a quick note</button>
					</div>
					<div className="relative mt-4">
						<svg viewBox="0 0 420 180" className="w-full h-auto rounded-2xl border border-white/5" xmlns="http://www.w3.org/2000/svg">
							<rect width="420" height="180" rx="18" fill="url(#chatGradient)" />
							<defs>
								<linearGradient id="chatGradient" x1="0" y1="0" x2="420" y2="180" gradientUnits="userSpaceOnUse">
									<stop stopColor="#14192b" />
									<stop offset="1" stopColor="#24120f" />
								</linearGradient>
							</defs>
							<rect x="32" y="34" width="200" height="44" rx="12" fill="#ffb34722" />
							<rect x="32" y="90" width="260" height="44" rx="12" fill="#ffffff10" />
							<rect x="250" y="42" width="140" height="32" rx="12" fill="#ffffff08" />
							<rect x="280" y="106" width="100" height="28" rx="12" fill="#ff6a0030" />
						</svg>
					</div>
				</div>

				<div className="glass-panel p-6 flex flex-col justify-between min-h-[320px] relative overflow-hidden bg-gradient-to-br from-[#0b1221] via-[#0f0f19] to-[#1a0f17]">
					<div className="absolute inset-0 pointer-events-none">
						<div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,186,90,0.18),_transparent_60%)]" />
						<div className="absolute -top-10 -right-16 h-56 w-56 bg-emerald-500/20 blur-[110px]" />
						<div className="absolute -bottom-16 left-1/3 h-40 w-40 bg-amber-500/10 blur-[90px]" />
					</div>
					<div className="relative space-y-4">
						<div className="flex items-center gap-3">
							<span className="pill bg-emerald-200/10 text-emerald-200 border border-emerald-200/20">Video pods</span>
							<p className="text-xs text-white/60">Always-on campus mesh</p>
						</div>
						<h2 className="text-3xl font-bold text-white leading-tight max-w-2xl">Spin up a face-to-face room in seconds.</h2>
						<p className="text-white/70 text-sm sm:text-base max-w-2xl">Secure P2P rooms for labs, mock interviews, or lightning syncs. Invite, lock, and screen share without leaving your dashboard.</p>
					</div>
					<div className="relative grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
						{videoStats.map((stat) => (
							<div key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
								<p className="text-[11px] uppercase tracking-[0.3em] text-white/60">{stat.label}</p>
								<div className="mt-2 text-3xl font-semibold text-white">{stat.value}</div>
								<p className="text-xs text-white/50">{stat.meta}</p>
							</div>
						))}
					</div>
					<div className="relative grid gap-3 sm:grid-cols-3 mt-4">
						{videoSignals.map((signal) => (
							<div key={signal.title} className="rounded-2xl border border-white/5 bg-black/30 p-3 flex gap-3 items-start">
								<div className="h-10 w-10 rounded-xl bg-white/10 text-amber-200 flex items-center justify-center">
									<signal.icon className="w-4 h-4" />
								</div>
								<div className="min-w-0">
									<p className="text-sm text-white font-semibold">{signal.title}</p>
									<p className="text-xs text-white/60 leading-snug">{signal.description}</p>
								</div>
							</div>
						))}
					</div>
					<div className="relative flex flex-wrap gap-2 mt-4">
						<button onClick={() => go('Video Chat')} className="primary-btn px-5 py-2 text-sm">Open video pods</button>
						<button onClick={() => go('Chat')} className="ghost-btn px-5 py-2 text-sm">Share room link</button>
					</div>
				</div>
			</section>

			<section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
				<div className="glass-panel p-6 flex flex-col gap-4">
					<div className="flex items-center gap-3">
						<div className="h-12 w-12 rounded-2xl bg-amber-500/20 text-2xl font-semibold text-amber-200 flex items-center justify-center">
							{userName.charAt(0).toUpperCase()}
						</div>
						<div>
							<p className="text-sm text-white/60">Signed in as</p>
							<p className="text-lg font-semibold text-white">{userName}</p>
							{userEmail && <p className="text-xs text-white/50">{userEmail}</p>}
						</div>
					</div>
					<div className="grid grid-cols-2 gap-3 text-sm">
						<div className="rounded-2xl border border-white/10 bg-black/30 p-4">
							<p className="text-white/50">LeetCode progress</p>
							<div className="mt-2 text-2xl font-semibold text-white">{leetSolved}/{leetTotal}</div>
							<div className="mt-2 h-2 rounded-full bg-white/10 overflow-hidden">
								<div className="h-full bg-gradient-to-r from-amber-400 to-amber-600" style={{ width: `${leetPercent}%` }} />
							</div>
						</div>
						<div className="rounded-2xl border border-white/10 bg-black/30 p-4">
							<p className="text-white/50">Open todos</p>
							<div className="mt-2 text-2xl font-semibold text-white">{openTodos}</div>
							<p className="text-xs text-white/50">{completedTodos} completed</p>
						</div>
					</div>
					<button onClick={() => go('LeetCode')} className="text-left text-sm text-amber-200 hover:text-amber-100 inline-flex items-center gap-2">
						Peek practice board <ChevronRight className="w-4 h-4" />
					</button>
				</div>

				<div className="grid gap-5 sm:grid-cols-2">
					<div className="glass-panel p-5 flex flex-col gap-2 border-white/10">
						<p className="text-white/50 text-sm">Solved problems</p>
						<div className="text-3xl font-semibold text-white">{leetSolved}</div>
						<p className="text-xs text-white/40">{leetUnsolved} left this week</p>
					</div>
					<div className="glass-panel p-5 flex flex-col gap-2 border-white/10">
						<p className="text-white/50 text-sm">Saved tracks</p>
						<div className="text-3xl font-semibold text-white">{favoriteSongs.length}</div>
						<p className="text-xs text-white/40">Pinned inside Spotify tab</p>
					</div>
					<div className="glass-panel p-5 flex flex-col gap-2 border-white/10">
						<p className="text-white/50 text-sm">Quick todos</p>
						<div className="text-3xl font-semibold text-white">{openTodos}</div>
						<p className="text-xs text-white/40">{todoItems.length} total tracked</p>
					</div>
					<div className="glass-panel p-5 flex flex-col gap-2 border-white/10">
						<p className="text-white/50 text-sm">Pods spun up</p>
						<div className="text-3xl font-semibold text-white">3</div>
						<p className="text-xs text-white/40">Past 24 hours</p>
					</div>
				</div>
			</section>

			<section className="grid gap-6 lg:grid-cols-2">
				<div className="glass-panel p-6 space-y-4">
					<div className="flex items-center justify-between">
						<div>
							<p className="pill">Practice stack</p>
							<h3 className="text-2xl font-semibold text-white">LeetCode tracker</h3>
						</div>
						<button onClick={() => go('LeetCode')} className="ghost-btn text-sm">Open board</button>
					</div>
					<div className="space-y-3">
						{leetHighlights.length === 0 ? (
							<p className="text-sm text-white/60">All curated problems are solved — great job!</p>
						) : (
							leetHighlights.map((p) => (
								<div key={p.id} className="rounded-2xl border border-white/10 bg-black/20 p-4 flex items-center gap-3">
									<div className="h-8 w-8 rounded-xl bg-amber-400/10 text-amber-200 flex items-center justify-center text-xs uppercase">
										{p.difficulty.slice(0, 1)}
									</div>
									<div className="min-w-0">
										<p className="text-white font-medium truncate">{p.title}</p>
										<p className="text-xs text-white/40">{p.difficulty}</p>
									</div>
									<span className="ml-auto text-xs text-white/50">Queued</span>
								</div>
							))
						)}
					</div>
				</div>

				<div className="glass-panel p-6 space-y-4">
					<div className="flex items-center justify-between">
						<div>
							<p className="pill">Favorites</p>
							<h3 className="text-2xl font-semibold text-white">Saved songs</h3>
						</div>
						<button onClick={() => go('Spotify')} className="ghost-btn text-sm">Open Spotify</button>
					</div>
					{topSongs.length === 0 ? (
						<p className="text-sm text-white/60">No favorites yet. Save tracks from the Spotify tab to see them here.</p>
					) : (
						<div className="space-y-3">
							{topSongs.map((song, idx) => (
								<div key={`${song.title}-${idx}`} className="rounded-2xl border border-white/10 bg-black/20 p-4 flex items-center gap-3">
									<div className="text-lg font-semibold text-white/70 w-6 text-center">{idx + 1}</div>
									<div className="min-w-0">
										<p className="text-white font-medium truncate">{song.title}</p>
										<p className="text-xs text-white/50 truncate">{song.artist}</p>
									</div>
									<Heart className="w-4 h-4 text-red-400 ml-auto" />
								</div>
							))}
						</div>
					)}
				</div>
			</section>

			<section className="glass-panel p-6 space-y-4">
				<div className="flex items-center justify-between">
					<div>
						<p className="pill">Shortcuts</p>
						<h3 className="text-2xl font-semibold text-white">Launch anything instantly</h3>
						<p className="text-sm text-white/60">Navigate to core tools in a tap — BTech Buddy keeps favorite surfaces one hop away.</p>
					</div>
				</div>
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{shortcuts.map((shortcut) => (
						<button
							key={shortcut.section}
							onClick={() => go(shortcut.section)}
							className="rounded-2xl border border-white/10 bg-black/30 p-4 text-left hover:border-amber-400/40 transition"
						>
							<shortcut.icon className="w-5 h-5 text-amber-300" />
							<p className="mt-3 font-semibold text-white">{shortcut.label}</p>
							<p className="text-xs text-white/50">{shortcut.description}</p>
						</button>
					))}
				</div>
			</section>

			<section className="glass-panel p-6">
				<div className="flex items-center gap-3 mb-4">
					<ListChecks className="w-5 h-5 text-amber-300" />
					<div>
						<p className="pill mb-1">Quick Todos</p>
						<h3 className="text-xl font-semibold text-white">What’s next today</h3>
					</div>
				</div>
				{todoItems.length === 0 ? (
					<p className="text-sm text-white/60">Add action items from the sidebar todo widget — they’ll sync here automatically.</p>
				) : (
					<div className="space-y-2">
						{todoItems.slice(0, 4).map((todo, idx) => (
							<div key={`${todo.content}-${idx}`} className="rounded-xl border border-white/10 bg-black/20 p-3 flex items-center gap-3">
								<span className={`h-2.5 w-2.5 rounded-full ${todo.priority === 'high' ? 'bg-red-400' : todo.priority === 'medium' ? 'bg-yellow-400' : 'bg-emerald-400'}`} />
								<p className={`flex-1 text-sm ${todo.completed ? 'text-white/40 line-through' : 'text-white/80'}`}>{todo.content}</p>
								<span className={`text-xs ${todo.completed ? 'text-emerald-300' : 'text-white/40'}`}>{todo.completed ? 'Done' : 'Pending'}</span>
							</div>
						))}
					</div>
				)}
			</section>
		</div>
	);
}
