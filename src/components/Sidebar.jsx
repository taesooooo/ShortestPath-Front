import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { searchRestaurants, setSearchAddress } from "../store/restaurantSearchSlice";
import SidebarHeader from "./sidebar/SidebarHeader";
import SidebarSearchArea from "./sidebar/SidebarSearchArea";
import RestaurantList from "./sidebar/RestaurantList";

const Sidebar = ({ onClose }) => {
    const dispatch = useDispatch();
    const [inputAddress, setInputAddress] = useState("");

    const { searchAddress, restaurants, loading } = useSelector((state) => state.restaurant);

    const handleSearch = () => {
        if (inputAddress.trim()) {
            dispatch(setSearchAddress(inputAddress));
            dispatch(searchRestaurants(inputAddress));
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };

    return (
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
            <SidebarHeader onClose={onClose} />

            <SidebarSearchArea inputAddress={inputAddress} onInputChange={(e) => setInputAddress(e.target.value)} onSearch={handleSearch} onKeyPress={handleKeyPress} loading={loading} />

            {searchAddress && (
                <div className="px-6 py-3 bg-blue-50 border-b border-gray-200">
                    <p className="text-sm text-gray-600">
                        검색 위치: <span className="font-semibold text-gray-800">{searchAddress}</span>
                    </p>
                </div>
            )}

            <RestaurantList restaurants={restaurants} searchAddress={searchAddress} loading={loading} />
        </div>
    );
};

export default Sidebar;
