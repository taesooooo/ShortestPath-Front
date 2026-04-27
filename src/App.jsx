import { useState } from "react";
import MainMap from "./components/MainMap";
import Sidebar from "./components/Sidebar";
import { LuArrowRightFromLine } from "react-icons/lu";
import FoodOverlay from "./components/map/FoodOverlay";

function App() {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    return (
        <>
            <Sidebar sidebarOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="z-10 absolute left-0 top-1/2 transform -translate-y-1/2">
                {!sidebarOpen && (
                    <button onClick={() => setSidebarOpen(true)} className=" bg-blue-500 hover:bg-blue-600 text-white rounded-r-lg p-2 z-10 transition-all duration-300" title="사이드바 열기">
                        <LuArrowRightFromLine size={26} />
                    </button>
                )}
            </div>

            <MainMap />
        </>
    );
}

export default App;
