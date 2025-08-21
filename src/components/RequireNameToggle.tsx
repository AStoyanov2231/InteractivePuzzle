import React, { useEffect, useState } from "react";

interface RequireNameToggleProps {
	className?: string;
}

/**
 * Small toggle controlling whether a username is required before solo games.
 * Persists preference in localStorage under 'requireUsernameForSolo'.
 */
export const RequireNameToggle: React.FC<RequireNameToggleProps> = ({ className = "" }) => {
	const [isRequired, setIsRequired] = useState<boolean>(() => {
		const stored = localStorage.getItem("requireUsernameForSolo");
		return stored === null ? true : stored === "true";
	});

	useEffect(() => {
		localStorage.setItem("requireUsernameForSolo", String(isRequired));
	}, [isRequired]);

	return (
		<div className={`flex items-center gap-2 bg-white/60 hover:bg-white/80 active:bg-white/90 backdrop-blur-sm border border-white/30 rounded-2xl px-3 py-2 shadow-lg transition-all duration-200 ${className}`} title="Изисквай име преди игра">
			<span className="text-xs font-medium text-gray-700 select-none">Оценяване</span>
			<button
				aria-label={isRequired ? "Името е задължително" : "Името не е задължително"}
				className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ${isRequired ? "bg-blue-500" : "bg-gray-300"}`}
				onClick={() => setIsRequired(prev => !prev)}
			>
				<span
					className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${isRequired ? "translate-x-5" : "translate-x-1"}`}
				/>
			</button>
		</div>
	);
};

export default RequireNameToggle;


