import { LuArrowLeftFromLine, LuMapPin } from "react-icons/lu";

const SidebarHeader = ({ onClose }) => {
    return (
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <LuMapPin className="text-red-500" />
                음식점 찾기
            </h1>
            <button onClick={onClose} className="border rounded-md p-1 hover:bg-gray-100 transition-colors cursor-pointer" title="사이드바 닫기">
                <LuArrowLeftFromLine size={26} className="text-gray-500" />
            </button>
        </div>
    );
};

export default SidebarHeader;
