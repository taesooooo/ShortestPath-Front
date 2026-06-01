import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { LuArrowLeftFromLine } from "react-icons/lu";
import RouteInfoPanel from "./sidebar/RouteInfoPanel";

const RouteSidebar = () => {
    const [isOpen, setOpen] = useState(false);
    const selectedRoute = useSelector((state) => state.route.selectedRoute);

    useEffect(() => {
        if (selectedRoute) {
            queueMicrotask(() => setOpen(true));
        }
    }, [selectedRoute]);

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <>
            <aside className={`absolute right-0 z-20 h-full overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "w-80" : "w-0"}`}>
                <div className="relative h-full w-80 border-l border-gray-200 bg-white shadow-lg">
                    <RouteInfoPanel route={selectedRoute} onClear={handleClose} />
                </div>
            </aside>

            {!isOpen && (
                <div className="absolute right-0 top-1/2 z-10 -translate-y-1/2 transform">
                    <button onClick={() => setOpen(true)} className="rounded-l-lg bg-blue-500 p-2 text-white transition-all duration-300 hover:bg-blue-600" title="루트 정보 열기">
                        <LuArrowLeftFromLine size={26} />
                    </button>
                </div>
            )}
        </>
    );
};

export default RouteSidebar;
