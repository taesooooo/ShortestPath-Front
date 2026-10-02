import { LuLoaderCircle } from "react-icons/lu";

const LoadingOverlay = ({ isOpen, title = "불러오는 중이에요", description, statusText = title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-5 backdrop-blur-[2px]" role="status" aria-live="polite" aria-busy="true">
            <div className="w-full max-w-sm rounded-3xl border border-white/70 bg-white/95 px-8 py-9 text-center shadow-2xl shadow-slate-950/20">
                {children ?? (
                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 text-blue-600" aria-hidden="true">
                        <LuLoaderCircle className="animate-spin" size={36} />
                    </div>
                )}

                <h2 className="text-lg font-bold tracking-tight text-slate-900">{title}</h2>
                {description && <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>}

                <div className="mt-6 flex items-center justify-center gap-1.5" aria-hidden="true">
                    <span className="loading-bounce h-2 w-2 rounded-full bg-blue-600" />
                    <span className="loading-bounce h-2 w-2 rounded-full bg-blue-500 [animation-delay:150ms]" />
                    <span className="loading-bounce h-2 w-2 rounded-full bg-blue-400 [animation-delay:300ms]" />
                </div>
                <span className="sr-only">{statusText}</span>
            </div>
        </div>
    );
};

export default LoadingOverlay;
