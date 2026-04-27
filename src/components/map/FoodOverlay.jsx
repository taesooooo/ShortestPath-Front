import { forwardRef } from "react";
import { LuMapPin } from "react-icons/lu";

const FoodOverlay = forwardRef((props, ref) => {
    const { visibleInfo, onStartMarker, onEndMarker } = props;
    return (
        <div ref={ref} className={`flex flex-col bg-white rounded-lg p-2 ${visibleInfo ? "block" : "hidden"}`}>
            <h3 className="text-lg font-semibold text-black border-b border-gray-400">{visibleInfo?.bplcNm}</h3>
            <div className="flex flex-col w-60">
                <p className="text-black text-xs my-2">{visibleInfo?.rdnWhlAddr}</p>
                <p className="text-black text-end text-xs">Tel:{visibleInfo?.telNo || "-"}</p>
                <div className="flex flex-row items-center justify-center gap-4">
                    <div className="flex items-center gap-1 px-2 py-1 text-blue-400 hover:rounded-lg hover:bg-gray-300" onClick={(e) => onStartMarker(true)}>
                        <LuMapPin className="w-6 h-6 block" />
                        <span className="leading-none">출발</span>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 text-red-400 hover:rounded-lg hover:bg-gray-300" onClick={(e) => onEndMarker(true)}>
                        <LuMapPin className="w-6 h-6 block" />
                        <span className="leading-none">도착</span>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default FoodOverlay;
