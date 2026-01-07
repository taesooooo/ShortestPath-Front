import { LuMapPin } from "react-icons/lu";

const MarkerControl = ({ onStartMarker, onEndMarker }) => {
    return (
        <div className="flex flex-row items-center justify-center gap-4">
            <div className="flex items-center gap-1 px-2 py-1 text-blue-400 hover:rounded-lg hover:bg-gray-300" onClick={(e) => onStartMarker(e)}>
                <LuMapPin className="w-6 h-6 block" />
                <span className="leading-none">출발</span>
            </div>

            <div className="flex items-center gap-1 px-2 py-1 text-red-400 hover:rounded-lg hover:bg-gray-300" onClick={(e) => onEndMarker(e)}>
                <LuMapPin className="w-6 h-6 block" />
                <span className="leading-none">도착</span>
            </div>
        </div>
    );
};

export default MarkerControl;
