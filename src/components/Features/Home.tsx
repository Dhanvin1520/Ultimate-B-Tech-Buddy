import { useEffect, useState } from 'react';
import {
	Video,
	MessageCircle,
	Radio,
	BookOpen,
	Code,
	ListChecks,
	ArrowRight,
	Calendar,
	Clock,
	Gamepad2,
	Terminal,
	NotebookPen,
	Play,
	SkipBack,
	SkipForward
} from 'lucide-react';
import api from '../../lib/api';
import HeatMap from '../HeatMap';

// Typewriter Component
const Typewriter = ({ text, className }: { text: string; className?: string }) => {
	const [displayedText, setDisplayedText] = useState('');
	const [currentIndex, setCurrentIndex] = useState(0);

	useEffect(() => {
		if (currentIndex < text.length) {
			const timeout = setTimeout(() => {
				setDisplayedText((prev) => prev + text[currentIndex]);
				setCurrentIndex((prev) => prev + 1);
			}, 100); // Typing speed
			return () => clearTimeout(timeout);
		}
	}, [currentIndex, text]);

	return (
		<span className={`${className} inline-block`}>
			{displayedText}
			<span className="animate-pulse text-[var(--accent-color)]">_</span>
		</span>
	);
};

// Define types locally to avoid import issues
interface TodoItem {
	id: string;
	text: string;
	completed: boolean;
	priority?: 'low' | 'medium' | 'high';
}

interface HomeProps {
	setActiveSection: (section: string) => void;
}

const SAMPLE_TASKS: TodoItem[] = [
	{ id: 'sample-1', text: 'Complete React Project', completed: false, priority: 'high' },
	{ id: 'sample-2', text: 'Review DSA Notes', completed: true, priority: 'medium' },
	{ id: 'sample-3', text: 'Practice LeetCode', completed: false, priority: 'high' }
];

const TASK_PREVIEW_LIMIT = 4;
const GUEST_LEET_PROGRESS = { easy: 45, medium: 32, hard: 8 } as const;
const HOME_SPOTIFY_COVER = 'https://images.unsplash.com/photo-1470229538611-16ba8c7ffbd7?auto=format&fit=crop&w=900&q=80';

const normalizeTasks = (tasks: any[]): TodoItem[] =>
	tasks
		.filter(Boolean)
		.map((task, index) => ({
			id: String(task?._id || task?.id || `task-${index}`),
			text: task?.title || task?.content || task?.text || 'Untitled Task',
			completed: Boolean(task?.completed),
			priority: ['low', 'medium', 'high'].includes(task?.priority) ? task.priority : undefined,
		}));


export const Home = ({ setActiveSection }: HomeProps) => {
	// State Management
	const [userName, setUserName] = useState('User');
	const [todoItems, setTodoItems] = useState<TodoItem[]>([]);
	const [isSummaryLoading, setIsSummaryLoading] = useState(true);
	const [newTaskText, setNewTaskText] = useState('');
	const [isCreatingTask, setIsCreatingTask] = useState(false);
	const [taskLoadingMap, setTaskLoadingMap] = useState<Record<string, boolean>>({});

	const persistGuestTasks = (next: TodoItem[]) => {
		setTodoItems(next);
		localStorage.setItem('guest-tasks', JSON.stringify(next));
	};

	// Determine guest status early for state initialization
	const isGuest = localStorage.getItem('guest') === 'true';

	// LeetCode Progress - Dummy data for guests, real for logged-in users
	const [leetSolved, setLeetSolved] = useState(() =>
		isGuest ? { ...GUEST_LEET_PROGRESS } : { easy: 0, medium: 0, hard: 0 }
	);

	// Fetch real user data and personalized widgets for logged-in users
	useEffect(() => {
		const loadGuestSummary = () => {
			try {
				const storedTasks = localStorage.getItem('guest-tasks');
				if (storedTasks) {
					const parsed = JSON.parse(storedTasks);
					setTodoItems(normalizeTasks(parsed));
				} else {
					setTodoItems([...SAMPLE_TASKS]);
				}
			} catch {
				setTodoItems([...SAMPLE_TASKS]);
			}

			setLeetSolved({ ...GUEST_LEET_PROGRESS });
			setIsSummaryLoading(false);
		};

		if (isGuest) {
			loadGuestSummary();
			return;
		}

		let isActive = true;

		const fetchData = async () => {
			setIsSummaryLoading(true);
			try {
				const [tasksRes, lcRes, userRes] = await Promise.allSettled([
					api.get('/tasks'),
					api.get('/leetcode'),
					api.get('/auth/me'),
				]);

				if (!isActive) return;

				if (tasksRes.status === 'fulfilled' && Array.isArray(tasksRes.value.data)) {
					setTodoItems(normalizeTasks(tasksRes.value.data));
				} else {
					setTodoItems([]);
				}

				if (lcRes.status === 'fulfilled' && Array.isArray(lcRes.value.data)) {
					const solvedCounts = lcRes.value.data.reduce(
						(acc, problem) => {
							if (problem?.status !== 'solved') return acc;
							const key = String(problem?.difficulty || '').toLowerCase();
							if (key === 'easy') acc.easy += 1;
							else if (key === 'medium') acc.medium += 1;
							else if (key === 'hard') acc.hard += 1;
							return acc;
						},
						{ easy: 0, medium: 0, hard: 0 }
					);
					setLeetSolved(solvedCounts);
				}

				if (userRes.status === 'fulfilled' && userRes.value.data) {
					const profile = userRes.value.data;
					if (profile.username) {
						setUserName(profile.username);
					} else if (profile.name) {
						setUserName(profile.name);
					}
				}
			} catch (err) {
				console.error('Failed to load personalized widgets:', err);
			} finally {
				if (isActive) {
					setIsSummaryLoading(false);
				}
			}
		};

		fetchData();

		return () => {
			isActive = false;
		};
	}, [isGuest]);

	// Navigation Helper
	const go = (s: string) => {
		setActiveSection(s);
	};

	// Data Loading Effects
	useEffect(() => {
		const storedName = localStorage.getItem('chat_name');
		if (storedName) setUserName(storedName);
	}, []);



	// Feature Configuration
	const utilityFeatures = [
		{ title: 'Notes', description: 'Knowledge base.', icon: <NotebookPen className="w-5 h-5" /> },
		{ title: 'Calendar', description: 'Schedule sync.', icon: <Calendar className="w-5 h-5" /> },
		{ title: 'Tasks', description: 'Mission tracking.', icon: <ListChecks className="w-5 h-5" /> },
		{ title: 'LeetCode', description: 'Skill refinement.', icon: <Code className="w-5 h-5" /> },
		{ title: 'Timer', description: 'Focus enforcement.', icon: <Clock className="w-5 h-5" /> },
		{ title: 'Spotify', description: 'Audio environment.', icon: <Radio className="w-5 h-5" /> },
		{ title: 'Resume', description: 'Career profile.', icon: <BookOpen className="w-5 h-5" /> },
		{ title: 'Games', description: 'Neural recharge.', icon: <Gamepad2 className="w-5 h-5" /> },
	];

	const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
	const taskPreview = todoItems.slice(0, TASK_PREVIEW_LIMIT);
	const isTaskEmpty = !isSummaryLoading && taskPreview.length === 0;
	const totalSolved = leetSolved.easy + leetSolved.medium + leetSolved.hard;
	const canSubmitTask = newTaskText.trim().length > 0 && !isCreatingTask;

	const handleQuickTaskSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const trimmed = newTaskText.trim();
		if (!trimmed) return;

		if (isGuest) {
			const guestTask: TodoItem = { id: crypto.randomUUID(), text: trimmed, completed: false };
			persistGuestTasks([guestTask, ...todoItems]);
			setNewTaskText('');
			return;
		}

		setIsCreatingTask(true);
		try {
			const res = await api.post('/tasks', { title: trimmed, completed: false });
			const normalized = normalizeTasks([res.data])[0];
			if (normalized) {
				setTodoItems((prev) => [normalized, ...prev]);
			}
			setNewTaskText('');
		} catch (error) {
			console.error('Failed to add task from Home:', error);
		} finally {
			setIsCreatingTask(false);
		}
	};

	const handleToggleTask = async (taskId: string) => {
		const task = todoItems.find((t) => t.id === taskId);
		if (!task) return;
		const originalCompleted = task.completed;
		const nextCompleted = !originalCompleted;

		if (isGuest) {
			persistGuestTasks(todoItems.map((t) => (t.id === taskId ? { ...t, completed: nextCompleted } : t)));
			return;
		}

		setTaskLoadingMap((prev) => ({ ...prev, [taskId]: true }));
		setTodoItems((prev) => prev.map((t) => (t.id === taskId ? { ...t, completed: nextCompleted } : t)));

		try {
			await api.put(`/tasks/${taskId}`, { completed: nextCompleted });
		} catch (error) {
			console.error('Failed to toggle task:', error);
			setTodoItems((prev) => prev.map((t) => (t.id === taskId ? { ...t, completed: originalCompleted } : t)));
		} finally {
			setTaskLoadingMap((prev) => {
				const next = { ...prev };
				delete next[taskId];
				return next;
			});
		}
	};

	return (
		<div className="space-y-0 animate-fade-in pb-12">
			{/* Welcome Section - Top Left */}
			<section className="bg-[var(--bg-page)] pt-8 pb-6 px-6 border-b border-[var(--border-color)]">
				<div className="max-w-7xl mx-auto">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-6">
							{/* Terminal Icon */}
							<div className="relative group">
								<div className="w-20 h-20 rounded-xl bg-black border-2 border-gray-300 p-0.5 flex items-center justify-center">
									<Terminal className="w-10 h-10 text-white" />
								</div>
							</div>

							{/* Welcome Text - Bigger */}
							<div>
								<div className="flex items-center gap-3 mb-2">
									<span className="text-lg font-mono text-[var(--text-secondary)]">Welcome back,</span>
									<div className="px-3 py-1 bg-[rgba(0,32,255,0.05)] border border-[var(--accent-color)] text-[var(--accent-color)] text-xs font-mono font-bold uppercase tracking-wider">
										ONLINE
									</div>
								</div>
								<h1 className="text-5xl md:text-6xl font-bold">
									<Typewriter text={userName} className="heading-gamer" />
								</h1>
							</div>
						</div>

						{/* Login Button for Guests */}
						{isGuest && (
							<div className="flex flex-col items-end gap-2">
								<p className="text-[10px] font-mono font-bold text-red-500 uppercase tracking-widest animate-pulse">
									⚠ Restricted Access Mode
								</p>
								<button
									onClick={() => {
										localStorage.removeItem('guest');
										window.location.reload();
									}}
									className="relative group px-8 py-4 bg-black border-2 border-red-500 rounded-xl overflow-hidden hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,0,0,0.3)]"
								>
									<div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-400 opacity-0 group-hover:opacity-20 transition-opacity"></div>
									<div className="relative flex items-center gap-3">
										<div className="flex flex-col items-end">
											<span className="text-white font-bold font-mono uppercase tracking-wide text-sm">Login </span>
											<span className="text-[10px] text-red-500 font-mono uppercase tracking-widest">&gt;&gt; Access Full Features &lt;&lt;</span>
										</div>
										<Terminal className="w-6 h-6 text-white group-hover:rotate-12 transition-transform" />
									</div>
								</button>
							</div>
						)}
					</div>
				</div>
			</section>

			{/* Heat Map Section - Simplified */}
			<section
				className="bg-[var(--bg-page)] py-6 px-6 border-b border-[var(--border-color)] relative overflow-hidden"
				onMouseMove={(e) => {
					const rect = e.currentTarget.getBoundingClientRect();
					const x = ((e.clientX - rect.left) / rect.width) * 100;
					const y = ((e.clientY - rect.top) / rect.height) * 100;
					setMousePos({ x, y });
				}}
			>
				{/* Cursor Glow Effect */}
				<div
					className="absolute inset-0 pointer-events-none"
					style={{
						background: `radial-gradient(circle 600px at ${mousePos.x}% ${mousePos.y}%, rgba(0, 204, 255, 0.08), transparent 70%)`
					}}
				/>

				<div className="w-full relative z-10">
					<HeatMap weeks={52} />
				</div>
			</section>

			{/* Connect with Study Buddies */}
			<section className="py-8 px-6 border-b border-[var(--border-color)]">
				<div className="max-w-7xl mx-auto">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{/* Video Chat Card */}
						<button
							onClick={() => go('Video Chat')}
							className="card-entrance card-entrance-delay-1 group relative text-left overflow-hidden rounded-xl h-64 bg-black border-2 border-gray-800 hover:border-green-500 hover:scale-[1.02] transition-all duration-500"
						>
							<div className="absolute inset-0 bg-gradient-to-br from-gray-900/20 via-black to-gray-900/20 opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>

							{/* Animated Background Grid */}
							<div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_70%)]"></div>

							<div className="relative z-10 h-full p-6 flex flex-col justify-between">
								<div>
									<div className="flex items-center gap-3 mb-4">
										<div className="p-2 bg-gray-800 rounded-lg border border-gray-700 group-hover:border-gray-500 transition-colors">
											<Video className="w-8 h-8 text-white animate-pulse" />
										</div>
										<span className="px-3 py-1 bg-green-500/20 border border-green-500/50 text-green-400 text-xs font-mono font-bold uppercase tracking-wider animate-pulse">
											● LIVE NOW
										</span>
									</div>
									<h3 className="text-4xl font-bold mb-3 text-white tracking-tight transition-colors">
										Video Chat
									</h3>
									<div className="h-12">
										<p className="text-gray-400 font-mono text-sm leading-relaxed">
											<Typewriter text=">> Connect with buddies near you..." className="text-gray-300" />
										</p>
									</div>
								</div>
								<div className="flex items-center gap-2 text-white font-mono text-sm font-bold opacity-80 group-hover:opacity-100 group-hover:text-green-500 group-hover:scale-110 transition-all duration-300 origin-left">
									<span>INITIALIZE CONNECTION</span>
									<ArrowRight className="w-4 h-4" />
								</div>
							</div>
						</button>

						{/* Chat Card */}
						<button
							onClick={() => go('Chat')}
							className="card-entrance card-entrance-delay-2 group relative text-left overflow-hidden rounded-xl h-64 bg-black border-2 border-gray-800 hover:border-green-500 hover:scale-[1.02] transition-all duration-500"
						>
							<div className="absolute inset-0 bg-gradient-to-br from-gray-900/20 via-black to-gray-900/20 opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>

							{/* Animated Background Grid */}
							<div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_70%)]"></div>

							<div className="relative z-10 h-full p-6 flex flex-col justify-between">
								<div>
									<div className="flex items-center gap-3 mb-4">
										<div className="p-2 bg-gray-800 rounded-lg border border-gray-700 group-hover:border-gray-500 transition-colors">
											<MessageCircle className="w-8 h-8 text-white" />
										</div>
										<span className="px-3 py-1 bg-green-500/15 border border-green-400/60 text-green-300 text-xs font-mono font-bold uppercase tracking-wider">
											24/7 ONLINE
										</span>
									</div>
									<h3 className="text-4xl font-bold mb-3 text-white tracking-tight transition-colors">
										Chat
									</h3>
									<div className="h-12">
										<p className="text-gray-400 font-mono text-sm leading-relaxed">
											Join the community network.
											<span className="block text-gray-500 text-xs mt-1 animate-pulse">&gt;&gt;</span>
										</p>
									</div>
								</div>
								<div className="flex items-center gap-2 text-white font-mono text-sm font-bold opacity-80 group-hover:opacity-100 group-hover:text-green-500 group-hover:scale-110 transition-all duration-300 origin-left">
									<span>ENTER CHANNEL</span>
									<ArrowRight className="w-4 h-4" />
								</div>
							</div>
						</button>
					</div>
				</div>
			</section>

			{/* Todo List & Notes Snapshot */}
			<section className="py-8 px-6 border-b border-[var(--border-color)]">
				<div className="max-w-7xl mx-auto">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						<div className="swiss-card p-6 border-2 border-gray-300 shadow-[0_0_15px_rgba(200,200,200,0.15)]">
							<div className="flex items-center justify-between mb-6">
								<h2 className="heading-lg heading-gamer">My Tasks</h2>
								<button onClick={() => go('Tasks')} className="text-xs font-bold uppercase tracking-widest text-[var(--accent-color)] hover:opacity-80 transition-opacity">
									View All
								</button>
							</div>
							<form onSubmit={handleQuickTaskSubmit} className="flex flex-col gap-3 mb-4 sm:flex-row">
								<input
									value={newTaskText}
									onChange={(e) => setNewTaskText(e.target.value)}
									placeholder={isGuest ? 'Add a quick task (guest)' : 'Add a quick task'}
									className="input-swiss flex-1"
								/>
								<button
									type="submit"
									className="btn-primary h-[46px]"
									disabled={!canSubmitTask}
								>
									{isCreatingTask ? 'Adding...' : 'Add Task'}
								</button>
							</form>
							{isSummaryLoading ? (
								<p className="text-center text-[var(--text-tertiary)] text-sm py-6">Loading tasks...</p>
							) : isTaskEmpty ? (
								<p className="text-center text-[var(--text-tertiary)] text-sm py-6">No tasks yet. Add one from the Tasks panel.</p>
							) : (
								<div className="space-y-3">
									{taskPreview.map((item) => (
										<div key={item.id} className="flex items-center gap-4 p-4 border border-[var(--border-color)] hover:bg-[var(--bg-subtle)] transition-colors">
											<input
												type="checkbox"
												onChange={() => handleToggleTask(item.id)}
												checked={item.completed}
												disabled={Boolean(taskLoadingMap[item.id])}
												className="w-5 h-5 rounded-none border-2 border-[var(--text-secondary)] disabled:opacity-50"
											/>
											<span className={`flex-1 font-medium ${item.completed ? 'line-through text-[var(--text-tertiary)]' : 'text-[var(--text-primary)]'}`}>
												{item.text}
											</span>
											{item.priority && (
												<span className={`px-2 py-0.5 text-xs font-mono font-bold uppercase ${item.priority === 'high' ? 'bg-red-500 text-white' :
													item.priority === 'medium' ? 'bg-yellow-500 text-black' :
														'bg-green-500 text-white'
													}`}>{item.priority}</span>
											)}
										</div>
									))}
								</div>
							)}
						</div>

						<div className="swiss-card p-6 border-2 border-gray-300 shadow-[0_0_15px_rgba(200,200,200,0.15)] flex flex-col gap-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)]">Soundstage</p>
									<h2 className="heading-lg heading-gamer">Focus Flow Mix</h2>
								</div>
								<button
									type="button"
									onClick={() => go('Spotify')}
									className="btn-primary text-xs font-bold uppercase tracking-widest"
								>
									Open Spotify
								</button>
							</div>

							<button
								type="button"
								onClick={() => go('Spotify')}
								className="relative h-64 w-full overflow-hidden border border-[var(--border-color)] group"
							>
								<img
									src={HOME_SPOTIFY_COVER}
									alt="Focus Flow cover art"
									className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
								/>
								<div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
								<div className="relative z-10 h-full w-full p-5 flex flex-col justify-end text-left">
									<p className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/70">Ambient Coding Session</p>
									<h3 className="text-3xl font-semibold text-white">Focus Flow</h3>
									<p className="text-sm text-white/80">45 min synthwave + lofi blend curated for deep work</p>
								</div>
							</button>

							<div className="flex flex-col gap-4">
								<div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-[var(--text-tertiary)]">
									<span>Focus Level · 92%</span>
									<span>7 tracks queued</span>
								</div>
								<div className="flex items-center justify-center gap-6">
									<button
										type="button"
										onClick={() => go('Spotify')}
										className="p-3 border border-[var(--border-color)] rounded-full text-[var(--text-secondary)] hover:text-[var(--accent-color)]"
									>
										<SkipBack className="w-5 h-5" />
									</button>
									<button
										type="button"
										onClick={() => go('Spotify')}
										className="w-16 h-16 rounded-full btn-primary flex items-center justify-center"
									>
										<Play className="w-6 h-6 ml-1" />
									</button>
									<button
										type="button"
										onClick={() => go('Spotify')}
										className="p-3 border border-[var(--border-color)] rounded-full text-[var(--text-secondary)] hover:text-[var(--accent-color)]"
									>
										<SkipForward className="w-5 h-5" />
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* LeetCode Tracker */}
			<section className="py-8 px-6 border-b border-[var(--border-color)]">
				<div className="max-w-7xl mx-auto">
					<div className="swiss-card p-6 border-2 border-gray-300 shadow-[0_0_15px_rgba(200,200,200,0.15)]">
						<div className="flex items-center justify-between mb-6">
							<h2 className="heading-lg heading-gamer">LeetCode Progress</h2>
							<div className="px-3 py-1 bg-green-500 text-white text-xs font-mono font-bold uppercase">
								{isGuest ? 'DEMO' : 'LIVE'}
							</div>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
							{/* Easy Problems */}
							<div className="space-y-3">
								<div className="flex items-center justify-between">
									<span className="text-sm font-bold text-green-600">Easy</span>
									<span className="text-sm font-mono font-bold">{leetSolved.easy}/749</span>
								</div>
								<div className="h-2 bg-gray-200 rounded-full overflow-hidden">
									<div
										className="h-full bg-green-500 transition-all duration-500"
										style={{ width: `${(leetSolved.easy / 749) * 100}%` }}
									></div>
								</div>
							</div>

							{/* Medium Problems */}
							<div className="space-y-3">
								<div className="flex items-center justify-between">
									<span className="text-sm font-bold text-yellow-600">Medium</span>
									<span className="text-sm font-mono font-bold">{leetSolved.medium}/1563</span>
								</div>
								<div className="h-2 bg-gray-200 rounded-full overflow-hidden">
									<div
										className="h-full bg-yellow-500 transition-all duration-500"
										style={{ width: `${(leetSolved.medium / 1563) * 100}%` }}
									></div>
								</div>
							</div>

							{/* Hard Problems */}
							<div className="space-y-3">
								<div className="flex items-center justify-between">
									<span className="text-sm font-bold text-red-600">Hard</span>
									<span className="text-sm font-mono font-bold">{leetSolved.hard}/688</span>
								</div>
								<div className="h-2 bg-gray-200 rounded-full overflow-hidden">
									<div
										className="h-full bg-red-500 transition-all duration-500"
										style={{ width: `${(leetSolved.hard / 688) * 100}%` }}
									></div>
								</div>
							</div>
						</div>

						{/* Total Progress */}
						<div className="mt-6 pt-6 border-t border-[var(--border-color)]">
							<div className="flex items-center justify-between mb-3">
								<span className="font-bold text-[var(--text-primary)]">Total Solved</span>
								<span className="text-2xl font-mono font-bold heading-gamer">
									{totalSolved}/3000
								</span>
							</div>
							<div className="h-3 bg-gray-200 rounded-full overflow-hidden">
								<div
									className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 transition-all duration-500"
									style={{ width: `${(totalSolved / 3000) * 100}%` }}
								></div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Shortcuts Grid */}
			<section className="py-8 px-6">
				<div className="max-w-7xl mx-auto">
					<h2 className="heading-lg heading-gamer mb-6">Quick Access</h2>
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
						{utilityFeatures.map((feature) => (
							<button
								key={feature.title}
								onClick={() => go(feature.title)}
								className="group p-6 bg-[var(--bg-page)] border-2 border-gray-300 shadow-[0_0_15px_rgba(200,200,200,0.15)] hover:shadow-[0_0_25px_rgba(0,204,255,0.3)] transition-all hover:scale-105 rounded-lg"
							>
								<div className="flex flex-col items-center gap-3 text-center">
									<div className="text-[var(--accent-color)] group-hover:scale-110 transition-transform">
										{feature.icon}
									</div>
									<div>
										<h3 className="font-bold text-sm uppercase tracking-tight font-mono">{feature.title}</h3>
										<p className="text-xs text-[var(--text-tertiary)] mt-1">{feature.description}</p>
									</div>
								</div>
							</button>
						))}
					</div>
				</div>
			</section>
		</div>
	);
};

// Default export to match Dashboard.tsx import
export default Home;
