"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Eye, Edit } from "lucide-react";

interface MarkdownEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    rows?: number;
}

export default function MarkdownEditor({
    value,
    onChange,
    placeholder = "Écrivez votre message en Markdown...",
    rows = 6,
}: MarkdownEditorProps) {
    const [isPreview, setIsPreview] = useState(false);

    return (
        <div className="border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <button
                    type="button"
                    onClick={() => setIsPreview(false)}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                        !isPreview
                            ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-b-2 border-orange-500"
                            : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    }`}
                >
                    <Edit className="w-4 h-4" />
                    Éditer
                </button>
                <button
                    type="button"
                    onClick={() => setIsPreview(true)}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                        isPreview
                            ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-b-2 border-orange-500"
                            : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    }`}
                >
                    <Eye className="w-4 h-4" />
                    Aperçu
                </button>
            </div>

            {/* Content */}
            <div className="bg-white dark:bg-gray-900">
                {isPreview ? (
                    <div className="p-4 min-h-[150px] prose dark:prose-invert prose-sm max-w-none">
                        {value ? (
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {value}
                            </ReactMarkdown>
                        ) : (
                            <p className="text-gray-400 dark:text-gray-500 italic">Aucun contenu à prévisualiser</p>
                        )}
                    </div>
                ) : (
                    <textarea
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        rows={rows}
                        className="w-full p-4 focus:outline-none resize-none font-mono text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    />
                )}
            </div>

            {/* Help */}
            {!isPreview && (
                <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border-t border-gray-300 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Markdown:</span> **gras**, *italique*, [lien](url), `code`, ```bloc de code```
                </div>
            )}
        </div>
    );
}

