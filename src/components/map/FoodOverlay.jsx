import { forwardRef } from "react";
import { LuExternalLink, LuMapPin, LuPhone } from "react-icons/lu";

const getHomepageUrl = (homepage) => {
    if (!homepage) return null;

    const url = /^https?:\/\//i.test(homepage) ? homepage : `https://${homepage}`;

    try {
        const parsedUrl = new URL(url);
        return ["http:", "https:"].includes(parsedUrl.protocol) ? parsedUrl.href : null;
    } catch {
        return null;
    }
};

const FoodOverlay = forwardRef((props, ref) => {
    const { visibleInfo, onStartMarker, onEndMarker } = props;
    const homepageUrl = getHomepageUrl(visibleInfo?.hpg);

    return (
        <div ref={ref} className={`flex flex-col bg-white rounded-lg p-3 shadow-lg ${visibleInfo ? "block" : "hidden"}`}>
            <div className="flex items-start justify-between gap-3 border-b border-gray-200 pb-2">
                <div>
                    <h3 className="text-base font-semibold text-gray-900">{visibleInfo?.bplcNm}</h3>
                    {visibleInfo?.bzstatSeNm && <p className="mt-0.5 text-xs text-gray-500">{visibleInfo.bzstatSeNm}</p>}
                </div>
                {visibleInfo?.salsSttsNm && (
                    <span className={`shrink-0 rounded px-2 py-1 text-xs ${visibleInfo.salsSttsNm === "영업/정상" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                        {visibleInfo.salsSttsNm}
                    </span>
                )}
            </div>
            <div className="flex w-72 flex-col gap-2 pt-2">
                {visibleInfo?.roadNmAddr && (
                    <p className="flex items-start gap-1.5 text-xs leading-5 text-gray-700">
                        <LuMapPin className="mt-0.5 shrink-0" size={14} />
                        <span>{visibleInfo.roadNmAddr}</span>
                    </p>
                )}
                {visibleInfo?.telno && (
                    <a className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-blue-600" href={`tel:${visibleInfo.telno}`}>
                        <LuPhone size={14} />
                        {visibleInfo.telno}
                    </a>
                )}
                {homepageUrl && (
                    <a className="flex items-center gap-1.5 text-xs text-blue-600 hover:underline" href={homepageUrl} target="_blank" rel="noreferrer">
                        <LuExternalLink size={14} />
                        홈페이지
                    </a>
                )}
                <div className="mt-1 flex flex-row items-center justify-center gap-4 border-t border-gray-100 pt-2">
                    <button type="button" className="flex items-center gap-1 rounded-lg px-2 py-1 text-blue-500 hover:bg-gray-100" onClick={() => onStartMarker(true)}>
                        <LuMapPin className="w-6 h-6 block" />
                        <span className="leading-none">출발</span>
                    </button>
                    <button type="button" className="flex items-center gap-1 rounded-lg px-2 py-1 text-red-500 hover:bg-gray-100" onClick={() => onEndMarker(true)}>
                        <LuMapPin className="w-6 h-6 block" />
                        <span className="leading-none">도착</span>
                    </button>
                </div>
            </div>
        </div>
    );
});

export default FoodOverlay;
