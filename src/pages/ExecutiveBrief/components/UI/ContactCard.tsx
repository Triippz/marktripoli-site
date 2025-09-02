import type { Resume, Profile } from '../../types/resume';

interface ContactCardProps {
  resume?: Resume | null;
  profile?: Profile | null;
}

export function ContactCard({ resume, profile }: ContactCardProps) {
  return (
    <div className="tactical-glass p-4">
      <div className="text-green-400 font-mono text-xs mb-2">Contact</div>
      <div className="text-xs font-mono space-y-1">
        <div>
          Email:{' '}
          <a
            className="text-green-300 hover:text-green-200"
            href={`mailto:${profile?.contact?.email || resume?.basics?.email}`}
          >
            {profile?.contact?.email || resume?.basics?.email}
          </a>
        </div>
        {profile?.contact?.website && (
          <div>
            Web:{' '}
            <a
              className="text-green-300 hover:text-green-200"
              href={profile.contact.website}
              target="_blank"
              rel="noopener noreferrer"
            >
              {profile.contact.website}
            </a>
          </div>
        )}
        {profile?.contact?.linkedin && (
          <div>
            LinkedIn:{' '}
            <a
              className="text-green-300 hover:text-green-200"
              href={profile.contact.linkedin}
              target="_blank"
              rel="noopener noreferrer"
            >
              Profile
            </a>
          </div>
        )}
        {profile?.contact?.github && (
          <div>
            GitHub:{' '}
            <a
              className="text-green-300 hover:text-green-200"
              href={profile.contact.github}
              target="_blank"
              rel="noopener noreferrer"
            >
              Repos
            </a>
          </div>
        )}
      </div>
    </div>
  );
}