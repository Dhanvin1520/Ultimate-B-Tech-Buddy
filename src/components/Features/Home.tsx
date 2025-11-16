import { MessageCircle, NotebookPen, Radio, Video } from 'lucide-react';

const quickLinks = [

	{
		label: 'Launch chat',
		description: 'Open NST Commons and sync the whole batch.',
		icon: MessageCircle,
	},
	{
		label: 'Start a video pod',
		description: 'Hop into the peer-to-peer lounge for lab prep.',
		icon: Video,
	},
	{
		label: 'Capture quick notes',
		description: 'Drop lab takeaways or sprint todos before you forget.',
		icon: NotebookPen,
	},
	{
		label: 'Listen together',
		description: 'Play the lo-fi playlist from the Spotify tab.',
		icon: Radio,
	},
];

export default function Home() {
	return (
		<div className="space-y-6">
			<section className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-2xl p-6">
				<p className="text-xs uppercase tracking-widest text-slate-500">Ultimate B-Tech Buddy</p>
				<h1 className="text-3xl font-semibold text-slate-900 mt-2">Your campus operating system</h1>
				<p className="text-slate-600 mt-3 max-w-2xl">
					Jump between chat, video pods, tasks, notes, music, and quizzes without leaving one workspace.
					Pick a tab on the left to get into flow faster.
				</p>
			</section>

			<section className="grid gap-4 md:grid-cols-2">
				{quickLinks.map(({ label, description, icon: Icon }) => (
					<article key={label} className="flex items-start gap-4 bg-white rounded-2xl border border-slate-200 p-4">
						<div className="h-10 w-10 rounded-xl bg-slate-900/10 text-slate-900 flex items-center justify-center">
							<Icon className="w-5 h-5" />
						</div>
						<div>
							<h3 className="text-base font-semibold text-slate-900">{label}</h3>
							<p className="text-sm text-slate-600">{description}</p>
						</div>
					</article>
				))}
			</section>
		</div>
	);
}
