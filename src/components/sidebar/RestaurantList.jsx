import { LuMapPin, LuStar } from "react-icons/lu";

const RestaurantList = ({ restaurants, keyword, loading, onRestaurantClick }) => {
    return (
        <div className="flex-1 overflow-y-auto">
            {!loading && restaurants.length > 0 ? (
                <div className="divide-y divide-gray-200">
                    {restaurants.map((restaurant) => (
                        <div key={restaurant.id} className="p-4 hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => onRestaurantClick(restaurant)}>
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-semibold text-gray-800 text-sm">{restaurant.bplcNm}</h3>
                                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">{restaurant.uptaeGbnNm}</span>
                            </div>

                            <p className="text-xs text-gray-600 mb-2 flex items-center gap-1">
                                <LuMapPin size={14} />
                                {restaurant.rdnWhlAddr}
                            </p>
                        </div>
                    ))}
                </div>
            ) : keyword && !loading ? (
                <div className="p-6 text-center text-gray-500">
                    <p>음식점이 없습니다.</p>
                </div>
            ) : !keyword && !loading ? (
                <div className="p-6 text-center text-gray-500">
                    <p>주소를 입력하고 검색해주세요.</p>
                </div>
            ) : loading ? (
                <div className="p-6 text-center text-gray-500">
                    <p>검색 중입니다...</p>
                </div>
            ) : null}
        </div>
    );
};

export default RestaurantList;
