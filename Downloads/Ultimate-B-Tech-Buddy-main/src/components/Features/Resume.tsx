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
    <div className="bg-gray-800 p-6 rounded-xl">
      <h2 className="text-xl font-semibold text-white mb-6">Resume Builder-Designed by Me </h2>
      
      <div className="grid gap-4">
        {resumeLinks.map((resume, index) => (
          <div key={index} className="bg-gray-700 p-4 rounded-lg">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-white font-medium">{resume.title}</h3>
                <p className="text-gray-400 text-sm mt-1">{resume.description}</p>
              </div>
              <a
                href={resume.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Link</span>
              </a>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-gray-700 rounded-lg">
        <div className="flex items-center gap-3 text-white mb-3">
          <FileText className="w-5 h-5" />
          <h3 className="font-medium">Tips for a Great Resume</h3>
        </div>
        <ul className="space-y-2 text-gray-300 list-disc list-inside">
          <li>Keep it concise and relevant</li>
          <li>Highlight your achievements with metrics</li>
          <li>Use action verbs to describe your experience</li>
          <li>Tailor your resume for each job application</li>
          <li>Proofread carefully for errors</li>
        </ul>
      </div>
    </div>
  );
}