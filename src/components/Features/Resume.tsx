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
    <div className="swiss-card p-8 space-y-8">
      <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-1">NST Careers</p>
          <h2 className="heading-xl">Resume Builder</h2>
        </div>
        <div className="px-4 py-2 text-xs font-bold uppercase tracking-widest border border-[var(--border-strong)] text-[var(--text-primary)]">
          Designed by me
        </div>
      </div>

      <div className="grid gap-6">
        {resumeLinks.map((resume, index) => (
          <div key={index} className="p-6 border border-[var(--border-color)] hover:border-[var(--text-primary)] transition-colors">
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div>
                <h3 className="text-xl font-bold text-[var(--text-primary)]">{resume.title}</h3>
                <p className="text-sm font-medium text-[var(--text-secondary)] mt-2 max-w-md leading-relaxed">{resume.description}</p>
              </div>
              <a
                href={resume.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Open Link</span>
              </a>
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 bg-[var(--bg-subtle)] border border-[var(--border-color)]">
        <div className="mb-4 flex items-center gap-3 text-[var(--text-primary)]">
          <FileText className="w-5 h-5" />
          <h3 className="font-bold text-lg">Tips for a Great Resume</h3>
        </div>
        <ul className="space-y-3 text-[var(--text-secondary)] list-disc list-inside text-sm font-medium">
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