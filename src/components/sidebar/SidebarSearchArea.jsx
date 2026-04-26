import { LuSearch } from "react-icons/lu";

const SidebarSearchArea = ({ keyword, onkeywordChange, onSearch, onKeyPress, onCategoryChange, loading }) => {
    return (
        <div className="p-2 border-b border-gray-200">
            <div className="space-y-3">
                <div className="flex flex-row items-center justify-between">
                    <label className="block text-sm font-semibold text-gray-700">주소 입력</label>
                    <div className="flex items-center gap-4">
                        <label className="text-sm font-semibold text-gray-700">카테고리</label>
                        <select
                            className="mt-1 block w-20 px-3 py-2 text-black bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                            defaultValue="전체"
                            onChange={(e) => onCategoryChange(e.target.value)}
                        >
                            <option value="전체">전체</option>
                            <option value="한식">한식</option>
                            <option value="중식">중식</option>
                            <option value="일식">일식</option>
                            <option value="양식">양식</option>
                            <option value="패스트푸드">패스트푸드</option>
                        </select>
                    </div>
                </div>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={keyword}
                        onChange={(e) => onkeywordChange(e.target.value)}
                        onKeyPress={onKeyPress}
                        placeholder="검색어를 입력하세요."
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
