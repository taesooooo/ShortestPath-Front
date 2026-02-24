import { useState } from "react";
import MainMap from "./components/map/MainMap";
import Sidebar from "./components/Sidebar";
import { LuArrowRightFromLine } from "react-icons/lu";

function App() {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    return (
        <div className="flex h-screen w-screen">
            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${sidebarOpen ? "w-80" : "w-0"}`}>
                <Sidebar onClose={() => setSidebarOpen(false)} />
            </div>

            <div className="flex-1 relative">
                {!sidebarOpen && (
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-blue-500 hover:bg-blue-600 text-white rounded-r-lg p-2 z-10 transition-all duration-300"
                        title="사이드바 열기"
                    >
                        <LuArrowRightFromLine size={26} />
                    </button>
                )}

                <MainMap />
            </div>
        </div>
    );
}

export default App;
