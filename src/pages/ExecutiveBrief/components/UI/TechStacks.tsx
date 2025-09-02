interface TechStacksProps {
  stacks: {
    languages: string[];
    frameworks: string[];
    technologies: string[];
    skills: string[];
  };
}

interface TechCategoryProps {
  label: string;
  items: string[];
}

function TechCategory({ label, items }: TechCategoryProps) {
  if (items.length === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-green-400 font-mono text-xs">{label}:</span>
      <div className="flex flex-wrap gap-1">
        {items.map((tech, i) => (
          <span
            key={i}
            className="border border-green-500/40 text-green-300 px-2 py-0.5 rounded text-[10px]"
          >
            {tech}
          </span>
        ))}
      </div>
    </div>
  );
}

export function TechStacks({ stacks }: TechStacksProps) {
  return (
    <div>
      <div className="flex flex-col gap-3">
        <TechCategory label="Languages" items={stacks.languages} />
        <TechCategory label="Frameworks" items={stacks.frameworks} />
        <TechCategory label="Technologies" items={stacks.technologies} />
        <TechCategory label="Skills" items={stacks.skills} />
      </div>
    </div>
  );
}