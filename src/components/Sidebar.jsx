import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { searchRestaurantsByCategory, selectRestaurant, searchRestaurants, updateCategory, updateKeyword } from "../store/restaurantSearchSlice";
import SidebarHeader from "./sidebar/SidebarHeader";
import SidebarSearchArea from "./sidebar/SidebarSearchArea";
import RestaurantList from "./sidebar/RestaurantList";
import Pagination from "./Pagination";

const Sidebar = ({ sidebarOpen, onClose }) => {
    const dispatch = useDispatch();
    const [keyword, setKeyword] = useState("");
    const [category, setCategory] = useState("");

    const { pageInfo, restaurants } = useSelector((state) => state.restaurant);
    const loading = useSelector((state) => {
        const restaurantState = state.restaurant;
        return restaurantState.loading[searchRestaurants.typePrefix] || restaurantState.loading[searchRestaurantsByCategory.typePrefix];
    });

    const handleRestaurantClick = (restaurant) => {
        dispatch(selectRestaurant(restaurant));
    };

    const handleSearch = () => {
        dispatch(updateKeyword(keyword));
        if (keyword.length == 0 && category.length > 0) {
            dispatch(
                searchRestaurantsByCategory({
                    page: 1,
                    size: 10,
                    category: category,
                }),
            );
        } else {
            dispatch(
                searchRestaurants({
                    page: 1,
                    size: 10,
                    keyword,
                    category,
                }),
            );
        }
        // dispatch(searchRestaurantsByKeyword({ page: 1, size: 10, keyword, category }));
    };

    const handleKeywordChange = (value) => {
        console.log(value);
        setKeyword(value);

        dispatch(updateKeyword(value));
    };

    const handleCategoryChange = (category) => {
        setCategory(category);

        dispatch(updateCategory(category));
        dispatch(searchRestaurantsByCategory({ page: 1, size: 10, category }));
        setKeyword("");
        dispatch(updateKeyword(""));
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };

    const handlePageChange = (newPage) => {
        if (keyword.length == 0 && category.length > 0) {
            dispatch(
                searchRestaurantsByCategory({
                    page: newPage,
                    size: 10,
                    category: category,
                }),
            );
        } else {
            dispatch(
                searchRestaurants({
                    page: newPage,
                    size: 10,
                    keyword,
                    category,
                }),
            );
        }
    };

    return (
        <div className={`absolute left-0 z-20 transition-all duration-300 ease-in-out overflow-hidden ${sidebarOpen ? "w-80 h-full" : "w-0"}`}>
            <div className="relative w-80 bg-white border-r border-gray-200 flex flex-col h-full">
                <SidebarHeader onClose={onClose} />

                <SidebarSearchArea keyword={keyword} onkeywordChange={handleKeywordChange} onSearch={handleSearch} onKeyPress={handleKeyPress} onCategoryChange={handleCategoryChange} loading={loading} />

                {keyword && (
                    <div className="px-6 py-3 bg-blue-50 border-b border-gray-200">
                        <p className="text-sm text-gray-600">
                            검색어: <span className="font-semibold text-gray-800">{keyword}</span>
                        </p>
                    </div>
                )}

                <RestaurantList restaurants={restaurants} keyword={keyword} loading={loading} onRestaurantClick={handleRestaurantClick} />
                {restaurants.length > 0 && <Pagination currentPage={pageInfo.currentPage} totalPages={pageInfo.totalPages} onPageChange={handlePageChange} />}
            </div>
        </div>
    );
};

export default Sidebar;
