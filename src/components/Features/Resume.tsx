import { FileText, Download } from 'lucide-react';

export default function Resume() {
  const resumeLinks = [
    {
      title: "Template",
      description: "Perfect for freshers can generate and downlaod the resume(open the link) ",
      url: "https://vin-resume-builder-667cae.netlify.app/"
    },
  ];

  return (
    <div className="glass-panel p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-white/40">NST Careers</p>
          <h2 className="panel-title text-3xl">Resume Builder</h2>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70">
          Designed by me
        </div>
      </div>

      <div className="grid gap-4">
        {resumeLinks.map((resume, index) => (
          <div key={index} className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-white">{resume.title}</h3>
                <p className="text-sm text-white/60 mt-2">{resume.description}</p>
              </div>
              <a
                href={resume.url}
                target="_blank"
                rel="noopener noreferrer"
                className="primary-btn"
              >
                <Download className="w-4 h-4" />
                <span>Open Link</span>
              </a>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
        <div className="mb-3 flex items-center gap-3 text-white">
          <FileText className="w-5 h-5" />
          <h3 className="font-medium">Tips for a Great Resume</h3>
        </div>
        <ul className="space-y-2 text-white/70 list-disc list-inside">
          <li>Keep it concise and relevant</li>
          <li>Highlight your achievements with metrics</li>
          <li>Use action verbs to describe your experience</li>
          <li>Tailor each resume to the role</li>
          <li>Proofread carefully for errors</li>
        </ul>
      </div>
    </div>
  );
}