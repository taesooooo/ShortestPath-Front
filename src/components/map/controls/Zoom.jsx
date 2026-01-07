import { LuPlus } from "react-icons/lu";
import { LuMinus } from "react-icons/lu";

const Zoom = (props) => {
    const { zoomLevel, onZoomIn, onZoomOut } = props;

    return (
        <div className="flex flex-row items-center h-full">
            <div className="flex flex-rodw ml-3 mr-3">
                <div id="zoom-out" onClick={onZoomOut} className="rounded-md text-white bg-gray-200 hover:bg-gray-400 shadow-md">
                    <LuMinus className="w-6 h-6" />
                </div>
                <span className="ml-4 mr-4 text-black">{zoomLevel}</span>
                <div id="zoom-in" onClick={onZoomIn} className="rounded-md text-white bg-gray-200 hover:bg-gray-400 shadow-md">
                    <LuPlus className="w-6 h-6" />
                </div>
            </div>
        </div>
    );
};

export default Zoom;
