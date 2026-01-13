import ContextItem from "./ContextItem";

const ContextMenu = ({ menuConfig, onClick, item }) => {
    if (menuConfig.isVisible === false) {
        return null;
    }
    return (
        <div className="z-10 absolute min-w-36 flex flex-col bg-white rounded-md shadow-lg" style={{ top: menuConfig.y, left: menuConfig.x }}>
            {item.map((menuItem, index) => (
                <ContextItem key={index} onClick={onClick} {...menuItem} />
            ))}
        </div>
    );
};

export default ContextMenu;
