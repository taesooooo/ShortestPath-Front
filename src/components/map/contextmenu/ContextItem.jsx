const ContextItem = ({ icon: Icon, name, onClick }) => {
    return (
        <div className="flex items-center justify-center h-9 text-gray-800 hover:bg-gray-300 hover:rounded-md px-2">
            {Icon && <Icon className="mx-2" />}
            <div onClick={onClick}>{name}</div>
        </div>
    );
};

export default ContextItem;
