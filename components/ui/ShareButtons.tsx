"use client";
import { useState } from 'react';
import { Twitter, Linkedin, Users } from 'lucide-react';

export default function Footer() {
    const [copyMessage, setCopyMessage] = useState('');
    const toolUrl = 'https://the-ripper-omega.vercel.app/';
    const shareText = `Just saw this AI tool which can detect hallucinations in your content, seems cool \n\n${toolUrl}`;

    const shareOnTwitter = () => {
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
        window.open(twitterUrl, '_blank');
    };

    const shareOnLinkedIn = () => {
        const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(toolUrl)}`;
        window.open(linkedinUrl, '_blank');
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(toolUrl);
            setCopyMessage('Copied! Now share the link with your team 🚀');
            setTimeout(() => setCopyMessage(''), 3000);
        } catch (err) {
            setCopyMessage('Failed to copy');
        }
    };

    return (
        <footer className="mt-20 pt-8 border-t-4 border-brand-default">
            <div className="max-w-4xl mx-auto px-6 space-y-8">
                {/* Share Buttons */}
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <button
                        onClick={shareOnTwitter}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-[#1DA1F2] text-white rounded-none hover:bg-[#1a8cd8] transition-colors duration-200"
                    >
                        <Twitter size={20} />
                        <span>Share on Twitter</span>
                    </button>

                    <button
                        onClick={shareOnLinkedIn}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-[#0A66C2] text-white rounded-none hover:bg-[#094d92] transition-colors duration-200"
                    >
                        <Linkedin size={20} />
                        <span>Share on LinkedIn</span>
                    </button>

                    <button
                        onClick={copyToClipboard}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-800 text-white rounded-none hover:bg-gray-700 transition-colors duration-200"
                    >
                        <Users size={20} />
                        <span>Share with Your Team</span>
                    </button>
                </div>

                {copyMessage && (
                    <div className="text-center text-green-600 font-medium animate-fade-up">
                        {copyMessage}
                    </div>
                )}

                {/* Made by Drew */}
                <div className="flex items-center justify-between pt-6 border-t-2 border-brand-faint">
                    <div className="flex items-center gap-3">
                        <svg
                            width="32"
                            height="32"
                            viewBox="0 0 32 32"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="flex-shrink-0"
                        >
                            <rect x="4" y="4" width="24" height="24" fill="#254bf1"/>
                            <rect x="8" y="8" width="8" height="8" fill="white"/>
                            <rect x="16" y="16" width="8" height="8" fill="white"/>
                            <rect x="8" y="20" width="4" height="4" fill="white"/>
                            <rect x="20" y="8" width="4" height="4" fill="white"/>
                        </svg>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold tracking-tight uppercase text-brand-dark">Made by</span>
                            <span className="text-2xl font-black tracking-tighter leading-none text-brand-default">DREW</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-xs font-mono text-brand-muted tracking-widest uppercase">
                            2026
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
}