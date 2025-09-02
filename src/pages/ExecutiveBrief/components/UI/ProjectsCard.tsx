import type { Resume } from '../../types/resume';

interface ProjectsCardProps {
  resume: Resume | null;
}

export function ProjectsCard({ resume }: ProjectsCardProps) {
  if (!resume?.projects || resume.projects.length === 0) {
    return null;
  }

  return (
    <div>
      <div className="space-y-4">
        {resume.projects.map((project, index) => (
          <div key={index} className="border-l-2 border-green-500/40 pl-4">
            <div className="text-green-400 font-mono text-sm font-semibold">
              {project.name}
            </div>
            {project.description && (
              <div className="text-gray-300 text-xs mt-1 mb-2">
                {project.description}
              </div>
            )}
            {project.highlights && project.highlights.length > 0 && (
              <ul className="space-y-1">
                {project.highlights.map((highlight, idx) => (
                  <li key={idx} className="text-gray-400 text-xs flex items-start">
                    <span className="text-green-500 mr-2 font-mono">►</span>
                    {highlight}
                  </li>
                ))}
              </ul>
            )}
            {project.keywords && project.keywords.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {project.keywords.map((keyword, idx) => (
                  <span 
                    key={idx}
                    className="text-green-400 bg-green-500/10 px-2 py-0.5 rounded text-[10px] font-mono border border-green-500/30"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}