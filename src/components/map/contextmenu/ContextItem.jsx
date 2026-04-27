const ContextItem = ({ icon: Icon, name, action, onClick }) => {
    return (
        <div
            className="flex items-center justify-center h-9 text-gray-800 hover:bg-gray-300 hover:rounded-md px-2"
            onClick={() => {
                onClick();
                action();
            }}
        >
            {Icon && <Icon className="mx-2" />}
            <span>{name}</span>
        </div>
    );
};

export default ContextItem;
