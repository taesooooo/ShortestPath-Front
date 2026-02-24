import { LuSearch } from "react-icons/lu";

const SidebarSearchArea = ({ inputAddress, onInputChange, onSearch, onKeyPress, loading }) => {
    return (
        <div className="p-2 border-b border-gray-200">
            <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">주소 입력</label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={inputAddress}
                        onChange={onInputChange}
                        onKeyPress={onKeyPress}
                        placeholder="검색할 주소를 입력하세요"
                        className="flex-1 px-1 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black text-sm"
                    />
                    <button onClick={onSearch} disabled={loading} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition-colors flex items-center gap-2">
                        <LuSearch size={18} />
                        찾기
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SidebarSearchArea;
