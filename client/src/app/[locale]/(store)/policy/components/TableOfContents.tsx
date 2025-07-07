// src/app/[locale]/(store)/policy/components/TableOfContents.tsx
"use client";

import { useTranslations } from "next-intl";

interface Section {
  id: string;
  title: string;
}

export default function TableOfContents({ sections }: { sections: Section[] }) {
  const t = useTranslations("policy");

  // Simple click handler to scroll to section
  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      // Update URL
      window.history.pushState(null, '', `#${id}`);
      
      // Scroll element into view with offset for header
      window.scrollTo({
        top: element.offsetTop - 100,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xs border border-gray-200 dark:border-gray-700">
      <h2 className="font-semibold mb-3 text-lg">{t("tableOfContents")}</h2>
      <nav>
        <ul className="space-y-1">
          {sections.map((section) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                onClick={(e) => handleLinkClick(e, section.id)}
                className="block py-1 px-2 text-sm rounded transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {section.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}