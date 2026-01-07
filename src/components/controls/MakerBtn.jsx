const MakerBtn = ({ icon: Icon, label, color = "", onClick, className = "" }) => (
    <button type="button" onClick={onClick} className={`flex items-center gap-1 px-2 py-1 ${color} hover:rounded-lg hover:bg-gray-300 ${className}`}>
        {Icon && <Icon className="w-6 h-6 block" />}
        {label && <span className="leading-none">{label}</span>}
    </button>
);

export default MakerBtn;
