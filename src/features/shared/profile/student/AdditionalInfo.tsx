import { Award, Github, Linkedin, ExternalLink } from "lucide-react";

interface Info {
  github: string;
  linkedin: string;
  certificates: string[];
  activities: string[];
}

export const AdditionalInfo = ({ info }: { info: Info }) => (
  <div className="bg-white shadow rounded-lg p-4 space-y-4">
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Award className="h-5 w-5" />
        <h3 className="font-semibold text-lg">Thông tin bổ sung</h3>
      </div>
      <div className="space-y-2">
        <a 
          href={`https://${info.github}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition"
        >
          <Github className="h-4 w-4" /> GitHub
          <ExternalLink className="h-3 w-3" />
        </a>
        <a 
          href={`https://${info.linkedin}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition"
        >
          <Linkedin className="h-4 w-4" /> LinkedIn
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>

    <div>
      <h4 className="font-medium mb-1">Chứng chỉ</h4>
      <div className="flex flex-wrap gap-2">
        {info.certificates.map((cert, idx) => (
          <span key={idx} className="px-2 py-1 bg-gray-100 rounded text-xs">{cert}</span>
        ))}
      </div>
    </div>

    <div>
      <h4 className="font-medium mb-1">Hoạt động & Thành tích</h4>
      <ul className="list-disc list-inside text-sm text-gray-500">
        {info.activities.map((act, idx) => (
          <li key={idx}>{act}</li>
        ))}
      </ul>
    </div>
  </div>
);
